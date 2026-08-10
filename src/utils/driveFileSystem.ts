import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { getOfflineFilesState, VirtualFilesState } from './localFileSystem';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// --- Drive API Utils ---

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const ROOT_FOLDER_NAME = 'archweb operating system';

async function fetchDrive(url: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');
  
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`
  };
  
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`Drive API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function findFolder(name: string, parentId?: string): Promise<string | null> {
  let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  
  const data = await fetchDrive(`${DRIVE_API_URL}?q=${encodeURIComponent(query)}&fields=files(id,name)`);
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

async function createFolder(name: string, parentId?: string): Promise<string> {
  const body: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    body.parents = [parentId];
  }
  
  const data = await fetchDrive(DRIVE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return data.id;
}

async function getRootFolderId(): Promise<string> {
  let id = await findFolder(ROOT_FOLDER_NAME);
  if (!id) {
    id = await createFolder(ROOT_FOLDER_NAME);
  }
  return id;
}

export async function uploadFileToDrive(fileName: string, content: string, parentFolderId: string): Promise<string> {
  let mimeType = 'text/plain';
  let bodyContent: string | Blob = content;
  let isBase64 = false;

  if (content.startsWith('data:')) {
    const arr = content.split(',');
    const match = arr[0].match(/:(.*?);/);
    if (match) {
      mimeType = match[1];
    }
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    bodyContent = new Blob([u8arr], { type: mimeType });
    isBase64 = true;
  }

  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const metadata = {
    name: fileName,
    parents: [parentFolderId]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', bodyContent);

  const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Upload Error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.id;
}

export async function syncToDrive(): Promise<void> {
  const rootId = await getRootFolderId();
  const state = getOfflineFilesState();
  
  // A mapping of virtual path to Drive Folder ID
  const folderIdMap: Record<string, string> = {
    '/': rootId
  };

  // Helper to get or create folder
  const getOrCreateFolder = async (virtualPath: string): Promise<string> => {
    if (folderIdMap[virtualPath]) return folderIdMap[virtualPath];
    
    // virtualPath e.g. /home/user/Masaüstü
    const parts = virtualPath.split('/').filter(p => p);
    let currentId = rootId;
    let currentPath = '';

    for (const part of parts) {
      currentPath += '/' + part;
      if (folderIdMap[currentPath]) {
        currentId = folderIdMap[currentPath];
      } else {
        let nextId = await findFolder(part, currentId);
        if (!nextId) {
          nextId = await createFolder(part, currentId);
        }
        folderIdMap[currentPath] = nextId;
        currentId = nextId;
      }
    }
    return currentId;
  };

  // Ensure all directories exist and upload files
  const filePromises = [];
  
  for (const [dir, files] of Object.entries(state.allFiles)) {
    if (files.length === 0) continue;
    
    const parentId = await getOrCreateFolder(dir);
    
    for (const file of files) {
      // Check if file exists to avoid duplicates? Simple approach: just upload.
      // Or we can delete existing file and re-upload.
      // For simplicity, we just check if it exists in the parent folder
      const query = `name='${file.name}' and '${parentId}' in parents and trashed=false`;
      const searchRes = await fetchDrive(`${DRIVE_API_URL}?q=${encodeURIComponent(query)}&fields=files(id)`);
      if (searchRes.files && searchRes.files.length > 0) {
        // File exists, we can delete it first or skip
        for (const existingFile of searchRes.files) {
          await fetchDrive(`${DRIVE_API_URL}/${existingFile.id}`, { method: 'DELETE' });
        }
      }
      
      filePromises.push(uploadFileToDrive(file.name, file.content, parentId));
    }
  }

  await Promise.all(filePromises);
}

// Safe localStorage wrapper that handles exceptions in restricted environments (TV WebViews, incognito, iframe security policies)
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignored if storage is disabled
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignored
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch {
      // Ignored
    }
  }
};

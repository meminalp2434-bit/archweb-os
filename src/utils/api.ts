/**
 * Generates the correct API URL for server communication.
 * When running inside Google AI Studio, it connects to the user's local server at http://192.168.1.105:3000.
 * When running locally, it uses relative paths.
 */
export const getApiUrl = (endpoint: string): string => {
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.');

  if (!isLocalhost) {
    // Inside Google AI Studio - route requests to the local network server on port 3000
    return `http://localhost:3000${endpoint}`;
  }

  // Running locally - relative path
  return endpoint;
};

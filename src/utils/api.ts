/**
 * Generates the correct API URL for server communication.
 * When running inside Google AI Studio, it connects to the user's local server at http://192.168.1.105:3000.
 * When running locally, it uses relative paths.
 */
export const getApiUrl = (endpoint: string): string => {
  // Always use relative paths for full-stack Express + Vite apps
  return endpoint;
};

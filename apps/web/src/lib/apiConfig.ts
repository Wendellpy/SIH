/**
 * Resolves the backend API base URL dynamically.
 * Prioritizes:
 * 1. process.env.NEXT_PUBLIC_API_URL if configured
 * 2. In browser production (not localhost/127.0.0.1): 'https://sih-api-vyvn.onrender.com'
 * 3. Default fallback for local dev: 'http://localhost:4000'
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.')) {
      return 'https://sih-api-vyvn.onrender.com';
    }
  }
  return 'http://localhost:4000';
}

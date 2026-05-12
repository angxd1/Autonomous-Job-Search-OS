// Web app base URL the extension talks to. Falls back to localhost for dev.
export const API_BASE_URL: string = import.meta.env.VITE_APP_URL ?? 'http://localhost:3000';

export const SIGN_IN_URL = `${API_BASE_URL}/sign-in`;
export const DASHBOARD_URL = `${API_BASE_URL}/dashboard`;

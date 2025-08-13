import { getCurrentUserServer as getCurrentUserServerImpl } from './users';

// Server-side function to get current user (single source helper)
export async function getCurrentUserServer() {
  return getCurrentUserServerImpl();
} 
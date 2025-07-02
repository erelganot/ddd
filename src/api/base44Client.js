import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "684f15fe0903a7a8e07135a4", 
  requiresAuth: true // Ensure authentication is required for all operations
});

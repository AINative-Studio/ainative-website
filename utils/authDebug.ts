/**
 * Authentication Debug Utility
 *
 * Use this in the browser console to diagnose authentication issues:
 *
 * import { debugAuth } from '@/utils/authDebug';
 * debugAuth();
 */

export function debugAuth() {
  console.log("=".repeat(60));
  console.log("🔍 Authentication Debug Information");
  console.log("=".repeat(60));

  // Check localStorage
  console.log("\n1. LocalStorage Status:");
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  console.log(`   Access Token: ${accessToken ? `Present (${accessToken.substring(0, 20)}...)` : 'NOT FOUND'}`);
  console.log(`   Refresh Token: ${refreshToken ? `Present (${refreshToken.substring(0, 20)}...)` : 'NOT FOUND'}`);

  // Decode JWT if present
  if (accessToken) {
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("\n2. Token Payload:");
        console.log(`   User ID: ${payload.sub || 'N/A'}`);
        console.log(`   Email: ${payload.email || 'N/A'}`);
        console.log(`   Issued At: ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'}`);
        console.log(`   Expires At: ${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'}`);

        if (payload.exp) {
          const now = Date.now() / 1000;
          const isExpired = now > payload.exp;
          const timeLeft = isExpired ? 0 : Math.floor((payload.exp - now) / 60);
          console.log(`   Status: ${isExpired ? '❌ EXPIRED' : `✅ Valid (${timeLeft} minutes remaining)`}`);
        }
      }
    } catch (e) {
      console.log("\n2. Token Payload: ❌ Failed to decode (invalid format)");
    }
  }

  // Test API connection
  console.log("\n3. Testing API Connection...");

  fetch('https://api.ainative.studio/v1/public/api-keys/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
    .then(response => {
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   CORS Header: ${response.headers.get('Access-Control-Allow-Origin') || 'NOT PRESENT'}`);
      return response.json();
    })
    .then(data => {
      console.log(`   Response:`, data);
    })
    .catch(error => {
      console.log(`   ❌ Error:`, error.message);
    });

  console.log("\n" + "=".repeat(60));
}

// Make it available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  console.log("💡 Auth debug utility loaded. Run 'debugAuth()' in console to diagnose auth issues.");
}

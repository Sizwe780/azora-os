// Node script to simulate credential login via NextAuth
// Uses global fetch (Node 18+) and manual cookie handling

// ensure fetch is available (fallback to node-fetch if not)
let fetchFn = global.fetch;
if (!fetchFn) {
  // lazy load node-fetch
  fetchFn = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}

async function main() {
  const base = 'http://localhost:3000';

  // fetch CSRF token
  const csrfResp = await fetchFn(`${base}/api/auth/csrf`, {
    method: 'GET',
    credentials: 'include'
  });
  const csrfData = await csrfResp.json();
  const cookies = csrfResp.headers.get('set-cookie');
  console.log('csrf token', csrfData.csrfToken);
  console.log('cookies', cookies);

  const form = new URLSearchParams();
  form.append('csrfToken', csrfData.csrfToken);
  form.append('email', 'testuser@example.com');
  form.append('password', 'Test12345');
  form.append('callbackUrl', '/dashboard');

  const loginResp = await fetchFn(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies || ''
    },
    body: form.toString(),
    redirect: 'manual'
  });

  console.log('login status', loginResp.status);
  console.log('location header', loginResp.headers.get('location'));
  const text = await loginResp.text();
  console.log('login body:', text);
}

main().catch(e => { console.error(e); process.exit(1); });
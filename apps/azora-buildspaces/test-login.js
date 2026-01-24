// Using built-in fetch (Node 18+)

async function testLogin() {
    const baseUrl = 'http://localhost:3000';

    try {
        // 1. Get CSRF Token
        console.log('Fetching CSRF token...');
        const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.csrfToken;
        console.log('CSRF Token:', csrfToken);

        // 2. Perform Login
        console.log('Attempting login...');
        const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': csrfRes.headers.get('set-cookie') // Important for session
            },
            body: new URLSearchParams({
                email: 'admin@azora.world',
                password: 'Azora2026!',
                csrfToken: csrfToken,
                json: 'true'
            }).toString()
        });

        console.log('Login Status:', loginRes.status);
        const text = await loginRes.text();
        console.log('Login Response:', text);

        if (loginRes.ok) {
            console.log('LOGIN SUCCESSFUL');
        } else {
            console.log('LOGIN FAILED');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testLogin();

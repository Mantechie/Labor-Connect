import fetch from 'node-fetch';

async function testCors() {
  const origin = 'http://localhost:5173';

  // Preflight OPTIONS request
  console.log('Testing CORS preflight OPTIONS request to /api/auth');
  const optionsResponse = await fetch('http://localhost:8080/api/auth', {
    method: 'OPTIONS',
    headers: {
      'Origin': origin,
      'Access-Control-Request-Method': 'POST',
    },
  });
  console.log('OPTIONS response status:', optionsResponse.status);
  console.log('Access-Control-Allow-Origin:', optionsResponse.headers.get('access-control-allow-origin'));
  console.log('Access-Control-Allow-Credentials:', optionsResponse.headers.get('access-control-allow-credentials'));
  console.log('Access-Control-Allow-Methods:', optionsResponse.headers.get('access-control-allow-methods'));
  console.log('Access-Control-Allow-Headers:', optionsResponse.headers.get('access-control-allow-headers'));

  // Actual POST request to /api/auth/login
  console.log('\nTesting POST request to /api/auth/login');
  const postResponse = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Origin': origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
    credentials: 'include',
  });
  console.log('POST response status:', postResponse.status);
  const postData = await postResponse.text();
  console.log('POST response body:', postData);

  // GET request to /api/users
  console.log('\nTesting GET request to /api/users');
  const getResponse = await fetch('http://localhost:8080/api/users', {
    method: 'GET',
    headers: {
      'Origin': origin,
    },
    credentials: 'include',
  });
  console.log('GET response status:', getResponse.status);
  const getData = await getResponse.text();
  console.log('GET response body:', getData);
}

testCors().catch(err => {
  console.error('Error during CORS tests:', err);
});

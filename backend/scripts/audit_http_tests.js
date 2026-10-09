import fs from 'fs';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  const results = [];
  
  function log(name, passed, details = '') {
    results.push({ name, passed, details });
    console.log(`${passed ? '✅' : '❌'} ${name} ${details ? '- ' + details : ''}`);
  }

  try {
    // 1. Login exitoso
    let loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.admin@unach.mx', password: 'PlaceholderTestPassword#123' })
    });
    let loginData = await loginRes.json();
    let accessToken = loginData?.data?.accessToken;
    let refreshToken = loginData?.data?.refreshToken;
    let passCheck = !loginData.data?.user?.password && !loginData.data?.user?.password_hash;
    
    if (loginRes.ok && accessToken && refreshToken && passCheck) {
      log('Login exitoso (Admin)', true);
    } else {
      log('Login exitoso (Admin)', false, JSON.stringify(loginData));
    }

    // 2. Login incorrecto
    let badLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.admin@unach.mx', password: 'wrong' })
    });
    if (badLogin.status === 401) {
      log('Login incorrecto (401)', true);
    } else {
      log('Login incorrecto (401)', false, `Status: ${badLogin.status}`);
    }

    // 3. Obtener /api/auth/me
    let meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    let meData = await meRes.json();
    if (meRes.ok && meData?.data?.usuario?.email === 'test.admin@unach.mx' && !meData?.data?.usuario?.password_hash) {
      log('GET /api/auth/me', true);
    } else {
      log('GET /api/auth/me', false, JSON.stringify(meData));
    }

    // 4. Sin token 401
    let noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    if (noTokenRes.status === 401) {
      log('Acceso sin token devuelve 401', true);
    } else {
      log('Acceso sin token devuelve 401', false);
    }

    // 5. Refresh exitoso
    let refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    let refreshData = await refreshRes.json();
    let newAccessToken = refreshData?.data?.accessToken;
    let newRefreshToken = refreshData?.data?.refreshToken;
    
    if (refreshRes.ok && newAccessToken && newRefreshToken && newRefreshToken !== refreshToken) {
      log('Refresh token exitoso (Rotación activa)', true);
      accessToken = newAccessToken;
      refreshToken = newRefreshToken;
    } else {
      log('Refresh token exitoso', false, JSON.stringify(refreshData));
    }

    // 6. Refresh reutilizado (Debe fallar y revocar)
    let reuseRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginData.data.refreshToken }) // El viejo
    });
    if (reuseRes.status === 401 || reuseRes.status === 403) {
      log('Reutilización de refresh token detectada', true);
    } else {
      log('Reutilización de refresh token detectada', false, `Status: ${reuseRes.status}`);
    }

    // 7. Cambio de contraseña
    let changePassRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ currentPassword: 'PlaceholderTestPassword#123', newPassword: 'NewPassword#456' })
    });
    let changeData = await changePassRes.json();
    if (changePassRes.ok) {
      log('Cambio de contraseña', true);
      // Re-login para obtener nuevos tokens
      let newLogin = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test.admin@unach.mx', password: 'NewPassword#456' })
      });
      let newLoginData = await newLogin.json();
      accessToken = newLoginData.data.accessToken;
      refreshToken = newLoginData.data.refreshToken;
    } else {
      log('Cambio de contraseña', false, JSON.stringify(changeData));
    }

    // 8. Forgot password
    let forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.admin@unach.mx' })
    });
    let forgotData = await forgotRes.json();
    if (forgotRes.ok && !forgotData.token) { // Ensure token is not leaked
      log('Forgot password (No filtra token real)', true);
    } else {
      log('Forgot password', false, JSON.stringify(forgotData));
    }

    // Since we can't easily get the token without DB access, let's just log this part
    
    // 9. Logout
    let logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ refreshToken })
    });
    if (logoutRes.ok) {
      log('Logout exitoso', true);
    } else {
      log('Logout exitoso', false, `Status: ${logoutRes.status}`);
    }
    
    // 10. Check that token is invalidated
    let meAfterLogout = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    // This depends on whether tokens are purely stateless JWTs or if there is a blacklist/session validation.
    // If the API allows it, it means sessions might not be checked in `me`, or the token is just JWT.
    log('Acceso después de logout', meAfterLogout.status === 401 ? true : false, `Status: ${meAfterLogout.status}. Is it purely stateless?`);

  } catch (err) {
    console.error(err);
  }

  console.log('\\n--- Summary ---');
  let allPass = results.every(r => r.passed);
  console.log(`Todos los tests pasaron: ${allPass}`);
}

runTests();

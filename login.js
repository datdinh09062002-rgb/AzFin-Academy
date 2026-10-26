/**
 * login.js — Xử lý đăng nhập / đăng ký
 */
(function () {
  const alertBox = document.getElementById('alert');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabs = [...document.querySelectorAll('.tab')];

  /** Đọc giá trị input theo tên trong form (an toàn hơn id toàn cục). */
  const val = (form, name) => form.elements.namedItem(name).value;

  /** Chuyển giữa 2 tab; hash #dang-ky sẽ mở sẵn tab đăng ký. */
  function switchTab(name) {
    const isLogin = name === 'login';
    loginForm.classList.toggle('hidden', !isLogin);
    registerForm.classList.toggle('hidden', isLogin);
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
    showAlert(alertBox, '');
    if (history.replaceState) history.replaceState(null, '', isLogin ? location.pathname : '#dang-ky');
  }

  tabs.forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  document.querySelectorAll('[data-goto]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); switchTab(a.dataset.goto); })
  );

  /** Sau khi đăng nhập thành công thì về trang được yêu cầu (an toàn: chỉ nhận tên file). */
  function afterAuth() {
    const next = qsParam('next');
    const safe = next && /^[a-z0-9_-]+\.html(\?.*)?$/i.test(next) ? next : 'dashboard.html';
    location.replace(safe);
  }

  /* ---------- Đăng nhập ---------- */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    setBusy(btn, true, 'Đang đăng nhập…');
    showAlert(alertBox, '');
    try {
      await Auth.login(val(loginForm, 'email'), val(loginForm, 'password'));
      afterAuth();
    } catch (err) {
      showAlert(alertBox, err.message);
      setBusy(btn, false);
    }
  });

  /* ---------- Đăng ký ---------- */
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button[type="submit"]');
    showAlert(alertBox, '');

    if (val(registerForm, 'password') !== val(registerForm, 'confirm')) {
      showAlert(alertBox, 'Mật khẩu nhập lại không khớp.');
      registerForm.elements.namedItem('confirm').focus();
      return;
    }

    setBusy(btn, true, 'Đang tạo tài khoản…');
    try {
      await Auth.register(val(registerForm, 'name'), val(registerForm, 'email'), val(registerForm, 'password'));
      location.replace('dashboard.html');
    } catch (err) {
      showAlert(alertBox, err.message);
      setBusy(btn, false);
    }
  });

  /* ---------- Khởi tạo ---------- */
  (async function init() {
    const user = await Auth.me();
    if (user) { location.replace('dashboard.html'); return; } // đã đăng nhập rồi
    bootPublic('login');
    switchTab(location.hash === '#dang-ky' ? 'register' : 'login');
  })();
})();

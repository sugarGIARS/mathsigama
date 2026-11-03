/* auth.js · 登录页 / 注册页逻辑 */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    initPage(null);

    const isLogin = !!$('#login-form');
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect') || 'learn.html';

    if (isLogin) initLogin(); else initRegister();

    /* ---------------- 登录 ---------------- */
    function initLogin() {
      const form = $('#login-form');
      const name = $('#in-name'), pwd = $('#in-pwd');

      name.addEventListener('input', () => $('#f-name').classList.remove('invalid'));
      pwd.addEventListener('input', () => $('#f-pwd').classList.remove('invalid'));

      form.addEventListener('submit', e => {
        e.preventDefault();
        let ok = true;
        if (!name.value.trim()) { $('#f-name').classList.add('invalid'); ok = false; }
        if (pwd.value.length < 6) {
          $('#f-pwd').classList.add('invalid');
          $('#f-pwd .err').textContent = pwd.value.length ? '密码至少 6 位' : '请输入密码';
          ok = false;
        }
        if (!ok) { toast('请检查表单填写', 'error'); return; }

        const btn = $('#btn-login');
        btn.disabled = true; btn.textContent = '登录中…';
        showLoader('正在验证账号…');
        setTimeout(() => {
          const r = Store.Account.login(name.value.trim(), pwd.value);
          hideLoader();
          btn.disabled = false; btn.textContent = '登 录';
          if (!r.ok) { toast(r.msg, 'error'); return; }
          Store.Prefs.set('remember', $('#in-remember').checked);
          toast('登录成功，欢迎回来 ' + (r.user.nickname || r.user.username), 'success');
          setTimeout(() => { location.href = safeRedirect(redirect); }, 700);
        }, 600);
      });

      $('#btn-demo').addEventListener('click', () => {
        showLoader('正在创建体验账号…');
        setTimeout(() => {
          let u = Store.Account.find('demo');
          if (!u) u = Store.Account.register({ username: 'demo', pwd: '123456', grade: 'g1', version: '人教版', nickname: '体验同学' });
          else Store.Account.login('demo', '123456');
          hideLoader();
          toast('已登录体验账号（demo / 123456）', 'success');
          setTimeout(() => { location.href = safeRedirect(redirect); }, 600);
        }, 500);
      });
    }

    /* ---------------- 注册 ---------------- */
    function initRegister() {
      let grade = null;
      const gBox = $('#r-grades');
      gBox.innerHTML = GRADES.map(g => `<button type="button" class="grade-opt" data-g="${g.id}">${g.name}</button>`).join('');
      $$('.grade-opt', gBox).forEach(b => b.addEventListener('click', () => {
        $$('.grade-opt', gBox).forEach(x => x.classList.remove('on'));
        b.classList.add('on'); grade = b.dataset.g;
        $('#e-grade').style.display = 'none';
      }));

      const sel = $('#r-version');
      sel.innerHTML = VERSIONS.map(v => `<option value="${v}">${v}</option>`).join('');

      $('#r-eye').addEventListener('click', () => {
        const p = $('#r-pwd');
        p.type = p.type === 'password' ? 'text' : 'password';
        $('#r-eye').textContent = p.type === 'password' ? '显示' : '隐藏';
      });

      ['r-user', 'r-phone', 'r-pwd', 'r-pwd2'].forEach(id => {
        $('#' + id).addEventListener('input', () => $('#f-' + id.replace('r-', '')).classList.remove('invalid'));
      });

      $('#reg-form').addEventListener('submit', e => {
        e.preventDefault();
        const user = $('#r-user').value.trim();
        const phone = $('#r-phone').value.trim();
        const p1 = $('#r-pwd').value, p2 = $('#r-pwd2').value;
        let ok = true;

        if (user.length < 2 || user.length > 16) { $('#f-user').classList.add('invalid'); ok = false; }
        else if (Store.Account.exists(user)) {
          $('#f-user').classList.add('invalid');
          $('#f-user .err').textContent = '该用户名已被注册，换一个试试';
          ok = false;
        }
        if (phone && !/^1[3-9]\d{9}$/.test(phone)) { $('#f-phone').classList.add('invalid'); ok = false; }
        if (p1.length < 6) { $('#f-pwd').classList.add('invalid'); ok = false; }
        if (p2 !== p1) { $('#f-pwd2').classList.add('invalid'); ok = false; }
        if (!grade) { $('#e-grade').style.display = 'block'; ok = false; }
        if (!$('#r-agree').checked) { toast('请先勾选同意说明', 'warn'); ok = false; }

        if (!ok) { toast('请检查表单填写', 'error'); return; }

        showLoader('正在创建学习档案…');
        setTimeout(() => {
          Store.Account.register({
            username: user, phone: phone, pwd: p1,
            grade: grade, version: sel.value, nickname: user
          });
          hideLoader();
          toast('注册成功！已为你切换到' + gradeName(grade) + '课程', 'success');
          setTimeout(() => { location.href = 'learn.html'; }, 800);
        }, 700);
      });
    }

    function safeRedirect(r) {
      const allow = ['index.html', 'learn.html', 'practice.html', 'ai.html', 'profile.html'];
      return allow.indexOf(r) >= 0 ? r : 'learn.html';
    }
  });
})();

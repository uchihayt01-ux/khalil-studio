/* =========================================================================
   Khalil Studio — portfolio + ordering system
   Sections: 1) Config  2) Helpers  3) Nav  4) Reveal  5) Silk background
             6) Portfolio filter  7) Order wizard  8) Orders + dashboard
             9) Email submit  10) Confetti
   ========================================================================= */

/* ---------- 1) CONFIG ---------------------------------------------------- */
const CONFIG = {
  adminEmail: 'khalilmhamdi4work@gmail.com',
  // To send real emails, create a free EmailJS account (https://emailjs.com),
  // then fill these in. If left blank, the form falls back to opening the
  // user's mail client (mailto) with the order pre-filled — so it works either way.
  emailjs: {
    publicKey: '',     // e.g. 'AbCd1234...'
    serviceId: '',     // e.g. 'service_xxx'
    templateId: '',    // e.g. 'template_xxx'
  },
};

/* ---------- 2) HELPERS --------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmtMoney = (n) => '$' + Number(n).toLocaleString('en-US');
const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const toastEl = $('#toast');
let toastTimer;
function toast(msg, variant = '') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = 'toast is-show' + (variant ? ' toast--' + variant : '');
  toastEl.hidden = false;
  toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 3200);
}

$('#year').textContent = new Date().getFullYear();

/* ---------- 2b) AUTH (client accounts) ----------------------------------
   NOTE: This is a front-end-only demo store (localStorage). Passwords are
   SHA-256 hashed so they aren't kept in plain text, but real authentication
   needs a server. Don't treat this as production-secure.
   ----------------------------------------------------------------------- */
const USERS_KEY = 'km_users';
const SESSION_KEY = 'km_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }

async function hashPassword(pw) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback hash if SubtleCrypto is unavailable (e.g. non-secure context).
    let h = 0; for (let i = 0; i < pw.length; i++) { h = (h << 5) - h + pw.charCodeAt(i); h |= 0; }
    return 'fb' + (h >>> 0).toString(16);
  }
}

function currentUser() {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return getUsers().find((u) => u.email === email) || null;
}
function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

async function signup({ name, email, password }) {
  email = email.toLowerCase();
  const users = getUsers();
  if (users.some((u) => u.email === email)) throw new Error('An account with this email already exists.');
  const user = { name: name.trim(), email, pass: await hashPassword(password), createdAt: Date.now() };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, email);
  return user;
}
async function login({ email, password }) {
  email = email.toLowerCase();
  const user = getUsers().find((u) => u.email === email);
  if (!user || user.pass !== (await hashPassword(password))) throw new Error('Wrong email or password.');
  localStorage.setItem(SESSION_KEY, email);
  return user;
}
function logout() { localStorage.removeItem(SESSION_KEY); }

/* ---------- 3) NAV ------------------------------------------------------- */
const nav = $('#nav');
const navToggle = $('#nav-toggle');
const navLinks = $('#nav-links');

const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});
$$('a', navLinks).forEach((a) =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  })
);

/* ---------- 4) REVEAL ON SCROLL ----------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
$$('.reveal').forEach((el) => revealObserver.observe(el));

// Trigger the hero's staggered entrance animation once the first paint is done.
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')));

/* ---------- 5) LIQUID-SILK BACKGROUND (WebGL, cursor-reactive) ----------
   A fullscreen fragment shader paints flowing, domain-warped "silk" that
   bends toward the cursor. Renders at reduced resolution (it's soft, so it
   looks identical) for performance. Falls back to the CSS orbs if WebGL or
   the shader is unavailable.
   ----------------------------------------------------------------------- */
(function silkGL() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
          || canvas.getContext('experimental-webgl');
  if (!gl) return; // keep the CSS-orb fallback

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  const FRAG = [
    'precision highp float;',
    'uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}',
    'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/u_res.xy;',
    '  float asp=u_res.x/u_res.y;',
    '  vec2 p=vec2(uv.x*asp,uv.y);',
    '  float t=u_time*0.05;',
    '  vec2 m=vec2(u_mouse.x*asp,u_mouse.y);',
    '  vec2 toM=m-p; float md=length(toM);',
    '  vec2 q=vec2(fbm(p*1.1+t), fbm(p*1.1+vec2(5.2,1.3)-t));',
    '  q+=0.30*toM*exp(-md*1.6);',                       // cursor bends the flow
    '  vec2 r=vec2(fbm(p*1.1+2.6*q+vec2(1.7,9.2)+0.15*t), fbm(p*1.1+2.6*q+vec2(8.3,2.8)-0.13*t));',
    '  float f=fbm(p*1.1+3.2*r);',
    '  float bands=sin((r.x*2.6+f*4.2+t*2.0)*3.14159);',
    '  float silk=pow(abs(bands),2.2);',
    '  float sheen=pow(max(0.0,bands),18.0);',           // tight glossy ribbon highlight
    '  vec3 base=vec3(0.012,0.008,0.035);',
    '  vec3 mid=mix(vec3(0.11,0.045,0.24),vec3(0.05,0.07,0.30),r.y);',
    '  vec3 hi=vec3(0.42,0.50,0.95);',
    '  vec3 col=base;',
    '  col=mix(col,mid,smoothstep(0.18,0.95,f));',
    '  col=mix(col,hi,silk*0.30);',
    '  col+=sheen*vec3(0.55,0.62,1.0)*0.55;',
    '  col+=vec3(0.18,0.05,0.12)*pow(silk,3.0)*0.35;',   // subtle warm chroma on edges
    '  col+=vec3(0.5,0.4,0.95)*smoothstep(0.5,0.0,md)*0.13;', // cursor glow
    '  float sideW=smoothstep(0.10,0.5,abs(uv.x-0.5));', // darker center (behind text), brighter sides
    '  col*=mix(0.42,1.0,sideW);',
    '  float vig=smoothstep(1.35,0.35,length(uv-0.5));',
    '  col*=mix(0.65,1.0,vig);',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  const SCALE = 0.6; // render below native res; the silk is soft so it stays crisp-looking
  function resize() {
    const w = Math.max(1, Math.floor(window.innerWidth * SCALE));
    const h = Math.max(1, Math.floor(window.innerHeight * SCALE));
    canvas.width = w; canvas.height = h;
    canvas.style.width = '100%'; canvas.style.height = '100%';
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  // Cursor target (0..1, y up) with easing for a smooth, alive feel.
  let mx = 0.5, my = 0.55, tmx = 0.5, tmy = 0.55;
  window.addEventListener('mousemove', (e) => {
    tmx = e.clientX / window.innerWidth;
    tmy = 1 - e.clientY / window.innerHeight;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) { tmx = e.touches[0].clientX / window.innerWidth; tmy = 1 - e.touches[0].clientY / window.innerHeight; }
  }, { passive: true });

  // WebGL on the bg canvas succeeded — reveal it (covers the CSS-orb fallback).
  canvas.style.display = 'block';

  let start = null;
  function frame(ts) {
    if (start === null) start = ts;
    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uTime, (ts - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  if (reduce) {
    // One static frame for reduced-motion users.
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uTime, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else {
    requestAnimationFrame(frame);
  }
})();

/* ---------- 6) PORTFOLIO FILTER ----------------------------------------- */
(function filters() {
  const filterBar = $('#filters');
  if (!filterBar) return;
  const cards = $$('#projects .card');

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    $$('.filter', filterBar).forEach((f) => f.classList.remove('is-active'));
    btn.classList.add('is-active');
    const cat = btn.dataset.filter;

    cards.forEach((card) => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.classList.add('is-filtering');
      setTimeout(() => {
        card.classList.toggle('is-hidden', !show);
        if (show) requestAnimationFrame(() => card.classList.remove('is-filtering'));
      }, 180);
    });
  });
})();

/* ---------- 7) ORDER WIZARD --------------------------------------------- */
const orderModal = $('#order-modal');
const accountModal = $('#account-modal');
const form = $('#order-form');
const steps = $$('#steps .step');
const panes = $$('.wstep');
const btnBack = $('#wiz-back');
const btnNext = $('#wiz-next');
const btnSubmit = $('#wiz-submit');
const successEl = $('#success');
let current = 1;
const TOTAL = 3;

/* --- modal open/close plumbing --- */
function openModal(modal) {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}
function closeModal(modal) {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  if (!orderModal.classList.contains('is-open') && !accountModal.classList.contains('is-open')) {
    document.body.classList.remove('no-scroll');
  }
}

function openOrder(preset) {
  // Ordering requires an account — prompt sign-up / log-in first.
  const user = currentUser();
  if (!user) {
    closeModal(orderModal);
    renderAccount();
    setAuthTab('signup');
    openModal(accountModal);
    toast('Create an account (or log in) to place an order.', 'warn');
    return;
  }
  resetWizard();
  // Fill the "ordering as" banner from the logged-in account.
  $('#order-as-avatar').textContent = initials(user.name);
  $('#order-as-name').textContent = user.name;
  $('#order-as-email').textContent = user.email;
  if (preset) {
    const map = { design: 'UI/UX Design', dev: 'Web Development', full: 'Full Package' };
    const radio = $$('input[name="service"]', form).find((r) => r.value === map[preset]);
    if (radio) radio.checked = true;
  }
  openModal(orderModal);
}

// Event delegation for all open/close triggers (works for dynamic + static).
document.addEventListener('click', (e) => {
  const openO = e.target.closest('[data-open-order]');
  const closeO = e.target.closest('[data-close-order]');
  const openA = e.target.closest('[data-open-account]');
  const closeA = e.target.closest('[data-close-account]');
  if (openO) { e.preventDefault(); openOrder(openO.dataset.preset); }
  if (closeO) { e.preventDefault(); closeModal(orderModal); }
  if (openA) { e.preventDefault(); renderAccount(); openModal(accountModal); }
  if (closeA) { e.preventDefault(); closeModal(accountModal); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (orderModal.classList.contains('is-open')) closeModal(orderModal);
    if (accountModal.classList.contains('is-open')) closeModal(accountModal);
  }
});

/* --- step navigation --- */
function showStep(n) {
  current = n;
  panes.forEach((p) => p.classList.toggle('is-active', +p.dataset.pane === n));
  steps.forEach((s) => {
    const sn = +s.dataset.step;
    s.classList.toggle('is-active', sn === n);
    s.classList.toggle('is-done', sn < n);
  });
  btnBack.hidden = n === 1;
  btnNext.hidden = n === TOTAL;
  btnSubmit.hidden = n !== TOTAL;
  const count = $('#wiz-count');
  if (count) count.textContent = `Step ${n} of ${TOTAL}`;
  if (n === TOTAL) buildSummary();
}

function clearError(name) {
  const msg = $(`[data-error="${name}"]`, form);
  if (msg) msg.textContent = '';
  const field = msg && msg.closest('.field');
  if (field) field.classList.remove('has-error');
}
function setError(name, text) {
  const msg = $(`[data-error="${name}"]`, form);
  if (msg) msg.textContent = text;
  const field = msg && msg.closest('.field');
  if (field) field.classList.add('has-error');
}

function validateStep(n) {
  if (n === 1) {
    if (!form.service.value) { setError('service', 'Please choose a service to continue.'); return false; }
    clearError('service');
    return true;
  }
  if (n === 2) {
    let ok = true;
    if (form.brief.value.trim().length < 10) { setError('brief', 'Tell me a bit more (10+ characters).'); ok = false; } else clearError('brief');
    return ok;
  }
  return true;
}

btnNext.addEventListener('click', () => {
  if (validateStep(current)) showStep(Math.min(current + 1, TOTAL));
});
btnBack.addEventListener('click', () => showStep(Math.max(current - 1, 1)));

// Live: clear service error on pick.
$$('input[name="service"]', form).forEach((r) => r.addEventListener('change', () => clearError('service')));

function buildSummary() {
  const dl = $('#summary');
  const user = currentUser() || { name: '—', email: '—' };
  const rows = [
    ['Service', form.service.value || '—'],
    ['Name', user.name],
    ['Email', user.email],
    ['Timeline', form.timeline.value || '—'],
    ['Brief', form.brief.value.trim() || '—'],
  ];
  dl.innerHTML = rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`)
    .join('');
}

function resetWizard() {
  form.reset();
  ['service', 'brief', 'consent'].forEach(clearError);
  successEl.hidden = true;
  form.hidden = false;
  $('.wizard').hidden = false;
  showStep(1);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* ---------- 8) ORDERS, ACCOUNT VIEW & DASHBOARD ------------------------- */
const STORE_KEY = 'km_orders';
const STATUSES = [
  { key: 'new', label: 'Reviewing Brief', cls: 'badge--review' },
  { key: 'progress', label: 'In Progress', cls: 'badge--progress' },
  { key: 'done', label: 'Completed', cls: 'badge--done' },
];

function loadOrders() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function saveOrders(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
  updateAvatar();
}
function addOrder(order) {
  const list = loadOrders();
  list.unshift(order);
  saveOrders(list);
}
// Only the signed-in client's own orders.
function myOrders() {
  const user = currentUser();
  if (!user) return [];
  return loadOrders().filter((o) => o.userEmail === user.email);
}

// Nav avatar reflects login state: initials + personal order count.
function updateAvatar() {
  const avatar = $('#nav-avatar');
  const user = currentUser();
  avatar.textContent = user ? initials(user.name) : '👤';
  avatar.classList.toggle('is-guest', !user);
  const count = user ? myOrders().length : 0;
  if (count > 0) avatar.setAttribute('data-count', count);
  else avatar.removeAttribute('data-count');
}

function statusBadge(key) {
  const s = STATUSES.find((x) => x.key === key) || STATUSES[0];
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

// Switch the account modal between auth (logged out) and dashboard (logged in).
function renderAccount() {
  const user = currentUser();
  $('#auth-view').hidden = !!user;
  $('#dash-view').hidden = !user;
  if (user) renderDashboard();
  else setAuthTab('login');
}

function setAuthTab(tab) {
  $$('.auth__tab').forEach((b) => b.classList.toggle('is-active', b.dataset.authTab === tab));
  $('#login-form').hidden = tab !== 'login';
  $('#signup-form').hidden = tab !== 'signup';
}

function renderDashboard() {
  const user = currentUser();
  if (!user) return;
  const list = myOrders();
  const body = $('#orders-body');
  const empty = $('#dash-empty');
  const table = $('#orders-table');

  $('#dash-avatar').textContent = initials(user.name);
  $('#dash-name').textContent = `Hi, ${user.name.split(' ')[0]}`;

  const active = list.filter((o) => o.status !== 'done').length;
  const done = list.filter((o) => o.status === 'done').length;
  $('#dash-stats').innerHTML = `
    <div class="dash__stat"><b>${list.length}</b><span>Total orders</span></div>
    <div class="dash__stat"><b>${active}</b><span>Active</span></div>
    <div class="dash__stat"><b>${done}</b><span>Completed</span></div>`;

  $('#dash-sub').textContent = list.length
    ? `${user.email} · ${active} active · ${done} completed`
    : `${user.email} · no orders yet`;

  if (!list.length) {
    table.hidden = true;
    empty.hidden = false;
    body.innerHTML = '';
    return;
  }
  table.hidden = false;
  empty.hidden = true;
  body.innerHTML = list
    .map(
      (o) => `
      <tr>
        <td><span class="o-id">${o.id}</span><span class="o-brief">${escapeHtml(o.brief)}</span></td>
        <td>${escapeHtml(o.service)}</td>
        <td>${escapeHtml(o.timeline || '—')}</td>
        <td>${fmtDate(o.date)}</td>
        <td>${statusBadge(o.status)}</td>
      </tr>`
    )
    .join('');
}

/* --- auth UI wiring --- */
$$('[data-auth-tab]').forEach((b) => b.addEventListener('click', () => setAuthTab(b.dataset.authTab)));

// Show/hide password toggles.
$$('[data-pass-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? '🙈' : '👁';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
});

function authError(name, text) { const el = $(`[data-error="${name}"]`); if (el) el.textContent = text || ''; }

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  authError('li-email'); authError('li-pass');
  const f = e.target;
  try {
    await login({ email: f.email.value.trim(), password: f.password.value });
    f.reset();
    renderAccount();
    updateAvatar();
    toast('Welcome back ✓');
  } catch (err) {
    authError('li-pass', err.message);
  }
});

$('#signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  ['su-name', 'su-email', 'su-pass', 'su-pass2'].forEach((n) => authError(n));
  const f = e.target;
  const name = f.name.value.trim(), email = f.email.value.trim();
  const pass = f.password.value, pass2 = f.password2.value;
  let ok = true;
  if (name.length < 2) { authError('su-name', 'Please enter your name.'); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { authError('su-email', 'Enter a valid email.'); ok = false; }
  if (pass.length < 6) { authError('su-pass', 'At least 6 characters.'); ok = false; }
  if (pass !== pass2) { authError('su-pass2', 'Passwords don’t match.'); ok = false; }
  if (!ok) return;
  try {
    await signup({ name, email, password: pass });
    f.reset();
    renderAccount();
    updateAvatar();
    toast('Account created ✓ You can place an order now.');
  } catch (err) {
    authError('su-email', err.message);
  }
});

$('#logout-btn').addEventListener('click', () => {
  logout();
  updateAvatar();
  renderAccount();
  toast('Logged out.');
});

updateAvatar();

/* ---------- 9) EMAIL SUBMIT --------------------------------------------- */
const ejs = CONFIG.emailjs;
const emailjsReady = !!(window.emailjs && ejs.publicKey && ejs.serviceId && ejs.templateId);
if (emailjsReady) {
  try { window.emailjs.init({ publicKey: ejs.publicKey }); } catch (_) {}
}

function buildPayload() {
  const user = currentUser() || { name: '', email: '' };
  return {
    order_id: 'KM-' + Date.now().toString(36).toUpperCase().slice(-6),
    service: form.service.value,
    name: user.name,
    email: user.email,
    timeline: form.timeline.value,
    brief: form.brief.value.trim(),
    to_email: CONFIG.adminEmail,
    date: new Date().toLocaleString(),
  };
}

function mailtoFallback(p) {
  const subject = encodeURIComponent(`New order ${p.order_id} — ${p.service}`);
  const bodyText = encodeURIComponent(
    `New project order\n\n` +
    `Order ID: ${p.order_id}\nService: ${p.service}\nName: ${p.name}\n` +
    `Email: ${p.email}\nTimeline: ${p.timeline}\nDate: ${p.date}\n\nBrief:\n${p.brief}\n`
  );
  // Anchor click opens the mail client without unloading the page.
  const a = document.createElement('a');
  a.href = `mailto:${CONFIG.adminEmail}?subject=${subject}&body=${bodyText}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function showSuccess(payload) {
  $('#success-name').textContent = payload.name.split(' ')[0] || 'there';
  $('.wizard').hidden = true;
  successEl.hidden = false;
  launchConfetti();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.consent.checked) { setError('consent', 'Please confirm to continue.'); return; }
  clearError('consent');

  const payload = buildPayload();

  // 1) Persist the order against the signed-in account.
  addOrder({
    id: payload.order_id,
    userEmail: payload.email,
    service: payload.service,
    name: payload.name,
    email: payload.email,
    timeline: payload.timeline,
    brief: payload.brief,
    date: Date.now(),
    status: 'new',
  });

  // 2) Show the success screen + confetti right away (UX is never blocked).
  showSuccess(payload);

  // 3) Then deliver the email — EmailJS if configured, otherwise mailto.
  try {
    if (emailjsReady) {
      await window.emailjs.send(ejs.serviceId, ejs.templateId, payload);
      toast('Order sent to Khalil ✓');
    } else {
      mailtoFallback(payload);
    }
  } catch (err) {
    console.error('Email send failed, using mailto fallback:', err);
    toast('Opening your mail app to send the order…', 'warn');
    mailtoFallback(payload);
  }
});

/* ---------- 10) CONFETTI ------------------------------------------------- */
function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  const rect = successEl.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const colors = ['#7c3aed', '#a855f7', '#d8b4fe', '#d946ef', '#c084fc', '#ffffff'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.38,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 7 + 4,
    color: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    life: 0,
  }));

  let frames = 0;
  (function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.vy += 0.35; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vr;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frames / 160);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();
    });
    frames++;
    if (frames < 160) requestAnimationFrame(run);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

/* ---------- DEMO: seed a sample client account on first visit -----------
   Lets you try the flow immediately — log in with  demo@client.com / demo1234
   to see existing orders and their statuses. New visitors can also sign up.
   ----------------------------------------------------------------------- */
(async function seed() {
  if (localStorage.getItem('km_seeded')) return;
  localStorage.setItem('km_seeded', '1');
  const email = 'demo@client.com';
  if (getUsers().some((u) => u.email === email)) return;
  const users = getUsers();
  users.push({ name: 'Demo Client', email, pass: await hashPassword('demo1234'), createdAt: Date.now() });
  saveUsers(users);

  const day = 86400000;
  const samples = [
    { id: 'KM-DEMO03', service: 'UI/UX Design',    timeline: '1–2 weeks', brief: 'Mobile app onboarding & design system.',           date: Date.now() - day * 1, status: 'new' },
    { id: 'KM-DEMO02', service: 'Web Development',  timeline: '2–4 weeks', brief: 'Landing page build with animations.',               date: Date.now() - day * 8, status: 'progress' },
    { id: 'KM-DEMO01', service: 'Full Package',     timeline: '1–2 months', brief: 'Marketing site + design system for a SaaS launch.', date: Date.now() - day * 24, status: 'done' },
  ];
  const list = loadOrders();
  samples.forEach((s) => list.push({ ...s, userEmail: email, name: 'Demo Client', email }));
  saveOrders(list);
})();

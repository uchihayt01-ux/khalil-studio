/* =========================================================================
   Khalil Studio — portfolio + ordering system
   Sections: 1) Config  2) Helpers  3) Nav  4) Reveal  5) Silk background
             6) Portfolio filter  7) Order wizard  8) Orders + dashboard
             9) Email submit  10) Confetti
   ========================================================================= */

/* ---------- 1) CONFIG ---------------------------------------------------- */
const CONFIG = {
  adminEmail: 'khalilmhamdi4work@gmail.com',
  // Transactional emails to the CLIENT (order confirmation + login alert).
  // Create a free EmailJS account (https://emailjs.com), add a service and two
  // templates, then fill these in. If blank, these emails are simply skipped.
  emailjs: {
    publicKey: '',     // e.g. 'AbCd1234...'
    serviceId: '',     // e.g. 'service_xxx'
    templates: {
      order: '',       // template id for the "order received" email
      login: '',       // template id for the "new sign-in" email
      status: '',      // template id for the "order status updated" email
    },
  },
};

/* ---------- 1b) SUPABASE (real accounts + orders) ----------------------- */
const SUPABASE_URL = 'https://qzfgpxzsvwpasqsyrzwj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OvY3D2mqubkPE_uF_c_2XQ_R2fyHA8n';
const ADMIN_EMAIL = CONFIG.adminEmail; // this email sees the admin dashboard
const sb = (window.supabase && SUPABASE_URL.startsWith('http'))
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

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

/* ---------- 2b) AUTH via Supabase (real accounts) ----------------------- */
const state = { user: null, myCount: 0 }; // user = { id, name, email }

function currentUser() { return state.user; }
function isAdmin() { return !!state.user && state.user.email === ADMIN_EMAIL; }
function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
function sessionToUser(session) {
  if (!session || !session.user) return null;
  const u = session.user;
  const m = u.user_metadata || {};
  const name = m.name || m.full_name || (u.email || '').split('@')[0];
  return { id: u.id, email: u.email, name };
}

async function signup({ name, email, password }) {
  if (!sb) throw new Error('Service unavailable. Please try again later.');
  const { data, error } = await sb.auth.signUp({
    email, password,
    // Send the confirmation link back to THIS site (not localhost).
    options: { data: { name }, emailRedirectTo: location.origin },
  });
  if (error) throw new Error(error.message);
  if (!data.session) {
    // Email-confirmation is enabled on the project.
    throw new Error('confirm');
  }
  state.user = sessionToUser(data.session);
  return state.user;
}
async function login({ email, password }) {
  if (!sb) throw new Error('Service unavailable. Please try again later.');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(t('err.wrong'));
  state.user = sessionToUser(data.session);
  return state.user;
}
async function logout() { if (sb) await sb.auth.signOut(); state.user = null; }

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
    '  col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;', // dither kills banding
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

  // Render at the device's real pixel density (so it's crisp on big / high-DPI
  // screens), but cap the total pixel count so weak GPUs stay smooth.
  const MAX_PX = 3000000; // ~1920×1560; above this we scale down gracefully
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth * dpr, h = window.innerHeight * dpr;
    const px = w * h;
    if (px > MAX_PX) { const s = Math.sqrt(MAX_PX / px); w *= s; h *= s; }
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
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
const confirmedModal = $('#confirmed-modal');
const form = $('#order-form');
const steps = $$('#steps .step');
const panes = $$('.wstep');
const btnBack = $('#wiz-back');
const btnNext = $('#wiz-next');
const btnSubmit = $('#wiz-submit');
const successEl = $('#success');
let current = 1;
const TOTAL = 3;

// Country codes for the phone field (Algeria first as default).
const COUNTRIES = [
  ['🇩🇿', '+213', 'Algeria'], ['🇫🇷', '+33', 'France'], ['🇲🇦', '+212', 'Morocco'],
  ['🇹🇳', '+216', 'Tunisia'], ['🇺🇸', '+1', 'USA / Canada'], ['🇬🇧', '+44', 'UK'],
  ['🇪🇸', '+34', 'Spain'], ['🇩🇪', '+49', 'Germany'], ['🇮🇹', '+39', 'Italy'],
  ['🇧🇪', '+32', 'Belgium'], ['🇳🇱', '+31', 'Netherlands'], ['🇨🇭', '+41', 'Switzerland'],
  ['🇸🇦', '+966', 'Saudi Arabia'], ['🇦🇪', '+971', 'UAE'], ['🇶🇦', '+974', 'Qatar'],
  ['🇪🇬', '+20', 'Egypt'], ['🇹🇷', '+90', 'Turkey'], ['🇱🇾', '+218', 'Libya'],
  ['🇲🇷', '+222', 'Mauritania'], ['🇸🇳', '+221', 'Senegal'], ['🇶🇦', '+974', 'Qatar'],
];
(function buildCountrySelect() {
  const sel = $('#o-cc');
  if (!sel) return;
  sel.innerHTML = COUNTRIES.map(([flag, dial, name]) =>
    `<option value="${dial}">${flag} ${dial}</option>`
  ).join('');
  sel.value = '+213';
})();

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
    toast(t('toast.needLogin'), 'warn');
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
  if (e.target.closest('[data-close-confirmed]')) { e.preventDefault(); closeModal(confirmedModal); }
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
  if (count) count.textContent = t('wiz.stepOf', { n: n, t: TOTAL });
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
    if (!form.service.value) { setError('service', t('err.service')); return false; }
    clearError('service');
    return true;
  }
  if (n === 2) {
    let ok = true;
    if (form.phone.value.replace(/\D/g, '').length < 6) { setError('phone', t('err.phone')); ok = false; } else clearError('phone');
    if (form.brief.value.trim().length < 10) { setError('brief', t('err.brief')); ok = false; } else clearError('brief');
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

// Full phone = country code + number.
function fullPhone() {
  const cc = form.cc ? form.cc.value : '';
  const num = form.phone.value.trim();
  return num ? `${cc} ${num}`.trim() : '';
}

function buildSummary() {
  const dl = $('#summary');
  const user = currentUser() || { name: '—', email: '—' };
  const tlOpt = form.timeline.selectedOptions[0];
  const rows = [
    [t('sum.service'), serviceLabel(form.service.value) || '—'],
    [t('sum.name'), user.name],
    [t('sum.email'), user.email],
    [t('sum.phone'), fullPhone() || '—'],
    [t('sum.timeline'), tlOpt ? tlOpt.textContent : (form.timeline.value || '—')],
    [t('sum.brief'), form.brief.value.trim() || '—'],
  ];
  dl.innerHTML = rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`)
    .join('');
}

function resetWizard() {
  form.reset();
  ['service', 'brief', 'phone', 'consent'].forEach(clearError);
  if (form.cc) form.cc.value = '+213';
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

/* ---------- 8) ORDERS, ACCOUNT VIEW, DASHBOARD & ADMIN ------------------ */
const STATUSES = [
  { key: 'new', label: 'Reviewing Brief', cls: 'badge--review' },
  { key: 'progress', label: 'In Progress', cls: 'badge--progress' },
  { key: 'done', label: 'Completed', cls: 'badge--done' },
];
function statusBadge(key) {
  const s = STATUSES.find((x) => x.key === key) || STATUSES[0];
  return `<span class="badge ${s.cls}">${t('st.' + s.key)}</span>`;
}
function shortId(id) { return (id || '').replace(/-/g, '').slice(0, 6).toUpperCase(); }
// Translate a stored (English) service value for display.
const SERVICE_KEY = { 'UI/UX Design': 'opt.design.t', 'Web Development': 'opt.dev.t', 'Full Package': 'opt.full.t', 'Customize': 'opt.custom.t' };
function serviceLabel(v) { return SERVICE_KEY[v] ? t(SERVICE_KEY[v]) : (v || '—'); }

/* --- Supabase data helpers --- */
async function addOrderDB(order) {
  const { data, error } = await sb.from('orders').insert(order).select().single();
  if (error) throw new Error(error.message);
  return data;
}
async function fetchOrders() {            // RLS returns own orders for clients, all for admin
  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
  if (error) { console.warn(error); return []; }
  return data || [];
}
async function fetchProfiles() {          // RLS allows the admin only
  const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { console.warn(error); return []; }
  return data || [];
}

// Nav avatar reflects login state: initials + personal order count.
function updateAvatar() {
  const avatar = $('#nav-avatar');
  const u = state.user;
  avatar.textContent = u ? (isAdmin() ? '★' : initials(u.name)) : '👤';
  avatar.classList.toggle('is-guest', !u);
  if (u && state.myCount > 0) avatar.setAttribute('data-count', state.myCount);
  else avatar.removeAttribute('data-count');
}

// Route the account modal: auth (logged out) / dashboard (client) / admin (owner).
async function renderAccount() {
  const u = state.user;
  const admin = isAdmin();
  $('#auth-view').hidden = !!u;
  $('#dash-view').hidden = !u || admin;
  $('#admin-view').hidden = !admin;
  if (admin) await renderAdmin();
  else if (u) await renderDashboard();
  else setAuthTab('login');
}

function setAuthTab(tab) {
  $$('.auth__tab').forEach((b) => b.classList.toggle('is-active', b.dataset.authTab === tab));
  $('#login-form').hidden = tab !== 'login';
  $('#signup-form').hidden = tab !== 'signup';
  $('#forgot-form').hidden = tab !== 'forgot';
  $('#reset-form').hidden = tab !== 'reset';
  // Hide the tab bar + Google button while resetting / recovering a password.
  const aux = (tab === 'forgot' || tab === 'reset');
  const tabs = $('.auth__tabs'); if (tabs) tabs.hidden = aux;
  const social = $('#auth-social'); if (social) social.hidden = aux;
}

async function renderDashboard() {
  const u = state.user; if (!u) return;
  const list = await fetchOrders();
  state.myCount = list.length; updateAvatar();
  const body = $('#orders-body'), empty = $('#dash-empty'), table = $('#orders-table');

  $('#dash-avatar').textContent = initials(u.name);
  $('#dash-name').textContent = t('dash.hi', { name: u.name.split(' ')[0] });

  const active = list.filter((o) => o.status !== 'done').length;
  const done = list.filter((o) => o.status === 'done').length;
  $('#dash-stats').innerHTML = `
    <div class="dash__stat"><b>${list.length}</b><span>${t('dash.total')}</span></div>
    <div class="dash__stat"><b>${active}</b><span>${t('dash.active')}</span></div>
    <div class="dash__stat"><b>${done}</b><span>${t('dash.completed')}</span></div>`;
  $('#dash-sub').textContent = list.length
    ? `${u.email} · ${active} ${t('dash.active')} · ${done} ${t('dash.completed')}`
    : `${u.email} · ${t('dash.noneYet')}`;

  if (!list.length) { table.hidden = true; empty.hidden = false; body.innerHTML = ''; return; }
  table.hidden = false; empty.hidden = true;
  body.innerHTML = list.map((o) => `
      <tr>
        <td><span class="o-id">#${shortId(o.id)}</span><span class="o-brief">${escapeHtml(o.brief || '')}</span></td>
        <td>${escapeHtml(serviceLabel(o.service))}</td>
        <td>${escapeHtml(o.timeline || '—')}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>${statusBadge(o.status)}</td>
      </tr>`).join('');
}

// Owner-only dashboard: every account + every order, with editable status.
async function renderAdmin() {
  const [orders, profiles] = await Promise.all([fetchOrders(), fetchProfiles()]);
  const active = orders.filter((o) => o.status !== 'done').length;
  const done = orders.filter((o) => o.status === 'done').length;
  $('#admin-stats').innerHTML = `
    <div class="dash__stat"><b>${profiles.length}</b><span>${t('admin.accounts')}</span></div>
    <div class="dash__stat"><b>${orders.length}</b><span>${t('admin.orders')}</span></div>
    <div class="dash__stat"><b>${active}</b><span>${t('dash.active')}</span></div>
    <div class="dash__stat"><b>${done}</b><span>${t('dash.completed')}</span></div>`;
  $('#admin-sub').textContent = `${profiles.length} ${t('admin.accounts')} · ${orders.length} ${t('admin.orders')}`;

  const oBody = $('#admin-orders-body');
  $('#admin-orders-empty').hidden = orders.length > 0;
  oBody.innerHTML = orders.map((o) => `
      <tr>
        <td><span class="o-id">${escapeHtml(o.name || '—')}</span><span class="o-brief">${escapeHtml(o.email || '')}</span><span class="o-brief">${escapeHtml(o.phone || '')}</span></td>
        <td>${escapeHtml(serviceLabel(o.service))}<span class="o-brief">${escapeHtml(o.brief || '')}</span></td>
        <td>${escapeHtml(o.timeline || '—')}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>
          <select class="status-select" data-id="${o.id}" data-email="${escapeHtml(o.email || '')}" data-name="${escapeHtml(o.name || '')}" data-service="${escapeHtml(o.service || '')}" data-oid="${shortId(o.id)}">
            ${STATUSES.map((s) => `<option value="${s.key}"${s.key === o.status ? ' selected' : ''}>${t('st.' + s.key)}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('');

  const uBody = $('#admin-users-body');
  $('#admin-users-empty').hidden = profiles.length > 0;
  uBody.innerHTML = profiles.map((p) => `
      <tr>
        <td><span class="o-id">${escapeHtml(p.name || '—')}</span></td>
        <td>${escapeHtml(p.email || '')}</td>
        <td>${fmtDate(p.created_at)}</td>
      </tr>`).join('');
}

// Admin changes an order's status → save to Supabase.
document.addEventListener('change', async (e) => {
  const sel = e.target.closest('.status-select');
  if (!sel || !sb) return;
  const { error } = await sb.from('orders').update({ status: sel.value }).eq('id', sel.dataset.id);
  if (error) { toast(t('toast.statusFail'), 'warn'); return; }
  toast(t('toast.statusUpdated'));
  // Notify the client by email about the new status (EmailJS, if configured).
  const st = STATUSES.find((s) => s.key === sel.value) || STATUSES[0];
  if (sel.dataset.email) {
    sendEmail(ejs.templates.status, {
      to_email: sel.dataset.email, to_name: sel.dataset.name, name: sel.dataset.name,
      order_id: sel.dataset.oid, service: sel.dataset.service,
      status: st.label, date: new Date().toLocaleString(), admin_email: CONFIG.adminEmail,
    });
  }
});

/* --- auth UI wiring --- */
$$('[data-auth-tab]').forEach((b) => b.addEventListener('click', () => setAuthTab(b.dataset.authTab)));

// Continue with Google (Supabase OAuth).
const googleBtn = $('#google-btn');
if (googleBtn) googleBtn.addEventListener('click', async () => {
  if (!sb) return;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin },
  });
  if (error) toast('Google sign-in unavailable. Enable it in Supabase first.', 'warn');
});

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
    await renderAccount();
    updateAvatar();
    toast(isAdmin() ? t('toast.welcomeAdmin') : t('toast.welcome'));
    if (!isAdmin() && state.user) {
      sendEmail(ejs.templates.login, {
        to_email: state.user.email, to_name: state.user.name,
        name: state.user.name, email: state.user.email,
        date: new Date().toLocaleString(),
      });
    }
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
  if (name.length < 2) { authError('su-name', t('err.name')); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { authError('su-email', t('err.emailValid')); ok = false; }
  if (pass.length < 6) { authError('su-pass', t('err.min6')); ok = false; }
  if (pass !== pass2) { authError('su-pass2', t('err.match')); ok = false; }
  if (!ok) return;
  try {
    await signup({ name, email, password: pass });
    f.reset();
    await renderAccount();
    updateAvatar();
    toast(t('toast.created'));
  } catch (err) {
    if (err.message === 'confirm') {
      setAuthTab('login');
      toast(t('toast.confirm'), 'warn');
    } else {
      authError('su-email', err.message);
    }
  }
});

// Forgot password — email a reset link.
$('#forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  authError('fp-email');
  const email = e.target.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { authError('fp-email', t('err.emailValid')); return; }
  if (!sb) return;
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
  if (error) { authError('fp-email', error.message); return; }
  e.target.reset();
  setAuthTab('login');
  toast(t('toast.resetSent'));
});

// Set a new password (after returning from the reset link).
$('#reset-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  authError('rp-pass'); authError('rp-pass2');
  const p1 = e.target.password.value, p2 = e.target.password2.value;
  if (p1.length < 6) { authError('rp-pass', t('err.min6')); return; }
  if (p1 !== p2) { authError('rp-pass2', 'Passwords don’t match.'); return; }
  if (!sb) return;
  const { error } = await sb.auth.updateUser({ password: p1 });
  if (error) { authError('rp-pass2', error.message); return; }
  e.target.reset();
  history.replaceState(null, '', location.pathname + location.search);
  $('.auth__tabs').hidden = false;
  await renderAccount();
  toast(t('toast.passUpdated'));
});

function doLogout() {
  logout().then(() => { updateAvatar(); renderAccount(); toast(t('toast.loggedOut')); });
}
$('#logout-btn').addEventListener('click', doLogout);
$('#admin-logout').addEventListener('click', doLogout);
$('#admin-refresh').addEventListener('click', () => renderAdmin());

// Show the "set new password" form inside the account modal.
function openResetForm() {
  $('#auth-view').hidden = false;
  $('#dash-view').hidden = true;
  $('#admin-view').hidden = true;
  setAuthTab('reset');
  openModal(accountModal);
}

/* --- initialise the session on page load --- */
(async function initAuth() {
  if (!sb) { updateAvatar(); console.warn('Supabase not loaded.'); return; }
  const hash = location.hash;
  const justConfirmed = /type=signup/.test(hash);   // arrived via confirm-signup link
  const isRecovery = /type=recovery/.test(hash);    // arrived via reset-password link

  // Register first so we don't miss the PASSWORD_RECOVERY event.
  sb.auth.onAuthStateChange((evt, session) => {
    state.user = sessionToUser(session);
    updateAvatar();
    if (evt === 'PASSWORD_RECOVERY') openResetForm();
  });

  try {
    const { data } = await sb.auth.getSession();
    state.user = sessionToUser(data.session);
    if (state.user) { const l = await fetchOrders(); state.myCount = l.length; }
  } catch (e) { console.warn(e); }
  updateAvatar();

  if (isRecovery) {
    openResetForm();
  } else if (justConfirmed) {
    history.replaceState(null, '', location.pathname + location.search); // clean the URL
    openModal(confirmedModal); // nice "Email confirmed!" screen
  }
})();

// Re-render dynamic (JS-built) views when the language is switched.
document.addEventListener('km:lang', () => {
  if (accountModal.classList.contains('is-open')) renderAccount();
  if (orderModal.classList.contains('is-open')) showStep(current);
});

/* ---------- 9) EMAIL SUBMIT --------------------------------------------- */
const ejs = CONFIG.emailjs;
const emailjsReady = !!(window.emailjs && ejs.publicKey && ejs.serviceId);
if (emailjsReady) {
  try { window.emailjs.init({ publicKey: ejs.publicKey }); } catch (_) {}
}
// Send a templated EmailJS email; silently no-ops when EmailJS isn't configured.
function sendEmail(templateId, params) {
  if (!emailjsReady || !templateId) return Promise.resolve();
  return window.emailjs.send(ejs.serviceId, templateId, params).catch((e) => console.warn('Email failed:', e));
}

function showSuccess(name) {
  $('#success-name').textContent = (name || '').split(' ')[0] || 'there';
  $('.wizard').hidden = true;
  successEl.hidden = false;
  launchConfetti();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.consent.checked) { setError('consent', t('err.consent')); return; }
  clearError('consent');
  const u = currentUser();
  if (!u) { toast(t('toast.needLogin'), 'warn'); return; }

  const order = {
    user_id: u.id, name: u.name, email: u.email,
    service: form.service.value, brief: form.brief.value.trim(),
    timeline: form.timeline.value, status: 'new',
    phone: fullPhone(),
  };

  const label = $('.btn__label', btnSubmit), spinner = $('.btn__spinner', btnSubmit);
  btnSubmit.disabled = true; if (label) label.textContent = t('wiz.sending'); if (spinner) spinner.hidden = false;
  const restore = () => { btnSubmit.disabled = false; if (label) label.textContent = t('wiz.submit'); if (spinner) spinner.hidden = true; };

  // 1) Save the order to Supabase (visible to the client and the admin).
  let saved;
  try {
    saved = await addOrderDB(order);
  } catch (err) {
    restore();
    toast(t('toast.orderFail') + err.message, 'warn');
    return;
  }

  // 2) Success screen + confetti.
  state.myCount += 1; updateAvatar();
  showSuccess(u.name);
  restore();

  // 3) Email the client an order confirmation (HTML template in EmailJS).
  sendEmail(ejs.templates.order, {
    to_email: u.email, to_name: u.name, name: u.name, email: u.email,
    order_id: saved && saved.id ? shortId(saved.id) : '',
    service: order.service, timeline: order.timeline, brief: order.brief,
    phone: order.phone, date: new Date().toLocaleString(), admin_email: CONFIG.adminEmail,
  });
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

/* Accounts and orders now live in Supabase (real, cross-device).
   Sign up creates a real account; orders are saved to the database and
   visible to the client (own orders) and to the admin (all orders). */

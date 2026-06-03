/* =========================================================================
   i18n — English / Arabic with RTL support
   - Static text uses [data-i18n] (innerHTML) and [data-i18n-ph] (placeholder).
   - Dynamic strings (built in script.js) use window.t('key').
   - Language persists in localStorage and toggles via [data-lang-toggle].
   ========================================================================= */
(function () {
  const I18N = {
    en: {
      /* nav */
      'nav.portfolio': 'Portfolio', 'nav.services': 'Services', 'nav.about': 'About',
      'nav.order': 'Order Now', 'nav.account': 'My Account',
      /* hero */
      'hero.eyebrow': 'DESIGN &amp; BUILD YOUR NEXT PRODUCT',
      'hero.title': 'A new way to think and create<br /><span class="grad">with design &amp; code</span>',
      'hero.lead': 'Front-End Development &amp; UI/UX Design studio by <strong>Khalil M\'hamdi</strong>. Browse the work, or start an order in under two minutes.',
      'hero.order': 'Order now', 'hero.view': 'View Portfolio',
      'hero.stat1': 'Years experience', 'hero.stat2': 'Projects shipped', 'hero.stat3': 'Avg. rating',
      /* services */
      'svc.head': 'What I do',
      'svc.design.t': 'UI/UX Design', 'svc.design.d': 'Research, wireframes, design systems and pixel-perfect high-fidelity interfaces for web &amp; mobile.', 'svc.design.cta': 'Order design →',
      'svc.dev.t': 'Web Development', 'svc.dev.d': 'Fast, responsive, accessible front-ends built from scratch with modern JavaScript &amp; frameworks.', 'svc.dev.cta': 'Order build →',
      'svc.full.t': 'Full Package', 'svc.full.d': 'End-to-end: strategy, design and development — one team, one timeline, one polished result.', 'svc.full.cta': 'Order package →',
      /* portfolio */
      'work.head': 'Selected work', 'work.all': 'All', 'work.dev': 'Web Dev', 'work.design': 'UI/UX Design',
      'work.carigo': 'Mobile UI/UX for a premium car-rental service — flows, components and a polished visual system.',
      'work.movis': 'Movie streaming experience with rich browsing, watchlists and a cinematic dark interface.',
      'work.smartscan': 'Web portal design and front-end build for a medical document scanning product.',
      'work.nutrion': 'Clean, friendly mobile app design for meal tracking and personalized nutrition plans.',
      'work.portfolio.t': 'Portfolio Website', 'work.portfolio.d': 'Animated, responsive personal portfolio built from scratch to showcase creative work.',
      'work.dsg': 'Logo and brand-identity system for Deaf Smart Glasses — cards, marks and guidelines.',
      'work.logos.t': 'Logo Collection', 'work.logos.d': 'A collection of logo and brand-mark work across illustration and visual design.',
      /* about */
      'about.head': 'About the studio',
      'about.p1': 'I\'m a multidisciplinary creator working at the intersection of <strong>design</strong> and <strong>code</strong>. Over the last five years I\'ve designed and shipped websites, web apps and mobile interfaces — from the first sketch to production.',
      'about.p2': 'I pair a designer\'s eye for detail with a developer\'s discipline, turning complex problems into clean, intuitive interfaces. Based in Oran, Algeria, working with clients worldwide.',
      'about.role': 'Front-End Developer · UI/UX Designer',
      'about.based': '<strong>Based in</strong> Oran, Algeria', 'about.focus': '<strong>Focus</strong> Web &amp; Product Design', 'about.avail': '<strong>Availability</strong> Open to work',
      'about.start': 'Start a project',
      /* footer */
      'footer.tag': 'Design &amp; development studio — Oran, Algeria.', 'footer.navigate': 'Navigate', 'footer.connect': 'Connect', 'footer.rights': 'All rights reserved.',
      /* order wizard */
      'wiz.eyebrow': 'New project', 'wiz.title': 'Place an order', 'wiz.s1': 'Service', 'wiz.s2': 'Details', 'wiz.s3': 'Confirm',
      'wiz.choose': 'Choose what you need.',
      'opt.design.t': 'UI/UX Design', 'opt.design.d': 'Wireframes, design systems &amp; high-fidelity UI.',
      'opt.dev.t': 'Web Development', 'opt.dev.d': 'Responsive, fast, accessible front-end builds.',
      'opt.full.t': 'Full Package', 'opt.full.d': 'Design + development, end to end.',
      'opt.custom.t': 'Customize', 'opt.custom.d': 'Something else? Describe your own custom request.',
      'wiz.orderingAs': 'Ordering as', 'wiz.phone': 'Phone number',
      'wiz.brief': 'Project brief', 'wiz.briefPh': 'Tell me about your project, goals and any links…',
      'wiz.timeline': 'Desired timeline',
      'wiz.tl.asap': 'As soon as possible', 'wiz.tl.12w': '1–2 weeks', 'wiz.tl.24w': '2–4 weeks', 'wiz.tl.12m': '1–2 months', 'wiz.tl.flex': 'Flexible / not sure',
      'wiz.review': 'Review your order before sending.',
      'wiz.consent': 'I agree to be contacted about this project at my account email.',
      'wiz.back': '← Back', 'wiz.next': 'Continue →', 'wiz.submit': 'Submit order', 'wiz.sending': 'Sending…',
      'wiz.stepOf': 'Step {n} of {t}',
      /* summary labels */
      'sum.service': 'Service', 'sum.name': 'Name', 'sum.email': 'Email', 'sum.phone': 'Phone', 'sum.timeline': 'Timeline', 'sum.brief': 'Brief',
      /* success */
      'ok.title': 'Order received!', 'ok.thanks': 'Thanks', 'ok.body': 'your brief is on its way. I\'ll reply within 24 hours. Track its status anytime in your account.', 'ok.done': 'Done',
      /* auth */
      'auth.title': 'Client area', 'auth.intro': 'Create an account to place an order and track its status anytime.',
      'auth.login': 'Log in', 'auth.signup': 'Create account', 'auth.google': 'Continue with Google', 'auth.or': 'or',
      'auth.email': 'Email', 'auth.password': 'Password', 'auth.passwordPh': 'Your password',
      'auth.forgot': 'Forgot password?', 'auth.newHere': 'New here?', 'auth.createOne': 'Create an account',
      'auth.fullname': 'Full name', 'auth.fullnamePh': 'Your full name', 'auth.min6': 'Min. 6 characters',
      'auth.confirmPass': 'Confirm password', 'auth.repeat': 'Repeat password', 'auth.haveAccount': 'Already have an account?',
      'auth.forgotNote': 'Enter your email and we\'ll send you a link to reset your password.', 'auth.sendReset': 'Send reset link', 'auth.backLogin': '← Back to log in',
      'auth.resetNote': 'Choose a new password for your account.', 'auth.newPass': 'New password', 'auth.confirmNewPass': 'Confirm new password', 'auth.updatePass': 'Update password',
      /* dashboard / admin */
      'dash.new': '+ New order', 'dash.logout': 'Log out', 'dash.none': 'No orders yet.', 'dash.first': 'Place your first order',
      'dash.hi': 'Hi, {name}', 'dash.total': 'Total orders', 'dash.active': 'Active', 'dash.completed': 'Completed', 'dash.noneYet': 'no orders yet',
      'tbl.order': 'Order', 'tbl.service': 'Service', 'tbl.timeline': 'Timeline', 'tbl.date': 'Date', 'tbl.status': 'Status', 'tbl.client': 'Client', 'tbl.name': 'Name', 'tbl.email': 'Email', 'tbl.joined': 'Joined',
      'admin.title': 'Admin dashboard', 'admin.refresh': '↻ Refresh', 'admin.allOrders': 'All orders', 'admin.allAccounts': 'All accounts', 'admin.noAccounts': 'No accounts yet.',
      'admin.accounts': 'Accounts', 'admin.orders': 'Orders',
      /* statuses */
      'st.new': 'Reviewing Brief', 'st.progress': 'In Progress', 'st.done': 'Completed',
      /* confirmed modal */
      'cf.title': 'Email confirmed!', 'cf.body': 'Welcome to Khalil Studio — your account is active and you\'re now signed in. You can place an order and track its status anytime.', 'cf.go': 'Go to my account', 'cf.continue': 'Continue browsing',
      /* toasts / validation */
      'toast.welcomeAdmin': 'Welcome, admin ★', 'toast.welcome': 'Welcome back ✓', 'toast.created': 'Account created ✓ You can place an order now.',
      'toast.loggedOut': 'Logged out.', 'toast.statusUpdated': 'Status updated ✓', 'toast.statusFail': 'Could not update status.',
      'toast.needLogin': 'Create an account (or log in) to place an order.', 'toast.orderFail': 'Could not submit order: ',
      'toast.resetSent': 'Reset link sent ✓ Check your email (and spam).', 'toast.passUpdated': 'Password updated ✓ You are signed in.',
      'toast.confirm': 'Account created — check your email to confirm, then log in.', 'toast.emailConfirmed': 'Email confirmed ✓ You are now signed in.',
      'err.service': 'Please choose a service to continue.', 'err.phone': 'Enter a valid phone number.', 'err.brief': 'Tell me a bit more (10+ characters).',
      'err.consent': 'Please confirm to continue.', 'err.name': 'Please enter your name.', 'err.emailValid': 'Enter a valid email.',
      'err.min6': 'At least 6 characters.', 'err.match': 'Passwords don\'t match.', 'err.wrong': 'Wrong email or password.',
    },
    ar: {
      'nav.portfolio': 'الأعمال', 'nav.services': 'الخدمات', 'nav.about': 'من أنا',
      'nav.order': 'اطلب الآن', 'nav.account': 'حسابي',
      'hero.eyebrow': 'صَمِّم وابنِ مشروعك القادم',
      'hero.title': 'طريقة جديدة للتفكير والإبداع<br /><span class="grad">بالتصميم والبرمجة</span>',
      'hero.lead': 'استوديو تطوير واجهات وتصميم UI/UX بقيادة <strong>خليل مهمدي</strong>. تصفّح الأعمال، أو ابدأ طلبك في أقل من دقيقتين.',
      'hero.order': 'اطلب الآن', 'hero.view': 'عرض الأعمال',
      'hero.stat1': 'سنوات خبرة', 'hero.stat2': 'مشروع منجز', 'hero.stat3': 'متوسط التقييم',
      'svc.head': 'ماذا أقدّم',
      'svc.design.t': 'تصميم UI/UX', 'svc.design.d': 'بحث، نماذج أولية، أنظمة تصميم وواجهات عالية الدقة للويب والجوال.', 'svc.design.cta': 'اطلب تصميمًا →',
      'svc.dev.t': 'تطوير الويب', 'svc.dev.d': 'واجهات أمامية سريعة ومتجاوبة من الصفر بأحدث تقنيات JavaScript والأطر.', 'svc.dev.cta': 'اطلب تطويرًا →',
      'svc.full.t': 'الباقة الكاملة', 'svc.full.d': 'من الفكرة إلى الإطلاق: استراتيجية وتصميم وتطوير — فريق واحد ونتيجة متكاملة.', 'svc.full.cta': 'اطلب الباقة →',
      'work.head': 'أعمال مختارة', 'work.all': 'الكل', 'work.dev': 'تطوير ويب', 'work.design': 'تصميم UI/UX',
      'work.carigo': 'تصميم واجهة وتجربة لتطبيق تأجير سيارات فاخر — مسارات ومكوّنات ونظام بصري متقن.',
      'work.movis': 'تجربة بث أفلام بتصفّح غني وقوائم مشاهدة وواجهة داكنة سينمائية.',
      'work.smartscan': 'تصميم بوابة ويب وتطوير الواجهة الأمامية لمنتج مسح المستندات الطبية.',
      'work.nutrion': 'تصميم تطبيق جوال نظيف وسهل لتتبّع الوجبات وخطط التغذية الشخصية.',
      'work.portfolio.t': 'موقع بورتفوليو', 'work.portfolio.d': 'بورتفوليو شخصي متحرك ومتجاوب مبني من الصفر لعرض الأعمال الإبداعية.',
      'work.dsg': 'شعار ونظام هوية بصرية لمشروع Deaf Smart Glasses — بطاقات وعلامات وإرشادات.',
      'work.logos.t': 'مجموعة شعارات', 'work.logos.d': 'مجموعة من أعمال الشعارات والعلامات التجارية في الرسم والتصميم البصري.',
      'about.head': 'عن الاستوديو',
      'about.p1': 'أنا مبدع متعدّد التخصصات أعمل عند تقاطع <strong>التصميم</strong> و<strong>البرمجة</strong>. على مدى خمس سنوات صمّمتُ وأطلقتُ مواقع وتطبيقات ويب وواجهات جوال — من أول رسم إلى الإنتاج.',
      'about.p2': 'أجمع بين دقّة المصمّم وانضباط المطوّر، محوّلًا المشكلات المعقّدة إلى واجهات نظيفة وسهلة. مقري وهران، الجزائر، وأعمل مع عملاء حول العالم.',
      'about.role': 'مطوّر واجهات · مصمّم UI/UX',
      'about.based': '<strong>المقر</strong> وهران، الجزائر', 'about.focus': '<strong>التخصص</strong> الويب وتصميم المنتجات', 'about.avail': '<strong>الإتاحة</strong> متاح للعمل',
      'about.start': 'ابدأ مشروعًا',
      'footer.tag': 'استوديو تصميم وتطوير — وهران، الجزائر.', 'footer.navigate': 'تنقّل', 'footer.connect': 'تواصل', 'footer.rights': 'جميع الحقوق محفوظة.',
      'wiz.eyebrow': 'مشروع جديد', 'wiz.title': 'إنشاء طلب', 'wiz.s1': 'الخدمة', 'wiz.s2': 'التفاصيل', 'wiz.s3': 'تأكيد',
      'wiz.choose': 'اختر ما تحتاجه.',
      'opt.design.t': 'تصميم UI/UX', 'opt.design.d': 'نماذج أولية وأنظمة تصميم وواجهات عالية الدقة.',
      'opt.dev.t': 'تطوير الويب', 'opt.dev.d': 'واجهات أمامية متجاوبة وسريعة وسهلة الوصول.',
      'opt.full.t': 'الباقة الكاملة', 'opt.full.d': 'تصميم + تطوير، من البداية للنهاية.',
      'opt.custom.t': 'تخصيص', 'opt.custom.d': 'شيء آخر؟ صِف طلبك الخاص.',
      'wiz.orderingAs': 'الطلب باسم', 'wiz.phone': 'رقم الهاتف',
      'wiz.brief': 'وصف المشروع', 'wiz.briefPh': 'أخبرني عن مشروعك وأهدافك وأي روابط…',
      'wiz.timeline': 'المدة المطلوبة',
      'wiz.tl.asap': 'في أقرب وقت', 'wiz.tl.12w': 'أسبوع — أسبوعان', 'wiz.tl.24w': '2 — 4 أسابيع', 'wiz.tl.12m': 'شهر — شهران', 'wiz.tl.flex': 'مرن / غير محدّد',
      'wiz.review': 'راجع طلبك قبل الإرسال.',
      'wiz.consent': 'أوافق على التواصل معي بخصوص هذا المشروع عبر بريد حسابي.',
      'wiz.back': '→ رجوع', 'wiz.next': 'متابعة ←', 'wiz.submit': 'إرسال الطلب', 'wiz.sending': 'جارٍ الإرسال…',
      'wiz.stepOf': 'الخطوة {n} من {t}',
      'sum.service': 'الخدمة', 'sum.name': 'الاسم', 'sum.email': 'البريد', 'sum.phone': 'الهاتف', 'sum.timeline': 'المدة', 'sum.brief': 'الوصف',
      'ok.title': 'تم استلام الطلب!', 'ok.thanks': 'شكرًا', 'ok.body': 'وصلني طلبك وسأرد خلال 24 ساعة. تابع حالته في أي وقت من حسابك.', 'ok.done': 'تم',
      'auth.title': 'منطقة العميل', 'auth.intro': 'أنشئ حسابًا لتقديم طلب ومتابعة حالته في أي وقت.',
      'auth.login': 'تسجيل الدخول', 'auth.signup': 'إنشاء حساب', 'auth.google': 'المتابعة عبر Google', 'auth.or': 'أو',
      'auth.email': 'البريد الإلكتروني', 'auth.password': 'كلمة المرور', 'auth.passwordPh': 'كلمة مرورك',
      'auth.forgot': 'نسيت كلمة المرور؟', 'auth.newHere': 'جديد هنا؟', 'auth.createOne': 'أنشئ حسابًا',
      'auth.fullname': 'الاسم الكامل', 'auth.fullnamePh': 'اسمك الكامل', 'auth.min6': '6 أحرف على الأقل',
      'auth.confirmPass': 'تأكيد كلمة المرور', 'auth.repeat': 'أعد كلمة المرور', 'auth.haveAccount': 'لديك حساب بالفعل؟',
      'auth.forgotNote': 'أدخل بريدك وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.', 'auth.sendReset': 'إرسال رابط الاستعادة', 'auth.backLogin': '→ العودة لتسجيل الدخول',
      'auth.resetNote': 'اختر كلمة مرور جديدة لحسابك.', 'auth.newPass': 'كلمة مرور جديدة', 'auth.confirmNewPass': 'تأكيد كلمة المرور الجديدة', 'auth.updatePass': 'تحديث كلمة المرور',
      'dash.new': '+ طلب جديد', 'dash.logout': 'تسجيل الخروج', 'dash.none': 'لا توجد طلبات بعد.', 'dash.first': 'قدّم طلبك الأول',
      'dash.hi': 'مرحبًا، {name}', 'dash.total': 'إجمالي الطلبات', 'dash.active': 'نشِطة', 'dash.completed': 'مكتملة', 'dash.noneYet': 'لا توجد طلبات بعد',
      'tbl.order': 'الطلب', 'tbl.service': 'الخدمة', 'tbl.timeline': 'المدة', 'tbl.date': 'التاريخ', 'tbl.status': 'الحالة', 'tbl.client': 'العميل', 'tbl.name': 'الاسم', 'tbl.email': 'البريد', 'tbl.joined': 'تاريخ الانضمام',
      'admin.title': 'لوحة التحكم', 'admin.refresh': '↻ تحديث', 'admin.allOrders': 'كل الطلبات', 'admin.allAccounts': 'كل الحسابات', 'admin.noAccounts': 'لا توجد حسابات بعد.',
      'admin.accounts': 'الحسابات', 'admin.orders': 'الطلبات',
      'st.new': 'قيد المراجعة', 'st.progress': 'قيد التنفيذ', 'st.done': 'مكتمل',
      'cf.title': 'تم تأكيد البريد!', 'cf.body': 'أهلًا بك في Khalil Studio — حسابك مُفعَّل وأنت مسجّل الدخول الآن. يمكنك تقديم طلب ومتابعة حالته في أي وقت.', 'cf.go': 'اذهب إلى حسابي', 'cf.continue': 'متابعة التصفّح',
      'toast.welcomeAdmin': 'مرحبًا أيها المسؤول ★', 'toast.welcome': 'أهلًا بعودتك ✓', 'toast.created': 'تم إنشاء الحساب ✓ يمكنك تقديم طلب الآن.',
      'toast.loggedOut': 'تم تسجيل الخروج.', 'toast.statusUpdated': 'تم تحديث الحالة ✓', 'toast.statusFail': 'تعذّر تحديث الحالة.',
      'toast.needLogin': 'أنشئ حسابًا (أو سجّل الدخول) لتقديم طلب.', 'toast.orderFail': 'تعذّر إرسال الطلب: ',
      'toast.resetSent': 'تم إرسال رابط الاستعادة ✓ تحقّق من بريدك (والـ Spam).', 'toast.passUpdated': 'تم تحديث كلمة المرور ✓ أنت مسجّل الدخول.',
      'toast.confirm': 'تم إنشاء الحساب — تحقّق من بريدك للتأكيد ثم سجّل الدخول.', 'toast.emailConfirmed': 'تم تأكيد البريد ✓ أنت مسجّل الدخول الآن.',
      'err.service': 'يرجى اختيار خدمة للمتابعة.', 'err.phone': 'أدخل رقم هاتف صحيحًا.', 'err.brief': 'أخبرني بمزيد من التفاصيل (10 أحرف على الأقل).',
      'err.consent': 'يرجى التأكيد للمتابعة.', 'err.name': 'يرجى إدخال اسمك.', 'err.emailValid': 'أدخل بريدًا صحيحًا.',
      'err.min6': '6 أحرف على الأقل.', 'err.match': 'كلمتا المرور غير متطابقتين.', 'err.wrong': 'البريد أو كلمة المرور غير صحيحة.',
    },
  };

  let lang = localStorage.getItem('km_lang') || 'en';
  window.KM_LANG = lang;
  window.t = function (key, vars) {
    let s = (I18N[window.KM_LANG] && I18N[window.KM_LANG][key]);
    if (s == null) s = (I18N.en[key] != null ? I18N.en[key] : key);
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  };

  function apply(l) {
    lang = (l === 'ar') ? 'ar' : 'en';
    window.KM_LANG = lang;
    const dict = I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = dict[el.getAttribute('data-i18n')];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const v = dict[el.getAttribute('data-i18n-ph')];
      if (v != null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-lang-label]').forEach((el) => { el.textContent = lang === 'ar' ? 'EN' : 'ع'; });
    localStorage.setItem('km_lang', lang);
    document.dispatchEvent(new CustomEvent('km:lang', { detail: lang }));
  }
  window.applyLang = apply;

  function init() {
    document.querySelectorAll('[data-lang-toggle]').forEach((b) =>
      b.addEventListener('click', () => apply(window.KM_LANG === 'ar' ? 'en' : 'ar'))
    );
    apply(lang);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

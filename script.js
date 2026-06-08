/* =============================================================
   PREVODILAČKI URED BEŠIREVIĆ — script.js
   ============================================================= */

/* ── Obfuscated email ──────────────────────────────────────── */
const _em = ['info', 'besirevicprijevodi', 'com'];
function getEmail() { return `${_em[0]}@${_em[1]}.${_em[2]}`; }

/* ── State ──────────────────────────────────────────────────── */
let i18nData = {};

/* =============================================================
   i18n — Language system
   ============================================================= */
async function loadLang(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    i18nData = await res.json();

    /* text nodes */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (i18nData[k] !== undefined) el.textContent = i18nData[k];
    });

    /* placeholders */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const k = el.getAttribute('data-i18n-placeholder');
      if (i18nData[k] !== undefined) el.placeholder = i18nData[k];
    });

    /* aria-labels */
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const k = el.getAttribute('data-i18n-aria');
      if (i18nData[k] !== undefined) el.setAttribute('aria-label', i18nData[k]);
    });

    /* update switcher UI */
    const flagEl = document.getElementById('activeFlagEl');
    const codeEl = document.getElementById('activeLangEl');
    if (flagEl) flagEl.textContent = lang === 'bs' ? '🇧🇦' : '🇩🇪';
    if (codeEl) codeEl.textContent = lang.toUpperCase();

    document.querySelectorAll('.lang-opt').forEach(el =>
      el.classList.toggle('is-active', el.dataset.lang === lang));
    document.querySelectorAll('.mobile-lang').forEach(el =>
      el.classList.toggle('is-active', el.dataset.lang === lang));

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);

    setupEmail();
  } catch (err) {
    console.warn('[i18n] Failed to load', lang, err);
  }
}

function initLang() {
  const saved = localStorage.getItem('lang') || 'bs';
  loadLang(saved);
}

/* =============================================================
   Email — obfuscated, injected at runtime
   ============================================================= */
function setupEmail() {
  const email = getEmail();
  document.querySelectorAll('[data-email]').forEach(el => {
    el.textContent = email;
    if (el.tagName === 'A') el.href = `mailto:${email}`;
  });
}

/* =============================================================
   Navbar — scroll shadow + active link detection
   ============================================================= */
function initNavbar() {
  const bar = document.getElementById('navbar');
  if (!bar) return;

  let _navRaf = false;
  window.addEventListener('scroll', () => {
    if (!_navRaf) {
      _navRaf = true;
      requestAnimationFrame(() => {
        bar.classList.toggle('scrolled', window.scrollY > 10);
        _navRaf = false;
      });
    }
  }, { passive: true });

  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0];
    const isHome = page === '' || page === 'index.html';
    const hrefIsHome = href === 'index.html' || href === './';
    const match = href === page || (isHome && hrefIsHome);
    a.classList.toggle('active', match);
  });
}

/* =============================================================
   Language switcher dropdown
   ============================================================= */
function initLangSwitcher() {
  const switcher = document.getElementById('langSwitcher');
  const btn = document.getElementById('langBtn');
  if (!switcher || !btn) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = switcher.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  switcher.querySelectorAll('.lang-opt').forEach(opt =>
    opt.addEventListener('click', () => {
      loadLang(opt.dataset.lang);
      switcher.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }));

  document.addEventListener('click', e => {
    if (!switcher.contains(e.target)) {
      switcher.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* mobile language buttons */
  document.querySelectorAll('.mobile-lang').forEach(b =>
    b.addEventListener('click', () => {
      loadLang(b.dataset.lang);
      closeMobileNav();
    }));
}

/* =============================================================
   Hamburger / Mobile nav
   ============================================================= */
function initMobileNav() {
  const ham = document.getElementById('hamburger');
  const panel = document.getElementById('mobileNav');
  const close = document.getElementById('mobileClose');
  if (!ham || !panel) return;

  function openNav() {
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    ham.setAttribute('aria-expanded', 'true');
  }

  window.closeMobileNav = function () {
    panel.classList.remove('open');
    document.body.style.overflow = '';
    ham.setAttribute('aria-expanded', 'false');
  };

  ham.addEventListener('click', openNav);
  close?.addEventListener('click', closeMobileNav);
  panel.querySelectorAll('.mobile-nav-link').forEach(a =>
    a.addEventListener('click', closeMobileNav));
}

/* =============================================================
   Scroll animations — IntersectionObserver fade + slide-up
   ============================================================= */
function initAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.anim').forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim').forEach(el => io.observe(el));
}

/* =============================================================
   Cookie consent
   ============================================================= */
function initCookies() {
  const bar = document.getElementById('cookieBar');
  if (!bar || localStorage.getItem('cookie_consent')) return;

  setTimeout(() => bar.classList.add('show'), 1500);

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', '1');
    bar.classList.remove('show');
  });

  document.getElementById('cookieDecline')?.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', '0');
    bar.classList.remove('show');
  });
}

/* =============================================================
   Privacy modal
   ============================================================= */
function initPrivacyModal() {
  const overlay = document.getElementById('privacyOverlay');
  if (!overlay) return;

  function openModal(e) {
    e?.preventDefault();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('#openPrivacy, #cookiePrivacyLink, .privacy-trigger')
    .forEach(el => el?.addEventListener('click', openModal));

  document.getElementById('closePrivacy')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* =============================================================
   Contact form validation
   ============================================================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  function t(key, fallback) { return i18nData[key] || fallback; }

  function setErr(inputId, errId, msg) {
    document.getElementById(inputId)?.classList.add('has-err');
    const err = document.getElementById(errId);
    if (err) { err.textContent = msg; err.classList.add('show'); }
  }

  function clearErr(inputId, errId) {
    document.getElementById(inputId)?.classList.remove('has-err');
    document.getElementById(errId)?.classList.remove('show');
  }

  /* live clear on input */
  [['formEmail', 'formEmailErr'], ['formName', 'formNameErr'], ['formMessage', 'formMsgErr']]
    .forEach(([inp, err]) =>
      document.getElementById(inp)?.addEventListener('input', () => clearErr(inp, err)));

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    /* email */
    const emailVal = document.getElementById('formEmail')?.value || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim())) {
      setErr('formEmail', 'formEmailErr', t('err_email', 'Unesite ispravnu email adresu.'));
      valid = false;
    } else clearErr('formEmail', 'formEmailErr');

    /* name */
    const nameVal = (document.getElementById('formName')?.value || '').trim();
    if (!nameVal) {
      setErr('formName', 'formNameErr', t('err_name', 'Ovo polje je obavezno.'));
      valid = false;
    } else clearErr('formName', 'formNameErr');

    /* message */
    const msgVal = (document.getElementById('formMessage')?.value || '').trim();
    if (!msgVal) {
      setErr('formMessage', 'formMsgErr', t('err_message', 'Molimo unesite vašu poruku.'));
      valid = false;
    } else clearErr('formMessage', 'formMsgErr');

    /* privacy */
    const privacyEl = document.getElementById('formPrivacy');
    const privacyErr = document.getElementById('formPrivacyErr');
    if (!privacyEl?.checked) {
      if (privacyErr) {
        privacyErr.textContent = t('err_privacy', 'Morate prihvatiti politiku privatnosti.');
        privacyErr.classList.add('show');
      }
      valid = false;
    } else {
      privacyErr?.classList.remove('show');
    }

    if (valid) {
      const successEl = document.getElementById('formSuccess');
      if (successEl) {
        successEl.textContent = t('form_success', 'Hvala! Vaša poruka je uspješno poslana. Odgovoriti ćemo u najkraćem mogućem roku.');
        successEl.classList.add('show');
        form.reset();
        setTimeout(() => successEl.classList.remove('show'), 8000);
      }
    }
  });
}

/* =============================================================
   Boot
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLangSwitcher();
  initMobileNav();
  initAnimations();
  initCookies();
  initPrivacyModal();
  initContactForm();
  setupEmail();
  initLang();   /* async — loads JSON then calls setupEmail again */
});


// ASCII
const terminalLogo = `
             P R E V O D I L A Č K I   U R E D

                \\/                                      /
 ____   _____  ____  ___  ____  _____ __     __ ___   ____ 
| __ ) | ____|/ ___||_ _||  _ \\| ____|\\ \\   / /|_ _| / ___|
|  _ \\ |  _|  \\___ \\ | | | |_) |  _|   \\ \\ / /  | | | |    
| |_) || |___  ___) || | |  _ <| |___   \\ V /   | | | |___ 
|____/ |_____||____/|___||_| \\_\\_____|   \\_/   |___| \\____|
`;

// Ispis u konzoli sa prilagođenim CSS stilovima
console.log(
    `%c${terminalLogo}`, 
    "color: #00E5FF; font-weight: bold; font-family: monospace; text-shadow: 0 0 5px rgba(0, 229, 255, 0.4);"
);

console.log(
    "%c> Verzija 2.0", 
    "color: #888888; font-family: monospace; font-size: 12px; margin-top: 4px; margin-bottom: 8px;"
);

console.log(
    "%c> Dev: Edin | GitHub: %chttps://github.com/edin09", 
    "color: #A0A0A0; font-family: monospace; font-size: 12px;", 
    "color: #4DA6FF; text-decoration: none; font-family: monospace; font-size: 12px;"
);
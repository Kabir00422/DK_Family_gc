// ============================================
// UTIL
// ============================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();

  initNav();
  initCursorGlow();
  initHeroParallax();
  initTilt();
  initCounters();
  initLiveChat();
  initAccordion();
  initReveal();
  initCopyLink();
  initQrModal();
  initContactForm();
  initSmoothAnchors();
});

// ============================================
// NAV — scroll shadow + mobile burger
// ============================================
function initNav() {
  const nav = $('#nav');
  const burger = $('#navBurger');
  const mobile = $('#navMobile');

  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 12 ? '0 8px 30px rgba(0,0,0,0.35)' : 'none';
  });

  burger.addEventListener('click', () => {
    const isOpen = mobile.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  $$('#navMobile a').forEach(a => a.addEventListener('click', () => {
    mobile.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

// ============================================
// CURSOR GLOW — follows mouse on desktop
// ============================================
function initCursorGlow() {
  if (prefersReducedMotion || window.matchMedia('(max-width: 880px)').matches) return;
  const glow = $('.cursor-glow');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function loop() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();
}

// ============================================
// HERO 3D PARALLAX — chat stack tilts with mouse / device tilt
// ============================================
function initHeroParallax() {
  const visual = $('#heroVisual');
  const stack = $('#chatStack');
  if (!visual || !stack || prefersReducedMotion) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  visual.addEventListener('mousemove', e => {
    const rect = visual.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = px;
    targetY = py;
  });

  visual.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

  function animate() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    stack.style.transform = `rotateY(${curX * 16}deg) rotateX(${-curY * 16}deg)`;
    requestAnimationFrame(animate);
  }
  animate();

  // Subtle device-tilt parallax on mobile
  if (window.DeviceOrientationEvent && window.matchMedia('(max-width: 1024px)').matches) {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      targetX = Math.max(-0.5, Math.min(0.5, e.gamma / 90));
      targetY = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 90));
    });
  }
}

// CARD TILT — step cards tilt on hover

function initTilt() {
  if (prefersReducedMotion) return;
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ANIMATED COUNTERS

function initCounters() {
  const counters = $$('.stat-num');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

// LIVE CHAT SIMULATION — house rules section preview
function initLiveChat() {
  const body = $('#liveBody');
  if (!body) return;

  const people = [
    { name: 'maya_k', color: '#FF8A9B' },
    { name: 'devon.codes', color: '#7BD3FF' },
    { name: 'ria_writes', color: '#FFB020' },
    { name: 'theo_moves', color: '#9B8CFF' },
    { name: 'kiki.exe', color: '#4ADE80' },
  ];

  const lines = [
    "anyone awake lol",
    "just saw the news, thoughts??",
    "this might be my favorite chat on the app ngl",
    "does anyone have recs for something to watch tonight",
    "wait that's actually such a good point",
    "good morning loop 🌞",
    "okay who's been here since day one",
    "dropping in to say this group is unreasonably wholesome",
    "can we talk about literally anything else for five mins",
    "new member just joined say hi everyone 👋",
  ];

  let i = 0;
  function addMessage() {
    const person = people[Math.floor(Math.random() * people.length)];
    const text = lines[i % lines.length];
    i++;

    const row = document.createElement('div');
    row.className = 'lw-msg';
    row.innerHTML = `
      <span class="msg-avatar" style="background:${person.color}"></span>
      <div class="lw-msg-text">
        <span class="lw-name">${person.name}</span>
        <div class="lw-bubble"></div>
      </div>
    `;
    body.appendChild(row);
    $('.lw-bubble', row).textContent = text;

    // keep max 8 messages
    while (body.children.length > 8) body.removeChild(body.firstChild);
    body.scrollTop = body.scrollHeight;
  }

  // seed a few messages immediately
  for (let n = 0; n < 4; n++) addMessage();

  // then keep adding on an interval while visible
  let interval = null;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !interval) {
        interval = setInterval(addMessage, 2600);
      } else if (!entry.isIntersecting && interval) {
        clearInterval(interval);
        interval = null;
      }
    });
  }, { threshold: 0.2 });
  observer.observe($('#liveWindow'));
}

// FAQ ACCORDION

function initAccordion() {
  $$('.acc-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // close all others
      $$('.acc-trigger').forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          t.nextElementSibling.style.maxHeight = null;
        }
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + 'px';
    });
  });
}

// SCROLL REVEAL

function initReveal() {
  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  if (prefersReducedMotion) {
    targets.forEach(t => t.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(t => observer.observe(t));
}

// COPY INVITE LINK

function initCopyLink() {
  const btn = $('#copyLinkBtn');
  if (!btn) return;
  const label = $('#copyLinkText');
  const link = btn.dataset.link;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(link);
      label.textContent = 'Link copied!';
      showToast('Invite link copied to clipboard');
      setTimeout(() => { label.textContent = 'Copy invite link'; }, 2200);
    } catch (err) {
      showToast("Couldn't copy — try the join button instead", true);
    }
  });
}

// QR MODAL

function initQrModal() {
  const modal = $('#qrModal');
  const openBtn = $('#qrBtn');
  const closeBtn = $('#qrClose');
  const qrBox = $('#qrBox');
  if (!modal || !openBtn) return;

  const link = $('#copyLinkBtn').dataset.link;
  // const link = $('#mainJoinBtn').getAttribute('href');

  function buildQr() {
    if (qrBox.dataset.built) return;

    // Lightweight QR via public QR image API, inserted as an <img>

    const img = document.createElement('img');
    img.alt = 'QR code to join the group chat';
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    img.loading = 'lazy';
    qrBox.appendChild(img);
    qrBox.dataset.built = 'true';
  }

  function openModal() {
    buildQr();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// CONTACT FORM — validation + mailto handoff

function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const nameInput = $('#cf-name');
  const emailInput = $('#cf-email');
  const messageInput = $('#cf-message');
  const topicSelect = $('#cf-topic');
  const charCount = $('#charCount');

  messageInput.addEventListener('input', () => {
    const len = messageInput.value.length;
    charCount.textContent = `${len} / 500`;
    if (len > 500) messageInput.value = messageInput.value.slice(0, 500);
  });

  function setError(input, errEl, message) {
    errEl.textContent = message;
    input.closest('.form-row').classList.toggle('error', Boolean(message));
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  nameInput.addEventListener('input', () => setError(nameInput, $('#err-name'), ''));
  emailInput.addEventListener('input', () => setError(emailInput, $('#err-email'), ''));
  messageInput.addEventListener('input', () => setError(messageInput, $('#err-message'), ''));

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    if (!nameInput.value.trim()) {
      setError(nameInput, $('#err-name'), 'Tell us what to call you.');
      valid = false;
    }
    if (!validEmail(emailInput.value.trim())) {
      setError(emailInput, $('#err-email'), 'Enter a valid email address.');
      valid = false;
    }
    if (messageInput.value.trim().length < 10) {
      setError(messageInput, $('#err-message'), 'Add a few more details (10+ characters).');
      valid = false;
    }

    if (!valid) {
      showToast('Please fix the highlighted fields', true);
      return;
    }

    const topicLabels = {
      general: 'General message',
      complaint: 'Complaint / report',
      bug: 'Bug report',
      suggestion: 'Suggestion',
    };

    const subject = `[The Loop] ${topicLabels[topicSelect.value] || 'Message'} from ${nameInput.value.trim()}`;
    const body =
      `Name: ${nameInput.value.trim()}\n` +
      `Email: ${emailInput.value.trim()}\n` +
      `Topic: ${topicLabels[topicSelect.value] || 'General'}\n\n` +
      `${messageInput.value.trim()}`;

    // const mailto = `mailto:hello@theloop.example?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailto = `mailto:kabirrahaman2003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const submitBtn = $('#contactSubmit');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Opening your email app…</span>';
    submitBtn.disabled = true;

    window.location.href = mailto;

    showToast('Opening your email app to send this');

    setTimeout(() => {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      form.reset();
      charCount.textContent = '0 / 500';
    }, 1600);
  });
}

// TOAST

let toastTimer = null;
function showToast(message, isError = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.toggle('toast-error', isError);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// SMOOTH ANCHOR SCROLL

function initSmoothAnchors() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = 76;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}
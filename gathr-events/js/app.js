/* =========================================================
   Gathr — application logic (vanilla JavaScript)
   Sections:
   1. Helpers & state       5. Modal + registration form
   2. Rendering             6. Validation
   3. Search / filter       7. Local Storage
   4. Countdown timers      8. Theme, nav, reveal, init
   ========================================================= */
(() => {
  'use strict';

  /* ---------- 1. Helpers & state ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const REG_KEY = 'gathr.registrations.v1';
  const THEME_KEY = 'gathr.theme';
  const MAX_TICKETS = 5;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Turn "daysFromNow" + "HH:MM" into a real Date, so the demo never goes stale.
  const withDates = (e) => {
    const d = new Date();
    d.setDate(d.getDate() + e.daysFromNow);
    const [h, m] = e.time.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return { ...e, start: d };
  };
  const events = EVENTS.map(withDates);
  const byId = (id) => events.find((e) => e.id === id);

  const fmtDate = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const fmtMonth = new Intl.DateTimeFormat('en-IN', { month: 'short' });
  const money = (n) => (n === 0 ? 'Free' : '₹' + n.toLocaleString('en-IN'));

  const state = { query: '', category: 'All', sort: 'date', activeEventId: null, lastBooking: null };

  const ICON = {
    cal: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    pin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
  };

  /* ---------- 7. Local Storage ---------- */
  const loadRegs = () => {
    try { return JSON.parse(localStorage.getItem(REG_KEY)) || []; } catch { return []; }
  };
  const saveRegs = (list) => {
    try { localStorage.setItem(REG_KEY, JSON.stringify(list)); } catch { /* storage full / blocked */ }
  };
  let registrations = loadRegs();

  const seatsLeft = (e) => {
    const mine = registrations.filter((r) => r.eventId === e.id).reduce((n, r) => n + r.tickets, 0);
    return Math.max(0, e.seats - e.taken - mine);
  };
  const seatsLabel = (e) => {
    const n = seatsLeft(e);
    if (n === 0) return { text: 'Sold out', cls: 'out' };
    if (n <= 15) return { text: `Only ${n} left`, cls: 'low' };
    return { text: `${n} seats left`, cls: '' };
  };

  /* ---------- 2. Rendering ---------- */
  const countdownHTML = (e) => `<span class="count-pill" data-countdown="${e.start.getTime()}"></span>`;

  function cardHTML(e, i) {
    const s = seatsLabel(e);
    return `
      <article class="card" style="--i:${i}">
        <div class="card-media">
          <img src="${esc(e.image)}" alt="${esc(e.title)} artwork" loading="lazy" width="800" height="500" />
          <div class="date-badge" aria-hidden="true"><b>${e.start.getDate()}</b><span>${fmtMonth.format(e.start)}</span></div>
          <span class="tag">${esc(e.category)}</span>
        </div>
        <div class="card-body">
          <h3>${esc(e.title)}</h3>
          <div class="meta">
            <span>${ICON.cal} ${fmtDate.format(e.start)} · ${fmtTime.format(e.start)}</span>
            <span>${ICON.pin} ${esc(e.venue)}</span>
          </div>
          <p class="short">${esc(e.short)}</p>
          <div class="card-foot">
            <div>
              <div class="price ${e.price === 0 ? 'free' : ''}">${money(e.price)}</div>
              ${countdownHTML(e)}
            </div>
            <span class="seats ${s.cls}">${s.text}</span>
          </div>
          <button type="button" class="btn btn-primary" data-open="${esc(e.id)}" aria-label="View details and register for ${esc(e.title)}">View details &amp; register</button>
        </div>
      </article>`;
  }

  function featureHTML(e) {
    return `
      <button type="button" class="feature reveal" data-open="${esc(e.id)}" aria-label="Open ${esc(e.title)}">
        <img src="${esc(e.image)}" alt="" loading="lazy" />
        <div class="feature-body">
          <span class="tag">${esc(e.category)}</span>
          <h3>${esc(e.title)}</h3>
          <p>${fmtDate.format(e.start)} · ${esc(e.venue)}</p>
          <div class="row"><span>${money(e.price)}</span><span class="go">Register →</span></div>
        </div>
      </button>`;
  }

  function renderFeatured() {
    const list = events.filter((e) => e.featured).sort((a, b) => a.start - b.start);
    $('#featuredGrid').innerHTML = list.map(featureHTML).join('');
    observeReveals();
  }

  function renderChips() {
    const counts = { All: events.length };
    CATEGORIES.forEach((c) => (counts[c] = events.filter((e) => e.category === c).length));
    $('#chips').innerHTML = ['All', ...CATEGORIES]
      .map((c) => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${state.category === c}">${c}<span class="n">${counts[c]}</span></button>`)
      .join('');
  }

  /* ---------- 3. Search / filter / sort ---------- */
  function getVisible() {
    const q = state.query.trim().toLowerCase();
    let list = events.filter((e) => {
      const matchCat = state.category === 'All' || e.category === state.category;
      const hay = `${e.title} ${e.category} ${e.venue} ${e.city} ${e.short} ${e.description}`.toLowerCase();
      return matchCat && (!q || q.split(/\s+/).every((w) => hay.includes(w)));
    });
    const sorters = {
      date: (a, b) => a.start - b.start,
      'price-asc': (a, b) => a.price - b.price || a.start - b.start,
      'price-desc': (a, b) => b.price - a.price || a.start - b.start,
      seats: (a, b) => seatsLeft(b) - seatsLeft(a)
    };
    return list.sort(sorters[state.sort]);
  }

  function renderEvents() {
    const list = getVisible();
    $('#eventsGrid').innerHTML = list.map(cardHTML).join('');
    $('#emptyState').hidden = list.length > 0;
    $('#resultCount').textContent = `${list.length} event${list.length === 1 ? '' : 's'} found`;
    tick();
  }

  function refreshAll() {
    renderFeatured();
    renderEvents();
    renderTickets();
    updateStats();
  }

  function updateStats() {
    $('#statEvents').textContent = events.length;
    $('#statCats').textContent = CATEGORIES.length;
    $('#statSeats').textContent = events.reduce((n, e) => n + seatsLeft(e), 0).toLocaleString('en-IN');
    const badge = $('#navBadge');
    badge.textContent = registrations.length;
    badge.hidden = registrations.length === 0;
  }

  /* ---------- 4. Countdown timers ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  function nextEvent() {
    const now = Date.now();
    return events.filter((e) => e.start.getTime() > now && seatsLeft(e) > 0).sort((a, b) => a.start - b.start)[0] || events[0];
  }

  function tick() {
    const now = Date.now();
    $$('[data-countdown]').forEach((el) => {
      const diff = Number(el.dataset.countdown) - now;
      if (diff <= 0) { el.textContent = 'Started'; return; }
      const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60;
      el.textContent = d > 0 ? `Starts in ${d}d ${h}h ${m}m` : `Starts in ${h}h ${m}m`;
    });
    const ne = nextEvent();
    const diff = Math.max(0, ne.start.getTime() - now);
    $('#tDays').textContent = pad(Math.floor(diff / 864e5));
    $('#tHours').textContent = pad(Math.floor(diff / 36e5) % 24);
    $('#tMins').textContent = pad(Math.floor(diff / 6e4) % 60);
    $('#tSecs').textContent = pad(Math.floor(diff / 1e3) % 60);
  }

  function renderHero() {
    const ne = nextEvent();
    $('#nextTitle').textContent = ne.title;
    $('#nextMeta').textContent = `${fmtDate.format(ne.start)} · ${fmtTime.format(ne.start)} · ${ne.venue}`;
    $('#nextBtn').dataset.open = ne.id;
  }

  /* ---------- 5. Modal + registration form ---------- */
  const dlg = $('#eventDialog');
  const form = $('#regForm');
  const fields = {
    name: $('#fName'), email: $('#fEmail'), phone: $('#fPhone'),
    event: $('#fEvent'), tickets: $('#fTickets'), terms: $('#fTerms')
  };
  let lastFocus = null;

  function detailHTML(e) {
    const s = seatsLabel(e);
    return `
      <div class="detail-hero"><img src="${esc(e.image)}" alt="${esc(e.title)} artwork" /></div>
      <div class="detail-content">
        <span class="tag">${esc(e.category)}</span>
        <h2 id="dlgTitle">${esc(e.title)}</h2>
        <p class="muted">${esc(e.description)}</p>
        <div class="info-grid">
          <div class="info"><small>Date</small><b>${fmtDate.format(e.start)}</b></div>
          <div class="info"><small>Time</small><b>${fmtTime.format(e.start)} · ${esc(e.duration)}</b></div>
          <div class="info wide"><small>Venue</small><b>${esc(e.venue)}, ${esc(e.city)}</b></div>
          <div class="info"><small>Price</small><b>${money(e.price)} <span class="muted small">/ ticket</span></b></div>
          <div class="info"><small>Availability</small><b>${s.text}</b></div>
          <div class="info wide"><small>Countdown</small><b data-countdown="${e.start.getTime()}"></b></div>
        </div>
        <ul class="highlights">${e.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      </div>`;
  }

  function fillEventSelect(selectedId) {
    fields.event.innerHTML =
      '<option value="">Choose an event…</option>' +
      [...events].sort((a, b) => a.start - b.start)
        .map((e) => `<option value="${esc(e.id)}" ${e.id === selectedId ? 'selected' : ''} ${seatsLeft(e) === 0 ? 'disabled' : ''}>${esc(e.title)}${seatsLeft(e) === 0 ? ' (sold out)' : ''}</option>`)
        .join('');
  }

  function fillTicketSelect() {
    const e = byId(fields.event.value);
    const max = e ? Math.min(MAX_TICKETS, seatsLeft(e)) : MAX_TICKETS;
    const keep = Math.min(Number(fields.tickets.value) || 1, max || 1);
    fields.tickets.innerHTML = Array.from({ length: Math.max(max, 1) }, (_, i) => `<option value="${i + 1}" ${i + 1 === keep ? 'selected' : ''}>${i + 1}</option>`).join('');
  }

  function updateTotal() {
    const e = byId(fields.event.value);
    const qty = Number(fields.tickets.value) || 1;
    $('#totalPrice').textContent = e ? money(e.price * qty) : '—';
    $('#submitBtn').disabled = e ? seatsLeft(e) === 0 : false;
  }

  function showEventInDialog(id) {
    const e = byId(id);
    state.activeEventId = id;
    $('#dlgDetail').innerHTML = e ? detailHTML(e) : '<div class="detail-content"><h2 id="dlgTitle">Pick an event</h2><p class="muted">Choose an event from the dropdown to see its details.</p></div>';
    tick();
  }

  function resetForm() {
    form.reset();
    $$('.field', form).forEach((f) => f.classList.remove('invalid', 'valid'));
    $$('.error', form).forEach((p) => (p.textContent = ''));
    Object.values(fields).forEach((el) => el.removeAttribute('aria-invalid'));
    form.hidden = false;
    $('#successView').hidden = true;
    $('#submitBtn').classList.remove('loading');
    $('#submitBtn').disabled = false;
  }

  function openEvent(id) {
    if (!byId(id)) return;
    lastFocus = document.activeElement;
    resetForm();
    fillEventSelect(id);
    fillTicketSelect();
    updateTotal();
    showEventInDialog(id);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    dlg.scrollTop = 0;
  }

  function closeDialog() {
    if (dlg.open) dlg.close();
  }

  dlg.addEventListener('close', () => {
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  });
  // click on the backdrop (outside the dialog box) closes it
  dlg.addEventListener('mousedown', (ev) => {
    if (ev.target === dlg) closeDialog();
  });
  $('#dlgClose').addEventListener('click', closeDialog);
  $('#doneBtn').addEventListener('click', closeDialog);

  fields.event.addEventListener('change', () => {
    showEventInDialog(fields.event.value);
    fillTicketSelect();
    updateTotal();
    validateField('event');
  });
  fields.tickets.addEventListener('change', () => { updateTotal(); validateField('tickets'); });

  /* ---------- 6. Validation ---------- */
  const rules = {
    name(v) {
      v = v.trim();
      if (!v) return 'Please enter your full name.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      if (!/^\p{L}[\p{L} .'-]{1,59}$/u.test(v)) return 'Use letters, spaces, . \' or - only (max 60).';
      return '';
    },
    email(v) {
      v = v.trim();
      if (!v) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email, like name@example.com.';
      return '';
    },
    phone(v) {
      const raw = v.trim();
      if (!raw) return 'Please enter your phone number.';
      if (/[^\d\s+()-]/.test(raw)) return 'Phone can only contain digits, spaces, + ( ) and -.';
      const digits = raw.replace(/\D/g, '');
      // 10 digit national number, optionally prefixed by a 1-3 digit country code
      if (digits.length < 10 || digits.length > 13) return 'Enter a valid phone number (10 digits, with optional country code).';
      const national = digits.slice(-10);
      if (digits.length === 10 && !/^[6-9]/.test(national)) return 'Mobile numbers should start with 6, 7, 8 or 9.';
      return '';
    },
    event(v) {
      if (!v) return 'Please select an event.';
      const e = byId(v);
      if (!e) return 'That event is not available.';
      if (seatsLeft(e) === 0) return 'Sorry, this event is sold out.';
      return '';
    },
    tickets(v) {
      const n = Number(v);
      const e = byId(fields.event.value);
      if (!Number.isInteger(n) || n < 1) return 'Choose at least 1 ticket.';
      if (n > MAX_TICKETS) return `You can book up to ${MAX_TICKETS} tickets.`;
      if (e && n > seatsLeft(e)) return `Only ${seatsLeft(e)} seat(s) left.`;
      return '';
    },
    terms(_, el) { return el.checked ? '' : 'Please accept the terms to continue.'; }
  };

  const errorEl = (key) => $('#e' + key[0].toUpperCase() + key.slice(1));

  function setError(key, msg) {
    const el = fields[key];
    const wrap = el.closest('.field');
    errorEl(key).textContent = msg;
    wrap.classList.toggle('invalid', !!msg);
    wrap.classList.toggle('valid', !msg && el.type !== 'checkbox');
    if (msg) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', errorEl(key).id); }
    else el.removeAttribute('aria-invalid');
  }

  function validateField(key) {
    const el = fields[key];
    let msg = rules[key](el.value, el);
    // extra rule: block duplicate registration (same email + event)
    if (!msg && key === 'email' && fields.event.value) {
      const dup = registrations.some((r) => r.eventId === fields.event.value && r.email === el.value.trim().toLowerCase());
      if (dup) msg = 'This email is already registered for the selected event.';
    }
    setError(key, msg);
    return !msg;
  }

  // live validation: on blur first, then on every input once touched
  ['name', 'email', 'phone'].forEach((k) => {
    fields[k].addEventListener('blur', () => validateField(k));
    fields[k].addEventListener('input', () => {
      if (fields[k].closest('.field').classList.contains('invalid')) validateField(k);
    });
  });
  fields.terms.addEventListener('change', () => validateField('terms'));
  fields.event.addEventListener('change', () => { if (fields.email.value) validateField('email'); });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const order = ['name', 'email', 'phone', 'event', 'tickets', 'terms'];
    const results = order.map((k) => [k, validateField(k)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      const el = fields[firstBad[0]];
      el.focus();
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      return;
    }

    // simulate a short network request for better UX feedback
    const btn = $('#submitBtn');
    btn.classList.add('loading');
    btn.disabled = true;
    setTimeout(() => completeRegistration(), 800);
  });

  function makeRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return 'GTR-' + s;
  }

  function completeRegistration() {
    const e = byId(fields.event.value);
    const qty = Number(fields.tickets.value);
    // re-check seats in case another tab changed storage meanwhile
    registrations = loadRegs();
    if (seatsLeft(e) < qty) {
      setError('tickets', `Only ${seatsLeft(e)} seat(s) left.`);
      $('#submitBtn').classList.remove('loading');
      $('#submitBtn').disabled = false;
      fillTicketSelect();
      return;
    }
    const booking = {
      ref: makeRef(),
      eventId: e.id,
      name: fields.name.value.trim().replace(/\s+/g, ' '),
      email: fields.email.value.trim().toLowerCase(),
      phone: fields.phone.value.trim(),
      tickets: qty,
      total: e.price * qty,
      createdAt: new Date().toISOString()
    };
    registrations.push(booking);
    saveRegs(registrations);
    state.lastBooking = booking;

    // show confirmation
    $('#successMsg').textContent = `Thanks, ${booking.name.split(' ')[0]}! A confirmation for ${e.title} has been saved. Keep your reference handy.`;
    $('#successRef').textContent = booking.ref;
    $('#successSummary').innerHTML = [
      ['Event', e.title],
      ['When', `${fmtDate.format(e.start)}, ${fmtTime.format(e.start)}`],
      ['Where', e.venue],
      ['Tickets', `${qty} × ${money(e.price)}`],
      ['Total', money(booking.total)],
      ['Email', booking.email]
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    form.hidden = true;
    $('#successView').hidden = false;
    $('#successView').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('#successView h3').setAttribute('tabindex', '-1');
    $('#successView h3').focus({ preventScroll: true });

    refreshAll();
    toast('Registration confirmed ✔');
  }

  /* add to calendar (.ics download) */
  $('#addCalBtn').addEventListener('click', () => {
    const b = state.lastBooking;
    if (!b) return;
    const e = byId(b.eventId);
    const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = new Date(e.start.getTime() + 3 * 36e5);
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gathr//Events//EN', 'BEGIN:VEVENT',
      `UID:${b.ref}@gathr.local`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(e.start)}`, `DTEND:${z(end)}`,
      `SUMMARY:${e.title}`, `LOCATION:${e.venue}\\, ${e.city}`, `DESCRIPTION:Booking ref ${b.ref} - ${b.tickets} ticket(s)`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `${e.id}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------- My tickets list ---------- */
  function renderTickets() {
    const list = [...registrations].reverse();
    $('#ticketsEmpty').hidden = list.length > 0;
    $('#ticketList').innerHTML = list.map((r) => {
      const e = byId(r.eventId);
      if (!e) return '';
      return `
        <article class="ticket">
          <span class="t-ref">${esc(r.ref)}</span>
          <h3>${esc(e.title)}</h3>
          <div class="meta">
            <span>${ICON.cal} ${fmtDate.format(e.start)} · ${fmtTime.format(e.start)}</span>
            <span>${ICON.pin} ${esc(e.venue)}</span>
          </div>
          <div class="muted small">${esc(r.name)} · ${r.tickets} ticket${r.tickets > 1 ? 's' : ''} · ${money(r.total)}</div>
          <div class="row">
            ${countdownHTML(e)}
            <button type="button" class="link-btn" data-cancel="${esc(r.ref)}">Cancel registration</button>
          </div>
        </article>`;
    }).join('');
    tick();
  }

  $('#ticketList').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-cancel]');
    if (!btn) return;
    // two-step confirmation without using blocking confirm() dialogs
    if (btn.dataset.armed !== '1') {
      btn.dataset.armed = '1';
      btn.textContent = 'Click again to confirm';
      setTimeout(() => { if (btn.isConnected) { btn.dataset.armed = ''; btn.textContent = 'Cancel registration'; } }, 3000);
      return;
    }
    registrations = registrations.filter((r) => r.ref !== btn.dataset.cancel);
    saveRegs(registrations);
    refreshAll();
    toast('Registration cancelled');
  });

  /* ---------- 8. Theme, nav, reveal, toast, init ---------- */
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
    $('#themeToggle').setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    $('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0e0f1d' : '#5b4bff');
  }
  $('#themeToggle').addEventListener('click', () => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  const menuBtn = $('#menuBtn'), nav = $('#nav');
  function toggleMenu(open) {
    const next = open ?? !nav.classList.contains('open');
    nav.classList.toggle('open', next);
    menuBtn.setAttribute('aria-expanded', String(next));
    menuBtn.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', () => toggleMenu());
  nav.addEventListener('click', (ev) => { if (ev.target.closest('a')) toggleMenu(false); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') toggleMenu(false); });

  const header = $('#siteHeader');
  const sections = $$('main section[id]');
  const links = $$('.nav a');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
    const y = window.scrollY + 120;
    let current = sections[0].id;
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1].id;
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  let io;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach((el) => el.classList.add('in')); return; }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.reveal:not(.in)').forEach((el) => io.observe(el));
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // delegated clicks: open event dialog from any [data-open] button
  document.addEventListener('click', (ev) => {
    const opener = ev.target.closest('[data-open]');
    if (opener) openEvent(opener.dataset.open);
  });

  // filters
  $('#chips').addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-cat]');
    if (!chip) return;
    state.category = chip.dataset.cat;
    $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    renderEvents();
  });
  let searchTimer;
  $('#searchInput').addEventListener('input', (ev) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.query = ev.target.value; renderEvents(); }, 150);
  });
  $('#sortSelect').addEventListener('change', (ev) => { state.sort = ev.target.value; renderEvents(); });
  $('#resetFilters').addEventListener('click', () => {
    state.query = ''; state.category = 'All'; state.sort = 'date';
    $('#searchInput').value = ''; $('#sortSelect').value = 'date';
    renderChips(); renderEvents();
  });

  // keep several tabs in sync
  window.addEventListener('storage', (ev) => {
    if (ev.key === REG_KEY) { registrations = loadRegs(); refreshAll(); }
  });

  // init
  setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  renderChips();
  renderHero();
  refreshAll();
  observeReveals();
  onScroll();
  setInterval(tick, 1000);
})();

/* Key Plus - phone menu, card tilt, contact form */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;

  /* ---------- phone menu ---------- */
  var lastOpener = null;
  function openMenu(btn) {
    var root = btn.closest('.v-tel, .v-desk') || document;
    var menu = root.querySelector('[data-menu]');
    if (!menu) return;
    lastOpener = btn;
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    var close = menu.querySelector('[data-menu-close]');
    if (close) close.focus();
  }
  function closeMenus() {
    var open = document.querySelectorAll('[data-menu]:not([hidden])');
    if (!open.length) return;
    open.forEach(function (m) { m.hidden = true; });
    document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    document.documentElement.style.overflow = '';
    if (lastOpener && lastOpener.offsetParent) lastOpener.focus();
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-menu-open]');
    if (o) { openMenu(o); return; }
    if (e.target.closest('[data-menu-close]')) closeMenus();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 760) closeMenus(); });

  /* ---------- 3D tilt on photographs (mouse only) ---------- */
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function tilt(el) {
    if (!fine || el._kpTilt) return;
    el._kpTilt = true;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((x - 0.5) * 7).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((0.5 - y) * 7).toFixed(2) + 'deg');
    });
    el.addEventListener('mouseleave', function () {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }
  window.KPTilt = tilt;
  document.querySelectorAll('[data-tilt]').forEach(tilt);

  /* ---------- contact form ----------
     data-endpoint empty: opens the visitor's email app with the message filled in.
     data-endpoint set (e.g. https://formspree.io/f/xxxx): sends the form there directly. */
  function fieldsText(form) {
    var lines = [];
    form.querySelectorAll('input, textarea').forEach(function (f) {
      if (!f.name || f.type === 'checkbox' || f.type === 'submit') return;
      var label = f.closest('label');
      var name = label && label.firstChild ? label.firstChild.textContent.trim() : f.name;
      lines.push(name + ': ' + f.value);
    });
    return lines.join('\n\n');
  }
  function done(form, btn) {
    btn.textContent = form.getAttribute('data-sent');
    btn.disabled = true;
  }
  document.querySelectorAll('[data-kp-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      var mailto = function () {
        var subject = EN ? 'Website enquiry' : 'Upit sa sajta';
        window.location.href = 'mailto:' + form.getAttribute('data-mailto') +
          '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(fieldsText(form));
        done(form, btn);
      };
      if (!/^https:\/\//.test(endpoint)) { mailto(); return; }
      btn.disabled = true;
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); done(form, btn); })
        .catch(function () { btn.disabled = false; mailto(); });
    });
  });
})();

/* Key Plus - project gallery: room filters, asymmetric grid, lightbox */
(function () {
  'use strict';
  var G = window.KP_GALLERY;
  if (!G) return;

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };
  var fill = function (tpl, prefix, obj) {
    return tpl.replace(/\{\{(\w+)\.?(\w*)\}\}/g, function (m, a, k) {
      if (prefix && a === prefix && k in obj) return esc(obj[k]);
      if (!prefix && !k && a in obj) return esc(obj[a]);
      return m;
    });
  };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- lightbox (shared by both layouts) ---------- */
  var lbTpl = document.querySelector('template[data-tpl="lightbox"]');
  var lb = { list: [], i: null, zf: false, el: null, opener: null };
  function lbRender() {
    if (lb.el) { lb.el.remove(); lb.el = null; }
    if (lb.i === null || !lbTpl) { document.documentElement.style.overflow = ''; return; }
    var cur = lb.list[lb.i];
    var html = fill(lbTpl.innerHTML, null, {
      lbCount: pad(lb.i + 1) + ' / ' + pad(lb.list.length),
      lbSrc: G.base + cur.id,
      lbAlt: cur.alt,
      lbCap: G.P[cur.p] + ' · ' + cur.room,
      lbAnim: lb.zf ? 'kp-zoom-b' : 'kp-zoom-a'
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    lb.el = wrap.firstElementChild;
    document.body.appendChild(lb.el);
    document.documentElement.style.overflow = 'hidden';
    var close = lb.el.querySelector('[data-lb="close"]');
    if (close) close.focus();
  }
  function lbGo(d) {
    var n = lb.list.length;
    lb.i = ((lb.i + d) % n + n) % n;
    lb.zf = !lb.zf;
    lbRender();
  }
  function lbClose() {
    lb.i = null;
    lbRender();
    if (lb.opener && document.body.contains(lb.opener)) lb.opener.focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lb]');
    if (!b || !lb.el || !lb.el.contains(b)) return;
    var a = b.getAttribute('data-lb');
    if (a === 'close') lbClose(); else lbGo(a === 'next' ? 1 : -1);
  });
  document.addEventListener('keydown', function (e) {
    if (lb.i === null) return;
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowRight') lbGo(1);
    else if (e.key === 'ArrowLeft') lbGo(-1);
  });
  var touchX = null;
  document.addEventListener('touchstart', function (e) { if (lb.el) touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!lb.el || touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) lbGo(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------- one gallery per layout ---------- */
  var spanOf = function (ph) { var r = ph.w / ph.h; return r > 1.2 ? 7 : (r > 0.97 ? 5 : 4); };

  function deskCells(list) {
    var cells = [], i = 0, row = 0;
    while (i < list.length) {
      var rowItems = [], sum = 0;
      while (i < list.length && sum + spanOf(list[i]) <= 12) { sum += spanOf(list[i]); rowItems.push(i); i++; }
      if (rowItems.length === 1) {
        var s1 = spanOf(list[rowItems[0]]) + 2;
        cells[rowItems[0]] = { start: row % 2 === 0 ? 1 : 13 - s1, span: s1, top: '0' };
      } else {
        /* rows take turns: edges / right inset / larger photos pushed right */
        var n = rowItems.length, left = 12 - sum, v = row % 3;
        var grow = (v === 2 && left >= n) ? 1 : 0;
        left -= grow * n;
        var tail = v === 1 ? Math.min(2, left) : 0;
        var col = 1 + (v === 2 ? left : 0);
        rowItems.forEach(function (idx, k) {
          var sp = spanOf(list[idx]) + grow;
          var start = k === n - 1 ? 13 - sp - tail : col;
          var offset = (k % 2 === (row % 2 === 0 ? 1 : 0)) ? 'clamp(40px, 7vw, 120px)' : '0';
          cells[idx] = { start: start, span: sp, top: offset };
          col = start + sp;
        });
      }
      row++;
    }
    return cells;
  }

  function chipStyle(desk, sel) {
    return (desk
      ? 'min-height: 44px; padding: 0 22px; border-radius: 999px; font: inherit; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; '
      : 'min-height: 44px; padding: 0 18px; border-radius: 999px; font: inherit; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; cursor: pointer; ') +
      'border: 1px solid ' + (sel ? '#1c1a17' : '#bfbbb0') + '; background: ' + (sel ? '#1c1a17' : '#ffffff') + '; color: ' + (sel ? '#ffffff' : '#1c1a17');
  }

  document.querySelectorAll('.v-desk, .v-tel').forEach(function (root) {
    var itemTpl = root.querySelector('template[data-tpl="item"]');
    var filterTpl = root.querySelector('template[data-tpl="filter"]');
    if (!itemTpl || !filterTpl) return;
    var desk = root.classList.contains('v-desk');
    var state = { cat: 'all', flip: false };

    function render() {
      var list = G.photos.filter(function (ph) { return state.cat === 'all' || ph.cat === state.cat; });
      
      var enter = state.flip ? 'kp-in-b' : 'kp-in-a';

      root.querySelectorAll('[data-gen]').forEach(function (n) { n.remove(); });

      var fHtml = G.cats.map(function (c) {
        var sel = c.id === state.cat;
        return fill(filterTpl.innerHTML, 'f', { id: c.id, label: c.label, pressed: sel ? 'true' : 'false', style: chipStyle(desk, sel) });
      }).join('');
      filterTpl.insertAdjacentHTML('beforebegin', fHtml);

      var iHtml = list.map(function (ph, j) {
        var pat = desk
          ? [['1 / span 7', '4 / 3'], ['9 / span 4', '4 / 5'], ['1 / span 4', '4 / 5'], ['5 / span 4', '4 / 5'], ['9 / span 4', '4 / 5'], ['1 / span 4', '4 / 5'], ['6 / span 7', '4 / 3']]
          : [['span 1', '4 / 5', '0'], ['span 1', '4 / 5', '56px']];
        var q = pat[j % pat.length];
        var cell = 'grid-column: ' + q[0] + (q[2] ? '; margin-top: ' + q[2] : '');
        return fill(itemTpl.innerHTML, 'p', {
          idx: j,
          num: pad(j + 1),
          project: G.P[ph.p],
          room: ph.room,
          src: G.base + ph.id,
          alt: ph.alt,
          label: G.label + ph.alt,
          cell: cell,
          enter: enter,
          delay: 'display: flex; flex-direction: column; gap: ' + (desk ? 18 : 10) + 'px; animation-delay: ' + (Math.min(j, desk ? 8 : 6) * 0.07).toFixed(2) + 's',
          ratio: 'aspect-ratio: ' + q[1] + '; background: #bfbbb0'
        });
      }).join('');
      itemTpl.insertAdjacentHTML('beforebegin', iHtml);

      root.querySelectorAll('[data-count]').forEach(function (n) { n.textContent = list.length; });
      if (window.KPTilt) root.querySelectorAll('[data-gen] [data-tilt]').forEach(window.KPTilt);
      root._list = list;
    }

    root.addEventListener('click', function (e) {
      var pick = e.target.closest('[data-pick]');
      if (pick && root.contains(pick)) {
        state.cat = pick.getAttribute('data-pick');
        state.flip = !state.flip;
        render();
        var again = root.querySelector('[data-pick="' + state.cat + '"]');
        if (again) again.focus();
        return;
      }
      var open = e.target.closest('[data-open]');
      if (open && root.contains(open)) {
        lb.list = root._list;
        lb.i = +open.getAttribute('data-open');
        lb.zf = !lb.zf;
        lb.opener = open;
        lbRender();
      }
    });

    render();
  });
})();

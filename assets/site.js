/* John Zwiers portfolio, round 1 */
(function () {
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll reveal */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rvs.forEach(function (el) { io.observe(el); });
  } else { rvs.forEach(function (el) { el.classList.add('in'); }); }

  /* main nav: a sliding pill that follows the current page, Contact when the contact section is in view */
  var seg = document.querySelector('.seg');
  if (seg) {
    var ind = seg.querySelector('.ind'), navLinks = [].slice.call(seg.querySelectorAll('a'));
    var contactSec = document.getElementById('contact'), current = seg.querySelector('a.on');
    function place(a) {
      if (!a) { ind.style.opacity = 0; return; }
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
      ind.style.opacity = '';
    }
    function setOn(a) {
      navLinks.forEach(function (l) { l.classList.toggle('on', l === a); if (l === a) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current'); });
      current = a; place(a);
    }
    /* coming from another page: start the pill where it was, then slide it over */
    var prev = null;
    try { prev = sessionStorage.getItem('jz-nav'); sessionStorage.removeItem('jz-nav'); } catch (e) {}
    if (prev !== null && navLinks[+prev] && navLinks[+prev] !== current && !reduce) {
      ind.style.transition = 'none'; place(navLinks[+prev]);
      void ind.offsetWidth; ind.style.transition = '';
      requestAnimationFrame(function () { requestAnimationFrame(function () { place(current); }); });
    } else { place(current); }
    requestAnimationFrame(function () { seg.classList.add('ready'); });
    navLinks.forEach(function (l, i) {
      l.addEventListener('click', function () { try { sessionStorage.setItem('jz-nav', String(navLinks.indexOf(current))); } catch (e) {} place(l); });
    });
    window.addEventListener('resize', function () { place(current); });
    if (contactSec) {
      var aboutLink = navLinks[1], contactLink = seg.querySelector('[data-contact]');
      var spy = function () {
        var want = contactSec.getBoundingClientRect().top < window.innerHeight * 0.6 || window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 ? contactLink : aboutLink;
        if (want !== current) setOn(want);
      };
      window.addEventListener('scroll', spy, { passive: true }); spy();
      contactLink.addEventListener('click', function (e) { e.preventDefault(); setOn(contactLink); contactSec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', '#contact'); });
      aboutLink.addEventListener('click', function (e) { e.preventDefault(); setOn(aboutLink); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', location.pathname); });
    }
  }

  /* header progress + sticky table of contents */
  var hdr = document.querySelector('.hdr');
  var toc = document.querySelector('.toc');
  var links = toc ? Array.prototype.slice.call(toc.querySelectorAll('ol a[href^="#"]')).filter(function (a) { return a.getAttribute('href').length > 1; }) : [];
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var caseEl = document.querySelector('.case main');
  var meter = toc ? toc.querySelector('.meter b') : null;
  var stepLinks = Array.prototype.slice.call(document.querySelectorAll('.steps-nav a'));
  var steps = stepLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (hdr) hdr.style.setProperty('--sp', max > 0 ? Math.min(1, y / max) : 0);
    if (caseEl && toc) {
      var r = caseEl.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * 0.35 - r.top) / (r.height - vh * 0.35)));
      toc.style.setProperty('--tp', p.toFixed(4));
      var cur = -1;
      secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * 0.38) cur = i; });
      links.forEach(function (a, i) {
        a.classList.toggle('on', i === cur);
        a.classList.toggle('done', i < cur);
        if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (meter) meter.textContent = Math.round(p * 100) + '%';
      if (cur > -1 && window.innerWidth <= 900 && links[cur] && links[cur]._last !== true) {
        links.forEach(function (a) { a._last = false; });
        links[cur]._last = true;
        var bar = toc, a = links[cur];
        bar.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    if (steps.length) {
      var line = vh * 0.4, sc = -1;
      steps.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var f = Math.max(0, Math.min(1, (line - r.top) / r.height));
        stepLinks[i].style.setProperty('--f', f.toFixed(3));
        if (r.top < line) sc = i;
      });
      stepLinks.forEach(function (a, i) {
        a.classList.toggle('on', i === sc);
        a.classList.toggle('done', i < sc);
        if (i === sc) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
      var nav = stepLinks[0].parentNode;
      if (hdr) {
        var nr = nav.getBoundingClientRect(), pr = nav.parentNode.getBoundingClientRect();
        var on = nr.top <= hdr.offsetHeight + 60 && pr.bottom > hdr.offsetHeight + nr.height;
        hdr.classList.toggle('steps-on', on);
        document.body.classList.toggle('steps-on-page', on);
      }
      if (sc > -1 && nav._cur !== sc) {
        nav._cur = sc;
        var a = stepLinks[sc];
        if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* carousels: buttons, progress bar, drag to scroll */
  document.querySelectorAll('[data-car]').forEach(function (car) {
    var id = car.getAttribute('data-car');
    var prev = document.querySelector('[data-prev="' + id + '"]');
    var next = document.querySelector('[data-next="' + id + '"]');
    var bar = document.querySelector('[data-bar="' + id + '"] span');
    function upd() {
      var m = car.scrollWidth - car.clientWidth;
      var f = m > 0 ? car.scrollLeft / m : 0;
      if (bar) {
        var w = Math.max(0.12, car.clientWidth / car.scrollWidth);
        bar.style.width = (w * 100) + '%';
        bar.style.transform = 'translateX(' + (f * (1 / w - 1) * 100) + '%)';
      }
      if (prev) prev.disabled = car.scrollLeft < 4;
      if (next) next.disabled = car.scrollLeft > m - 4;
    }
    function go(d) { car.scrollBy({ left: d * car.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    car.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    /* drag with a mouse; touch scrolls natively */
    var down = false, sx = 0, sl = 0, moved = false;
    car.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = car.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; car.classList.add('dragging'); }
      if (moved) car.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) {
        car.classList.remove('dragging');
        car.addEventListener('click', function stop(ev) { ev.stopPropagation(); ev.preventDefault(); car.removeEventListener('click', stop, true); }, true);
      }
    });
  });

  /* lightbox: every .ph on the page, in order */
  var phs = Array.prototype.slice.call(document.querySelectorAll('.ph[data-full]'));
  var lb = document.querySelector('.lb');
  if (lb && phs.length) {
    var img = lb.querySelector('.lb-mid img'), t = lb.querySelector('.lb-cap b'), n = lb.querySelector('.lb-cap p'), pos = lb.querySelector('.lb-pos');
    var idx = 0, last = null;
    function show(i) {
      idx = (i + phs.length) % phs.length;
      var b = phs[idx];
      img.classList.remove('pop'); void img.offsetWidth; img.classList.add('pop');
      img.src = b.getAttribute('data-full');
      img.alt = b.getAttribute('data-title') || '';
      t.textContent = b.getAttribute('data-title') || '';
      n.textContent = b.getAttribute('data-note') || '';
      pos.textContent = (idx + 1) + ' / ' + phs.length;
    }
    function open(i) { last = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-x').focus(); }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
    phs.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb-x').addEventListener('click', close);
    lb.querySelector('.lb-p').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-n').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-mid')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    var tx = 0;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1)); });
  }

  /* video: play button, and loops that only play on screen */
  document.querySelectorAll('.vplayer').forEach(function (f) {
    var v = f.querySelector('video'), b = f.querySelector('.vplay');
    b.addEventListener('click', function () { v.controls = true; f.classList.add('playing'); v.play(); });
    v.addEventListener('ended', function () { f.classList.remove('playing'); v.controls = false; v.currentTime = 0; });
  });
  var loops = document.querySelectorAll('video[data-autoplay]');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !reduce && !v._paused) { v.preload = 'auto'; v.play().catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    loops.forEach(function (v) { vio.observe(v); });
  }
  var PLAY = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>', PAUSE = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>';
  loops.forEach(function (v) {
    var t = v.parentNode.querySelector('.vtoggle'); if (!t) return;
    if (reduce) { v._paused = true; t.innerHTML = PLAY; t.setAttribute('aria-label', 'Play'); }
    t.addEventListener('click', function () {
      if (v.paused) { v._paused = false; v.play(); t.innerHTML = PAUSE; t.setAttribute('aria-label', 'Pause'); }
      else { v._paused = true; v.pause(); t.innerHTML = PLAY; t.setAttribute('aria-label', 'Play'); }
    });
  });

  /* copy email */
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy'), lbl = b.textContent;
      function done() { b.textContent = 'Copied ✓'; b.classList.add('done'); setTimeout(function () { b.textContent = lbl; b.classList.remove('done'); }, 1800); }
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { window.location.href = 'mailto:' + t; });
      else window.location.href = 'mailto:' + t;
    });
  });

  /* home: preview video on hover */
  document.querySelectorAll('.card .hv').forEach(function (v) {
    var c = v.closest('.card');
    if (reduce || !window.matchMedia('(hover: hover)').matches) return;
    c.addEventListener('mouseenter', function () { v.preload = 'auto'; v.currentTime = 0; v.play().then(function () { v.classList.add('on'); }).catch(function () {}); });
    c.addEventListener('mouseleave', function () { v.classList.remove('on'); v.pause(); });
  });

  /* home: filters */
  var fbtns = document.querySelectorAll('.filters button');
  var cards = document.querySelectorAll('.cards .card');
  var wh = document.querySelector('[data-h-all]'), more = document.querySelector('.more-work');
  var NW = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen'];
  function filt(f) {
    fbtns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-f') === f); b.setAttribute('aria-pressed', b.getAttribute('data-f') === f); });
    var n = 0;
    cards.forEach(function (c) {
      var show = f === 'all' ? !c.hasAttribute('data-more') : (' ' + c.getAttribute('data-k') + ' ').indexOf(' ' + f + ' ') > -1;
      c.classList.toggle('hide', !show);
      c.classList.remove('in'); if (show) { n++; void c.offsetWidth; c.classList.add('in'); }
    });
    if (more) more.classList.toggle('gone', f !== 'all');
    if (wh) {
      var b = document.querySelector('.filters button[data-f="' + f + '"]');
      var label = b ? b.firstChild.textContent : '';
      wh.textContent = f === 'all' ? wh.getAttribute('data-h-all') : label + ': ' + (NW[n] || n).toLowerCase() + (n === 1 ? ' project.' : ' projects.');
    }
    var first = true;
    cards.forEach(function (c) { c.classList.remove('lead'); });
    cards.forEach(function (c) { if (first && !c.classList.contains('hide') && c.hasAttribute('data-lead')) { c.classList.add('lead'); } if (!c.classList.contains('hide')) first = false; });
  }
  fbtns.forEach(function (b) { b.addEventListener('click', function () { filt(b.getAttribute('data-f')); }); });
  document.querySelectorAll('[data-skill]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var f = a.getAttribute('data-skill');
      if (document.querySelector('.filters button[data-f="' + f + '"]')) { filt(f); }
    });
  });

  /* home: index hover preview */
  var peek = document.querySelector('.peek');
  if (peek) {
    var pim = peek.querySelector('img');
    document.querySelectorAll('.index a').forEach(function (a) {
      a.addEventListener('mouseenter', function () { pim.src = a.getAttribute('data-img'); peek.classList.add('on'); });
      a.addEventListener('mouseleave', function () { peek.classList.remove('on'); });
      a.addEventListener('mousemove', function (e) { peek.style.left = e.clientX + 'px'; peek.style.top = e.clientY + 'px'; });
    });
  }
})();

/* follow the device's light/dark setting, and fade between them */
(function () {
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (!mq) return;
  var root = document.documentElement;
  function set(dark) { root.setAttribute('data-theme', dark ? 'dark' : 'light'); }
  set(mq.matches);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function change(e) {
    if (reduce) { set(e.matches); return; }
    if (document.startViewTransition) { document.startViewTransition(function () { set(e.matches); }); return; }
    root.classList.add('theming'); set(e.matches);
    setTimeout(function () { root.classList.remove('theming'); }, 1000);
  }
  if (mq.addEventListener) mq.addEventListener('change', change); else if (mq.addListener) mq.addListener(change);
})();

/* pause buttons for the moving strips */
(function () {
  var PLAY = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>';
  document.querySelectorAll('.mq-toggle').forEach(function (b) {
    var w = b.closest('.mq-wrap'), what = b.getAttribute('aria-label').replace('Pause ', '');
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var p = w.classList.toggle('paused');
      b.innerHTML = p ? PLAY : PAUSE;
      b.setAttribute('aria-pressed', p ? 'true' : 'false');
      b.setAttribute('aria-label', (p ? 'Play ' : 'Pause ') + what);
    });
  });
})();

/* No one-word last lines: the build glues the last two words of every text block
   with a no-break space. If a glued pair is ever too wide for its line (very large
   headings on a very narrow screen), loosen that one join so nothing is cut off. */
(function () {
  var SEL = 'p,li,figcaption,blockquote,dd,dt,td,th,.cap,.lede,div,span,a,small,b';
  var NB = ' ';
  function lastGlue(el) {
    var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, hit = null;
    while ((n = tw.nextNode())) if (n.data.indexOf(NB) > -1) hit = n;
    return hit;
  }
  function overflows(el) {
    var box = el.getBoundingClientRect(), lim = box.right + 1;
    var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, r = document.createRange();
    while ((n = tw.nextNode())) {
      r.selectNodeContents(n);
      var rs = r.getClientRects();
      for (var i = 0; i < rs.length; i++) if (rs[i].right > lim) return true;
    }
    return false;
  }
  var loosened = [];
  function run() {
    loosened.forEach(function (x) { x.node.data = x.data; });
    loosened = [];
    document.querySelectorAll(SEL).forEach(function (el) {
      if (!el.offsetParent || el.querySelector('p,div,li,h1,h2,h3,h4')) return;
      var n = lastGlue(el);
      if (!n || !overflows(el)) return;
      var d = n.data, i = d.lastIndexOf(NB);
      loosened.push({ node: n, data: d });
      n.data = d.slice(0, i) + ' ' + d.slice(i + 1);
    });
  }
  var t;
  function soon() { clearTimeout(t); t = setTimeout(run, 120); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else window.addEventListener('load', run);
  window.addEventListener('resize', soon);
})();

/* Headings and short labels: glue their last two words only where the pair fits
   on one line, measured on this screen, so a big heading never runs off the edge. */
(function () {
  var SEL = 'h1,h2,h3,h4,.h2,.h3,.steps-nav a b,.nx .t';
  var NB = ' ', glued = [];
  function texts(el) {
    var a = [], tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = tw.nextNode())) a.push(n);
    return a;
  }
  function lastJoin(el) {
    var ts = texts(el), sawWord = false, wordEnd = null;
    for (var t = ts.length - 1; t >= 0; t--) {
      var d = ts[t].data;
      for (var i = d.length - 1; i >= 0; i--) {
        var c = d[i];
        if (c === NB) { if (sawWord) return null; continue; }
        if (/\s/.test(c)) { if (sawWord) return { node: ts[t], i: i, end: wordEnd }; continue; }
        if (!sawWord) { sawWord = true; wordEnd = { node: ts[t], i: i + 1 }; }
      }
    }
    return null;
  }
  function pairWidth(j) {
    // start of the word before the space
    var n = j.node, k = j.i - 1, d = n.data;
    while (k > 0 && !/\s/.test(d[k - 1])) k--;
    var r = document.createRange();
    r.setStart(n, Math.max(k, 0)); r.setEnd(j.end.node, j.end.i);
    var rs = r.getClientRects(), w = 0, top = null, same = true;
    for (var x = 0; x < rs.length; x++) { if (!rs[x].width) continue; w += rs[x].width; if (top === null) top = rs[x].top; else if (Math.abs(rs[x].top - top) > 4) same = false; }
    if (same) { var b = r.getBoundingClientRect(); w = b.width; }
    return w;
  }
  function room(el) {
    var cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }
  function run() {
    glued.forEach(function (g) { g.node.data = g.node.data.slice(0, g.i) + ' ' + g.node.data.slice(g.i + 1); });
    glued = [];
    var todo = [];
    document.querySelectorAll(SEL).forEach(function (el) {
      if (!el.offsetParent || el.querySelector('p,div,li')) return;
      var j = lastJoin(el);
      if (j && pairWidth(j) <= room(el) - 2) todo.push(j);
    });
    todo.forEach(function (j) {
      var d = j.node.data; j.node.data = d.slice(0, j.i) + NB + d.slice(j.i + 1); glued.push(j);
    });
  }
  var t, w0 = window.innerWidth;
  function soon() { if (window.innerWidth === w0) return; w0 = window.innerWidth; clearTimeout(t); t = setTimeout(run, 150); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else window.addEventListener('load', run);
  window.addEventListener('resize', soon);
})();

/* trailer scene bar: click a scene to play the trailer from there */
(function () {
  var bar = document.querySelector('[data-tbar]'); if (!bar) return;
  var f = document.querySelector('.vplayer'); if (!f) return;
  var v = f.querySelector('video');
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.tseg'); if (!b) return;
    var t = parseFloat(b.getAttribute('data-t')) || 0;
    v.controls = true; f.classList.add('playing');
    var go = function () { try { v.currentTime = t; } catch (x) {} v.play().catch(function () {}); };
    if (v.readyState >= 1) go(); else { v.preload = 'auto'; v.addEventListener('loadedmetadata', go, { once: true }); v.load(); }
    f.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  });
})();

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
  loops.forEach(function (v) {
    var t = v.parentNode.querySelector('.vtoggle');
    if (reduce) { v._paused = true; t.textContent = '▶'; t.setAttribute('aria-label', 'Play'); }
    t.addEventListener('click', function () {
      if (v.paused) { v._paused = false; v.play(); t.textContent = '❚❚'; t.setAttribute('aria-label', 'Pause'); }
      else { v._paused = true; v.pause(); t.textContent = '▶'; t.setAttribute('aria-label', 'Play'); }
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
  function filt(f) {
    fbtns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-f') === f); b.setAttribute('aria-pressed', b.getAttribute('data-f') === f); });
    cards.forEach(function (c) {
      var show = f === 'all' || (' ' + c.getAttribute('data-k') + ' ').indexOf(' ' + f + ' ') > -1;
      c.classList.toggle('hide', !show);
    });
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

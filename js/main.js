/* Laboratoire Axiome — interactions */
(function () {
  'use strict';
  var CONTACT_EMAIL = 'contact@labo-axiome.org';
  var AXES = [
    { t: 'Biomarqueurs du diabète et des maladies cardio-vasculaires', d: 'Identifier des marqueurs sanguins précoces pour mieux prévenir les complications chez les patients à risque.' },
    { t: 'Résistance bactérienne aux antibiotiques', d: 'Surveiller l’évolution des résistances dans les hôpitaux de la région et évaluer de nouvelles associations thérapeutiques.' },
    { t: 'Génomique des maladies rares', d: 'Séquençage et analyse bio-informatique pour accélérer le diagnostic des maladies génétiques rares.' }
  ];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#year').textContent = new Date().getFullYear();

  /* menu */
  var nav = $('#nav'), burger = $('.burger'), header = $('.header');
  function setMenu(o) { nav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu'); }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.header')) setMenu(false); });
  var links = $$('.nav a[href^="#"]:not(.btn)'), top = $('.to-top');
  function onScroll() {
    header.classList.toggle('is-scrolled', scrollY > 10); top.classList.toggle('is-on', scrollY > 800);
    var cur = null; links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s && s.getBoundingClientRect().top < 140) cur = a; });
    links.forEach(function (a) { a.classList.toggle('is-active', a === cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* molécules animées (réseau de points reliés) */
  var cv = $('#molecules'), ctx = cv.getContext('2d'), pts = [], W, H, mouse = { x: -999, y: -999 }, running = false;
  function size() {
    var d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.round(Math.min(70, W * H / 16000)); pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.5 + Math.random() * 2.5, c: Math.random() < .15 ? '#fbbf24' : '#14b8a6' });
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      var dx = p.x - mouse.x, dy = p.y - mouse.y, dm = dx * dx + dy * dy;
      if (dm < 14000) { p.x += dx / 60; p.y += dy / 60; }
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, d = ex * ex + ey * ey;
        if (d < 12000) { ctx.strokeStyle = 'rgba(15,118,110,' + (0.18 * (1 - d / 12000)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      ctx.fillStyle = p.c; ctx.globalAlpha = .55; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
    }
    if (running) requestAnimationFrame(frame);
  }
  size(); addEventListener('resize', size);
  var hero = $('.hero');
  hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  if (reduce) frame();
  else new IntersectionObserver(function (en) { var v = en[0].isIntersecting; if (v && !running) { running = true; frame(); } else if (!v) running = false; }).observe(hero);

  /* hélice d'ADN */
  var g = $('#helix'), dots = [];
  if (g) {
    var s = '';
    for (var k = 0; k < 14; k++) { var y = 8 + k * 15; s += '<line x1="0" y1="' + y + '" x2="0" y2="' + y + '"/><circle class="a" r="4" cy="' + y + '"/><circle class="b" r="4" cy="' + y + '"/>'; }
    g.innerHTML = s;
    var lines = $$('line', g), as = $$('.a', g), bs = $$('.b', g), t0 = performance.now();
    (function spin(now) {
      var t = (now - t0) / 1000;
      for (var k = 0; k < as.length; k++) {
        var ph = t * 1.6 + k * .45, x1 = 30 + Math.sin(ph) * 22, x2 = 30 - Math.sin(ph) * 22, z = Math.cos(ph);
        as[k].setAttribute('cx', x1); bs[k].setAttribute('cx', x2);
        as[k].setAttribute('r', 3 + z * 1.4); bs[k].setAttribute('r', 3 - z * 1.4);
        lines[k].setAttribute('x1', x1); lines[k].setAttribute('x2', x2);
      }
      if (!reduce) requestAnimationFrame(spin);
    })(t0);
  }

  /* recherche d'analyses */
  var cards = $$('.an'), empty = $('#anEmpty');
  $('#finder').addEventListener('input', function (e) {
    var q = e.target.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), n = 0;
    cards.forEach(function (c) {
      var hay = (c.textContent + ' ' + c.getAttribute('data-k')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      var hit = !q || hay.indexOf(q) > -1; c.hidden = !hit; c.classList.toggle('is-hit', !!q && hit); if (hit) n++;
    });
    empty.hidden = n > 0;
  });

  /* axes de recherche */
  var panel = $('#axePanel');
  function axe(i) {
    $$('.axes button').forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
    panel.innerHTML = '<h3>' + AXES[i].t + '</h3><p>' + AXES[i].d + '</p>';
    panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
  }
  $$('.axes button').forEach(function (b, k) { b.addEventListener('click', function () { axe(k); }); });
  axe(0);

  /* reveal + compteurs */
  function count(el) {
    var target = +el.getAttribute('data-count'), t0 = performance.now(), dur = reduce ? 0 : 1600;
    (function f(now) { var p = dur ? Math.min(1, (now - t0) / dur) : 1; el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('fr-FR'); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  var els = $$('[data-reveal], [data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (!x.isIntersecting) return; if (x.target.hasAttribute('data-count')) count(x.target); else x.target.classList.add('is-in'); io.unobserve(x.target); }); }, { threshold: .15 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { if (el.hasAttribute('data-count')) count(el); else el.classList.add('is-in'); });

  /* formulaire */
  var form = $('#rdv'); form.date.min = new Date().toISOString().slice(0, 10);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = $$('[required]', form).filter(function (i) { return !i.checkValidity(); }), msg = $('.form__msg', form);
    $$('.is-bad', form).forEach(function (i) { i.classList.remove('is-bad'); });
    if (bad.length) { bad.forEach(function (i) { i.classList.add('is-bad'); }); bad[0].focus(); return; }
    msg.textContent = 'Merci ! Votre messagerie va s’ouvrir pour confirmer la demande.';
    location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Rendez-vous — ' + form.type.value + ' — ' + form.date.value) +
      '&body=' + encodeURIComponent(form.nom.value + '\nTél : ' + form.tel.value + '\nDate : ' + form.date.value + ' (' + form.creneau.value + ')\n\n' + form.message.value);
  });
})();

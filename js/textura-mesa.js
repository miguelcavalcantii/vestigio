/* =========================================================
   TEXTURA "MESA DE ANÁLISE": PARTE ANIMADA (biblioteca Motion)
   ---------------------------------------------------------
   A grade parada é só CSS (css/textura-mesa.css). Este arquivo
   coloca por cima, em cada lugar onde a grade aparece:
   1. VARREDURA: uma faixa suave que atravessa a área devagar,
      de tempos em tempos, "lendo" a grade.
   2. RASTRO: 4 ou 5 pontos que acendem em sequência na
      diagonal, crescendo (como o símbolo da marca), e somem.
   3. CONEXÃO: às vezes, uma linha fina se desenha ligando dois
      pontos da grade, como uma conexão encontrada.

   - Os pontos caem sempre nos cruzamentos da grade (a cada 24px).
   - Só anima com a área na tela e com a aba visível.
   - Segue o interruptor CONFIG.animacoesSempre (js/config.js):
     com ele em false E o sistema pedindo "reduzir movimento",
     fica só a grade parada.
   ========================================================= */

(function () {
  'use strict';

  if (typeof Motion === 'undefined') return;
  if (typeof reduzirMovimento === 'function' && reduzirMovimento()) return;

  var animate = Motion.animate;
  var inView = Motion.inView;
  var EASE_OUT = [0.23, 1, 0.32, 1];
  var PASSO = 24;                 // distância entre as linhas da grade (igual ao CSS)
  var SVG = 'http://www.w3.org/2000/svg';

  /* ---------- AJUSTES (tempos em segundos) ---------- */
  var TEMPOS = {
    varredura: { intervalo: [11, 16], duracao: 7 },
    rastro:    { intervalo: [5, 8] },
    conexao:   { intervalo: [7, 11] }
  };

  /* Onde cada lugar mostra a textura (a parte que não some no degradê),
     em porcentagem da largura (x) e da altura (y) */
  var LUGARES = [
    { seletor: '.demo__stage',           x: [22, 78], y: [15, 85] },
    { seletor: '.about',                 x: [6, 94],  y: [4, 40] },
    { seletor: '.cta__core',             x: [55, 96], y: [6, 55] },
    { seletor: '.alerta-destaque__core', x: [55, 96], y: [6, 55] }
  ];

  function sortear(min, max) { return min + Math.random() * (max - min); }
  function inteiro(min, max) { return Math.floor(sortear(min, max + 1)); }

  function forcaViva() {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mesa-vivo-alfa'));
    return isNaN(v) ? 0.8 : v;
  }

  function criar(tag, attrs) {
    var el = document.createElementNS(SVG, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function preparar(host, lugar) {
    var vivo = document.createElement('div');
    vivo.className = 'mesa-vivo';
    vivo.setAttribute('aria-hidden', 'true');
    vivo.innerHTML = '<div class="mesa-vivo__varredura"></div>';
    var svg = criar('svg', { 'class': 'mesa-vivo__svg', focusable: 'false' });
    vivo.appendChild(svg);
    host.insertBefore(vivo, host.firstChild);
    var faixa = vivo.firstChild;

    var visivel = false;
    var relogios = {};

    // Um cruzamento da grade dentro da área visível do lugar
    function cruzamento(margemCelulas) {
      var w = vivo.clientWidth, h = vivo.clientHeight;
      var c0 = Math.ceil(w * lugar.x[0] / 100 / PASSO), c1 = Math.floor(w * lugar.x[1] / 100 / PASSO) - (margemCelulas || 0);
      var l0 = Math.ceil(h * lugar.y[0] / 100 / PASSO), l1 = Math.floor(h * lugar.y[1] / 100 / PASSO) - (margemCelulas || 0);
      if (c1 < c0 || l1 < l0) return null;
      return { c: inteiro(c0, c1), l: inteiro(l0, l1) };
    }
    function px(n) { return n * PASSO + 0.5; }

    /* 1. Varredura */
    function varrer() {
      var w = vivo.clientWidth;
      animate(faixa, { transform: ['translateX(-160px)', 'translateX(' + w + 'px)'] },
        { duration: TEMPOS.varredura.duracao, ease: 'linear' });
      animate(faixa, { opacity: [0, 1, 1, 0] },
        { duration: TEMPOS.varredura.duracao, times: [0, 0.15, 0.85, 1], ease: 'linear' });
    }

    /* 2. Rastro curto em diagonal */
    function rastro() {
      var passos = inteiro(4, 5);
      var p = cruzamento(passos);
      if (!p) return;
      var a = forcaViva();
      var pontos = [];
      for (var i = 0; i < passos; i++) {
        var raio = 1.3 + (i / (passos - 1)) * 2.2;
        var bola = criar('circle', { cx: px(p.c + i), cy: px(p.l + i), r: raio });
        svg.appendChild(bola);
        pontos.push(bola);
      }
      animate(pontos, { opacity: [0, a] }, { duration: 0.35, delay: Motion.stagger(0.18), ease: EASE_OUT });
      setTimeout(function () {
        animate(pontos, { opacity: 0 }, { duration: 1.2, delay: Motion.stagger(0.12) }).finished.then(function () {
          pontos.forEach(function (b) { b.remove(); });
        });
      }, (passos * 0.18 + 1.6) * 1000);
    }

    /* 3. Conexão entre dois pontos */
    function conexao() {
      var p = cruzamento(4);
      if (!p) return;
      var q = { c: p.c + inteiro(2, 4), l: p.l + inteiro(-2, 2) };
      var a = forcaViva();
      var linha = criar('line', { x1: px(p.c), y1: px(p.l), x2: px(q.c), y2: px(q.l), pathLength: 1 });
      linha.style.strokeDasharray = '1';
      linha.style.strokeDashoffset = '1';
      var bolaA = criar('circle', { cx: px(p.c), cy: px(p.l), r: 2.2 });
      var bolaB = criar('circle', { cx: px(q.c), cy: px(q.l), r: 2.2 });
      var aro = criar('circle', { 'class': 'mesa-vivo__aro', cx: px(q.c), cy: px(q.l), r: 6 });
      [linha, bolaA, bolaB, aro].forEach(function (el) { svg.appendChild(el); });

      animate(bolaA, { opacity: [0, a] }, { duration: 0.4 });
      animate(linha, { opacity: [0, a * 0.6], strokeDashoffset: [1, 0] }, { duration: 0.9, delay: 0.25, ease: EASE_OUT });
      animate(bolaB, { opacity: [0, a] }, { duration: 0.4, delay: 1 });
      animate(aro, { opacity: [0, a * 0.5, 0], transform: ['scale(0.6)', 'scale(1.6)'] },
        { duration: 1.2, delay: 1, ease: EASE_OUT });
      aro.style.transformBox = 'fill-box';
      aro.style.transformOrigin = 'center';

      setTimeout(function () {
        animate([linha, bolaA, bolaB], { opacity: 0 }, { duration: 1 }).finished.then(function () {
          [linha, bolaA, bolaB, aro].forEach(function (el) { el.remove(); });
        });
      }, 3200);
    }

    /* Cada efeito tem o seu "relógio"; todos param fora da tela */
    function agendar(nome, acao, intervalo, primeiro) {
      clearTimeout(relogios[nome]);
      relogios[nome] = setTimeout(function () {
        if (!visivel || document.hidden) return;
        acao();
        agendar(nome, acao, intervalo);
      }, (primeiro != null ? primeiro : sortear(intervalo[0], intervalo[1])) * 1000);
    }

    function ligar() {
      agendar('varredura', varrer, TEMPOS.varredura.intervalo, sortear(1.5, 4));
      agendar('rastro', rastro, TEMPOS.rastro.intervalo, sortear(0.6, 2));
      agendar('conexao', conexao, TEMPOS.conexao.intervalo, sortear(3, 5));
    }

    function desligar() {
      for (var k in relogios) clearTimeout(relogios[k]);
    }

    inView(host, function () {
      visivel = true;
      if (!document.hidden) ligar();
      return function () { visivel = false; desligar(); };
    }, { amount: 0.15 });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) desligar();
      else if (visivel) ligar();
    });
  }

  LUGARES.forEach(function (lugar) {
    Array.prototype.forEach.call(document.querySelectorAll(lugar.seletor), function (host) {
      preparar(host, lugar);
    });
  });
})();

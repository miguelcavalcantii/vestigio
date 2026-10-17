/* =========================================================
   TEXTURA ANIMADA DO FUNDO
   ---------------------------------------------------------
   PARA DESLIGAR: em js/config.js, mude texturaFundo para false.

   Um único <canvas>, atrás do conteúdo, desenha:
   1. GRADE: pontos discretos em toda a tela.
   2. RASTROS: pontos que acendem em sequência e percorrem a tela
      devagar (crescendo no fim, como o símbolo da marca) e somem.
   3. REDE: de um ponto saem linhas finas até alguns pontos
      próximos, por um instante, como conexões sendo investigadas.
   4. SINAL: um anel suave se expande a partir de um ponto, e os
      pontos por onde ele passa acendem de leve.
   5. MOUSE (só no computador): pontos perto do cursor ficam um
      pouco mais visíveis.
   O brilho lento e o granulado são CSS (css/textura-fundo.css).

   CORES: vêm das variáveis --textura-* de css/textura-fundo.css,
   uma para cada tema. Quando o tema troca, o canvas relê as cores
   e se redesenha na hora.

   Desempenho:
   - A grade parada é desenhada uma vez só (numa imagem guardada);
     a cada quadro só os efeitos são redesenhados.
   - No máximo ~30 a 40 quadros por segundo; nada é redesenhado
     quando não há efeito acontecendo.
   - Pausa quando a aba não está visível.
   - No celular: pontos um pouco mais espaçados, menos efeitos ao
     mesmo tempo e sem reação ao mouse.
   - Segue o interruptor CONFIG.animacoesSempre (js/config.js): só
     com ele em false E o sistema pedindo "reduzir movimento", a
     textura fica parada (grade, dois rastros e uma rede fixos).
   ========================================================= */

(function () {
  'use strict';

  if (typeof CONFIG === 'undefined' || !CONFIG.texturaFundo) return;

  var html = document.documentElement;
  var calmo = reduzirMovimento();
  var celular = window.matchMedia('(max-width: 767.98px)').matches;
  var mouseFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- AJUSTES (tempos em ms, distâncias em px) ---------- */
  var AJUSTES = {
    espaco: celular ? 24 : 20,     // distância entre os pontos da grade
    raio: 0.8,                     // tamanho dos pontos parados
    fps: celular ? 30 : 40,

    rastros: {
      max: celular ? 2 : 3,        // quantos ao mesmo tempo
      intervalo: [1400, 2600],     // espera entre um e outro (mín, máx)
      passos: [8, 14],             // quantos pontos cada rastro acende
      ritmo: 210,                  // tempo entre um ponto e o próximo
      subir: 420, manter: 600, apagar: 2600
    },

    redes: {
      max: celular ? 1 : 2,
      intervalo: [2400, 4400],
      ligacoes: [3, 5],            // linhas que saem do ponto central
      alcance: 5,                  // até quantos pontos de distância
      desenhar: 750, manter: 1500, apagar: 1300
    },

    sinais: {
      max: celular ? 1 : 2,
      intervalo: [4500, 7500],
      raio: celular ? 120 : 170,   // até onde o anel cresce
      duracao: 4200
    },

    mouse: {
      ligado: mouseFino && !celular,
      raio: 120
    }
  };

  /* ---------- CAMADAS ---------- */
  var camada = document.createElement('div');
  camada.className = 'textura-fundo';
  camada.setAttribute('aria-hidden', 'true');
  camada.innerHTML =
    '<div class="textura-fundo__brilho textura-fundo__brilho--1"></div>' +
    '<div class="textura-fundo__brilho textura-fundo__brilho--2"></div>' +
    '<canvas class="textura-fundo__pontos"></canvas>' +
    '<div class="textura-fundo__grao"></div>';

  var ambiente = document.querySelector('.ambient');
  if (ambiente && ambiente.parentNode) ambiente.parentNode.insertBefore(camada, ambiente.nextSibling);
  else document.body.insertBefore(camada, document.body.firstChild);
  html.classList.add('textura-ligada');

  var canvas = camada.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var base = document.createElement('canvas');   // a grade parada, desenhada uma vez
  var bctx = base.getContext('2d');

  var largura = 0, altura = 0, dpr = 1, colunas = 0, linhas = 0;
  var ESP = AJUSTES.espaco;
  var MEIO = ESP / 2;

  /* ---------- CORES DO TEMA (variáveis --textura-*) ---------- */
  var cor = {};

  function lerCores() {
    var estilo = getComputedStyle(html);
    function v(nome, padrao) { return estilo.getPropertyValue(nome).trim() || padrao; }
    function n(nome, padrao) { var x = parseFloat(v(nome, '')); return isNaN(x) ? padrao : x; }
    cor.ponto = v('--textura-ponto-rgb', '197, 198, 199');
    cor.pontoA = n('--textura-ponto-alfa', 0.15);
    cor.acento = v('--textura-acento-rgb', '102, 252, 241');
    cor.acentoA = n('--textura-acento-alfa', 0.8);
    cor.linhaA = n('--textura-linha-alfa', 0.34);
    cor.sinalA = n('--textura-sinal-alfa', 0.3);
    cor.mouseA = n('--textura-mouse-alfa', 0.5);
  }

  function rgba(rgb, a) { return 'rgba(' + rgb + ', ' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; }
  function px(c) { return MEIO + c * ESP; }       // coluna/linha da grade → pixel

  /* ---------- GRADE PARADA ---------- */
  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    largura = canvas.clientWidth || window.innerWidth;
    altura = canvas.clientHeight || window.innerHeight;
    canvas.width = base.width = Math.round(largura * dpr);
    canvas.height = base.height = Math.round(altura * dpr);
    colunas = Math.ceil(largura / ESP) + 1;
    linhas = Math.ceil(altura / ESP) + 1;
    desenharBase();
  }

  function desenharBase() {
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, largura, altura);
    bctx.fillStyle = rgba(cor.ponto, cor.pontoA);
    bctx.beginPath();
    for (var c = 0; c < colunas; c++) {
      for (var l = 0; l < linhas; l++) {
        bctx.moveTo(px(c) + AJUSTES.raio, px(l));
        bctx.arc(px(c), px(l), AJUSTES.raio, 0, Math.PI * 2);
      }
    }
    bctx.fill();
    sujo = true;
  }

  /* ---------- AJUDANTES ---------- */
  function sortear(min, max) { return min + Math.random() * (max - min); }
  function inteiro(min, max) { return Math.floor(sortear(min, max + 1)); }
  function suave(t) { return 1 - Math.pow(1 - t, 3); }     // começa rápido, termina macio

  // Força (0 a 1) de algo que acende, fica e apaga
  function envelope(t, subir, manter, apagar) {
    if (t < 0) return 0;
    if (t < subir) return t / subir;
    t -= subir;
    if (t < manter) return 1;
    t -= manter;
    if (t < apagar) return 1 - t / apagar;
    return 0;
  }

  // Ponto aceso: halo suave + ponto na cor de destaque
  function acender(x, y, f, raio) {
    if (f <= 0.01) return;
    var a = f * cor.acentoA;
    ctx.fillStyle = rgba(cor.acento, a * 0.16);
    ctx.beginPath();
    ctx.arc(x, y, raio * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(cor.acento, a);
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---------- 2. RASTROS ---------- */
  // A diagonal "para baixo e à direita" do símbolo aparece mais vezes
  var DIRECOES = [[1, 1], [1, 1], [1, 1], [1, 0], [0, 1], [1, -1], [-1, 1]];

  function criarRastro(agora) {
    var R = AJUSTES.rastros;
    var passos = inteiro(R.passos[0], R.passos[1]);
    var dir = DIRECOES[inteiro(0, DIRECOES.length - 1)];
    var c = inteiro(1, colunas - 2), l = inteiro(1, linhas - 2);
    var pontos = [];
    for (var i = 0; i < passos; i++) {
      pontos.push({ c: c, l: l, inicio: agora + i * R.ritmo, raio: 1 + (i / (passos - 1)) * 1.8 });
      if (Math.random() < 0.2) dir = DIRECOES[inteiro(0, DIRECOES.length - 1)];   // às vezes vira 45°
      c += dir[0]; l += dir[1];
    }
    return { pontos: pontos, fim: agora + (passos - 1) * R.ritmo + R.subir + R.manter + R.apagar };
  }

  function desenharRastro(r, agora) {
    var R = AJUSTES.rastros;
    r.pontos.forEach(function (p) {
      var f = calmo ? p.fixo : envelope(agora - p.inicio, R.subir, R.manter, R.apagar);
      acender(px(p.c), px(p.l), f, p.raio);
    });
  }

  /* ---------- 3. REDE DE CONEXÕES ---------- */
  function criarRede(agora) {
    var R = AJUSTES.redes;
    var c = inteiro(R.alcance, Math.max(R.alcance, colunas - R.alcance - 1));
    var l = inteiro(R.alcance, Math.max(R.alcance, linhas - R.alcance - 1));
    var total = inteiro(R.ligacoes[0], R.ligacoes[1]);
    var ligacoes = [];
    for (var i = 0; i < total; i++) {
      var dc = 0, dl = 0;
      while (Math.abs(dc) + Math.abs(dl) < 2) { dc = inteiro(-R.alcance, R.alcance); dl = inteiro(-R.alcance, R.alcance); }
      ligacoes.push({ de: [c, l], para: [c + dc, l + dl], atraso: i * 140 });
      // uma das pontas às vezes se liga a mais um ponto (a rede "cresce")
      if (Math.random() < 0.35) {
        ligacoes.push({ de: [c + dc, l + dl], para: [c + dc + inteiro(-2, 2), l + dl + inteiro(-2, 2)], atraso: i * 140 + R.desenhar * 0.8 });
      }
    }
    var duracao = R.desenhar + R.manter + R.apagar + total * 140 + R.desenhar;
    return { centro: [c, l], ligacoes: ligacoes, inicio: agora, fim: agora + duracao };
  }

  function desenharRede(rede, agora) {
    var R = AJUSTES.redes;
    var t = agora - rede.inicio;
    // a rede inteira apaga junto, no fim
    var apagando = rede.fim - agora;
    var fGeral = calmo ? 0.7 : Math.min(1, apagando / R.apagar);
    if (fGeral <= 0) return;

    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';
    rede.ligacoes.forEach(function (lg) {
      var p = calmo ? 1 : suave(Math.max(0, Math.min(1, (t - lg.atraso) / R.desenhar)));
      if (p <= 0) return;
      var x1 = px(lg.de[0]), y1 = px(lg.de[1]);
      var x2 = px(lg.para[0]), y2 = px(lg.para[1]);
      ctx.strokeStyle = rgba(cor.acento, cor.linhaA * fGeral);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p);
      ctx.stroke();
      if (p >= 1) acender(x2, y2, 0.75 * fGeral, 1.4);
    });
    // ponto central, com um aro fino
    var cx = px(rede.centro[0]), cy = px(rede.centro[1]);
    acender(cx, cy, fGeral, 2);
    ctx.strokeStyle = rgba(cor.acento, cor.linhaA * 0.8 * fGeral);
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  /* ---------- 4. SINAL (anel que se expande) ---------- */
  function criarSinal(agora) {
    return { c: inteiro(2, colunas - 3), l: inteiro(2, linhas - 3), inicio: agora, fim: agora + AJUSTES.sinais.duracao };
  }

  function desenharSinal(s, agora) {
    var S = AJUSTES.sinais;
    var t = (agora - s.inicio) / S.duracao;
    if (t < 0 || t > 1) return;
    var cx = px(s.c), cy = px(s.l);
    var raio = suave(t) * S.raio;
    var f = 1 - t;

    // dois anéis: o principal e um "eco" um pouco atrás
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(cor.acento, cor.sinalA * f);
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.stroke();
    var raio2 = suave(Math.max(0, t - 0.18) / 0.82) * S.raio * 0.72;
    if (raio2 > 2) {
      ctx.strokeStyle = rgba(cor.acento, cor.sinalA * 0.5 * f);
      ctx.beginPath();
      ctx.arc(cx, cy, raio2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // pontos da grade por onde o anel passa acendem de leve
    var faixa = ESP * 0.9;
    var c0 = Math.max(0, Math.floor((cx - raio - faixa) / ESP)), c1 = Math.min(colunas - 1, Math.ceil((cx + raio + faixa) / ESP));
    var l0 = Math.max(0, Math.floor((cy - raio - faixa) / ESP)), l1 = Math.min(linhas - 1, Math.ceil((cy + raio + faixa) / ESP));
    ctx.fillStyle = rgba(cor.acento, 1);
    for (var c = c0; c <= c1; c++) {
      for (var l = l0; l <= l1; l++) {
        var d = Math.abs(Math.hypot(px(c) - cx, px(l) - cy) - raio);
        if (d > faixa) continue;
        ctx.globalAlpha = (1 - d / faixa) * f * cor.acentoA * 0.55;
        ctx.beginPath();
        ctx.arc(px(c), px(l), AJUSTES.raio + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    acender(cx, cy, Math.min(1, f * 1.4), 1.8);
  }

  /* ---------- 5. MOUSE ---------- */
  var mouse = { x: -999, y: -999, alvoX: -999, alvoY: -999, forca: 0, dentro: false };

  if (AJUSTES.mouse.ligado && !calmo) {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mouse.alvoX = e.clientX; mouse.alvoY = e.clientY;
      if (!mouse.dentro) { mouse.x = e.clientX; mouse.y = e.clientY; }
      mouse.dentro = true;
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) mouse.dentro = false; });
  }

  function desenharMouse() {
    mouse.x += (mouse.alvoX - mouse.x) * 0.2;
    mouse.y += (mouse.alvoY - mouse.y) * 0.2;
    mouse.forca += ((mouse.dentro ? 1 : 0) - mouse.forca) * 0.12;
    if (mouse.forca < 0.01) return false;

    var R = AJUSTES.mouse.raio;
    var c0 = Math.max(0, Math.floor((mouse.x - R) / ESP)), c1 = Math.min(colunas - 1, Math.ceil((mouse.x + R) / ESP));
    var l0 = Math.max(0, Math.floor((mouse.y - R) / ESP)), l1 = Math.min(linhas - 1, Math.ceil((mouse.y + R) / ESP));
    ctx.fillStyle = rgba(cor.acento, 1);
    for (var c = c0; c <= c1; c++) {
      for (var l = l0; l <= l1; l++) {
        var d = Math.hypot(px(c) - mouse.x, px(l) - mouse.y);
        if (d > R) continue;
        var f = Math.pow(1 - d / R, 2) * mouse.forca;
        ctx.globalAlpha = f * cor.mouseA;
        ctx.beginPath();
        ctx.arc(px(c), px(l), AJUSTES.raio + f * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    return true;
  }

  /* ---------- DESENHO DE UM QUADRO ---------- */
  var rastros = [], redes = [], sinais = [];
  var proximo = { rastro: 0, rede: 0, sinal: 0 };
  var sujo = true;

  function limparEBase() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function desenharTudo(agora) {
    limparEBase();
    sinais.forEach(function (s) { desenharSinal(s, agora); });
    redes.forEach(function (r) { desenharRede(r, agora); });
    rastros.forEach(function (r) { desenharRastro(r, agora); });
    return AJUSTES.mouse.ligado && !calmo ? desenharMouse() : false;
  }

  function criarSePrecisar(agora) {
    if (agora >= proximo.rastro && rastros.length < AJUSTES.rastros.max) {
      rastros.push(criarRastro(agora));
      proximo.rastro = agora + sortear(AJUSTES.rastros.intervalo[0], AJUSTES.rastros.intervalo[1]);
    }
    if (agora >= proximo.rede && redes.length < AJUSTES.redes.max) {
      redes.push(criarRede(agora));
      proximo.rede = agora + sortear(AJUSTES.redes.intervalo[0], AJUSTES.redes.intervalo[1]);
    }
    if (agora >= proximo.sinal && sinais.length < AJUSTES.sinais.max) {
      sinais.push(criarSinal(agora));
      proximo.sinal = agora + sortear(AJUSTES.sinais.intervalo[0], AJUSTES.sinais.intervalo[1]);
    }
    function vivo(x) { return x.fim > agora; }
    rastros = rastros.filter(vivo);
    redes = redes.filter(vivo);
    sinais = sinais.filter(vivo);
  }

  /* ---------- LAÇO DE ANIMAÇÃO ---------- */
  var pedido = 0;
  var ultimoQuadro = 0;
  var passoQuadro = 1000 / AJUSTES.fps;

  function quadro(agora) {
    pedido = requestAnimationFrame(quadro);
    if (agora - ultimoQuadro < passoQuadro - 1) return;
    ultimoQuadro = agora;

    criarSePrecisar(agora);
    var temEfeito = rastros.length || redes.length || sinais.length || mouse.forca > 0.01 || mouse.dentro;
    if (temEfeito) {
      desenharTudo(agora);
      sujo = true;
    } else if (sujo) {
      limparEBase();                 // um último quadro limpo
      sujo = false;
    }
  }

  function ligar() {
    if (!pedido) pedido = requestAnimationFrame(quadro);
    camada.classList.remove('is-pausada');
  }

  function desligar() {
    if (pedido) cancelAnimationFrame(pedido);
    pedido = 0;
    camada.classList.add('is-pausada');
  }

  /* ---------- VERSÃO PARADA ("reduzir movimento") ---------- */
  var parado = null;

  function desenharParado() {
    if (!parado) {
      parado = { rastros: [criarRastro(0), criarRastro(0)], rede: criarRede(0) };
      parado.rastros.forEach(function (r) {
        r.pontos.forEach(function (p, i) { p.fixo = 0.3 + 0.55 * (i / (r.pontos.length - 1)); });
      });
    }
    limparEBase();
    desenharRede(parado.rede, 0);
    parado.rastros.forEach(function (r) { desenharRastro(r, 0); });
  }

  function redesenharAgora() {
    if (calmo) desenharParado(); else desenharTudo(performance.now());
  }

  /* ---------- INÍCIO ---------- */
  lerCores();
  medir();

  if (calmo) {
    desenharParado();
  } else {
    var t0 = performance.now();
    proximo = { rastro: t0 + 400, rede: t0 + 1600, sinal: t0 + 3000 };
    ligar();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) desligar(); else ligar();
    });
  }

  // Tamanho da tela mudou: refaz a grade (espera a pessoa parar de redimensionar)
  var espera;
  window.addEventListener('resize', function () {
    clearTimeout(espera);
    espera = setTimeout(function () {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (Math.abs(w - largura) < 2 && Math.abs(h - altura) < 2) return;
      medir();
      if (calmo) parado = null;
      redesenharAgora();
    }, 200);
  });

  // Tema claro/escuro trocou: relê as cores (variáveis --textura-*) e redesenha na hora
  new MutationObserver(function () {
    lerCores();
    desenharBase();
    redesenharAgora();
  }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
})();

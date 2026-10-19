/* =========================================================
   CAMINHO DAS PROVAS (biblioteca Motion)
   "Não substituímos a polícia nem a Justiça. Trabalhamos
   junto com elas." Você → Vestígio → Polícia e Justiça
   ---------------------------------------------------------
   - A linha tracejada entre as etapas se DESENHA conforme a
     pessoa rola a página (SVG com máscara: a máscara cresce e
     revela o tracejado).
   - Um pequeno "pacote de provas" percorre a linha. Até a
     Vestígio são papéis soltos; ao passar pela Vestígio, eles
     se juntam e viram um relatório organizado.
   - Cada etapa acende quando o pacote chega nela.
   - Os 3 itens da Vestígio aparecem em sequência quando ela
     acende.
   - No computador a linha é horizontal; no celular, vertical.
     As posições vêm dos círculos de verdade (recalculadas ao
     redimensionar), então a mesma lógica serve para os dois.

   Sem JavaScript ou sem a Motion: fica a linha tracejada do
   CSS e tudo aparece normalmente. Com movimento reduzido:
   tudo já desenhado e aceso, sem o pacote andando.
   ========================================================= */

(function () {
  'use strict';

  var lanes = document.querySelector('[data-relay]');
  if (!lanes || typeof Motion === 'undefined') return;

  var animate = Motion.animate;
  var stagger = Motion.stagger;
  var calmo = reduzirMovimento();
  var EASE_OUT = RITMO.suave;
  var EASE_MOLA = RITMO.mola;
  var SVG = 'http://www.w3.org/2000/svg';

  var nos = Array.prototype.slice.call(lanes.querySelectorAll('.relay__node'));
  var tarefas = Array.prototype.slice.call(lanes.querySelectorAll('.relay__tasks li'));
  if (nos.length !== 3) return;

  /* ---------- Monta o SVG da linha e o pacote ---------- */
  function criar(tag, attrs) {
    var el = document.createElementNS(SVG, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var svg = criar('svg', { class: 'relay__trilha', 'aria-hidden': 'true', focusable: 'false' });
  var defs = criar('defs', {});
  var mascara = criar('mask', { id: 'relay-mascara', maskUnits: 'userSpaceOnUse' });
  var revela = criar('path', { class: 'relay__revela', pathLength: '1' });   // traço branco que cresce
  var base = criar('path', { class: 'relay__base' });                        // o caminho inteiro, bem apagado
  var traco = criar('path', { class: 'relay__traco', mask: 'url(#relay-mascara)' });
  mascara.appendChild(revela);
  defs.appendChild(mascara);
  svg.appendChild(defs);
  svg.appendChild(base);
  svg.appendChild(traco);
  lanes.insertBefore(svg, lanes.firstChild);

  // Pacote: três papéis soltos + o relatório (aparece depois da Vestígio)
  var pacote = document.createElement('span');
  pacote.className = 'relay__pacote';
  pacote.setAttribute('aria-hidden', 'true');
  pacote.innerHTML =
    '<span class="relay__papel"></span><span class="relay__papel"></span><span class="relay__papel"></span>' +
    '<span class="relay__relatorio">' + V_icone('file-badge') + '</span>';
  lanes.appendChild(pacote);
  var papeis = Array.prototype.slice.call(pacote.querySelectorAll('.relay__papel'));
  var relatorio = pacote.querySelector('.relay__relatorio');

  function V_icone(nome) {
    return window.Vestigio && window.Vestigio.icone ? window.Vestigio.icone(nome) : '';
  }

  lanes.classList.add('relay--js');   // esconde a linha do CSS (a de reserva)

  /* ---------- Posições (centro de cada círculo) ---------- */
  var pontos = [], comprimentos = [], total = 0;

  function medir() {
    var caixa = lanes.getBoundingClientRect();
    pontos = nos.map(function (no) {
      var r = no.getBoundingClientRect();
      return { x: r.left - caixa.left + r.width / 2, y: r.top - caixa.top + r.height / 2 };
    });
    comprimentos = [distancia(pontos[0], pontos[1]), distancia(pontos[1], pontos[2])];
    total = comprimentos[0] + comprimentos[1];

    var w = Math.ceil(caixa.width), h = Math.ceil(caixa.height);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    var d = 'M' + pontos[0].x + ' ' + pontos[0].y + ' L' + pontos[1].x + ' ' + pontos[1].y + ' L' + pontos[2].x + ' ' + pontos[2].y;
    [revela, base, traco].forEach(function (p) { p.setAttribute('d', d); });
    desenhar(progressoAtual);
  }

  function distancia(a, b) { return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)); }

  // Ponto da linha numa fração (0 a 1) do caminho todo
  function pontoEm(f) {
    var andado = f * total;
    if (andado <= comprimentos[0]) return misturar(pontos[0], pontos[1], comprimentos[0] ? andado / comprimentos[0] : 0);
    return misturar(pontos[1], pontos[2], comprimentos[1] ? (andado - comprimentos[0]) / comprimentos[1] : 0);
  }

  function misturar(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }

  /* ---------- Etapas que acendem ---------- */
  var acesos = [false, false, false];
  var tarefasMostradas = false;

  function acender(i, ligar) {
    if (acesos[i] === ligar) return;
    acesos[i] = ligar;
    nos[i].classList.toggle('is-aceso', ligar);
    if (ligar && !calmo) {
      animate(nos[i], { transform: ['scale(1)', 'scale(1.12)', 'scale(1)'] }, { duration: 0.5, ease: EASE_MOLA });
    }
    // Os 3 itens da Vestígio entram em sequência na primeira vez que ela acende
    if (i === 1 && ligar && !tarefasMostradas) {
      tarefasMostradas = true;
      if (!calmo) {
        animate(tarefas, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
          { duration: 0.55, ease: EASE_OUT, delay: stagger(0.12, { startDelay: 0.1 }) });
        animate(tarefas.map(function (li) { return li.querySelector('.icon'); }).filter(Boolean),
          { transform: ['scale(0.6)', 'scale(1)'] },
          { duration: 0.5, ease: EASE_MOLA, delay: stagger(0.12, { startDelay: 0.15 }) });
      }
    }
  }

  /* ---------- Papéis soltos ↔ relatório organizado ---------- */
  var organizado = null;
  // Onde cada papel fica "solto" (desloca e gira um pouco)
  var SOLTOS = ['translate(-7px, 3px) rotate(-16deg)', 'translate(1px, -5px) rotate(6deg)', 'translate(7px, 3px) rotate(18deg)'];

  function organizar(sim) {
    if (organizado === sim) return;
    var primeira = organizado === null;
    organizado = sim;
    var dur = primeira || calmo ? 0 : 1;
    papeis.forEach(function (papel, i) {
      animate(papel, {
        transform: sim ? 'translate(0px, 0px) rotate(0deg) scale(0.6)' : SOLTOS[i] + ' scale(1)',
        opacity: sim ? 0 : 1
      }, { duration: 0.45 * dur, ease: EASE_OUT, delay: sim ? 0 : 0.1 * dur });
    });
    animate(relatorio, {
      transform: sim ? 'scale(1) rotate(0deg)' : 'scale(0.4) rotate(-12deg)',
      opacity: sim ? 1 : 0
    }, { duration: 0.5 * dur, ease: sim ? EASE_MOLA : EASE_OUT, delay: sim ? 0.15 * dur : 0 });
  }

  /* ---------- Desenha tudo para um progresso (0 a 1) ---------- */
  var progressoAtual = 0;

  function desenhar(p) {
    progressoAtual = p;
    if (!total) return;

    revela.style.strokeDashoffset = String(1 - p);

    var meio = comprimentos[0] / total;   // fração em que o pacote chega na Vestígio
    acender(0, p > 0.001);
    acender(1, p >= meio - 0.01);
    acender(2, p >= 0.995);
    organizar(p >= meio);

    var pt = pontoEm(p);
    pacote.style.transform = 'translate(' + pt.x + 'px, ' + pt.y + 'px)';
    // Aparece depois de sair de "Você" e some ao entrar em "Polícia e Justiça"
    var vis = Math.min(1, Math.max(0, (p - 0.02) / 0.05), Math.max(0, (0.985 - p) / 0.04));
    pacote.style.opacity = String(vis);
  }

  /* ---------- Liga tudo ---------- */
  if (calmo) {
    // Movimento reduzido: tudo pronto, sem o pacote
    pacote.hidden = true;
    medir();
    desenhar(1);
  } else {
    // Começa com as tarefas escondidas (só aqui, com a Motion rodando)
    tarefas.forEach(function (li) { li.style.opacity = '0'; li.style.transform = 'translateY(10px)'; });
    medir();
    desenhar(0);
    // Do topo da linha a 80% da tela até o fim dela a 45% da tela
    Motion.scroll(function (p) { desenhar(p); }, {
      target: lanes,
      offset: ['start 80%', 'end 45%']
    });
  }

  // Redimensionou (ou girou o celular): recalcula as posições
  var espera;
  window.addEventListener('resize', function () {
    clearTimeout(espera);
    espera = setTimeout(medir, 120);
  });
  // As fontes podem mudar o tamanho dos textos depois de carregar
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
})();

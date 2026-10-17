/* =========================================================
   ANIMAÇÕES (biblioteca Motion)
   ---------------------------------------------------------
   1. Título do hero aparecendo palavra por palavra
   2. Dossiê do hero: entrada, "análise" em loop e paralaxe
   3. Rótulos que se "decodificam" e traço sob "rastro"
   4. Seções aparecendo ao rolar (com sequência nos cards)
   5. Tarjas que revelam frases-chave
   6. Etapas do "Como funciona" acendendo com a rolagem

   Regras:
   - Animamos só transform, opacity e filter (leves para o navegador).
   - Curvas suaves e personalizadas, nada de "linear" na interface.
   - Se a pessoa pediu "reduzir movimento", nada se move:
     tudo já aparece no lugar, no estado final.
   ========================================================= */

(function () {
  'use strict';

  var html = document.documentElement;

  /* Estado final do dossiê, usado quando não há animação */
  function dossieCompleto() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-dossier] [data-step]'), function (linha) {
      linha.classList.add('is-done');
    });
    var status = document.querySelector('[data-dossier-status]');
    if (status) status.textContent = 'Concluído';
    var relatorio = document.querySelector('[data-dossier-report]');
    if (relatorio) relatorio.classList.add('is-ready');
  }

  // Sem a biblioteca ou com "reduzir movimento": mostra tudo e para aqui
  // (a classe motion-ok é colocada pelo script do <head>, que segue o
  // interruptor CONFIG.animacoesSempre; reduzirMovimento() está em config.js)
  if (typeof Motion === 'undefined' || reduzirMovimento() || !html.classList.contains('motion-ok')) {
    html.classList.remove('motion-ok');
    dossieCompleto();
    return;
  }
  window.animacoesProntas = true;

  var animate = Motion.animate;
  var inView = Motion.inView;
  var stagger = Motion.stagger;
  var scroll = Motion.scroll;

  var EASE_OUT = [0.23, 1, 0.32, 1];
  var EASE_FLUID = [0.32, 0.72, 0, 1];
  var mouseFino = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Entrada padrão: sobe, perde o desfoque e aparece
  var APARECER = {
    opacity: [0, 1],
    transform: ['translateY(40px)', 'translateY(0)'],
    filter: ['blur(10px)', 'blur(0px)']
  };

  /* =========================================================
     1. TÍTULO DO HERO, PALAVRA POR PALAVRA
     Cada palavra vira <span class="word"><span class="word__inner">.
     A palavra "sobe" de dentro da sua própria caixa.
     ========================================================= */
  function separarPalavras(elemento) {
    Array.prototype.slice.call(elemento.childNodes).forEach(function (no) {
      if (no.nodeType === 3) {
        // nó de texto: troca cada palavra por spans
        var partes = no.textContent.split(/(\s+)/);
        var fragmento = document.createDocumentFragment();
        partes.forEach(function (parte) {
          if (!parte) return;
          if (/^\s+$/.test(parte)) {
            fragmento.appendChild(document.createTextNode(' '));
          } else {
            var palavra = document.createElement('span');
            palavra.className = 'word';
            var miolo = document.createElement('span');
            miolo.className = 'word__inner';
            miolo.textContent = parte;
            palavra.appendChild(miolo);
            fragmento.appendChild(palavra);
          }
        });
        no.parentNode.replaceChild(fragmento, no);
      } else if (no.nodeType === 1) {
        separarPalavras(no); // entra em <span class="ink"> etc.
      }
    });
  }

  function animarHero() {
    var titulo = document.querySelector('[data-split]');
    if (titulo) {
      separarPalavras(titulo);
      animate(titulo.querySelectorAll('.word__inner'),
        { opacity: [0, 1], transform: ['translateY(105%)', 'translateY(0)'] },
        { duration: 0.9, ease: EASE_FLUID, delay: stagger(0.055, { startDelay: 0.1 }) });
    }

    animate(document.querySelectorAll('[data-hero-item]'), APARECER,
      { duration: 0.9, ease: EASE_FLUID, delay: stagger(0.1, { startDelay: 0.45 }) });
  }

  /* =========================================================
     2. DOSSIÊ DO HERO
     ========================================================= */
  function animarDossie() {
    var dossie = document.querySelector('[data-dossier]');
    if (!dossie) return;
    var cartas = dossie.querySelectorAll('.dossier__card');

    // Entrada: as cartas chegam uma depois da outra
    var entrada = animate(cartas,
      { opacity: [0, 1], transform: ['translateY(60px) scale(0.94)', 'translateY(0) scale(1)'] },
      { duration: 1.1, ease: EASE_FLUID, delay: stagger(0.14, { startDelay: 0.5 }) });

    entrada.finished.then(function () {
      ligarParalaxe(dossie, cartas);
    });

    // Ao rolar a página, o dossiê sobe um pouco mais devagar que o texto
    scroll(animate(dossie, { transform: ['translateY(0px)', 'translateY(-70px)'] }, { ease: 'linear' }), {
      target: document.querySelector('.hero'),
      offset: ['start start', 'end start']
    });

    analisarEmLoop(dossie);
  }

  // A "análise" do caso: cada linha passa por Na fila → Analisando → Vínculo encontrado
  function analisarEmLoop(dossie) {
    var linhas = dossie.querySelectorAll('[data-step]');
    var barra = dossie.querySelector('[data-dossier-bar]');
    var status = dossie.querySelector('[data-dossier-status]');
    var relatorio = dossie.querySelector('[data-dossier-report]');
    var visivel = true;
    var timer = null;

    // Só roda enquanto o hero está na tela (economiza bateria)
    new IntersectionObserver(function (e) {
      visivel = e[0].isIntersecting;
      if (visivel && !timer) passo(0);
    }).observe(dossie);

    function reiniciar() {
      Array.prototype.forEach.call(linhas, function (l) { l.classList.remove('is-active', 'is-done'); });
      relatorio.classList.remove('is-ready');
      status.textContent = 'Em análise';
      barra.style.setProperty('--progress', 0);
    }

    function passo(i) {
      timer = null;
      if (!visivel) return;
      if (i === 0) reiniciar();

      if (i < linhas.length) {
        linhas[i].classList.add('is-active');
        timer = setTimeout(function () {
          linhas[i].classList.remove('is-active');
          linhas[i].classList.add('is-done');
          barra.style.setProperty('--progress', (i + 1) / linhas.length);
          passo(i + 1);
        }, i === 0 ? 1600 : 1150);
      } else {
        status.textContent = 'Concluído';
        relatorio.classList.add('is-ready');
        timer = setTimeout(function () { passo(0); }, 4200);
      }
    }
  }

  // Paralaxe: as cartas acompanham o mouse em profundidades diferentes
  function ligarParalaxe(dossie, cartas) {
    if (!mouseFino.matches) return;
    var hero = document.querySelector('.hero');
    var alvoX = 0, alvoY = 0, x = 0, y = 0, rodando = false;
    var profundidades = Array.prototype.map.call(cartas, function (c) {
      return parseFloat(c.getAttribute('data-depth')) || 1;
    });

    hero.addEventListener('pointermove', function (e) {
      var caixa = hero.getBoundingClientRect();
      alvoX = (e.clientX - caixa.left) / caixa.width - 0.5;   // de -0.5 a 0.5
      alvoY = (e.clientY - caixa.top) / caixa.height - 0.5;
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    });

    hero.addEventListener('pointerleave', function () {
      alvoX = 0; alvoY = 0;
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    });

    // A cada quadro, chega um pouco mais perto do alvo (movimento macio)
    function quadro() {
      x += (alvoX - x) * 0.08;
      y += (alvoY - y) * 0.08;
      for (var i = 0; i < cartas.length; i++) {
        cartas[i].style.transform = 'translate3d(' + (x * 22 * profundidades[i]).toFixed(2) + 'px,' +
          (y * 18 * profundidades[i]).toFixed(2) + 'px,0)';
      }
      if (Math.abs(alvoX - x) > 0.001 || Math.abs(alvoY - y) > 0.001) requestAnimationFrame(quadro);
      else rodando = false;
    }
  }

  /* =========================================================
     4. SEÇÕES QUE ACOMPANHAM A ROLAGEM
     ---------------------------------------------------------
     As animações de entrada são "presas" à rolagem: em vez de
     tocarem uma vez, elas avançam conforme o elemento entra na
     tela e VOLTAM quando você rola para cima. Por isso funcionam
     nos dois sentidos e ficam sempre suaves.

     Como funciona: scroll(animação, { target, offset }) liga o
     progresso da animação (0 a 1) à posição do elemento na tela.
       'start end'  = o topo do elemento encostou no fim da tela (0%)
       'start 70%'  = o topo do elemento chegou a 70% da tela (100%)
     Desde a v3.1 os blocos também SAEM pelo topo (função
     entrarESair, logo abaixo). O hero, o dossiê e o cabeçalho
     não usam isso: eles ficam como estavam.
     ========================================================= */
  var ELASTICO = [0.34, 1.56, 0.64, 1];   // passa do ponto e volta (gelatina)
  var PERSPECTIVA = 'perspective(1200px) ';

  // Liga uma animação à rolagem de um elemento
  function presoARolagem(el, quadros, inicio, fim) {
    scroll(animate(el, quadros, { ease: EASE_OUT }), {
      target: el,
      offset: ['start ' + (inicio || 'end'), 'start ' + (fim || '72%')]
    });
  }
  // Disponível para outros arquivos (ex.: js/demo-golpe.js usa nos celulares)
  window.presoARolagem = presoARolagem;

  /* ---------- ENTRAR E SAIR (nos dois sentidos) ----------
     Cada bloco tem DUAS faixas presas à rolagem:
       ENTRADA: 'start end' → 'start 72%' (o topo do bloco sobe do
                fim da tela até 72% dela). Vai do estado "de" ao normal.
       SAÍDA:   'end 25%' → 'end start' (o fim do bloco passa de 25%
                da tela até o topo). Esmaece, sobe 24px, ganha 4px de
                desfoque e encolhe para 0.98.
     As duas faixas NÃO animam o elemento sozinhas: elas só guardam o
     progresso (0 a 1). Uma única função (desenhar) junta os dois e
     escreve opacity/transform/filter. Assim elas nunca brigam pela
     mesma propriedade.
     Descendo: entra por baixo e, perto do topo, sai.
     Subindo: o que volta pelo topo desce de -24px e reaparece; o que
     sai por baixo faz a entrada ao contrário e esmaece. */
  var SAIDA = { opacidade: 0.15, y: -24, escala: 0.98, desfoque: 4 };
  var curvaEntrada = Motion.cubicBezier(0.23, 1, 0.32, 1);   // = EASE_OUT
  var curvaSaida = Motion.cubicBezier(0.32, 0, 0.67, 0);      // começa devagar
  var blocos = [];   // todos os blocos ligados (para o "redimensionar")

  function misturar(a, b, t) { return a + (b - a) * t; }

  // Está dentro de algo "grudado" (position: sticky)? Ex.: a coluna do
  // "Como funciona" e das "Dúvidas" no computador. Esses não saem pelo
  // topo, porque continuam na tela enquanto o resto rola.
  function estaGrudado(el) {
    for (var no = el; no && no !== document.body; no = no.parentElement) {
      if (getComputedStyle(no).position === 'sticky') return true;
    }
    return false;
  }

  /* Liga um bloco às duas faixas.
       de     = como ele começa: { opacidade, x, y, giro, escala, desfoque, corte }
                (corte: 'baixo' = sobe de dentro de uma máscara;
                 'direita' = é "desenhado" da esquerda para a direita)
       inicio = onde a entrada começa (padrão 'end' = fim da tela)
       fim    = onde a entrada termina (padrão '72%') */
  function entrarESair(el, de, inicio, fim) {
    var bloco = {
      el: el,
      de: {
        opacidade: de.opacidade !== undefined ? de.opacidade : 0,
        x: de.x || 0,
        y: de.y || 0,
        giro: de.giro || 0,
        escala: de.escala !== undefined ? de.escala : 1,
        desfoque: de.desfoque || 0,
        corte: de.corte || null
      },
      entrada: 0,
      saida: 0,
      comSaida: !estaGrudado(el),
      ultimo: ''
    };
    blocos.push(bloco);
    desenhar(bloco);   // já começa escondido (sem "piscar" antes da 1ª medida)

    scroll(function (p) { bloco.entrada = p; desenhar(bloco); }, {
      target: el,
      offset: ['start ' + (inicio || 'end'), 'start ' + (fim || '72%')]
    });
    scroll(function (p) { bloco.saida = p; desenhar(bloco); }, {
      target: el,
      offset: ['end 25%', 'end start']
    });
  }

  // Junta entrada + saída e escreve o estilo (uma vez por mudança)
  function desenhar(b) {
    var e = curvaEntrada(b.entrada);
    var s = b.comSaida ? curvaSaida(b.saida) : 0;
    var de = b.de;

    // Entrada: do estado "de" até o normal
    var opacidade = misturar(de.opacidade, 1, e);
    var x = misturar(de.x, 0, e);
    var y = misturar(de.y, 0, e);
    var giro = misturar(de.giro, 0, e);
    var escala = misturar(de.escala, 1, e);
    var desfoque = misturar(de.desfoque, 0, e);

    // Saída: vai por cima da entrada (só quando o bloco chega ao topo)
    opacidade *= misturar(1, SAIDA.opacidade, s);
    y += SAIDA.y * s;
    escala *= misturar(1, SAIDA.escala, s);
    desfoque += SAIDA.desfoque * s;

    var transform = (de.giro ? PERSPECTIVA + 'rotateX(' + giro.toFixed(2) + 'deg) ' : '') +
      'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + escala.toFixed(4) + ')';
    var filtro = desfoque > 0.05 ? 'blur(' + desfoque.toFixed(2) + 'px)' : 'none';
    var corte = '';
    if (de.corte === 'baixo') corte = 'inset(0 0 ' + ((1 - e) * 100).toFixed(2) + '% 0)';
    if (de.corte === 'direita') corte = 'inset(0 ' + ((1 - e) * 100).toFixed(2) + '% 0 0)';

    // Nada mudou desde o último quadro? Não mexe no estilo.
    var chave = opacidade.toFixed(3) + transform + filtro + corte;
    if (chave === b.ultimo) return;
    b.ultimo = chave;

    var st = b.el.style;
    st.opacity = opacidade.toFixed(3);
    st.transform = transform;
    st.filter = filtro;
    if (de.corte) st.clipPath = corte;
  }

  // Se a tela mudar de tamanho (ex.: virar o tablet), confere de novo
  // quem está "grudado" (o sticky só existe a partir de 1024px)
  var esperaResize = null;
  window.addEventListener('resize', function () {
    clearTimeout(esperaResize);
    esperaResize = setTimeout(function () {
      blocos.forEach(function (b) {
        b.comSaida = !estaGrudado(b.el);
        b.ultimo = '';
        desenhar(b);
      });
    }, 200);
  });

  // Cada tipo de bloco entra de um jeito diferente (a saída é igual para todos)
  var ENTRADAS = {
    // O problema: os blocos "levantam" da mesa, como cartas viradas
    bento: function (el, i) {
      entrarESair(el, { giro: 8, y: 40, escala: 0.98, desfoque: 6 }, '100%', i % 2 ? '68%' : '75%');
    },
    // Princípios: chegam alternando dos lados
    principles: function (el, i) {
      var lado = i % 2 === 0 ? -1 : 1;
      entrarESair(el, { x: 28 * lado, y: 12, escala: 0.98, desfoque: 6 });
    },
    // Guia: "Faça agora" vem da esquerda e "Não faça" da direita
    guide__grid: function (el, i) {
      entrarESair(el, { x: i === 0 ? -40 : 40, y: 12, desfoque: 6 });
    },
    // Dúvidas: cada linha é "desenhada" da esquerda para a direita
    accordion: function (el) {
      entrarESair(el, { corte: 'direita', y: 8 }, 'end', '80%');
    },
    // Contato: os cartões crescem do pequeno para o tamanho normal
    contact__list: function (el, i) {
      entrarESair(el, { y: 24, escala: 0.96, desfoque: 4 }, 'end', (82 - i * 4) + '%');
    },
    // Etapas do "Como funciona": deslizam da direita
    steps: function (el) {
      entrarESair(el, { opacidade: 0.2, x: 24, desfoque: 4 }, 'end', '70%');
    }
  };

  function animarSecoes() {
    // Blocos de título: o título sobe de dentro de uma "máscara"
    // e o parágrafo vem logo atrás (tudo acompanhando a rolagem)
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
      el.style.opacity = '1';
      if (el.classList.contains('cta')) return animarCta(el);
      var titulo = el.querySelector('h2, h3');
      Array.prototype.forEach.call(el.children, function (filho) {
        if (filho === titulo) {
          entrarESair(filho, { opacidade: 1, corte: 'baixo', y: 24 }, 'end', '78%');
        } else {
          entrarESair(filho, { y: 16, desfoque: 4 }, '95%', '70%');
        }
      });
    });

    // Grupos: cada item usa a receita do seu grupo
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal-group]'), function (grupo) {
      if (grupo.hasAttribute('data-services-grid')) return; // os cards têm regra própria (abaixo)
      var receita = null;
      for (var chave in ENTRADAS) {
        if (grupo.classList.contains(chave)) receita = ENTRADAS[chave];
      }
      Array.prototype.forEach.call(grupo.querySelectorAll('[data-reveal-item]'), function (el, i) {
        if (receita) receita(el, i);
        else entrarESair(el, { y: 20, desfoque: 4 });
      });
    });

    // Etapas do "Como funciona"
    Array.prototype.forEach.call(document.querySelectorAll('.step'), function (el, i) {
      ENTRADAS.steps(el, i);
    });

    // Cards de serviço
    revelarCards(document.querySelectorAll('.service-card'), false);
  }

  /* CARDS DE SERVIÇO: "estouram" como gelatina sempre que entram
     na tela e esmaecem quando saem.
     DIREÇÃO: se o card entrou pela parte de cima da tela (a pessoa
     está subindo), ele vem de cima; se entrou por baixo (descendo),
     vem de baixo. Olhamos a posição do card na hora em que ele entra,
     o que funciona igual com e sem a rolagem suave (Lenis).
     Como os cards são recriados ao trocar de aba, o components.js
     chama window.revelarCards() com os cards novos. */
  function revelarCards(cards, jaVisiveis) {
    Array.prototype.forEach.call(cards, function (card, i) {
      var primeiraVez = true;
      inView(card, function () {
        if (!(jaVisiveis && primeiraVez)) {
          var caixa = card.getBoundingClientRect();
          var deCima = caixa.top + caixa.height / 2 < window.innerHeight / 2;
          var y = deCima ? -20 : 20;
          var anim = animate(card, {
            opacity: [0, 1],
            transform: ['translateY(' + y + 'px) scale(0.97)', 'translateY(0) scale(1)']
          }, { duration: 0.6, ease: EASE_OUT, delay: (i % 3) * 0.08 });
          anim.finished.then(function () { card.style.transform = ''; });
        }
        primeiraVez = false;
        // Ao sair da tela, esmaece rápido (sem sumir de uma vez na borda)
        // e fica escondido para "estourar" de novo na volta
        return function () {
          animate(card, { opacity: 0 }, { duration: 0.2, ease: EASE_OUT });
        };
      }, { margin: '0px 0px -8% 0px' });
    });
  }
  window.revelarCards = revelarCards;

  // Bloco final: cresce e arredonda junto com a rolagem
  function animarCta(cta) {
    scroll(animate(cta, {
      opacity: [0.5, 1],
      transform: ['scale(0.96) translateY(24px)', 'scale(1) translateY(0)']
    }, { ease: EASE_OUT }), {
      target: cta,
      offset: ['start end', 'start 35%']
    });
  }

  /* =========================================================
     5. TARJAS QUE REVELAM FRASES
     O CSS faz a animação; aqui só avisamos quando começar.
     ========================================================= */
  function animarTarjas() {
    inView('[data-redact]', function (el) {
      setTimeout(function () { el.classList.add('is-revealed'); }, 450);
    }, { amount: 1 });
  }

  /* =========================================================
     6. "COMO FUNCIONA": A LINHA ENCHE E AS ETAPAS ACENDEM
     ========================================================= */
  function animarEtapas() {
    var lista = document.querySelector('[data-steps]');
    var progresso = document.querySelector('[data-steps-progress]');
    if (!lista || !progresso) return;

    // A linha azul cresce conforme a rolagem passa pela lista
    scroll(animate(progresso, { transform: ['scaleY(0)', 'scaleY(1)'] }, { ease: 'linear' }), {
      target: lista,
      offset: ['start 65%', 'end 55%']
    });

    // Cada etapa acende quando chega perto do meio da tela,
    // e apaga se a pessoa voltar a rolar para cima
    Array.prototype.forEach.call(lista.querySelectorAll('.step'), function (etapa) {
      inView(etapa, function () {
        etapa.classList.add('is-lit');
        return function () {
          if (etapa.getBoundingClientRect().top > 0) etapa.classList.remove('is-lit');
        };
      }, { margin: '0px 0px -45% 0px' });
    });
  }

  /* ---------- INICIAR ---------- */
  animarHero();
  animarDossie();
  animarSecoes();
  animarTarjas();
  animarEtapas();
})();

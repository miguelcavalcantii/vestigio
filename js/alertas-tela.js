/* =========================================================
   ALERTAS NA TELA
   ---------------------------------------------------------
   1. Página inicial: faixa "Últimos alertas" (os 3 mais
      recentes de js/alertas.js)
   2. alertas.html: filtro por categoria (chips)
   3. Página de um alerta: barra de progresso da leitura e
      botão "Compartilhar"
   Cada parte só roda se a página tiver o elemento dela.
   ========================================================= */

(function () {
  'use strict';

  var V = window.Vestigio;
  if (!V) return;
  var $ = V.$;
  var $$ = V.$$;

  /* =========================================================
     1. ÚLTIMOS ALERTAS (página inicial)
     Roda antes de js/animations.js, para os cards entrarem
     com a mesma animação de rolagem dos outros blocos.
     ========================================================= */
  function prepararUltimos() {
    var lista = $('[data-ultimos]');
    if (!lista || typeof ALERTAS === 'undefined') return;
    lista.innerHTML = alertasPorData().slice(0, 3).map(function (alerta) {
      return htmlDoCardDeAlerta(alerta, V.raiz, true);
    }).join('');
    V.preencherIcones(lista);
  }

  /* =========================================================
     2. FILTRO POR CATEGORIA (alertas.html)
     ========================================================= */
  function prepararFiltro() {
    var filtro = $('[data-alertas-filtro]');
    if (!filtro) return;
    var status = $('[data-alertas-status]');
    var destaque = $('[data-alerta-destaque]');
    var cards = $$('.alertas__grade .alerta-card');
    var vazio = $('[data-alertas-vazio]');

    filtro.addEventListener('click', function (evento) {
      var botao = evento.target.closest('[data-filtro]');
      if (!botao || botao.getAttribute('aria-pressed') === 'true') return;
      $$('[data-filtro]', filtro).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === botao));
      });
      // o nome é só o texto do chip, sem o número (firstChild = o texto antes do número)
      aplicar(botao.getAttribute('data-filtro'), botao.firstChild.textContent.trim());
    });

    function combina(el, categoria) {
      return categoria === 'todos' || el.getAttribute('data-categoria') === categoria;
    }

    function aplicar(categoria, nome) {
      var itens = (destaque ? [destaque] : []).concat(cards);
      var saem = itens.filter(function (el) { return !el.hidden; });
      var saida = V.podeMover() && saem.length
        ? V.animar(saem, { opacity: 0, transform: 'translateY(4px)' }, { duration: 0.12, ease: V.EASE_OUT })
        : Promise.resolve();

      saida.then(function () {
        var visiveis = itens.filter(function (el) {
          el.hidden = !combina(el, categoria);
          return !el.hidden;
        });
        if (vazio) vazio.hidden = visiveis.length > 0;
        if (V.podeMover()) {
          V.animar(visiveis, { opacity: [0, 1], transform: ['translateY(10px) scale(0.98)', 'translateY(0) scale(1)'] },
            { duration: 0.4, ease: V.EASE_OUT, delay: Motion.stagger(0.05) })
            .then(function () { visiveis.forEach(function (el) { el.style.transform = ''; }); });
        } else {
          visiveis.forEach(function (el) { el.style.opacity = '1'; });
        }
        var n = visiveis.length;
        status.textContent = (n === 1 ? '1 alerta' : n + ' alertas') +
          (categoria === 'todos' ? ' no total.' : ' em ' + nome + '.');
      });
    }
  }

  /* =========================================================
     3. PÁGINA DE UM ALERTA
     ========================================================= */
  function prepararLeitura() {
    var barra = $('[data-leitura]');
    var artigo = $('[data-artigo]');
    if (!barra || !artigo) return;
    var pedido = null;

    // Quanto do texto já passou pela tela (de 0 a 1)
    function atualizar() {
      pedido = null;
      var caixa = artigo.getBoundingClientRect();
      var percorrido = window.innerHeight * 0.6 - caixa.top;
      var fracao = Math.min(Math.max(percorrido / caixa.height, 0), 1);
      barra.style.transform = 'scaleX(' + fracao.toFixed(4) + ')';
    }

    window.addEventListener('scroll', function () {
      if (!pedido) pedido = requestAnimationFrame(atualizar);
    }, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();
  }

  function prepararCompartilhar() {
    $$('[data-compartilhar]').forEach(function (botao) {
      botao.addEventListener('click', function () {
        V.compartilhar({
          titulo: document.title,
          texto: botao.getAttribute('data-compartilhar') || '',
          url: window.location.href.split('#')[0]
        });
      });
    });
  }

  prepararUltimos();
  prepararFiltro();
  prepararLeitura();
  prepararCompartilhar();
})();

/* =========================================================
   ACESSIBILIDADE (painel do menu e rodapé do menu do celular)
   ---------------------------------------------------------
   1. Tamanho do texto: A− / A / A+ (100%, 112,5%, 125%, 137,5%).
      Muda a variável --escala-texto do <html>; como o site usa
      rem em tudo, textos e espaços crescem juntos.
   2. Alto contraste: interruptor que liga data-contraste="alto"
      no <html> (cores em css/acessibilidade.css).
   3. Aparência: claro/escuro (a mesma troca de js/components.js).
   4. Menu compacto: com o texto maior, o menu completo da ilha
      só cabe numa tela mais larga. Até lá, a ilha usa o botão
      do menu de tela cheia (classe menu-compacto no <html>).

   As escolhas ficam salvas neste navegador ("vestigio-texto" e
   "vestigio-contraste"). O script MOLDE-TEMA do <head> aplica as
   duas ANTES de a página aparecer, para não "piscar".
   Cada controle pode aparecer mais de uma vez (ilha e celular):
   todos ficam sincronizados.
   ========================================================= */

(function () {
  'use strict';

  var V = window.Vestigio || {};
  var html = document.documentElement;
  // Precisa ser igual ao NIVEIS do script MOLDE-TEMA (index.html)
  var NIVEIS = [1, 1.125, 1.25, 1.375];
  var CHAVE_TEXTO = 'vestigio-texto';
  var CHAVE_CONTRASTE = 'vestigio-contraste';

  function $$(seletor, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor));
  }

  function guardar(chave, valor) {
    try {
      if (valor === null) localStorage.removeItem(chave);
      else localStorage.setItem(chave, valor);
    } catch (e) { /* aba anônima: vale só nesta visita */ }
  }

  function podeMover() {
    return typeof Motion !== 'undefined' && !reduzirMovimento();
  }

  /* ---------- 1. Tamanho do texto ---------- */
  function nivelAtual() {
    var n = parseInt(html.getAttribute('data-texto'), 10);
    return n > 0 && n < NIVEIS.length ? n : 0;
  }

  function porcentagem(n) {
    // 1.125 → "112,5%"
    return String(NIVEIS[n] * 100).replace('.', IDIOMA === 'en' ? '.' : ',') + '%';
  }

  function ajustarMenu() {
    var n = nivelAtual();
    html.classList.toggle('menu-compacto', n > 0 && window.innerWidth < 1280 * NIVEIS[n]);
  }

  function aplicarTexto(n) {
    if (n > 0) {
      html.style.setProperty('--escala-texto', NIVEIS[n]);
      html.setAttribute('data-texto', n);
    } else {
      html.style.removeProperty('--escala-texto');
      html.removeAttribute('data-texto');
    }
    ajustarMenu();
    marcarTexto();
  }

  function marcarTexto() {
    var n = nivelAtual();
    // aria-disabled (e não disabled): o botão no limite continua com o foco do teclado
    $$('[data-a11y-texto="menos"]').forEach(function (b) { b.setAttribute('aria-disabled', String(n === 0)); });
    $$('[data-a11y-texto="normal"]').forEach(function (b) { b.setAttribute('aria-pressed', String(n === 0)); });
    $$('[data-a11y-texto="mais"]').forEach(function (b) { b.setAttribute('aria-disabled', String(n === NIVEIS.length - 1)); });
    $$('[data-a11y-nivel]').forEach(function (el) { el.textContent = porcentagem(n); });
  }

  $$('[data-a11y-texto]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var acao = botao.getAttribute('data-a11y-texto');
      var n = nivelAtual();
      if (acao === 'menos') n = Math.max(0, n - 1);
      if (acao === 'mais') n = Math.min(NIVEIS.length - 1, n + 1);
      if (acao === 'normal') n = 0;
      aplicarTexto(n);
      guardar(CHAVE_TEXTO, n > 0 ? String(n) : null);
    });
  });

  window.addEventListener('resize', ajustarMenu);

  /* ---------- 2. Alto contraste ---------- */
  function marcarContraste() {
    var ligado = html.getAttribute('data-contraste') === 'alto';
    $$('[data-a11y-contraste]').forEach(function (chave) {
      chave.setAttribute('aria-checked', String(ligado));
    });
  }

  $$('[data-a11y-contraste]').forEach(function (chave) {
    chave.addEventListener('click', function () {
      var ligar = html.getAttribute('data-contraste') !== 'alto';
      if (ligar) html.setAttribute('data-contraste', 'alto');
      else html.removeAttribute('data-contraste');
      guardar(CHAVE_CONTRASTE, ligar ? 'alto' : null);
      marcarContraste();
    });
  });

  /* ---------- 3. Aparência (claro/escuro) ---------- */
  function marcarTema() {
    var tema = html.getAttribute('data-theme');
    $$('[data-a11y-tema]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-a11y-tema') === tema));
    });
  }

  $$('[data-a11y-tema]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      if (V.trocarTema) V.trocarTema(botao.getAttribute('data-a11y-tema'));
    });
  });

  // O tema pode mudar por outro seletor: os botões acompanham
  new MutationObserver(marcarTema).observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- Painel da ilha (abre no clique, como os seletores) ---------- */
  var raiz = document.querySelector('[data-a11y]');
  if (raiz) {
    var botao = raiz.querySelector('[data-a11y-botao]');
    var painel = raiz.querySelector('[data-a11y-painel]');
    var aberto = false;

    var abrir = function () {
      if (aberto) return;
      aberto = true;
      painel.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      if (podeMover()) {
        Motion.animate(painel, { opacity: [0, 1], transform: ['translateY(-6px)', 'translateY(0px)'] },
          { duration: RITMO.rapido, ease: RITMO.suave });
      }
    };

    var fechar = function (voltarAoBotao) {
      if (!aberto) return;
      aberto = false;
      botao.setAttribute('aria-expanded', 'false');
      if (voltarAoBotao) botao.focus();
      if (podeMover()) {
        Motion.animate(painel, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-4px)'] },
          { duration: 0.16, ease: RITMO.acelera }).finished.then(function () {
          if (!aberto) painel.hidden = true;
        });
      } else {
        painel.hidden = true;
      }
    };

    botao.addEventListener('click', function () {
      if (aberto) fechar(false);
      else abrir();
    });

    raiz.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && aberto) { evento.preventDefault(); fechar(true); }
    });

    // O foco saiu do painel (Tab adiante): fecha
    raiz.addEventListener('focusout', function (evento) {
      if (aberto && evento.relatedTarget && !raiz.contains(evento.relatedTarget)) fechar(false);
    });

    document.addEventListener('click', function (evento) {
      if (aberto && !raiz.contains(evento.target)) fechar(false);
    });
  }

  /* ---------- Começo ---------- */
  ajustarMenu();
  marcarTexto();
  marcarContraste();
  marcarTema();
})();

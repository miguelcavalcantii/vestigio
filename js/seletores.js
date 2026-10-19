/* =========================================================
   SELETORES DE IDIOMA E DE TEMA (botões com menu)
   ---------------------------------------------------------
   Os dois funcionam igual: um botão em forma de pílula (ícone
   + setinha) que abre um menu pequeno.
   - Abrir um menu fecha o outro.
   - Fecha ao escolher, ao clicar fora, com Esc ou com Tab.
   - Teclado: Enter/Espaço/seta para baixo abrem; as setas andam
     entre as opções; Home/End vão para a primeira/última.
   - A setinha gira 180° com a Motion. Com "reduzir movimento"
     ligado no sistema, nada anima (o menu só aparece e some).

   IDIOMA: cada opção leva para a MESMA página no outro idioma.
   O endereço vem das tags <link rel="alternate" hreflang> do
   <head>. A escolha fica guardada neste navegador
   ("vestigio-idioma") e só é usada quando a pessoa abre o
   endereço principal do site (script IDIOMA-SALVO no <head> do
   index.html). Não olhamos o idioma do navegador.

   TEMA: "Claro" ou "Escuro". A troca e a escolha salva
   ("vestigio-tema") são as mesmas de sempre (js/components.js).
   ========================================================= */

(function () {
  'use strict';

  var CHAVE_IDIOMA = 'vestigio-idioma';
  var seletores = Array.prototype.slice.call(document.querySelectorAll('[data-seletor]'));
  if (!seletores.length) return;

  var V = window.Vestigio || {};
  var temMotion = typeof Motion !== 'undefined';
  // Aqui vale o "reduzir movimento" do sistema, mesmo com as animações do site ligadas
  var semMovimento = reduzirMovimento() ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anima = temMotion && !semMovimento;

  /* ---------- Idioma: endereço da mesma página no outro idioma ----------
     O caminho vem da tag hreflang (ex.: "/en/services/romance-scam.html") e é
     montado a partir da pasta do site em que a pessoa está: assim funciona no
     domínio oficial, nas prévias e até abrindo os arquivos no computador. */
  var RAIZ_SITE = document.documentElement.getAttribute('data-raiz-site') ||
    document.documentElement.getAttribute('data-raiz') || '';

  function enderecoEm(idioma) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + (idioma === 'en' ? 'en' : 'pt-BR') + '"]');
    if (!link) return null;
    try {
      var caminho = new URL(link.getAttribute('href')).pathname.replace(/^\//, '');
      var destino = new URL(RAIZ_SITE + caminho, location.href);
      return destino.href.replace(/#.*$/, '') + location.hash;
    } catch (e) {
      return null;
    }
  }

  function guardarIdioma(idioma) {
    try { localStorage.setItem(CHAVE_IDIOMA, idioma); } catch (e) { /* aba anônima: tudo bem */ }
  }

  /* ---------- Um seletor (botão + menu) ---------- */
  var todos = [];

  function criar(raiz) {
    var tipo = raiz.getAttribute('data-seletor');
    var botao = raiz.querySelector('[data-seletor-botao]');
    var menu = raiz.querySelector('[data-seletor-menu]');
    var seta = raiz.querySelector('[data-seletor-seta]');
    var opcoes = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitemradio"]'));
    var aberto = false;
    var paraCima = !!raiz.closest('.mobile-menu__theme');

    if (anima && seta) seta.setAttribute('data-motion', '');

    function girarSeta(abrindo) {
      if (!anima || !seta) return;
      Motion.animate(seta, { transform: abrindo ? 'rotate(180deg)' : 'rotate(0deg)' },
        { duration: RITMO.medio, ease: RITMO.suave });
    }

    function escolhida() {
      return opcoes.filter(function (o) { return o.getAttribute('aria-checked') === 'true'; })[0] || opcoes[0];
    }

    function abrir(focarOpcao) {
      if (aberto) return;
      todos.forEach(function (outro) { if (outro !== controle) outro.fechar(false); });
      aberto = true;
      menu.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      girarSeta(true);
      if (anima) {
        Motion.animate(menu,
          { opacity: [0, 1], transform: ['translateY(' + (paraCima ? 6 : -6) + 'px)', 'translateY(0px)'] },
          { duration: RITMO.rapido, ease: RITMO.suave });
      }
      if (focarOpcao) escolhida().focus();
    }

    function fechar(voltarAoBotao) {
      if (!aberto) return;
      aberto = false;
      botao.setAttribute('aria-expanded', 'false');
      girarSeta(false);
      if (voltarAoBotao) botao.focus();
      if (anima) {
        Motion.animate(menu,
          { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(' + (paraCima ? 4 : -4) + 'px)'] },
          { duration: 0.16, ease: RITMO.acelera }).finished.then(function () {
          if (!aberto) menu.hidden = true;
        });
      } else {
        menu.hidden = true;
      }
    }

    botao.addEventListener('click', function () {
      if (aberto) fechar(false);
      else abrir(false);
    });

    botao.addEventListener('keydown', function (evento) {
      if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
        evento.preventDefault();
        abrir(true);
      }
    });

    menu.addEventListener('keydown', function (evento) {
      var i = opcoes.indexOf(document.activeElement);
      if (evento.key === 'Escape') { evento.preventDefault(); fechar(true); return; }
      if (evento.key === 'ArrowDown') { evento.preventDefault(); opcoes[(i + 1) % opcoes.length].focus(); }
      if (evento.key === 'ArrowUp') { evento.preventDefault(); opcoes[(i - 1 + opcoes.length) % opcoes.length].focus(); }
      if (evento.key === 'Home') { evento.preventDefault(); opcoes[0].focus(); }
      if (evento.key === 'End') { evento.preventDefault(); opcoes[opcoes.length - 1].focus(); }
      // Espaço também escolhe (nos links ele rolaria a página)
      if (evento.key === ' ' && i > -1) { evento.preventDefault(); opcoes[i].click(); }
      if (evento.key === 'Tab') fechar(false);
    });

    // Esc com o foco no botão também fecha
    raiz.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && aberto) fechar(true);
    });

    /* ---------- Opções ---------- */
    if (tipo === 'idioma') {
      opcoes.forEach(function (opcao) {
        var idioma = opcao.getAttribute('data-idioma-opcao');
        var atual = idioma === IDIOMA;
        opcao.setAttribute('aria-checked', String(atual));
        var destino = enderecoEm(idioma);
        if (destino) opcao.setAttribute('href', destino);

        opcao.addEventListener('click', function (evento) {
          if (atual) {
            // Já está neste idioma: só fecha
            evento.preventDefault();
            fechar(true);
            return;
          }
          guardarIdioma(idioma);
          fechar(false);
          // Confere o endereço na hora do clique (a seção atual, ex.: #servicos, vai junto)
          var agora = enderecoEm(idioma);
          if (agora) opcao.setAttribute('href', agora);
          else evento.preventDefault();
        });
      });
    }

    if (tipo === 'tema') {
      opcoes.forEach(function (opcao) {
        opcao.addEventListener('click', function () {
          var tema = opcao.getAttribute('data-tema-opcao');
          fechar(true);
          // A troca marca a opção certa em todos os seletores (aplicarTema em components.js)
          if (V.trocarTema) V.trocarTema(tema);
        });
      });
    }

    var controle = { raiz: raiz, fechar: fechar, aberto: function () { return aberto; } };
    return controle;
  }

  todos = seletores.map(criar);

  // Clique fora fecha o menu aberto
  document.addEventListener('click', function (evento) {
    todos.forEach(function (s) {
      if (s.aberto() && !s.raiz.contains(evento.target)) s.fechar(false);
    });
  });
})();

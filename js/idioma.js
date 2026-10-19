/* =========================================================
   SELETOR DE IDIOMA (Português do Brasil / English)
   ---------------------------------------------------------
   - O botão mostra só a bandeira do idioma da página (o CSS
     escolhe a bandeira pelo <html lang>).
   - Ao clicar, abre um menu pequeno com as duas opções.
   - Cada opção leva para a MESMA página no outro idioma. O
     endereço vem das tags <link rel="alternate" hreflang> do
     <head> (as mesmas que o Google usa).
   - A escolha fica guardada neste navegador ("vestigio-idioma").
     Ela só é usada quando a pessoa abre o endereço principal do
     site (script IDIOMA-SALVO no <head> do index.html). Não
     olhamos o idioma do navegador.
   - Teclado: Enter/Espaço/seta para baixo abrem; setas andam
     entre as opções; Esc fecha e volta para o botão.
   ========================================================= */

(function () {
  'use strict';

  var CHAVE = 'vestigio-idioma';
  var seletores = Array.prototype.slice.call(document.querySelectorAll('[data-idioma]'));
  if (!seletores.length) return;

  var temMotion = typeof Motion !== 'undefined';
  var calmo = reduzirMovimento();

  // Endereço da página no idioma pedido. O caminho vem da tag hreflang
  // (ex.: "/en/services/romance-scam.html") e é montado a partir da pasta
  // do site em que a pessoa está: assim funciona no domínio oficial, nas
  // prévias e até abrindo os arquivos no computador.
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

  function guardar(idioma) {
    try { localStorage.setItem(CHAVE, idioma); } catch (e) { /* aba anônima: tudo bem */ }
  }

  seletores.forEach(function (raiz) {
    var botao = raiz.querySelector('[data-idioma-botao]');
    var menu = raiz.querySelector('[data-idioma-menu]');
    var opcoes = Array.prototype.slice.call(raiz.querySelectorAll('[data-idioma-opcao]'));
    var aberto = false;

    botao.setAttribute('aria-label', IDIOMA === 'en' ? 'Language: English' : 'Idioma: Português (Brasil)');

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
        guardar(idioma);
        // Confere o endereço na hora do clique (a seção atual, ex.: #servicos, vai junto)
        var agora = enderecoEm(idioma);
        if (agora) opcao.setAttribute('href', agora);
        else if (opcao.getAttribute('href') === '#') evento.preventDefault();
      });
    });

    function abrir(focarPrimeira) {
      if (aberto) return;
      aberto = true;
      menu.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      if (temMotion && !calmo) {
        var paraCima = !!raiz.closest('.mobile-menu__idioma');
        Motion.animate(menu,
          { opacity: [0, 1], transform: ['translateY(' + (paraCima ? 6 : -6) + 'px) scale(0.96)', 'translateY(0px) scale(1)'] },
          { duration: RITMO.rapido, ease: RITMO.suave });
      }
      var alvo = opcoes.filter(function (o) { return o.getAttribute('aria-checked') === 'true'; })[0] || opcoes[0];
      if (focarPrimeira) alvo.focus();
    }

    function fechar(voltarAoBotao) {
      if (!aberto) return;
      aberto = false;
      menu.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
      if (voltarAoBotao) botao.focus();
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
      if (evento.key === 'Tab') fechar(false);
    });

    // Clique fora fecha
    document.addEventListener('click', function (evento) {
      if (aberto && !raiz.contains(evento.target)) fechar(false);
    });
    // Esc com o foco no botão também fecha
    raiz.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && aberto) fechar(true);
    });
  });
})();

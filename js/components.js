/* =========================================================
   COMPONENTES INTERATIVOS
   ---------------------------------------------------------
   1. Ícones
   2. Links do WhatsApp e dados de contato (vêm do config.js)
   3. Cabeçalho que muda ao rolar + link ativo do menu
   4. Menu do celular
   5. Abas e cards de serviço (vêm do services.js)
   6. Painel de detalhe do serviço
   7. Acordeão de dúvidas
   8. Botão flutuante do WhatsApp
   9. Tema claro / escuro
   10. Aviso rápido ("Link copiado") e botão Compartilhar
   11. "Caixa de ferramentas" para os outros arquivos (window.Vestigio)

   As animações usam a biblioteca Motion (js/vendor/motion.js).
   Se a pessoa pediu "reduzir movimento" no sistema, nada
   desliza: os elementos só aparecem/somem com opacidade.

   Este arquivo roda em TODAS as páginas (início, serviços,
   alertas). Cada parte confere se o elemento existe antes
   de mexer nele, por isso nada quebra numa página sem ele.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Ajudantes ---------- */

  // Curvas de animação (as mesmas do variables.css)
  var EASE_OUT = RITMO.suave;
  var EASE_DRAWER = RITMO.fluida;

  var telaGrande = window.matchMedia('(min-width: 768px)');

  // Pode animar com movimento? (biblioteca carregada e sem "reduzir movimento").
  // reduzirMovimento() fica em js/config.js (interruptor animacoesSempre).
  function podeMover() {
    return typeof Motion !== 'undefined' && !reduzirMovimento();
  }

  // Animação segura: se a Motion não carregou, só aplica o estado final.
  function animar(elementos, valores, opcoes) {
    if (typeof Motion === 'undefined') return Promise.resolve();
    return Motion.animate(elementos, valores, opcoes).finished;
  }

  // Busca um elemento pelo seletor (atalho)
  function $(seletor, raiz) {
    return (raiz || document).querySelector(seletor);
  }

  function $$(seletor, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor));
  }

  // Evita que textos dos dados quebrem o HTML (troca < > & " por códigos)
  function escapar(texto) {
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Número com dois dígitos: 1 vira "01"
  function doisDigitos(n) {
    return n < 10 ? '0' + n : String(n);
  }

  // "Raiz" do site a partir da página atual. No index.html é "" e nas
  // páginas das pastas servicos/ e alertas/ é "../" (vem do atributo
  // data-raiz no <html>). Serve para montar links que funcionam em todas.
  var RAIZ = document.documentElement.getAttribute('data-raiz') || '';
  // Raiz da pasta do site (assets, css, js). Nas páginas em inglês
  // (pasta en/) ela fica um nível acima da raiz do idioma.
  var RAIZ_SITE = document.documentElement.getAttribute('data-raiz-site') || RAIZ;

  // Endereço da página de um serviço (a função paginaDoServico fica em services.js)
  function linkDaPagina(servico) {
    return RAIZ + PASTAS.servicos + paginaDoServico(servico);
  }

  // Tira acentos e deixa tudo minúsculo: "Número" vira "numero".
  // Assim a busca acha "numero novo" mesmo sem acento.
  function semAcento(texto) {
    return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /* =========================================================
     1. ÍCONES
     Monta o <svg> de um ícone do arquivo icons.js
     ========================================================= */
  function icone(nome) {
    var miolo = ICONS[nome];
    if (!miolo) return '';
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + miolo + '</svg>';
  }

  // Preenche todo elemento com data-icon="nome" que ainda está vazio
  function preencherIcones(raiz) {
    $$('[data-icon]', raiz).forEach(function (el) {
      if (!el.firstElementChild) el.innerHTML = icone(el.getAttribute('data-icon'));
    });
  }

  /* =========================================================
     2. WHATSAPP E DADOS DE CONTATO
     ========================================================= */
  function prepararContato() {
    // Todo link com data-whatsapp recebe o link certo.
    // Se tiver data-msg="...", usa essa mensagem.
    // Se tiver data-msg-config="nome", usa CONFIG.nome (ex.: mensagemUrgente).
    // Os que têm data-montador abrem o painel de mensagem primeiro:
    // neles o link fica guardado em data-href (o href não leva ao
    // WhatsApp; veja js/montador-whatsapp.js)
    $$('[data-whatsapp]').forEach(function (link) {
      var url = linkWhatsApp(link.getAttribute('data-msg') || CONFIG[link.getAttribute('data-msg-config')]);
      if (link.hasAttribute('data-montador')) {
        link.setAttribute('data-href', url);
        link.removeAttribute('target');
      } else {
        link.href = url;
      }
    });

    // Textos com data-config="email" etc. vêm do config.js
    $$('[data-config]').forEach(function (el) {
      var chave = el.getAttribute('data-config');
      if (!CONFIG[chave]) return;
      el.textContent = CONFIG[chave];
      // E-mail: se precisar quebrar a linha, quebra logo depois do @
      if (chave === 'email' && CONFIG.email.indexOf('@') > 0) {
        var partes = CONFIG.email.split('@');
        el.textContent = partes[0] + '@';
        el.appendChild(document.createElement('wbr'));
        el.appendChild(document.createTextNode(partes[1]));
      }
    });

    $$('[data-mailto]').forEach(function (link) {
      link.href = 'mailto:' + CONFIG.email;
    });

    // Ano atual no rodapé
    $$('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* =========================================================
     3. CABEÇALHO
     IntersectionObserver avisa quando um elemento entra ou
     sai da tela, sem ficar "escutando" cada rolagem.
     ========================================================= */
  function prepararCabecalho() {
    var cabecalho = $('[data-header]');
    var marcador = $('.scroll-sentinel');
    if (!cabecalho || !marcador) return;

    // Quando o marcador do topo some da tela, o cabeçalho ganha fundo
    new IntersectionObserver(function (entradas) {
      cabecalho.classList.toggle('is-scrolled', !entradas[0].isIntersecting);
    }).observe(marcador);

    // Destaca no menu a seção que está no meio da tela.
    // Só vale para links desta mesma página (href="#secao"); o botão
    // "Serviços" usa data-secao. Nas outras páginas não há seções.
    var links = $$('.main-nav a, .main-nav [data-secao]').filter(function (el) {
      return (el.getAttribute('data-secao') || el.getAttribute('href') || '').charAt(0) === '#';
    });
    function alvoDo(el) { return el.getAttribute('data-secao') || el.getAttribute('href'); }
    var secoes = links
      .map(function (link) { return $(alvoDo(link)); })
      .filter(Boolean);

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var id = '#' + entrada.target.id;
        links.forEach(function (link) {
          var atual = alvoDo(link) === id;
          // aria-current é para links; no botão usamos só a classe
          if (link.tagName === 'A') {
            if (atual) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          }
          link.classList.toggle('is-atual', atual);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    secoes.forEach(function (secao) { observador.observe(secao); });
  }

  /* =========================================================
     4. MENU DO CELULAR
     ========================================================= */
  function prepararMenu() {
    var botao = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    var rotulo = $('[data-menu-label]');
    if (!botao || !menu) return;

    var aberto = false;
    // Tudo que fica "atrás" do menu (o botão de voltar ao topo é criado
    // depois, por js/navegacao.js, por isso é buscado na hora)
    function fundo() {
      return [$('main'), $('.site-footer'), $('.wa-float'), $('.topo'), $('.wa-dial')];
    }

    function abrir() {
      aberto = true;
      menu.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      rotulo.textContent = T('Fechar menu');
      document.documentElement.classList.add('is-locked');
      // "inert" impede o Tab de ir para o conteúdo escondido atrás do menu
      fundo().forEach(function (el) { if (el) el.inert = true; });

      // Só os itens principais (o link ou o botão "Serviços"), não a sublista
      var links = $$('.mobile-menu__list > li > a, .mobile-menu__list > li > button', menu);
      var topo = $('.mobile-menu__top', menu);
      var rodape = $('.mobile-menu__footer', menu);
      if (podeMover()) {
        // A tela "desce" como uma cortina e os links entram em sequência
        animar(menu, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 0.4, ease: EASE_DRAWER });
        if (topo) animar(topo, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] },
          { duration: 0.45, ease: EASE_OUT, delay: 0.1 });
        // Cada link sobe de dentro de uma "máscara" (o <li> esconde o que sai dele)
        animar(links, { transform: ['translateY(110%)', 'translateY(0)'] },
          { duration: 0.6, ease: EASE_DRAWER, delay: Motion.stagger(0.05, { startDelay: 0.12 }) });
        animar(rodape, { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'] },
          { duration: 0.5, ease: EASE_OUT, delay: 0.38 });
      } else {
        animar(menu, { opacity: [0, 1] }, { duration: 0.15 });
      }
      $('a, button', menu).focus();
    }

    function fechar(devolverFoco) {
      if (!aberto) return;
      aberto = false;
      botao.setAttribute('aria-expanded', 'false');
      rotulo.textContent = T('Abrir menu');
      document.documentElement.classList.remove('is-locked');
      fundo().forEach(function (el) { if (el) el.inert = false; });

      // A saída é mais rápida que a entrada
      var saida = podeMover()
        ? animar(menu, { clipPath: 'inset(0 0 100% 0)' }, { duration: 0.24, ease: EASE_OUT })
        : animar(menu, { opacity: 0 }, { duration: 0.12 });

      saida.then(function () {
        if (!aberto) {
          menu.hidden = true;
          menu.style.clipPath = '';
          menu.style.opacity = '';
        }
      });
      if (devolverFoco) botao.focus();
    }

    botao.addEventListener('click', function () {
      if (aberto) fechar(false);
      else abrir();
    });

    // Clicar num link fecha o menu (e a página rola até a seção).
    // Botões que abrem um painel (data-urgente, data-montador) também fecham.
    menu.addEventListener('click', function (evento) {
      if (evento.target.closest('a, [data-urgente], [data-montador]')) fechar(false);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && aberto) fechar(true);
    });

    // Se a tela crescer (ex.: girar o tablet), fecha o menu.
    // 1280px é onde o menu completo aparece (mesmo valor do CSS).
    menuCompleto.addEventListener('change', function (m) {
      if (m.matches) fechar(false);
    });

    // Outros arquivos podem fechar o menu (ex.: ao abrir um painel)
    fecharMenu = function () { fechar(false); };
  }

  var fecharMenu = function () {};
  var menuCompleto = window.matchMedia('(min-width: 1280px)');

  /* =========================================================
     5. ABAS E CARDS DE SERVIÇO
     ========================================================= */
  var gradeServicos;
  var trocaAtual = 0; // evita conflito se a pessoa clicar rápido em várias abas

  // Procura um serviço pelo id na lista do services.js
  function buscarServico(id) {
    for (var i = 0; i < SERVICOS.length; i++) {
      if (SERVICOS[i].id === id) return SERVICOS[i];
    }
    return null;
  }

  function nomeDaCategoria(id) {
    for (var i = 0; i < CATEGORIAS.length; i++) {
      if (CATEGORIAS[i].id === id) return CATEGORIAS[i].nome;
    }
    return '';
  }

  // Coloca <mark> em volta do trecho buscado, ignorando acentos e
  // maiúsculas. Ex.: destacar("Número usado", "numero") devolve
  // "<mark>Número</mark> usado". Cada palavra buscada é destacada.
  function destacar(texto, termo) {
    if (!termo) return escapar(texto);
    var palavras = semAcento(termo).split(/\s+/).filter(Boolean);
    // Versão "sem acento" do texto, letra por letra (mesmo tamanho do original)
    var base = '';
    for (var i = 0; i < texto.length; i++) base += semAcento(texto[i]).charAt(0) || ' ';

    // Marca quais letras entram no destaque
    var marcar = [];
    palavras.forEach(function (p) {
      var inicio = base.indexOf(p);
      while (inicio > -1) {
        for (var j = inicio; j < inicio + p.length; j++) marcar[j] = true;
        inicio = base.indexOf(p, inicio + p.length);
      }
    });

    var html = '';
    var aberto = false;
    for (var k = 0; k < texto.length; k++) {
      if (marcar[k] && !aberto) { html += '<mark class="busca-marca">'; aberto = true; }
      if (!marcar[k] && aberto) { html += '</mark>'; aberto = false; }
      html += escapar(texto[k]);
    }
    if (aberto) html += '</mark>';
    return html;
  }

  // HTML de um card. O número do "caso" é a posição na lista geral.
  // "termo" (opcional) é o texto da busca, destacado no nome.
  function htmlDoCard(servico, termo) {
    var numero = doisDigitos(SERVICOS.indexOf(servico) + 1);
    // Estrutura de "moldura dupla": casca (.bezel) + núcleo (.bezel__core)
    return (
      '<article class="service-card bezel" data-reveal-item>' +
        '<div class="bezel__core">' +
          '<div class="service-card__top">' +
            '<span class="service-card__icon">' + icone(servico.icone) + '</span>' +
            '<span class="mono">' + T('Caso') + ' ' + numero + '</span>' +
          '</div>' +
          '<h3><button class="service-card__button" type="button" data-service="' + escapar(servico.id) + '" aria-haspopup="dialog">' +
            destacar(servico.nome, termo) +
          '</button></h3>' +
          '<p>' + escapar(servico.resumo) + '</p>' +
          '<span class="service-card__more" aria-hidden="true">' + T('Ver detalhes') +
            '<span class="btn__orb">' + icone('arrow-up-right') + '</span>' +
          '</span>' +
        '</div>' +
      '</article>'
    );
  }

  function servicosDaCategoria(categoria) {
    if (categoria === 'todos') return SERVICOS;
    return SERVICOS.filter(function (s) { return s.categoria === categoria; });
  }

  // Busca: devolve os serviços em que TODAS as palavras digitadas
  // aparecem no nome, no resumo ou nas palavras-chave (services.js)
  function buscarServicos(termo) {
    var palavras = semAcento(termo).split(/\s+/).filter(Boolean);
    if (!palavras.length) return SERVICOS.slice();
    return SERVICOS.filter(function (s) {
      var onde = semAcento([s.nome, s.resumo].concat(s.palavrasChave || []).join(' '));
      return palavras.every(function (p) { return onde.indexOf(p) > -1; });
    });
  }

  // Troca dos cards: os antigos saem rápido, os novos entram em sequência.
  // É a mesma animação para a troca de abas e para a busca.
  //   lista  = os serviços que devem aparecer
  //   termo  = texto da busca (para destacar no nome), ou vazio
  //   animar = false na busca enquanto a pessoa digita rápido
  function trocarCards(lista, termo) {
    var minhaTroca = ++trocaAtual;
    var antigos = $$('.service-card', gradeServicos);

    var saida = podeMover() && antigos.length
      ? animar(antigos, { opacity: 0, transform: 'translateY(4px)' }, { duration: 0.12, ease: EASE_OUT })
      : Promise.resolve();

    saida.then(function () {
      if (minhaTroca !== trocaAtual) return; // outra troca começou nesse meio tempo
      gradeServicos.innerHTML = lista.map(function (s) { return htmlDoCard(s, termo); }).join('');
      var novos = $$('.service-card', gradeServicos);
      if (podeMover()) {
        // Os cards novos "estouram" como gelatina, um depois do outro
        animar(novos, { opacity: [0, 1], transform: ['translateY(10px) scale(0.98)', 'translateY(0) scale(1)'] },
          { duration: 0.4, ease: EASE_OUT, delay: Motion.stagger(0.04) })
          .then(function () { novos.forEach(function (c) { c.style.transform = ''; }); });
        // E passam a "estourar" de novo quando voltarem à tela pela rolagem
        if (window.revelarCards) window.revelarCards(novos, true);
      } else {
        novos.forEach(function (card) { card.style.opacity = '1'; });
      }
    });
  }

  // Ligações que a busca (js/busca-servicos.js) usa para mexer nos cards
  var controleServicos = null;

  function prepararServicos() {
    gradeServicos = $('[data-services-grid]');
    var listaAbas = $('[data-tabs]');
    if (!gradeServicos || !listaAbas) return;

    // Monta as abas: "Todos" + uma por categoria, com a quantidade
    var abas = [{ id: 'todos', nome: T('Todos') }].concat(CATEGORIAS);
    listaAbas.innerHTML = abas.map(function (aba, i) {
      var quantidade = servicosDaCategoria(aba.id).length;
      return (
        '<button class="tab" type="button" role="tab" id="aba-' + aba.id + '" data-tab="' + aba.id + '"' +
        ' aria-controls="painel-servicos" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
          escapar(aba.nome) + '<span class="tab__count" aria-hidden="true">' + doisDigitos(quantidade) + '</span>' +
        '</button>'
      );
    }).join('') + '<span class="tabs__indicator" aria-hidden="true"></span>';

    var botoes = $$('[role="tab"]', listaAbas);
    var indicador = $('.tabs__indicator', listaAbas);

    // A pílula azul desliza até a aba escolhida e toma a largura dela
    function moverIndicador(botao) {
      indicador.style.width = botao.offsetWidth + 'px';
      indicador.style.transform = 'translateX(' + botao.offsetLeft + 'px)';
    }

    // Marca a aba como escolhida (sem trocar os cards)
    function marcarAba(botao) {
      botoes.forEach(function (b) {
        var ativo = b === botao;
        b.setAttribute('aria-selected', String(ativo));
        b.tabIndex = ativo ? 0 : -1;
      });
      gradeServicos.setAttribute('aria-labelledby', botao.id);
      moverIndicador(botao);
    }

    function selecionar(botao, focar) {
      marcarAba(botao);
      if (focar) botao.focus();
      // Rola a barra de abas para mostrar a aba escolhida (celular)
      botao.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: podeMover() ? 'smooth' : 'auto' });
      // Escolher uma aba limpa a busca (avisamos o js/busca-servicos.js)
      document.dispatchEvent(new CustomEvent('vestigio:aba'));
      trocarCards(servicosDaCategoria(botao.getAttribute('data-tab')), '');
    }

    listaAbas.addEventListener('click', function (evento) {
      var botao = evento.target.closest('[role="tab"]');
      if (botao && botao.getAttribute('aria-selected') !== 'true') selecionar(botao, false);
    });

    // Teclado: setas, Home e End passam entre as abas
    listaAbas.addEventListener('keydown', function (evento) {
      var atual = botoes.indexOf(document.activeElement);
      if (atual < 0) return;
      var proximo = null;
      if (evento.key === 'ArrowRight') proximo = botoes[(atual + 1) % botoes.length];
      if (evento.key === 'ArrowLeft') proximo = botoes[(atual - 1 + botoes.length) % botoes.length];
      if (evento.key === 'Home') proximo = botoes[0];
      if (evento.key === 'End') proximo = botoes[botoes.length - 1];
      if (proximo) {
        evento.preventDefault();
        selecionar(proximo, true);
      }
    });

    // Primeiro desenho
    gradeServicos.setAttribute('aria-labelledby', botoes[0].id);
    gradeServicos.innerHTML = SERVICOS.map(function (s) { return htmlDoCard(s, ''); }).join('');
    // O indicador espera a fonte carregar para medir a largura certa
    moverIndicador(botoes[0]);
    if (document.fonts) document.fonts.ready.then(function () {
      moverIndicador($('[aria-selected="true"]', listaAbas));
    });
    window.addEventListener('resize', function () {
      moverIndicador($('[aria-selected="true"]', listaAbas));
    });

    // Clique em um card abre o painel de detalhe
    gradeServicos.addEventListener('click', function (evento) {
      var card = evento.target.closest('.service-card');
      if (!card) return;
      var botao = $('[data-service]', card);
      abrirServico(botao.getAttribute('data-service'), botao);
    });

    controleServicos = {
      // Mostra o resultado da busca: volta para a aba "Todos" e troca os cards.
      // Devolve quantos serviços foram encontrados.
      mostrarBusca: function (termo) {
        var lista = buscarServicos(termo);
        if (botoes[0].getAttribute('aria-selected') !== 'true') marcarAba(botoes[0]);
        trocarCards(lista, termo.trim());
        return lista.length;
      }
    };
  }

  /* ---------- Atalhos do hero ("O que aconteceu com você?") ---------- */
  function prepararAtalhos() {
    $$('[data-quick]').forEach(function (botao) {
      var servico = buscarServico(botao.getAttribute('data-quick'));
      if (!servico) { botao.parentElement.remove(); return; }
      botao.innerHTML = icone(servico.icone) + escapar(servico.nome);
      botao.setAttribute('aria-haspopup', 'dialog');
      botao.addEventListener('click', function () { abrirServico(servico.id, botao); });
    });
  }

  /* =========================================================
     6. PAINÉIS (o detalhe do serviço, "Primeiros 30 minutos"
        e o montador de mensagem usam o MESMO padrão)
     ---------------------------------------------------------
     Cada painel é um <dialog class="sheet"> com uma caixa
     [data-sheet-panel] dentro. O <dialog> já prende o foco do
     teclado dentro do painel e fecha com a tecla Esc.
     - Celular: folha que sobe de baixo.
     - Telas maiores: painel que entra pela direita.
     Só um painel fica aberto por vez: se outro abrir, o
     primeiro fecha rápido antes.
     ========================================================= */
  var painelAberto = null;   // { dialog, gatilho }

  // Posição "fora da tela" do painel: pela direita (desktop) ou por baixo (celular)
  function posicaoEscondida() {
    return telaGrande.matches ? 'translateX(calc(100% + 24px))' : 'translateY(100%)';
  }

  // Liga os botões de fechar, a tecla Esc e o clique fora (uma vez por painel)
  function ligarPainel(dialog) {
    if (!dialog || dialog._ligado) return;
    dialog._ligado = true;
    $$('[data-sheet-close]', dialog).forEach(function (botao) {
      botao.addEventListener('click', function () { fecharPainel(dialog); });
    });
    // Tecla Esc: em vez de fechar de uma vez, fecha com animação
    dialog.addEventListener('cancel', function (evento) {
      evento.preventDefault();
      fecharPainel(dialog);
    });
    // Clique no fundo escuro (fora da caixa) fecha o painel
    dialog.addEventListener('click', function (evento) {
      if (evento.target === dialog) fecharPainel(dialog);
    });
  }

  // Abre um painel. "gatilho" é o botão que abriu: o foco volta para ele ao fechar.
  function abrirPainel(dialog, gatilho) {
    if (!dialog) return;
    ligarPainel(dialog);

    // Outro painel aberto? Fecha rápido e depois abre este.
    if (painelAberto && painelAberto.dialog !== dialog) {
      var anterior = painelAberto;
      // Se o botão estava DENTRO do painel anterior, o foco volta para
      // quem abriu o anterior (o botão de dentro vai sumir)
      if (!gatilho || anterior.dialog.contains(gatilho)) gatilho = anterior.gatilho;
      fecharPainel(anterior.dialog, true).then(function () { abrirPainel(dialog, gatilho); });
      return;
    }
    if (dialog.open) return;

    // Botões que somem quando o painel abre (menu do celular, painel de
    // serviços, opções do botão flutuante): o foco volta para quem abriu o menu
    if (gatilho && gatilho.closest('[data-mobile-menu]')) gatilho = $('[data-menu-toggle]');
    if (gatilho && gatilho.closest('[data-mega]')) gatilho = $('[data-mega-toggle]');
    if (gatilho && gatilho.closest('.wa-dial')) gatilho = $('[data-wa-float]');

    fecharMenu();
    painelAberto = { dialog: dialog, gatilho: gatilho };
    dialog._fechando = false;
    var caixa = $('[data-sheet-panel]', dialog);

    dialog.showModal();
    document.documentElement.classList.add('is-locked');
    // Esconde os botões flutuantes enquanto o painel está aberto
    document.documentElement.classList.add('sheet-open');

    // Um quadro depois, liga a transição do fundo escuro
    requestAnimationFrame(function () { dialog.classList.add('is-open'); });

    if (podeMover()) {
      animar(caixa, { transform: [posicaoEscondida(), 'translate(0, 0)'] }, { duration: 0.42, ease: EASE_DRAWER });
    } else {
      animar(caixa, { opacity: [0, 1] }, { duration: 0.18 });
    }

    // Leva o foco ao título: o leitor de tela anuncia qual painel abriu
    var foco = $('[data-painel-foco]', dialog) || $('h2', dialog);
    if (foco) foco.focus();
  }

  // Fecha um painel. "rapido" = sem devolver o foco (outro painel vai abrir).
  // Devolve uma Promise: dá para esperar o painel sumir.
  function fecharPainel(dialog, rapido) {
    if (!dialog || dialog._fechando || !dialog.open) return Promise.resolve();
    dialog._fechando = true;
    dialog.classList.remove('is-open');
    var caixa = $('[data-sheet-panel]', dialog);
    var gatilho = painelAberto && painelAberto.dialog === dialog ? painelAberto.gatilho : null;

    var saida = podeMover()
      ? animar(caixa, { transform: posicaoEscondida() }, { duration: rapido ? 0.18 : 0.26, ease: EASE_OUT })
      : animar(caixa, { opacity: 0 }, { duration: 0.12 });

    return saida.then(function () {
      dialog.close();
      caixa.style.transform = '';
      caixa.style.opacity = '';
      dialog._fechando = false;
      if (painelAberto && painelAberto.dialog === dialog) painelAberto = null;
      if (!painelAberto) document.documentElement.classList.remove('is-locked', 'sheet-open');
      if (!rapido && gatilho && document.contains(gatilho)) gatilho.focus();
    });
  }

  /* ---------- Painel de detalhe do serviço ---------- */
  var painel;

  function htmlDoDetalhe(servico) {
    var passos = servico.comoFunciona.map(function (p) {
      return '<li>' + escapar(p) + '</li>';
    }).join('');

    var precisamos = servico.precisamos.map(function (item) {
      return '<li>' + icone('check') + '<span>' + escapar(item) + '</span></li>';
    }).join('');

    var aviso = servico.aviso
      ? '<p class="sheet__note">' + icone('triangle-alert') + '<span>' + escapar(servico.aviso) + '</span></p>'
      : '';

    return TH(
      '<section class="sheet__section" aria-labelledby="sheet-oque">' +
        '<h3 id="sheet-oque">O que é</h3>' +
        '<p>' + escapar(servico.oQueE) + '</p>' +
      '</section>' +
      aviso +
      '<section class="sheet__section" aria-labelledby="sheet-como">' +
        '<h3 id="sheet-como">Como funciona</h3>' +
        '<ol role="list" class="sheet__steps">' + passos + '</ol>' +
      '</section>' +
      '<section class="sheet__section" aria-labelledby="sheet-precisamos">' +
        '<h3 id="sheet-precisamos">O que vamos precisar de você</h3>' +
        '<ul role="list" class="sheet__needs">' + precisamos + '</ul>' +
      '</section>' +
      '<p class="sheet__warning">' + icone('shield-check') +
        '<span>Nunca pedimos senhas, códigos de verificação ou acesso às suas contas.</span>' +
      '</p>' +
      // Link discreto para a página própria do serviço (pasta servicos/)
      '<a class="sheet__page-link" href="' + linkDaPagina(servico) + '">' +
        icone('file-text') + '<span>Abrir página do serviço</span>' + icone('arrow-up-right') +
      '</a>'
    );
  }

  function abrirServico(id, gatilho) {
    var servico = buscarServico(id);
    if (!servico || !painel) return false;

    // Preenche o painel
    $('[data-sheet-category]', painel).textContent = T('Categoria:') + ' ' + nomeDaCategoria(servico.categoria);
    $('[data-sheet-icon]', painel).innerHTML = icone(servico.icone);
    $('[data-sheet-title]', painel).textContent = servico.nome;
    var corpo = $('[data-sheet-body]', painel);
    corpo.innerHTML = htmlDoDetalhe(servico);
    corpo.scrollTop = 0;
    // O botão do rodapé abre o montador de mensagem já com este serviço
    // (o link do WhatsApp fica de reserva, caso o montador não carregue)
    var cta = $('[data-sheet-cta]', painel);
    cta.href = linkWhatsApp(CONFIG.mensagemServico.replace('{servico}', servico.nome));
    cta.setAttribute('data-montador', servico.id);

    abrirPainel(painel, gatilho);
    return true;
  }

  function prepararPainel() {
    painel = $('[data-sheet]');
    if (painel) ligarPainel(painel);
  }

  /* =========================================================
     7. ACORDEÃO (dúvidas)
     ========================================================= */
  function prepararAcordeao() {
    $$('.accordion__trigger').forEach(function (botao) {
      var painelResposta = document.getElementById(botao.getAttribute('aria-controls'));
      // Resposta fechada fica fora do Tab e do leitor de tela
      painelResposta.inert = true;

      botao.addEventListener('click', function () {
        var abrir = botao.getAttribute('aria-expanded') !== 'true';
        botao.setAttribute('aria-expanded', String(abrir));
        painelResposta.classList.toggle('is-open', abrir);
        painelResposta.inert = !abrir;
      });
    });
  }

  /* =========================================================
     8. BOTÃO FLUTUANTE DO WHATSAPP
     Aparece depois que o topo da página (o hero, ou o topo
     marcado com data-topo nas outras páginas) sai da tela e
     some quando um bloco com data-esconde-flutuante (ex.: a
     seção de contato, que já tem o botão) está visível.
     O clique e o menu de opções ficam em js/navegacao.js.
     ========================================================= */
  function prepararBotaoFlutuante() {
    var botao = $('[data-wa-float]');
    var topo = $('.hero') || $('[data-topo]');
    if (!botao || !topo) return;

    var topoVisivel = true;
    var blocosVisiveis = 0;   // quantos blocos "data-esconde-flutuante" estão na tela

    function atualizar() {
      var mostrar = !topoVisivel && blocosVisiveis === 0;
      botao.classList.toggle('is-visible', mostrar);
      botao.tabIndex = mostrar ? 0 : -1;
      // Avisa o js/navegacao.js (o menu de opções fecha se o botão sumir)
      document.dispatchEvent(new CustomEvent('vestigio:flutuante', { detail: { visivel: mostrar } }));
    }

    new IntersectionObserver(function (e) {
      topoVisivel = e[0].isIntersecting;
      atualizar();
    }, { rootMargin: '0px 0px -40% 0px' }).observe(topo);

    $$('[data-esconde-flutuante]').forEach(function (bloco) {
      var visivel = false;
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting !== visivel) {
          visivel = e[0].isIntersecting;
          blocosVisiveis += visivel ? 1 : -1;
          atualizar();
        }
      }, { threshold: 0.25 }).observe(bloco);
    });

    botao.tabIndex = -1;
  }

  /* =========================================================
     9. TEMA CLARO / ESCURO
     ---------------------------------------------------------
     O tema é o atributo data-theme no <html> ("dark" ou "light").
     As cores de cada tema ficam em css/variables.css.
     O primeiro tema é aplicado pelo script do <head> do
     index.html (antes dos estilos, para não piscar). Aqui fica
     só o botão de troca, com a passagem "esmaecida".
     ========================================================= */
  var CHAVE_TEMA = 'vestigio-tema';
  var COR_DO_FUNDO = { dark: '#0B0C10', light: '#F3F5F6' };   // a mesma do --bg de cada tema
  var DURACAO_TEMA = 450;                                     // ms (a mesma do CSS)

  function temaAtual() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  // Muda o tema na hora (sem animação) e atualiza os botões
  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COR_DO_FUNDO[tema]);
    // Marca a opção certa nos seletores de tema (js/seletores.js)
    $$('[data-tema-opcao]').forEach(function (opcao) {
      opcao.setAttribute('aria-checked', String(opcao.getAttribute('data-tema-opcao') === tema));
    });
  }

  // Guarda a escolha (pode falhar em aba anônima: por isso o try/catch)
  function salvarTema(tema) {
    try { localStorage.setItem(CHAVE_TEMA, tema); } catch (e) { /* sem problema */ }
  }

  // Plano B (navegador sem View Transitions): uma "cortina" na cor do
  // fundo do tema NOVO aparece, o tema troca por baixo e ela some.
  function trocarComCortina(novoTema) {
    var cortina = document.createElement('div');
    cortina.className = 'tema-cortina';
    cortina.style.background = COR_DO_FUNDO[novoTema];
    document.body.appendChild(cortina);
    document.documentElement.classList.add('trocando-tema');
    animar(cortina, { opacity: [0, 1] }, { duration: 0.2, ease: EASE_OUT }).then(function () {
      aplicarTema(novoTema);
      return animar(cortina, { opacity: [1, 0] }, { duration: 0.25, ease: EASE_OUT });
    }).then(function () {
      cortina.remove();
      document.documentElement.classList.remove('trocando-tema');
    });
  }

  // Troca com a página inteira "esmaecendo" de um tema para o outro
  function trocarTema(novoTema) {
    salvarTema(novoTema);
    if (reduzirMovimento()) {
      aplicarTema(novoTema);
      return;
    }
    if (!document.startViewTransition) {
      if (typeof Motion !== 'undefined') trocarComCortina(novoTema);
      else aplicarTema(novoTema);
      return;
    }
    // Durante a troca, as outras transições de cor ficam desligadas
    // (senão cada botão e card "atrasaria" a cor e apareceria um degradê)
    document.documentElement.classList.add('trocando-tema');
    var transicao = document.startViewTransition(function () {
      aplicarTema(novoTema);
    });
    transicao.finished.then(fimDaTroca, fimDaTroca);
  }

  function fimDaTroca() {
    document.documentElement.classList.remove('trocando-tema');
  }

  // Os seletores de tema (menu "Claro / Escuro") ficam em js/seletores.js
  // e chamam Vestigio.trocarTema. Aqui só marcamos a opção do tema atual.
  function prepararTema() {
    aplicarTema(temaAtual());
  }

  /* =========================================================
     10. AVISO RÁPIDO E BOTÃO COMPARTILHAR
     avisar('Link copiado') mostra uma etiqueta no rodapé da
     tela por ~2,5s (leitores de tela também ouvem).
     compartilhar() usa o compartilhamento do celular (Web
     Share API). Se o navegador não tiver, copia o link.
     ========================================================= */
  var caixaAviso = null;
  var timerAviso = null;

  function avisar(texto) {
    if (!caixaAviso) {
      caixaAviso = document.createElement('div');
      caixaAviso.className = 'aviso';
      caixaAviso.setAttribute('role', 'status');
      caixaAviso.innerHTML = icone('circle-check') + '<span></span>';
      document.body.appendChild(caixaAviso);
    }
    $('span', caixaAviso).textContent = texto;
    caixaAviso.classList.add('is-visible');
    if (podeMover()) {
      animar(caixaAviso, { opacity: [0, 1], transform: ['translate(-50%, 12px)', 'translate(-50%, 0)'] },
        { duration: 0.3, ease: EASE_OUT });
    }
    clearTimeout(timerAviso);
    timerAviso = setTimeout(function () {
      var saida = podeMover()
        ? animar(caixaAviso, { opacity: 0, transform: 'translate(-50%, 8px)' }, { duration: 0.2, ease: EASE_OUT })
        : Promise.resolve();
      saida.then(function () { caixaAviso.classList.remove('is-visible'); });
    }, 2600);
  }

  // Copia um texto. Tenta o jeito moderno e, se não der, o antigo.
  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(function () { return copiarAntigo(texto); });
    }
    return copiarAntigo(texto);
  }

  function copiarAntigo(texto) {
    var campo = document.createElement('textarea');
    campo.value = texto;
    campo.setAttribute('readonly', '');
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    try { document.execCommand('copy'); } catch (e) { /* sem problema */ }
    campo.remove();
    return Promise.resolve();
  }

  // dados = { titulo, texto, url }
  function compartilhar(dados) {
    var url = dados.url || window.location.href;
    var pacote = { title: dados.titulo, text: dados.texto, url: url };
    // canShare confere se o navegador aceita compartilhar este link
    if (navigator.share && (!navigator.canShare || navigator.canShare(pacote))) {
      navigator.share(pacote).catch(function () {
        /* a pessoa desistiu de compartilhar: tudo bem */
      });
      return;
    }
    copiarTexto(url).then(function () { avisar(T('Link copiado')); });
  }

  /* =========================================================
     11. CAIXA DE FERRAMENTAS PARA OS OUTROS ARQUIVOS
     Os arquivos novos (busca, verificador, montador, painel
     "Primeiros 30 minutos", navegação, páginas) usam estas
     funções em vez de repetir código. Ex.: Vestigio.icone('x').
     ========================================================= */
  window.Vestigio = {
    raiz: RAIZ,
    raizSite: RAIZ_SITE,
    EASE_OUT: EASE_OUT,
    EASE_DRAWER: EASE_DRAWER,
    $: $,
    $$: $$,
    icone: icone,
    preencherIcones: preencherIcones,
    escapar: escapar,
    semAcento: semAcento,
    doisDigitos: doisDigitos,
    podeMover: podeMover,
    animar: animar,
    buscarServico: buscarServico,
    nomeDaCategoria: nomeDaCategoria,
    linkDaPagina: linkDaPagina,
    abrirServico: abrirServico,
    abrirPainel: abrirPainel,
    fecharPainel: fecharPainel,
    ligarPainel: ligarPainel,
    fecharMenu: function () { fecharMenu(); },
    avisar: avisar,
    copiarTexto: copiarTexto,
    compartilhar: compartilhar,
    temaAtual: temaAtual,
    trocarTema: function (tema) { if (tema !== temaAtual()) trocarTema(tema); },
    // Controle dos cards de serviço (só existe na página inicial)
    servicos: function () { return controleServicos; }
  };

  /* ---------- INICIAR TUDO ---------- */
  prepararServicos();   // primeiro: cria os cards (que também têm ícones)
  prepararAtalhos();
  preencherIcones(document);
  prepararContato();
  prepararCabecalho();
  prepararMenu();
  prepararPainel();
  prepararAcordeao();
  prepararBotaoFlutuante();
  prepararTema();
})();

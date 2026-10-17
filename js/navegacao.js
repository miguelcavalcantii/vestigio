/* =========================================================
   NAVEGAÇÃO (versão 3.0)
   ---------------------------------------------------------
   1. Painel de serviços do menu ("mega menu", computador)
   2. Sanfona "Serviços" no menu do celular
   3. Botão "voltar ao topo" com anel de progresso da leitura
   4. Botão flutuante do WhatsApp com duas opções

   Os serviços vêm de js/services.js: nada é escrito à mão.
   Usa as ferramentas de js/components.js (window.Vestigio).
   ========================================================= */

(function () {
  'use strict';

  var V = window.Vestigio;
  if (!V) return;
  var $ = V.$;
  var $$ = V.$$;

  // Quantas colunas o painel de serviços tem (as categorias se dividem entre elas)
  var COLUNAS_DO_PAINEL = 4;

  // Tempos do painel (em milissegundos)
  var ESPERA_ABRIR = 80;    // o mouse precisa "parar" um pouquinho em "Serviços"
  var ESPERA_FECHAR = 280;  // tolerância: o mouse pode sair um instante sem fechar

  var mouseFino = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- Ajudantes ---------- */

  // HTML de um link de serviço (painel do computador e sanfona do celular)
  function htmlDoItem(servico, classe) {
    return (
      '<li><a class="' + classe + '" href="' + V.linkDaPagina(servico) + '" data-servico-link="' + servico.id + '">' +
        '<span class="' + classe + '-icone" aria-hidden="true">' + V.icone(servico.icone) + '</span>' +
        '<span>' + V.escapar(servico.nome) + '</span>' +
      '</a></li>'
    );
  }

  function servicosDa(categoria) {
    return SERVICOS.filter(function (s) { return s.categoria === categoria.id; });
  }

  // Clique num serviço: na página inicial abre o MESMO painel de detalhe dos
  // cards. Nas outras páginas (sem painel), o link leva à página do serviço.
  // Ctrl/Cmd + clique continua abrindo o link numa aba nova.
  function ligarCliqueDosServicos(raiz, antesDeAbrir) {
    raiz.addEventListener('click', function (evento) {
      var link = evento.target.closest('[data-servico-link]');
      if (!link || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.button !== 0) return;
      if (!$('[data-sheet]')) return;   // sem painel nesta página: segue o link
      evento.preventDefault();
      var gatilho = antesDeAbrir ? antesDeAbrir() : link;
      V.abrirServico(link.getAttribute('data-servico-link'), gatilho);
    });
  }

  /* =========================================================
     1. PAINEL DE SERVIÇOS DO MENU (computador)
     ========================================================= */

  // Divide as categorias em colunas parecidas: cada categoria vai
  // para a coluna que está mais "curta" no momento.
  function dividirEmColunas(total) {
    var colunas = [];
    for (var i = 0; i < total; i++) colunas.push({ altura: 0, categorias: [] });
    CATEGORIAS.forEach(function (categoria) {
      var menor = colunas[0];
      colunas.forEach(function (c) { if (c.altura < menor.altura) menor = c; });
      menor.categorias.push(categoria);
      menor.altura += servicosDa(categoria).length + 1.5;   // +1.5 = o rótulo da categoria
    });
    return colunas;
  }

  function montarColunas(alvo) {
    alvo.innerHTML = dividirEmColunas(COLUNAS_DO_PAINEL).map(function (coluna) {
      return '<div class="mega__col">' + coluna.categorias.map(function (categoria) {
        var lista = servicosDa(categoria);
        return (
          '<div class="mega__grupo">' +
            '<p class="mega__cat" id="mega-cat-' + categoria.id + '">' +
              '<span class="mono">' + V.escapar(categoria.nome) + '</span>' +
              '<span class="mono mega__qtd">' + V.doisDigitos(lista.length) + '</span>' +
            '</p>' +
            '<ul role="list" class="mega__lista" aria-labelledby="mega-cat-' + categoria.id + '">' +
              lista.map(function (s) { return htmlDoItem(s, 'mega__item'); }).join('') +
            '</ul>' +
          '</div>'
        );
      }).join('') + '</div>';
    }).join('');
  }

  function prepararPainelDeServicos() {
    var botao = $('[data-mega-toggle]');
    var painel = $('[data-mega]');
    var colunas = $('[data-mega-cols]');
    if (!botao || !painel || !colunas) return;

    montarColunas(colunas);
    V.preencherIcones(painel);

    var aberto = false;
    var timerAbrir = null;
    var timerFechar = null;
    var menuCompleto = window.matchMedia('(min-width: 1280px)');

    // Tudo que dá para focar dentro do painel, organizado em colunas
    // (as 4 colunas de serviços + a coluna de destaque à direita)
    function colunasDeFoco() {
      return $$('.mega__col, .mega__aside', painel).map(function (col) {
        return $$('a, button', col);
      });
    }

    function abrir(focarPrimeiro) {
      clearTimeout(timerFechar);
      if (aberto) {
        if (focarPrimeiro) $('.mega__item', painel).focus();
        return;
      }
      aberto = true;
      painel.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      if (V.podeMover()) {
        // O painel desce 8px e aparece; os itens entram em sequência curta
        V.animar(painel, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] },
          { duration: 0.2, ease: V.EASE_OUT });
        V.animar($$('.mega__grupo, .mega__aside', painel), { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0)'] },
          { duration: 0.28, ease: V.EASE_OUT, delay: Motion.stagger(0.03, { startDelay: 0.04 }) });
      }
      if (focarPrimeiro) $('.mega__item', painel).focus();
    }

    function fechar(devolverFoco) {
      clearTimeout(timerAbrir);
      clearTimeout(timerFechar);
      if (!aberto) return;
      aberto = false;
      botao.setAttribute('aria-expanded', 'false');
      var foco = painel.contains(document.activeElement);
      var saida = V.podeMover()
        ? V.animar(painel, { opacity: 0, transform: 'translateY(-4px)' }, { duration: 0.14, ease: V.EASE_OUT })
        : Promise.resolve();
      saida.then(function () {
        if (!aberto) {
          painel.hidden = true;
          painel.style.opacity = '';
          painel.style.transform = '';
        }
      });
      if (devolverFoco || foco) botao.focus();
    }

    // Clique, Enter ou Espaço no botão: abre/fecha
    botao.addEventListener('click', function () {
      if (aberto) fechar(false);
      else abrir(false);
    });

    // Seta para baixo no botão: abre e já entra na lista.
    // Tab com o painel aberto: entra no painel (e não pula para o próximo link)
    botao.addEventListener('keydown', function (evento) {
      if (evento.key === 'ArrowDown' || (evento.key === 'Tab' && !evento.shiftKey && aberto)) {
        evento.preventDefault();
        abrir(true);
      }
    });

    // Tab dentro do painel: Shift+Tab no primeiro item volta para "Serviços";
    // Tab no último item fecha o painel e segue para o próximo link do menu
    painel.addEventListener('keydown', function (evento) {
      if (evento.key !== 'Tab') return;
      var todos = $$('a, button', painel);
      var primeiro = todos[0];
      var ultimo = todos[todos.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        botao.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        var proximo = botao.closest('li').nextElementSibling;
        fechar(false);
        if (proximo && $('a', proximo)) $('a', proximo).focus();
      }
    });

    // Mouse: abre ao parar em cima e fecha com um pequeno atraso ao sair
    // (assim o mouse pode "escorregar" no caminho até o painel)
    function mouseEntrou(evento) {
      if (evento.pointerType !== 'mouse') return;
      clearTimeout(timerFechar);
      if (!aberto && evento.currentTarget === botao) {
        clearTimeout(timerAbrir);
        timerAbrir = setTimeout(function () { abrir(false); }, ESPERA_ABRIR);
      }
    }

    function mouseSaiu(evento) {
      if (evento.pointerType !== 'mouse') return;
      clearTimeout(timerAbrir);
      // Saiu do botão para o painel (ou o contrário)? Não fecha.
      var para = evento.relatedTarget;
      if (para && (painel.contains(para) || botao.contains(para))) return;
      timerFechar = setTimeout(function () { fechar(false); }, ESPERA_FECHAR);
    }

    [botao, painel].forEach(function (el) {
      el.addEventListener('pointerenter', mouseEntrou);
      el.addEventListener('pointerleave', mouseSaiu);
    });

    // Esc fecha e devolve o foco ao botão
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && aberto) {
        evento.preventDefault();
        fechar(true);
      }
    });

    // Clique fora fecha
    document.addEventListener('pointerdown', function (evento) {
      if (aberto && !painel.contains(evento.target) && !botao.contains(evento.target)) fechar(false);
    });

    // O foco saiu do botão para fora do painel (ex.: Shift+Tab): fecha
    botao.addEventListener('focusout', function (evento) {
      var para = evento.relatedTarget;
      if (aberto && para && !painel.contains(para)) fechar(false);
    });

    // O foco saiu do painel e do botão (ex.: Tab até o fim): fecha
    painel.addEventListener('focusout', function (evento) {
      var para = evento.relatedTarget;
      if (aberto && para && !painel.contains(para) && para !== botao) fechar(false);
    });

    // Setas dentro do painel:
    //   cima/baixo = item anterior/seguinte da mesma coluna
    //   esquerda/direita = coluna vizinha (mesma altura, se der)
    //   Home/End = primeiro/último item
    painel.addEventListener('keydown', function (evento) {
      var cols = colunasDeFoco();
      var c = -1, i = -1;
      cols.forEach(function (lista, ci) {
        var achou = lista.indexOf(document.activeElement);
        if (achou > -1) { c = ci; i = achou; }
      });
      if (c < 0) return;
      var alvo = null;
      if (evento.key === 'ArrowDown') alvo = cols[c][i + 1] || cols[(c + 1) % cols.length][0];
      if (evento.key === 'ArrowUp') {
        if (i > 0) alvo = cols[c][i - 1];
        else if (c === 0) { evento.preventDefault(); botao.focus(); return; }
        else alvo = cols[c - 1][cols[c - 1].length - 1];
      }
      if (evento.key === 'ArrowRight') { var d = cols[(c + 1) % cols.length]; alvo = d[Math.min(i, d.length - 1)]; }
      if (evento.key === 'ArrowLeft') { var e = cols[(c - 1 + cols.length) % cols.length]; alvo = e[Math.min(i, e.length - 1)]; }
      if (evento.key === 'Home') alvo = cols[0][0];
      if (evento.key === 'End') { var u = cols[cols.length - 1]; alvo = u[u.length - 1]; }
      if (alvo) {
        evento.preventDefault();
        alvo.focus();
      }
    });

    // Clicar num serviço abre o painel de detalhe (o foco volta para "Serviços")
    ligarCliqueDosServicos(painel, function () {
      fechar(false);
      return botao;
    });

    // "Ver todos os serviços" e "Ver os primeiros passos" também fecham o painel
    painel.addEventListener('click', function (evento) {
      if (evento.target.closest('.mega__todos, [data-urgente]')) fechar(false);
    });

    // Tela ficou pequena (menu do celular): fecha
    menuCompleto.addEventListener('change', function () { fechar(false); });
  }

  /* =========================================================
     2. SANFONA "SERVIÇOS" NO MENU DO CELULAR
     ========================================================= */
  function prepararSanfonaDoMenu() {
    var botao = $('[data-menu-servicos]');
    var gaveta = $('[data-menu-servicos-lista]');
    var miolo = $('[data-menu-servicos-miolo]');
    if (!botao || !gaveta || !miolo) return;

    miolo.innerHTML = CATEGORIAS.map(function (categoria) {
      return (
        '<div class="mobile-menu__cat">' +
          '<p class="mono" id="menu-cat-' + categoria.id + '">' + V.escapar(categoria.nome) + '</p>' +
          '<ul role="list" aria-labelledby="menu-cat-' + categoria.id + '">' +
            servicosDa(categoria).map(function (s) { return htmlDoItem(s, 'mobile-menu__servico'); }).join('') +
          '</ul>' +
        '</div>'
      );
    }).join('') +
    '<a class="mobile-menu__todos" href="' + (V.raiz ? V.raiz + 'index.html' : '') + '#servicos">Ver todos os serviços' + V.icone('arrow-right') + '</a>';

    // Fechada, a lista fica fora do Tab e do leitor de tela
    gaveta.inert = true;

    botao.addEventListener('click', function () {
      var abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', String(abrir));
      gaveta.classList.toggle('is-open', abrir);
      gaveta.inert = !abrir;
    });

    // Ao fechar o menu do celular, a sanfona também fecha
    var menu = $('[data-mobile-menu]');
    if (menu) {
      new MutationObserver(function () {
        if (menu.hidden) {
          botao.setAttribute('aria-expanded', 'false');
          gaveta.classList.remove('is-open');
          gaveta.inert = true;
        }
      }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
    }

    // Serviço tocado: abre o painel de detalhe (na página inicial)
    ligarCliqueDosServicos(gaveta, function () {
      return $('[data-menu-toggle]');
    });
  }

  /* =========================================================
     3. BOTÃO "VOLTAR AO TOPO"
     Aparece depois de rolar ~2 telas, fica empilhado acima do
     botão do WhatsApp e some quando a seção de contato (ou outro
     bloco com data-esconde-flutuante) está visível.
     O anel em volta enche conforme a leitura da página.
     ========================================================= */
  // Raio = 24 - metade do traço (2): o anel encosta na borda do botão.
  // Se mudar o stroke-width em css/ferramentas.css, ajuste aqui também.
  var RAIO_DO_ANEL = 23;
  var VOLTA_DO_ANEL = 2 * Math.PI * RAIO_DO_ANEL;   // comprimento do círculo

  function prepararVoltarAoTopo() {
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'topo';
    botao.setAttribute('aria-label', 'Voltar ao topo da página');
    botao.tabIndex = -1;
    botao.innerHTML =
      '<svg class="topo__anel" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
        '<circle class="topo__trilho" cx="24" cy="24" r="' + RAIO_DO_ANEL + '"/>' +
        '<circle class="topo__progresso" cx="24" cy="24" r="' + RAIO_DO_ANEL + '"' +
          ' stroke-dasharray="' + VOLTA_DO_ANEL.toFixed(2) + '" stroke-dashoffset="' + VOLTA_DO_ANEL.toFixed(2) + '"/>' +
      '</svg>' +
      '<span class="topo__seta" aria-hidden="true">' + V.icone('arrow-up') + '</span>';
    document.body.appendChild(botao);
    var anel = $('.topo__progresso', botao);

    var blocosVisiveis = 0;
    var passouDoLimite = false;
    var pedido = null;

    function atualizarVisibilidade() {
      var mostrar = passouDoLimite && blocosVisiveis === 0;
      botao.classList.toggle('is-visible', mostrar);
      botao.tabIndex = mostrar ? 0 : -1;
    }

    function aoRolar() {
      pedido = null;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var fracao = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
      anel.style.strokeDashoffset = (VOLTA_DO_ANEL * (1 - fracao)).toFixed(2);
      // Quase nada lido: esconde o traço (a ponta redonda viraria um pontinho)
      anel.classList.toggle('is-vazio', fracao < 0.01);
      var passou = window.scrollY > window.innerHeight * 2;
      if (passou !== passouDoLimite) {
        passouDoLimite = passou;
        atualizarVisibilidade();
      }
    }

    window.addEventListener('scroll', function () {
      if (!pedido) pedido = requestAnimationFrame(aoRolar);
    }, { passive: true });
    window.addEventListener('resize', aoRolar);
    aoRolar();

    $$('[data-esconde-flutuante]').forEach(function (bloco) {
      var visivel = false;
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting !== visivel) {
          visivel = e[0].isIntersecting;
          blocosVisiveis += visivel ? 1 : -1;
          atualizarVisibilidade();
        }
      }, { threshold: 0.25 }).observe(bloco);
    });

    botao.addEventListener('click', function () {
      // Sobe com a rolagem suave (Lenis), se estiver ligada
      if (V.lenis) V.lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: V.podeMover() ? 'smooth' : 'auto' });
      // O foco do teclado vai para o logo (o primeiro item da página)
      var logo = $('.brand');
      if (logo) logo.focus({ preventScroll: true });
    });
  }

  /* =========================================================
     4. BOTÃO FLUTUANTE DO WHATSAPP: DUAS OPÇÕES
     Ao tocar, abre um pequeno menu acima dele:
       - Falar no WhatsApp (abre o montador de mensagem)
       - Caí em um golpe agora (painel "Primeiros 30 minutos")
     ========================================================= */
  function prepararOpcoesDoFlutuante() {
    var botao = $('[data-wa-float]');
    if (!botao) return;

    var menu = document.createElement('div');
    menu.className = 'wa-dial';
    menu.id = 'wa-dial';
    menu.hidden = true;
    menu.innerHTML =
      '<a class="wa-dial__opcao" href="' + linkWhatsApp() + '" target="_blank" rel="noopener" data-montador>' +
        '<span class="wa-icon">' + V.icone('whatsapp') + '</span>Falar no WhatsApp' +
      '</a>' +
      '<button class="wa-dial__opcao" type="button" aria-haspopup="dialog" data-urgente>' +
        '<span class="urgente__dot" aria-hidden="true"></span>Caí em um golpe agora' +
      '</button>';
    document.body.appendChild(menu);

    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'wa-dial');
    var aberto = false;

    function abrir() {
      aberto = true;
      menu.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('wa-dial-aberto');
      var opcoes = $$('.wa-dial__opcao', menu);
      if (V.podeMover()) {
        // As opções sobem do botão, de baixo para cima
        V.animar(opcoes.slice().reverse(), { opacity: [0, 1], transform: ['translateY(10px) scale(0.96)', 'translateY(0) scale(1)'] },
          { duration: 0.24, ease: V.EASE_OUT, delay: Motion.stagger(0.05) });
      }
      opcoes[0].focus();
    }

    function fechar(devolverFoco) {
      if (!aberto) return;
      aberto = false;
      botao.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('wa-dial-aberto');
      var saida = V.podeMover()
        ? V.animar($$('.wa-dial__opcao', menu), { opacity: 0, transform: 'translateY(6px) scale(0.97)' }, { duration: 0.14, ease: V.EASE_OUT })
        : Promise.resolve();
      saida.then(function () { if (!aberto) menu.hidden = true; });
      if (devolverFoco) botao.focus();
    }

    botao.addEventListener('click', function (evento) {
      evento.preventDefault();   // o link do WhatsApp fica só de reserva
      if (aberto) fechar(false);
      else abrir();
    });

    // Escolher uma opção fecha o menu (o painel certo abre em seguida)
    menu.addEventListener('click', function () { fechar(false); });
    // "Falar no WhatsApp": o montador pega esse clique antes (fase de
    // captura) e não deixa ele chegar aqui; por isso avisa por evento
    document.addEventListener('vestigio:montador', function () { fechar(false); });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && aberto) fechar(true);
    });

    document.addEventListener('pointerdown', function (evento) {
      if (aberto && !menu.contains(evento.target) && !botao.contains(evento.target)) fechar(false);
    });

    // Se o botão flutuante sumir (ex.: chegou no contato), fecha o menu
    document.addEventListener('vestigio:flutuante', function (evento) {
      if (!evento.detail.visivel) fechar(false);
    });

    // Setas para cima/baixo passam entre as opções
    menu.addEventListener('keydown', function (evento) {
      var opcoes = $$('.wa-dial__opcao', menu);
      var i = opcoes.indexOf(document.activeElement);
      if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
        evento.preventDefault();
        var passo = evento.key === 'ArrowDown' ? 1 : -1;
        opcoes[(i + passo + opcoes.length) % opcoes.length].focus();
      }
    });
  }

  /* ---------- INICIAR ---------- */
  prepararPainelDeServicos();
  prepararSanfonaDoMenu();
  prepararVoltarAoTopo();
  prepararOpcoesDoFlutuante();
})();

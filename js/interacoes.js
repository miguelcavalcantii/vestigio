/* =========================================================
   INTERAÇÕES COM O MOUSE E A ROLAGEM
   ---------------------------------------------------------
   1. Bordas que acendem onde o mouse passa (cards e quadros)
   2. Botões: o hover "nasce" no ponto em que o mouse entra
   3. Menu: pílula que desliza até o link sob o mouse
   4. Menu: linha de progresso da leitura
   5. Rótulos que se "decodificam" (letras embaralham e se fixam)
   6. Efeito "gelatina" em botões, chips, abas e cards
   7. Rolagem suave com inércia (biblioteca Lenis)
   8. Toda página começa no topo (menos com #seção ou "Voltar")

   Os efeitos de mouse só ligam em computadores (mouse de verdade).
   Quem pediu "reduzir movimento" no sistema não vê os efeitos
   que se movem; o site continua funcionando igual.
   ========================================================= */

(function () {
  'use strict';

  var temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Sem movimento? Quem decide é a função central reduzirMovimento()
  // de js/config.js (interruptor CONFIG.animacoesSempre).
  var semMovimento = reduzirMovimento();

  // Esta página deve começar no topo? (ver a parte 8, no fim do arquivo)
  // Não quando a URL tem #seção, nem quando a pessoa chegou pelo
  // botão "Voltar"/"Avançar" do navegador: aí vale o natural.
  var navegacao = (window.performance && performance.getEntriesByType &&
    performance.getEntriesByType('navigation')[0]) || {};
  var forcarTopo = !location.hash && navegacao.type !== 'back_forward';

  /* =========================================================
     1. BORDAS QUE ACENDEM ONDE O MOUSE PASSA
     Cada "grupo" (ex.: a grade de serviços) escuta o mouse.
     A cada movimento, calculamos a posição do mouse em relação
     a CADA quadro do grupo e guardamos em --mx e --my.
     O CSS (components.css, final do arquivo) desenha a luz na borda.
     ========================================================= */

  // Quais quadros acendem e qual elemento é o "grupo" de cada um
  var GRUPOS = [
    { grupo: '[data-services-grid]', itens: '.service-card' },
    { grupo: '.bento', itens: '.bento__cell' },
    { grupo: '.principles', itens: '.principle' },
    { grupo: '.steps', itens: '.step' },
    { grupo: '.guide__grid', itens: '.guide__card' },
    { grupo: '.contact__list', itens: '.contact__item' },
    { grupo: '.quick__list', itens: '.chip' },
    // Versão 3.0
    { grupo: '.verif__respostas', itens: '.verif__resposta' },
    { grupo: '.ultimos__lista', itens: '.alerta-card' },
    { grupo: '.alertas__grade', itens: '.alerta-card' },
    { grupo: '.relacionados__grade', itens: '.service-card' }
  ];

  function ligarBordas() {
    GRUPOS.forEach(function (config) {
      acenderBordas(document.querySelector(config.grupo), config.itens);
    });
  }

  // Liga o efeito em UM grupo. Também é usado pelos painéis criados
  // depois que a página carrega (ex.: a lista do "Primeiros 30 minutos"):
  //   Vestigio.acenderBordas(elementoDoGrupo, '.seletor-dos-itens')
  function acenderBordas(grupo, seletorItens) {
    if (!grupo || grupo.hasAttribute('data-spot-group')) return;
    grupo.setAttribute('data-spot-group', '');

    var pedido = null;      // evita calcular mais de uma vez por quadro de animação
    var ultimoEvento = null;

    grupo.addEventListener('pointermove', function (evento) {
      ultimoEvento = evento;
      if (pedido) return;
      pedido = requestAnimationFrame(function () {
        pedido = null;
        // Os cards de serviço são recriados ao trocar de aba,
        // por isso buscamos os itens de novo a cada movimento.
        var itens = grupo.querySelectorAll(seletorItens);
        for (var i = 0; i < itens.length; i++) {
          var item = itens[i];
          if (!item.hasAttribute('data-spot')) item.setAttribute('data-spot', '');
          var caixa = item.getBoundingClientRect();
          item.style.setProperty('--mx', (ultimoEvento.clientX - caixa.left) + 'px');
          item.style.setProperty('--my', (ultimoEvento.clientY - caixa.top) + 'px');
        }
      });
    });
  }

  /* =========================================================
     2. BOTÕES: O HOVER NASCE ONDE O MOUSE ENTRA
     Guardamos o ponto de entrada (e de saída) em --bx e --by.
     O círculo do CSS (.btn::before) cresce a partir dali.
     ========================================================= */
  function ligarBotoes() {
    function marcarPonto(evento) {
      var botao = evento.currentTarget;
      var caixa = botao.getBoundingClientRect();
      botao.style.setProperty('--bx', (evento.clientX - caixa.left) + 'px');
      botao.style.setProperty('--by', (evento.clientY - caixa.top) + 'px');
    }

    Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (botao) {
      botao.addEventListener('pointerenter', marcarPonto);
      botao.addEventListener('pointerleave', marcarPonto);
    });
  }

  /* =========================================================
     3. MENU: PÍLULA QUE DESLIZA ATÉ O LINK
     ========================================================= */
  function ligarMenu() {
    var lista = document.querySelector('.main-nav__list');
    var pilula = document.querySelector('.nav-glide');
    if (!lista || !pilula) return;

    function irPara(link) {
      pilula.style.setProperty('--glide-x', link.offsetLeft + 'px');
      pilula.style.setProperty('--glide-w', link.offsetWidth + 'px');
    }

    // Links e os botões "Serviços" e "Mais" (só os do primeiro nível:
    // os links de dentro do painel "Mais" não movem a pílula)
    Array.prototype.forEach.call(lista.querySelectorAll(':scope > li > a, :scope > li > button'), function (link) {
      link.addEventListener('pointerenter', function () {
        // Na primeira vez a pílula aparece já no lugar (sem "voar" do canto)
        if (!lista.classList.contains('is-gliding')) {
          pilula.style.transition = 'none';
          irPara(link);
          pilula.offsetWidth; // força o navegador a aplicar a posição antes de animar
          pilula.style.transition = '';
        } else {
          irPara(link);
        }
        lista.classList.add('is-gliding');
      });
      // Também funciona com o teclado (Tab)
      link.addEventListener('focus', function () {
        irPara(link);
        lista.classList.add('is-gliding');
      });
    });

    lista.addEventListener('pointerleave', function () {
      lista.classList.remove('is-gliding');
    });
    lista.addEventListener('focusout', function (evento) {
      if (!lista.contains(evento.relatedTarget)) lista.classList.remove('is-gliding');
    });
  }

  /* =========================================================
     4. LINHA DE PROGRESSO DA LEITURA (borda de baixo do menu)
     ========================================================= */
  function ligarProgresso() {
    var linha = document.querySelector('[data-reading]');
    if (!linha) return;
    var pedido = null;

    function atualizar() {
      pedido = null;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var fracao = total > 0 ? window.scrollY / total : 0;
      linha.style.setProperty('--leitura', fracao.toFixed(4));
    }

    window.addEventListener('scroll', function () {
      if (!pedido) pedido = requestAnimationFrame(atualizar);
    }, { passive: true });
    atualizar();
  }

  /* =========================================================
     5. RÓTULOS QUE SE "DECODIFICAM"
     As letras aparecem embaralhadas e, da esquerda para a
     direita, vão se fixando no texto certo (~0,7s).
     O texto real fica no aria-label para leitores de tela.
     ========================================================= */
  function decodificar(elemento) {
    var final = elemento.textContent;
    var simbolos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/·';
    var quadro = 0;
    var totalQuadros = 32;

    elemento.setAttribute('aria-label', final);

    function passo() {
      var fixas = Math.floor((quadro / totalQuadros) * final.length);
      var texto = '';
      for (var i = 0; i < final.length; i++) {
        var letra = final[i];
        if (i < fixas || letra === ' ') texto += letra;
        else texto += simbolos[Math.floor(Math.random() * simbolos.length)];
      }
      elemento.textContent = texto;
      quadro++;
      if (quadro <= totalQuadros) requestAnimationFrame(passo);
      else elemento.textContent = final;
    }
    passo();
  }

  function ligarDecodificacao() {
    if (semMovimento) return;
    var rotulos = document.querySelectorAll('[data-decode]');
    if (!rotulos.length) return;

    // Começa só quando o rótulo aparece na tela
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        observador.unobserve(entrada.target);
        setTimeout(function () { decodificar(entrada.target); }, 250);
      });
    });
    Array.prototype.forEach.call(rotulos, function (r) { observador.observe(r); });
  }

  /* =========================================================
     6. EFEITO "GELATINA" (inspirado no Liquid Glass da Apple)
     ---------------------------------------------------------
     Botões, chips, abas e cards se comportam como gelatina:
     - com o mouse em cima, são "puxados" um pouco na direção do
       cursor e esticam no sentido em que o mouse se move;
     - ao clicar/tocar, achatam (ficam mais largos e mais baixos);
     - ao soltar ou sair, voltam balançando até parar.

     Como funciona: cada elemento tem uma "mola" (física simples).
     A cada quadro, a mola puxa o valor atual em direção ao alvo e
     um atrito diminui a velocidade. Pouco atrito = mais balanço.
     Usamos as propriedades CSS "translate" e "scale", que são
     separadas de "transform": assim não brigamos com outras
     animações (como o card que sobe no hover).
     ========================================================= */

  // Configuração por tipo de elemento:
  //   puxar   = quantos pixels no máximo ele anda em direção ao mouse
  //   esticar = o quanto estica com a velocidade do mouse
  //   crescer = escala com o mouse em cima
  //   apertar = [largura, altura] quando clicado
  //   mola / atrito = "dureza" da gelatina
  var TIPOS_GELATINA = [
    { seletor: '.btn', puxar: 3, esticar: 0.03, crescer: 1.015, apertar: [1.03, 0.95], mola: 0.16, atrito: 0.64 },
    { seletor: '.chip, .tab, .urgente, .wa-dial__opcao, .verif__resposta', puxar: 2, esticar: 0.03, crescer: 1.02, apertar: [1.03, 0.94], mola: 0.16, atrito: 0.64 },
    { seletor: '.wa-float, .menu-toggle, .seletor__botao, .sheet__close, .busca__limpar', puxar: 3, esticar: 0.03, crescer: 1.03, apertar: [1.04, 0.94], mola: 0.16, atrito: 0.64 },
    // Voltar ao topo: sem esticar (o círculo não deforma), só cresce e aperta
    { seletor: '.topo', puxar: 3, esticar: 0, crescer: 1.04, apertar: [1.04, 0.94], mola: 0.16, atrito: 0.64 },
    // Cards de serviço: além da gelatina, INCLINAM em 3D na direção do mouse
    { seletor: '.service-card', puxar: 4, esticar: 0.015, crescer: 1.012, apertar: [1.015, 0.98], mola: 0.12, atrito: 0.66, inclinar: 0.6 },
    { seletor: '.principle, .contact__item, .guide__card, .alerta-card, .check', puxar: 3, esticar: 0.01, crescer: 1.008, apertar: [1.01, 0.985], mola: 0.12, atrito: 0.66 }
  ];

  var ativos = [];          // elementos que ainda estão se mexendo
  var rodando = false;

  // Cria (uma vez) o "estado da mola" de um elemento
  function estadoDe(el, tipo) {
    if (!el._gel) {
      el._gel = {
        tipo: tipo,
        x: 0, y: 0, sx: 1, sy: 1,          // valores atuais
        vx: 0, vy: 0, vsx: 0, vsy: 0,      // velocidades
        alvoX: 0, alvoY: 0, base: 1,       // alvos
        estX: 0, estY: 0,                  // estiques causados pela velocidade do mouse
        apertado: false,
        ultimoX: null, ultimoY: null
      };
    }
    return el._gel;
  }

  function acordar(el) {
    if (ativos.indexOf(el) < 0) ativos.push(el);
    if (!rodando) { rodando = true; requestAnimationFrame(quadroGelatina); }
  }

  // Um passo de mola: devolve [novoValor, novaVelocidade]
  function mola(valor, velocidade, alvo, forca, atrito) {
    velocidade = (velocidade + (alvo - valor) * forca) * atrito;
    return [valor + velocidade, velocidade];
  }

  /* MOLA REAPROVEITÁVEL (usa o mesmo passo de mola acima)
     Segue um alvo (x, y) com movimento macio, quadro a quadro,
     e para sozinha quando chega. Exemplo de uso:
       var m = criarMola({ forca: 0.06, atrito: 0.8,
                           aoMover: function (x, y) { ... } });
       m.irPara(1, -0.5);   // x e y de -1 a 1, por exemplo
     Usada nos celulares da demonstração (js/demo-golpe.js). */
  function criarMola(opcoes) {
    var x = 0, y = 0, vx = 0, vy = 0, alvoX = 0, alvoY = 0;
    var rodando = false;

    function quadro() {
      var r;
      r = mola(x, vx, alvoX, opcoes.forca, opcoes.atrito); x = r[0]; vx = r[1];
      r = mola(y, vy, alvoY, opcoes.forca, opcoes.atrito); y = r[0]; vy = r[1];
      opcoes.aoMover(x, y);
      var chegou = Math.abs(alvoX - x) + Math.abs(alvoY - y) < 0.001 && Math.abs(vx) + Math.abs(vy) < 0.001;
      if (chegou) rodando = false;
      else requestAnimationFrame(quadro);
    }

    return {
      irPara: function (novoX, novoY) {
        alvoX = novoX;
        alvoY = novoY;
        if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
      }
    };
  }
  window.criarMola = criarMola;

  function quadroGelatina() {
    for (var i = ativos.length - 1; i >= 0; i--) {
      var el = ativos[i];
      var g = el._gel;
      var t = g.tipo;

      // o estique da velocidade vai sumindo sozinho
      g.estX *= 0.82;
      g.estY *= 0.82;

      // alvo de escala: base (hover/apertado) + estique na direção do movimento
      var alvoSX = g.apertado ? t.apertar[0] : g.base * (1 + g.estX - g.estY * 0.5);
      var alvoSY = g.apertado ? t.apertar[1] : g.base * (1 + g.estY - g.estX * 0.5);

      var r;
      r = mola(g.x, g.vx, g.alvoX, t.mola, t.atrito);   g.x = r[0];  g.vx = r[1];
      r = mola(g.y, g.vy, g.alvoY, t.mola, t.atrito);   g.y = r[0];  g.vy = r[1];
      r = mola(g.sx, g.vsx, alvoSX, t.mola, t.atrito);  g.sx = r[0]; g.vsx = r[1];
      r = mola(g.sy, g.vsy, alvoSY, t.mola, t.atrito);  g.sy = r[0]; g.vsy = r[1];

      el.style.translate = g.x.toFixed(2) + 'px ' + g.y.toFixed(2) + 'px';
      el.style.scale = g.sx.toFixed(4) + ' ' + g.sy.toFixed(4);

      // Inclinação 3D (só nos cards de serviço): o "miolo" do card gira
      // um pouco para o lado em que o mouse está, como uma placa de vidro
      if (t.inclinar && el.firstElementChild) {
        el.firstElementChild.style.transform =
          'rotateX(' + (-g.y * t.inclinar).toFixed(2) + 'deg) rotateY(' + (g.x * t.inclinar).toFixed(2) + 'deg)';
      }

      // Parou de mexer? tira da lista e limpa o estilo
      var parado = Math.abs(g.vx) + Math.abs(g.vy) < 0.01 &&
        Math.abs(g.vsx) + Math.abs(g.vsy) < 0.0005 &&
        Math.abs(g.x - g.alvoX) + Math.abs(g.y - g.alvoY) < 0.05 &&
        Math.abs(g.sx - alvoSX) + Math.abs(g.sy - alvoSY) < 0.001 &&
        Math.abs(g.estX) + Math.abs(g.estY) < 0.001;
      if (parado) {
        ativos.splice(i, 1);
        if (g.alvoX === 0 && g.alvoY === 0 && g.base === 1 && !g.apertado) {
          g.x = g.y = 0; g.sx = g.sy = 1; g.estX = g.estY = 0;
          if (t.inclinar && el.firstElementChild) el.firstElementChild.style.transform = '';
          el.style.translate = '';
          el.style.scale = '';
        }
      }
    }
    if (ativos.length) requestAnimationFrame(quadroGelatina);
    else rodando = false;
  }

  // Descobre se o elemento é "gelatina" e de qual tipo
  function tipoDe(el) {
    for (var i = 0; i < TIPOS_GELATINA.length; i++) {
      if (el.matches(TIPOS_GELATINA[i].seletor)) return TIPOS_GELATINA[i];
    }
    return null;
  }

  function alvoGelatina(evento) {
    if (!evento.target.closest) return null;
    for (var i = 0; i < TIPOS_GELATINA.length; i++) {
      var el = evento.target.closest(TIPOS_GELATINA[i].seletor);
      if (el) return el;
    }
    return null;
  }

  function ligarGelatina() {
    document.documentElement.classList.add('gelatina');

    // Usamos "delegação": um ouvinte no documento serve para todos,
    // inclusive para os cards criados depois (troca de abas).
    document.addEventListener('pointermove', function (evento) {
      if (evento.pointerType !== 'mouse') return;
      var el = alvoGelatina(evento);
      if (!el) return;
      var t = tipoDe(el);
      var g = estadoDe(el, t);
      var caixa = el.getBoundingClientRect();

      // posição do mouse de -1 a 1 em relação ao centro
      var nx = ((evento.clientX - caixa.left) / caixa.width - 0.5) * 2;
      var ny = ((evento.clientY - caixa.top) / caixa.height - 0.5) * 2;
      g.alvoX = nx * t.puxar;
      g.alvoY = ny * t.puxar * 0.6;
      g.base = t.crescer;

      // velocidade do mouse estica a gelatina nessa direção
      if (g.ultimoX !== null) {
        var dx = Math.abs(evento.clientX - g.ultimoX) / caixa.width;
        var dy = Math.abs(evento.clientY - g.ultimoY) / caixa.height;
        g.estX = Math.min(g.estX + dx * 0.3, t.esticar);
        g.estY = Math.min(g.estY + dy * 0.3, t.esticar);
      }
      // Primeira vez que o mouse entra: um "pulo" de gelatina
      if (g.ultimoX === null && !g.entrou) {
        g.entrou = true;
        g.vsx += 0.008;
        g.vsy -= 0.006;
      }
      g.ultimoX = evento.clientX;
      g.ultimoY = evento.clientY;
      acordar(el);
    }, { passive: true });

    // Saiu de cima: volta ao lugar balançando
    document.addEventListener('pointerout', function (evento) {
      var el = alvoGelatina(evento);
      if (!el || el.contains(evento.relatedTarget)) return;
      var g = estadoDe(el, tipoDe(el));
      g.alvoX = 0; g.alvoY = 0; g.base = 1;
      g.apertado = false;
      g.entrou = false;
      g.ultimoX = g.ultimoY = null;
      // um "empurrãozinho" para o balanço ficar visível
      g.vsx += 0.004; g.vsy -= 0.004;
      acordar(el);
    });

    // Clique/toque: achata. Soltar: estica de volta com balanço.
    document.addEventListener('pointerdown', function (evento) {
      var el = alvoGelatina(evento);
      if (!el) return;
      var g = estadoDe(el, tipoDe(el));
      g.apertado = true;
      acordar(el);
    });

    document.addEventListener('pointerup', function (evento) {
      var el = alvoGelatina(evento);
      // solta todos que estavam apertados (o dedo pode ter saído do botão)
      ativos.forEach(function (a) {
        if (a._gel.apertado) { a._gel.apertado = false; a._gel.vsy += 0.01; }
      });
      if (el && el._gel) { el._gel.apertado = false; acordar(el); }
      // no celular não há "sair de cima": volta ao normal
      if (evento.pointerType !== 'mouse' && el && el._gel) {
        el._gel.alvoX = 0; el._gel.alvoY = 0; el._gel.base = 1;
      }
    });
    document.addEventListener('pointercancel', function () {
      ativos.forEach(function (a) { a._gel.apertado = false; a._gel.alvoX = 0; a._gel.alvoY = 0; a._gel.base = 1; });
    });
  }

  /* =========================================================
     7. ROLAGEM SUAVE COM INÉRCIA
     A roda do mouse deixa de "pular" de 100 em 100 pixels: a
     página desliza e desacelera devagar. No celular a rolagem
     continua a nativa (que já é suave).
     ========================================================= */
  function ligarRolagemSuave() {
    if (typeof Lenis === 'undefined') return;
    var lenis = new Lenis({
      lerp: 0.12,                 // quanto menor, mais "macia" (0.05 a 0.15)
      wheelMultiplier: 1,
      anchors: { offset: -96 }    // links do menu (#servicos etc.) também deslizam
    });

    // Outros arquivos usam a mesma rolagem (ex.: botão "voltar ao topo")
    if (window.Vestigio) window.Vestigio.lenis = lenis;

    // Página nova sem #seção: a Lenis também começa do zero
    if (forcarTopo) lenis.scrollTo(0, { immediate: true, force: true });

    function quadro(tempo) {
      lenis.raf(tempo);
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);

    // Quando o menu do celular ou o painel de serviço abrem,
    // o site coloca a classe "is-locked" no <html>: pausamos a rolagem.
    new MutationObserver(function () {
      if (document.documentElement.classList.contains('is-locked')) lenis.stop();
      else lenis.start();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* =========================================================
     8. TODA PÁGINA COMEÇA NO TOPO
     Ao abrir uma página pelo link (ex.: "Abrir página do serviço"),
     ela começa no topo, mesmo que o navegador ou o ambiente onde o
     site está hospedado tentem devolver a rolagem da página anterior.
     - Com #seção na URL, o navegador vai até a seção (com o desconto
       do menu, que é o scroll-padding-top do css/base.css).
     - Pelo botão "Voltar", a pessoa volta para onde estava.
     ========================================================= */
  function comecarNoTopo() {
    if (!forcarTopo) return;

    // O navegador não devolve a rolagem antiga nesta página...
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    // ...mas, ao sair dela, volta ao normal: assim o botão "Voltar"
    // traz a pessoa de volta para o ponto em que ela estava.
    window.addEventListener('pagehide', function () {
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    });

    // Rede de segurança: até a pessoa mexer na página (roda, toque,
    // tecla ou clique) ou por 2,5s depois de carregar, qualquer
    // rolagem que NÃO veio dela é desfeita.
    var vigiando = true;
    var gestos = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

    function voltarAoTopo() {
      if (!vigiando || window.scrollY === 0) return;
      var lenis = window.Vestigio && window.Vestigio.lenis;
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }

    function pararDeVigiar() {
      vigiando = false;
      window.removeEventListener('scroll', voltarAoTopo);
      gestos.forEach(function (tipo) {
        window.removeEventListener(tipo, pararDeVigiar, true);
      });
    }

    window.addEventListener('scroll', voltarAoTopo, { passive: true });
    gestos.forEach(function (tipo) {
      window.addEventListener(tipo, pararDeVigiar, { capture: true, passive: true });
    });

    function vigiarMaisUmPouco() { setTimeout(pararDeVigiar, 2500); }
    if (document.readyState === 'complete') vigiarMaisUmPouco();
    else window.addEventListener('load', vigiarMaisUmPouco);
  }

  /* ---------- PARA OS OUTROS ARQUIVOS ---------- */
  if (window.Vestigio) {
    window.Vestigio.decodificar = function (el) { if (!semMovimento) decodificar(el); };
    window.Vestigio.acenderBordas = function (grupo, itens) {
      if (temMouse && !semMovimento) acenderBordas(grupo, itens);
    };
  }

  /* ---------- INICIAR ---------- */
  comecarNoTopo();
  if (!semMovimento) ligarRolagemSuave();
  ligarProgresso();
  ligarDecodificacao();
  if (!semMovimento) ligarGelatina();   // no celular também (o toque achata)
  if (temMouse && !semMovimento) {
    ligarBordas();
    ligarBotoes();
  }
  if (temMouse) ligarMenu();
})();

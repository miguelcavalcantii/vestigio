/* =========================================================
   DEMONSTRAÇÃO: COMO O GOLPE ACONTECE (seção #como-acontece)
   ---------------------------------------------------------
   Dois "celulares" feitos em HTML/CSS contam uma história:
     Celular 1: o golpe do falso parente, mensagem por mensagem.
     Celular 2: a análise da Vestígio ligando os vestígios.
   No fim, fica parado alguns segundos e recomeça (loop).

   - Computador (1024px ou mais): os dois celulares lado a lado.
   - Celular e tablet: UM aparelho que "vira" entre as etapas.
   - A história só anda com a seção na tela (economiza bateria).
   - Com "reduzir movimento": tudo já aparece no estado final.

   PARA EDITAR A HISTÓRIA: mude os dois roteiros logo abaixo.
   ========================================================= */

/* ---------- ROTEIRO DO CELULAR 1 (O GOLPE) ----------
   de:    'golpista' (balão da esquerda) ou 'vitima' (balão da direita)
   tipo:  'texto' (padrão), 'pix' (cartão com a chave Pix)
          ou 'notificacao' (aviso que desce do topo da tela)
   pausa: tempo de espera, em milissegundos, antes de aparecer
          (nas mensagens do golpista, o "digitando…" vem depois da pausa)
   Use SEMPRE nomes, números e valores fictícios e mascarados. */
var ROTEIRO_GOLPE = [
  { de: 'golpista', texto: 'Oi mãe, troquei de número. Salva esse aqui', pausa: 700 },
  { de: 'golpista', texto: 'O outro celular quebrou 😕', pausa: 350 },
  { de: 'vitima', texto: 'Oi filho! Tá tudo bem?', pausa: 1200 },
  { de: 'golpista', texto: 'Tô com um problema, preciso pagar um boleto hoje', pausa: 450 },
  { de: 'golpista', texto: 'Me faz um Pix de R$ 2.400? Amanhã te devolvo', pausa: 350 },
  { de: 'vitima', texto: 'Tá bom, me manda a chave', pausa: 1300 },
  { de: 'golpista', tipo: 'pix', nome: 'M•••• S••••', chave: 'Chave aleatória 7f3a-••••', pausa: 450 },
  { tipo: 'notificacao', titulo: 'Pix enviado · R$ 2.400', texto: 'Para M•••• S••••', pausa: 1400 }
];

/* ---------- ROTEIRO DO CELULAR 2 (A INVESTIGAÇÃO) ----------
   icone:  nome de um ícone de js/icons.js
   item:   o que está sendo analisado
   achado: a etiqueta que aparece quando o item é concluído */
var ROTEIRO_INVESTIGACAO = [
  { icone: 'phone', item: 'Número usado', achado: 'Vínculo encontrado' },
  { icone: 'user-round', item: 'Foto de perfil', achado: 'Copiada de outra conta' },
  { icone: 'landmark', item: 'Chave Pix / conta', achado: 'Conta de terceiro identificada' },
  { icone: 'clock', item: 'Horário das mensagens', achado: 'Padrão de outras vítimas' }
];

// Páginas em inglês (js/config.js)
traduzirTudo(ROTEIRO_GOLPE, ['de', 'tipo', 'pausa', 'nome']);
traduzirTudo(ROTEIRO_INVESTIGACAO, ['icone']);

/* ---------- TEMPOS (milissegundos) ---------- */
var TEMPOS_DEMO = {
  digitando: 950,        // quanto tempo o "digitando…" fica na tela
  antesDaAnalise: 1700,  // depois do Pix enviado, até a investigação começar
  analisando: 900,       // cada item fica "Analisando…" por este tempo
  entreItens: 450,       // intervalo entre um item e o próximo
  relatorio: 700,        // depois do último item, até o relatório acender
  paradoNoFim: 5000,     // tempo parado no final antes de recomeçar
  saida: 600             // duração da transição de saída do loop
};

(function () {
  'use strict';

  var secao = document.querySelector('[data-demo]');
  if (!secao) return;

  var palco = secao.querySelector('[data-demo-stage]');
  var aparelhos = Array.prototype.slice.call(secao.querySelectorAll('[data-demo-phone] .phone'));
  var chat = secao.querySelector('[data-demo-chat]');
  var notificacao = secao.querySelector('[data-demo-notif]');
  var status = secao.querySelector('[data-demo-status]');
  var mapa = secao.querySelector('[data-demo-map]');
  var listaItens = secao.querySelector('[data-demo-rows]');
  var barra = secao.querySelector('[data-demo-progress]');
  var relatorio = secao.querySelector('[data-demo-report]');
  var indicadorNum = secao.querySelector('[data-demo-indicator-num]');
  var indicadorTexto = secao.querySelector('[data-demo-indicator-text]');

  // Animação ligada? (sem a biblioteca Motion ou com "reduzir movimento": não)
  // (reduzirMovimento() fica em js/config.js: interruptor CONFIG.animacoesSempre)
  var comAnimacao = typeof Motion !== 'undefined' && !reduzirMovimento() &&
    document.documentElement.classList.contains('motion-ok');

  var umAparelhoSo = window.matchMedia('(max-width: 1023px)');
  var mouseFino = window.matchMedia('(hover: hover) and (pointer: fine)');
  var EASE_OUT = RITMO.suave;

  function $$(seletor, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor));
  }

  // Desenha um ícone de js/icons.js (o mesmo formato usado no resto do site)
  function iconeSvg(nome) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[nome] || '') + '</svg>';
  }

  // Anima só se a animação estiver ligada (senão, não faz nada)
  function animar(el, quadros, opcoes) {
    if (comAnimacao) return Motion.animate(el, quadros, opcoes);
    return null;
  }

  /* =========================================================
     1. MONTAGEM: itens da análise e mapa de vínculos
     ========================================================= */
  function montarItens() {
    listaItens.innerHTML = ROTEIRO_INVESTIGACAO.map(function (passo) {
      return '<li class="case-row">' +
        '<span class="case-row__check"><svg viewBox="0 0 16 16"><path pathLength="1" d="M3.5 8.5l3 3 6-7"/></svg></span>' +
        '<span class="case-row__text">' +
          '<span class="case-row__name">' + passo.item + '</span>' +
          '<span class="case-tag" data-achado="' + passo.achado + '">' + T('Na fila') + '</span>' +
        '</span>' +
      '</li>';
    }).join('');
  }

  // Mapa: um nó central (o caso) e um nó para cada item, ligados por linhas.
  // Os itens se alternam: esquerda, direita, esquerda, direita…
  var SVG = 'http://www.w3.org/2000/svg';
  var CENTRO = { x: 120, y: 62, raio: 15 };

  function criarSvg(tag, atributos) {
    var el = document.createElementNS(SVG, tag);
    for (var nome in atributos) el.setAttribute(nome, atributos[nome]);
    return el;
  }

  function posicaoDoNo(i, total) {
    var linhas = Math.ceil(total / 2);
    var linha = Math.floor(i / 2);
    return {
      x: i % 2 === 0 ? 30 : 210,
      y: linhas > 1 ? 20 + linha * (84 / (linhas - 1)) : CENTRO.y
    };
  }

  function criarNo(x, y, raio, icone, classe) {
    var grupo = criarSvg('g', { 'class': classe });
    grupo.appendChild(criarSvg('circle', { cx: x, cy: y, r: raio }));
    var tamanho = raio * 1.05;
    var desenho = criarSvg('svg', { x: x - tamanho / 2, y: y - tamanho / 2, width: tamanho, height: tamanho, viewBox: '0 0 24 24' });
    desenho.innerHTML = ICONS[icone] || '';
    grupo.appendChild(desenho);
    return grupo;
  }

  function montarMapa() {
    var svg = criarSvg('svg', { viewBox: '0 0 240 124', 'class': 'case-map' });
    var total = ROTEIRO_INVESTIGACAO.length;

    ROTEIRO_INVESTIGACAO.forEach(function (passo, i) {
      var no = posicaoDoNo(i, total);
      var lado = no.x < CENTRO.x ? -1 : 1;
      var acima = no.y < CENTRO.y ? 1 : -1;
      // Curva: sai do centro na horizontal e chega ao nó na vertical
      var d = 'M' + (CENTRO.x + lado * CENTRO.raio) + ' ' + CENTRO.y +
        ' Q' + no.x + ' ' + CENTRO.y + ' ' + no.x + ' ' + (no.y + acima * 11);
      svg.appendChild(criarSvg('path', { d: d, 'class': 'case-map__base' }));
      svg.appendChild(criarSvg('path', { d: d, 'class': 'case-map__line', pathLength: 1 }));
    });

    ROTEIRO_INVESTIGACAO.forEach(function (passo, i) {
      var no = posicaoDoNo(i, total);
      svg.appendChild(criarNo(no.x, no.y, 11, passo.icone, 'case-map__node'));
    });
    svg.appendChild(criarNo(CENTRO.x, CENTRO.y, CENTRO.raio, 'scan-search', 'case-map__center'));
    mapa.appendChild(svg);
  }

  /* =========================================================
     2. CELULAR 1: MENSAGENS
     ========================================================= */
  var deslocamentoChat = 0;   // quanto a conversa já "subiu"

  function criarBalao(mensagem) {
    var balao = document.createElement('div');
    var lado = mensagem.de === 'vitima' ? 'msg--out' : 'msg--in';
    balao.className = 'msg ' + lado;

    if (mensagem.tipo === 'pix') {
      balao.classList.add('msg--pix');
      balao.innerHTML =
        '<span class="pix__label">' + iconeSvg('receipt-text') + T('Chave Pix') + '</span>' +
        '<strong>' + mensagem.nome + '</strong>' +
        '<span class="pix__key">' + mensagem.chave + '</span>';
    } else {
      balao.textContent = mensagem.texto;
    }
    return balao;
  }

  // Se a conversa passou do tamanho da tela, ela sobe sozinha
  function rolarConversa() {
    var excesso = chat.offsetHeight - chat.parentNode.clientHeight;
    if (excesso <= deslocamentoChat) return;
    deslocamentoChat = excesso;
    var destino = 'translateY(' + (-excesso) + 'px)';
    if (comAnimacao) animar(chat, { transform: destino }, { duration: 0.45, ease: EASE_OUT });
    else chat.style.transform = destino;
  }

  function adicionarBalao(el) {
    chat.appendChild(el);
    animar(el, {
      opacity: [0, 1],
      transform: ['translateY(8px) scale(0.96)', 'translateY(0px) scale(1)']
    }, { duration: 0.35, ease: EASE_OUT });
    rolarConversa();
  }

  function mostrarDigitando() {
    var balao = document.createElement('div');
    balao.className = 'msg msg--in msg--typing';
    balao.setAttribute('data-digitando', '');
    balao.innerHTML = '<i></i><i></i><i></i>';
    adicionarBalao(balao);
  }

  function tirarDigitando() {
    var balao = chat.querySelector('[data-digitando]');
    if (balao) balao.remove();
  }

  function mostrarNotificacao(mensagem) {
    secao.querySelector('[data-demo-notif-title]').textContent = mensagem.titulo;
    secao.querySelector('[data-demo-notif-sub]').textContent = mensagem.texto;
    notificacao.classList.add('is-on');
  }

  /* =========================================================
     3. CELULAR 2: A ANÁLISE
     ========================================================= */
  function linhaDoItem(i) { return listaItens.children[i]; }

  function analisarItem(i) {
    var linha = linhaDoItem(i);
    linha.classList.add('is-active');
    linha.querySelector('.case-tag').textContent = T('Analisando…');
  }

  function concluirItem(i) {
    var linha = linhaDoItem(i);
    var etiqueta = linha.querySelector('.case-tag');
    linha.classList.remove('is-active');
    linha.classList.add('is-done');
    etiqueta.textContent = etiqueta.getAttribute('data-achado');
    // No mapa: a linha se desenha e o nó acende
    mapa.querySelectorAll('.case-map__line')[i].classList.add('is-on');
    mapa.querySelectorAll('.case-map__node')[i].classList.add('is-on');
    barra.style.setProperty('--progresso', (i + 1) / ROTEIRO_INVESTIGACAO.length);
  }

  function mostrarRelatorio() {
    mapa.querySelector('.case-map__center').classList.add('is-on');
    status.textContent = T('Concluído');
    status.classList.add('is-done');
    relatorio.classList.add('is-ready');
  }

  /* =========================================================
     4. TROCA DE TELA (só quando há um aparelho só)
     O aparelho "vira" como um cartão: some de lado e o outro
     aparece do outro lado.
     ========================================================= */
  var telaAtual = 1;
  var NOMES_TELA = { 1: T('O golpe'), 2: T('A investigação') };

  function atualizarIndicador(tela) {
    indicadorNum.textContent = tela + '/2';
    indicadorTexto.textContent = NOMES_TELA[tela];
  }

  function irParaTela(tela) {
    var anterior = telaAtual;
    telaAtual = tela;
    if (anterior === tela) return;

    if (!comAnimacao || !umAparelhoSo.matches) {
      palco.setAttribute('data-tela', tela);
      atualizarIndicador(tela);
      return;
    }

    var sai = aparelhos[anterior - 1];
    var entra = aparelhos[tela - 1];
    // Troca em 2D (desliza e esmaece). A antiga "virada" em 3D (rotateY)
    // fazia o Safari do iPhone sumir com a moldura do aparelho.
    animar(sai, { transform: ['translateX(0px) scale(1)', 'translateX(-28px) scale(0.96)'], opacity: [1, 0] },
      { duration: 0.3, ease: RITMO.acelera }).finished.then(function () {
      palco.setAttribute('data-tela', tela);
      atualizarIndicador(tela);
      // Volta ao normal sem tirar o transform (tirar desfazia a camada
      // do aparelho no Safari do iPhone e a moldura piscava)
      sai.style.transform = 'translateX(0px) scale(1)';
      sai.style.opacity = '';
      animar(entra, { transform: ['translateX(28px) scale(0.96)', 'translateX(0px) scale(1)'], opacity: [0, 1] },
        { duration: 0.45, ease: EASE_OUT });
    });
  }

  /* =========================================================
     5. COMEÇAR DE NOVO (loop)
     ========================================================= */
  function limpar() {
    $$('.msg', chat).forEach(function (m) { m.remove(); });
    deslocamentoChat = 0;
    chat.style.transform = '';
    notificacao.classList.remove('is-on');
    $$('.case-row', listaItens).forEach(function (linha) {
      linha.classList.remove('is-active', 'is-done');
      linha.querySelector('.case-tag').textContent = T('Na fila');
    });
    $$('.is-on', mapa).forEach(function (el) { el.classList.remove('is-on'); });
    barra.style.setProperty('--progresso', 0);
    status.textContent = T('Aguardando');
    status.classList.remove('is-active', 'is-done');
    relatorio.classList.remove('is-ready');
  }

  // Saída suave: o conteúdo das duas telas apaga e sobe um pouco
  function sair() {
    animar($$('.chat__body, .case', secao),
      { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-8px)'] },
      { duration: TEMPOS_DEMO.saida / 1000, ease: EASE_OUT });
    notificacao.classList.remove('is-on');
  }

  function recomecar() {
    limpar();
    irParaTela(1);
    animar($$('.chat__body, .case', secao),
      { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
      { duration: 0.5, ease: EASE_OUT });
  }

  /* =========================================================
     6. A HISTÓRIA, PASSO A PASSO
     Cada passo diz quanto esperar e o que fazer depois.
     ========================================================= */
  function montarPassos() {
    var passos = [];

    ROTEIRO_GOLPE.forEach(function (mensagem) {
      if (mensagem.tipo === 'notificacao') {
        passos.push({ espera: mensagem.pausa, fazer: function () { mostrarNotificacao(mensagem); } });
      } else if (mensagem.de === 'golpista') {
        // golpista: primeiro aparece "digitando…", depois a mensagem
        passos.push({ espera: mensagem.pausa, fazer: mostrarDigitando });
        passos.push({ espera: TEMPOS_DEMO.digitando, fazer: function () {
          tirarDigitando();
          adicionarBalao(criarBalao(mensagem));
        } });
      } else {
        passos.push({ espera: mensagem.pausa, fazer: function () { adicionarBalao(criarBalao(mensagem)); } });
      }
    });

    // Começa a investigação
    passos.push({ espera: TEMPOS_DEMO.antesDaAnalise, fazer: function () {
      irParaTela(2);
      status.textContent = T('Em análise');
      status.classList.add('is-active');
    } });

    ROTEIRO_INVESTIGACAO.forEach(function (passo, i) {
      passos.push({ espera: i === 0 ? 900 : TEMPOS_DEMO.entreItens, fazer: function () { analisarItem(i); } });
      passos.push({ espera: TEMPOS_DEMO.analisando, fazer: function () { concluirItem(i); } });
    });

    passos.push({ espera: TEMPOS_DEMO.relatorio, fazer: mostrarRelatorio });
    passos.push({ espera: TEMPOS_DEMO.paradoNoFim, fazer: sair });
    passos.push({ espera: TEMPOS_DEMO.saida + 100, fazer: recomecar });
    return passos;
  }

  /* RELÓGIO QUE PAUSA
     Funciona como um setTimeout, mas dá para pausar no meio:
     guardamos quanto tempo faltava e continuamos de onde parou. */
  function criarRelogio() {
    var timer = null, acao = null, restante = 0, inicio = 0, pausado = true;

    function agendar() {
      inicio = performance.now();
      timer = setTimeout(function () {
        timer = null;
        var fazer = acao;
        acao = null;
        fazer();
      }, restante);
    }

    return {
      esperar: function (ms, fazer) {
        acao = fazer;
        restante = ms;
        if (!pausado) agendar();
      },
      pausar: function () {
        if (pausado) return;
        pausado = true;
        if (timer) {
          clearTimeout(timer);
          timer = null;
          restante = Math.max(0, restante - (performance.now() - inicio));
        }
      },
      continuar: function () {
        if (!pausado) return;
        pausado = false;
        if (acao && !timer) agendar();
      }
    };
  }

  function tocarHistoria() {
    var passos = montarPassos();
    var relogio = criarRelogio();

    function tocar(i) {
      if (i >= passos.length) i = 0;   // chegou ao fim: volta ao começo
      relogio.esperar(passos[i].espera, function () {
        passos[i].fazer();
        tocar(i + 1);
      });
    }
    tocar(0);

    // Só anda com a seção na tela (e com a aba do navegador aberta)
    var naTela = false;
    function atualizar() {
      var rodar = naTela && !document.hidden;
      secao.classList.toggle('is-paused', !rodar);
      if (rodar) relogio.continuar();
      else relogio.pausar();
    }
    new IntersectionObserver(function (entradas) {
      naTela = entradas[0].isIntersecting;
      atualizar();
    }, { threshold: 0.3 }).observe(palco);
    document.addEventListener('visibilitychange', atualizar);
  }

  /* =========================================================
     7. ESTADO FINAL (sem animação)
     Mostra a conversa completa e o relatório pronto.
     ========================================================= */
  function mostrarFinal() {
    secao.classList.add('demo--estatico');
    ROTEIRO_GOLPE.forEach(function (mensagem) {
      if (mensagem.tipo === 'notificacao') mostrarNotificacao(mensagem);
      else chat.appendChild(criarBalao(mensagem));
    });
    rolarConversa();
    status.textContent = T('Em análise');
    ROTEIRO_INVESTIGACAO.forEach(function (passo, i) { concluirItem(i); });
    mostrarRelatorio();
  }

  /* =========================================================
     8. MOVIMENTO DOS CELULARES
     ========================================================= */
  // Entram presos à rolagem: saem de uma leve rotação, 36px abaixo.
  // No celular (um aparelho só), a entrada é simples e acontece uma vez
  // quando o aparelho aparece: a versão presa à rolagem podia ficar pela
  // metade no Safari do iPhone e nos navegadores do WhatsApp e Instagram.
  function entrarComARolagem() {
    if (umAparelhoSo.matches) {
      if (typeof Motion === 'undefined' || !Motion.inView) return;
      $$('[data-demo-enter]', secao).forEach(function (el) {
        el.style.opacity = '0';
        Motion.inView(el, function () {
          animar(el, { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
            { duration: 0.7, ease: EASE_OUT });
        }, { amount: 0.15 });
      });
      return;
    }
    if (typeof window.presoARolagem !== 'function') return;
    $$('[data-demo-enter]', secao).forEach(function (el, i) {
      var giro = i === 0 ? -7 : 7;
      window.presoARolagem(el, {
        opacity: [0, 1],
        transform: ['translateY(36px) rotate(' + giro + 'deg)', 'translateY(0px) rotate(0deg)']
      }, '100%', '45%');
    });
  }

  // Com o mouse (computador), os celulares inclinam em 3D na direção
  // do cursor, no máximo 4 graus, com a mola de js/interacoes.js
  function inclinarComOMouse() {
    if (!mouseFino.matches || typeof window.criarMola !== 'function') return;
    var camadas = $$('[data-demo-tilt]', secao);
    var MAXIMO = 4;

    var mola = window.criarMola({
      forca: 0.05,
      atrito: 0.8,
      aoMover: function (x, y) {
        camadas.forEach(function (camada, i) {
          var forca = i === 0 ? 0.75 : 1;   // o de trás mexe um pouco menos
          camada.style.transform = 'rotateX(' + (-y * MAXIMO * forca).toFixed(2) + 'deg) rotateY(' +
            (x * MAXIMO * forca).toFixed(2) + 'deg)';
        });
      }
    });

    function limitar(n) { return Math.max(-1, Math.min(1, n)); }

    secao.addEventListener('pointermove', function (evento) {
      var caixa = palco.getBoundingClientRect();
      var x = (evento.clientX - (caixa.left + caixa.width / 2)) / (caixa.width / 2);
      var y = (evento.clientY - (caixa.top + caixa.height / 2)) / (caixa.height / 2);
      mola.irPara(limitar(x), limitar(y));
    });
    secao.addEventListener('pointerleave', function () { mola.irPara(0, 0); });
  }

  /* ---------- INICIAR ---------- */
  montarItens();
  montarMapa();

  if (!comAnimacao) {
    mostrarFinal();
    return;
  }

  entrarComARolagem();
  inclinarComOMouse();
  tocarHistoria();
})();

/* =========================================================
   MONTADOR DE MENSAGEM DO WHATSAPP
   ---------------------------------------------------------
   Os botões principais de WhatsApp (com data-montador) abrem
   este painel em vez de ir direto para o WhatsApp:
     1. O que aconteceu? (categorias + "Outro")
     2. Quando foi?
     3. Já registrou boletim de ocorrência?
     + "Conte em uma frase" (opcional, até 200 letras)
   Ao lado (computador) ou abaixo (celular) aparece a PRÉVIA:
   exatamente o texto que vai chegar no WhatsApp.

   Nada é guardado no site: o texto só vai para o WhatsApp
   quando a pessoa toca em "Abrir no WhatsApp".

   Atributos que os botões podem ter:
     data-montador="id-do-servico"  já marca o serviço (opcional)
     data-montador-urgente           já marca "É urgente"
     data-montador-frase="..."       já preenche a frase
     data-montador-contexto="..."    linha extra no fim (ex.: verificador)
   No HTML, o href do botão pode ser um link normal do WhatsApp
   (reserva para quem está SEM JavaScript). Com JavaScript, esse
   link vai para data-href e o href vira "#contato": o WhatsApp só
   abre pelos botões "Abrir no WhatsApp" e "Prefiro enviar sem
   preencher", dentro do painel (veja "Desarmar os botões").

   PARA EDITAR AS OPÇÕES: mude a lista OPCOES_MONTADOR abaixo.
   (As categorias vêm de js/services.js.)
   ========================================================= */

var OPCOES_MONTADOR = {
  // Pergunta 2: "Quando foi?" (rotulo = chip; texto = como entra na mensagem)
  quando: [
    { rotulo: 'Hoje', texto: 'hoje' },
    { rotulo: 'Esta semana', texto: 'nesta semana' },
    { rotulo: 'Este mês', texto: 'neste mês' },
    { rotulo: 'Há mais tempo', texto: 'há mais de um mês' }
  ],
  // Pergunta 3: "Já registrou boletim de ocorrência?"
  boletim: [
    { rotulo: 'Sim', texto: 'já registrei' },
    { rotulo: 'Não', texto: 'ainda não registrei' },
    { rotulo: 'Não sei', texto: 'não sei' }
  ],
  // Chip extra no fim da pergunta 1
  outro: { rotulo: 'Outro', texto: 'outro tipo de caso' },
  // Tamanho máximo da frase
  limiteFrase: 200
};
traduzirTudo(OPCOES_MONTADOR);   // páginas em inglês (js/config.js)

(function () {
  'use strict';

  var V = window.Vestigio;
  if (!V) return;
  var $ = V.$;
  var $$ = V.$$;

  var painel = null;
  var estado = {};   // o que a pessoa escolheu

  /* ---------- Montar a mensagem ---------- */
  function montarMensagem() {
    var linhas = [];
    linhas.push(T('Olá! Vim pelo site da Vestígio.') + (estado.urgente ? ' ' + T('É urgente.') : ''));

    var servico = estado.servico ? V.buscarServico(estado.servico) : null;
    if (servico) {
      linhas.push(T('Assunto:') + ' ' + servico.nome);
    } else if (estado.categoria === 'outro') {
      linhas.push(T('O que aconteceu:') + ' ' + OPCOES_MONTADOR.outro.texto);
    } else if (estado.categoria) {
      linhas.push(T('O que aconteceu:') + ' ' + V.nomeDaCategoria(estado.categoria));
    }
    if (estado.quando) linhas.push(T('Quando foi:') + ' ' + estado.quando);
    if (estado.boletim) linhas.push(T('Boletim de ocorrência:') + ' ' + estado.boletim);
    var frase = (estado.frase || '').trim();
    if (frase) linhas.push(T('Em uma frase:') + ' ' + frase);
    if (estado.contexto) linhas.push(estado.contexto);

    // Nada preenchido? Usa a mensagem padrão do config.js
    if (linhas.length === 1 && !estado.urgente) return CONFIG.mensagemPadrao;
    return linhas.join('\n');
  }

  // Mensagem do link "Prefiro enviar sem preencher"
  function mensagemRapida() {
    var texto = CONFIG.mensagemPadrao;
    var servico = estado.servico ? V.buscarServico(estado.servico) : null;
    if (servico) texto = CONFIG.mensagemServico.replace('{servico}', servico.nome);
    if (estado.contexto) texto += '\n' + estado.contexto;
    return texto;
  }

  /* ---------- HTML do painel ---------- */
  function chip(nome, valor, rotulo) {
    return (
      '<label class="chip mont__chip">' +
        '<input class="mont__radio" type="radio" name="' + nome + '" value="' + V.escapar(valor) + '">' +
        '<span class="mont__chip-check" aria-hidden="true">' + V.icone('check') + '</span>' +
        '<span>' + V.escapar(rotulo) + '</span>' +
      '</label>'
    );
  }

  function criarPainel() {
    painel = document.createElement('dialog');
    painel.className = 'sheet sheet--montador';
    painel.setAttribute('data-lenis-prevent', '');
    painel.setAttribute('aria-labelledby', 'mont-titulo');

    var categorias = CATEGORIAS.map(function (c) { return chip('mont-categoria', c.id, c.nome); }).join('') +
      chip('mont-categoria', 'outro', OPCOES_MONTADOR.outro.rotulo);
    var quando = OPCOES_MONTADOR.quando.map(function (o) { return chip('mont-quando', o.texto, o.rotulo); }).join('');
    var boletim = OPCOES_MONTADOR.boletim.map(function (o) { return chip('mont-boletim', o.texto, o.rotulo); }).join('');

    painel.innerHTML = TH(
      '<div class="sheet__panel" data-sheet-panel>' +
        '<header class="sheet__header">' +
          '<span class="sheet__icon" aria-hidden="true">' + V.icone('message-square-text') + '</span>' +
          '<div class="sheet__heading">' +
            '<p class="sheet__kicker mono">Mensagem para o WhatsApp</p>' +
            '<h2 id="mont-titulo" tabindex="-1" data-painel-foco>Conte em poucos toques</h2>' +
          '</div>' +
          '<button class="sheet__close" type="button" data-sheet-close aria-label="Fechar o montador de mensagem">' + V.icone('x') + '</button>' +
        '</header>' +
        '<div class="sheet__body mont">' +
          '<form class="mont__form" data-mont-form>' +
            '<p class="mont__intro">Tudo é opcional. Você vê a mensagem pronta antes de enviar.</p>' +

            // Urgente (liga e desliga)
            '<label class="mont__urgente">' +
              '<input class="mont__radio" type="checkbox" name="mont-urgente">' +
              '<span class="mont__urgente-chave" aria-hidden="true"></span>' +
              '<span class="mont__urgente-texto"><strong>É urgente</strong><span>Aconteceu agora ou ainda está acontecendo</span></span>' +
            '</label>' +

            '<fieldset class="mont__campo">' +
              '<legend class="mont__pergunta"><span class="mono">01</span>O que aconteceu?</legend>' +
              '<p class="mont__servico" data-mont-servico hidden>' +
                '<span class="mono">Serviço</span><strong data-mont-servico-nome></strong>' +
                '<button class="mont__servico-tirar" type="button" data-mont-servico-tirar aria-label="Tirar o serviço da mensagem">' + V.icone('x') + '</button>' +
              '</p>' +
              '<div class="mont__chips">' + categorias + '</div>' +
            '</fieldset>' +

            '<fieldset class="mont__campo">' +
              '<legend class="mont__pergunta"><span class="mono">02</span>Quando foi?</legend>' +
              '<div class="mont__chips">' + quando + '</div>' +
            '</fieldset>' +

            '<fieldset class="mont__campo">' +
              '<legend class="mont__pergunta"><span class="mono">03</span>Já registrou boletim de ocorrência?</legend>' +
              '<div class="mont__chips">' + boletim + '</div>' +
            '</fieldset>' +

            '<div class="mont__campo">' +
              '<label class="mont__pergunta" for="mont-frase"><span class="mono">04</span>Conte em uma frase <span class="mont__opcional">(opcional)</span></label>' +
              '<textarea class="mont__frase" id="mont-frase" name="mont-frase" rows="3" maxlength="' + OPCOES_MONTADOR.limiteFrase + '"' +
                ' placeholder="Ex.: Vendi um celular e o comprador mandou um comprovante falso." aria-describedby="mont-contador"></textarea>' +
              '<p class="mont__contador mono" id="mont-contador" data-mont-contador>0/' + OPCOES_MONTADOR.limiteFrase + '</p>' +
            '</div>' +
          '</form>' +

          // Prévia da mensagem
          '<aside class="mont__previa" aria-labelledby="mont-previa-titulo">' +
            '<p class="mont__previa-titulo mono" id="mont-previa-titulo">Prévia da mensagem</p>' +
            '<div class="mont__conversa">' +
              '<div class="mont__para">' +
                '<span class="mont__para-avatar" aria-hidden="true"><img src="' + V.raizSite + 'assets/logo-simbolo.svg" alt="" width="16" height="16"></span>' +
                '<span><strong>Vestígio</strong><span class="mono" data-config-numero></span></span>' +
              '</div>' +
              '<div class="mont__balao" data-mont-balao>' +
                '<p class="mont__balao-texto" data-mont-texto></p>' +
                '<span class="mont__balao-hora mono" aria-hidden="true">agora</span>' +
              '</div>' +
            '</div>' +
            '<p class="sheet__warning mont__aviso">' + V.icone('shield-check') +
              '<span>Nunca pedimos senhas, códigos ou acesso às suas contas.</span></p>' +
          '</aside>' +
        '</div>' +
        '<footer class="sheet__footer mont__rodape">' +
          '<a class="btn btn--primary btn--block" href="#" target="_blank" rel="noopener" data-mont-enviar>' +
            '<span class="wa-icon">' + V.icone('whatsapp') + '</span>Abrir no WhatsApp' +
            '<span class="btn__orb" aria-hidden="true">' + V.icone('arrow-up-right') + '</span>' +
          '</a>' +
          '<a class="mont__rapido" href="#" target="_blank" rel="noopener" data-mont-rapido>Prefiro enviar sem preencher</a>' +
        '</footer>' +
      '</div>');

    document.body.appendChild(painel);
    V.ligarPainel(painel);
    $('[data-config-numero]', painel).textContent = CONFIG.whatsappFormatado;
    ligarEventos();
  }

  /* ---------- Eventos do formulário ---------- */
  function ligarEventos() {
    var form = $('[data-mont-form]', painel);

    // Chip já marcado + clique de novo = desmarca (rádio comum não deixa)
    var marcadoAntes = null;
    form.addEventListener('pointerdown', function (evento) {
      var label = evento.target.closest('.mont__chip');
      marcadoAntes = label ? $('input', label).checked && $('input', label) : null;
    });
    // (o clique no chip chega duas vezes: no rótulo e na bolinha escondida;
    //  só a segunda, na própria bolinha, interessa aqui)
    form.addEventListener('click', function (evento) {
      var input = evento.target;
      if (!input.matches || !input.matches('.mont__chip input')) return;
      if (input === marcadoAntes) {
        input.checked = false;
        lerFormulario();
      }
      marcadoAntes = null;
    });

    form.addEventListener('change', lerFormulario);
    form.addEventListener('input', function (evento) {
      if (evento.target.name === 'mont-frase') lerFormulario();
    });
    form.addEventListener('submit', function (evento) { evento.preventDefault(); });

    // Tirar o serviço (fica só a categoria)
    $('[data-mont-servico-tirar]', painel).addEventListener('click', function () {
      estado.servico = null;
      atualizarServico();
      atualizarPrevia();
      var chipMarcado = $('input[name="mont-categoria"]:checked', painel) || $('input[name="mont-categoria"]', painel);
      chipMarcado.focus();
    });

    // Depois de abrir o WhatsApp, o painel fecha
    $('[data-mont-enviar]', painel).addEventListener('click', function () {
      setTimeout(function () { V.fecharPainel(painel); }, 150);
    });
    $('[data-mont-rapido]', painel).addEventListener('click', function () {
      setTimeout(function () { V.fecharPainel(painel); }, 150);
    });
  }

  function valorDe(nome) {
    var marcado = $('input[name="' + nome + '"]:checked', painel);
    return marcado ? marcado.value : '';
  }

  function lerFormulario() {
    estado.urgente = $('input[name="mont-urgente"]', painel).checked;
    var categoria = valorDe('mont-categoria');
    // Trocou a categoria? O serviço marcado (de outra categoria) sai
    var servico = estado.servico ? V.buscarServico(estado.servico) : null;
    if (servico && categoria !== servico.categoria) {
      estado.servico = null;
      atualizarServico();
    }
    estado.categoria = categoria;
    estado.quando = valorDe('mont-quando');
    estado.boletim = valorDe('mont-boletim');
    var campoFrase = $('#mont-frase', painel);
    estado.frase = campoFrase.value;
    $('[data-mont-contador]', painel).textContent = campoFrase.value.length + '/' + OPCOES_MONTADOR.limiteFrase;
    atualizarPrevia();
  }

  function atualizarServico() {
    var servico = estado.servico ? V.buscarServico(estado.servico) : null;
    var linha = $('[data-mont-servico]', painel);
    linha.hidden = !servico;
    if (servico) $('[data-mont-servico-nome]', painel).textContent = servico.nome;
  }

  /* ---------- Prévia ao vivo ---------- */
  var linhasAntes = [];

  function atualizarPrevia() {
    var mensagem = montarMensagem();
    var linhas = mensagem.split('\n');
    var caixaTexto = $('[data-mont-texto]', painel);

    // Cada linha vira um <span>; as linhas novas ou alteradas "acendem"
    caixaTexto.innerHTML = linhas.map(function (linha) {
      var nova = linhasAntes.length && linhasAntes.indexOf(linha) < 0;
      return '<span class="mont__linha' + (nova ? ' is-nova' : '') + '">' + V.escapar(linha) + '</span>';
    }).join('');
    linhasAntes = linhas;

    // O balão se ajeita com um desfoque rápido (o texto não "pula")
    if (V.podeMover() && painel.open) {
      var ajeitar = { opacity: [0.75, 1] };
      if (podeDesfocar()) ajeitar.filter = ['blur(1.5px)', 'blur(0px)'];
      V.animar($('[data-mont-balao]', painel), ajeitar, { duration: RITMO.rapido, ease: V.EASE_OUT });
    }

    $('[data-mont-enviar]', painel).href = linkWhatsApp(mensagem);
    $('[data-mont-rapido]', painel).href = linkWhatsApp(mensagemRapida());
  }

  /* ---------- Abrir ---------- */
  // opcoes = { servico, urgente, frase, contexto }
  function abrirMontador(opcoes, gatilho) {
    if (!painel) criarPainel();
    opcoes = opcoes || {};

    // Começa do zero a cada abertura
    var form = $('[data-mont-form]', painel);
    form.reset();
    estado = {
      servico: opcoes.servico || null,
      urgente: !!opcoes.urgente,
      contexto: opcoes.contexto || ''
    };
    var servico = estado.servico ? V.buscarServico(estado.servico) : null;
    if (!servico) estado.servico = null;
    $('input[name="mont-urgente"]', painel).checked = estado.urgente;
    if (servico) {
      var chipCategoria = $('input[name="mont-categoria"][value="' + servico.categoria + '"]', painel);
      if (chipCategoria) chipCategoria.checked = true;
    }
    if (opcoes.frase) {
      $('#mont-frase', painel).value = String(opcoes.frase).slice(0, OPCOES_MONTADOR.limiteFrase);
      if (!servico) $('input[name="mont-categoria"][value="outro"]', painel).checked = true;
    }
    atualizarServico();
    linhasAntes = [];
    lerFormulario();
    $('.sheet__body', painel).scrollTop = 0;

    V.abrirPainel(painel, gatilho);
  }

  /* ---------- "Desarmar" os botões ----------
     Um botão com data-montador NUNCA pode abrir o WhatsApp sozinho.
     Por isso o link do WhatsApp sai do href e fica guardado em
     data-href; o href vira "#contato" e o target="_blank" sai.
     No HTML, o href original continua: sem JavaScript, o botão
     funciona como um link normal (é a reserva).
     Vale também para os botões criados depois (painel do serviço,
     verificador, "Primeiros 30 minutos", botão flutuante, busca):
     um "observador" desarma cada um assim que ele aparece. */
  function desarmar(botao) {
    var href = botao.getAttribute('href') || '';
    if (/^https?:/i.test(href)) {
      botao.setAttribute('data-href', href);
      botao.setAttribute('href', '#contato');
    }
    if (botao.hasAttribute('target')) botao.removeAttribute('target');
  }

  function desarmarTodos(raiz) {
    if (raiz.matches && raiz.matches('[data-montador]')) desarmar(raiz);
    if (raiz.querySelectorAll) $$('[data-montador]', raiz).forEach(desarmar);
  }

  desarmarTodos(document);
  new MutationObserver(function (mudancas) {
    mudancas.forEach(function (m) {
      if (m.type === 'attributes') {
        if (m.target.matches('[data-montador]')) desarmar(m.target);
      } else {
        Array.prototype.forEach.call(m.addedNodes, function (no) {
          if (no.nodeType === 1) desarmarTodos(no);
        });
      }
    });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'data-montador'] });

  // Qualquer botão com data-montador abre o montador.
  // O clique é pego na fase de CAPTURA (antes de qualquer outro
  // código) e a navegação é cancelada antes de abrir o painel.
  // Ctrl/Cmd/Shift + clique: abre o link direto numa aba nova.
  document.addEventListener('click', function (evento) {
    var botao = evento.target.closest && evento.target.closest('[data-montador]');
    if (!botao) return;
    if (painel && painel.contains(botao)) return;
    evento.preventDefault();
    evento.stopPropagation();

    if (evento.ctrlKey || evento.metaKey || evento.shiftKey) {
      var direto = botao.getAttribute('data-href') || linkWhatsApp();
      window.open(direto, '_blank', 'noopener');
      return;
    }

    abrirMontador({
      servico: botao.getAttribute('data-montador'),
      urgente: botao.hasAttribute('data-montador-urgente'),
      frase: botao.getAttribute('data-montador-frase'),
      contexto: botao.getAttribute('data-montador-contexto')
    }, botao);

    // Como o clique não segue adiante, avisamos quem precisa fechar
    // (ex.: as opções do botão flutuante, em js/navegacao.js)
    document.dispatchEvent(new CustomEvent('vestigio:montador'));
  }, true);

  V.abrirMontador = abrirMontador;
})();

/* =========================================================
   VERIFICADOR "ISSO É GOLPE?" (seção #verificador)
   ---------------------------------------------------------
   Seis perguntas de Sim / Não / Não sei, uma por vez.
   Cada "Sim" soma o PESO da pergunta; "Não sei" soma a
   metade. A soma decide o nível do resultado.
   Uma pergunta "crítica" (senha/código) leva direto ao nível
   mais alto se a resposta for "Sim".

   Nada é enviado nem guardado: as respostas ficam só na
   memória desta página e somem ao recarregar.

   PARA EDITAR: mude as listas abaixo.
   - PERGUNTAS_VERIFICADOR: texto, dica, peso e o "sinal"
     (como o sinal aparece no resultado e na mensagem).
   - NIVEIS_VERIFICADOR: a partir de quantos pontos vale cada
     nível e o que aparece no resultado.
   ========================================================= */

var PERGUNTAS_VERIFICADOR = [
  {
    texto: 'Pediram dinheiro, Pix ou pagamento com urgência?',
    dica: 'Ex.: “preciso hoje”, “a oferta acaba em uma hora”, “senão sua conta será bloqueada”.',
    peso: 3,
    sinal: 'Pediram dinheiro ou Pix com urgência',
    resumo: 'pediram Pix com urgência'
  },
  {
    texto: 'A pessoa ou empresa falou com você por um número, perfil ou e-mail novo, que você não conhecia?',
    dica: 'Inclui o “troquei de número”, perfis criados há pouco e e-mails com endereço estranho.',
    peso: 2,
    sinal: 'Contato por número, perfil ou e-mail novo',
    resumo: 'contato por número ou perfil novo'
  },
  {
    texto: 'Pediram senha, código recebido por SMS ou WhatsApp, ou acesso à sua conta?',
    dica: 'Nenhum banco, empresa ou loja séria pede isso.',
    peso: 5,
    critica: true,   // "Sim" aqui já leva ao nível mais alto
    sinal: 'Pediram senha, código ou acesso à sua conta',
    resumo: 'pediram senha ou código'
  },
  {
    texto: 'A oferta, o preço ou o prêmio parecia bom demais para ser verdade?',
    dica: 'Ex.: carro muito abaixo do preço, prêmio de um sorteio do qual você não lembra, lucro garantido.',
    peso: 2,
    sinal: 'Oferta, preço ou prêmio bom demais',
    resumo: 'oferta boa demais'
  },
  {
    texto: 'Pediram para sair da plataforma oficial ou para pagar “por fora”?',
    dica: 'Ex.: sair do app de vendas para o WhatsApp, ou pagar direto a uma pessoa em vez de pelo site.',
    peso: 2,
    sinal: 'Pediram para sair da plataforma oficial',
    resumo: 'pediram para sair da plataforma'
  },
  {
    texto: 'Pediram segredo, ou disseram para não contar a ninguém e não ligar para confirmar?',
    dica: 'Quem aplica golpes tenta impedir que você converse com alguém de confiança.',
    peso: 3,
    sinal: 'Pediram segredo ou para não confirmar',
    resumo: 'pediram segredo'
  }
];

// Do nível mais alto para o mais baixo. "minimo" = pontos para chegar nele.
var NIVEIS_VERIFICADOR = [
  {
    id: 'alto',
    minimo: 5,
    rotulo: 'Alto',
    titulo: 'Sinais fortes de golpe',
    texto: 'O que você descreveu combina com golpes comuns. Pare agora: não pague mais nada e não envie códigos.',
    tituloLista: 'O que fazer agora',
    passos: [
      'Pare a conversa e não faça nenhum pagamento.',
      'Não envie senhas nem códigos, para ninguém.',
      'Guarde as provas: prints, números, links e comprovantes.',
      'Se já pagou, ligue para o seu banco e peça o bloqueio (e o MED, se foi Pix).'
    ]
  },
  {
    id: 'medio',
    minimo: 2,
    rotulo: 'Médio',
    titulo: 'Atenção: há sinais de risco',
    texto: 'Alguns sinais acenderam. Antes de pagar ou responder, confirme por outro caminho.',
    tituloLista: 'Como confirmar',
    passos: [
      'Ligue para o número antigo da pessoa ou fale com ela pessoalmente.',
      'Procure o site e o telefone oficiais da empresa. Não use o link que você recebeu.',
      'Desconfie de prazo curto: quem é sério espera você confirmar.',
      'Na dúvida, não pague. Converse com alguém de confiança.'
    ]
  },
  {
    id: 'baixo',
    minimo: 0,
    rotulo: 'Baixo',
    titulo: 'Poucos sinais de golpe',
    texto: 'Suas respostas mostram poucos sinais de alerta. Mesmo assim, vale manter alguns cuidados.',
    tituloLista: 'Para se proteger',
    passos: [
      'Confira os dados de quem vai receber antes de qualquer pagamento.',
      'Ative a verificação em duas etapas no WhatsApp e nas redes sociais.',
      'Desconfie se, de repente, aparecer pressa ou pedido de segredo.',
      'Se algo mudar na conversa, faça a verificação de novo.'
    ]
  }
];

// Páginas em inglês (js/config.js)
traduzirTudo(PERGUNTAS_VERIFICADOR, ['peso', 'critica']);
traduzirTudo(NIVEIS_VERIFICADOR, ['id', 'minimo']);

(function () {
  'use strict';

  var V = window.Vestigio;
  var caixa = document.querySelector('[data-verificador]');
  if (!V || !caixa) return;
  var $ = V.$;
  var $$ = V.$$;

  var palco = $('[data-verif-palco]', caixa);
  var contador = $('[data-verif-contador]', caixa);
  var barra = $('[data-verif-barra]', caixa);
  var status = $('[data-verif-status]', caixa);
  var total = PERGUNTAS_VERIFICADOR.length;

  var respostas = [];   // 'sim', 'nao' ou 'naosei' (uma por pergunta)
  var atual = 0;        // número da pergunta na tela (0 = primeira)
  var mostrandoResultado = false;
  var trocando = false; // evita cliques duplos durante a animação

  // Tecla do "Sim": S no português, Y ("Yes") no inglês
  var TECLA_SIM = IDIOMA === 'en' ? 'Y' : 'S';
  var RESPOSTAS = [
    { valor: 'sim', rotulo: T('Sim'), tecla: TECLA_SIM, icone: 'check' },
    { valor: 'nao', rotulo: T('Não'), tecla: 'N', icone: 'x' },
    { valor: 'naosei', rotulo: T('Não sei'), tecla: '?', icone: 'circle-help' }
  ];

  /* ---------- Contador "00/06" e barra ---------- */
  function atualizarTopo() {
    var respondidas = respostas.filter(Boolean).length;
    var texto = V.doisDigitos(mostrandoResultado ? total : respondidas) + '/' + V.doisDigitos(total);
    if (contador.textContent !== texto) {
      contador.textContent = texto;
      if (V.decodificar) V.decodificar(contador);   // as letras se "decodificam"
    }
    barra.style.setProperty('--progresso', ((mostrandoResultado ? total : respondidas) / total).toFixed(3));
    status.textContent = T(mostrandoResultado ? 'Concluída' : (respondidas ? 'Em andamento' : 'Pronta'));
    caixa.classList.toggle('is-concluida', mostrandoResultado);
  }

  /* ---------- Tela da pergunta ---------- */
  function htmlDaPergunta(i) {
    var p = PERGUNTAS_VERIFICADOR[i];
    var escolhida = respostas[i];
    return (
      '<div class="verif__tela verif__pergunta">' +
        '<p class="verif__num mono">' + T('Pergunta') + ' ' + V.doisDigitos(i + 1) + ' ' + T('de') + ' ' + V.doisDigitos(total) + '</p>' +
        '<h3 class="verif__texto" id="verif-pergunta" tabindex="-1">' + V.escapar(p.texto) + '</h3>' +
        '<p class="verif__dica" id="verif-dica">' + V.escapar(p.dica) + '</p>' +
        '<div class="verif__respostas" role="group" aria-labelledby="verif-pergunta" aria-describedby="verif-dica">' +
          RESPOSTAS.map(function (r) {
            return (
              '<button class="verif__resposta" type="button" data-resposta="' + r.valor + '"' +
                ' aria-pressed="' + (escolhida === r.valor) + '" aria-keyshortcuts="' + (r.tecla === '?' ? 'Shift+?' : r.tecla) + '">' +
                '<span class="verif__resposta-icone" aria-hidden="true">' + V.icone(r.icone) + '</span>' +
                '<span class="verif__resposta-texto">' + r.rotulo + '</span>' +
                '<kbd class="verif__tecla" aria-hidden="true">' + r.tecla + '</kbd>' +
              '</button>'
            );
          }).join('') +
        '</div>' +
        '<div class="verif__rodape">' +
          '<button class="verif__voltar" type="button" data-verif-voltar' + (i === 0 ? ' disabled' : '') + '>' +
            V.icone('arrow-left') + T('Voltar') +
          '</button>' +
          '<p class="verif__atalhos" aria-hidden="true">' + T('Atalhos:') + ' <kbd>' + TECLA_SIM + '</kbd> <kbd>N</kbd> <kbd>?</kbd></p>' +
        '</div>' +
      '</div>'
    );
  }

  /* ---------- Cálculo do resultado ---------- */
  function calcular() {
    var pontos = 0;
    var critica = false;
    PERGUNTAS_VERIFICADOR.forEach(function (p, i) {
      if (respostas[i] === 'sim') {
        pontos += p.peso;
        if (p.critica) critica = true;
      }
      if (respostas[i] === 'naosei') pontos += p.peso / 2;
    });
    var nivel = NIVEIS_VERIFICADOR[NIVEIS_VERIFICADOR.length - 1];
    if (critica) nivel = NIVEIS_VERIFICADOR[0];
    else {
      for (var n = 0; n < NIVEIS_VERIFICADOR.length; n++) {
        if (pontos >= NIVEIS_VERIFICADOR[n].minimo) { nivel = NIVEIS_VERIFICADOR[n]; break; }
      }
    }
    return { pontos: pontos, critica: critica, nivel: nivel };
  }

  // Até onde o arco do medidor se desenha (de 0 a 1).
  // O arco tem três faixas iguais: baixo, médio e alto.
  function fracaoDoMedidor(r) {
    var maximo = PERGUNTAS_VERIFICADOR.reduce(function (t, p) { return t + p.peso; }, 0);
    var alto = NIVEIS_VERIFICADOR[0].minimo;
    var medio = NIVEIS_VERIFICADOR[1].minimo;
    if (r.nivel.id === 'alto') return r.critica ? 1 : 0.7 + 0.3 * Math.min((r.pontos - alto) / (maximo - alto), 1);
    if (r.nivel.id === 'medio') return 0.37 + 0.26 * Math.min((r.pontos - medio) / (alto - medio), 1);
    return 0.06 + 0.24 * Math.min(r.pontos / medio, 1);
  }

  /* ---------- Tela do resultado ---------- */
  function htmlDoResultado(r) {
    var sins = [];
    var duvidas = [];
    PERGUNTAS_VERIFICADOR.forEach(function (p, i) {
      if (respostas[i] === 'sim') sins.push(p);
      if (respostas[i] === 'naosei') duvidas.push(p);
    });

    var fichas = sins.map(function (p, i) {
      return '<li class="ficha"><span class="ficha__id mono">' + T('Sinal') + ' ' + V.doisDigitos(i + 1) + '</span>' + V.escapar(p.sinal) + '</li>';
    }).concat(duvidas.map(function (p) {
      return '<li class="ficha ficha--duvida"><span class="ficha__id mono">' + T('Em dúvida') + '</span>' + V.escapar(p.sinal) + '</li>';
    })).join('');

    var quantos = sins.length;
    var tituloFichas = quantos === 0 ? T('Nenhum sinal confirmado') :
      (quantos === 1 ? T('1 sinal encontrado') : quantos + ' ' + T('sinais encontrados'));

    // Mensagem do WhatsApp que resume a verificação
    var contexto = T('Fiz a verificação no site:') + ' ' + r.nivel.titulo.toLowerCase() + '.';
    if (sins.length) contexto += ' ' + primeiraMaiuscula(sins.map(function (p) { return p.resumo; }).join('; ')) + '.';
    if (duvidas.length) contexto += ' ' + T('Fiquei em dúvida sobre:') + ' ' + duvidas.map(function (p) { return p.resumo; }).join('; ') + '.';

    var urgente = r.nivel.id === 'alto';

    var pilula = T({ alto: 'Risco alto', medio: 'Risco médio', baixo: 'Risco baixo' }[r.nivel.id]);

    return TH(
      '<div class="verif__tela verif__resultado verif__resultado--' + r.nivel.id + '">' +
        '<div class="verif__resumo">' +
          // Medidor: arco que se desenha até o nível
          '<div class="medidor" aria-hidden="true">' +
            '<svg class="medidor__svg" viewBox="0 0 200 112" focusable="false">' +
              '<path class="medidor__trilho" pathLength="1" d="M20 100 A80 80 0 0 1 180 100"/>' +
              '<path class="medidor__nivel" pathLength="1" d="M20 100 A80 80 0 0 1 180 100" data-medidor-arco/>' +
              // marcas que separam as três faixas
              '<line class="medidor__marca" x1="65" y1="39.4" x2="55" y2="22.1"/>' +
              '<line class="medidor__marca" x1="135" y1="39.4" x2="145" y2="22.1"/>' +
            '</svg>' +
            '<div class="medidor__centro">' +
              '<span class="mono">Nível</span>' +
              '<strong>' + r.nivel.rotulo + '</strong>' +
            '</div>' +
            '<div class="medidor__faixas mono"><span>Baixo</span><span>Médio</span><span>Alto</span></div>' +
          '</div>' +
          '<div class="verif__resumo-texto">' +
            '<p class="verif__nivel"><span class="verif__nivel-pilula">' + pilula + '</span></p>' +
            '<h3 class="verif__resultado-titulo" id="verif-resultado" tabindex="-1">' + V.escapar(r.nivel.titulo) + '</h3>' +
            '<p class="verif__resultado-texto">' + V.escapar(r.nivel.texto) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="verif__fichas">' +
          '<p class="verif__fichas-titulo mono">' + tituloFichas + '</p>' +
          (fichas ? '<ul role="list" class="verif__fichas-lista">' + fichas + '</ul>' : '') +
        '</div>' +

        '<div class="verif__passos">' +
          '<h4>' + V.escapar(r.nivel.tituloLista) + '</h4>' +
          '<ol role="list">' + r.nivel.passos.map(function (passo) { return '<li>' + V.escapar(passo) + '</li>'; }).join('') + '</ol>' +
        '</div>' +

        '<div class="verif__acoes">' +
          (urgente
            ? '<button class="btn btn--primary" type="button" aria-haspopup="dialog" data-urgente>' +
                'Ver os primeiros 30 minutos<span class="btn__orb" aria-hidden="true">' + V.icone('arrow-right') + '</span></button>'
            : '') +
          '<a class="btn ' + (urgente ? 'btn--ghost' : 'btn--primary') + '" href="' + linkWhatsApp(T('Olá! Vim pelo site da Vestígio.') + '\n' + contexto) + '"' +
            ' target="_blank" rel="noopener" data-montador data-montador-contexto="' + V.escapar(contexto) + '"' + (urgente ? ' data-montador-urgente' : '') + '>' +
            '<span class="wa-icon">' + V.icone('whatsapp') + '</span>Falar com especialista</a>' +
          '<div class="verif__acoes-menores">' +
            '<button class="verif__link" type="button" data-verif-refazer>' + V.icone('rotate-ccw') + 'Refazer</button>' +
            '<button class="verif__link" type="button" data-verif-compartilhar>' + V.icone('share-2') + 'Compartilhar</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function primeiraMaiuscula(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  /* ---------- Troca de tela com animação ----------
     A tela atual sai para a esquerda (ou direita, ao voltar)
     com fade, e a nova entra pelo outro lado. */
  function trocarTela(html, direcao, depois) {
    trocando = true;
    var antiga = palco.firstElementChild;
    var sair = V.podeMover() && antiga
      ? V.animar(antiga, { opacity: 0, transform: 'translateX(' + (-24 * direcao) + 'px)' }, { duration: 0.14, ease: V.EASE_OUT })
      : Promise.resolve();

    sair.then(function () {
      palco.innerHTML = html;
      var nova = palco.firstElementChild;
      if (V.podeMover()) {
        V.animar(nova, { opacity: [0, 1], transform: ['translateX(' + (28 * direcao) + 'px)', 'translateX(0)'] },
          { duration: 0.26, ease: V.EASE_OUT });
      }
      trocando = false;
      if (depois) depois(nova);
    });
  }

  function mostrarPergunta(i, direcao, focar) {
    atual = i;
    mostrandoResultado = false;
    atualizarTopo();
    trocarTela(htmlDaPergunta(i), direcao, function () {
      if (focar) $('#verif-pergunta', palco).focus({ preventScroll: true });
    });
  }

  function mostrarResultado() {
    mostrandoResultado = true;
    atualizarTopo();
    var r = calcular();
    trocarTela(htmlDoResultado(r), 1, function (tela) {
      var arco = $('[data-medidor-arco]', tela);
      var fim = 1 - fracaoDoMedidor(r);
      if (V.podeMover()) {
        // O arco se desenha até o nível; as fichas entram uma a uma
        V.animar(arco, { strokeDashoffset: [1, fim] }, { duration: 1.1, ease: RITMO.fluida, delay: 0.15 });
        V.animar($$('.ficha', tela), { opacity: [0, 1], transform: ['translateY(8px) scale(0.97)', 'translateY(0) scale(1)'] },
          { duration: 0.35, ease: V.EASE_OUT, delay: Motion.stagger(0.07, { startDelay: 0.35 }) });
      } else {
        arco.style.strokeDashoffset = fim;
      }
      if (V.acenderBordas) V.acenderBordas($('.verif__fichas-lista', tela), '.ficha');
      $('#verif-resultado', tela).focus({ preventScroll: true });
    });
  }

  function responder(valor, botao) {
    if (trocando || mostrandoResultado) return;
    respostas[atual] = valor;
    $$('[data-resposta]', palco).forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-resposta') === valor));
    });
    atualizarTopo();
    // Um instante para ver a escolha marcada antes de trocar
    setTimeout(function () {
      if (atual + 1 < total) mostrarPergunta(atual + 1, 1, true);
      else mostrarResultado();
    }, V.podeMover() ? 160 : 0);
  }

  function refazer() {
    respostas = [];
    mostrarPergunta(0, -1, true);
  }

  /* ---------- Cliques ---------- */
  palco.addEventListener('click', function (evento) {
    var botao = evento.target.closest('[data-resposta]');
    if (botao) return responder(botao.getAttribute('data-resposta'), botao);
    if (evento.target.closest('[data-verif-voltar]') && atual > 0 && !trocando) return mostrarPergunta(atual - 1, -1, true);
    if (evento.target.closest('[data-verif-refazer]')) return refazer();
    if (evento.target.closest('[data-verif-compartilhar]')) {
      V.compartilhar({
        titulo: T('Isso é golpe? Verificação rápida | Vestígio'),
        texto: T('Seis perguntas rápidas para ver se uma conversa ou oferta tem sinais de golpe.'),
        url: window.location.href.split('#')[0] + '#verificador'
      });
    }
  });

  /* ---------- Atalhos de teclado: S, N e ? ----------
     Valem quando o verificador está na tela, ninguém está
     digitando num campo e nenhum painel está aberto. */
  var naTela = false;
  new IntersectionObserver(function (entradas) {
    naTela = entradas[0].isIntersecting;
  }, { threshold: 0.4 }).observe(caixa);

  document.addEventListener('keydown', function (evento) {
    if (!naTela || mostrandoResultado || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    var el = document.activeElement;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    if (document.querySelector('dialog[open]')) return;
    var tecla = evento.key.toLowerCase();
    var valor = tecla === TECLA_SIM.toLowerCase() ? 'sim' : tecla === 'n' ? 'nao' : tecla === '?' ? 'naosei' : null;
    if (!valor) return;
    evento.preventDefault();
    var botao = $('[data-resposta="' + valor + '"]', palco);
    if (botao) {
      // Mostra o botão "apertando", como se tivesse sido clicado
      botao.classList.add('is-apertado');
      setTimeout(function () { botao.classList.remove('is-apertado'); }, 160);
      responder(valor, botao);
    }
  });

  /* ---------- Começo ---------- */
  palco.innerHTML = htmlDaPergunta(0);
  atualizarTopo();
})();

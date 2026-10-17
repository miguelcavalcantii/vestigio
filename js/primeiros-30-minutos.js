/* =========================================================
   PAINEL "PRIMEIROS 30 MINUTOS" (botão "Caí em um golpe agora")
   ---------------------------------------------------------
   Abre pelos botões com data-urgente (menu, painel de
   serviços, botão flutuante, verificador).
   - Lista de passos que a pessoa marca; uma barra enche.
   - O que foi marcado fica guardado NESTE navegador
     (localStorage), para não perder se fechar o painel.
     Nada é enviado para lugar nenhum.
   - No fim, "Falar com a Vestígio agora" abre o montador de
     mensagem do WhatsApp já marcado como urgente.

   PARA EDITAR OS TEXTOS: mude as duas listas logo abaixo.
   (São os mesmos conselhos do guia "Caí em um golpe. E agora?"
   do index.html; se mudar lá, confira aqui também.)
   ========================================================= */

// Passos urgentes, na ordem. "id" é só um apelido (sem espaço).
var PASSOS_URGENTES = [
  {
    id: 'banco',
    titulo: 'Ligue para o seu banco agora.',
    texto: 'Peça o bloqueio da transação e, se foi Pix, a abertura do MED (Mecanismo Especial de Devolução). Anote o número do protocolo.'
  },
  {
    id: 'nao-apagar',
    titulo: 'Não apague nada.',
    texto: 'Conversas, e-mails, perfis e números ficam como prova, mesmo que doa olhar para eles.'
  },
  {
    id: 'prints',
    titulo: 'Tire prints e guarde os comprovantes.',
    texto: 'Com data, hora e número ou @ visíveis. Copie também o link dos perfis e dos anúncios. Se foi pelo WhatsApp, exporte a conversa.'
  },
  {
    id: 'boletim',
    titulo: 'Registre o boletim de ocorrência.',
    texto: 'Pode ser feito online, na delegacia virtual do seu estado.'
  }
];

// "Não faça" (versão curta)
var NAO_FACA = [
  { titulo: 'Não pague para recuperar o dinheiro.', texto: 'Quem cobra taxa para devolver costuma ser um segundo golpe.' },
  { titulo: 'Não confronte o golpista.', texto: 'Ele pode apagar perfis e provas.' },
  { titulo: 'Não envie senhas nem códigos.', texto: 'Ninguém sério pede isso.' },
  { titulo: 'Não se culpe.', texto: 'Pedir ajuda rápido é o que mais conta.' }
];

(function () {
  'use strict';

  var V = window.Vestigio;
  if (!V) return;

  var CHAVE = 'vestigio-primeiros-30';   // nome do que fica guardado no navegador

  /* ---------- Guardar e ler o progresso (pode falhar em aba anônima) ---------- */
  function lerFeitos() {
    try {
      var lista = JSON.parse(localStorage.getItem(CHAVE) || '[]');
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function guardarFeitos(lista) {
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch (e) { /* sem problema */ }
  }

  /* ---------- Montar o painel (uma vez, na primeira abertura) ---------- */
  var painel = null;

  function htmlDoPasso(passo, i) {
    return (
      '<li>' +
        '<label class="check">' +
          '<input class="check__input" type="checkbox" data-passo="' + passo.id + '">' +
          '<span class="check__caixa" aria-hidden="true">' +
            '<svg viewBox="0 0 16 16" focusable="false"><path pathLength="1" d="M3.5 8.5l3 3 6-7"/></svg>' +
          '</span>' +
          '<span class="check__texto">' +
            '<span class="check__num mono">Passo ' + V.doisDigitos(i + 1) + '</span>' +
            '<strong>' + V.escapar(passo.titulo) + '</strong>' +
            '<span>' + V.escapar(passo.texto) + '</span>' +
          '</span>' +
          '<span class="check__feito mono" aria-hidden="true">Feito</span>' +
        '</label>' +
      '</li>'
    );
  }

  function criarPainel() {
    painel = document.createElement('dialog');
    painel.className = 'sheet sheet--urgente';
    painel.setAttribute('data-lenis-prevent', '');
    painel.setAttribute('aria-labelledby', 'urgente-titulo');
    painel.setAttribute('aria-describedby', 'urgente-intro');

    var mensagem = 'Olá! Vim pelo site da Vestígio. É urgente: acabei de cair em um golpe e preciso de orientação.';

    painel.innerHTML =
      '<div class="sheet__panel" data-sheet-panel>' +
        '<header class="sheet__header">' +
          '<span class="sheet__icon" aria-hidden="true">' + V.icone('life-buoy') + '</span>' +
          '<div class="sheet__heading">' +
            '<p class="sheet__kicker mono">Primeiros 30 minutos</p>' +
            '<h2 id="urgente-titulo" tabindex="-1" data-painel-foco>Respire. Vamos por partes.</h2>' +
          '</div>' +
          '<button class="sheet__close" type="button" data-sheet-close aria-label="Fechar o painel Primeiros 30 minutos">' + V.icone('x') + '</button>' +
        '</header>' +
        '<div class="sheet__body">' +
          '<p class="urg__intro" id="urgente-intro">Faça estes passos na ordem e marque cada um quando terminar. O que você marcar fica guardado só neste navegador.</p>' +
          '<div class="urg__progresso">' +
            '<div class="urg__progresso-topo">' +
              '<span class="mono">Progresso</span>' +
              '<span class="mono" data-urg-contagem>0 de ' + PASSOS_URGENTES.length + '</span>' +
            '</div>' +
            '<div class="urg__barra" role="progressbar" aria-label="Passos concluídos" aria-valuemin="0" aria-valuemax="' + PASSOS_URGENTES.length + '" aria-valuenow="0" data-urg-barra>' +
              '<span></span>' +
            '</div>' +
            '<p class="urg__pronto" data-urg-pronto hidden>' + V.icone('circle-check') +
              '<span>Você fez o mais urgente. Agora, fale com a gente para os próximos passos.</span></p>' +
          '</div>' +
          '<ul role="list" class="checklist">' + PASSOS_URGENTES.map(htmlDoPasso).join('') + '</ul>' +
          '<section class="urg__naofaca" aria-labelledby="urg-naofaca-titulo">' +
            '<h3 id="urg-naofaca-titulo">' + V.icone('ban') + 'Não faça</h3>' +
            '<ul role="list">' + NAO_FACA.map(function (item) {
              return '<li><strong>' + V.escapar(item.titulo) + '</strong> ' + V.escapar(item.texto) + '</li>';
            }).join('') + '</ul>' +
          '</section>' +
          '<button class="urg__limpar" type="button" data-urg-limpar hidden>' + V.icone('rotate-ccw') + 'Desmarcar todos os passos</button>' +
        '</div>' +
        '<footer class="sheet__footer">' +
          '<a class="btn btn--primary btn--block" href="' + linkWhatsApp(mensagem) + '" target="_blank" rel="noopener" data-montador data-montador-urgente>' +
            '<span class="wa-icon">' + V.icone('whatsapp') + '</span>' +
            'Falar com a Vestígio agora' +
          '</a>' +
        '</footer>' +
      '</div>';

    document.body.appendChild(painel);
    V.ligarPainel(painel);

    // Marca o que já estava guardado
    var feitos = lerFeitos();
    V.$$('[data-passo]', painel).forEach(function (caixa) {
      caixa.checked = feitos.indexOf(caixa.getAttribute('data-passo')) > -1;
    });
    atualizar(false);

    painel.addEventListener('change', function (evento) {
      if (!evento.target.matches('[data-passo]')) return;
      var label = evento.target.closest('.check');
      // Um "pulinho" ao marcar (o traço do check se desenha pelo CSS)
      if (evento.target.checked && V.podeMover()) {
        V.animar(label, { transform: ['scale(1)', 'scale(1.015)', 'scale(1)'] }, { duration: 0.32, ease: V.EASE_OUT });
      }
      guardarFeitos(V.$$('[data-passo]', painel).filter(function (c) { return c.checked; })
        .map(function (c) { return c.getAttribute('data-passo'); }));
      atualizar(true);
    });

    V.$('[data-urg-limpar]', painel).addEventListener('click', function () {
      V.$$('[data-passo]', painel).forEach(function (c) { c.checked = false; });
      guardarFeitos([]);
      atualizar(true);
      V.$('[data-passo]', painel).focus();
    });

    // Bordas que acendem perto do mouse (o mesmo efeito dos cards)
    if (V.acenderBordas) V.acenderBordas(V.$('.checklist', painel), '.check');
  }

  // Atualiza a barra, a contagem e a mensagem final
  function atualizar(comAnimacao) {
    var caixas = V.$$('[data-passo]', painel);
    var feitos = caixas.filter(function (c) { return c.checked; }).length;
    var total = caixas.length;
    var barra = V.$('[data-urg-barra]', painel);
    barra.style.setProperty('--progresso', (feitos / total).toFixed(3));
    barra.setAttribute('aria-valuenow', String(feitos));
    barra.classList.toggle('is-completa', feitos === total);
    V.$('[data-urg-contagem]', painel).textContent = feitos + ' de ' + total;
    V.$('[data-urg-limpar]', painel).hidden = feitos === 0;

    var pronto = V.$('[data-urg-pronto]', painel);
    var mostrar = feitos === total;
    if (mostrar && pronto.hidden) {
      pronto.hidden = false;
      if (comAnimacao && V.podeMover()) {
        V.animar(pronto, { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0)'] }, { duration: 0.35, ease: V.EASE_OUT });
      }
    } else if (!mostrar) {
      pronto.hidden = true;
    }
  }

  function abrir(gatilho) {
    if (!painel) criarPainel();
    V.abrirPainel(painel, gatilho);
    // Os passos entram em sequência curta
    if (V.podeMover()) {
      V.animar(V.$$('.checklist > li, .urg__naofaca', painel), { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] },
        { duration: 0.4, ease: V.EASE_OUT, delay: Motion.stagger(0.05, { startDelay: 0.16 }) });
    }
  }

  // Qualquer botão com data-urgente abre o painel (inclusive os criados depois)
  document.addEventListener('click', function (evento) {
    var botao = evento.target.closest('[data-urgente]');
    if (!botao) return;
    evento.preventDefault();
    abrir(botao);
  });

  V.abrirPrimeiros30 = abrir;
})();

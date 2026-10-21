/* =========================================================
   INDICADOR "ATENDENDO AGORA" (biblioteca Motion)
   ---------------------------------------------------------
   Todo elemento com data-status vira um indicador pequeno:
   - Dentro do horário: ponto verde + "Atendendo agora"
   - Fora do horário: ponto âmbar + "Fora do horário" e o
     link "Urgente? Chame no WhatsApp" (CONFIG.mensagemUrgente)

   O horário é sempre o de Recife (fuso America/Recife), não o
   de quem está acessando:
   - segunda a sexta, das 8h às 23h30
   - sábado e domingo, das 8h às 18h
   Mudou o horário? Mude HORARIO abaixo e CONFIG.horario
   (js/config.js), que é o texto que aparece na tela.

   Os elementos vêm com "hidden" no HTML: sem JavaScript, o
   indicador não aparece (o horário em texto continua lá).
   O status é recalculado a cada minuto, sem recarregar.
   ========================================================= */

(function () {
  'use strict';

  // Horário de cada dia da semana, em minutos (8h = 8 * 60).
  // A posição na lista é o dia: 0 = domingo, 1 = segunda ... 6 = sábado.
  // No horário de fechar já conta como fechado (às 23h30 já está fechado).
  var HORARIO = {
    fuso: 'America/Recife',
    dias: [
      { abre: 8 * 60, fecha: 18 * 60 },        // domingo: 8h às 18h
      { abre: 8 * 60, fecha: 23 * 60 + 30 },   // segunda: 8h às 23h30
      { abre: 8 * 60, fecha: 23 * 60 + 30 },   // terça
      { abre: 8 * 60, fecha: 23 * 60 + 30 },   // quarta
      { abre: 8 * 60, fecha: 23 * 60 + 30 },   // quinta
      { abre: 8 * 60, fecha: 23 * 60 + 30 },   // sexta
      { abre: 8 * 60, fecha: 18 * 60 }         // sábado: 8h às 18h
    ]
  };

  var temMotion = typeof Motion !== 'undefined';
  var calmo = reduzirMovimento();
  var EASE_OUT = RITMO.suave;

  var indicadores = Array.prototype.slice.call(document.querySelectorAll('[data-status]'));
  if (!indicadores.length) return;

  var DIAS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  // Dia da semana e minutos do dia no horário de Recife
  function agoraEmRecife() {
    try {
      var partes = new Intl.DateTimeFormat('en-US', {
        timeZone: HORARIO.fuso, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var v = {};
      partes.forEach(function (p) { v[p.type] = p.value; });
      return { dia: DIAS[v.weekday], minutos: (parseInt(v.hour, 10) % 24) * 60 + parseInt(v.minute, 10) };
    } catch (e) {
      // Navegador sem fusos: Recife fica sempre 3h atrás do UTC (sem horário de verão)
      var d = new Date(Date.now() - 3 * 60 * 60 * 1000);
      return { dia: d.getUTCDay(), minutos: d.getUTCHours() * 60 + d.getUTCMinutes() };
    }
  }

  function estaAberto() {
    var a = agoraEmRecife();
    var hoje = HORARIO.dias[a.dia];
    return !!hoje && a.minutos >= hoje.abre && a.minutos < hoje.fecha;
  }

  function htmlDoStatus(aberto) {
    var ponto = '<span class="status__ponto" aria-hidden="true"><span class="status__anel" data-status-anel></span></span>';
    if (aberto) return ponto + '<span class="status__texto">' + T('Atendendo agora') + '</span>';
    return ponto +
      '<span class="status__texto">' + T('Fora do horário') + '<span class="status__sep" aria-hidden="true"> · </span>' +
      '<a class="status__link" href="' + linkWhatsApp(CONFIG.mensagemUrgente) + '" target="_blank" rel="noopener">' + T('Urgente? Chame no WhatsApp') + '</a>' +
      '</span>';
  }

  // O anel em volta do ponto verde cresce e some devagar
  var pulsos = [];
  function pulsar() {
    pulsos.forEach(function (p) { p.stop(); });
    pulsos = [];
    if (!temMotion || calmo) return;
    indicadores.forEach(function (el) {
      var anel = el.querySelector('[data-status-anel]');
      if (!anel || el.classList.contains('status--fora')) return;
      pulsos.push(Motion.animate(anel,
        { transform: ['scale(1)', 'scale(2.6)'], opacity: [0.55, 0] },
        { duration: 2.4, ease: EASE_OUT, repeat: Infinity, repeatDelay: 0.8 }));
    });
  }

  var ultimo = null;
  function atualizar() {
    var aberto = estaAberto();
    if (aberto === ultimo) return;
    var primeiraVez = ultimo === null;
    ultimo = aberto;

    indicadores.forEach(function (el) {
      el.classList.toggle('status--aberto', aberto);
      el.classList.toggle('status--fora', !aberto);
      el.innerHTML = htmlDoStatus(aberto);
      el.hidden = false;
      // Quando o status muda com a página aberta, o texto troca com um esmaecer curto
      if (!primeiraVez && temMotion && !calmo) {
        Motion.animate(el, { opacity: [0, 1], transform: ['translateY(3px)', 'translateY(0px)'] },
          { duration: 0.38, ease: EASE_OUT });
      }
    });
    pulsar();
  }

  atualizar();

  // Recalcula na virada de cada minuto
  setTimeout(function () {
    atualizar();
    setInterval(atualizar, 60 * 1000);
  }, 60000 - (Date.now() % 60000) + 50);

  // Ao voltar para a aba (o celular pode ter pausado os relógios)
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) atualizar();
  });
})();

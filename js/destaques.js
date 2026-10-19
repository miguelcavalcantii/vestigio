/* =========================================================
   DESTAQUES ANIMADOS (biblioteca Motion)
   ---------------------------------------------------------
   1. Lupa da pílula do topo ("Investigação digital")
   2. Aviso de urgência: anéis que pulsam devagar
   3. "Atuamos em": um serviço por vez, com ícone que se
      desenha, linha de progresso e contador (01 / 19)
   4. Entrada do rodapé
   5. Ícone de aviso do "Caí em um golpe agora"
   6. Selos de sigilo e segurança

   Regras:
   - Seguem o interruptor CONFIG.animacoesSempre (função
     reduzirMovimento, em js/config.js), como o resto do site.
     Só com animacoesSempre = false E o sistema pedindo "reduzir
     movimento", tudo fica parado (ou só uma troca esmaecida).
   - Só animamos transform, opacity e filter (leves no celular).
   - Nada fica escondido se o JavaScript ou a Motion falharem.
   ========================================================= */

(function () {
  'use strict';

  var temMotion = typeof Motion !== 'undefined';
  var calmo = reduzirMovimento();
  var animate = temMotion ? Motion.animate : null;
  var inView = temMotion ? Motion.inView : null;
  var stagger = temMotion ? Motion.stagger : null;

  var EASE_OUT = RITMO.suave;
  var EASE_IN = RITMO.acelera;
  var EASE_MOLA = RITMO.mola;   // passa um pouco do ponto e volta
  var DESFOCAR = podeDesfocar();   // no celular, sem blur (pesa demais)

  function $(seletor, raiz) { return (raiz || document).querySelector(seletor); }
  function $$(seletor, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor)); }
  function doisDigitos(n) { return n < 10 ? '0' + n : String(n); }

  /* =========================================================
     1. LUPA DO TOPO
     A lupa faz um círculo bem pequeno com uma leve inclinação,
     como quem procura algo, e o reflexo da lente brilha de leve.
     ========================================================= */
  function animarLupa() {
    var lupa = $('[data-lupa]');
    if (!lupa || !temMotion || calmo) return;

    // Começa depois da entrada do topo (o rótulo aparece em ~0,5s)
    setTimeout(function () {
      animate(lupa, {
        transform: [
          'translate(0px, -1.6px) rotate(-10deg)',
          'translate(1.8px, 0px) rotate(0deg)',
          'translate(0px, 1.6px) rotate(10deg)',
          'translate(-1.8px, 0px) rotate(0deg)',
          'translate(0px, -1.6px) rotate(-10deg)'
        ]
      }, { duration: 6, ease: 'easeInOut', repeat: Infinity });

      animate($('[data-lupa-brilho]', lupa), { opacity: [0.2, 0.95, 0.2] },
        { duration: 3, ease: 'easeInOut', repeat: Infinity });
    }, 1200);
  }

  /* =========================================================
     2. AVISO DE URGÊNCIA
     Dois anéis crescem e somem, um depois do outro, em volta do
     ponto verde-água. Só anima com o aviso na tela.
     ========================================================= */
  function animarUrgencia() {
    $$('[data-urgencia]').forEach(function (bloco) {
      var aneis = $$('[data-urgencia-anel]', bloco);
      if (!aneis.length) return;

      // Parado: um anel fixo, bem leve
      if (!temMotion || calmo) {
        aneis[0].style.opacity = '0.35';
        aneis[0].style.transform = 'scale(1.35)';
        return;
      }

      var pulsos = aneis.map(function (anel, i) {
        var pulso = animate(anel,
          { transform: ['scale(0.6)', 'scale(1.9)'], opacity: [0.75, 0] },
          { duration: 2.8, ease: EASE_OUT, repeat: Infinity, delay: i * 1.4 });
        pulso.pause();
        return pulso;
      });

      inView(bloco, function () {
        pulsos.forEach(function (p) { p.play(); });
        return function () { pulsos.forEach(function (p) { p.pause(); }); };
      });
    });
  }

  /* =========================================================
     3. "ATUAMOS EM"
     Um serviço por vez (os mesmos de js/services.js, com os
     mesmos ícones). Na troca: o nome sai com desfoque e sobe um
     pouco, o próximo entra de baixo e o ícone se desenha.
     A linha fina mostra o tempo até o próximo.
     Pausa: mouse em cima, foco do teclado, botão de pausa, aba
     escondida ou bloco fora da tela.
     ========================================================= */
  var INTERVALO = 4.2;          // segundos em cada serviço
  var INTERVALO_CALMO = 6;      // com "reduzir movimento" (troca só esmaecida)

  function prepararAtuamos() {
    var bloco = $('[data-atuamos]');
    if (!bloco || typeof SERVICOS === 'undefined' || !SERVICOS.length) return;

    var elIcone = $('[data-atuamos-icone]', bloco);
    var elNome = $('[data-atuamos-nome]', bloco);
    var elCategoria = $('[data-atuamos-categoria]', bloco);
    var elContador = $('[data-atuamos-contador]', bloco);
    var elBarra = $('[data-atuamos-barra]', bloco);
    var botaoPausa = $('[data-atuamos-pausa]', bloco);
    var elTextos = elNome.parentElement;

    var nomesCategorias = {};
    if (typeof CATEGORIAS !== 'undefined') {
      CATEGORIAS.forEach(function (c) { nomesCategorias[c.id] = c.nome; });
    }

    var total = SERVICOS.length;
    var atual = 0;

    function desenharIcone(nome) {
      var miolo = ICONS[nome] || '';
      elIcone.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + miolo + '</svg>';
    }

    function preencher(i) {
      var s = SERVICOS[i];
      desenharIcone(s.icone);
      elNome.textContent = s.nome;
      elCategoria.textContent = nomesCategorias[s.categoria] || '';
      elContador.textContent = doisDigitos(i + 1) + ' / ' + doisDigitos(total);
    }

    preencher(0);

    // Sem a Motion: fica parado no primeiro serviço
    if (!temMotion) return;

    // O traço de cada parte do ícone vai de 0 a 100% (pathLength = 1)
    function tracarIcone() {
      var partes = $$('path, circle, rect, line, polyline, polygon, ellipse', elIcone);
      partes.forEach(function (p) {
        p.setAttribute('pathLength', '1');
        p.style.strokeDasharray = '1';
        p.style.strokeDashoffset = '1';
      });
      animate(partes, { strokeDashoffset: [1, 0] },
        { duration: 0.9, ease: EASE_OUT, delay: stagger(0.08, { startDelay: 0.05 }) });
    }

    function trocarPara(i) {
      if (calmo) {
        // Versão simples: só esmaece
        return animate([elTextos, elIcone], { opacity: [1, 0] }, { duration: 0.3 }).finished.then(function () {
          preencher(i);
          return animate([elTextos, elIcone], { opacity: [0, 1] }, { duration: 0.4 }).finished;
        });
      }

      // Ritmo: sai rápido (acelerando) e entra em 0,6s com a curva principal.
      // O desfoque só existe no computador (no celular pesa demais).
      var sair = { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-10px)'] };
      if (DESFOCAR) sair.filter = ['blur(0px)', 'blur(8px)'];
      return animate([elTextos, elIcone], sair, { duration: 0.35, ease: EASE_IN }).finished.then(function () {
        preencher(i);
        tracarIcone();
        animate(elIcone,
          { opacity: [0, 1], transform: ['scale(0.86)', 'scale(1)'] },
          { duration: 0.6, ease: EASE_MOLA });
        // O desfoque da saída também precisa voltar a 0 no ícone
        // (antes ele ficava em blur(8px) e o ícone virava uma mancha)
        if (DESFOCAR) animate(elIcone, { filter: ['blur(8px)', 'blur(0px)'] }, { duration: 0.6, ease: EASE_OUT });
        var entrar = { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] };
        if (DESFOCAR) entrar.filter = ['blur(8px)', 'blur(0px)'];
        return animate(elTextos, entrar, { duration: 0.6, ease: EASE_OUT }).finished;
      });
    }

    /* ---------- Relógio: a própria linha de progresso ---------- */
    var visivel = false;
    var abaVisivel = !document.hidden;
    var pausaMouse = false;
    var pausaFoco = false;
    var pausaBotao = false;
    var trocando = false;
    var relogio = null;
    var rodada = 0;
    var comecou = false;

    if (calmo) bloco.classList.add('is-calmo');

    function podeAndar() {
      return visivel && abaVisivel && !pausaMouse && !pausaFoco && !pausaBotao;
    }

    function iniciarRelogio() {
      var esta = ++rodada;
      relogio = animate(elBarra, { transform: ['scaleX(0)', 'scaleX(1)'] },
        { duration: calmo ? INTERVALO_CALMO : INTERVALO, ease: 'linear' });
      if (!podeAndar()) relogio.pause();
      relogio.finished.then(function () {
        if (esta !== rodada) return;   // relógio antigo: ignora
        proximo();
      });
    }

    function proximo() {
      trocando = true;
      atual = (atual + 1) % total;
      animate(elBarra, { opacity: [1, 0] }, { duration: 0.25 });
      trocarPara(atual).then(function () {
        trocando = false;
        elBarra.style.opacity = '1';
        iniciarRelogio();
      });
    }

    function atualizar() {
      if (!relogio || trocando) return;
      if (podeAndar()) relogio.play(); else relogio.pause();
    }

    // Botão de pausa
    botaoPausa.hidden = false;
    botaoPausa.addEventListener('click', function () {
      pausaBotao = !pausaBotao;
      botaoPausa.setAttribute('aria-pressed', String(pausaBotao));
      botaoPausa.setAttribute('aria-label', T(pausaBotao ? 'Retomar a troca de serviços' : 'Pausar a troca de serviços'));
      atualizar();
    });

    // Mouse em cima (só mouse: no celular, um toque não deve "travar" a troca)
    bloco.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      pausaMouse = true; atualizar();
    });
    bloco.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      pausaMouse = false; atualizar();
    });

    // Foco do teclado dentro do bloco
    bloco.addEventListener('focusin', function () { pausaFoco = true; atualizar(); });
    bloco.addEventListener('focusout', function (e) {
      if (bloco.contains(e.relatedTarget)) return;
      pausaFoco = false; atualizar();
    });

    // Aba escondida
    document.addEventListener('visibilitychange', function () {
      abaVisivel = !document.hidden; atualizar();
    });

    // Só anda com o bloco na tela. Na primeira vez, o ícone se desenha.
    inView(bloco, function () {
      visivel = true;
      if (!comecou) {
        comecou = true;
        if (!calmo) tracarIcone();
        iniciarRelogio();
      }
      atualizar();
      return function () { visivel = false; atualizar(); };
    }, { amount: 0.4 });
  }

  /* =========================================================
     4. ENTRADA DO RODAPÉ
     Quando o rodapé aparece: a linha do topo se desenha, os três
     pontos do símbolo surgem em sequência (o "rastro") e as
     colunas sobem, uma depois da outra. Acontece uma vez só.
     ========================================================= */
  function animarRodape() {
    var rodape = $('[data-rodape]');
    if (!rodape || !temMotion || calmo) return;

    var itens = $$('[data-rodape-item]', rodape);
    var linha = $('[data-rodape-linha]', rodape);
    var pontos = $$('.site-footer__logo circle', rodape);

    // Estado inicial (só aqui, com o JavaScript rodando)
    itens.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      if (DESFOCAR) el.style.filter = 'blur(6px)';
    });
    if (linha) linha.style.transform = 'scaleX(0)';
    pontos.forEach(function (p) { p.style.transform = 'scale(0)'; });

    inView(rodape, function () {
      if (linha) animate(linha, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 1.4, ease: EASE_OUT });

      var subir = { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] };
      if (DESFOCAR) subir.filter = ['blur(6px)', 'blur(0px)'];
      animate(itens, subir,
        { duration: RITMO.entrada, ease: EASE_OUT, delay: stagger(0.08, { startDelay: 0.1 }) }
      ).finished.then(function () {
        // Limpa os estilos: o hover e o resto do CSS voltam a valer
        itens.forEach(function (el) { el.style.transform = ''; el.style.filter = ''; });
      });

      animate(pontos, { transform: ['scale(0)', 'scale(1)'] },
        { duration: 0.6, ease: EASE_MOLA, delay: stagger(0.14, { startDelay: 0.35 }) });
    }, { amount: 0.12 });
  }

  /* =========================================================
     5. ÍCONE DE AVISO DO "CAÍ EM UM GOLPE AGORA"
     A cada poucos segundos o triângulo dá um balanço curto,
     apoiado na base (chama atenção sem assustar). Com o mouse
     em cima, ele cresce um pouco e se endireita, com mola.
     O balanço anima o <span>; o mouse anima o <svg> de dentro,
     assim um não interrompe o outro.
     ========================================================= */
  function animarAvisoUrgente() {
    if (!temMotion || calmo) return;

    $$('.urgente__icone').forEach(function (el, i) {
      animate(el, {
        transform: ['rotate(0deg) scale(1)', 'rotate(-9deg) scale(1.08)', 'rotate(7deg) scale(1.08)',
                    'rotate(-3deg) scale(1.03)', 'rotate(0deg) scale(1)']
      }, { duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5, delay: 2 + i * 0.12 });
    });

    // Reação ao mouse (o botão do celular, sem mouse, só tem o balanço)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.addEventListener('pointerover', function (evento) {
      var botao = evento.target.closest('[data-urgente]');
      if (!botao || botao.contains(evento.relatedTarget)) return;
      var svg = $('.urgente__icone .icon', botao);
      if (!svg) return;
      animate(svg, { transform: ['scale(1) rotate(0deg)', 'scale(1.2) rotate(-6deg)', 'scale(1.14) rotate(0deg)'] },
        { duration: 0.45, ease: EASE_MOLA });
      botao.addEventListener('pointerleave', function sair() {
        botao.removeEventListener('pointerleave', sair);
        animate(svg, { transform: 'scale(1) rotate(0deg)' }, { duration: 0.3, ease: EASE_OUT });
      });
    });
  }

  /* =========================================================
     6. SELOS DE SIGILO E SEGURANÇA
     Quando aparecem na tela, os selos sobem um depois do outro
     e o círculo do ícone cresce de leve. Acontece uma vez só.
     ========================================================= */
  function animarSelos() {
    if (!temMotion || calmo) return;

    $$('[data-selos]').forEach(function (lista) {
      var selos = $$('.selo', lista);
      var icones = $$('.selo__icone', lista);
      // No topo da página inicial, espera a entrada do hero terminar
      var espera = lista.closest('.hero') ? 0.55 : 0.05;

      selos.forEach(function (el) { el.style.opacity = '0'; el.style.transform = 'translateY(12px)'; });
      icones.forEach(function (el) { el.style.transform = 'scale(0.7)'; });

      inView(lista, function () {
        animate(selos, { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
          { duration: 0.6, ease: EASE_OUT, delay: stagger(0.08, { startDelay: espera }) });
        animate(icones, { transform: ['scale(0.7)', 'scale(1)'] },
          { duration: 0.55, ease: EASE_MOLA, delay: stagger(0.08, { startDelay: espera + 0.05 }) });
      }, { amount: 0.3 });
    });
  }

  animarLupa();
  animarUrgencia();
  prepararAtuamos();
  animarRodape();
  animarAvisoUrgente();
  animarSelos();
})();

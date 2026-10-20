/* =========================================================
   FORMULÁRIO DE CONTATO POR E-MAIL + BOTÃO "COPIAR"
   ---------------------------------------------------------
   1. Botão "Copiar" ao lado do e-mail (todas as páginas)
   2. Validação dos campos (mensagem embaixo de cada um)
   3. Envio pelo Web3Forms sem sair da página:
        Enviando → card "Mensagem enviada"  (ou aviso de erro)
   4. "Enviar outra mensagem": o formulário volta, limpo

   Sem JavaScript, o formulário funciona sozinho: o navegador
   envia e o Web3Forms leva a pessoa para obrigado.html.
   Quem pediu "reduzir movimento" vê só fades simples.
   Estilo: css/contato.css.
   ========================================================= */

(function () {
  'use strict';

  var V = window.Vestigio;
  if (!V) return;
  var $ = V.$;
  var $$ = V.$$;

  var ENDERECO_ENVIO = 'https://api.web3forms.com/submit';
  var LIMITE_ESPERA = 15000;   // 15 s sem resposta = erro

  // Molas curtas e macias: a marca é sóbria, nada "brincalhão"
  function mola(duracao) {
    return { type: Motion.spring, visualDuration: duracao || 0.4, bounce: 0.08 };
  }

  function movimentoCompleto() {
    return V.podeMover();
  }

  // Animação segura (sem a Motion, só aplica o fim)
  function animar(el, valores, opcoes) {
    if (typeof Motion === 'undefined') return Promise.resolve();
    return Motion.animate(el, valores, opcoes).finished;
  }

  /* =========================================================
     1. BOTÃO "COPIAR"
     ========================================================= */
  $$('[data-copiar-email]').forEach(function (botao) {
    var texto = $('[data-copiar-texto]', botao);
    var relogio = null;

    botao.addEventListener('click', function () {
      V.copiarTexto(CONFIG.email).then(function () {
        botao.classList.add('is-copiado');
        texto.textContent = T('Copiado!');
        botao.setAttribute('aria-label', T('E-mail copiado'));
        clearTimeout(relogio);
        relogio = setTimeout(function () {
          botao.classList.remove('is-copiado');
          texto.textContent = T('Copiar');
          botao.setAttribute('aria-label', T('Copiar e-mail'));
        }, 2000);
      });
    });
  });

  /* =========================================================
     2. FORMULÁRIO (só existe na página inicial)
     ========================================================= */
  var form = $('[data-contato-form]');
  if (!form) return;

  var palco = $('[data-contato-palco]');
  var sucesso = $('[data-contato-sucesso]');
  var tituloSucesso = $('[data-contato-sucesso-titulo]');
  var botaoOutra = $('[data-contato-outra]');
  var enviar = $('[data-contato-enviar]');
  var rotulo = $('[data-contato-rotulo]');
  var falha = $('[data-contato-falha]');
  var status = $('[data-contato-status]');
  var check = $('[data-check-desenho]');
  var campos = $$('.campo__entrada', form);
  var tocados = {};    // campos que a pessoa já visitou
  var enviando = false;

  // Com JavaScript, a validação é nossa (em português, embaixo do campo)
  form.noValidate = true;

  /* ---------- Validação ---------- */
  var MENSAGENS = {
    nome: 'Informe o seu nome.',
    email: 'Informe o seu e-mail.',
    assunto: 'Escolha um assunto.',
    mensagem: 'Escreva a sua mensagem.'
  };
  var EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function problemaDo(campo) {
    var valor = campo.value.trim();
    if (!valor) return T(MENSAGENS[campo.name]);
    if (campo.type === 'email' && !EMAIL_VALIDO.test(valor)) {
      return T('Digite um e-mail válido, como nome@exemplo.com.');
    }
    return '';
  }

  function erroDo(campo) {
    return $('[data-campo-erro]', campo.closest('[data-campo]'));
  }

  function mostrarErro(campo, texto) {
    var caixa = erroDo(campo);
    var jaAparecia = !caixa.hidden && caixa.textContent === texto;
    if (texto) {
      campo.setAttribute('aria-invalid', 'true');
      caixa.textContent = texto;
      if (!jaAparecia) {
        caixa.hidden = false;
        animar(caixa, movimentoCompleto()
          ? { opacity: [0, 1], transform: ['translateY(-4px)', 'translateY(0)'] }
          : { opacity: [0, 1] }, { duration: 0.2, ease: V.EASE_OUT });
      }
    } else {
      campo.removeAttribute('aria-invalid');
      caixa.hidden = true;
      caixa.textContent = '';
    }
  }

  function validar(campo) {
    var problema = problemaDo(campo);
    mostrarErro(campo, problema);
    return !problema;
  }

  campos.forEach(function (campo) {
    // Só reclama depois que a pessoa sai do campo...
    campo.addEventListener('blur', function () {
      if (enviando) return;
      tocados[campo.name] = true;
      validar(campo);
    });
    // ...e, depois disso, o aviso some assim que o campo fica certo
    function revalidar() {
      if (tocados[campo.name]) validar(campo);
    }
    campo.addEventListener('input', revalidar);
    campo.addEventListener('change', revalidar);
  });

  /* ---------- Estados do botão ---------- */
  function estadoEnviando(ligado) {
    enviando = ligado;
    if (ligado) {
      // Trava a largura atual: o texto muda, o botão não "pula"
      enviar.style.width = enviar.offsetWidth + 'px';
      enviar.disabled = true;
      enviar.classList.add('is-enviando');
      rotulo.textContent = T('Enviando…');
      form.setAttribute('aria-busy', 'true');
    } else {
      enviar.disabled = false;
      enviar.classList.remove('is-enviando');
      rotulo.textContent = T('Enviar mensagem');
      enviar.style.width = '';
      form.removeAttribute('aria-busy');
    }
  }

  function anunciar(texto) {
    // Esvazia antes: o leitor de tela anuncia mesmo se o texto se repetir
    status.textContent = '';
    setTimeout(function () { status.textContent = texto; }, 60);
  }

  function mostrarFalha() {
    falha.hidden = false;
    animar(falha, movimentoCompleto()
      ? { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0)'] }
      : { opacity: [0, 1] }, movimentoCompleto() ? mola(0.3) : { duration: 0.2 });
    // Leve "não" com a cabeça no botão
    if (movimentoCompleto()) {
      animar(enviar, { x: [0, -6, 5, -3, 2, 0] }, { duration: 0.42, ease: 'easeInOut' });
    }
    anunciar(T('Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.'));
  }

  /* ---------- Troca animada: formulário ⇄ card ----------
     A altura do palco vai suavemente da altura antiga para a nova. */
  function trocar(sai, entra, depois) {
    var completo = movimentoCompleto();
    var alturaAntes = palco.offsetHeight;
    palco.style.height = alturaAntes + 'px';
    palco.style.overflow = 'hidden';

    var saida = animar(sai, completo
      ? { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-10px)'] }
      : { opacity: [1, 0] }, { duration: completo ? 0.22 : 0.18, ease: V.EASE_OUT });

    return saida.then(function () {
      sai.hidden = true;
      sai.style.opacity = '';
      sai.style.transform = '';
      entra.hidden = false;
      entra.style.opacity = '0';

      // Mede a altura nova sem mostrar o salto
      palco.style.height = 'auto';
      var alturaDepois = palco.offsetHeight;
      palco.style.height = alturaAntes + 'px';

      var altura = animar(palco, { height: [alturaAntes + 'px', alturaDepois + 'px'] },
        completo ? mola(0.45) : { duration: 0.2 });
      var entrada = animar(entra, completo
        ? { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] }
        : { opacity: [0, 1] }, completo ? Object.assign(mola(0.45), { delay: 0.06 }) : { duration: 0.2 });

      if (depois) depois();
      return Promise.all([altura, entrada]);
    }).then(function () {
      palco.style.height = '';
      palco.style.overflow = '';
      entra.style.opacity = '';
      entra.style.transform = '';
    });
  }

  // O traço do círculo e depois o do check se desenham
  function desenharCheck() {
    var circulo = $('.check-desenho__circulo', check);
    var traco = $('.check-desenho__traco', check);
    if (!movimentoCompleto() || typeof Motion === 'undefined') {
      circulo.style.strokeDashoffset = '0';
      traco.style.strokeDashoffset = '0';
      return;
    }
    circulo.style.strokeDashoffset = '1';
    traco.style.strokeDashoffset = '1';
    animar(circulo, { strokeDashoffset: [1, 0] }, { duration: 0.55, ease: V.EASE_OUT, delay: 0.12 })
      .then(function () {
        return animar(traco, { strokeDashoffset: [1, 0] }, { duration: 0.35, ease: V.EASE_OUT });
      });
  }

  // Se o card ficou acima da tela (formulário era mais alto), rola até ele
  function trazerParaTela() {
    var topo = palco.getBoundingClientRect().top;
    if (topo >= 80) return;
    var lenis = V.lenis;
    if (lenis) lenis.scrollTo(palco, { offset: -110, duration: 0.8 });
    else palco.scrollIntoView({ behavior: movimentoCompleto() ? 'smooth' : 'auto', block: 'start' });
  }

  function mostrarSucesso() {
    falha.hidden = true;
    trocar(form, sucesso, function () {
      desenharCheck();
      tituloSucesso.focus({ preventScroll: true });
    }).then(trazerParaTela);
    anunciar(T('Mensagem enviada. Respondemos em até 1 dia útil.'));
  }

  /* ---------- Envio ---------- */
  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    if (enviando) return;

    // Valida tudo e leva o foco ao primeiro campo com problema
    var primeiroErro = null;
    campos.forEach(function (campo) {
      tocados[campo.name] = true;
      if (!validar(campo) && !primeiroErro) primeiroErro = campo;
    });
    if (primeiroErro) {
      primeiroErro.focus();
      return;
    }

    falha.hidden = true;
    estadoEnviando(true);
    anunciar(T('Enviando a sua mensagem…'));

    var dados = new FormData(form);
    // Com JavaScript não há redirecionamento: a resposta vem em JSON
    dados.delete('redirect');

    var controle = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var relogio = controle ? setTimeout(function () { controle.abort(); }, LIMITE_ESPERA) : null;

    fetch(ENDERECO_ENVIO, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: dados,
      signal: controle ? controle.signal : undefined
    })
      .then(function (resposta) {
        return resposta.json().catch(function () { return { success: false }; });
      })
      .then(function (json) {
        if (!json || json.success !== true) throw new Error((json && json.message) || 'Falha no envio');
        estadoEnviando(false);
        mostrarSucesso();
      })
      .catch(function () {
        estadoEnviando(false);
        mostrarFalha();   // os dados digitados continuam nos campos
      })
      .then(function () { clearTimeout(relogio); });
  });

  /* ---------- "Enviar outra mensagem" ---------- */
  botaoOutra.addEventListener('click', function () {
    form.reset();
    tocados = {};
    campos.forEach(function (campo) { mostrarErro(campo, ''); });
    falha.hidden = true;
    // O foco vai para o título (no campo Nome, sair dele já acusaria "vazio")
    trocar(sucesso, form).then(function () {
      $('#contato-form-titulo').focus({ preventScroll: true });
    });
  });
})();

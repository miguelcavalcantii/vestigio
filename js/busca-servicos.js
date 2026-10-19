/* =========================================================
   BUSCA DE SERVIÇOS ("Digite o que aconteceu")
   ---------------------------------------------------------
   Fica na seção "Encontre o seu caso". Enquanto a pessoa
   digita, os cards são filtrados (sem acento e sem diferença
   entre maiúsculas e minúsculas). A busca olha:
     - o nome e o resumo do serviço
     - a lista "palavrasChave" de cada serviço (js/services.js)
   Para a busca achar mais coisas, aumente as palavrasChave.

   Atalho: a tecla "/" leva direto para o campo.
   A troca dos cards usa a mesma animação das abas
   (função trocarCards em js/components.js).
   ========================================================= */

(function () {
  'use strict';

  // Exemplos que aparecem dentro do campo vazio, trocando sozinhos
  var EXEMPLOS = IDIOMA === 'en'
    ? ['pix', 'fake profile', 'new number', 'boleto', 'find a person']
    : ['pix', 'perfil falso', 'número novo', 'boleto', 'localizar pessoa'];
  var TROCA_DO_EXEMPLO = 3000;   // a cada 3 segundos

  var V = window.Vestigio;
  if (!V) return;
  var campo = V.$('[data-busca]');
  var controle = V.servicos();
  if (!campo || !controle) return;

  var caixa = campo.closest('.busca');
  var botaoLimpar = V.$('[data-busca-limpar]');
  var status = V.$('[data-busca-status]');
  var vazia = V.$('[data-busca-vazia]');
  var botaoVazia = V.$('[data-busca-whatsapp]');
  var exemplo = V.$('[data-busca-exemplo]');

  var timerBusca = null;
  var timerStatus = null;
  var ultimoTermo = '';

  /* ---------- Filtrar ---------- */
  function buscar() {
    var termo = campo.value.trim();
    if (termo === ultimoTermo) return;
    ultimoTermo = termo;

    var quantos = controle.mostrarBusca(termo);
    caixa.classList.toggle('tem-texto', campo.value.length > 0);
    botaoLimpar.hidden = campo.value.length === 0;
    mostrarVazia(termo && quantos === 0 ? termo : '');
    anunciar(termo, quantos);
  }

  // Avisa o leitor de tela quantos serviços apareceram (com uma pequena
  // espera, para não falar a cada letra digitada)
  function anunciar(termo, quantos) {
    clearTimeout(timerStatus);
    timerStatus = setTimeout(function () {
      if (!termo) status.textContent = T('Mostrando todos os serviços.');
      else if (quantos === 0) status.textContent = T('Nenhum serviço encontrado.');
      else if (quantos === 1) status.textContent = T('1 serviço encontrado.');
      else status.textContent = quantos + ' ' + T('serviços encontrados.');
    }, 450);
  }

  // Sem resultado: mensagem com botão para contar o caso pelo WhatsApp.
  // A mensagem já vai com o texto que a pessoa digitou.
  function mostrarVazia(termo) {
    if (!termo) {
      vazia.hidden = true;
      return;
    }
    var texto = T('Olá! Vim pelo site da Vestígio. Não achei o meu caso na lista de serviços:') + ' "' + termo + '".';
    botaoVazia.href = linkWhatsApp(texto);
    // O montador de mensagem (js/montador-whatsapp.js) abre com essa frase
    botaoVazia.setAttribute('data-montador', '');
    botaoVazia.setAttribute('data-montador-frase', termo);
    if (vazia.hidden) {
      vazia.hidden = false;
      if (V.podeMover()) {
        V.animar(vazia, { opacity: [0, 1], transform: ['translateY(10px) scale(0.98)', 'translateY(0) scale(1)'] },
          { duration: 0.4, ease: V.EASE_OUT, delay: 0.12 });
      }
    }
  }

  function limpar(focar) {
    campo.value = '';
    buscar();
    if (focar) campo.focus();
  }

  campo.addEventListener('input', function () {
    caixa.classList.toggle('tem-texto', campo.value.length > 0);
    botaoLimpar.hidden = campo.value.length === 0;
    // Espera a pessoa parar de digitar por um instante
    clearTimeout(timerBusca);
    timerBusca = setTimeout(buscar, 140);
  });

  campo.addEventListener('keydown', function (evento) {
    // Esc com texto: limpa (sem texto, o Esc segue normal)
    if (evento.key === 'Escape' && campo.value) {
      evento.preventDefault();
      limpar(true);
    }
    // Enter: vai para o primeiro resultado
    if (evento.key === 'Enter') {
      evento.preventDefault();
      clearTimeout(timerBusca);
      buscar();
      setTimeout(function () {
        var primeiro = V.$('[data-services-grid] [data-service]');
        if (primeiro) primeiro.focus();
      }, 200);
    }
  });

  botaoLimpar.addEventListener('click', function () { limpar(true); });

  // Escolher uma aba limpa a busca (a aba já cuida dos cards)
  document.addEventListener('vestigio:aba', function () {
    if (!campo.value) return;
    campo.value = '';
    ultimoTermo = '';
    caixa.classList.remove('tem-texto');
    botaoLimpar.hidden = true;
    mostrarVazia('');
  });

  /* ---------- Atalho "/" ---------- */
  function estaDigitando(el) {
    return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  }

  document.addEventListener('keydown', function (evento) {
    if (evento.key !== '/' || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    if (estaDigitando(document.activeElement) || document.querySelector('dialog[open]')) return;
    evento.preventDefault();
    if (V.lenis) V.lenis.scrollTo(caixa, { offset: -140, duration: 0.9 });
    else caixa.scrollIntoView({ block: 'center', behavior: V.podeMover() ? 'smooth' : 'auto' });
    campo.focus({ preventScroll: true });
  });

  /* ---------- Exemplo que troca sozinho ---------- */
  var indice = 0;
  var timerExemplo = null;
  var naTela = false;

  function trocarExemplo() {
    indice = (indice + 1) % EXEMPLOS.length;
    var novo = EXEMPLOS[indice];
    if (!V.podeMover()) {
      exemplo.textContent = novo;
      return;
    }
    // O exemplo antigo sobe e some; o novo vem de baixo (com um leve
    // desfoque só no computador: no celular o blur pesa)
    var sai = { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-6px)'] };
    var entra = { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0)'] };
    if (podeDesfocar()) { sai.filter = ['blur(0px)', 'blur(3px)']; entra.filter = ['blur(3px)', 'blur(0px)']; }
    V.animar(exemplo, sai, { duration: RITMO.rapido, ease: V.EASE_OUT })
      .then(function () {
        exemplo.textContent = novo;
        return V.animar(exemplo, entra, { duration: RITMO.medio, ease: V.EASE_OUT });
      });
  }

  // Só troca com a busca na tela e a aba do navegador aberta
  function ligarTroca() {
    clearInterval(timerExemplo);
    if (naTela && !document.hidden) timerExemplo = setInterval(trocarExemplo, TROCA_DO_EXEMPLO);
  }

  new IntersectionObserver(function (entradas) {
    naTela = entradas[0].isIntersecting;
    ligarTroca();
  }).observe(caixa);
  document.addEventListener('visibilitychange', ligarTroca);
})();

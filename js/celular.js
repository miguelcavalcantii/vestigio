/* =========================================================
   VERSÃO CELULAR DA PÁGINA INICIAL (complemento do css/celular.css)
   ---------------------------------------------------------
   Só age em telas até 767px. No computador não faz nada.
   1. Serviços: mostra 8 e um botão "Ver todos os serviços"
   2. "Caí em um golpe": cada item abre e fecha ao tocar
   3. Rodapé: as listas de links abrem e fecham ao tocar
   4. Animações extras (só no celular): o que ainda aparecia parado
      passa a entrar com a rolagem, no mesmo estilo do resto do site
   ========================================================= */
(function () {
  var celular = window.matchMedia('(max-width: 767px)');
  var ingles = (document.documentElement.lang || '').indexOf('en') === 0;
  var LIMITE = 8;

  /* ---------- 1. Serviços ---------- */
  var grade = document.querySelector('[data-services-grid]');
  var busca = document.querySelector('[data-busca]');
  var expandido = false;
  var caixaBotao = null, botao = null;

  function contarCards() { return grade ? grade.querySelectorAll('.service-card').length : 0; }

  function atualizarServicos() {
    if (!grade) return;
    var total = contarCards();
    var buscando = busca && busca.value.trim() !== '';
    var recolher = celular.matches && !expandido && !buscando && total > LIMITE;
    grade.classList.toggle('is-recolhido', recolher);
    if (caixaBotao) {
      caixaBotao.hidden = !recolher;
      botao.firstChild.nodeValue = ingles ? 'See all ' + total + ' services ' : 'Ver todos os ' + total + ' serviços ';
    }
  }

  if (grade) {
    caixaBotao = document.createElement('div');
    caixaBotao.className = 'servicos-mais';
    caixaBotao.hidden = true;
    botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn btn--ghost';
    botao.appendChild(document.createTextNode(''));
    var seta = document.createElement('span');
    seta.className = 'btn__orb';
    seta.setAttribute('aria-hidden', 'true');
    seta.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    botao.appendChild(seta);
    botao.addEventListener('click', function () { expandido = true; atualizarServicos(); });
    caixaBotao.appendChild(botao);
    grade.parentNode.insertBefore(caixaBotao, grade.nextSibling);
    // Os cards são recriados quando a pessoa troca de aba ou busca
    new MutationObserver(atualizarServicos).observe(grade, { childList: true });
    if (busca) busca.addEventListener('input', atualizarServicos);
    atualizarServicos();
  }

  /* ---------- 2. "Caí em um golpe": abre e fecha ---------- */
  var guia = document.querySelector('.guide');
  if (guia) {
    // Separa o texto explicativo do título em negrito, para poder esconder
    guia.querySelectorAll('.guide__list > li').forEach(function (li) {
      var titulo = li.querySelector('strong');
      if (!titulo || li.querySelector('.guide__desc')) return;
      var desc = document.createElement('span');
      desc.className = 'guide__desc';
      while (titulo.nextSibling) desc.appendChild(titulo.nextSibling);
      li.appendChild(desc);
      li.addEventListener('click', function () {
        if (!guia.classList.contains('is-compacto')) return;
        var aberto = li.classList.toggle('is-aberto');
        li.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      });
      li.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && guia.classList.contains('is-compacto')) { e.preventDefault(); li.click(); }
      });
    });
  }

  /* ---------- 3. Rodapé: listas abrem e fecham ---------- */
  var rodape = document.querySelector('.site-footer');
  var colunas = rodape ? rodape.querySelectorAll('nav.site-footer__col') : [];
  colunas.forEach(function (col) {
    var titulo = col.querySelector('.site-footer__titulo');
    if (!titulo) return;
    titulo.addEventListener('click', function () {
      if (!rodape.classList.contains('is-compacto')) return;
      var aberto = col.classList.toggle('is-aberto');
      titulo.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    titulo.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && rodape.classList.contains('is-compacto')) { e.preventDefault(); titulo.click(); }
    });
  });

  /* ---------- Liga e desliga conforme o tamanho da tela ---------- */
  function aplicar() {
    var c = celular.matches;
    if (guia) {
      guia.classList.toggle('is-compacto', c);
      guia.querySelectorAll('.guide__list > li').forEach(function (li) {
        if (c) { li.setAttribute('tabindex', '0'); li.setAttribute('aria-expanded', li.classList.contains('is-aberto') ? 'true' : 'false'); }
        else { li.removeAttribute('tabindex'); li.removeAttribute('aria-expanded'); }
      });
    }
    if (rodape) {
      rodape.classList.toggle('is-compacto', c);
      colunas.forEach(function (col) {
        var t = col.querySelector('.site-footer__titulo');
        if (!t) return;
        if (c) { t.setAttribute('role', 'button'); t.setAttribute('tabindex', '0'); t.setAttribute('aria-expanded', col.classList.contains('is-aberto') ? 'true' : 'false'); }
        else { t.removeAttribute('role'); t.removeAttribute('tabindex'); t.removeAttribute('aria-expanded'); }
      });
    }
    atualizarServicos();
  }
  if (celular.addEventListener) celular.addEventListener('change', aplicar); else celular.addListener(aplicar);
  aplicar();

  /* ---------- 4. Animações extras (só no celular) ----------
     Mesmo jeito do resto do site: presas à rolagem (descendo, entram;
     subindo, voltam). Só com as animações ligadas (classe motion-ok). */
  var html = document.documentElement;
  if (!celular.matches || typeof Motion === 'undefined' || !html.classList.contains('motion-ok')) return;
  var EASE = (window.RITMO && RITMO.suave) || [0.23, 1, 0.32, 1];
  var ELASTICO = [0.34, 1.56, 0.64, 1];   // passa um pouco do ponto e volta

  // Entra subindo e aparecendo enquanto a pessoa rola
  function entrar(el, de, inicio, fim) {
    if (!el) return;
    de = de || {};
    var x = de.x || 0, y = de.y === undefined ? 24 : de.y, esc = de.escala || 1;
    Motion.scroll(Motion.animate(el, {
      opacity: [de.opacidade || 0, 1],
      transform: ['translate3d(' + x + 'px,' + y + 'px,0) scale(' + esc + ')', 'translate3d(0,0,0) scale(1)']
    }, { ease: EASE }), {
      target: el,
      offset: ['start ' + (inicio || 'end'), 'start ' + (fim || '80%')]
    });
  }
  function todos(seletor) { return Array.prototype.slice.call(document.querySelectorAll(seletor)); }

  // Atalhos "O que aconteceu com você?": estouram em sequência logo depois do título
  var atalhos = todos('.quick__list > li');
  if (atalhos.length) {
    atalhos.forEach(function (li) { li.style.opacity = '0'; });
    Motion.animate(atalhos, { opacity: [0, 1], transform: ['translateY(10px) scale(0.92)', 'translateY(0) scale(1)'] },
      { duration: 0.5, ease: ELASTICO, delay: Motion.stagger(0.05, { startDelay: 0.9 }) });
  }

  // Botão "Ver todos os serviços" e legenda da simulação
  entrar(document.querySelector('.servicos-mais'), { y: 16, escala: 0.96 }, 'end', '88%');
  entrar(document.querySelector('.demo__note'), { y: 12 }, 'end', '90%');

  // "Caí em um golpe": os itens chegam um depois do outro
  todos('.guide__list').forEach(function (lista) {
    Array.prototype.forEach.call(lista.children, function (li, i) {
      entrar(li, { x: -16, y: 8 }, 'end', (88 - i * 3) + '%');
    });
  });

  // Sobre: o ícone de cada princípio "estoura" quando ele aparece
  todos('.principle__icon').forEach(function (icone) {
    icone.style.opacity = '0';
    Motion.inView(icone, function () {
      Motion.animate(icone, { opacity: [0, 1], transform: ['scale(0.5) rotate(-12deg)', 'scale(1) rotate(0deg)'] },
        { duration: 0.6, ease: ELASTICO, delay: 0.15 });
    }, { amount: 0.6 });
  });

  // Números das etapas do "Como funciona": crescem ao chegar
  todos('.step__num').forEach(function (num) {
    entrar(num, { y: 0, escala: 0.6, opacidade: 0.2 }, 'end', '78%');
  });

  // Rodapé: logo, frase, texto, botão e cada bloco entram em sequência
  var marca = document.querySelector('.site-footer__marca');
  if (marca) Array.prototype.forEach.call(marca.children, function (filho, i) {
    entrar(filho, { y: 20 }, 'end', (90 - i * 4) + '%');
  });
  todos('.site-footer__col, .site-footer__base').forEach(function (bloco) {
    entrar(bloco, { y: 20 }, 'end', '86%');
  });
})();

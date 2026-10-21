/* =========================================================
   VERSÃO CELULAR DA PÁGINA INICIAL (complemento do css/celular.css)
   ---------------------------------------------------------
   Só age em telas até 767px. No computador não faz nada.
   1. Serviços: mostra 8 e um botão "Ver todos os serviços"
   2. "Caí em um golpe": cada item abre e fecha ao tocar
   3. Rodapé: as listas de links abrem e fecham ao tocar
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
})();

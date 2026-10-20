/* =========================================================
   DELEGACIAS POR ESTADO (delegacias.html)
   ---------------------------------------------------------
   1. Lê assets/data/delegacias.json (só dados de sites oficiais).
   2. Monta um card por estado: Pernambuco primeiro (sede da
      Vestígio, em destaque), os outros em ordem alfabética.
   3. Busca: filtra pelo nome do estado, pela sigla (PE, BA...)
      ou pelo nome da delegacia, sem ligar para acentos.
   Se o JSON não carregar, a lista simples de links (escrita pelo
   gerador) continua na página.
   ========================================================= */

(function () {
  'use strict';

  var V = window.Vestigio;
  if (!V) return;
  var $ = V.$;

  var grade = $('[data-deleg-grade]');
  var semJs = $('[data-deleg-semjs]');
  var busca = $('[data-deleg-busca]');
  var status = $('[data-deleg-status]');
  var vazio = $('[data-deleg-vazio]');
  if (!grade) return;

  var esc = V.escapar;

  // "(85) 3101-7586" vira "tel:+558531017586". Sem DDD no site oficial: sem link.
  function linkDoTelefone(tel) {
    var digitos = tel.replace(/\D/g, '');
    if (!/^\(\d\d\)/.test(tel) || digitos.length < 10) return null;
    return 'tel:+55' + digitos;
  }

  function linkExterno(url, texto) {
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + texto + '</a>';
  }

  function htmlDoCard(e) {
    var esp = e.especializada;
    var blocoEsp;
    if (esp) {
      var tel = esp.telefone ? linkDoTelefone(esp.telefone) : null;
      blocoEsp =
        '<div class="deleg-card__esp">' +
          '<p class="deleg-card__rotulo">Delegacia especializada em crimes cibernéticos</p>' +
          '<p class="deleg-card__esp-nome">' + esc(esp.nome) + (esp.sigla ? ' <span class="deleg-card__sigla">(' + esc(esp.sigla) + ')</span>' : '') + '</p>' +
          (esp.endereco ? '<p class="deleg-card__info">' + V.icone('map-pin') + '<span>' + esc(esp.endereco) + '</span></p>' : '') +
          (esp.telefone ? '<p class="deleg-card__info">' + V.icone('phone') + (tel ? '<a href="' + tel + '">' + esc(esp.telefone) + '</a>' : '<span>' + esc(esp.telefone) + '</span>') + '</p>' : '') +
          (esp.obs ? '<p class="deleg-card__obs">' + esc(esp.obs) + '</p>' : '') +
        '</div>';
    } else {
      blocoEsp =
        '<div class="deleg-card__esp deleg-card__esp--sem">' +
          '<p class="deleg-card__rotulo">Delegacia especializada em crimes cibernéticos</p>' +
          '<p class="deleg-card__obs">Não encontramos no site oficial. Registre o BO online ou procure a delegacia mais próxima.</p>' +
        '</div>';
    }

    var fontes = [linkExterno(e.policiaCivil, 'Polícia Civil')];
    if (e.bo.fonte && e.bo.fonte !== e.policiaCivil) fontes.push(linkExterno(e.bo.fonte, 'BO online'));
    if (esp && esp.fonte) fontes.push(linkExterno(esp.fonte, 'delegacia especializada'));

    return (
      '<li class="deleg-card bezel' + (e.destaque ? ' deleg-card--destaque' : '') + '" data-deleg-card>' +
        '<div class="bezel__core deleg-card__core">' +
          '<div class="deleg-card__topo">' +
            '<span class="deleg-card__uf" aria-hidden="true">' + esc(e.uf) + '</span>' +
            '<h3 class="deleg-card__nome">' + esc(e.nome) + ' <span class="sr-only">(' + esc(e.uf) + ')</span></h3>' +
            (e.destaque ? '<span class="status-pill deleg-card__selo">Sede da Vestígio</span>' : '') +
          '</div>' +
          '<a class="deleg-card__bo" href="' + esc(e.bo.url) + '" target="_blank" rel="noopener">' +
            '<span class="deleg-card__bo-icone" aria-hidden="true">' + V.icone('file-text') + '</span>' +
            '<span class="deleg-card__bo-texto"><strong>Registrar BO online</strong><span>' + esc(e.bo.nome) + '</span></span>' +
            '<span class="deleg-card__bo-seta" aria-hidden="true">' + V.icone('arrow-up-right') + '</span>' +
          '</a>' +
          blocoEsp +
          '<p class="deleg-card__fontes"><span>Fontes oficiais:</span> ' + fontes.join(' · ') + '</p>' +
        '</div>' +
      '</li>'
    );
  }

  // Texto em que a busca procura (sem acentos, minúsculo)
  function textoDeBusca(e) {
    var partes = [e.nome, e.uf, e.bo.nome];
    if (e.especializada) partes.push(e.especializada.nome, e.especializada.sigla || '');
    return V.semAcento(partes.join(' ')).toLowerCase();
  }

  function ordenar(estados) {
    return estados.slice().sort(function (a, b) {
      if (!a.destaque !== !b.destaque) return a.destaque ? -1 : 1;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }

  function montar(dados) {
    var estados = ordenar(dados.estados);
    grade.innerHTML = estados.map(htmlDoCard).join('');
    var cards = Array.prototype.slice.call(grade.children);
    var textos = estados.map(textoDeBusca);

    grade.hidden = false;
    if (semJs) semJs.hidden = true;

    // Entrada suave dos cards (segue a regra de movimento do site)
    if (V.podeMover()) {
      V.animar(cards.slice(0, 9), { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
        { duration: 0.45, ease: V.EASE_OUT, delay: Motion.stagger(0.04) });
    }

    function filtrar() {
      var termo = V.semAcento(busca.value.trim()).toLowerCase();
      var visiveis = 0;
      cards.forEach(function (card, i) {
        // Duas letras: só a sigla ("pe" não pode achar "especializada").
        // Mais que isso: parte do texto ("pernam", "ciber")
        var bate = !termo ||
          (termo.length <= 2 ? estados[i].uf.toLowerCase() === termo : textos[i].indexOf(termo) > -1);
        card.hidden = !bate;
        if (bate) visiveis++;
      });
      vazio.hidden = visiveis > 0;
      status.textContent = termo
        ? (visiveis === 1 ? '1 estado encontrado.' : visiveis + ' estados encontrados.')
        : '';
    }

    busca.addEventListener('input', filtrar);
  }

  var endereco = (V.raizSite || '') + 'assets/data/delegacias.json';
  fetch(endereco)
    .then(function (resposta) {
      if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
      return resposta.json();
    })
    .then(montar)
    .catch(function () {
      // Sem os dados: fica a lista simples (já está na página) e a busca some
      var caixa = busca && busca.closest('.deleg__busca');
      if (caixa) caixa.hidden = true;
    });
})();

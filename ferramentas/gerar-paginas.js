/* =========================================================
   GERADOR DE PÁGINAS (para o Google encontrar o site)
   ---------------------------------------------------------
   COMO RODAR (no terminal, dentro da pasta do site):
       node ferramentas/gerar-paginas.js

   O QUE ELE FAZ:
   1. Lê os dados: js/services.js (serviços) e js/alertas.js (alertas).
   2. Lê os modelos da pasta ferramentas/modelos/.
   3. Copia do index.html o cabeçalho (menu), o rodapé e o script
      do tema (entre os comentários INICIO:MOLDE-... e FIM:MOLDE-...).
      Assim o menu e o rodapé são os mesmos em todas as páginas.
   4. Cria (ou atualiza):
        servicos/<nome-do-servico>.html   uma página por serviço
        alertas.html                      lista de alertas
        alertas/<id-do-alerta>.html       uma página por alerta
        sitemap.xml e robots.txt          mapa do site para o Google

   Mudou um serviço, um alerta, o menu ou o rodapé? Rode de novo.
   Não precisa instalar nada: só o Node.js (https://nodejs.org).
   ========================================================= */

var fs = require('fs');
var path = require('path');
var vm = require('vm');

// Endereço definitivo do site (usado no Google, no compartilhamento e no sitemap).
// TODO: trocar pelo domínio definitivo (o mesmo do <link rel="canonical"> do index.html)
var DOMINIO = 'https://www.vestigio.com.br';

var PASTA = path.join(__dirname, '..');            // a pasta do site
var MODELOS = path.join(__dirname, 'modelos');
var HOJE = new Date().toISOString().slice(0, 10);   // data de hoje, ex.: 2026-10-12

/* =========================================================
   1. AJUDANTES
   ========================================================= */
function ler(arquivo) {
  return fs.readFileSync(path.join(PASTA, arquivo), 'utf8').replace(/\r\n/g, '\n');
}

function lerModelo(nome) {
  return fs.readFileSync(path.join(MODELOS, nome), 'utf8').replace(/\r\n/g, '\n');
}

function gravar(arquivo, conteudo) {
  var destino = path.join(PASTA, arquivo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, conteudo, 'utf8');
  console.log('  criado: ' + arquivo);
}

// Troca < > & " por códigos (o texto não quebra o HTML)
function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Preenche um modelo: cada {{CHAVE}} vira o valor de dados.CHAVE
function preencher(modelo, dados) {
  var resultado = modelo.replace(/\{\{([A-Z_]+)\}\}/g, function (inteiro, chave) {
    if (!(chave in dados)) throw new Error('O modelo pede {{' + chave + '}}, mas o script não preencheu.');
    return dados[chave];
  });
  return resultado;
}

// Corta um texto no limite, sem cortar palavra no meio (para a meta description)
function resumir(texto, limite) {
  if (texto.length <= limite) return texto;
  var corte = texto.slice(0, limite - 1);
  return corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…';
}

function doisDigitos(n) {
  return n < 10 ? '0' + n : String(n);
}

// JSON dentro de <script>: o "<" vira código, para nunca fechar o script sem querer
function jsonLd(objeto) {
  return JSON.stringify(objeto, null, 2).replace(/</g, '\\u003c').replace(/^/gm, '    ');
}

/* =========================================================
   2. DADOS (os mesmos arquivos que o site usa)
   Rodamos services.js, alertas.js e config.js "como se fosse
   o navegador", e pegamos as listas que eles criam.
   ========================================================= */
var contexto = { window: {} };
vm.createContext(contexto);
['js/config.js', 'js/services.js', 'js/alertas.js'].forEach(function (arquivo) {
  vm.runInContext(ler(arquivo), contexto, { filename: arquivo });
});
var CATEGORIAS = contexto.CATEGORIAS;
var SERVICOS = contexto.SERVICOS;
var ALERTAS = contexto.ALERTAS;
var CONFIG = contexto.CONFIG;

function servicoPorId(id) {
  return SERVICOS.filter(function (s) { return s.id === id; })[0];
}

function nomeDaCategoria(id) {
  var c = CATEGORIAS.filter(function (c) { return c.id === id; })[0];
  return c ? c.nome : '';
}

/* =========================================================
   3. PEDAÇOS COPIADOS DO index.html
   ========================================================= */
var INDEX = ler('index.html');

function extrair(nome) {
  var inicio = INDEX.indexOf('<!-- INICIO:MOLDE-' + nome);
  var fim = INDEX.indexOf('<!-- FIM:MOLDE-' + nome + ' -->');
  if (inicio < 0 || fim < 0) throw new Error('Não achei os comentários INICIO/FIM:MOLDE-' + nome + ' no index.html');
  // pula a linha do comentário de início
  var corpo = INDEX.slice(INDEX.indexOf('\n', inicio) + 1, fim);
  return corpo.replace(/\s+$/, '');
}

var MOLDE_TEMA = extrair('TEMA');
var MOLDE_CABECALHO = extrair('CABECALHO');
var MOLDE_RODAPE = extrair('RODAPE');

// Corrige os links copiados do index.html para funcionarem em outra página.
//   raiz = "" (página na pasta do site) ou "../" (página numa subpasta)
//   "#servicos"     vira  raiz + "index.html#servicos"
//   "#inicio"       vira  raiz + "index.html"
//   "alertas.html"  vira  raiz + "alertas.html"
//   "assets/..."    vira  raiz + "assets/..."
function ajustarLinks(html, raiz) {
  return html
    .replace(/href="#inicio"/g, 'href="' + raiz + 'index.html"')
    .replace(/href="#([^"]*)"/g, 'href="' + raiz + 'index.html#$1"')
    .replace(/(href|src)="(?![a-z]+:|\/|\.\.\/|index\.html)([^"#][^"]*)"/g, '$1="' + raiz + '$2"');
}

function cabecalho(raiz, paginaAtual) {
  var html = ajustarLinks(MOLDE_CABECALHO, raiz);
  // Marca no menu a página em que a pessoa está (ex.: "Alertas")
  if (paginaAtual) {
    html = html.split('href="' + raiz + paginaAtual + '"').join('href="' + raiz + paginaAtual + '" aria-current="page"');
  }
  return html;
}

function rodape(raiz) {
  // Nas outras páginas, os botões flutuantes somem ao chegar no rodapé
  // (o rodapé do index.html já vem com data-esconde-flutuante)
  return ajustarLinks(MOLDE_RODAPE, raiz);
}

/* =========================================================
   4. PARTES QUE SE REPETEM
   ========================================================= */
var MODELO_PAGINA = lerModelo('_pagina.html');
var MODELO_CABECA = lerModelo('_cabeca.html');

// Junta tudo numa página completa
function montarPagina(opcoes) {
  var cabeca = preencher(MODELO_CABECA, {
    TITULO: escapar(opcoes.titulo),
    DESCRICAO: escapar(opcoes.descricao),
    URL: opcoes.url,
    OG_TIPO: opcoes.ogTipo || 'website',
    DOMINIO: DOMINIO,
    RAIZ: opcoes.raiz,
    MOLDE_TEMA: MOLDE_TEMA,
    JSON_LD: jsonLd(opcoes.jsonLd)
  });
  return preencher(MODELO_PAGINA, {
    RAIZ: opcoes.raiz,
    CABECA: cabeca,
    CLASSE_PAGINA: opcoes.classe,
    CABECALHO: cabecalho(opcoes.raiz, opcoes.paginaAtual),
    CONTEUDO: opcoes.conteudo,
    RODAPE: rodape(opcoes.raiz)
  });
}

// Caminho no topo da página: Início / Serviços / Golpe do Pix falso
function migalhas(itens) {
  return (
    '        <nav class="migalhas" aria-label="Caminho da página">\n' +
    '          <ol role="list">\n' +
    itens.map(function (item) {
      if (!item.href) return '            <li><span aria-current="page">' + escapar(item.nome) + '</span></li>\n';
      return '            <li><a href="' + item.href + '">' + escapar(item.nome) + '</a></li>\n';
    }).join('') +
    '          </ol>\n' +
    '        </nav>'
  );
}

// O mesmo caminho, para o Google (dados estruturados)
function migalhasJson(itens) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map(function (item, i) {
      return { '@type': 'ListItem', position: i + 1, name: item.nome, item: item.url };
    })
  };
}

var ORGANIZACAO = {
  '@type': 'Organization',
  name: 'Vestígio Investigação Digital',
  url: DOMINIO + '/',
  logo: DOMINIO + '/assets/logo.svg',
  email: CONFIG.email,
  sameAs: ['https://www.instagram.com/' + CONFIG.instagram + '/']   // perfil oficial (js/config.js)
};

/* =========================================================
   5. PÁGINAS DOS SERVIÇOS
   ========================================================= */
var MODELO_SERVICO = lerModelo('servico.html');

// Título que aparece no Google, de acordo com a categoria
function tituloDoServico(servico) {
  if (servico.categoria === 'estelionato') return 'Caí no ' + servico.nome.charAt(0).toLowerCase() + servico.nome.slice(1) + '. O que fazer? | Vestígio';
  if (servico.categoria === 'redes') return 'Golpes e perfis falsos no ' + servico.nome + ': o que fazer | Vestígio';
  return servico.nome + ' | Vestígio Investigação Digital';
}

// Card de um serviço relacionado (o mesmo visual dos cards da página inicial)
function cardDoServico(servico) {
  var numero = doisDigitos(SERVICOS.indexOf(servico) + 1);
  return (
    '          <li class="service-card bezel" data-reveal-item>\n' +
    '            <div class="bezel__core">\n' +
    '              <div class="service-card__top">\n' +
    '                <span class="service-card__icon"><span data-icon="' + servico.icone + '"></span></span>\n' +
    '                <span class="mono">Caso ' + numero + '</span>\n' +
    '              </div>\n' +
    '              <h3><a class="service-card__button" href="' + contexto.paginaDoServico(servico) + '">' + escapar(servico.nome) + '</a></h3>\n' +
    '              <p>' + escapar(servico.resumo) + '</p>\n' +
    '              <span class="service-card__more" aria-hidden="true">Ver serviço<span class="btn__orb"><span data-icon="arrow-up-right"></span></span></span>\n' +
    '            </div>\n' +
    '          </li>'
  );
}

// 3 serviços da mesma categoria (se faltar, completa com os seguintes da lista)
function relacionados(servico) {
  var mesmos = SERVICOS.filter(function (s) { return s.categoria === servico.categoria && s !== servico; });
  var i = SERVICOS.indexOf(servico);
  var outros = SERVICOS.slice(i + 1).concat(SERVICOS.slice(0, i)).filter(function (s) {
    return s.categoria !== servico.categoria;
  });
  return mesmos.concat(outros).slice(0, 3);
}

function paginaDeServico(servico) {
  var raiz = '../';
  var arquivo = 'servicos/' + contexto.paginaDoServico(servico);
  var url = DOMINIO + '/' + arquivo;
  var categoria = nomeDaCategoria(servico.categoria);

  var caminho = [
    { nome: 'Início', href: raiz + 'index.html', url: DOMINIO + '/' },
    { nome: 'Serviços', href: raiz + 'index.html#servicos', url: DOMINIO + '/#servicos' },
    { nome: servico.nome, url: url }
  ];

  var aviso = servico.aviso
    ? '        <div class="pg-bloco" data-reveal>\n          <p class="sheet__note"><span data-icon="triangle-alert" aria-hidden="true"></span><span>' +
      escapar(servico.aviso) + '</span></p>\n        </div>\n'
    : '';

  var conteudo = preencher(MODELO_SERVICO, {
    MIGALHAS: migalhas(caminho),
    ICONE: servico.icone,
    NUMERO: doisDigitos(SERVICOS.indexOf(servico) + 1),
    CATEGORIA: escapar(categoria),
    NOME: escapar(servico.nome),
    RESUMO: escapar(servico.resumo),
    ID: servico.id,
    RAIZ: raiz,
    LINK_WHATSAPP: escapar(contexto.linkWhatsApp(CONFIG.mensagemServico.replace('{servico}', servico.nome))),
    O_QUE_E: escapar(servico.oQueE),
    AVISO: aviso,
    PASSOS: servico.comoFunciona.map(function (p) { return '            <li>' + escapar(p) + '</li>'; }).join('\n'),
    PRECISAMOS: servico.precisamos.map(function (p) {
      return '            <li><span data-icon="check"></span><span>' + escapar(p) + '</span></li>';
    }).join('\n'),
    RELACIONADOS: relacionados(servico).map(cardDoServico).join('\n')
  });

  return montarPagina({
    raiz: raiz,
    classe: 'pagina--servico',
    titulo: tituloDoServico(servico),
    descricao: resumir(servico.resumo + ' Veja como funciona e o que vamos precisar de você.', 160),
    url: url,
    conteudo: conteudo,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          name: servico.nome,
          description: servico.oQueE,
          serviceType: categoria,
          url: url,
          areaServed: { '@type': 'Country', name: 'Brasil' },
          provider: ORGANIZACAO
        },
        migalhasJson(caminho)
      ]
    }
  });
}

/* =========================================================
   6. ALERTAS
   ========================================================= */
var MODELO_LISTA = lerModelo('alertas.html');
var MODELO_ALERTA = lerModelo('alerta.html');

function paginaDaLista() {
  var raiz = '';
  var url = DOMINIO + '/alertas.html';
  var ordem = contexto.alertasPorData();
  var maisNovo = ordem[0];
  var resto = ordem.slice(1);

  var caminho = [
    { nome: 'Início', href: 'index.html', url: DOMINIO + '/' },
    { nome: 'Alertas', url: url }
  ];

  // Destaque: o alerta mais recente
  var destaque = maisNovo ? (
    '        <article class="alerta-destaque bezel" data-alerta-destaque data-categoria="' + maisNovo.categoria + '">\n' +
    '          <div class="bezel__core alerta-destaque__core">\n' +
    '            <div class="alerta-destaque__topo">\n' +
    '              <span class="status-pill">Mais recente</span>\n' +
    '              <span class="mono">Alerta ' + doisDigitos(contexto.numeroDoAlerta(maisNovo)) + ' · <time datetime="' + maisNovo.data + '">' +
                     contexto.dataCurta(maisNovo.data) + '</time> · ' + escapar(nomeDaCategoria(maisNovo.categoria)) + '</span>\n' +
    '            </div>\n' +
    '            <h2 class="alerta-destaque__titulo"><a class="alerta-destaque__link" href="alertas/' + maisNovo.id + '.html">' + escapar(maisNovo.titulo) + '</a></h2>\n' +
    '            <p class="alerta-destaque__resumo">' + escapar(maisNovo.resumo) + '</p>\n' +
    '            <span class="alerta-destaque__ler" aria-hidden="true">Ler o alerta<span class="btn__orb"><span data-icon="arrow-up-right"></span></span></span>\n' +
    '          </div>\n' +
    '        </article>'
  ) : '';

  // Chips do filtro: "Todos" + as categorias que têm alerta
  var categoriasComAlerta = CATEGORIAS.filter(function (c) {
    return ALERTAS.some(function (a) { return a.categoria === c.id; });
  });
  function chip(id, nome, quantos, ligado) {
    return '            <button class="chip alertas__chip" type="button" aria-pressed="' + ligado + '" data-filtro="' + id + '">' +
      escapar(nome) + '<span class="tab__count" aria-hidden="true">' + doisDigitos(quantos) + '</span></button>';
  }
  var filtros = [chip('todos', 'Todos', ALERTAS.length, true)].concat(categoriasComAlerta.map(function (c) {
    return chip(c.id, c.nome, ALERTAS.filter(function (a) { return a.categoria === c.id; }).length, false);
  })).join('\n');

  var conteudo = preencher(MODELO_LISTA, {
    MIGALHAS: migalhas(caminho),
    TOTAL: ALERTAS.length === 1 ? '1 alerta' : ALERTAS.length + ' alertas',
    DESTAQUE: destaque,
    FILTROS: filtros,
    CARDS: resto.map(function (a) { return '          ' + contexto.htmlDoCardDeAlerta(a, raiz, false); }).join('\n'),
    LINK_WHATSAPP: escapar(contexto.linkWhatsApp(CONFIG.mensagemPadrao))
  });

  return montarPagina({
    raiz: raiz,
    classe: 'pagina--alertas',
    paginaAtual: 'alertas.html',
    titulo: 'Alertas de golpes: como funcionam e como se proteger | Vestígio',
    descricao: 'Golpes que circulam pelo WhatsApp, redes sociais e sites de venda, explicados de forma simples, com o que fazer para se proteger.',
    url: url,
    conteudo: conteudo,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: 'Alertas de golpes',
          url: url,
          publisher: ORGANIZACAO
        },
        migalhasJson(caminho)
      ]
    }
  });
}

function paginaDeAlerta(alerta) {
  var raiz = '../';
  var arquivo = 'alertas/' + alerta.id + '.html';
  var url = DOMINIO + '/' + arquivo;
  var servico = servicoPorId(alerta.servicoRelacionado);
  var categoria = nomeDaCategoria(alerta.categoria);

  var caminho = [
    { nome: 'Início', href: raiz + 'index.html', url: DOMINIO + '/' },
    { nome: 'Alertas', href: raiz + 'alertas.html', url: DOMINIO + '/alertas.html' },
    { nome: alerta.titulo, url: url }
  ];

  // Cartão do serviço relacionado (leva à página do serviço)
  var cartaoServico = servico ? (
    '          <aside class="alerta__servico" aria-labelledby="servico-titulo">\n' +
    '            <p class="mono alerta__servico-rotulo" id="servico-titulo">Serviço relacionado</p>\n' +
    '            <a class="alerta__servico-link" href="' + raiz + 'servicos/' + contexto.paginaDoServico(servico) + '">\n' +
    '              <span class="service-card__icon" aria-hidden="true"><span data-icon="' + servico.icone + '"></span></span>\n' +
    '              <span class="alerta__servico-texto"><strong>' + escapar(servico.nome) + '</strong><span>' + escapar(servico.resumo) + '</span></span>\n' +
    '              <span class="btn__orb" aria-hidden="true"><span data-icon="arrow-up-right"></span></span>\n' +
    '            </a>\n' +
    '          </aside>'
  ) : '';

  var conteudo = preencher(MODELO_ALERTA, {
    MIGALHAS: migalhas(caminho),
    NUMERO: doisDigitos(contexto.numeroDoAlerta(alerta)),
    DATA: alerta.data,
    DATA_CURTA: contexto.dataCurta(alerta.data),
    CATEGORIA: escapar(categoria),
    TITULO: escapar(alerta.titulo),
    RESUMO: escapar(alerta.resumo),
    RAIZ: raiz,
    PARAGRAFOS: alerta.paragrafos.map(function (p) { return '            <p>' + escapar(p) + '</p>'; }).join('\n'),
    PROTECAO: alerta.comoSeProteger.map(function (p) { return '                <li>' + escapar(p) + '</li>'; }).join('\n'),
    SERVICO: cartaoServico,
    SERVICO_ID: servico ? servico.id : '',
    LINK_WHATSAPP: escapar(contexto.linkWhatsApp(servico
      ? CONFIG.mensagemServico.replace('{servico}', servico.nome)
      : CONFIG.mensagemPadrao))
  });

  return montarPagina({
    raiz: raiz,
    classe: 'pagina--alerta',
    paginaAtual: 'alertas.html',
    ogTipo: 'article',
    titulo: alerta.titulo + ' | Alertas Vestígio',
    descricao: resumir(alerta.resumo + ' Veja como funciona e como se proteger.', 160),
    url: url,
    conteudo: conteudo,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: alerta.titulo,
          description: alerta.resumo,
          datePublished: alerta.data,
          inLanguage: 'pt-BR',
          url: url,
          mainEntityOfPage: url,
          author: ORGANIZACAO,
          publisher: ORGANIZACAO
        },
        migalhasJson(caminho)
      ]
    }
  });
}

/* =========================================================
   7. MAPA DO SITE (sitemap.xml) E robots.txt
   ========================================================= */
function sitemap(enderecos) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    enderecos.map(function (e) {
      return '  <url><loc>' + e.url + '</loc><lastmod>' + e.data + '</lastmod></url>';
    }).join('\n') +
    '\n</urlset>\n';
}

/* =========================================================
   8. GERAR TUDO
   ========================================================= */
console.log('Gerando páginas...');
var enderecos = [
  { url: DOMINIO + '/', data: HOJE },
  { url: DOMINIO + '/alertas.html', data: HOJE }
];

// Serviços
var feitosServicos = [];
SERVICOS.forEach(function (servico) {
  var nome = contexto.paginaDoServico(servico);
  gravar('servicos/' + nome, paginaDeServico(servico));
  feitosServicos.push(nome);
  enderecos.push({ url: DOMINIO + '/servicos/' + nome, data: HOJE });
});

// Alertas
gravar('alertas.html', paginaDaLista());
var feitosAlertas = [];
ALERTAS.forEach(function (alerta) {
  gravar('alertas/' + alerta.id + '.html', paginaDeAlerta(alerta));
  feitosAlertas.push(alerta.id + '.html');
  enderecos.push({ url: DOMINIO + '/alertas/' + alerta.id + '.html', data: alerta.data });
});

// Política de privacidade: recebe o MESMO rodapé do index.html, entre os
// comentários INICIO:RODAPE-COPIA e FIM:RODAPE-COPIA de privacidade.html
// (só o <footer>, sem o botão flutuante)
(function () {
  var privacidade = ler('privacidade.html');
  var inicio = privacidade.indexOf('<!-- INICIO:RODAPE-COPIA');
  var fim = privacidade.indexOf('<!-- FIM:RODAPE-COPIA -->');
  if (inicio < 0 || fim < 0) return;
  var rodapeHtml = ajustarLinks(MOLDE_RODAPE, '');
  rodapeHtml = rodapeHtml.slice(rodapeHtml.indexOf('  <footer'), rodapeHtml.indexOf('</footer>') + 9);
  var abre = privacidade.indexOf('\n', inicio) + 1;
  gravar('privacidade.html', privacidade.slice(0, abre) + rodapeHtml + '\n  ' + privacidade.slice(fim));
})();

gravar('sitemap.xml', sitemap(enderecos));
gravar('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: ' + DOMINIO + '/sitemap.xml\n');

// Avisa se sobrou alguma página antiga (ex.: um serviço que foi apagado)
[['servicos', feitosServicos], ['alertas', feitosAlertas]].forEach(function (par) {
  fs.readdirSync(path.join(PASTA, par[0])).forEach(function (arquivo) {
    if (/\.html$/.test(arquivo) && par[1].indexOf(arquivo) < 0) {
      console.log('  ATENÇÃO: ' + par[0] + '/' + arquivo + ' não corresponde a mais nenhum item. Pode apagar.');
    }
  });
});

console.log('Pronto! ' + SERVICOS.length + ' serviços e ' + ALERTAS.length + ' alertas.');

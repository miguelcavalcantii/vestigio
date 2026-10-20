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
   4. Cria (ou atualiza), em PORTUGUÊS:
        servicos/<nome-do-servico>.html   uma página por serviço
        alertas.html                      lista de alertas
        alertas/<id-do-alerta>.html       uma página por alerta
        privacidade.html                  política de privacidade
        termos.html                       termos de uso (só em português)
        delegacias.html                   delegacias por estado (só em português;
                                          dados em assets/data/delegacias.json)
        obrigado.html                     "Mensagem enviada" (formulário sem JavaScript)
   5. Cria (ou atualiza) as mesmas páginas em INGLÊS, na pasta en/:
        en/index.html (a partir do index.html), en/services/...,
        en/alerts.html, en/alerts/..., en/privacy.html e en/404.html
      Os textos vêm de dois dicionários (português → inglês):
        js/en/textos.js                   textos dos scripts e dos dados
        ferramentas/traducoes/paginas-en.js  textos do HTML
      Se faltar alguma tradução, o gerador mostra a lista
      "SEM TRADUÇÃO" no fim: acrescente a frase no dicionário.
   6. Atualiza sitemap.xml (com as duas línguas), robots.txt e o
      arquivo traducoes-para-revisar.md (todas as frases lado a lado).

   Mudou um serviço, um alerta, o menu, o rodapé ou um texto da
   página inicial? Rode de novo.
   Não precisa instalar nada: só o Node.js (https://nodejs.org).
   ========================================================= */

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var criarTradutor = require('./traduzir-html.js').criarTradutor;

// Endereço definitivo do site (usado no Google, no compartilhamento e no sitemap).
// O mesmo do <link rel="canonical"> do index.html
var DOMINIO = 'https://vestigio.app.br';

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

// Troca um trecho que PRECISA existir (se não existir, avisa e para)
function trocar(texto, de, para) {
  if (texto.indexOf(de) < 0) throw new Error('Não achei este trecho para trocar: ' + de);
  return texto.replace(de, para);
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

// Endereço completo de um arquivo do site ("index.html" vira a raiz da pasta)
function urlDe(arquivo) {
  return DOMINIO + '/' + arquivo.replace(/(^|\/)index\.html$/, '$1');
}

/* =========================================================
   2. DADOS (os mesmos arquivos que o site usa), nos dois idiomas
   Rodamos os arquivos "como se fosse o navegador" e pegamos as
   listas que eles criam. No inglês, o js/en/textos.js vem antes
   e a página "finge" ter <html lang="en">: os dados já saem
   traduzidos (função traduzirTudo de js/config.js).
   ========================================================= */
function carregarDados(idioma) {
  var contexto = { window: {} };
  if (idioma === 'en') contexto.document = { documentElement: { lang: 'en' } };
  vm.createContext(contexto);
  var arquivos = (idioma === 'en' ? ['js/en/textos.js'] : []).concat(['js/config.js', 'js/services.js', 'js/alertas.js']);
  arquivos.forEach(function (arquivo) {
    vm.runInContext(ler(arquivo), contexto, { filename: arquivo });
  });
  return contexto;
}

var DADOS_PT = carregarDados('pt');
var DADOS_EN = carregarDados('en');

// Dicionário do HTML: textos dos scripts + textos das páginas
var DICIONARIO_EN = Object.assign({}, DADOS_EN.TEXTOS_EN, require('./traducoes/paginas-en.js'));
var tradutorEn = criarTradutor(DICIONARIO_EN);

/* Tudo o que muda de um idioma para o outro */
var IDIOMAS = {
  pt: {
    codigo: 'pt', lang: 'pt-BR', ogLocale: 'pt_BR', pasta: '', dados: DADOS_PT,
    nomes: { servicos: 'servicos/', alertas: 'alertas/', listaAlertas: 'alertas.html', privacidade: 'privacidade.html', obrigado: 'obrigado.html' },
    t: function (texto) { return texto; },        // rótulos do gerador
    html: function (codigo) { return codigo; }     // textos dos modelos
  },
  en: {
    codigo: 'en', lang: 'en', ogLocale: 'en_US', pasta: 'en/', dados: DADOS_EN,
    nomes: { servicos: 'services/', alertas: 'alerts/', listaAlertas: 'alerts.html', privacidade: 'privacy.html', obrigado: 'thanks.html' },
    t: tradutorEn.texto,
    html: function (codigo) { return tradutorEn.html(semTrechosSoPt(codigo)); }
  }
};

// Trechos entre <!-- SO-PT --> e <!-- /SO-PT --> (ex.: "Delegacias por estado"
// no menu "Mais") existem só em português: saem das páginas em inglês.
function semTrechosSoPt(codigo) {
  return codigo.replace(/[ \t]*<!-- SO-PT -->[\s\S]*?<!-- \/SO-PT -->\n?/g, '');
}

/* Caminhos equivalentes: página em português → página em inglês
   (relativos à pasta de cada idioma) */
var CAMINHO_EN = { 'index.html': 'index.html', 'alertas.html': 'alerts.html', 'privacidade.html': 'privacy.html', 'obrigado.html': 'thanks.html' };
DADOS_PT.SERVICOS.forEach(function (servico) {
  var ingles = DADOS_EN.SERVICOS.filter(function (s) { return s.id === servico.id; })[0];
  CAMINHO_EN['servicos/' + DADOS_PT.paginaDoServico(servico)] = 'services/' + DADOS_EN.paginaDoServico(ingles);
});
DADOS_PT.ALERTAS.forEach(function (alerta) {
  var ingles = DADOS_EN.ALERTAS.filter(function (a) { return a.id === alerta.id; })[0];
  CAMINHO_EN['alertas/' + DADOS_PT.paginaDoAlerta(alerta)] = 'alerts/' + DADOS_EN.paginaDoAlerta(ingles);
});

// Um link escrito em português ("alertas.html#x") no idioma da página
function caminhoNoIdioma(alvo, idioma) {
  if (idioma.codigo === 'pt') return alvo;
  var partes = alvo.match(/^([^#?]*)(.*)$/);
  return (CAMINHO_EN[partes[1]] || partes[1]) + partes[2];
}

// As tags hreflang: a mesma página nos dois idiomas
function alternativas(caminhoPt, soPortugues) {
  var pt = urlDe(caminhoPt);
  // Página que só existe em português (ex.: delegacias.html): sem versão em inglês
  if (soPortugues) {
    return '  <link rel="alternate" hreflang="pt-BR" href="' + pt + '">\n' +
      '  <link rel="alternate" hreflang="x-default" href="' + pt + '">';
  }
  var en = urlDe('en/' + caminhoNoIdioma(caminhoPt, IDIOMAS.en));
  return '  <link rel="alternate" hreflang="pt-BR" href="' + pt + '">\n' +
    '  <link rel="alternate" hreflang="en" href="' + en + '">\n' +
    '  <link rel="alternate" hreflang="x-default" href="' + pt + '">';
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
//   raiz     = pasta do idioma, vista da página ("" ou "../")
//   raizSite = pasta do site (onde ficam assets, css e js)
//   "#servicos"     vira  raiz + "index.html#servicos"
//   "#inicio"       vira  raiz + "index.html"
//   "alertas.html"  vira  raiz + "alertas.html" (no inglês, "alerts.html")
//   "assets/..."    vira  raizSite + "assets/..."
function ajustarLinks(html, idioma, raiz, raizSite) {
  return html
    .replace(/href="#inicio"/g, 'href="' + raiz + 'index.html"')
    .replace(/href="#([^"]*)"/g, 'href="' + raiz + 'index.html#$1"')
    .replace(/(href|src)="(?![a-z]+:|\/|\.\.\/)([^"#][^"]*)"/g, function (inteiro, atributo, alvo) {
      if (/^(assets|css|js)\//.test(alvo)) return atributo + '="' + raizSite + alvo + '"';
      return atributo + '="' + raiz + caminhoNoIdioma(alvo, idioma) + '"';
    });
}

function cabecalho(idioma, raiz, raizSite, paginaAtual) {
  var html = ajustarLinks(idioma.html(MOLDE_CABECALHO), idioma, raiz, raizSite);
  // Marca no menu a página em que a pessoa está (ex.: "Alertas")
  if (paginaAtual) {
    var alvo = raiz + caminhoNoIdioma(paginaAtual, idioma);
    html = html.split('href="' + alvo + '"').join('href="' + alvo + '" aria-current="page"');
  }
  return html;
}

function rodape(idioma, raiz, raizSite) {
  return ajustarLinks(idioma.html(MOLDE_RODAPE), idioma, raiz, raizSite);
}

/* =========================================================
   4. PARTES QUE SE REPETEM
   ========================================================= */

/* IMAGEM DE COMPARTILHAMENTO (Open Graph) DE CADA PÁGINA
   Cada página diz o título, a frase e o rótulo da imagem (opcoes.og).
   O gerador anota tudo em ferramentas/og/paginas.json e o script
   ferramentas/gerar-og.js transforma cada item num PNG 1200×630 em
   assets/og/ (inglês em assets/og/en/). Página sem opcoes.og usa a
   imagem da página inicial do idioma. */
var OG_PAGINAS = [];

function imagemDeCompartilhamento(idioma, og) {
  var pasta = 'assets/og/' + (idioma.codigo === 'en' ? 'en/' : '');
  if (!og) {
    var inicio = idioma.codigo === 'en' ? 'home' : 'inicio';
    return { url: DOMINIO + '/' + pasta + inicio + '.png', alt: idioma.t('Vestígio: Todo golpe digital deixa rastro.') };
  }
  var arquivo = pasta + og.arquivo + '.png';
  OG_PAGINAS.push({ arquivo: arquivo, idioma: idioma.codigo, rotulo: og.rotulo, titulo: og.titulo, frase: og.frase });
  return { url: DOMINIO + '/' + arquivo, alt: 'Vestígio: ' + og.titulo };
}

// Imagem da página inicial (a cabeça do index.html é escrita à mão)
function ogDaPaginaInicial(idioma) {
  OG_PAGINAS.push({
    arquivo: 'assets/og/' + (idioma.codigo === 'en' ? 'en/home' : 'inicio') + '.png',
    idioma: idioma.codigo,
    rotulo: idioma.t('Investigação digital'),
    titulo: idioma.t('Todo golpe digital deixa rastro.'),
    frase: idioma.t('Investigamos golpes, localizamos pessoas e bens e organizamos as provas, com sigilo.')
  });
}
var MODELO_PAGINA = lerModelo('_pagina.html');
var MODELO_CABECA = lerModelo('_cabeca.html');

// Junta tudo numa página completa.
//   opcoes.caminho = o arquivo EM PORTUGUÊS, relativo à pasta do site
//   (ex.: "servicos/golpe-do-amor.html"): dele saem o endereço e as
//   tags hreflang dos dois idiomas.
function montarPagina(idioma, opcoes) {
  var raizSite = opcoes.raiz + (idioma.pasta ? '../' : '');
  var og = imagemDeCompartilhamento(idioma, opcoes.og);
  var cabeca = preencher(idioma.html(MODELO_CABECA), {
    TITULO: escapar(opcoes.titulo),
    DESCRICAO: escapar(opcoes.descricao),
    URL: opcoes.url,
    ALTERNATIVAS: alternativas(opcoes.caminho, opcoes.soPortugues),
    OG_TIPO: opcoes.ogTipo || 'website',
    OG_LOCALE: idioma.ogLocale,
    OG_IMAGEM: og.url,
    OG_ALT: escapar(og.alt),
    DOMINIO: DOMINIO,
    RAIZ_SITE: raizSite,
    MOLDE_TEMA: MOLDE_TEMA,
    JSON_LD: jsonLd(opcoes.jsonLd)
  });
  return preencher(idioma.html(MODELO_PAGINA), {
    LANG: idioma.lang,
    RAIZ: opcoes.raiz,
    RAIZ_SITE: raizSite,
    SCRIPT_TEXTOS: idioma.codigo === 'en' ? '  <script src="' + raizSite + 'js/en/textos.js"></script>\n' : '',
    CABECA: cabeca,
    CLASSE_PAGINA: opcoes.classe,
    CABECALHO: cabecalho(idioma, opcoes.raiz, raizSite, opcoes.paginaAtual),
    CONTEUDO: opcoes.conteudo,
    RODAPE: rodape(idioma, opcoes.raiz, raizSite)
  });
}

// Caminho no topo da página: Início / Serviços / Golpe do Pix falso
function migalhas(idioma, itens) {
  return (
    '        <nav class="migalhas" aria-label="' + escapar(idioma.t('Caminho da página')) + '">\n' +
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

function organizacao(idioma) {
  var CONFIG = idioma.dados.CONFIG;
  return {
    '@type': 'Organization',
    name: idioma.t('Vestígio Investigação Digital'),
    url: urlDe(idioma.pasta + 'index.html'),
    logo: DOMINIO + '/assets/logo.svg',
    email: CONFIG.email,
    sameAs: ['https://www.instagram.com/' + CONFIG.instagram + '/']   // perfil oficial (js/config.js)
  };
}

function pais(idioma) {
  return { '@type': 'Country', name: idioma.codigo === 'en' ? 'Brazil' : 'Brasil' };
}

/* =========================================================
   5. PÁGINAS DOS SERVIÇOS
   ========================================================= */
var MODELO_SERVICO = lerModelo('servico.html');

// Título que aparece no Google, de acordo com a categoria
// Título da aba e do Google: o Google corta por volta de 60-65 caracteres.
// Se "nome | marca longa" passar disso, usa só "| Vestígio".
var LIMITE_TITULO = 65;
function comMarca(base, marcaLonga) {
  var completo = base + ' | ' + marcaLonga;
  return completo.length <= LIMITE_TITULO ? completo : base + ' | Vestígio';
}

function tituloDoServico(idioma, servico) {
  if (idioma.codigo === 'en') {
    if (servico.categoria === 'estelionato') return servico.nome + ': what to do if it happened to you | Vestígio';
    if (servico.categoria === 'redes') return servico.nome + ' scams and fake profiles: what to do | Vestígio';
    return comMarca(servico.nome, 'Vestígio Digital Investigation');
  }
  if (servico.categoria === 'estelionato') return 'Caí no ' + servico.nome.charAt(0).toLowerCase() + servico.nome.slice(1) + '. O que fazer? | Vestígio';
  if (servico.categoria === 'redes') return 'Golpes e perfis falsos no ' + servico.nome + ': o que fazer | Vestígio';
  return comMarca(servico.nome, 'Vestígio Investigação Digital');
}

function nomeDaCategoria(idioma, id) {
  var c = idioma.dados.CATEGORIAS.filter(function (c) { return c.id === id; })[0];
  return c ? c.nome : '';
}

// Card de um serviço relacionado (o mesmo visual dos cards da página inicial)
function cardDoServico(idioma, servico) {
  var SERVICOS = idioma.dados.SERVICOS;
  var numero = doisDigitos(SERVICOS.indexOf(servico) + 1);
  return (
    '          <li class="service-card bezel" data-reveal-item>\n' +
    '            <div class="bezel__core">\n' +
    '              <div class="service-card__top">\n' +
    '                <span class="service-card__icon"><span data-icon="' + servico.icone + '"></span></span>\n' +
    '                <span class="mono">' + idioma.t('Caso') + ' ' + numero + '</span>\n' +
    '              </div>\n' +
    '              <h3><a class="service-card__button" href="' + idioma.dados.paginaDoServico(servico) + '">' + escapar(servico.nome) + '</a></h3>\n' +
    '              <p>' + escapar(servico.resumo) + '</p>\n' +
    '              <span class="service-card__more" aria-hidden="true">' + idioma.t('Ver serviço') + '<span class="btn__orb"><span data-icon="arrow-up-right"></span></span></span>\n' +
    '            </div>\n' +
    '          </li>'
  );
}

// 3 serviços da mesma categoria (se faltar, completa com os seguintes da lista)
function relacionados(idioma, servico) {
  var SERVICOS = idioma.dados.SERVICOS;
  var mesmos = SERVICOS.filter(function (s) { return s.categoria === servico.categoria && s !== servico; });
  var i = SERVICOS.indexOf(servico);
  var outros = SERVICOS.slice(i + 1).concat(SERVICOS.slice(0, i)).filter(function (s) {
    return s.categoria !== servico.categoria;
  });
  return mesmos.concat(outros).slice(0, 3);
}

function paginaDeServico(idioma, servico) {
  var D = idioma.dados;
  var raiz = '../';
  var arquivo = idioma.pasta + idioma.nomes.servicos + D.paginaDoServico(servico);
  var url = urlDe(arquivo);
  var categoria = nomeDaCategoria(idioma, servico.categoria);
  var servicoPt = DADOS_PT.SERVICOS.filter(function (s) { return s.id === servico.id; })[0];

  var caminho = [
    { nome: idioma.t('Início'), href: raiz + 'index.html', url: urlDe(idioma.pasta + 'index.html') },
    { nome: idioma.t('Serviços'), href: raiz + 'index.html#servicos', url: urlDe(idioma.pasta + 'index.html') + '#servicos' },
    { nome: servico.nome, url: url }
  ];

  var aviso = servico.aviso
    ? '        <div class="pg-bloco" data-reveal>\n          <p class="sheet__note"><span data-icon="triangle-alert" aria-hidden="true"></span><span>' +
      escapar(servico.aviso) + '</span></p>\n        </div>\n'
    : '';

  var conteudo = preencher(idioma.html(MODELO_SERVICO), {
    MIGALHAS: migalhas(idioma, caminho),
    ICONE: servico.icone,
    NUMERO: doisDigitos(D.SERVICOS.indexOf(servico) + 1),
    CATEGORIA: escapar(categoria),
    NOME: escapar(servico.nome),
    RESUMO: escapar(servico.resumo),
    ID: servico.id,
    RAIZ: raiz,
    LINK_WHATSAPP: escapar(D.linkWhatsApp(D.CONFIG.mensagemServico.replace('{servico}', servico.nome))),
    O_QUE_E: escapar(servico.oQueE),
    AVISO: aviso,
    PASSOS: servico.comoFunciona.map(function (p) { return '            <li>' + escapar(p) + '</li>'; }).join('\n'),
    PRECISAMOS: servico.precisamos.map(function (p) {
      return '            <li><span data-icon="check"></span><span>' + escapar(p) + '</span></li>';
    }).join('\n'),
    RELACIONADOS: relacionados(idioma, servico).map(function (s) { return cardDoServico(idioma, s); }).join('\n')
  });

  return montarPagina(idioma, {
    raiz: raiz,
    caminho: 'servicos/' + DADOS_PT.paginaDoServico(servicoPt),
    classe: 'pagina--servico',
    og: { arquivo: D.paginaDoServico(servico).replace(/\.html$/, ''), rotulo: idioma.t('Serviço') + ' · ' + categoria, titulo: servico.nome, frase: servico.resumo },
    titulo: tituloDoServico(idioma, servico),
    descricao: resumir(servico.resumo + ' ' + idioma.t('Veja como funciona e o que vamos precisar de você.'), 160),
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
          inLanguage: idioma.lang,
          areaServed: pais(idioma),
          provider: organizacao(idioma)
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

function paginaDaLista(idioma) {
  var D = idioma.dados;
  var raiz = '';
  var url = urlDe(idioma.pasta + idioma.nomes.listaAlertas);
  var ordem = D.alertasPorData();
  var maisNovo = ordem[0];
  var resto = ordem.slice(1);

  var caminho = [
    { nome: idioma.t('Início'), href: 'index.html', url: urlDe(idioma.pasta + 'index.html') },
    { nome: idioma.t('Alertas'), url: url }
  ];

  // Destaque: o alerta mais recente
  var destaque = maisNovo ? (
    '        <article class="alerta-destaque bezel" data-alerta-destaque data-categoria="' + maisNovo.categoria + '">\n' +
    '          <div class="bezel__core alerta-destaque__core">\n' +
    '            <div class="alerta-destaque__topo">\n' +
    '              <span class="status-pill">' + idioma.t('Mais recente') + '</span>\n' +
    '              <span class="mono">' + idioma.t('Alerta') + ' ' + doisDigitos(D.numeroDoAlerta(maisNovo)) + ' · <time datetime="' + maisNovo.data + '">' +
                     D.dataCurta(maisNovo.data) + '</time> · ' + escapar(nomeDaCategoria(idioma, maisNovo.categoria)) + '</span>\n' +
    '            </div>\n' +
    '            <h2 class="alerta-destaque__titulo"><a class="alerta-destaque__link" href="' + idioma.nomes.alertas + D.paginaDoAlerta(maisNovo) + '">' + escapar(maisNovo.titulo) + '</a></h2>\n' +
    '            <p class="alerta-destaque__resumo">' + escapar(maisNovo.resumo) + '</p>\n' +
    '            <span class="alerta-destaque__ler" aria-hidden="true">' + idioma.t('Ler o alerta') + '<span class="btn__orb"><span data-icon="arrow-up-right"></span></span></span>\n' +
    '          </div>\n' +
    '        </article>'
  ) : '';

  // Chips do filtro: "Todos" + as categorias que têm alerta
  var categoriasComAlerta = D.CATEGORIAS.filter(function (c) {
    return D.ALERTAS.some(function (a) { return a.categoria === c.id; });
  });
  function chip(id, nome, quantos, ligado) {
    return '            <button class="chip alertas__chip" type="button" aria-pressed="' + ligado + '" data-filtro="' + id + '">' +
      escapar(nome) + '<span class="tab__count" aria-hidden="true">' + doisDigitos(quantos) + '</span></button>';
  }
  var filtros = [chip('todos', idioma.t('Todos'), D.ALERTAS.length, true)].concat(categoriasComAlerta.map(function (c) {
    return chip(c.id, c.nome, D.ALERTAS.filter(function (a) { return a.categoria === c.id; }).length, false);
  })).join('\n');

  var conteudo = preencher(idioma.html(MODELO_LISTA), {
    MIGALHAS: migalhas(idioma, caminho),
    TOTAL: D.ALERTAS.length === 1 ? idioma.t('1 alerta') : D.ALERTAS.length + ' ' + idioma.t('alertas'),
    DESTAQUE: destaque,
    FILTROS: filtros,
    CARDS: resto.map(function (a) { return '          ' + D.htmlDoCardDeAlerta(a, raiz, false); }).join('\n'),
    LINK_WHATSAPP: escapar(D.linkWhatsApp(D.CONFIG.mensagemPadrao))
  });

  return montarPagina(idioma, {
    raiz: raiz,
    caminho: 'alertas.html',
    classe: 'pagina--alertas',
    og: { arquivo: idioma.nomes.listaAlertas.replace(/\.html$/, ''), rotulo: idioma.t('Alertas de golpes'), titulo: idioma.t('Golpes que estão circulando agora'), frase: idioma.t('Como cada golpe funciona e o que fazer para se proteger.') },
    paginaAtual: 'alertas.html',
    titulo: idioma.t('Alertas de golpes: como funcionam e como se proteger | Vestígio'),
    descricao: idioma.t('Golpes que circulam pelo WhatsApp, redes sociais e sites de venda, explicados de forma simples, com o que fazer para se proteger.'),
    url: url,
    conteudo: conteudo,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: idioma.t('Alertas de golpes'),
          url: url,
          inLanguage: idioma.lang,
          publisher: organizacao(idioma)
        },
        migalhasJson(caminho)
      ]
    }
  });
}

function paginaDeAlerta(idioma, alerta) {
  var D = idioma.dados;
  var raiz = '../';
  var arquivo = idioma.pasta + idioma.nomes.alertas + D.paginaDoAlerta(alerta);
  var url = urlDe(arquivo);
  var servico = D.SERVICOS.filter(function (s) { return s.id === alerta.servicoRelacionado; })[0];
  var categoria = nomeDaCategoria(idioma, alerta.categoria);

  var caminho = [
    { nome: idioma.t('Início'), href: raiz + 'index.html', url: urlDe(idioma.pasta + 'index.html') },
    { nome: idioma.t('Alertas'), href: raiz + idioma.nomes.listaAlertas, url: urlDe(idioma.pasta + idioma.nomes.listaAlertas) },
    { nome: alerta.titulo, url: url }
  ];

  // Cartão do serviço relacionado (leva à página do serviço)
  var cartaoServico = servico ? (
    '          <aside class="alerta__servico" aria-labelledby="servico-titulo">\n' +
    '            <p class="mono alerta__servico-rotulo" id="servico-titulo">' + idioma.t('Serviço relacionado') + '</p>\n' +
    '            <a class="alerta__servico-link" href="' + raiz + idioma.nomes.servicos + D.paginaDoServico(servico) + '">\n' +
    '              <span class="service-card__icon" aria-hidden="true"><span data-icon="' + servico.icone + '"></span></span>\n' +
    '              <span class="alerta__servico-texto"><strong>' + escapar(servico.nome) + '</strong><span>' + escapar(servico.resumo) + '</span></span>\n' +
    '              <span class="btn__orb" aria-hidden="true"><span data-icon="arrow-up-right"></span></span>\n' +
    '            </a>\n' +
    '          </aside>'
  ) : '';

  var conteudo = preencher(idioma.html(MODELO_ALERTA), {
    MIGALHAS: migalhas(idioma, caminho),
    NUMERO: doisDigitos(D.numeroDoAlerta(alerta)),
    DATA: alerta.data,
    DATA_CURTA: D.dataCurta(alerta.data),
    CATEGORIA: escapar(categoria),
    TITULO: escapar(alerta.titulo),
    RESUMO: escapar(alerta.resumo),
    RAIZ: raiz,
    PARAGRAFOS: alerta.paragrafos.map(function (p) { return '            <p>' + escapar(p) + '</p>'; }).join('\n'),
    PROTECAO: alerta.comoSeProteger.map(function (p) { return '                <li>' + escapar(p) + '</li>'; }).join('\n'),
    SERVICO: cartaoServico,
    SERVICO_ID: servico ? servico.id : '',
    LINK_WHATSAPP: escapar(D.linkWhatsApp(servico
      ? D.CONFIG.mensagemServico.replace('{servico}', servico.nome)
      : D.CONFIG.mensagemPadrao))
  });

  return montarPagina(idioma, {
    raiz: raiz,
    caminho: 'alertas/' + alerta.id + '.html',
    classe: 'pagina--alerta',
    og: { arquivo: D.paginaDoAlerta(alerta).replace(/\.html$/, ''), rotulo: idioma.t('Alerta de golpe') + ' · ' + categoria, titulo: alerta.titulo, frase: alerta.resumo },
    paginaAtual: 'alertas.html',
    ogTipo: 'article',
    titulo: comMarca(alerta.titulo, idioma.t('Alertas Vestígio')),
    descricao: resumir(alerta.resumo + ' ' + idioma.t('Veja como funciona e como se proteger.'), 160),
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
          inLanguage: idioma.lang,
          url: url,
          mainEntityOfPage: url,
          author: organizacao(idioma),
          publisher: organizacao(idioma)
        },
        migalhasJson(caminho)
      ]
    }
  });
}

/* =========================================================
   7. POLÍTICA DE PRIVACIDADE
   Montada como as outras páginas (mesmo cabeçalho, rodapé, tema
   e scripts). O texto fica em ferramentas/modelos/privacidade.html.
   ========================================================= */
function paginaDePrivacidade(idioma) {
  var url = urlDe(idioma.pasta + idioma.nomes.privacidade);
  return montarPagina(idioma, {
    raiz: '',
    caminho: 'privacidade.html',
    og: { arquivo: idioma.nomes.privacidade.replace(/\.html$/, ''), rotulo: idioma.t('Seus dados'), titulo: idioma.t('Política de Privacidade'), frase: idioma.t('Como tratamos os seus dados pessoais, conforme a LGPD.') },
    titulo: idioma.t('Política de privacidade | Vestígio Investigação Digital'),
    descricao: idioma.t('Como a Vestígio Investigação Digital trata os seus dados pessoais, conforme a LGPD.'),
    url: url,
    classe: 'pagina--privacidade',
    paginaAtual: 'privacidade.html',
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: idioma.t('Política de privacidade'), url: url, inLanguage: idioma.lang, publisher: organizacao(idioma) },
    conteudo: idioma.html(lerModelo('privacidade.html').replace(/\s+$/, ''))
  });
}

/* =========================================================
   7c. TERMOS DE USO (termos.html, só em português)
   Mesmo visual da Política de Privacidade. O texto fica em
   ferramentas/modelos/termos.html (rascunho: precisa da revisão
   do advogado parceiro antes de ir ao ar).
   ========================================================= */
function paginaDeTermos() {
  var idioma = IDIOMAS.pt;
  var url = urlDe('termos.html');
  return montarPagina(idioma, {
    raiz: '',
    caminho: 'termos.html',
    soPortugues: true,
    og: { arquivo: 'termos', rotulo: 'Transparência', titulo: 'Termos de uso', frase: 'O que fazemos, o que não fazemos e os nossos canais oficiais.' },
    titulo: 'Termos de uso | Vestígio Investigação Digital',
    descricao: 'Como funcionam o site e os serviços da Vestígio: o que fazemos, o que não fazemos, contratação, canais oficiais e responsabilidades.',
    url: url,
    classe: 'pagina--privacidade pagina--termos',
    paginaAtual: 'termos.html',
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Termos de uso', url: url, inLanguage: idioma.lang, publisher: organizacao(idioma) },
    conteudo: lerModelo('termos.html').replace(/\s+$/, '')
  });
}

/* =========================================================
   7a. DELEGACIAS POR ESTADO (delegacias.html, só em português)
   Os dados vêm de assets/data/delegacias.json. Com JavaScript,
   js/delegacias.js monta os cards e a busca a partir do JSON.
   Aqui o gerador escreve a lista simples de links (para quem
   está sem JavaScript) com os mesmos dados.
   ========================================================= */
var DELEGACIAS = JSON.parse(ler('assets/data/delegacias.json'));
var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Pernambuco (sede da Vestígio) primeiro; os outros em ordem alfabética
function estadosEmOrdem() {
  return DELEGACIAS.estados.slice().sort(function (a, b) {
    if (!a.destaque !== !b.destaque) return a.destaque ? -1 : 1;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
}

function paginaDeDelegacias() {
  var idioma = IDIOMAS.pt;
  var url = urlDe('delegacias.html');
  var caminho = [
    { nome: 'Início', href: 'index.html', url: urlDe('index.html') },
    { nome: 'Delegacias por estado', url: url }
  ];
  var partes = DELEGACIAS.verificadoEm.split('-');
  var lista = '          <ul role="list" class="deleg__lista">\n' + estadosEmOrdem().map(function (e) {
    var esp = e.especializada
      ? ' · Especializada: ' + escapar(e.especializada.nome) + (e.especializada.sigla ? ' (' + escapar(e.especializada.sigla) + ')' : '')
      : '';
    return '            <li><strong>' + escapar(e.nome) + ' (' + e.uf + ')</strong>: ' +
      '<a href="' + escapar(e.bo.url) + '" target="_blank" rel="noopener">registrar BO online</a> · ' +
      '<a href="' + escapar(e.policiaCivil) + '" target="_blank" rel="noopener">site da Polícia Civil</a>' + esp + '</li>';
  }).join('\n') + '\n          </ul>';

  var conteudo = preencher(lerModelo('delegacias.html').replace(/\s+$/, ''), {
    MIGALHAS: migalhas(idioma, caminho),
    TOTAL: String(DELEGACIAS.estados.filter(function (e) { return e.uf !== 'DF'; }).length),
    LISTA_SEM_JS: lista,
    VERIFICADO_ISO: DELEGACIAS.verificadoEm,
    VERIFICADO: Number(partes[2]) + ' de ' + MESES[Number(partes[1]) - 1] + ' de ' + partes[0],
    LINK_WHATSAPP: escapar(idioma.dados.linkWhatsApp('Olá! Quero ajuda para organizar as provas antes de registrar o boletim de ocorrência.'))
  });

  return montarPagina(idioma, {
    raiz: '',
    caminho: 'delegacias.html',
    soPortugues: true,
    classe: 'pagina--delegacias',
    og: { arquivo: 'delegacias', rotulo: 'Delegacias por estado', titulo: 'Onde registrar o boletim de ocorrência', frase: 'BO online e delegacia de crimes cibernéticos de cada estado.' },
    paginaAtual: 'delegacias.html',
    titulo: 'Onde registrar o BO: delegacias por estado | Vestígio',
    descricao: 'Delegacia virtual (BO online) e delegacia especializada em crimes cibernéticos dos 26 estados e do Distrito Federal, com links para os sites oficiais.',
    url: url,
    conteudo: conteudo,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: 'Onde registrar o boletim de ocorrência', url: url, inLanguage: idioma.lang, publisher: organizacao(idioma) },
        migalhasJson(caminho)
      ]
    }
  });
}

/* =========================================================
   7b. "MENSAGEM ENVIADA" (obrigado.html)
   Para onde o Web3Forms leva quem envia o formulário de contato
   com o JavaScript desligado. Não entra no Google (noindex) nem
   no sitemap. O texto fica em ferramentas/modelos/obrigado.html.
   ========================================================= */
function paginaDeObrigado(idioma) {
  var url = urlDe(idioma.pasta + idioma.nomes.obrigado);
  var html = montarPagina(idioma, {
    raiz: '',
    caminho: 'obrigado.html',
    titulo: idioma.t('Mensagem enviada | Vestígio Investigação Digital'),
    descricao: idioma.t('Recebemos o seu contato e respondemos em até 1 dia útil. Se for urgente, chame no WhatsApp.'),
    url: url,
    classe: 'pagina--obrigado',
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: idioma.t('Mensagem enviada'), url: url, inLanguage: idioma.lang, publisher: organizacao(idioma) },
    conteudo: idioma.html(lerModelo('obrigado.html').replace(/\s+$/, ''))
  });
  return trocar(html, '  <meta name="viewport" content="width=device-width, initial-scale=1">\n',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="robots" content="noindex">\n');
}

/* =========================================================
   8. PÁGINA INICIAL E 404 EM INGLÊS (a partir do index.html e do 404.html)
   ========================================================= */
var AVISO_GERADO = '<!-- ARQUIVO GERADO por ferramentas/gerar-paginas.js a partir do index.html e de\n' +
  '     ferramentas/traducoes/. Não edite aqui: mude o index.html (ou o dicionário) e rode de novo. -->\n';

function paginaInicialEn() {
  var en = IDIOMAS.en;
  var html = INDEX;
  // O bloco que leva para o inglês só existe na página em português
  html = html.replace(/ {2}<!-- INICIO:IDIOMA-SALVO[\s\S]*?<!-- FIM:IDIOMA-SALVO -->\n/, '');
  html = en.html(html);
  html = trocar(html, '<!DOCTYPE html>\n<html lang="pt-BR">', '<!DOCTYPE html>\n' + AVISO_GERADO + '<html lang="en" data-raiz="" data-raiz-site="../">');
  html = trocar(html, '<link rel="canonical" href="' + DOMINIO + '/">', '<link rel="canonical" href="' + DOMINIO + '/en/">');
  html = trocar(html, '<meta property="og:locale" content="pt_BR">', '<meta property="og:locale" content="en_US">');
  html = trocar(html, '<meta property="og:url" content="' + DOMINIO + '/">', '<meta property="og:url" content="' + DOMINIO + '/en/">');
  html = html.split(DOMINIO + '/assets/og/inicio.png').join(DOMINIO + '/assets/og/en/home.png');
  html = trocar(html, '"areaServed": { "@type": "Country", "name": "Brasil" }', '"areaServed": { "@type": "Country", "name": "Brazil" }');
  // Formulário de contato sem JavaScript: volta para a página "obrigado" em inglês
  html = trocar(html, 'name="redirect" value="https://www.vestigio.app.br/obrigado.html"', 'name="redirect" value="https://www.vestigio.app.br/en/thanks.html"');
  // Links: arquivos do site sobem uma pasta; páginas trocam de nome
  html = html.replace(/(href|src)="(?![a-z]+:|\/|\.\.\/|#)([^"]*)"/g, function (inteiro, atributo, alvo) {
    if (/^(assets|css|js)\//.test(alvo)) return atributo + '="../' + alvo + '"';
    return atributo + '="' + caminhoNoIdioma(alvo, en) + '"';
  });
  // O dicionário em inglês vem antes do config.js
  html = trocar(html, '  <script src="../js/config.js"></script>', '  <script src="../js/en/textos.js"></script>\n  <script src="../js/config.js"></script>');
  return html;
}

function pagina404En() {
  var html = IDIOMAS.en.html(ler('404.html'));
  html = trocar(html, '<html lang="pt-BR">', '<html lang="en">');
  html = trocar(html, '<a class="btn btn--primary btn--lg" href="/">', '<a class="btn btn--primary btn--lg" href="/en/">');
  return html;
}

/* =========================================================
   9. MAPA DO SITE (sitemap.xml), robots.txt e lista para revisão
   ========================================================= */
function sitemap(enderecos) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    enderecos.map(function (e) {
      var pt = urlDe(e.caminho);
      // Página só em português (ex.: delegacias.html): uma entrada, sem inglês
      if (e.soPortugues) {
        return '  <url>\n    <loc>' + pt + '</loc>\n    <lastmod>' + e.data + '</lastmod>\n' +
          '    <xhtml:link rel="alternate" hreflang="pt-BR" href="' + pt + '"/>\n' +
          '    <xhtml:link rel="alternate" hreflang="x-default" href="' + pt + '"/>\n  </url>';
      }
      var en = urlDe('en/' + caminhoNoIdioma(e.caminho, IDIOMAS.en));
      var ligacoes =
        '    <xhtml:link rel="alternate" hreflang="pt-BR" href="' + pt + '"/>\n' +
        '    <xhtml:link rel="alternate" hreflang="en" href="' + en + '"/>\n' +
        '    <xhtml:link rel="alternate" hreflang="x-default" href="' + pt + '"/>\n';
      return [pt, en].map(function (loc) {
        return '  <url>\n    <loc>' + loc + '</loc>\n    <lastmod>' + e.data + '</lastmod>\n' + ligacoes + '  </url>';
      }).join('\n');
    }).join('\n') +
    '\n</urlset>\n';
}

function listaParaRevisar() {
  var linhas = [
    '# Traduções para revisar (português → inglês)',
    '',
    'Arquivo gerado por `ferramentas/gerar-paginas.js`. Para corrigir uma tradução,',
    'mude o dicionário e rode o gerador de novo:',
    '',
    '- textos dos scripts e dos dados (serviços, alertas, verificador, painéis): `js/en/textos.js`',
    '- textos das páginas (página inicial, modelos, política de privacidade): `ferramentas/traducoes/paginas-en.js`',
    '',
    'Total: ' + Object.keys(DICIONARIO_EN).length + ' frases.',
    '',
    '| Português | English |',
    '| --- | --- |'
  ];
  Object.keys(DICIONARIO_EN).forEach(function (pt) {
    var celula = function (t) { return String(t).replace(/\|/g, '\\|').replace(/&nbsp;/g, ' '); };
    linhas.push('| ' + celula(pt) + ' | ' + celula(DICIONARIO_EN[pt]) + ' |');
  });
  return linhas.join('\n') + '\n';
}

/* =========================================================
   10. GERAR TUDO
   ========================================================= */
console.log('Gerando páginas...');
var enderecos = [
  { caminho: 'index.html', data: HOJE },
  { caminho: 'privacidade.html', data: HOJE },
  { caminho: 'alertas.html', data: HOJE },
  { caminho: 'delegacias.html', data: DELEGACIAS.verificadoEm, soPortugues: true },
  { caminho: 'termos.html', data: HOJE, soPortugues: true }
];
var feitos = { servicos: [], alertas: [], 'en/services': [], 'en/alerts': [] };

['pt', 'en'].forEach(function (codigo) {
  var idioma = IDIOMAS[codigo];
  var D = idioma.dados;
  var pastaServicos = idioma.pasta + idioma.nomes.servicos;
  var pastaAlertas = idioma.pasta + idioma.nomes.alertas;

  D.SERVICOS.forEach(function (servico) {
    var nome = D.paginaDoServico(servico);
    gravar(pastaServicos + nome, paginaDeServico(idioma, servico));
    feitos[pastaServicos.replace(/\/$/, '')].push(nome);
    if (codigo === 'pt') enderecos.push({ caminho: 'servicos/' + nome, data: HOJE });
  });

  gravar(idioma.pasta + idioma.nomes.listaAlertas, paginaDaLista(idioma));
  D.ALERTAS.forEach(function (alerta) {
    var nome = D.paginaDoAlerta(alerta);
    gravar(pastaAlertas + nome, paginaDeAlerta(idioma, alerta));
    feitos[pastaAlertas.replace(/\/$/, '')].push(nome);
    if (codigo === 'pt') enderecos.push({ caminho: 'alertas/' + nome, data: alerta.data });
  });

  gravar(idioma.pasta + idioma.nomes.privacidade, paginaDePrivacidade(idioma));
  gravar(idioma.pasta + idioma.nomes.obrigado, paginaDeObrigado(idioma));
});

gravar('delegacias.html', paginaDeDelegacias());
ogDaPaginaInicial(IDIOMAS.pt);
ogDaPaginaInicial(IDIOMAS.en);
gravar('termos.html', paginaDeTermos());
gravar('en/index.html', paginaInicialEn());
gravar('en/404.html', pagina404En());

gravar('sitemap.xml', sitemap(enderecos));
gravar('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: ' + DOMINIO + '/sitemap.xml\n');
gravar('traducoes-para-revisar.md', listaParaRevisar());
// Lista das imagens de compartilhamento (para ferramentas/gerar-og.js)
gravar('ferramentas/og/paginas.json', JSON.stringify({
  _leia: 'Gerado por ferramentas/gerar-paginas.js. Não edite: rode node ferramentas/gerar-og.js para criar as imagens.',
  paginas: OG_PAGINAS
}, null, 2) + '\n');

// Avisa se sobrou alguma página antiga (ex.: um serviço que foi apagado)
Object.keys(feitos).forEach(function (pasta) {
  fs.readdirSync(path.join(PASTA, pasta)).forEach(function (arquivo) {
    if (/\.html$/.test(arquivo) && feitos[pasta].indexOf(arquivo) < 0) {
      console.log('  ATENÇÃO: ' + pasta + '/' + arquivo + ' não corresponde a mais nenhum item. Pode apagar.');
    }
  });
});

// Frases que ficaram em português nas páginas em inglês
var semTraducao = tradutorEn.faltando().concat(Object.keys(DADOS_EN.window.textosFaltando || {}));
semTraducao = semTraducao.filter(function (frase, i) { return semTraducao.indexOf(frase) === i; });
if (semTraducao.length) {
  console.log('\n  SEM TRADUÇÃO (' + semTraducao.length + '): estas frases ficaram em português no inglês.');
  console.log('  Acrescente cada uma em ferramentas/traducoes/paginas-en.js (HTML) ou js/en/textos.js (scripts):');
  semTraducao.forEach(function (frase) { console.log('    - ' + frase); });
}

console.log('\nPronto! ' + DADOS_PT.SERVICOS.length + ' serviços e ' + DADOS_PT.ALERTAS.length + ' alertas, em português e em inglês.');

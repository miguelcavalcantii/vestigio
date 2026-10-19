/* =========================================================
   ALERTAS DE GOLPES (dados)
   ---------------------------------------------------------
   Cada objeto vira:
     - um card na página alertas.html
     - uma página própria na pasta alertas/
     - um item da faixa "Últimos alertas" da página inicial
       (os 3 mais recentes, pela data)

   Campos:
     id                 nome do arquivo da página (sem espaço nem acento)
     titulo             título do alerta
     data               data de publicação, no formato ANO-MÊS-DIA
     categoria          o "id" de uma categoria de js/services.js
     resumo             uma ou duas frases (aparece no card)
     paragrafos         o texto do alerta, um parágrafo por item
     comoSeProteger     lista de dicas curtas
     servicoRelacionado o "id" de um serviço de js/services.js

   REGRAS: não invente estatísticas, números ou casos reais.
   Depois de mudar este arquivo, rode
     node ferramentas/gerar-paginas.js
   para atualizar alertas.html e a pasta alertas/ (veja o README).
   ========================================================= */

var ALERTAS = [
  // EXEMPLO: revisar antes de publicar.
  {
    id: 'golpe-do-falso-parente-numero-novo',
    titulo: 'Golpe do falso parente: “mãe, troquei de número”',
    data: '2026-10-12',
    categoria: 'redes',
    resumo: 'Alguém se passa por filho, neto ou outro parente, diz que trocou de número e logo pede um Pix com urgência.',
    paragrafos: [
      'A mensagem chega de um número desconhecido, muitas vezes com uma foto do parente copiada das redes sociais: “Oi, mãe, troquei de número. Salva esse aqui.” Em seguida vem uma conversa curta e carinhosa, feita para criar confiança.',
      'Pouco depois aparece o pedido: um boleto que vence hoje, uma conta atrasada, um problema com o banco. A pessoa pede um Pix, promete devolver no dia seguinte e insiste na pressa. Às vezes a chave Pix está no nome de outra pessoa, com uma desculpa pronta.',
      'O golpe funciona porque junta afeto e urgência. Cair nele não é ingenuidade: ele é montado justamente para não dar tempo de pensar.'
    ],
    comoSeProteger: [
      'Antes de qualquer pagamento, ligue para o número antigo do parente ou fale com ele por outro caminho.',
      'Faça uma pergunta que só a pessoa verdadeira saberia responder.',
      'Desconfie de chave Pix em nome de outra pessoa e de pedidos de segredo.',
      'Combine com a família uma palavra-código para emergências.',
      'Se já pagou, ligue para o seu banco na hora e peça a abertura do MED.'
    ],
    servicoRelacionado: 'whatsapp'
  },

  // EXEMPLO: revisar antes de publicar.
  {
    id: 'falso-leilao-de-veiculos',
    titulo: 'Falso leilão de veículos: o carro barato que nunca chega',
    data: '2026-10-05',
    categoria: 'estelionato',
    resumo: 'Sites que imitam leiloeiros oficiais anunciam carros e motos abaixo do preço e pedem pagamento rápido depois do lance.',
    paragrafos: [
      'Sites muito parecidos com os de leiloeiros oficiais anunciam carros e motos bem abaixo do preço de mercado. Alguns usam o nome, o registro e até as fotos de leiloeiros verdadeiros.',
      'Depois do lance, chega a mensagem de que você arrematou o lote. Para “garantir” o veículo, pedem o pagamento rápido por Pix ou boleto, às vezes em nome de uma pessoa física. O veículo nunca é entregue, e o site muda de endereço ou sai do ar.',
      'Leilões verdadeiros têm edital, regras de visitação e pagamento identificado. Pressa e preço bom demais são os sinais mais comuns de que algo está errado.'
    ],
    comoSeProteger: [
      'Confira se o leiloeiro está registrado na Junta Comercial do seu estado e use o endereço do site que aparece lá.',
      'Desconfie de preços muito abaixo da tabela e de prazos curtos para pagar.',
      'Não pague para contas de pessoa física ou de empresas que não são o próprio leiloeiro.',
      'Leia o edital e, se puder, visite o veículo antes de dar o lance.',
      'Guarde prints do site, do lote e dos comprovantes, mesmo que o site saia do ar.'
    ],
    servicoRelacionado: 'falso-leilao'
  },

  // EXEMPLO: revisar antes de publicar.
  {
    id: 'pix-agendado-e-cancelado',
    titulo: 'Pix agendado e cancelado: o comprovante que não vale nada',
    data: '2026-09-28',
    categoria: 'estelionato',
    resumo: 'O comprador mostra um comprovante de Pix verdadeiro, mas o pagamento era só um agendamento, cancelado depois da entrega.',
    paragrafos: [
      'Você vende um produto pela internet e o comprador manda, na hora, um comprovante de Pix. O documento parece verdadeiro, com valor, data e o seu nome. Confiante, você entrega o produto ou despacha a encomenda.',
      'O que o comprovante não deixa claro é que o Pix foi apenas agendado para outro dia. Depois de receber o produto, o golpista cancela o agendamento e o dinheiro nunca cai na sua conta. Há também versões com comprovantes editados, de transferências que nunca existiram.',
      'O golpe aposta na pressa de fechar a venda e no hábito de olhar só o comprovante, sem conferir o extrato.'
    ],
    comoSeProteger: [
      'Só entregue o produto depois de ver o dinheiro no extrato da sua conta, e não apenas no comprovante.',
      'Leia o comprovante com atenção: palavras como “agendamento” ou “agendado” indicam que o dinheiro ainda não saiu.',
      'Desconfie de quem tem muita pressa ou quer mandar alguém buscar o produto na mesma hora.',
      'Guarde a conversa, o comprovante recebido e os dados de quem comprou.'
    ],
    servicoRelacionado: 'pix-falso'
  }
];

/* Inglês: traduz os textos (dicionário em js/en/textos.js) e usa
   os nomes de página em inglês. */
traduzirTudo(ALERTAS, ['id', 'data', 'categoria', 'servicoRelacionado', 'pagina']);
if (IDIOMA === 'en' && typeof PAGINAS_EN !== 'undefined') {
  ALERTAS.forEach(function (a) { if (PAGINAS_EN.alertas[a.id]) a.pagina = PAGINAS_EN.alertas[a.id]; });
}

/* =========================================================
   AJUDANTES DOS ALERTAS
   Usados pelo site e pelo script ferramentas/gerar-paginas.js
   ========================================================= */

// Do mais novo para o mais antigo
function alertasPorData() {
  return ALERTAS.slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });
}

// "2026-10-12" vira "12 out 2026" (no inglês, "Oct 12, 2026")
var MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
var MESES_CURTOS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dataCurta(data) {
  var partes = data.split('-');
  if (IDIOMA === 'en') return MESES_CURTOS_EN[Number(partes[1]) - 1] + ' ' + Number(partes[2]) + ', ' + partes[0];
  return Number(partes[2]) + ' ' + MESES_CURTOS[Number(partes[1]) - 1] + ' ' + partes[0];
}

// Nome do arquivo da página do alerta (no inglês, o nome em inglês)
function paginaDoAlerta(alerta) {
  return (alerta.pagina || alerta.id) + '.html';
}

// Número do alerta pela ordem de publicação: o mais antigo é o 01
function numeroDoAlerta(alerta) {
  return alertasPorData().reverse().indexOf(alerta) + 1;
}

// Nome da categoria (as categorias ficam em js/services.js)
function categoriaDoAlerta(alerta) {
  for (var i = 0; i < CATEGORIAS.length; i++) {
    if (CATEGORIAS[i].id === alerta.categoria) return CATEGORIAS[i].nome;
  }
  return '';
}

// Troca < > & " por códigos, para o texto não quebrar o HTML
function escaparAlerta(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// HTML de um card de alerta (visual de "boletim").
//   raiz = "" na página inicial e em alertas.html; "../" dentro das pastas
//   comEntrada = true para o card entrar com a animação de rolagem
//   (só na página inicial; em alertas.html o filtro cuida da animação)
function htmlDoCardDeAlerta(alerta, raiz, comEntrada) {
  return (
    '<li class="alerta-card" data-categoria="' + alerta.categoria + '"' + (comEntrada ? ' data-reveal-item' : '') + '>' +
      '<div class="alerta-card__topo">' +
        '<span class="mono">' + T('Alerta') + ' ' + (numeroDoAlerta(alerta) < 10 ? '0' : '') + numeroDoAlerta(alerta) + '</span>' +
        '<time class="mono" datetime="' + alerta.data + '">' + dataCurta(alerta.data) + '</time>' +
      '</div>' +
      '<h3 class="alerta-card__titulo"><a class="alerta-card__link" href="' + raiz + PASTAS.alertas + paginaDoAlerta(alerta) + '">' +
        escaparAlerta(alerta.titulo) + '</a></h3>' +
      '<p class="alerta-card__resumo">' + escaparAlerta(alerta.resumo) + '</p>' +
      '<div class="alerta-card__pe">' +
        '<span class="alerta-card__cat">' + escaparAlerta(categoriaDoAlerta(alerta)) + '</span>' +
        '<span class="btn__orb" aria-hidden="true"><span data-icon="arrow-up-right"></span></span>' +
      '</div>' +
    '</li>'
  );
}

/* =========================================================
   CONFIGURAÇÃO GERAL DO SITE
   ---------------------------------------------------------
   Este é o ÚNICO lugar onde ficam o WhatsApp, o e-mail e
   os dados de contato. Todos os botões e textos do site
   leem daqui. Mudou o número? Mude só aqui.
   ========================================================= */

/* IDIOMA DA PÁGINA (português ou inglês)
   ---------------------------------------------------------
   As páginas em inglês ficam na pasta en/ e têm <html lang="en">.
   Nelas, o arquivo js/en/textos.js (carregado ANTES deste)
   traz o dicionário TEXTOS_EN: frase em português → em inglês.
   T('frase') devolve a frase no idioma da página. Nas páginas
   em português, devolve a própria frase (nada muda).
   Os textos que faltarem no dicionário ficam em português e
   são anotados em window.textosFaltando (para conferência). */
var IDIOMA = (typeof document !== 'undefined' && /^en/i.test(document.documentElement.lang || '')) ? 'en' : 'pt';

function T(texto, semAnotar) {
  if (IDIOMA !== 'en' || typeof texto !== 'string') return texto;
  var dicionario = typeof TEXTOS_EN !== 'undefined' ? TEXTOS_EN : {};
  var chave = texto.replace(/\s+/g, ' ').trim();
  if (Object.prototype.hasOwnProperty.call(dicionario, chave)) {
    // mantém os espaços de antes e de depois (o HTML montado depende deles)
    return texto.match(/^\s*/)[0] + dicionario[chave] + texto.match(/\s*$/)[0];
  }
  // Já está em inglês (é uma das traduções do dicionário)? Então está certo.
  if (!T.traducoes) {
    T.traducoes = {};
    Object.keys(dicionario).forEach(function (k) { T.traducoes[dicionario[k]] = true; });
  }
  if (T.traducoes[chave]) return texto;
  if (!semAnotar && /[A-Za-zÀ-ú]{2,}/.test(chave) && typeof window !== 'undefined') {
    (window.textosFaltando = window.textosFaltando || {})[chave] = true;
  }
  return texto;
}

/* Traduz um HTML montado pelos scripts: cada texto entre as tags
   (e os atributos aria-label, title e placeholder) passa pelo T.
   Use nos painéis montados com innerHTML. */
function TH(html) {
  if (IDIOMA !== 'en') return html;
  return html.split(/(<[^>]+>)/).map(function (parte) {
    if (!parte) return parte;
    if (parte.charAt(0) === '<') {
      return parte.replace(/\s(aria-label|title|placeholder)="([^"]*)"/g, function (inteiro, nome, valor) {
        return ' ' + nome + '="' + T(valor) + '"';
      });
    }
    // Trechos com números ("Passo 01") são montados pelos scripts com T();
    // aqui eles só passam, sem entrar na lista do que falta
    return /[A-Za-zÀ-ú]{2,}/.test(parte) ? T(parte, /\d/.test(parte)) : parte;
  }).join('');
}

/* Traduz uma lista ou objeto de dados inteiro (todos os textos).
   "manter" = nomes de campos que NÃO são texto para a pessoa ler
   (ex.: id, icone, categoria). */
function traduzirTudo(dado, manter) {
  if (IDIOMA !== 'en') return dado;
  manter = manter || [];
  if (typeof dado === 'string') return T(dado);
  if (Array.isArray(dado)) {
    for (var i = 0; i < dado.length; i++) dado[i] = traduzirTudo(dado[i], manter);
    return dado;
  }
  if (dado && typeof dado === 'object') {
    Object.keys(dado).forEach(function (campo) {
      if (manter.indexOf(campo) < 0) dado[campo] = traduzirTudo(dado[campo], manter);
    });
  }
  return dado;
}

/* Pastas e páginas que mudam de nome no inglês */
var PASTAS = IDIOMA === 'en'
  ? { servicos: 'services/', alertas: 'alerts/', listaAlertas: 'alerts.html', privacidade: 'privacy.html' }
  : { servicos: 'servicos/', alertas: 'alertas/', listaAlertas: 'alertas.html', privacidade: 'privacidade.html' };

var CONFIG = {
  // Número do WhatsApp: só números, com 55 (Brasil) + DDD.
  whatsapp: '5581991195082',

  // Como o número aparece escrito na tela.
  whatsappFormatado: '(81) 99119-5082',

  // Mensagem padrão dos botões gerais de WhatsApp.
  mensagemPadrao: T('Olá! Vim pelo site da Vestígio e gostaria de atendimento.'),

  // Mensagem dos botões de cada serviço. O nome do serviço
  // entra no lugar de {servico}.
  mensagemServico: T('Olá! Vim pelo site da Vestígio e gostaria de atendimento sobre: {servico}.'),

  // Mensagem do botão "Casos urgentes" (fora do horário).
  mensagemUrgente: T('Olá! Vim pelo site da Vestígio. Tenho um caso urgente e preciso de atendimento fora do horário.'),

  // E-mail de contato (aparece no contato, no rodapé e na política de privacidade).
  email: 'contato@vestigio.app.br',

  // Horário de atendimento (o texto que aparece na tela).
  // Mudou o horário? Mude também HORARIO em js/atendimento.js.
  horario: T('Segunda a sexta, das 8h às 23h30. Sábado e domingo, das 8h às 18h'),
  local: T('Sede em Recife/PE. Atendimento online em todo o Brasil.'),

  // Instagram (só o nome do perfil, sem o @).
  instagram: 'vestigio.br',

  // TEXTURA ANIMADA DO FUNDO (pontos que acendem formando um
  // rastro, brilho lento e granulado). Arquivos: js/textura-fundo.js
  // e css/textura-fundo.css.
  // true  = ligada
  // false = desligada (o fundo volta a ser como era antes)
  texturaFundo: true,

  // INTERRUPTOR DAS ANIMAÇÕES
  // true  = mostra as animações para todo mundo (ignora o
  //         "reduzir movimento" do sistema)
  // false = respeita o "reduzir movimento" do sistema
  // ATENÇÃO: o script do <head> do index.html repete esta regra
  // (ele roda antes deste arquivo). Se mudar aqui, mude lá também.
  animacoesSempre: true
};

/* RITMO DAS ANIMAÇÕES (um lugar só para todo o site)
   As mesmas curvas e durações do CSS (css/variables.css, parte
   "ANIMAÇÃO"). Todos os arquivos de animação usam daqui, para
   tudo ter o mesmo "jeito" de se mover. */
var RITMO = {
  suave: [0.23, 1, 0.32, 1],       // = --ease-out: entradas e respostas (a curva principal)
  fluida: [0.32, 0.72, 0, 1],      // = --ease-fluid: painéis, gavetas e o topo da página
  acelera: [0.32, 0, 0.67, 0],     // começa devagar: algo SAINDO de cena
  mola: [0.34, 1.56, 0.64, 1],     // passa um pouco do ponto e volta (ícones, selos)
  rapido: 0.22,                    // = --dur-fast: trocas pequenas
  medio: 0.38,                     // = --dur-base: hover, aparecer/sumir
  entrada: 0.7                     // = --dur-slow: entradas de bloco
};

/* Desfoque (blur) animado pesa no celular: lá ele fica desligado
   e as entradas usam só movimento e transparência. */
function podeDesfocar() {
  return window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;
}

/* Função central: TODOS os arquivos perguntam aqui se devem
   reduzir o movimento, em vez de olhar o sistema direto.
   Devolve true só se o interruptor estiver em false E o
   sistema pedir "reduzir movimento". */
function reduzirMovimento() {
  if (CONFIG.animacoesSempre) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Monta o link do WhatsApp com a mensagem já escrita.
   encodeURIComponent troca espaços e acentos por códigos
   que funcionam dentro de um link. */
function linkWhatsApp(mensagem) {
  var texto = mensagem || CONFIG.mensagemPadrao;
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(texto);
}

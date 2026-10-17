/* =========================================================
   CONFIGURAÇÃO GERAL DO SITE
   ---------------------------------------------------------
   Este é o ÚNICO lugar onde ficam o WhatsApp, o e-mail e
   os dados de contato. Todos os botões e textos do site
   leem daqui. Mudou o número? Mude só aqui.
   ========================================================= */

var CONFIG = {
  // Número do WhatsApp: só números, com 55 (Brasil) + DDD.
  // (Número de teste. Trocar pelo número oficial.)
  whatsapp: '5581992183600',

  // Como o número aparece escrito na tela.
  whatsappFormatado: '(81) 99218-3600',

  // Mensagem padrão dos botões gerais de WhatsApp.
  mensagemPadrao: 'Olá! Vim pelo site da Vestígio e gostaria de atendimento.',

  // Mensagem dos botões de cada serviço. O nome do serviço
  // entra no lugar de {servico}.
  mensagemServico: 'Olá! Vim pelo site da Vestígio e gostaria de atendimento sobre: {servico}.',

  // Mensagem do botão "Casos urgentes" (fora do horário).
  mensagemUrgente: 'Olá! Vim pelo site da Vestígio. Tenho um caso urgente e preciso de atendimento fora do horário.',

  // E-mail de contato (aparece no contato, no rodapé e na política de privacidade).
  email: 'contato.vestigioo@gmail.com',

  // Horário de atendimento (definitivo).
  horario: 'Segunda a sexta, das 9h às 18h',
  local: 'Sede em Recife/PE. Atendimento online em todo o Brasil.',

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

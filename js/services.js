/* =========================================================
   SERVIÇOS
   ---------------------------------------------------------
   Os cards e os painéis de detalhe são gerados a partir
   desta lista. Para adicionar, remover ou editar um serviço,
   mexa só neste arquivo.

   CATEGORIAS: cada uma vira uma aba na seção de serviços.
   SERVICOS: cada objeto vira um card. Campos:
     id           identificador único, sem espaço nem acento
     categoria    o "id" de uma das categorias abaixo
     icone        nome de um ícone do arquivo js/icons.js
     nome         título do serviço
     resumo       frase curta que aparece no card
     oQueE        explicação simples (aparece no detalhe)
     comoFunciona lista de 3 ou 4 passos curtos
     precisamos   lista do que pedimos ao cliente
     aviso        (opcional) observação importante extra
     palavrasChave lista de palavras que a BUSCA ("Digite o que
                  aconteceu") também procura, além do nome e do
                  resumo. Escreva como as pessoas falam: "pix",
                  "número novo", "conta hackeada"... Acentos e
                  maiúsculas não importam.
     pagina       (opcional) nome do arquivo da página do serviço,
                  sem ".html". Se não tiver, é criado a partir do
                  nome (ex.: "Golpe do Pix falso" vira
                  servicos/golpe-do-pix-falso.html).

   Mudou algo aqui? Rode "node ferramentas/gerar-paginas.js"
   para atualizar as páginas da pasta servicos/ (veja o README).

   Atenção às vírgulas: cada item da lista termina com
   vírgula, menos o último.
   ========================================================= */

var CATEGORIAS = [
  { id: 'localizacao', nome: 'Investigação e localização' },
  { id: 'redes', nome: 'Redes sociais' },
  { id: 'estelionato', nome: 'Estelionato digital' },
  { id: 'recuperacao', nome: 'Recuperação e suporte jurídico' },
  { id: 'privacidade', nome: 'Privacidade' }
];

var SERVICOS = [
  /* ---------- INVESTIGAÇÃO E LOCALIZAÇÃO ---------- */
  {
    id: 'email-falso',
    categoria: 'localizacao',
    icone: 'mail-warning',
    nome: 'E-mail falso',
    resumo: 'E-mails que se passam por bancos, empresas ou pessoas para enganar ou ameaçar.',
    palavrasChave: ['e-mail', 'email', 'phishing', 'link suspeito', 'anexo', 'banco', 'remetente', 'ameaça', 'chantagem', 'e-mail anônimo', 'cabeçalho', 'spam'],
    oQueE: 'Mensagens que imitam bancos, empresas, órgãos públicos ou alguém conhecido para pedir pagamentos, dados ou cliques em links. Também cobre e-mails anônimos com ameaças, chantagem ou difamação. O cabeçalho técnico de um e-mail guarda pistas importantes sobre a sua origem.',
    comoFunciona: [
      'Analisamos o cabeçalho técnico e os servidores de envio.',
      'Verificamos domínios, links e anexos sem colocar você em risco.',
      'Cruzamos endereços e domínios com outras ocorrências.',
      'Entregamos um relatório técnico com as evidências encontradas.'
    ],
    precisamos: [
      'O e-mail original encaminhado como anexo ou o código-fonte da mensagem (explicamos como fazer)',
      'Prints da mensagem',
      'Links e anexos citados (não abra novamente)',
      'Data de recebimento',
      'O que aconteceu depois: se você pagou, clicou ou respondeu',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'telefones-emails-enderecos',
    categoria: 'localizacao',
    icone: 'contact-round',
    nome: 'Linhas telefônicas, e‑mails e endereços', // o hífen de "e‑mails" é especial: não deixa a palavra quebrar no meio
    resumo: 'Levantamento lícito de informações sobre números, e-mails e endereços ligados a um caso.',
    palavrasChave: ['telefone', 'número', 'celular', 'linha', 'operadora', 'e-mail', 'endereço', 'de quem é esse número', 'titular', 'chip', 'dados'],
    oQueE: 'Quando um número de telefone, um e-mail ou um endereço aparece em um golpe, uma ameaça ou um processo, investigamos o que fontes abertas e bases de acesso lícito revelam sobre ele: a quem pode estar ligado, onde já foi usado e que outros dados se conectam a ele. Dados protegidos por sigilo, como registros de ligações, só podem ser obtidos por ordem judicial. Nesses casos, orientamos o pedido pelo caminho correto.',
    comoFunciona: [
      'Entendemos o caso e a finalidade legítima da pesquisa.',
      'Consultamos fontes abertas e bases de acesso lícito.',
      'Cruzamos e validamos as informações encontradas.',
      'Entregamos um relatório com a fonte e o grau de confiança de cada dado.'
    ],
    precisamos: [
      'Os números, e-mails ou endereços a investigar',
      'O contexto: onde e como eles apareceram',
      'Prints ou documentos em que eles aparecem',
      'A finalidade da investigação (processo, boletim etc.)',
      'Número do processo, se houver'
    ]
  },
  {
    id: 'localizacao-pessoas',
    categoria: 'localizacao',
    icone: 'user-search',
    nome: 'Localização de pessoas',
    resumo: 'Busca de paradeiro para citação judicial, cobrança, reencontro e outros fins legítimos.',
    palavrasChave: ['localizar pessoa', 'paradeiro', 'encontrar alguém', 'achar pessoa', 'endereço atual', 'citação', 'processo', 'devedor', 'parente', 'reencontro', 'família', 'pessoa sumida'],
    oQueE: 'Buscamos o paradeiro atual de uma pessoa a partir do que você já sabe, usando fontes abertas e bases de acesso lícito. É muito usado para citação em processos, cobrança de dívidas e reencontro de familiares. Cada pedido passa por análise, e não fazemos buscas com fins de perseguição ou que possam colocar alguém em risco.',
    comoFunciona: [
      'Analisamos o pedido e a finalidade da busca.',
      'Reunimos os dados conhecidos e realizamos as pesquisas necessárias para a localização da pessoa.',
      'Validamos os endereços e contatos encontrados.',
      'Entregamos um relatório com as informações e suas fontes.'
    ],
    precisamos: [
      'CPF, se tiver',
      'Data de nascimento ou idade aproximada',
      'Últimos endereços, cidades e telefones conhecidos',
      'Nomes de parentes, empresa ou local de trabalho, se souber',
      'O motivo da busca e o número do processo, se houver'
    ]
  },
  {
    id: 'bens-devedor',
    categoria: 'localizacao',
    icone: 'landmark',
    nome: 'Busca de bens de devedor judicial',
    resumo: 'Imóveis, veículos, empresas e outros bens para a execução de sentença.',
    palavrasChave: ['bens', 'devedor', 'dívida', 'penhora', 'execução', 'sentença', 'imóvel', 'veículo', 'patrimônio', 'empresa', 'cobrança', 'processo', 'advogado'],
    oQueE: 'Você ganhou a ação, mas o devedor diz que não tem nada em nome dele? Fazemos um levantamento de bens que podem ser indicados ao juiz para penhora: imóveis, veículos, empresas, participações em sociedades e sinais de patrimônio ocultado em nome de terceiros. O relatório é preparado para o seu advogado usar no processo.',
    comoFunciona: [
      'Analisamos o processo e os dados do devedor.',
      'Pesquisamos registros públicos, empresas e vínculos patrimoniais.',
      'Identificamos indícios de bens em nome de terceiros.',
      'Entregamos um relatório técnico para instruir os pedidos de penhora.'
    ],
    precisamos: [
      'Número do processo (cumprimento ou execução de sentença)',
      'Nome completo e CPF do devedor (ou, se for empresa, o número de cadastro dela)',
      'Cópia da sentença ou da decisão',
      'Valor atualizado da dívida',
      'Endereços, empresas e bens que você já conhece',
      'Contato do seu advogado, se tiver'
    ]
  },
  {
    id: 'sites-falsos',
    categoria: 'localizacao',
    icone: 'browser-alert',
    nome: 'Investigação em sites falsos',
    resumo: 'Lojas falsas, páginas que imitam bancos e empresas e links de pagamento falsos.',
    palavrasChave: ['site falso', 'loja falsa', 'link falso', 'página clonada', 'comprei num site', 'phishing', 'site clonado', 'loja online', 'produto não chegou', 'link de pagamento', 'domínio', 'anúncio patrocinado'],
    oQueE: 'Sites e lojas virtuais criados só para enganar: vendem produtos que nunca chegam, imitam a página de bancos e empresas conhecidas para roubar dados ou geram links de pagamento falsos. Por trás de cada site existem registros que deixam rastro: o domínio, a hospedagem, a forma de pagamento e os perfis ligados a ele. Investigamos quem está por trás e organizamos as provas.',
    comoFunciona: [
      'Registramos o site, as páginas e os anúncios antes que saiam do ar.',
      'Analisamos domínio, hospedagem, certificados e sites parecidos ligados a ele.',
      'Rastreamos as contas de pagamento e os perfis usados para divulgar o site, em fontes lícitas.',
      'Entregamos um relatório técnico com as provas organizadas para o boletim de ocorrência e as medidas jurídicas.'
    ],
    precisamos: [
      'Endereço (link) do site ou da página, mesmo que já tenha saído do ar',
      'Prints das páginas, do produto e do carrinho de compras',
      'Comprovantes de pagamento (Pix, boleto, cartão)',
      'E-mails, mensagens ou SMS de confirmação que você recebeu',
      'Onde você encontrou o site (anúncio, rede social, busca)',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },

  /* ---------- REDES SOCIAIS ---------- */
  {
    id: 'instagram',
    categoria: 'redes',
    icone: 'camera',
    nome: 'Instagram',
    resumo: 'Perfis falsos, contas invadidas, lojas falsas e ataques à sua reputação.',
    pagina: 'investigacao-no-instagram',
    palavrasChave: ['instagram', 'perfil falso', 'conta invadida', 'conta hackeada', 'hackearam', 'loja falsa', 'seguidores', 'stories', 'direct', 'fake', 'ameaça', 'exposição', 'investimento'],
    oQueE: 'Investigamos perfis falsos que usam seu nome ou suas fotos, lojas que vendem e não entregam, contas invadidas que passaram a pedir dinheiro aos seus seguidores, ameaças, perseguição e exposição indevida. O objetivo é preservar as provas antes que sumam e buscar identificar quem está por trás da conta.',
    comoFunciona: [
      'Preservamos as provas: perfil, publicações, stories e mensagens.',
      'Analisamos o perfil, seus vínculos e seus padrões de uso.',
      'Buscamos identificar o responsável por meio de fontes abertas e lícitas.',
      'Orientamos a denúncia à plataforma e os próximos passos jurídicos.'
    ],
    precisamos: [
      'Link e @ do perfil investigado',
      'Prints de publicações, stories e mensagens, com a data visível',
      'Links de publicações específicas',
      'Se a conta invadida for sua: o e-mail e o telefone que estavam vinculados a ela',
      'Um relato de quando e como tudo começou',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'whatsapp',
    categoria: 'redes',
    icone: 'message-circle',
    nome: 'WhatsApp',
    resumo: 'Clonagem, falso parente com número novo, extorsão e ameaças.',
    pagina: 'golpes-no-whatsapp',
    palavrasChave: ['whatsapp', 'zap', 'número novo', 'troquei de número', 'clonado', 'clonagem', 'filho', 'filha', 'mãe', 'pai', 'parente', 'código de verificação', 'extorsão', 'ameaça', 'chantagem'],
    oQueE: 'Inclui o golpe do número novo (alguém finge ser um parente e pede dinheiro), contas clonadas, mensagens de ameaça ou extorsão e grupos usados para aplicar golpes. Trabalhamos a partir das conversas e dos números envolvidos para preservar as provas e buscar a identificação dos responsáveis.',
    comoFunciona: [
      'Preservamos as conversas de forma organizada e com data.',
      'Analisamos os números, as fotos de perfil e as contas de pagamento.',
      'Cruzamos as informações com outras fontes abertas.',
      'Entregamos um relatório para o boletim de ocorrência e a ação judicial.'
    ],
    precisamos: [
      'A conversa exportada pelo próprio WhatsApp (opção "Exportar conversa")',
      'Prints das mensagens com o número visível',
      'Os números de telefone envolvidos',
      'Comprovantes dos pagamentos feitos, se houver',
      'Datas e horários aproximados',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'facebook',
    categoria: 'redes',
    icone: 'users-round',
    nome: 'Facebook',
    resumo: 'Perfis e páginas falsas, grupos de golpe, anúncios enganosos e difamação.',
    pagina: 'investigacao-no-facebook',
    palavrasChave: ['facebook', 'perfil falso', 'página falsa', 'grupo', 'anúncio patrocinado', 'marketplace', 'messenger', 'difamação', 'comentário', 'perseguição', 'conta invadida'],
    oQueE: 'No Facebook são comuns páginas que imitam empresas, anúncios patrocinados de produtos que não existem, perfis falsos e grupos de compra e venda usados para golpes. Também atuamos em casos de difamação e perseguição.',
    comoFunciona: [
      'Registramos perfis, páginas, anúncios e comentários antes que sumam.',
      'Analisamos os vínculos entre perfis, páginas e contas de pagamento.',
      'Buscamos identificar os responsáveis por meio de fontes abertas e lícitas.',
      'Orientamos a denúncia à plataforma e as medidas legais.'
    ],
    precisamos: [
      'Link do perfil, da página, do grupo ou do anúncio',
      'Prints com a data visível',
      'Mensagens trocadas pelo Messenger',
      'Comprovantes de pagamento, se houver',
      'Contato de outras vítimas ou testemunhas, se conhecer',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },

  /* ---------- ESTELIONATO DIGITAL ---------- */
  {
    id: 'golpe-do-amor',
    categoria: 'estelionato',
    icone: 'heart-crack',
    nome: 'Golpe do amor',
    resumo: 'Relacionamentos virtuais criados para pedir dinheiro, presentes ou empréstimos.',
    palavrasChave: ['namoro', 'namorado', 'namorada', 'relacionamento', 'aplicativo de namoro', 'romance', 'paixão', 'amor', 'estrangeiro', 'militar', 'presente retido', 'taxa da alfândega', 'empréstimo', 'nunca vi pessoalmente'],
    oQueE: 'Alguém se aproxima pelas redes sociais ou por aplicativos de namoro, cria uma relação de confiança e afeto e, com o tempo, começa a pedir dinheiro: uma emergência, uma viagem, uma taxa para liberar um presente. Os perfis costumam usar fotos de outras pessoas e histórias bem ensaiadas. Cair nesse golpe não é ingenuidade. Ele é feito justamente para explorar sentimentos verdadeiros.',
    comoFunciona: [
      'Ouvimos sua história e analisamos as conversas e os pagamentos feitos.',
      'Verificamos a origem das fotos e cruzamos os perfis, números e contas usados.',
      'Buscamos identificar quem está por trás do perfil e para onde o dinheiro foi.',
      'Entregamos um relatório organizado para o boletim de ocorrência e as medidas jurídicas.'
    ],
    precisamos: [
      'As conversas, do primeiro ao último contato (se foram pelo WhatsApp, use a opção "Exportar conversa"; nas outras redes, prints)',
      'Links ou @ dos perfis usados pela pessoa',
      'Fotos que ela enviou (os arquivos, se possível)',
      'Comprovantes de Pix, transferências ou depósitos',
      'Datas aproximadas e o valor total enviado',
      'Números de telefone e e-mails usados por ela',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'golpe-olx',
    categoria: 'estelionato',
    icone: 'shopping-bag',
    nome: 'Golpe da OLX',
    resumo: 'Anúncios falsos, links de pagamento falsos e falsos compradores em sites de venda.',
    palavrasChave: ['olx', 'marketplace', 'anúncio', 'compra', 'venda', 'vendedor', 'comprador', 'produto não chegou', 'link de pagamento', 'frete', 'site de vendas', 'usado', 'entrega combinada'],
    oQueE: 'Acontece em sites e aplicativos de compra e venda. Como comprador, você paga por um produto que nunca chega. Como vendedor, recebe um comprovante falso ou um link que imita a plataforma e pede seus dados bancários. Quase sempre a conversa sai do aplicativo e vai para o WhatsApp, justamente para escapar da proteção da plataforma.',
    comoFunciona: [
      'Analisamos o anúncio, a conversa e o caminho do pagamento.',
      'Verificamos links, sites falsos e as contas que receberam o dinheiro.',
      'Cruzamos os dados do anunciante com outros perfis e ocorrências.',
      'Organizamos as provas para a plataforma, o banco e a polícia.'
    ],
    precisamos: [
      'Link ou print do anúncio (mesmo que já tenha saído do ar)',
      'Prints da conversa no aplicativo',
      'A conversa do WhatsApp, pela opção "Exportar conversa"',
      'Links recebidos por mensagem ou e-mail',
      'Comprovante de pagamento e dados da conta que recebeu',
      'Nome de usuário do anunciante na plataforma',
      'Data da negociação e valor',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'entrega-falsa',
    categoria: 'estelionato',
    icone: 'package-x',
    nome: 'Golpe da entrega falsa',
    resumo: 'Mensagens de encomenda retida ou taxa de entrega que levam a pagamentos falsos.',
    palavrasChave: ['encomenda', 'correios', 'entrega', 'taxa de entrega', 'rastreio', 'rastreamento', 'pacote retido', 'imposto', 'alfândega', 'sms', 'transportadora', 'frete', 'link'],
    oQueE: 'Você recebe um SMS, e-mail ou mensagem dizendo que uma encomenda está retida ou que falta pagar uma taxa, frete ou imposto. O link leva a uma página que imita os Correios ou uma transportadora e cobra um valor por Pix ou cartão. Muitas vezes a página também guarda os dados do cartão para compras futuras.',
    comoFunciona: [
      'Analisamos a mensagem, o link e a página falsa.',
      'Rastreamos o domínio, a hospedagem e a conta que recebeu o pagamento.',
      'Orientamos o contato com o banco ou a operadora do cartão.',
      'Reunimos tudo em relatório para o registro e o pedido de ressarcimento.'
    ],
    precisamos: [
      'Print da mensagem recebida, com o número ou e-mail de quem enviou',
      'O link recebido, copiado como texto (não abra de novo)',
      'Prints da página onde você pagou',
      'Comprovante do Pix ou fatura do cartão com a cobrança',
      'Data e horário do pagamento',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'falso-leilao',
    categoria: 'estelionato',
    icone: 'gavel',
    nome: 'Golpe do falso leilão',
    resumo: 'Sites de leilão falsos que vendem veículos e bens que não existem.',
    palavrasChave: ['leilão', 'leiloeiro', 'carro', 'moto', 'veículo', 'imóvel', 'arremate', 'lote', 'edital', 'site falso', 'preço abaixo da tabela', 'barato demais'],
    oQueE: 'Sites muito parecidos com os de leiloeiros reais anunciam carros, motos e imóveis abaixo do preço. Depois do arremate, pedem pagamento rápido por Pix ou boleto para garantir o lote. O bem nunca é entregue e o site some ou muda de endereço. É comum usarem o nome e o registro de leiloeiros verdadeiros.',
    comoFunciona: [
      'Analisamos o site, o lote e os documentos que você recebeu.',
      'Verificamos o domínio, os registros e quem recebeu os valores.',
      'Comparamos com leiloeiros oficiais e outras vítimas do mesmo site.',
      'Preparamos um relatório para a polícia e as medidas de recuperação.'
    ],
    precisamos: [
      'Endereço do site e prints das páginas do lote',
      'Edital, contrato ou nota de arremate recebidos',
      'Comprovantes de pagamento (Pix, boleto ou TED)',
      'E-mails e mensagens trocados com o suposto leiloeiro',
      'Nome da empresa e número de cadastro que aparecem no site ou no boleto',
      'Data do arremate e valores pagos',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'golpe-boleto',
    categoria: 'estelionato',
    icone: 'barcode',
    nome: 'Golpe do boleto',
    resumo: 'Boletos adulterados ou falsos que desviam o pagamento para outra conta.',
    palavrasChave: ['boleto', 'código de barras', 'segunda via', 'fatura', 'conta', 'pagamento', 'beneficiário', 'financiamento', 'condomínio', 'mensalidade', 'e-mail', 'cobrança'],
    oQueE: 'O boleto parece legítimo, com a marca da empresa e o valor certo, mas o código de barras foi trocado e o dinheiro vai para outra pessoa. Ele pode chegar por e-mail, WhatsApp, por um site falso ou até por um vírus que altera o boleto no seu computador. Você só descobre quando a cobrança verdadeira continua em aberto.',
    comoFunciona: [
      'Comparamos o boleto pago com o boleto verdadeiro.',
      'Identificamos o banco e o beneficiário que realmente receberam.',
      'Verificamos por onde o boleto falso chegou até você.',
      'Organizamos as provas para o banco, a empresa credora e a polícia.'
    ],
    precisamos: [
      'O boleto pago (PDF ou foto)',
      'O boleto verdadeiro ou a cobrança original, se tiver',
      'Comprovante de pagamento',
      'O e-mail, a mensagem ou o site de onde veio o boleto',
      'Data do pagamento',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },
  {
    id: 'pix-falso',
    categoria: 'estelionato',
    icone: 'banknote-x',
    nome: 'Golpe do Pix falso',
    resumo: 'Comprovantes editados, Pix agendado e cancelado e pedidos de devolução indevida.',
    palavrasChave: ['pix', 'comprovante', 'comprovante falso', 'agendado', 'cancelado', 'devolução', 'transferência', 'pix errado', 'caiu por engano', 'med', 'chave pix'],
    oQueE: 'As variações mais comuns: o comprador envia um comprovante editado de um Pix que nunca caiu; agenda um Pix e cancela depois de receber o produto; ou alguém diz que mandou um Pix por engano e pede a devolução para outra conta. Em todos os casos, o dinheiro não existe ou volta para o golpista.',
    comoFunciona: [
      'Conferimos o comprovante recebido e o extrato da sua conta.',
      'Identificamos a chave Pix e as instituições envolvidas.',
      'Orientamos o pedido de devolução pelo MED junto ao seu banco.',
      'Reunimos as provas em relatório para o boletim e uma possível ação judicial.'
    ],
    precisamos: [
      'O comprovante Pix recebido (arquivo ou print original)',
      'Extrato da sua conta no período',
      'Chave Pix, nome e banco que aparecem na transação',
      'A conversa com a pessoa (se foi pelo WhatsApp, use a opção "Exportar conversa"; nas outras redes, prints)',
      'Data, horário e valor',
      'Protocolo do atendimento no seu banco, se já tiver aberto',
      'Boletim de ocorrência, se já tiver registrado'
    ]
  },

  /* ---------- RECUPERAÇÃO E SUPORTE JURÍDICO ---------- */
  {
    id: 'danos-morais',
    categoria: 'recuperacao',
    icone: 'scale',
    nome: 'Indenização por danos morais',
    resumo: 'Ação para buscar reparação quando o golpe ou a exposição causou dano real a você.',
    palavrasChave: ['danos morais', 'indenização', 'processo', 'justiça', 'exposição', 'humilhação', 'reputação', 'constrangimento', 'vazamento', 'advogado', 'reparação'],
    oQueE: 'Golpes, vazamentos, perfis falsos e exposição na internet podem causar sofrimento, constrangimento e prejuízo à sua imagem. Em muitos casos é possível pedir na Justiça uma indenização por danos morais contra o responsável e, dependendo do caso, contra empresas ou bancos que falharam na segurança. A ação é conduzida por advogado parceiro inscrito na OAB.',
    comoFunciona: [
      'Avaliamos o caso e as provas disponíveis.',
      'Complementamos a investigação, se for necessário.',
      'O advogado parceiro analisa a viabilidade e explica riscos e custos.',
      'Acompanhamos o processo e mantemos você informado.'
    ],
    precisamos: [
      'Um relato do que aconteceu e de como isso afetou você',
      'Provas: prints, links, publicações e conversas (as do WhatsApp, pela opção "Exportar conversa")',
      'Comprovantes de prejuízos financeiros, se houver',
      'Atestados ou laudos, se houve impacto na sua saúde',
      'Boletim de ocorrência',
      'Documento de identidade e comprovante de residência'
    ]
  },
  {
    id: 'recuperacao-administrativa',
    categoria: 'recuperacao',
    icone: 'receipt-text',
    nome: 'Recuperação de valores pela via administrativa',
    resumo: 'Pedidos a bancos, plataformas e instituições, sem precisar de processo.',
    palavrasChave: ['recuperar dinheiro', 'devolução', 'med', 'estorno', 'contestação', 'cartão', 'banco', 'reclamação', 'procon', 'ouvidoria', 'pix'],
    oQueE: 'Antes da Justiça existem caminhos administrativos: o MED do Pix (Mecanismo Especial de Devolução), a contestação de compras no cartão e reclamações formais ao banco, à plataforma e aos órgãos de defesa do consumidor. Quanto mais rápido, maiores as chances. Ajudamos a montar pedidos bem fundamentados e acompanhamos as respostas.',
    comoFunciona: [
      'Verificamos quais caminhos estão disponíveis para o seu caso.',
      'Organizamos as provas e redigimos os pedidos.',
      'Protocolamos junto ao banco, à plataforma ou ao órgão competente.',
      'Acompanhamos as respostas e orientamos o próximo passo.'
    ],
    precisamos: [
      'Comprovantes de pagamento (Pix, TED, boleto ou cartão)',
      'Extrato ou fatura do período',
      'Protocolos de atendimento que você já abriu',
      'As conversas com o golpista (se foram pelo WhatsApp, use a opção "Exportar conversa"; nas outras redes, prints)',
      'Boletim de ocorrência',
      'Documento de identidade'
    ],
    aviso: 'A devolução depende da análise de cada instituição e não é garantida.'
  },
  {
    id: 'recuperacao-judicial',
    categoria: 'recuperacao',
    icone: 'file-badge',
    nome: 'Recuperação de valores pela via judicial',
    resumo: 'Ação na Justiça para buscar a devolução do dinheiro, com pedido de bloqueio de contas.',
    palavrasChave: ['recuperar dinheiro', 'processo', 'ação judicial', 'bloqueio de conta', 'bloqueio judicial', 'justiça', 'advogado', 'devolução', 'golpista identificado'],
    oQueE: 'Quando a via administrativa não resolve, é possível entrar com uma ação contra o golpista identificado e, em alguns casos, contra instituições que falharam. O juiz pode determinar o bloqueio de valores nas contas que receberam o dinheiro. A ação é conduzida por advogado parceiro inscrito na OAB.',
    comoFunciona: [
      'Reunimos e organizamos as provas da investigação.',
      'O advogado parceiro avalia a viabilidade e propõe a estratégia.',
      'Entramos com a ação e com os pedidos de bloqueio cabíveis.',
      'Acompanhamos o processo até a decisão final.'
    ],
    precisamos: [
      'Comprovantes de todos os pagamentos',
      'Dados das contas que receberam (nome, banco, chave Pix)',
      'Respostas do banco ou da plataforma, se houver',
      'Boletim de ocorrência',
      'Relatório de investigação, se já tiver sido feito',
      'Documento de identidade e comprovante de residência'
    ],
    aviso: 'O resultado depende de cada caso e da decisão judicial. Não há garantia de recuperação.'
  },
  {
    id: 'acompanhamento-delegacia',
    categoria: 'recuperacao',
    icone: 'siren',
    nome: 'Acompanhamento em delegacias',
    resumo: 'Apoio no registro do boletim de ocorrência e no andamento do inquérito.',
    palavrasChave: ['delegacia', 'boletim de ocorrência', 'b.o.', 'polícia', 'inquérito', 'queixa', 'denúncia', 'delegacia online', 'crimes cibernéticos', 'registro'],
    oQueE: 'Registrar um boletim de ocorrência de crime digital pode ser confuso, e um registro incompleto atrapalha a investigação. Ajudamos a preparar o relato e as provas, acompanhamos você na delegacia quando necessário e seguimos o andamento do inquérito, levando à autoridade as informações que reunimos.',
    comoFunciona: [
      'Organizamos o relato e as provas antes do registro.',
      'Indicamos a delegacia adequada, inclusive as especializadas.',
      'Acompanhamos o registro presencial ou orientamos o registro online.',
      'Seguimos o andamento e entregamos novas provas à autoridade.'
    ],
    precisamos: [
      'Seu relato dos fatos, na ordem em que aconteceram',
      'Prints, comprovantes e links que você já reuniu',
      'Documento de identidade',
      'Número do boletim, se já tiver registrado',
      'A cidade onde você mora e onde o fato aconteceu'
    ]
  },

  /* ---------- PRIVACIDADE ---------- */
  {
    id: 'exclusao-dados',
    categoria: 'privacidade',
    icone: 'eraser',
    nome: 'Possível exclusão de dados pessoais da internet',
    resumo: 'Pedidos de remoção de dados, fotos e informações sensíveis expostas, com base na LGPD.',
    palavrasChave: ['apagar dados', 'remover', 'excluir', 'dados expostos', 'vazamento', 'cpf exposto', 'fotos íntimas', 'google', 'desindexar', 'lgpd', 'privacidade', 'exposição'],
    oQueE: 'Seus dados, fotos ou informações sensíveis estão expostos em sites, buscadores, redes sociais ou listas vazadas? Mapeamos onde eles aparecem e fazemos os pedidos de remoção ou de desindexação com base na LGPD e nas regras de cada plataforma. Quando necessário, o caminho judicial é avaliado pelo advogado parceiro.',
    comoFunciona: [
      'Mapeamos onde os seus dados aparecem.',
      'Classificamos o que pode ser pedido e por qual caminho.',
      'Enviamos os pedidos de remoção e de desindexação.',
      'Acompanhamos as respostas e informamos o que foi removido.'
    ],
    precisamos: [
      'Links das páginas onde seus dados aparecem',
      'Prints dessas páginas',
      'Quais dados você quer remover (endereço, CPF, fotos etc.)',
      'Documento de identidade, para comprovar que os dados são seus',
      'O contexto da exposição, se souber (vazamento, perfil falso, vingança)'
    ],
    aviso: 'A exclusão depende da análise do caso e da resposta de cada site ou plataforma. Não é garantida.'
  }
];

/* =========================================================
   ENDEREÇO DA PÁGINA DE CADA SERVIÇO
   Usado pelo site (menu, painel de detalhe) e pelo script
   ferramentas/gerar-paginas.js, que cria as páginas.
   Exemplo: paginaDoServico(servico) devolve
   "golpe-do-pix-falso.html" (a página fica na pasta servicos/).
   ========================================================= */
/* Inglês: traduz os textos (dicionário em js/en/textos.js) e usa
   os nomes de página e as palavras da busca em inglês. */
traduzirTudo(CATEGORIAS, ['id']);
traduzirTudo(SERVICOS, ['id', 'categoria', 'icone', 'pagina', 'palavrasChave']);
if (IDIOMA === 'en' && typeof PAGINAS_EN !== 'undefined') {
  SERVICOS.forEach(function (s) {
    if (PAGINAS_EN.servicos[s.id]) s.pagina = PAGINAS_EN.servicos[s.id];
    if (PALAVRAS_EN[s.id]) s.palavrasChave = PALAVRAS_EN[s.id];
  });
}

function paginaDoServico(servico) {
  if (servico.pagina) return servico.pagina + '.html';
  var nome = servico.nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // tira os acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')                        // o que não é letra/número vira "-"
    .replace(/^-+|-+$/g, '');                           // tira "-" do começo e do fim
  return nome + '.html';
}

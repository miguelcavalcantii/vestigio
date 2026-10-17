# Vestígio · Investigação Digital (rascunho do site)

Site feito com **HTML, CSS e JavaScript puro**. Não precisa instalar nada: dê dois
cliques no `index.html` e ele abre no navegador (funciona até offline).
As páginas de serviços e de alertas são criadas por um script (veja "Versão 3.0").

## Estrutura

```
vestigio-site/
├── index.html            página principal (todas as seções)
├── privacidade.html      política de privacidade (provisória)
├── alertas.html          lista de alertas (GERADA pelo script)
├── servicos/             uma página por serviço (GERADAS pelo script)
├── alertas/              uma página por alerta (GERADAS pelo script)
├── sitemap.xml           mapa do site para o Google (GERADO)
├── robots.txt            avisa o Google onde está o mapa (GERADO)
├── ferramentas/
│   ├── gerar-paginas.js  script que cria as páginas acima
│   └── modelos/          modelos (templates) dessas páginas
├── css/
│   ├── fonts.css         fontes embutidas (não precisa mexer)
│   ├── variables.css     CORES, fontes, espaçamentos, animações
│   ├── base.css          regras gerais (texto, links, foco do teclado)
│   ├── components.css    botões, abas, cards, painel, menu, acordeão
│   ├── sections.css      layout de cada seção, na ordem da página
│   ├── ferramentas.css   menu de serviços, busca, painéis, verificador, montador
│   └── paginas.css       páginas de serviço e de alertas
├── js/
│   ├── config.js         WHATSAPP, e-mail, horário, mensagens
│   ├── services.js       LISTA DE SERVIÇOS, categorias e PALAVRAS DA BUSCA
│   ├── alertas.js        LISTA DE ALERTAS
│   ├── icons.js          desenhos dos ícones (Lucide)
│   ├── components.js     monta cards/abas, painéis, menu, acordeão
│   ├── animations.js     animações de entrada e rolagem
│   ├── interacoes.js     gelatina, bordas que acendem, rolagem suave
│   ├── demo-golpe.js     celulares "Como o golpe acontece"
│   ├── navegacao.js      painel de serviços do menu, voltar ao topo, botão flutuante
│   ├── busca-servicos.js busca "Digite o que aconteceu"
│   ├── primeiros-30-minutos.js  painel "Caí em um golpe agora"
│   ├── verificador.js    verificador "Isso é golpe?"
│   ├── montador-whatsapp.js  montador de mensagem do WhatsApp
│   ├── alertas-tela.js   "Últimos alertas", filtro e leitura dos alertas
│   └── vendor/           bibliotecas Motion e Lenis (não mexer)
└── assets/
    ├── logo.svg          logo provisório (símbolo + nome)
    ├── logo-simbolo.svg  só o símbolo (favicon)
    ├── og-image.png      imagem que aparece ao compartilhar o link
    └── fonts/            arquivos originais das fontes
```

## Onde editar

| Quero mudar…                         | Arquivo                                   |
| ------------------------------------ | ----------------------------------------- |
| Número do WhatsApp, e-mail, horário  | `js/config.js` (só lá)                    |
| Mensagem que chega no WhatsApp       | `js/config.js` (`mensagemPadrao`, `mensagemServico`) |
| Adicionar/remover/editar um serviço  | `js/services.js` (copie um bloco `{ ... }` inteiro) |
| Criar uma categoria nova (aba)       | `js/services.js`, lista `CATEGORIAS`      |
| Textos das seções, dúvidas, rodapé   | `index.html` (cada seção tem um comentário com o número dela) |
| Cores e tamanhos                      | `css/variables.css`                       |
| Ícone de um serviço                   | campo `icone` em `services.js`, com um nome de `js/icons.js` |
| Atalhos do topo ("O que aconteceu…")  | `index.html`, botões `data-quick="id-do-serviço"` |
| Mensagens da demonstração nos celulares | `js/demo-golpe.js`, listas `ROTEIRO_GOLPE` e `ROTEIRO_INVESTIGACAO` |
| Ligar/desligar animações para quem pede "reduzir movimento" | `js/config.js` (`animacoesSempre`) **e** `index.html` (`ANIMACOES_SEMPRE`, no `<head>`) |
| Cores do tema escuro e do tema claro | `css/variables.css` (blocos "TEMA ESCURO" e "TEMA CLARO") |
| Palavras que a busca encontra        | `js/services.js`, campo `palavrasChave` de cada serviço |
| Perguntas, pesos e resultados do verificador | `js/verificador.js`, listas `PERGUNTAS_VERIFICADOR` e `NIVEIS_VERIFICADOR` |
| Opções do montador de mensagem       | `js/montador-whatsapp.js`, lista `OPCOES_MONTADOR` |
| Passos do "Primeiros 30 minutos"     | `js/primeiros-30-minutos.js`, listas `PASSOS_URGENTES` e `NAO_FACA` |
| Alertas de golpes                    | `js/alertas.js` e depois `node ferramentas/gerar-paginas.js` |
| Visual das páginas de serviço/alerta | `ferramentas/modelos/` e depois `node ferramentas/gerar-paginas.js` |

**Atenção:** o aviso que aparece só com JavaScript desligado (`<noscript>` na seção
de serviços, em `index.html`) tem o número do WhatsApp escrito à mão. Se trocar
o número, troque lá também.

## Versões

- **Versão atual (v2):** visual com brilhos de luz navy e azul, cards de "moldura dupla",
  dossiê animado no topo, atalhos "O que aconteceu com você?" e bem mais animação.
- **Versão anterior (v1):** guardada na pasta `vestigio-site-v1` (fundo com grade).
  Os textos são os mesmos nas duas.

## Se algo quebrar

Aperte **F12** no navegador e veja a aba **Console**. O erro mostra o arquivo e a
linha. Em `services.js`, o problema quase sempre é uma vírgula ou aspas faltando.

## Placeholders (a definir)

- Texto e nomes da equipe: o bloco "Quem somos" está guardado como comentário no `index.html` (seção Sobre); preencha e tire o comentário para ele voltar
- Horário de atendimento, área de atuação
- Política de privacidade completa (revisar com o advogado parceiro)
- Domínio definitivo (`canonical` e `og:image` no `<head>` do `index.html`)
- Domínio definitivo também em `DOMINIO`, no topo de `ferramentas/gerar-paginas.js` (depois rode o script)
- Os 3 alertas de `js/alertas.js` são exemplos: revisar (ou trocar) antes de publicar
- Possíveis dados oficiais na seção do problema (marcados com `TODO: fonte`)
- Logo definitivo


## Versão 2.1 (paleta ciano / verde-água)

- **Cores novas** em `css/variables.css`: fundo `#0B0C10`, superfícies `#1F2833`,
  texto `#C5C6C7`, ciano `#66FCF1` (destaque, usado pouco) e verde-água `#45A29E`
  (ícones, bordas e hover). O texto dos botões ciano é escuro (contraste 15:1).
- **Texturas**: grão de filme em todo o fundo (`.ambient::after`), grade de pontos
  no hero e nos serviços (classe `.dot-grid`) e linhas de contorno
  (`assets/textura-contorno.svg`) no "Sobre" e no bloco final de contato.
- **Menu**: pílula que desliza até o link sob o mouse, ponto ciano no link da
  seção atual e uma linha fina de progresso da leitura na borda do menu.
- **Hero**: rótulo técnico que se "decodifica", ponto com efeito de radar e um
  traço de caneta que se desenha embaixo de "rastro.".
- **Efeitos do mouse** (novo arquivo `js/interacoes.js`): a luz que seguia o
  cursor dentro dos cards e os botões magnéticos saíram. Agora as BORDAS dos
  quadros perto do mouse acendem (cards de serviço, princípios, etapas, guia,
  contato e atalhos) e o hover dos botões nasce do ponto em que o mouse entra.
- Tudo respeita "reduzir movimento".

## Versão 2.2 (gelatina + entradas variadas)

- **Efeito gelatina** (`js/interacoes.js`, parte 6), inspirado no Liquid Glass da
  Apple: botões, chips, abas, botão do WhatsApp e cards são puxados de leve na
  direção do mouse, esticam conforme a velocidade dele, achatam ao clicar/tocar
  e voltam balançando. Para deixar mais "mole" ou mais "duro", mude `mola` e
  `atrito` em `TIPOS_GELATINA`.
- A pílula do menu e a pílula das abas agora passam do ponto e voltam
  (`--ease-elastic` em `variables.css`).
- **Entradas ao rolar** (`js/animations.js`, parte 4): cada bloco entra de um
  jeito. Títulos sobem de dentro de uma máscara; "O problema" levanta em 3D;
  serviços estouram em cascata; princípios chegam alternando dos lados; o guia
  entra pelos dois lados; as dúvidas são "desenhadas" da esquerda para a
  direita; o contato pula no lugar; e o bloco final cresce junto com a rolagem.

## Versão 2.3 (rolagem nos dois sentidos + gelatina mais forte)

- **Animações presas à rolagem** (`js/animations.js`, parte 4): as entradas
  avançam conforme você desce e voltam quando você sobe. Os cards de serviço
  "estouram" como gelatina toda vez que entram na tela.
- **Rolagem suave com inércia** (biblioteca Lenis, `js/vendor/lenis.min.js`,
  ligada em `js/interacoes.js`, parte 7). Para deixar mais ou menos macia,
  mude `lerp`.
- **Cards de serviço**: gelatina mais forte, "pulo" ao entrar com o mouse e
  inclinação 3D na direção do cursor.
- Se o Windows estiver com "Efeitos de animação" desligado, o navegador avisa
  o site para reduzir movimento. Desde a seção "Animações para todos" (abaixo),
  isso é controlado pelo interruptor `animacoesSempre`.

## Versão 2.6 (demonstração "Como o golpe acontece")

- **Seção nova** entre "O problema" e "Encontre o seu caso" (`id="como-acontece"`):
  dois celulares feitos só com HTML/CSS contam o golpe do falso parente e, em
  seguida, a análise da Vestígio ligando os vestígios até o relatório técnico.
  Depois de alguns segundos parados no final, recomeçam (loop).
- **Para editar a história:** abra `js/demo-golpe.js`. No topo estão
  `ROTEIRO_GOLPE` (as mensagens do celular 1), `ROTEIRO_INVESTIGACAO` (os itens
  do celular 2) e `TEMPOS_DEMO` (velocidade). Use sempre dados fictícios e mascarados.
- **Visual:** CSS no bloco "3.5 COMO O GOLPE ACONTECE" de `css/sections.css`.
  Dentro do celular as medidas usam `cqi` (porcentagem da largura do aparelho),
  então tudo cresce junto com ele. O tamanho do aparelho é `--phone-w`.
- **Movimento:** os celulares entram presos à rolagem (`presoARolagem`, agora
  disponível como `window.presoARolagem`), inclinam até 4° na direção do mouse
  usando a mola de `js/interacoes.js` (nova função reaproveitável `criarMola`)
  e "respiram" 2px. A história só anda com a seção na tela.
- **Celular e tablet:** um aparelho só, que vira entre "1/2 O golpe" e
  "2/2 A investigação".
- **Reduzir movimento:** os dois celulares aparecem já no estado final (só com `animacoesSempre: false`).
- **Correção:** no celular, os cards que entram deslizando de lado ("Como
  funciona" e "Caí em um golpe") deixavam a página 24px mais larga que a tela.
  Agora `.section` corta o que passa das laterais (`css/base.css`).
- Cópia dos arquivos alterados em `_backup-antes-v2.6/`.

## Animações para todos

- **Decisão:** as animações aparecem para TODOS os visitantes, mesmo para quem
  ligou "reduzir movimento" no sistema (Windows "Efeitos de animação" desligado,
  iPhone/Android "Reduzir movimento").
- **Interruptor:** `animacoesSempre` em `js/config.js`.
  - `true` (atual): todo mundo vê as animações.
  - `false`: quem pediu "reduzir movimento" vê o site parado.
- **Atenção:** o script do `<head>` do `index.html` roda antes do `config.js` e
  repete a regra em `var ANIMACOES_SEMPRE`. Se mudar um, mude o outro.
- Todos os arquivos JS perguntam à função central `reduzirMovimento()` (em
  `js/config.js`) em vez de olhar o sistema direto.
- No CSS, as regras de "movimento reduzido" (que antes ficavam em
  `@media (prefers-reduced-motion: reduce)`) agora começam com
  `html.respeitar-movimento`. Essa classe só aparece no `<html>` quando o
  interruptor está em `false` E o sistema pede para reduzir movimento.
- A segurança continua: se o JavaScript de animação não rodar em 3 segundos,
  tudo aparece. Sem JavaScript, nada fica escondido.

## Tema claro/escuro

- **Botão:** no menu (entre os links e "Falar com especialista") no computador e,
  no celular, no rodapé do menu ("Aparência"). Lua = tema escuro, sol = tema claro.
- **Como funciona:** o atributo `data-theme` no `<html>` vale `"dark"` ou `"light"`.
  - Primeira visita: segue o sistema (claro ou escuro).
  - Depois de escolher, a escolha fica salva no navegador (chave `vestigio-tema`).
  - O script do `<head>` aplica o tema antes dos estilos, então a página não pisca.
  - `privacidade.html` segue o mesmo tema salvo.
- **Troca esmaecida:** a página inteira faz um cross-fade de 450ms (View
  Transitions API, `js/components.js`, parte 9). Em navegadores sem essa API, uma
  "cortina" na cor do novo fundo aparece e some. O ícone sol/lua gira 90°.
- **Cores:** todas em `css/variables.css`.
  - O bloco "TEMA ESCURO" tem os mesmos valores de antes (o escuro não mudou).
  - O bloco "TEMA CLARO" tem a paleta nova, com contraste AA conferido.
  - O resto do CSS não tem mais cores fixas. As transparências usam "tintas" como
    `rgba(var(--ink-rgb), 0.06)`, que viram branco no escuro e quase-preto no claro.
- **Regras do claro:**
  - O ciano `#66FCF1` só aparece como fundo de botões e pílulas.
  - Linhas finas, pontinhos e ícones usam `--accent-line` (verde-água escuro).
  - Textos e links usam `--accent-ink`.
- **Logo:** no menu e no rodapé, o SVG está dentro do HTML com `currentColor`
  (`--logo-color`). O favicon continua o mesmo.
- **Celulares da demonstração:** continuam escuros nos dois temas, como aparelhos
  de verdade (`.phone` recebe as cores do tema escuro).
- Cópia dos arquivos alterados em `_backup-antes-tema-e-animacoes/`.

## Versão 3.0 (ferramentas, páginas para o Google e menu novo)

Cópia dos arquivos alterados em `_backup-antes-ferramentas/`.

### Como gerar as páginas de serviços e de alertas

Estes arquivos são **criados por um script**:
- as páginas das pastas `servicos/` e `alertas/`;
- o `alertas.html`;
- o `sitemap.xml` e o `robots.txt`.

Não edite esses arquivos à mão: a próxima geração apaga a mudança. Para atualizar:

1. Instale o Node.js (https://nodejs.org), só uma vez.
2. Abra o terminal na pasta do site e rode:

   ```
   node ferramentas/gerar-paginas.js
   ```

Rode de novo sempre que mudar `js/services.js`, `js/alertas.js`, os modelos em
`ferramentas/modelos/` ou o menu/rodapé do `index.html`.
- **Cabeçalho e rodapé:** o script copia do `index.html` o menu, o rodapé e o script
  do tema (entre os comentários `INICIO:MOLDE-...` e `FIM:MOLDE-...`). Assim eles
  ficam iguais em todas as páginas.
- **Página que sobrou:** se um serviço for apagado, o script avisa que a página antiga
  ficou para trás.
- **Antes de publicar:** troque `DOMINIO` no topo de `ferramentas/gerar-paginas.js`
  pelo domínio definitivo (o mesmo do `canonical` do `index.html`).

### Etapa 1: menu

- **Painel de serviços** (`js/navegacao.js`, parte 1).
  - "Serviços" ganhou uma setinha e abre um painel com as categorias e os serviços,
    montado a partir de `services.js`.
  - Do lado ficam o card "Caí em um golpe agora" e o link "Ver todos os serviços".
  - Abre ao parar o mouse, ao clicar ou com Enter. Fecha com Esc, clique fora ou
    saindo com o mouse. Setas e Tab andam dentro dele.
  - Na página inicial, clicar num serviço abre o painel de detalhe. Nas outras
    páginas, leva à página do serviço.
- **Menu completo a partir de 1280px** (antes era 1024px).
  - Com os itens novos, a ilha não cabia. Entre 768 e 1279px vale o menu de tela cheia.
  - "Sobre" e "Contato" aparecem na ilha só a partir de 1600px. Continuam no menu do
    celular e no rodapé.
- **Celular:** "Caí em um golpe agora" fica no topo do menu, e "Serviços" virou uma sanfona.
- **Busca "Digite o que aconteceu"** (`js/busca-servicos.js`).
  - Filtra os cards enquanto a pessoa digita, ignorando acentos, e destaca o trecho achado.
  - Volta para a aba "Todos", tem atalho "/" e botão de limpar.
  - Sem resultado, oferece contar o caso pelo WhatsApp.
- **"Primeiros 30 minutos"** (`js/primeiros-30-minutos.js`).
  - Lista de passos para marcar, com barra de progresso.
  - O progresso fica guardado só neste navegador (`localStorage`, chave `vestigio-primeiros-30`).
  - Tem o "Não faça" resumido e um botão para o montador, já marcado como urgente.
- **Voltar ao topo** (`js/navegacao.js`, parte 3): aparece depois de cerca de 2 telas,
  acima do botão do WhatsApp. Um anel em volta mostra quanto da página já foi lido.
- **Botão flutuante:** agora abre duas opções, "Falar no WhatsApp" e "Caí em um golpe agora".

### Etapa 2: ferramentas

- **Verificador "Isso é golpe?"** (seção `#verificador`, `js/verificador.js`).
  - Seis perguntas de Sim/Não/Não sei, com atalhos S, N e ?.
  - "Não sei" vale meio ponto. A pergunta da senha/código leva direto ao nível mais alto.
  - O resultado mostra um medidor, as "fichas" dos sinais e o que fazer.
  - Botões: Refazer, Falar com especialista e Compartilhar.
  - Nada é enviado nem guardado.
- **Montador de mensagem** (`js/montador-whatsapp.js`).
  - Os botões principais de WhatsApp (com `data-montador`) abrem um painel com três
    perguntas rápidas em chips, uma frase opcional e a prévia exata da mensagem.
  - "Prefiro enviar sem preencher" manda a mensagem padrão.
  - O link normal do WhatsApp continua no botão, como reserva.

### Etapa 3: páginas para o Google

- **Uma página por serviço** (`servicos/`).
  - SEO: título e descrição próprios, endereço canônico, Open Graph e dados
    estruturados (Service + BreadcrumbList).
  - Caminho "Início / Serviços / ...", o mesmo conteúdo do painel e 3 serviços relacionados.
  - O painel de detalhe da página inicial ganhou o link "Abrir página do serviço".
- **Alertas** (`alertas.html` e `alertas/`, dados em `js/alertas.js`).
  - Lista com o mais recente em destaque e filtro por categoria.
  - Cada alerta tem barra de progresso da leitura, "Como se proteger", botão
    Compartilhar e chamada final.
  - Na página inicial, a faixa "Últimos alertas" mostra os 3 mais recentes.
  - Os 3 alertas atuais são **exemplos**, marcados com `// EXEMPLO: revisar antes de publicar.`
- "Alertas" e "Isso é golpe?" entraram no menu e no rodapé.

### Acessibilidade e temas

- Tudo usa só as variáveis de cor: funciona no claro e no escuro, com contraste AA conferido.
- Tem foco visível, funciona pelo teclado e segue o interruptor `animacoesSempre`.
- Sem JavaScript, "Serviços" vira um link comum e as ferramentas que dependem dele somem.

## Versão 3.1 (rolagem nos dois sentidos, sites falsos, WhatsApp e notebooks)

Cópia dos arquivos de antes em `_backup-antes-v3.1/`.

- **Entrar e sair com a rolagem** (`js/animations.js`, parte 4, função `entrarESair`).
  - Cada bloco tem duas faixas presas à rolagem: a ENTRADA (por baixo da tela) e a
    SAÍDA (`'end 25%'` → `'end start'`: esmaece até 0.15, sobe 24px, ganha 4px de
    desfoque e encolhe para 0.98).
  - As faixas só guardam o progresso; uma única função (`desenhar`) escreve
    opacity/transform/filter. Assim as duas nunca brigam.
  - Subindo, acontece o contrário: o que volta pelo topo desce e reaparece; o que sai
    por baixo esmaece.
  - Não vale para o hero, o dossiê, o cabeçalho e as colunas "grudadas" (sticky) do
    "Como funciona" e das "Dúvidas" no computador.
  - Para mudar a saída: objeto `SAIDA` no topo da parte 4.
  - Cards de serviço: entram de baixo quando você desce e de cima quando você sobe.
- **Serviço novo:** "Investigação em sites falsos" (`js/services.js`, depois de
  "Busca de bens"). Ícone novo `browser-alert` em `js/icons.js`. Página em
  `servicos/investigacao-em-sites-falsos.html`.
- **Selo do verificador:** variante `.eyebrow--interativo` (`css/ferramentas.css`), com
  ícone `mouse-pointer-click` e o ponto que "respira".
- **WhatsApp abre o painel primeiro** (`js/montador-whatsapp.js`).
  - O clique é pego na fase de captura.
  - Nos botões com `data-montador`, o link do WhatsApp fica em `data-href`; o `href`
    vira `#contato` e o `target` sai.
  - O WhatsApp só abre por "Abrir no WhatsApp" ou "Prefiro enviar sem preencher".
  - Sem JavaScript, vale o `href` escrito no HTML.
- **Notebooks** (`css/variables.css`, fim do bloco de telas largas, e `css/sections.css`,
  fim do arquivo).
  - De 1280px a 1919px a fonte da página vai de 14,5px a 16px, e títulos, respiro e
    margens crescem mais devagar. A partir de 1920px o visual é o mesmo de antes.
  - Telas com até 820px de altura têm hero e seções mais compactos.
- **"Recife/PE"** saiu do topo, da descrição do Google e da pergunta das dúvidas. Continua
  só no contato/rodapé (`CONFIG.local`), que diz onde fica a sede.

## Versão 3.2 (17/10/2026: e-mail, urgência, rodapé, "Atuamos em" e textura)

Cópia completa do site antes destas mudanças: pasta `vestigio-site-backup-2026-10-17` (ao lado desta).

- **E-mail:** `contato.vestigioo@gmail.com` (em `js/config.js`, campo `email`).
- **Urgência:** aviso "Casos urgentes: atendimento fora do horário" no contato e no rodapé. Mensagem do WhatsApp em `CONFIG.mensagemUrgente`.
- **Sem CNPJ:** saiu do rodapé e dos textos.
- **Rodapé novo:** logo, "Toda ação deixa um rastro.", colunas (navegação, serviços, contato, redes sociais) e Política de Privacidade. O mesmo rodapé vai para as páginas geradas e para `privacidade.html` ao rodar `node ferramentas/gerar-paginas.js`.
- **Topo:** pílula "Investigação digital" com uma lupa animada.
- **"Atuamos em":** substitui a faixa que rolava. Um serviço por vez (de `js/services.js`), com pausa no mouse e botão de pausa. Tempo de cada serviço: `INTERVALO` em `js/destaques.js`.
- **Textura do fundo:** `js/textura-fundo.js` e `css/textura-fundo.css`. **Para desligar:** `texturaFundo: false` em `js/config.js`.
- **Animações para todos:** estas animações novas seguem o mesmo interruptor `animacoesSempre` do resto do site (com `true`, todo mundo vê, mesmo com "reduzir movimento" ligado no sistema).

## Versão 3.3 (17/10/2026: textura nova, tema claro, Instagram e horário)

Cópia completa do site antes destas mudanças: pasta `vestigio-site-backup-2026-10-17-v2` (ao lado desta).

- **Textura do fundo** (`js/textura-fundo.js`): um único canvas com grade de pontos mais densa, rastros
  em diagonal (como o símbolo), "rede" de linhas finas entre pontos próximos, anel de "sinal" que se
  expande e, no computador, pontos que acendem perto do mouse. Brilho lento e granulado continuam (CSS).
  Quantidades e tempos: objeto `AJUSTES` no topo do arquivo. Para desligar: `texturaFundo: false` em `js/config.js`.
- **Cores da textura por tema** (`css/textura-fundo.css`, variáveis `--textura-*`): o tema claro tem
  cores próprias (pontos escuros, destaque verde-água fechado) e a mesma presença do escuro. Ao trocar
  de tema, o canvas relê as cores na hora.
- **Instagram oficial:** @vestigio.br (`js/config.js`, rodapé e dados para o Google).
- **Horário:** é o definitivo; a etiqueta "a confirmar" saiu.

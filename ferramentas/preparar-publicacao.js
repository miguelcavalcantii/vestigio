/* =========================================================
   PREPARAR PUBLICAÇÃO (usado pelo Cloudflare Pages)
   ---------------------------------------------------------
   O Cloudflare publica TUDO o que estiver na pasta de saída.
   Este script copia para a pasta publicar/ só o que é do site,
   deixando de fora as anotações internas (README, DESIGN,
   PRODUCT), as ferramentas e os arquivos originais das fontes.

   No Cloudflare Pages:
     Comando de build:   node ferramentas/preparar-publicacao.js
     Pasta de saída:     publicar

   Para testar no seu computador:
     node ferramentas/preparar-publicacao.js
   (a pasta publicar/ não vai para o GitHub: está no .gitignore)

   Criou um arquivo ou pasta NOVA do site na raiz? Acrescente o
   nome na lista ITENS abaixo.
   ========================================================= */

var fs = require('fs');
var path = require('path');

var PASTA = path.join(__dirname, '..');
var SAIDA = path.join(PASTA, 'publicar');

var ITENS = [
  'index.html',
  'privacidade.html',
  'termos.html',     // termos de uso (só em português)
  'delegacias.html', // delegacias por estado (dados em assets/data/delegacias.json)
  'obrigado.html',   // depois do formulário de contato (só para quem está sem JavaScript)
  'alertas.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  'css',
  'js',
  'assets',
  'servicos',
  'alertas',
  'en'          // versão em inglês (gerada por ferramentas/gerar-paginas.js)
];

// Dentro das pastas acima, o que NÃO vai para o ar
var IGNORAR = [
  path.join('assets', 'fonts')   // as fontes já estão embutidas em css/fonts.css
];

function copiar(origem, destino, relativo) {
  if (IGNORAR.indexOf(relativo) >= 0) return 0;
  var info = fs.statSync(origem);
  if (info.isDirectory()) {
    fs.mkdirSync(destino, { recursive: true });
    return fs.readdirSync(origem).reduce(function (total, nome) {
      return total + copiar(path.join(origem, nome), path.join(destino, nome), path.join(relativo, nome));
    }, 0);
  }
  fs.copyFileSync(origem, destino);
  return 1;
}

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

var total = 0;
ITENS.forEach(function (item) {
  var origem = path.join(PASTA, item);
  if (!fs.existsSync(origem)) {
    console.error('ERRO: não achei "' + item + '". Ele foi apagado ou renomeado?');
    process.exit(1);
  }
  total += copiar(origem, path.join(SAIDA, item), item);
});

console.log('Pronto! ' + total + ' arquivos copiados para publicar/.');

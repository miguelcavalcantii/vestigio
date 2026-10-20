/* =========================================================
   GERADOR DAS IMAGENS DE COMPARTILHAMENTO (Open Graph)
   ---------------------------------------------------------
   Cria um PNG de 1200 × 630 para cada página do site, a partir
   do modelo ferramentas/og/modelo.html, e salva em assets/og/
   (as páginas em inglês ficam em assets/og/en/).

   A LISTA DE PÁGINAS vem de ferramentas/og/paginas.json, que o
   gerador de páginas escreve. Por isso, a ordem é sempre:
       1. node ferramentas/gerar-paginas.js
       2. node ferramentas/gerar-og.js

   PRIMEIRA VEZ (instala o Playwright só nesta pasta, sem baixar
   navegador: ele usa o Chrome ou o Edge do computador):
       npm install --no-save playwright-core

   COMO RODAR:
       node ferramentas/gerar-og.js              refaz todas as imagens
       node ferramentas/gerar-og.js --novas      só as que ainda não existem
       node ferramentas/gerar-og.js golpe-do-amor delegacias
                                                 só as imagens com esses nomes

   Cada imagem precisa ficar abaixo de 300 KB (o WhatsApp e o
   Facebook recusam imagens muito pesadas). O script avisa se passar.
   ========================================================= */

var fs = require('fs');
var path = require('path');

var PASTA = path.join(__dirname, '..');
var LISTA = path.join(__dirname, 'og', 'paginas.json');
var MODELO = path.join(__dirname, 'og', 'modelo.html');
var LIMITE = 300 * 1024;

function carregarPlaywright() {
  try { return require('playwright'); } catch (e) { /* tenta o outro */ }
  try { return require('playwright-core'); } catch (e) {
    console.error('Não achei o Playwright. Rode primeiro:  npm install --no-save playwright-core');
    process.exit(1);
  }
}

// Abre o Chrome do computador; se não houver, o Edge; se não, o do Playwright
async function abrirNavegador(chromium) {
  var tentativas = [{ channel: 'chrome' }, { channel: 'msedge' }, {}];
  for (var i = 0; i < tentativas.length; i++) {
    try { return await chromium.launch(tentativas[i]); } catch (e) { /* próxima */ }
  }
  console.error('Não consegui abrir um navegador. Instale o Google Chrome ou rode:  npx playwright install chromium');
  process.exit(1);
}

(async function () {
  if (!fs.existsSync(LISTA)) {
    console.error('Falta ferramentas/og/paginas.json. Rode antes:  node ferramentas/gerar-paginas.js');
    process.exit(1);
  }

  var args = process.argv.slice(2);
  var soNovas = args.indexOf('--novas') > -1;
  var nomes = args.filter(function (a) { return a.charAt(0) !== '-'; });

  var paginas = JSON.parse(fs.readFileSync(LISTA, 'utf8')).paginas.filter(function (p) {
    var nome = path.basename(p.arquivo, '.png');
    if (nomes.length && nomes.indexOf(nome) < 0) return false;
    if (soNovas && fs.existsSync(path.join(PASTA, p.arquivo))) return false;
    return true;
  });

  if (!paginas.length) {
    console.log('Nenhuma imagem para gerar.');
    return;
  }

  var chromium = carregarPlaywright().chromium;
  var navegador = await abrirNavegador(chromium);
  var aba = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await aba.goto('file:///' + MODELO.replace(/\\/g, '/'));
  await aba.evaluate(function () { return document.fonts.ready; });

  var pesadas = [];
  for (var i = 0; i < paginas.length; i++) {
    var p = paginas[i];
    var destino = path.join(PASTA, p.arquivo);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    await aba.evaluate(function (dados) { return window.preencher(dados); }, p);
    await aba.screenshot({ path: destino, type: 'png' });
    var tamanho = fs.statSync(destino).size;
    if (tamanho > LIMITE) pesadas.push(p.arquivo);
    console.log('  ' + p.arquivo + '  (' + Math.round(tamanho / 1024) + ' KB)');
  }
  await navegador.close();

  console.log('\nPronto! ' + paginas.length + ' imagens.');
  if (pesadas.length) {
    console.log('ATENÇÃO: passaram de 300 KB (simplifique o modelo): ' + pesadas.join(', '));
    process.exitCode = 1;
  }
})();

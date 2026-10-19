/* =========================================================
   TRADUTOR DE HTML (usado por ferramentas/gerar-paginas.js)
   ---------------------------------------------------------
   Troca os textos em português de um HTML pelos textos do
   dicionário (frase em português → frase em inglês).

   O que ele traduz:
   - todo texto que aparece na tela (entre as tags)
   - os atributos aria-label, alt, title e placeholder
   - o "content" das <meta> de descrição e compartilhamento
   O que ele NÃO mexe: <script>, <style>, comentários, nomes
   de classes, links e os marcadores {{CHAVE}} dos modelos.

   As chaves do dicionário são o texto como está no HTML, com
   os espaços e quebras de linha juntados em um espaço só.
   Se um texto não estiver no dicionário, ele fica em português
   e entra na lista "faltando" (o gerador mostra essa lista).
   ========================================================= */

var ATRIBUTOS = ['aria-label', 'alt', 'title', 'placeholder'];
var METAS = /(name|property)="(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)"/;

function normalizar(texto) {
  return texto.replace(/\s+/g, ' ').trim();
}

// Tem algo para traduzir? (letras de verdade, não só números, símbolos ou {{CHAVE}})
function temTexto(texto) {
  var limpo = texto.replace(/\{\{[A-Z_]+\}\}/g, '').replace(/&[a-z]+;|&#\d+;/g, '');
  return /[A-Za-zÀ-ú]{2,}/.test(limpo);
}

function criarTradutor(dicionario) {
  var faltando = {};

  function traduzir(texto) {
    var chave = normalizar(texto);
    if (!chave || !temTexto(chave)) return texto;
    if (Object.prototype.hasOwnProperty.call(dicionario, chave)) {
      // Mantém os espaços de antes e de depois (a indentação do HTML)
      var antes = texto.match(/^\s*/)[0];
      var depois = texto.match(/\s*$/)[0];
      return antes + dicionario[chave] + depois;
    }
    faltando[chave] = true;
    return texto;
  }

  function traduzirTag(tag) {
    if (/^<(!|\/)/.test(tag)) return tag;
    var ehMeta = /^<meta\b/i.test(tag);
    return tag.replace(/\s([a-z-]+)="([^"]*)"/g, function (inteiro, nome, valor) {
      var traduzivel = ATRIBUTOS.indexOf(nome) >= 0 || (ehMeta && nome === 'content' && METAS.test(tag));
      if (!traduzivel) return inteiro;
      return ' ' + nome + '="' + traduzir(valor) + '"';
    });
  }

  function html(codigo) {
    // Separa em tags, comentários, scripts/estilos e textos
    var partes = codigo.split(/(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<[^>]+>)/);
    return partes.map(function (parte) {
      if (!parte) return parte;
      if (/^<!--|^<script\b|^<style\b/i.test(parte)) return parte;
      if (parte.charAt(0) === '<') return traduzirTag(parte);
      return traduzir(parte);
    }).join('');
  }

  return {
    html: html,
    texto: traduzir,
    faltando: function () { return Object.keys(faltando); }
  };
}

module.exports = { criarTradutor: criarTradutor, normalizar: normalizar, temTexto: temTexto };

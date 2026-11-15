// Casos de prueba de las reglas (semgrep --test). No es parte de la extensión.

// --- ba-external-url
// ruleid: ba-external-url
var img = 'https://evil.example/pixel.gif';
// ruleid: ba-external-url
var rel = '//evil.example/x';
// ruleid: ba-external-url
var gh = 'https://github.com/otro/repo';
// ok: ba-external-url
var ns = 'http://www.w3.org/2000/svg';
// ok: ba-external-url
var repo = 'https://github.com/lyoss-usm/betteraula/issues';

// --- ba-css-exfiltration (CSS embebido en JS)
// ruleid: ba-css-exfiltration
var css1 = 'input[value^="a"] { background: red; }';
// ruleid: ba-css-exfiltration
var css2 = '@import "x.css";';
// ruleid: ba-css-exfiltration
el.style.background = 'url(' + remote + ')';
// ok: ba-css-exfiltration
el.style.setProperty('background-image', 'url(\'' + base64Url + '\')', 'important');
// ok: ba-css-exfiltration
var d = canvas.toDataURL('image/jpeg', 0.8);
// ok: ba-css-exfiltration
var bg = 'url("data:image/svg+xml,%3Csvg%3E")';

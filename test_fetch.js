const originalFetch = function() { console.log("Called with:", arguments); };
let currentTiendaId = 1;
const myFetch = async function () {
  let [resource, config] = arguments;
  const urlStr = typeof resource === 'string' ? resource : (resource?.url || '');
  if (urlStr.includes('/api/tienda/') && currentTiendaId) {
    config = config || {};
    config.headers = {
      ...config.headers,
      'X-Tienda-Id': currentTiendaId.toString(),
    };
    if (resource instanceof Request) {
      resource.headers.set('X-Tienda-Id', currentTiendaId.toString());
    }
  }
  return originalFetch.apply(this, [resource, config]);
};

myFetch("/api/tienda/ventas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id_cliente_miembro: null, id_cliente_tienda: 1, id_persona: null })
});

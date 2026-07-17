import { useState, useEffect, useRef } from "react";
import { QrCode, UserPlus, Search, X } from "lucide-react";

export function NuevaVentaModal({ onClose, onVentaCreated }: { onClose: () => void, onVentaCreated: (id: number) => void }) {
  const [activeTab, setActiveTab] = useState<'qr' | 'manual' | 'nuevo'>('qr');
  const [qrInput, setQrInput] = useState("");
  const [miembros, setMiembros] = useState<any[]>([]);
  const [clientesForaneos, setClientesForaneos] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [vinculaciones, setVinculaciones] = useState<any[]>([]);
  const [carnetsEmitidos, setCarnetsEmitidos] = useState<any[]>([]);
  const [searchMiembro, setSearchMiembro] = useState("");
  const [searchForaneo, setSearchForaneo] = useState("");
  const [showFormNuevoCliente, setShowFormNuevoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", cedula: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [selectedMiembroForPersonas, setSelectedMiembroForPersonas] = useState<any | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/miembros").then(res => res.json()).then(setMiembros);
    fetch("/api/tasca/clientes").then(res => res.json()).then(setClientesForaneos);
    fetch("/api/personas").then(res => res.json()).then(setPersonas);
    fetch("/api/vinculaciones").then(res => res.json()).then(setVinculaciones);
    fetch("/api/carnets-emitidos").then(res => res.json()).then(setCarnetsEmitidos);
    if (activeTab === 'qr') {
      setTimeout(() => qrInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  const createVenta = (id_cliente_miembro: number | null, id_cliente_tasca: number | null, id_persona: number | null = null) => {
    setLoading(true);
    fetch("/api/tasca/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente_miembro, id_cliente_tasca, id_persona })
    }).then(async res => {
      if (!res.ok) throw new Error("Error al crear venta");
      const data = await res.json();
      onVentaCreated(data.id);
    }).catch(err => {
      alert(err.message);
      setLoading(false);
    });
  };

  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Expected format: https://membresiasugavi.info/c/4c9df3de-e7d5-46b3-a513-f9d2ff77abf5
    const match = qrInput.match(/\/c\/([a-zA-Z0-9\-]+)/i);
    if (match && match[1]) {
      const carnetId = match[1];
      const safeCarnets = Array.isArray(carnetsEmitidos) ? carnetsEmitidos : [];
      const carnet = safeCarnets.find(c => c.id == carnetId);
      
      if (carnet && carnet.id_miembro) {
        createVenta(carnet.id_miembro, null, carnet.id_persona || null);
      } else {
        alert("El código QR pertenece a un carnet que no está vinculado a ningún miembro o no existe.");
        setQrInput("");
      }
    } else {
      alert("Formato de QR inválido.");
      setQrInput("");
    }
  };

  const handleNuevoClienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/tasca/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoCliente)
    }).then(async res => {
      if (!res.ok) throw new Error("Error al crear cliente");
      const data = await res.json();
      createVenta(null, data.id);
    }).catch(err => {
      alert(err.message);
      setLoading(false);
    });
  };

  const safeMiembros = Array.isArray(miembros) ? miembros : [];
  const safeForaneos = Array.isArray(clientesForaneos) ? clientesForaneos : [];

  const filteredMiembros = safeMiembros.filter(m => {
    if (!m) return false;
    const searchLower = searchMiembro.toLowerCase();
    return (
      (m.razon_social && String(m.razon_social).toLowerCase().includes(searchLower)) ||
      (m.rif && String(m.rif).toLowerCase().includes(searchLower)) ||
      (m.acronimo && String(m.acronimo).toLowerCase().includes(searchLower)) ||
      String(m.id).includes(searchLower)
    );
  });

  const filteredForaneos = safeForaneos.filter(c => {
    if (!c) return false;
    const searchLower = searchForaneo.toLowerCase();
    return (
      (c.nombre && String(c.nombre).toLowerCase().includes(searchLower)) ||
      (c.cedula && String(c.cedula).toLowerCase().includes(searchLower)) ||
      (c.telefono && String(c.telefono).toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)" }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Iniciar Nueva Venta
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>

        <div className="flex border-b mb-4">
          <button onClick={() => setActiveTab('qr')} className={`pb-2 px-4 text-sm font-semibold ${activeTab === 'qr' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Lector QR</button>
          <button onClick={() => setActiveTab('manual')} className={`pb-2 px-4 text-sm font-semibold ${activeTab === 'manual' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Buscar Miembro</button>
          <button onClick={() => setActiveTab('nuevo')} className={`pb-2 px-4 text-sm font-semibold ${activeTab === 'nuevo' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Cliente Foráneo</button>
        </div>

        {activeTab === 'qr' && (
          <div className="text-center py-8">
            <QrCode size={64} className="mx-auto text-green-500 mb-4 animate-pulse" />
            <p className="text-sm text-gray-500 mb-4">Pase el carnet del miembro por el lector de código QR ahora.</p>
            <form onSubmit={handleQrSubmit}>
              <input 
                ref={qrInputRef}
                type="text" 
                autoFocus
                className="opacity-0 absolute" 
                value={qrInput} 
                onChange={e => setQrInput(e.target.value)} 
              />
              {qrInput && <p className="text-xs text-gray-400 mt-2">Lectura: {qrInput}</p>}
            </form>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-4">
            {!selectedMiembroForPersonas ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar miembro por Razón Social o RIF..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
                    value={searchMiembro}
                    onChange={(e) => setSearchMiembro(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {filteredMiembros.map(m => {
                    return (
                      <div key={m.id} className="flex justify-between items-center p-3 rounded-xl border hover:bg-gray-50/5 cursor-pointer transition-colors"
                           onClick={() => setSelectedMiembroForPersonas(m)}>
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {m.razon_social || 'Sin Razón Social'}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.solvencia === 'Solvente' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {m.solvencia === 'Solvente' ? 'SOLVENTE' : 'INSOLVENTE'}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">{m.rif || 'Sin RIF'} • {m.acronimo || 'Sin Acrónimo'}</p>
                        </div>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">
                          Elegir
                        </button>
                      </div>
                    );
                  })}
                  {filteredMiembros.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-500 border border-dashed rounded-xl mt-2">
                      No se encontró ningún miembro con esa búsqueda.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-bold text-gray-700">Seleccionar Persona a facturar</h3>
                    <p className="text-sm text-gray-500">Miembro: {selectedMiembroForPersonas.razon_social}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedMiembroForPersonas(null)} className="text-sm text-gray-500 hover:text-gray-700">Volver</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {vinculaciones
                    .filter(v => v.id_miembro === selectedMiembroForPersonas.id)
                    .map(v => {
                      const p = personas.find(per => per.id === v.id_persona);
                      if (!p) return null;
                      return (
                        <div key={p.id} className="flex justify-between items-center p-3 rounded-xl border hover:bg-gray-50/5 cursor-pointer transition-colors"
                             onClick={() => createVenta(selectedMiembroForPersonas.id, null, p.id)}>
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              {p.nombre}
                              {v.representante ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">REPRESENTANTE</span> : null}
                            </p>
                            <p className="text-xs text-gray-500">C.I: {p.ci_numero || 'N/A'} • {v.parentesco || 'Familiar'}</p>
                          </div>
                          <button disabled={loading} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                            Facturar
                          </button>
                        </div>
                      );
                    })}
                  {vinculaciones.filter(v => v.id_miembro === selectedMiembroForPersonas.id).length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-500 border border-dashed rounded-xl mt-2">
                      Este miembro no tiene personas registradas.
                      <button onClick={() => createVenta(selectedMiembroForPersonas.id, null, null)} className="block w-full mt-2 text-green-600 underline">Facturar directo al Miembro</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nuevo' && (
          <div className="space-y-4">
            {!showFormNuevoCliente ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar cliente foráneo por nombre o cédula..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
                    value={searchForaneo}
                    onChange={(e) => setSearchForaneo(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {filteredForaneos.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 rounded-xl border hover:bg-gray-50/5 cursor-pointer transition-colors"
                         onClick={() => createVenta(null, c.id)}>
                      <div>
                        <p className="font-semibold">{c.nombre}</p>
                        <p className="text-xs text-gray-500">{c.cedula || 'Sin cédula'} • {c.telefono || 'Sin teléfono'}</p>
                      </div>
                      <button disabled={loading} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                        Seleccionar
                      </button>
                    </div>
                  ))}
                  {filteredForaneos.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-500 border border-dashed rounded-xl mt-2">
                      No se encontró ningún cliente.
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => setShowFormNuevoCliente(true)} className="w-full mt-4 py-2 rounded-xl border border-green-600 text-green-600 font-bold hover:bg-green-50 transition-colors">
                  + Registrar Nuevo Cliente Foráneo
                </button>
              </>
            ) : (
              <form onSubmit={handleNuevoClienteSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-700">Nuevo Cliente Foráneo</h3>
                  <button type="button" onClick={() => setShowFormNuevoCliente(false)} className="text-sm text-gray-500 hover:text-gray-700">Volver a buscar</button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                  <input required type="text" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500"
                    style={{ backgroundColor: "var(--background)" }}
                    value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cédula / Documento (Opcional)</label>
                  <input type="text" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500"
                    style={{ backgroundColor: "var(--background)" }}
                    value={nuevoCliente.cedula} onChange={e => setNuevoCliente({...nuevoCliente, cedula: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono (Opcional)</label>
                  <input type="text" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500"
                    style={{ backgroundColor: "var(--background)" }}
                    value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} />
                </div>
                <button disabled={loading} type="submit" className="w-full mt-4 py-2 rounded-xl text-white font-bold" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  {loading ? "Creando..." : "Registrar y Continuar"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

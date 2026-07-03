import { useState, useEffect } from "react";
import { Search, Plus, CreditCard, IdCard, Trash2, CheckCircle, Clock, Download, X, Loader2 } from "lucide-react";
import { generarPDFCarnet } from "../utils/pdfGenerator";

export function CarnetsPanel() {
  const [activeTab, setActiveTab] = useState<"pagos" | "emisiones">("pagos");
  const [pagos, setPagos] = useState<any[]>([]);
  const [emisiones, setEmisiones] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasaCambio, setTasaCambio] = useState(36.5); // TODO: fetch from settings
  const [precioCarnet, setPrecioCarnet] = useState(5.0); // TODO: fetch from settings
  
  // Modals state
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showEmisionModal, setShowEmisionModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pagosRes, emisionesRes, miembrosRes, personasRes] = await Promise.all([
        fetch('/api/pagos-carnets'),
        fetch('/api/carnets-emitidos'),
        fetch('/api/miembros'),
        fetch('/api/personas')
      ]);

      if (pagosRes.ok) setPagos(await pagosRes.json());
      if (emisionesRes.ok) setEmisiones(await emisionesRes.json());
      if (miembrosRes.ok) setMiembros(await miembrosRes.json());
      if (personasRes.ok) setPersonas(await personasRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAprobarPago = async (pagoId: number) => {
    if (!confirm("¿Seguro que deseas aprobar este pago? Se sumarán los créditos al miembro.")) return;
    try {
      const res = await fetch(`/api/pagos-carnets/${pagoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Aprobado" })
      });
      if (res.ok) {
        fetchData(); // Recargar datos
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminarEmision = async (carnetId: string) => {
    if (!confirm("¿Anular este carnet? Se devolverá 1 crédito al miembro.")) return;
    try {
      const res = await fetch(`/api/carnets-emitidos/${carnetId}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const descargarPDF = (carnet: any) => {
    generarPDFCarnet({
      id: carnet.id,
      es_presidente_director: carnet.persona?.vinculaciones?.some((v: any) => v.cargo === 'Presidente' || v.cargo === 'Director') || false,
      nombres: carnet.persona?.nombre || '',
      apellidos: carnet.persona?.apellido || '',
      cedula: carnet.persona?.cedula || '',
      hacienda: carnet.miembro?.razon_social || '',
      fecha_emision: carnet.fecha_emision,
      fecha_vencimiento: carnet.fecha_vencimiento || 'N/A'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Gestión de Carnets</h1>
          <p className="text-muted-foreground mt-1 text-sm">Registra pagos de créditos y emite carnets para los miembros.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "pagos" ? (
            <button onClick={() => setShowPagoModal(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              <Plus className="w-4 h-4" /> Registrar Pago
            </button>
          ) : (
            <button onClick={() => setShowEmisionModal(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #a855f7, #7e22ce)" }}>
              <IdCard className="w-4 h-4" /> Emitir Carnet
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab("pagos")}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === "pagos" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-muted-foreground hover:bg-[var(--accent)]/50"}`}
        >
          <div className="flex items-center gap-2"><CreditCard className="w-4 h-4"/> Pagos de Créditos</div>
        </button>
        <button
          onClick={() => setActiveTab("emisiones")}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === "emisiones" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-muted-foreground hover:bg-[var(--accent)]/50"}`}
        >
          <div className="flex items-center gap-2"><IdCard className="w-4 h-4"/> Carnets Emitidos</div>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]"/></div>
      ) : activeTab === "pagos" ? (
        <div className="glass-card rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--accent)]/50 text-[var(--muted-foreground)] text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Miembro</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Monto Pagado</th>
                  <th className="px-6 py-4">Créditos</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
                {pagos.map(pago => (
                  <tr key={pago.id} className="hover:bg-[var(--accent)]/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{pago.miembro?.razon_social}</td>
                    <td className="px-6 py-4">{pago.fecha}</td>
                    <td className="px-6 py-4">${pago.monto} ({pago.metodo_pago})</td>
                    <td className="px-6 py-4 font-bold text-green-500">+{pago.cantidad_carnets}</td>
                    <td className="px-6 py-4">
                      {pago.estado === 'Aprobado' ? (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md flex w-fit items-center gap-1"><CheckCircle className="w-3 h-3"/> Aprobado</span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-md flex w-fit items-center gap-1"><Clock className="w-3 h-3"/> Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pago.estado !== 'Aprobado' && (
                        <button onClick={() => handleAprobarPago(pago.id)} className="text-green-500 hover:bg-green-500/20 p-2 rounded-lg transition-colors">Aprobar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--accent)]/50 text-[var(--muted-foreground)] text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Persona</th>
                  <th className="px-6 py-4">Miembro Asociado</th>
                  <th className="px-6 py-4">Emisión / Vence</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
                {emisiones.map(carnet => (
                  <tr key={carnet.id} className="hover:bg-[var(--accent)]/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{carnet.persona?.nombre} {carnet.persona?.apellido}</td>
                    <td className="px-6 py-4">{carnet.miembro?.razon_social}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{carnet.fecha_emision} <br/> {carnet.fecha_vencimiento}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md">{carnet.estado}</span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => descargarPDF(carnet)} className="text-indigo-500 hover:bg-indigo-500/20 p-2 rounded-lg transition-colors" title="Descargar PDF">
                        <Download className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleEliminarEmision(carnet.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded-lg transition-colors" title="Anular (devuelve 1 crédito)">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals will be added here, they can be separate components */}
      {showPagoModal && <PagoCarnetModal onClose={() => setShowPagoModal(false)} onSave={fetchData} miembros={miembros} tasaCambio={tasaCambio} precioCarnet={precioCarnet} />}
      {showEmisionModal && <CarnetEmitidoModal onClose={() => setShowEmisionModal(false)} onSave={fetchData} miembros={miembros.filter(m => m.carnets_disponibles > 0)} personas={personas} />}
    </div>
  );
}

function PagoCarnetModal({ onClose, onSave, miembros, tasaCambio, precioCarnet }: any) {
  const [formData, setFormData] = useState({
    id_miembro: "",
    fecha: new Date().toISOString().split('T')[0],
    cantidad_carnets: 1,
    metodo_pago: "Transferencia",
    referencia: ""
  });
  
  const monto = formData.cantidad_carnets * precioCarnet;
  const monto_bs = monto * tasaCambio;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetch('/api/pagos-carnets', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monto,
          monto_bs,
          tasa_cambio: tasaCambio,
          precio_unitario: precioCarnet,
          estado: "Aprobado" // Auto aprobar para demo, en prod puede ser Pendiente
        })
      });
      onSave();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--background)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--accent)]/30">
          <h2 className="text-xl font-bold">Registrar Pago de Carnets</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded-xl transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Miembro</label>
            <select required value={formData.id_miembro} onChange={e => setFormData({...formData, id_miembro: e.target.value})} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 focus:ring-2 focus:ring-primary">
              <option value="">Seleccione un miembro...</option>
              {miembros.map((m: any) => <option key={m.id} value={m.id}>{m.razon_social}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad de Carnets</label>
            <input type="number" min="1" required value={formData.cantidad_carnets} onChange={e => setFormData({...formData, cantidad_carnets: parseInt(e.target.value)})} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 focus:ring-2 focus:ring-primary"/>
          </div>
          <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <p className="text-sm font-medium text-indigo-500 mb-1">Resumen de Cobro</p>
            <div className="flex justify-between"><span>Precio Unitario:</span> <span>${precioCarnet}</span></div>
            <div className="flex justify-between font-bold mt-2"><span>Total $:</span> <span>${monto}</span></div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Total Bs (Tasa: {tasaCambio}):</span> <span>Bs {monto_bs.toFixed(2)}</span></div>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-xl font-semibold transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/30">Registrar y Aprobar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CarnetEmitidoModal({ onClose, onSave, miembros, personas }: any) {
  const [formData, setFormData] = useState({
    id_miembro: "",
    id_persona: "",
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: ""
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/carnets-emitidos', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al emitir carnet");
        return;
      }
      onSave();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrar personas del miembro seleccionado
  const personasDelMiembro = personas.filter((p: any) => p.vinculaciones?.some((v: any) => v.id_miembro === parseInt(formData.id_miembro)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--background)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--accent)]/30">
          <h2 className="text-xl font-bold">Emitir Carnet (Gastar 1 Crédito)</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded-xl transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Miembro (Con créditos)</label>
            <select required value={formData.id_miembro} onChange={e => setFormData({...formData, id_miembro: e.target.value, id_persona: ""})} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 focus:ring-2 focus:ring-primary">
              <option value="">Seleccione un miembro...</option>
              {miembros.map((m: any) => <option key={m.id} value={m.id}>{m.razon_social} ({m.carnets_disponibles} disp.)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Persona (Vinculada al miembro)</label>
            <select required disabled={!formData.id_miembro} value={formData.id_persona} onChange={e => setFormData({...formData, id_persona: e.target.value})} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 focus:ring-2 focus:ring-primary disabled:opacity-50">
              <option value="">Seleccione una persona...</option>
              {personasDelMiembro.map((p: any) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
            </select>
          </div>
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-xl font-semibold transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/30">Emitir Carnet</button>
          </div>
        </form>
      </div>
    </div>
  );
}

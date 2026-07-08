import { useState, useEffect } from "react";
import { Search, DollarSign, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export function AbonosCreditoTab({ onOpenDetalle }: { onOpenDetalle: (venta: any) => void }) {
  const [ventas, setVentas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'todos' | 'cliente' | 'fecha'>('todos');
  
  const [showAbonoModal, setShowAbonoModal] = useState<any>(null);
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo Divisas");
  const [referencia, setReferencia] = useState("");
  const [tasa, setTasa] = useState("1");

  const loadVentasCredito = () => {
    fetch("/api/tasca/ventas")
      .then(res => res.json())
      .then((data: any[]) => {
        setVentas(data.filter(v => v.estado === 'Credito' || v.estado === 'Parcial'));
      })
      .catch(console.error);

    fetch("/api/pagos/init")
      .then(res => res.json())
      .then(data => {
        if (data.tasa_dia) setTasa(data.tasa_dia.toString());
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadVentasCredito();
  }, []);

  const handleAbonar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAbonoModal || !montoAbono || parseFloat(montoAbono) <= 0) return;

    const amount = parseFloat(montoAbono);
    const needsBs = metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo Bs');

    if ((metodoPago.includes('Transferencia') || metodoPago.includes('Zelle')) && !referencia) {
        return alert("La referencia es obligatoria para este método de pago");
    }

    fetch(`/api/tasca/ventas/${showAbonoModal.id}/pagar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pagos: [
          {
            metodo_pago: metodoPago,
            monto_usd: amount,
            tasa: parseFloat(tasa),
            monto_bs: needsBs ? amount * parseFloat(tasa) : 0,
            referencia: referencia
          }
        ]
      })
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al procesar el abono");
        }
        setShowAbonoModal(null);
        setMontoAbono("");
        setReferencia("");
        loadVentasCredito();
      })
      .catch(err => alert(err.message));
  };

  const getClienteNombre = (v: any) => {
    if (v.cliente_foraneo) return v.cliente_foraneo.nombre;
    if (v.miembro) return v.miembro.razon_social;
    return "Desconocido";
  };

  // Calcula el saldo pendiente
  const getSaldoPendiente = (v: any) => {
    const total = parseFloat(v.total) - parseFloat(v.descuento || "0");
    const pagado = v.pagos?.reduce((acc: number, p: any) => acc + parseFloat(p.pivot?.monto_abonado_usd || 0), 0) || 0;
    return Math.max(0, total - pagado);
  };

  const filtered = ventas.filter(v => {
    const term = search.toLowerCase();
    if (filterType === 'cliente') {
      return getClienteNombre(v).toLowerCase().includes(term);
    } else if (filterType === 'fecha') {
      return format(new Date(v.fecha), 'dd/MM/yyyy').includes(term) || format(new Date(v.fecha), 'yyyy-MM-dd').includes(term);
    }
    return getClienteNombre(v).toLowerCase().includes(term) || v.id.toString().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={filterType === 'fecha' ? "Buscar por fecha (ej: 08/07/2026)" : "Buscar cliente o # factura..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
          style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="todos">Filtro General</option>
          <option value="cliente">Por Cliente</option>
          <option value="fecha">Por Fecha</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(v => {
          const saldo = getSaldoPendiente(v);
          return (
            <div key={v.id} className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ backgroundColor: "var(--card)" }}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{getClienteNombre(v)}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {format(new Date(v.fecha), 'dd/MM/yyyy')} (Fac #{v.id})
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${v.estado === 'Parcial' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {v.estado}
                  </span>
                </div>
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4 text-center">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Saldo Pendiente</p>
                  <p className="text-2xl font-black text-red-700">${saldo.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onOpenDetalle(v)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex justify-center items-center gap-1"
                >
                  <FileText size={16} /> Ver
                </button>
                <button 
                  onClick={() => { setShowAbonoModal(v); setMontoAbono(saldo.toFixed(2)); }}
                  className="flex-1 py-2 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-1"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                >
                  <DollarSign size={16} /> Abonar
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No hay facturas con saldo pendiente para mostrar.
          </div>
        )}
      </div>

      {showAbonoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)" }}>
            <h2 className="text-xl font-bold mb-2">Registrar Abono</h2>
            <p className="text-sm text-gray-500 mb-6">
              Abono para Factura #{showAbonoModal.id} de {getClienteNombre(showAbonoModal)}.
              <br />Saldo actual: <span className="font-bold text-red-600">${getSaldoPendiente(showAbonoModal).toFixed(2)}</span>
            </p>

            <form onSubmit={handleAbonar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monto a Abonar (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required type="number" step="0.01" min="0.01" max={getSaldoPendiente(showAbonoModal)}
                    className="w-full pl-10 p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--background)" }}
                    value={montoAbono} onChange={e => setMontoAbono(e.target.value)} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Método de Pago</label>
                <select 
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Efectivo Divisas">Efectivo Divisas</option>
                  <option value="Pago Movil/Transferencia">Pago Móvil / Transferencia</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Punto de Venta/POS">Punto de Venta / POS</option>
                  <option value="Efectivo Bs.">Efectivo Bs.</option>
                </select>
              </div>

              {!metodoPago.includes('Efectivo') && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Referencia</label>
                  <input 
                    type="text" 
                    value={referencia} 
                    onChange={e => setReferencia(e.target.value)} 
                    placeholder={(metodoPago.includes('Transferencia') || metodoPago.includes('Zelle')) ? 'Obligatorio' : 'Opcional'}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {montoAbono && (metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo VES') || metodoPago.includes('Pago Móvil')) && (
                  <p className="text-xs text-gray-500 font-bold mb-3 border-l-4 border-blue-500 pl-3">Equivalente: Bs. {(parseFloat(montoAbono) * parseFloat(tasa)).toFixed(2)} (Tasa: {tasa})</p>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                <button type="button" onClick={() => setShowAbonoModal(null)} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors">
                  Registrar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

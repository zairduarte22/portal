import { useState, useEffect, useMemo } from "react";
import { Search, DollarSign, Calendar, FileText, CheckSquare, Square, User } from "lucide-react";
import { format } from "date-fns";

export function AbonosCreditoTab({ onOpenDetalle }: { onOpenDetalle: (venta: any) => void }) {
  const [ventas, setVentas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  const [showAbonoModal, setShowAbonoModal] = useState<any>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo Divisas");
  const [referencia, setReferencia] = useState("");
  const [tasa, setTasa] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const getClienteNombre = (v: any) => {
    if (v.cliente_foraneo) return v.cliente_foraneo.nombre;
    if (v.miembro) return v.miembro.razon_social;
    return "Desconocido";
  };

  const getSaldoPendiente = (v: any) => {
    const total = parseFloat(v.total) - parseFloat(v.descuento || "0");
    const pagado = v.pagos?.reduce((acc: number, p: any) => acc + parseFloat(p.pivot?.monto_abonado_usd || 0), 0) || 0;
    return Math.max(0, total - pagado);
  };

  const clientesAgrupados = useMemo(() => {
    const map = new Map<string, { clienteNombre: string, ventas: any[], totalDeuda: number }>();
    
    ventas.forEach(v => {
      const nombre = getClienteNombre(v);
      if (!map.has(nombre)) {
        map.set(nombre, { clienteNombre: nombre, ventas: [], totalDeuda: 0 });
      }
      const group = map.get(nombre)!;
      group.ventas.push(v);
      group.totalDeuda += getSaldoPendiente(v);
    });

    const term = search.toLowerCase();
    return Array.from(map.values()).filter(g => g.clienteNombre.toLowerCase().includes(term));
  }, [ventas, search]);

  const handleToggleInvoice = (vId: number) => {
    setSelectedInvoices(prev => {
      const isSelected = prev.includes(vId);
      const newSelection = isSelected ? prev.filter(id => id !== vId) : [...prev, vId];
      
      const suggestedAmount = newSelection.reduce((acc, id) => {
        const v = showAbonoModal?.ventas.find((v: any) => v.id === id);
        return acc + (v ? getSaldoPendiente(v) : 0);
      }, 0);
      
      setMontoAbono(suggestedAmount > 0 ? suggestedAmount.toFixed(2) : "");
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === showAbonoModal?.ventas.length) {
      setSelectedInvoices([]);
      setMontoAbono("");
    } else {
      const allIds = showAbonoModal?.ventas.map((v: any) => v.id) || [];
      setSelectedInvoices(allIds);
      const total = showAbonoModal?.ventas.reduce((acc: number, v: any) => acc + getSaldoPendiente(v), 0) || 0;
      setMontoAbono(total > 0 ? total.toFixed(2) : "");
    }
  };

  const handleAbonarMultiples = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAbonoModal || !montoAbono || parseFloat(montoAbono) <= 0 || selectedInvoices.length === 0) return;

    let amountToDistribute = parseFloat(montoAbono);
    const needsBs = metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo Bs');

    if ((metodoPago.includes('Transferencia') || metodoPago.includes('Zelle')) && !referencia) {
        return alert("La referencia es obligatoria para este método de pago");
    }

    const sortedInvoices = [...showAbonoModal.ventas]
      .filter(v => selectedInvoices.includes(v.id))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    setIsProcessing(true);

    try {
      for (const v of sortedInvoices) {
        if (amountToDistribute <= 0) break;

        const saldo = getSaldoPendiente(v);
        const pagoAsignado = Math.min(amountToDistribute, saldo);
        
        amountToDistribute -= pagoAsignado;
        amountToDistribute = Math.round(amountToDistribute * 100) / 100;

        const res = await fetch(`/api/tasca/ventas/${v.id}/pagar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pagos: [
              {
                metodo_pago: metodoPago,
                monto_usd: pagoAsignado,
                tasa: parseFloat(tasa),
                monto_bs: needsBs ? pagoAsignado * parseFloat(tasa) : 0,
                referencia: referencia
              }
            ]
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Error al procesar el abono en la factura #${v.id}`);
        }
      }

      setShowAbonoModal(null);
      setMontoAbono("");
      setReferencia("");
      setSelectedInvoices([]);
      loadVentasCredito();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientesAgrupados.map((grupo, idx) => (
          <div key={idx} className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ backgroundColor: "var(--card)" }}>
            <div>
              <div className="flex justify-between items-start mb-3 border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 text-gray-500 rounded-full">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 leading-tight">{grupo.clienteNombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">{grupo.ventas.length} factura(s) pendiente(s)</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4 text-center">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Deuda Total</p>
                <p className="text-3xl font-black text-red-700">${grupo.totalDeuda.toFixed(2)}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowAbonoModal(grupo);
                setSelectedInvoices([]);
                setMontoAbono("");
              }}
              className="w-full py-3 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-sm hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
            >
              <DollarSign size={18} /> Pagar Facturas
            </button>
          </div>
        ))}
        
        {clientesAgrupados.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No hay clientes con saldo pendiente para mostrar.
          </div>
        )}
      </div>

      {showAbonoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-2xl shadow-xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "var(--card)" }}>
            <h2 className="text-xl font-bold mb-2">Registrar Abono: {showAbonoModal.clienteNombre}</h2>
            <p className="text-sm text-gray-500 mb-6">
              Deuda Total: <span className="font-bold text-red-600">${showAbonoModal.totalDeuda.toFixed(2)}</span>
            </p>

            <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-2 border-y py-4">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg mb-2 cursor-pointer border" onClick={handleSelectAll}>
                <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
                  {selectedInvoices.length === showAbonoModal.ventas.length ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-gray-400" size={18} />}
                  Seleccionar Todas
                </div>
                <span className="text-xs text-gray-500">{selectedInvoices.length} seleccionadas</span>
              </div>
              
              {showAbonoModal.ventas.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map((v: any) => {
                const saldo = getSaldoPendiente(v);
                const isSelected = selectedInvoices.includes(v.id);
                return (
                  <div key={v.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleToggleInvoice(v.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-gray-400" size={18} />}
                      <div>
                        <p className="font-semibold text-sm">Factura #{v.id}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12}/> {format(new Date(v.fecha), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                       <button onClick={(e) => { e.stopPropagation(); onOpenDetalle(v); }} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 bg-white border px-2 py-1 rounded shadow-sm">
                         <FileText size={12}/> Ver Detalles
                       </button>
                       <span className="font-bold text-red-600 block w-20 text-right">${saldo.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAbonarMultiples} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto a Abonar (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input required type="number" step="0.01" min="0.01" 
                      className="w-full pl-10 p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 font-bold"
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

              {montoAbono && (metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo Bs') || metodoPago.includes('Pago Móvil')) && (
                  <p className="text-xs text-gray-500 font-bold mb-3 border-l-4 border-blue-500 pl-3">Equivalente: Bs. {(parseFloat(montoAbono) * parseFloat(tasa)).toFixed(2)} (Tasa: {tasa})</p>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
                <button type="button" onClick={() => setShowAbonoModal(null)} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold" disabled={isProcessing}>
                  Cancelar
                </button>
                <button type="submit" disabled={isProcessing || selectedInvoices.length === 0} className="px-5 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg">
                  {isProcessing ? 'Procesando Abonos...' : 'Registrar Abono Multiple'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

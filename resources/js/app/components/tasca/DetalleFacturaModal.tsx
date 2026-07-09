import { X, Receipt, CheckCircle, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

export function DetalleFacturaModal({ venta, onClose }: { venta: any, onClose: () => void }) {
  if (!venta) return null;

  const isSolvente = venta.miembro && venta.miembro.solvencia === 'Solvente';
  const subtotal = venta.detalles?.reduce((acc: number, d: any) => acc + parseFloat(d.subtotal), 0) || 0;
  const descuento = parseFloat(venta.descuento || "0");
  const total = parseFloat(venta.total || "0") - descuento;

  const pagado = venta.pagos?.reduce((acc: number, p: any) => acc + parseFloat(p.pivot?.monto_abonado_usd || 0), 0) || 0;
  const saldoPendiente = Math.max(0, total - pagado);

  const getClienteNombre = () => {
    if (venta.cliente_foraneo) return venta.cliente_foraneo.nombre;
    if (venta.miembro) return venta.miembro.razon_social;
    return "Desconocido";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "var(--card)" }}>
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <Receipt size={24} className="text-blue-500" />
              Factura #{venta.id}
            </h2>
            <p className="text-sm mt-1 flex items-center gap-2 text-gray-500">
              <Clock size={14} />
              {format(new Date(venta.fecha), 'dd/MM/yyyy')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-bold text-gray-800">{getClienteNombre()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {venta.miembro ? "Miembro" : "Foráneo"} {isSolvente && <span className="text-green-600 font-bold">(Solvente)</span>}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                venta.estado === 'Pagada' ? 'bg-green-100 text-green-700' :
                venta.estado === 'Credito' ? 'bg-blue-100 text-blue-700' :
                venta.estado === 'Parcial' ? 'bg-orange-100 text-orange-700' :
                venta.estado === 'Anulada' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {venta.estado}
              </span>
            </div>
            {venta.autorizador && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Crédito Autorizado Por</p>
                  <p className="font-bold text-orange-900">{venta.autorizador.nombre}</p>
                </div>
                <CheckCircle size={24} className="text-orange-500" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
              <FileText size={18} /> Detalle de Consumo
            </h3>
            <div className="space-y-3">
              {venta.detalles?.map((d: any) => (
                <div key={d.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                      {d.cantidad}x
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{d.producto?.nombre_completo || d.producto?.nombre}</p>
                      <p className="text-xs text-gray-500">${parseFloat(d.precio_unitario).toFixed(2)} c/u</p>
                    </div>
                  </div>
                  <p className="font-black text-gray-800">${parseFloat(d.subtotal).toFixed(2)}</p>
                </div>
              ))}
              {(!venta.detalles || venta.detalles.length === 0) && (
                <p className="text-center text-gray-400 py-4 italic">No hay productos facturados.</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-sm space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Descuento (5%)</span>
                <span>-${descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black text-blue-900 border-t border-gray-200 pt-3 mt-2">
              <span>Total Facturado</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {venta.pagos && venta.pagos.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
                <CheckCircle size={18} className="text-green-500" /> Historial de Pagos y Abonos
              </h3>
              <div className="space-y-2">
                {venta.pagos.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-green-50/50 rounded-xl border border-green-100">
                    <div>
                      <p className="font-bold text-green-800 text-sm">{p.metodo_pago}</p>
                      <p className="text-xs text-green-600/70">{format(new Date(p.fecha_pago), 'dd/MM/yyyy')} {p.referencia ? `• Ref: ${p.referencia}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-green-700 block">${parseFloat(p.pivot?.monto_abonado_usd || 0).toFixed(2)}</span>
                      {parseFloat(p.monto_bs || 0) > 0 && (
                        <span className="text-xs font-bold text-green-600/80 block">Bs. {parseFloat(p.monto_bs).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {saldoPendiente > 0.01 && venta.estado !== 'Anulada' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center">
              <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Saldo Pendiente</p>
              <p className="text-3xl font-black text-orange-700">${saldoPendiente.toFixed(2)}</p>
              <p className="text-xs text-orange-600 mt-2">Los abonos se realizan desde la pestaña "Abonos a Crédito".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

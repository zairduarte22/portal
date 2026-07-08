import { useState, useEffect } from "react";
import { Store, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export function ComprasTascaPanel({ miembroId }: { miembroId: number }) {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/miembros/${miembroId}/tasca-creditos`)
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [miembroId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando compras...</div>;
  }

  const totalPendiente = ventas.reduce((acc, v) => acc + (parseFloat(v.pendiente) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", border: "1px solid #fcd34d" }}>
        <div>
          <h3 className="text-sm font-bold uppercase text-yellow-800 tracking-wider">Saldo Pendiente Tasca</h3>
          <p className="text-3xl font-black mt-1 text-yellow-900">${totalPendiente.toFixed(2)}</p>
        </div>
        <Store size={40} className="text-yellow-600 opacity-50" />
      </div>

      <div className="rounded-3xl p-5" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Compras a Crédito</h4>
        
        {ventas.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>
            <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
            No hay facturas pendientes en la tasca.
          </p>
        ) : (
          <div className="space-y-3">
            {ventas.map((v) => (
              <div key={v.id} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border transition-all hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-800">#{v.id}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-bold">
                      {format(new Date(v.fecha), 'dd/MM/yyyy')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.estado === 'Parcial' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {v.estado}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    {v.detalles?.map((d: any) => (
                      <div key={d.id}>- {d.cantidad}x {d.producto?.nombre_completo || d.producto?.nombre}</div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Deuda</p>
                  <p className="text-lg font-black text-red-600">${parseFloat(v.pendiente).toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">Total: ${(parseFloat(v.total) - parseFloat(v.descuento || "0")).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

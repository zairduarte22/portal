import { useState, useEffect } from "react";
import { Plus, Search, Store, FileText, Ban, DollarSign, CreditCard, Activity, Printer } from "lucide-react";
import { format } from "date-fns";

import { NuevaVentaModal } from "./NuevaVentaModal";
import { useNavigate } from "react-router-dom";
import { AbonosCreditoTab } from "./tabs/AbonosCreditoTab";
import { DetalleFacturaModal } from "./DetalleFacturaModal";
import { ReporteVentasModal } from "./ReporteVentasModal";

export function VentasTascaPanel() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showNuevaVenta, setShowNuevaVenta] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'historial' | 'abonos'>('historial');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const navigate = useNavigate();

  const loadVentas = () => {
    fetch("/api/tasca/ventas")
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(console.error);

    fetch("/api/tasca/ventas/estadisticas")
      .then(res => res.json())
      .then(data => setEstadisticas(data))
      .catch(console.error);
  };

  useEffect(() => {
    loadVentas();
  }, []);

  const handleAnular = (id: number) => {
    if (confirm("¿Estás seguro de anular esta venta? El stock se devolverá al inventario.")) {
      fetch(`/api/tasca/ventas/${id}/anular`, { method: "POST" })
        .then(async res => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Error al anular");
          }
          loadVentas();
        })
        .catch(err => alert(err.message));
    }
  };

  const getClienteNombre = (v: any) => {
    if (v.cliente_foraneo) return v.cliente_foraneo.nombre + " (Foráneo)";
    if (v.miembro) return v.miembro.razon_social + " (Miembro)";
    return "Sin Cliente";
  };

  const handleVerDetalles = (v: any) => {
    if (v.estado === 'Pendiente') {
      navigate(`/admin/ventas-tasca/${v.id}`);
    } else {
      setVentaSeleccionada(v);
    }
  };

  const filtered = ventas.filter(v => 
    getClienteNombre(v).toLowerCase().includes(search.toLowerCase()) || 
    v.id.toString().includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Store size={28} className="text-green-600" />
            Ventas de Tasca
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Facturación y cobro en la tasca</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors font-bold shadow-sm"
          >
            <FileText size={18} /> Cierre del Día
          </button>
          <button 
            onClick={() => setShowNuevaVenta(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-md transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            <Plus size={18} /> Nueva Venta
          </button>
        </div>
      </div>

      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        <button 
          onClick={() => setActiveTab('historial')} 
          className={`pb-3 px-6 text-sm font-bold ${activeTab === 'historial' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Historial de Ventas
        </button>
        <button 
          onClick={() => setActiveTab('abonos')} 
          className={`pb-3 px-6 text-sm font-bold ${activeTab === 'abonos' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Abonos a Crédito
        </button>
      </div>

      {activeTab === 'historial' ? (
        <>
          {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 rounded-2xl border flex items-center gap-4 bg-white shadow-sm">
            <div className="p-4 bg-green-100 text-green-600 rounded-xl"><DollarSign size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ventas del Día</p>
              <h3 className="text-2xl font-black">${parseFloat(estadisticas.ventas_dia_usd).toFixed(2)}</h3>
            </div>
          </div>
          <div className="p-6 rounded-2xl border flex items-center gap-4 bg-white shadow-sm">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">A Crédito (Hoy)</p>
              <h3 className="text-2xl font-black">${parseFloat(estadisticas.credito_otorgado_hoy).toFixed(2)}</h3>
            </div>
          </div>
          <div className="p-6 rounded-2xl border flex items-center gap-4 bg-white shadow-sm">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Activity size={24} /></div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Desglose de Pagos</p>
              <div className="text-xs space-y-1">
                {Object.entries(estadisticas.desglose_pagos || {}).map(([metodo, monto]: any) => (
                  <div key={metodo} className="flex justify-between font-medium">
                    <span>{metodo}</span>
                    <span className="text-gray-700">${parseFloat(monto).toFixed(2)}</span>
                  </div>
                ))}
                {Object.keys(estadisticas.desglose_pagos || {}).length === 0 && (
                  <span className="text-gray-400">Sin pagos registrados hoy.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente o ID de venta..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                <th className="pb-3 font-semibold text-sm"># Venta</th>
                <th className="pb-3 font-semibold text-sm">Fecha</th>
                <th className="pb-3 font-semibold text-sm">Cliente</th>
                <th className="pb-3 font-semibold text-sm">Estado</th>
                <th className="pb-3 font-semibold text-sm">Total (USD)</th>
                <th className="pb-3 font-semibold text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-gray-50/5">
                  <td className="py-3 font-medium">#{v.id}</td>
                  <td className="py-3 text-sm">{format(new Date(v.fecha), 'dd/MM/yyyy')}</td>
                  <td className="py-3 text-sm font-medium">{getClienteNombre(v)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      v.estado === 'Pagada' ? 'bg-green-100 text-green-700' :
                      v.estado === 'Credito' ? 'bg-blue-100 text-blue-700' :
                      v.estado === 'Parcial' ? 'bg-orange-100 text-orange-700' :
                      v.estado === 'Anulada' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {v.estado}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-gray-800">${(parseFloat(v.total) - parseFloat(v.descuento || "0")).toFixed(2)}</td>
                  <td className="py-3">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => handleVerDetalles(v)} className="p-2 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Ver Detalles">
                        <FileText size={16} />
                      </button>
                      <a href={`/api/tasca/ventas/${v.id}/ticket`} target="_blank" className="p-2 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title="Imprimir Ticket">
                        <Printer size={16} />
                      </a>
                      {v.estado !== 'Anulada' && (
                        <button onClick={() => handleAnular(v.id)} className="p-2 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Anular Venta">
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No hay ventas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        <AbonosCreditoTab onOpenDetalle={(v) => setVentaSeleccionada(v)} />
      )}

      {showNuevaVenta && (
        <NuevaVentaModal
          onClose={() => setShowNuevaVenta(false)}
          onVentaCreated={(ventaId) => {
            setShowNuevaVenta(false);
            navigate(`/admin/ventas-tasca/${ventaId}`);
          }}
        />
      )}

      {ventaSeleccionada && (
        <DetalleFacturaModal 
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}

      {showReportModal && (
        <ReporteVentasModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}

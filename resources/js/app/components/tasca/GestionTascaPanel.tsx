import { useState, useEffect } from "react";
import { Package, Beaker, Archive, Layers, Bell, AlertTriangle, FileText, Download } from "lucide-react";
import ProductosTab from "./tabs/ProductosTab";
import LotesTab from "./tabs/LotesTab";
import GastosTab from "./tabs/GastosTab";

export function GestionTascaPanel() {
  const [activeTab, setActiveTab] = useState<'productos' | 'lotes' | 'gastos'>('productos');
  const [expiringLotes, setExpiringLotes] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = () => {
    fetch("/api/tasca/insumos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);

          const expiring: any[] = [];
          data.forEach(insumo => {
            if (insumo.lotes) {
              insumo.lotes.forEach((lote: any) => {
                if (lote.fecha_caducidad && parseFloat(lote.stock_actual) > 0) {
                  // Ajustar fecha sumando 12 horas para evitar problemas de zona horaria si cae en día anterior
                  const expDate = new Date(`${lote.fecha_caducidad}T12:00:00Z`);
                  if (expDate <= thirtyDaysFromNow) {
                    expiring.push({
                      id: lote.id || Math.random(),
                      insumo_nombre: insumo.nombre,
                      fecha_caducidad: lote.fecha_caducidad,
                      stock: lote.stock_actual,
                      isExpired: expDate < today
                    });
                  }
                }
              });
            }
          });
          setExpiringLotes(expiring);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Polling cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between relative">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Package size={28} className="text-green-600" />
            Gestión de Inventario y Productos (Tasca)
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Administra tu catálogo de productos, presentaciones de venta, compras y gastos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open('/api/tasca/insumos/reporte?formato=pdf', '_blank')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Descargar Reporte en PDF"
          >
            <FileText size={18} className="text-red-500" />
            PDF
          </button>
          
          <button 
            onClick={() => window.open('/api/tasca/insumos/reporte?formato=excel', '_blank')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Descargar Reporte en Excel (CSV)"
          >
            <Download size={18} className="text-green-600" />
            Excel
          </button>

          <div className="relative ml-2">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors relative shadow-sm"
            >
              <Bell size={20} className="text-gray-600" />
              {expiringLotes.length > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {expiringLotes.length}
                </span>
              )}
            </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                <span className="font-bold text-sm text-gray-700">Notificaciones</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  {expiringLotes.length} Alertas
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {expiringLotes.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No hay productos próximos a vencer.
                  </div>
                ) : (
                  <div className="divide-y">
                    {expiringLotes.map((lote) => (
                      <div key={lote.id} className={`p-4 flex gap-3 ${lote.isExpired ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                        <div className={`mt-0.5 ${lote.isExpired ? 'text-red-600' : 'text-amber-500'}`}>
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {lote.insumo_nombre}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {lote.isExpired ? (
                              <span className="text-red-600 font-semibold">¡Vencido el {lote.fecha_caducidad}!</span>
                            ) : (
                              <span>Vence el: <span className="font-semibold text-amber-600">{lote.fecha_caducidad}</span></span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Stock restante: {lote.stock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('productos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'productos' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Archive size={16} /> Catálogo de Productos
        </button>
        <button
          onClick={() => setActiveTab('lotes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'lotes' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers size={16} /> Compras y Entradas
        </button>
        <button
          onClick={() => setActiveTab('gastos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'gastos' ? 'bg-white shadow-sm text-red-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Beaker size={16} /> Gastos y Proveedores
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'productos' && <ProductosTab />}
        {activeTab === 'lotes' && <LotesTab />}
        {activeTab === 'gastos' && <GastosTab />}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Package, Beaker, Archive, Layers, Bell, AlertTriangle, FileText, Download } from "lucide-react";
import ProductosTab from "../tabs/ProductosTab";
import LotesTab from "../tabs/LotesTab";
import GastosTab from "../tabs/GastosTab";

export function UgaviBarInventario() {
  const [expiringLotes, setExpiringLotes] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = () => {
    fetch("/api/tienda/notificaciones")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExpiringLotes(data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    const timer = setTimeout(fetchNotifications, 1000); // Cargar notificaciones 1 segundo después
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Package size={28} className="text-green-600 shrink-0" />
            Gestión de Inventario (Tasca)
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Administra tu catálogo de productos, compras y gastos.
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={() => window.open('/api/tienda/insumos/reporte?formato=pdf', '_blank')}
            className="flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2 text-sm font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Descargar Reporte en PDF"
          >
            <FileText size={18} className="text-red-500" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          
          <button 
            onClick={() => window.open('/api/tienda/insumos/reporte?formato=excel', '_blank')}
            className="flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2 text-sm font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Descargar Reporte en Excel (CSV)"
          >
            <Download size={18} className="text-green-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <div className="relative ml-1 sm:ml-2">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 sm:p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors relative shadow-sm"
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
                <span className="font-bold text-gray-700">Notificaciones</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {expiringLotes.length} alertas
                </span>
              </div>
              <div className="bg-white">
                {expiringLotes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No hay notificaciones ni alertas activas.
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {expiringLotes.map((notif: any) => (
                      <div key={notif.id} className={`p-4 flex gap-3 ${notif.isExpired || notif.type === 'low_stock' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                        <div className={`mt-0.5 ${notif.isExpired || notif.type === 'low_stock' ? 'text-red-600' : 'text-amber-500'}`}>
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {notif.insumo_nombre}
                          </p>
                          {notif.type === 'low_stock' ? (
                            <>
                              <p className="text-xs text-red-600 font-semibold mt-1">
                                ¡Stock Crítico!
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Stock actual: {notif.stock} (Mínimo: {notif.stock_seguridad})
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-600 mt-1">
                                {notif.isExpired ? (
                                  <span className="text-red-600 font-semibold">¡Vencido el {notif.fecha_caducidad}!</span>
                                ) : (
                                  <span>Vence el: <span className="font-semibold text-amber-600">{notif.fecha_caducidad}</span></span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Stock restante: {notif.stock}
                              </p>
                            </>
                          )}
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

      <div className="mt-4">
        <ProductosTab />
      </div>
    </div>
  );
}

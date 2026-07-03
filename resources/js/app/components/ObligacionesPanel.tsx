import { useState, useEffect } from "react";
import { Handshake, Plus, Search, Loader2, ArrowRightLeft, CheckCircle2, Clock } from "lucide-react";
import { ObligacionModal } from "./ObligacionModal";
import { AbonoModal } from "./AbonoModal";
import DetalleObligacionModal from "./DetalleObligacionModal";

export function ObligacionesPanel() {
  const [activeTab, setActiveTab] = useState<"COBRAR" | "PAGAR">("COBRAR");
  const [obligaciones, setObligaciones] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [selectedObligacion, setSelectedObligacion] = useState<any>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/finanzas/obligaciones/config");
      if (res.ok) setConfig(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finanzas/obligaciones?tipo=${activeTab}`);
      if (res.ok) {
        setObligaciones(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const openAbonoModal = (obligacion: any) => {
    setSelectedObligacion(obligacion);
    setAbonoModalOpen(true);
  };

  const openDetalleModal = (obligacion: any) => {
    setSelectedObligacion(obligacion);
    setDetalleModalOpen(true);
  };

  const filteredData = obligaciones.filter(item => {
    const term = searchTerm.toLowerCase();
    return item.tercero?.toLowerCase().includes(term) ||
           item.categoria?.toLowerCase().includes(term) ||
           item.descripcion?.toLowerCase().includes(term);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <span className="px-2 py-1 rounded-md text-[0.65rem] font-bold bg-orange-100 text-orange-700 flex items-center gap-1 w-max"><Clock size={12} /> PENDIENTE</span>;
      case 'PARCIAL':
        return <span className="px-2 py-1 rounded-md text-[0.65rem] font-bold bg-blue-100 text-blue-700 flex items-center gap-1 w-max"><ArrowRightLeft size={12} /> PARCIAL</span>;
      case 'PAGADA':
        return <span className="px-2 py-1 rounded-md text-[0.65rem] font-bold bg-green-100 text-green-700 flex items-center gap-1 w-max"><CheckCircle2 size={12} /> PAGADA</span>;
      default:
        return <span className="px-2 py-1 rounded-md text-[0.65rem] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Handshake size={24} className="text-blue-500" />
            Cuentas por {activeTab === "COBRAR" ? "Cobrar (Préstamos)" : "Pagar (Pasivos)"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Gestiona deudas, préstamos, impuestos y otras obligaciones financieras.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
        >
          <Plus size={18} />
          Nueva Operación
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-card rounded-2xl p-4 border flex flex-col sm:flex-row gap-4 items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="flex bg-gray-100 p-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
          <button
            onClick={() => setActiveTab("COBRAR")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "COBRAR" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Por Cobrar
          </button>
          <button
            onClick={() => setActiveTab("PAGAR")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "PAGAR" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Por Pagar
          </button>
        </div>
        
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          </div>
          <input
            type="text"
            placeholder="Buscar por tercero, categoría..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-blue-600">
            <Loader2 className="animate-spin w-8 h-8 mb-4" />
            <p className="font-bold">Cargando obligaciones...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Emisión</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Vencimiento</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Tercero / Categoría</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right" style={{ color: "var(--muted-foreground)" }}>Deuda Total</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right" style={{ color: "var(--muted-foreground)" }}>Abonado</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right" style={{ color: "var(--muted-foreground)" }}>Restante</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>Estado</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredData.map((item) => {
                  const restante = Number(item.monto_original) - Number(item.monto_abonado);
                  const isPagada = item.estado === 'PAGADA';
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                          {item.fecha_emision ? new Date(item.fecha_emision + "T12:00:00Z").toLocaleDateString("es-VE") : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold ${!item.fecha_limite ? 'text-gray-400' : (new Date(item.fecha_limite + "T12:00:00Z") < new Date() && !isPagada) ? 'text-red-500' : 'text-gray-600'}`}>
                          {item.fecha_limite ? new Date(item.fecha_limite + "T12:00:00Z").toLocaleDateString("es-VE") : "Sin Límite"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{item.tercero}</span>
                          <span className="text-[0.65rem] font-medium" style={{ color: "var(--muted-foreground)" }}>{item.categoria}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="text-xs font-bold text-gray-700">
                          {item.moneda === "USD" ? "$" : "Bs."} {Number(item.monto_original).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="text-xs font-bold text-green-600">
                          {item.moneda === "USD" ? "$" : "Bs."} {Number(item.monto_abonado).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className={`text-xs font-bold ${restante > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {item.moneda === "USD" ? "$" : "Bs."} {restante.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center flex justify-center mt-1.5">
                        {getStatusBadge(item.estado)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          {!isPagada && (
                            <button
                              onClick={() => openAbonoModal(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                            >
                              Abonar
                            </button>
                          )}
                          <button
                            onClick={() => openDetalleModal(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            Detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm font-bold" style={{ color: "var(--muted-foreground)" }}>
                      No se encontraron registros de obligaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ObligacionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        tipo={activeTab}
        config={config}
      />

      <AbonoModal
        isOpen={abonoModalOpen}
        onClose={() => setAbonoModalOpen(false)}
        onSuccess={fetchData}
        obligacion={selectedObligacion}
        config={config}
      />

      <DetalleObligacionModal
        isOpen={detalleModalOpen}
        onClose={() => setDetalleModalOpen(false)}
        onSuccess={fetchData}
        obligacion={selectedObligacion}
        config={config}
      />
    </div>
  );
}

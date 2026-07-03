import { useState, useEffect } from "react";
import { BookOpen, Search, Download, Loader2, ArrowUpRight, ArrowDownRight, Eye, Edit2, Trash2 } from "lucide-react";
import { FinanzasLibroModal } from "./FinanzasLibroModal";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../utils/dateUtils";

export function LibrosPanel() {
  const [activeTab, setActiveTab] = useState<"ventas" | "compras">("ventas");
  const [ventas, setVentas] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState(getFirstDayOfMonth());
  const [fechaFin, setFechaFin] = useState(getLastDayOfMonth());
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleExport = () => {
    let url = `/api/finanzas/libro-${activeTab}/exportar?`;
    if (fechaInicio) url += `desde=${fechaInicio}&`;
    if (fechaFin) url += `hasta=${fechaFin}`;
    window.open(url, '_blank');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "ventas") {
        const res = await fetch("/api/finanzas/libro-ventas");
        if (res.ok) setVentas(await res.json());
      } else {
        const res = await fetch("/api/finanzas/libro-compras");
        if (res.ok) setCompras(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro? Esto podría afectar la conciliación si es un registro de ventas.")) return;
    try {
      const res = await fetch(`/api/finanzas/libro/${activeTab}/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Error al eliminar el registro.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al eliminar.");
    }
  };

  const openModal = (record: any, mode: "view" | "edit") => {
    setSelectedRecord(record);
    setModalMode(mode);
    setModalOpen(true);
  };

  const dataToDisplay = activeTab === "ventas" ? ventas : compras;
  
  const filteredData = dataToDisplay.filter(item => {
    const term = searchTerm.toLowerCase();
    const referenceMatch = item.referencia?.toLowerCase().includes(term);
    const dateMatch = item.fecha?.includes(term);
    const invoiceMatch = item.numero_factura?.toLowerCase().includes(term);
    const personMatch = activeTab === "ventas" 
      ? item.miembro_nombre?.toLowerCase().includes(term)
      : item.proveedor_nombre?.toLowerCase().includes(term);
    
    let matchesSearch = referenceMatch || dateMatch || invoiceMatch || personMatch;
    
    let matchesDate = true;
    if (fechaInicio && item.fecha) {
        matchesDate = matchesDate && item.fecha >= fechaInicio;
    }
    if (fechaFin && item.fecha) {
        matchesDate = matchesDate && item.fecha <= fechaFin;
    }

    return matchesSearch && matchesDate;
  });

  const totalUSD = filteredData.reduce((acc, val) => acc + Number(val.monto || 0), 0);
  const totalBs = filteredData.reduce((acc, val) => acc + Number(val.monto_bs || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <BookOpen size={24} style={{ color: "#3b82f6" }} />
            Libros Contables
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Visualiza y exporta los libros de ventas e ingresos y compras.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
        >
          <Download size={18} />
          Exportar a Excel
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-card rounded-2xl p-4 border flex flex-col sm:flex-row gap-4 items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="flex bg-gray-100 p-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
          <button
            onClick={() => setActiveTab("ventas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "ventas" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <ArrowUpRight size={16} />
            Libro de Ventas
          </button>
          <button
            onClick={() => setActiveTab("compras")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "compras" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <ArrowDownRight size={16} />
            Libro de Compras
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase text-gray-500">Desde:</span>
            <input 
              type="date" 
              className="px-3 py-1.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase text-gray-500">Hasta:</span>
            <input 
              type="date" 
              className="px-3 py-1.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <input
              type="text"
              placeholder="Buscar referencia o fecha..."
              className="w-full pl-10 pr-4 py-1.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 border flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Total USD (Filtrado)</p>
            <h2 className="text-3xl font-black mt-1" style={{ color: activeTab === "ventas" ? "#16a34a" : "#ef4444" }}>
              ${totalUSD.toFixed(2)}
            </h2>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Total Bs (Filtrado)</p>
            <h2 className="text-3xl font-black mt-1" style={{ color: "var(--foreground)" }}>
              Bs. {totalBs.toFixed(2)}
            </h2>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-blue-600">
            <Loader2 className="animate-spin w-8 h-8 mb-4" />
            <p className="font-bold">Cargando libro contable...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Fecha</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    {activeTab === "ventas" ? "Miembro (Cliente)" : "Proveedor"}
                  </th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Ref / Pago</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>N° Factura</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right" style={{ color: "var(--muted-foreground)" }}>Monto $</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right" style={{ color: "var(--muted-foreground)" }}>Monto Bs</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                        {item.fecha ? new Date(item.fecha + "T12:00:00Z").toLocaleDateString("es-VE") : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                          {activeTab === "ventas" ? (item.miembro_nombre || "General") : (item.proveedor_nombre || "Desconocido")}
                        </span>
                        <span className="text-[0.65rem]" style={{ color: "var(--muted-foreground)" }}>
                          {activeTab === "ventas" ? (item.miembro_rif || "") : (item.proveedor_rif || "")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 max-w-fit">
                          {item.referencia || "-"}
                        </span>
                        <span className="text-[0.65rem] mt-1" style={{ color: "var(--muted-foreground)" }}>
                          {item.metodo_pago || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                          {item.numero_factura || "-"}
                        </span>
                        <span className="text-[0.65rem]" style={{ color: "var(--muted-foreground)" }}>
                          Ctrl: {item.numero_control || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className="text-xs font-bold text-green-600">
                        ${Number(item.monto || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                        Bs. {Number(item.monto_bs || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(item, "view")} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-colors" title="Ver detalles">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openModal(item, "edit")} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-green-600 transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors" title="Borrar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm font-bold" style={{ color: "var(--muted-foreground)" }}>
                      No se encontraron registros contables.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FinanzasLibroModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        record={selectedRecord}
        tipo={activeTab}
        mode={modalMode}
      />
    </div>
  );
}

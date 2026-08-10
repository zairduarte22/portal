import { useState, useEffect } from "react";
import { Landmark, Search, Download, Loader2, DollarSign, Wallet, Eye, Edit2, Trash2 } from "lucide-react";
import { TiendaBancoModal } from "./TiendaBancoModal";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../utils/dateUtils";

export function TiendaBancosPanel({ tiendaId }: { tiendaId: number }) {
  const [activeTab, setActiveTab] = useState<"ves" | "usd">("ves");
  const [datosVes, setDatosVes] = useState<any[]>([]);
  const [datosUsd, setDatosUsd] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState(getFirstDayOfMonth());
  const [fechaFin, setFechaFin] = useState(getLastDayOfMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [categoriasFondo, setCategoriasFondo] = useState<any[]>([]);
  const [beneficiariosFondo, setBeneficiariosFondo] = useState<any[]>([]);

  const fetchHeaders = {
    'X-Tienda-Id': tiendaId.toString(),
    'Accept': 'application/json'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("desde", fechaInicio);
      if (fechaFin) params.append("hasta", fechaFin);
      const queryStr = params.toString() ? `?${params.toString()}` : "";

      if (activeTab === "ves") {
        const res = await fetch(`/api/tienda/finanzas/conciliacion/ves${queryStr}`, { headers: fetchHeaders });
        if (res.ok) setDatosVes(await res.json());
      } else {
        const res = await fetch(`/api/tienda/finanzas/conciliacion/usd${queryStr}`, { headers: fetchHeaders });
        if (res.ok) setDatosUsd(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/finanzas/categorias-fondo", { headers: fetchHeaders });
      if (res.ok) setCategoriasFondo(await res.json());
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const fetchBeneficiarios = async () => {
    try {
      const res = await fetch("/api/finanzas/beneficiarios-fondo", { headers: fetchHeaders });
      if (res.ok) setBeneficiariosFondo(await res.json());
    } catch (error) {
      console.error("Error cargando beneficiarios:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchBeneficiarios();
  }, [tiendaId]);

  useEffect(() => {
    fetchData();
  }, [activeTab, fechaInicio, fechaFin, tiendaId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este movimiento bancario?")) return;
    try {
      const res = await fetch(`/api/tienda/finanzas/conciliacion/${activeTab}/${id}`, {
        method: "DELETE",
        headers: fetchHeaders
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

  const openModal = (record: any, mode: "view" | "edit" | "create") => {
    setSelectedRecord(record);
    setModalMode(mode);
    setModalOpen(true);
  };

  const dataToDisplay = activeTab === "ves" ? datosVes : datosUsd;
  
  const filteredData = dataToDisplay.filter(item => {
    const term = searchTerm.toLowerCase();
    const referenceMatch = item.referencia?.toLowerCase().includes(term);
    const descMatch = item.descripcion?.toLowerCase().includes(term);
    const bankMatch = item.banco_nombre?.toLowerCase().includes(term);
    const opMatch = item.tipo_operacion?.toLowerCase().includes(term);
    const catMatch = item.categoria_nombre?.toLowerCase().includes(term);
    const benMatch = (item.beneficiario_nombre || item.beneficiario)?.toLowerCase().includes(term);
    
    return referenceMatch || descMatch || bankMatch || opMatch || catMatch || benMatch;
  });

  const totalIngresos = filteredData.reduce((acc, val) => acc + Number(val.debe || 0), 0); // En DB debe = ingreso
  const totalEgresos = filteredData.reduce((acc, val) => acc + Number(val.haber || 0), 0); // En DB haber = egreso
  const saldoNeto = totalIngresos - totalEgresos;

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Landmark size={24} className="text-orange-600" />
            Bancos de Tienda
          </h1>
          <p className="text-sm mt-1 text-gray-500">
            Supervisa los movimientos bancarios de las cuentas asociadas a esta tienda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal({}, "create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 bg-gray-800 text-white"
          >
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border flex flex-col sm:flex-row gap-4 items-center justify-between border-gray-200">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("ves")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "ves" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Wallet size={16} />
            Cuentas en Bs (VES)
          </button>
          <button
            onClick={() => setActiveTab("usd")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "usd" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <DollarSign size={16} />
            Cuentas en Divisas (USD)
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="date"
              className="px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-orange-200"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              title="Fecha desde"
            />
            <input
              type="date"
              className="px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-orange-200"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              title="Fecha hasta"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Debe (Ingresos)</p>
          <h2 className="text-2xl font-black mt-1 text-green-600">
            {activeTab === "ves" ? "Bs." : "$"} {totalIngresos.toFixed(2)}
          </h2>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Haber (Egresos)</p>
          <h2 className="text-2xl font-black mt-1 text-red-600">
            {activeTab === "ves" ? "Bs." : "$"} {totalEgresos.toFixed(2)}
          </h2>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Saldo Neto del Filtro</p>
          <h2 className={`text-2xl font-black mt-1 ${saldoNeto >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {activeTab === "ves" ? "Bs." : "$"} {saldoNeto.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border overflow-hidden border-gray-200 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-orange-600">
            <Loader2 className="animate-spin w-8 h-8 mb-4" />
            <p className="font-bold">Cargando movimientos bancarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Fecha</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Banco</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Operación</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Categoría</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Referencia</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Beneficiario</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Descripción</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right text-gray-500">Debe</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right text-gray-500">Haber</th>
                  <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-800">
                        {item.fecha ? new Date(item.fecha + "T12:00:00Z").toLocaleDateString("es-VE") : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-gray-800">
                        {item.banco_nombre || "Desconocido"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md text-[0.65rem] font-bold bg-gray-100 text-gray-700">
                        {item.tipo_operacion || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                        {item.categoria_nombre || "Sin categoría"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-gray-500">
                        {item.referencia || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {item.beneficiario_nombre || item.beneficiario || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-64">
                      <span className="text-xs text-gray-800">
                        {item.descripcion || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className="text-xs font-bold text-green-600">
                        {Number(item.debe || 0) > 0 ? (activeTab === "ves" ? `Bs. ${Number(item.debe).toFixed(2)}` : `$${Number(item.debe).toFixed(2)}`) : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className="text-xs font-bold text-red-600">
                        {Number(item.haber || 0) > 0 ? (activeTab === "ves" ? `Bs. ${Number(item.haber).toFixed(2)}` : `$${Number(item.haber).toFixed(2)}`) : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(item, "view")} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-colors" title="Ver detalles">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openModal(item, "edit")} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-orange-600 transition-colors" title="Editar">
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
                    <td colSpan={10} className="px-6 py-12 text-center text-sm font-bold text-gray-400">
                      No se encontraron movimientos conciliatorios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TiendaBancoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        record={selectedRecord}
        tipo={activeTab}
        mode={modalMode}
        categorias={categoriasFondo}
        refreshCategorias={fetchCategorias}
        beneficiarios={beneficiariosFondo}
        refreshBeneficiarios={fetchBeneficiarios}
        tiendaId={tiendaId}
      />
    </div>
  );
}

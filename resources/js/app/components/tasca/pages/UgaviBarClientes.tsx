import React, { useState, useEffect } from "react";
import { Users, UserPlus, Search, Edit2, Trash2, Shield, User, MapPin } from "lucide-react";
import { toast } from "sonner";

export function UgaviBarClientes() {
  const [foraneos, setForaneos] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos"); // 'todos', 'miembros', 'foraneos'

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: "", cedula: "", telefono: "" });

  const fetchClientes = () => {
    fetch("/api/tienda/clientes")
      .then(res => res.json())
      .then(data => {
        setForaneos(data.foraneos || []);
        setMiembros(data.miembros || []);
      })
      .catch(err => toast.error("Error cargando clientes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!formData.id;
    const url = isEditing ? `/api/tienda/clientes/${formData.id}` : `/api/tienda/clientes`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Error guardando cliente");
      toast.success(isEditing ? "Cliente actualizado" : "Cliente creado");
      setShowModal(false);
      fetchClientes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este cliente foráneo?")) return;
    try {
      const res = await fetch(`/api/tienda/clientes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando");
      toast.success("Cliente eliminado");
      fetchClientes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (cliente: any) => {
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre || "",
      cedula: cliente.cedula || "",
      telefono: cliente.telefono || ""
    });
    setShowModal(true);
  };

  const openNew = () => {
    setFormData({ id: null, nombre: "", cedula: "", telefono: "" });
    setShowModal(true);
  };

  // Combinar clientes y normalizar formato para la tabla
  const combinedClientes = [
    ...miembros.map(m => ({
      ...m,
      is_miembro: true,
      display_name: m.razon_social,
      display_id: m.ci_rif,
      display_phone: m.persona?.telefono || m.celular || "N/A",
      total_compras: m.total_compras || 0,
      total_gastado: m.total_gastado || 0,
      producto_favorito: m.producto_favorito || "N/A"
    })),
    ...foraneos.map(f => ({
      ...f,
      is_miembro: false,
      display_name: f.nombre,
      display_id: f.cedula,
      display_phone: f.telefono || "N/A",
      total_compras: f.total_compras || 0,
      total_gastado: f.total_gastado || 0,
      producto_favorito: f.producto_favorito || "N/A"
    }))
  ];

  const filteredClientes = combinedClientes.filter(c => {
    if (filter === 'miembros' && !c.is_miembro) return false;
    if (filter === 'foraneos' && c.is_miembro) return false;
    
    const term = search.toLowerCase();
    return c.display_name.toLowerCase().includes(term) || (c.display_id && c.display_id.toLowerCase().includes(term));
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-sans text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-green-600" size={28} />
            Gestión de Clientes
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Administra los clientes foráneos y consulta miembros.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 w-full sm:w-auto justify-center"
        >
          <UserPlus size={18} />
          Nuevo Foráneo
        </button>
      </div>

      {/* Glassmorphism Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl p-5 border border-white/20 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Clientes</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5 font-sans">{foraneos.length + miembros.length}</h3>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl p-5 border border-white/20 backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Miembros Activos</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5 font-sans">{miembros.length}</h3>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl p-5 border border-white/20 backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20">
              <User size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Foráneos</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5 font-sans">{foraneos.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('todos')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'todos' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('miembros')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'miembros' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Miembros
          </button>
          <button 
            onClick={() => setFilter('foraneos')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'foraneos' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Foráneos
          </button>
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium">Cargando clientes...</div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium">No se encontraron clientes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Identificación</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Métricas</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClientes.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center font-bold text-sm ${c.is_miembro ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {c.display_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{c.display_name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${c.is_miembro ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                            {c.is_miembro ? 'Miembro' : 'Foráneo'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                      {c.display_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                      {c.display_phone}
                    </td>
                    <td className="px-6 py-4 min-w-[250px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium text-xs">Total Gastado:</span>
                          <span className="font-bold text-green-600">${Number(c.total_gastado).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium text-xs">Compras Totales:</span>
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md text-xs">{c.total_compras}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium text-xs">Fav:</span>
                          <span className="font-bold text-gray-700 text-xs truncate max-w-[120px]" title={c.producto_favorito}>{c.producto_favorito}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {!c.is_miembro ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          <span className="text-xs text-gray-400 font-medium">Solo Vista</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD Foráneo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 font-sans mb-6">
              {formData.id ? "Editar Foráneo" : "Nuevo Foráneo"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Cédula / Identificación</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"
                  value={formData.cedula}
                  onChange={e => setFormData({...formData, cedula: e.target.value})}
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"
                  value={formData.telefono}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                  placeholder="Ej: 0414-1234567"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

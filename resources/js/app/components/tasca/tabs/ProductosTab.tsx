import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Package, Beaker, ChevronDown, ChevronUp } from "lucide-react";

interface Presentacion {
  id?: number;
  nombre: string;
  precio: number;
  medida_descuento: number;
  codigo_barras?: string;
}

export default function ProductosTab() {
  const [productos, setProductos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Modal state
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "Licores",
    inventario_inicial: "",
    costo_inicial: ""
  });
  
  const [presentaciones, setPresentaciones] = useState<Presentacion[]>([
    { nombre: "Botella/Unidad", precio: 0, medida_descuento: 1 }
  ]);

  const loadProductos = () => {
    fetch("/api/tasca/insumos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          setProductos([]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ nombre: "", categoria: "Licores", inventario_inicial: "", costo_inicial: "" });
    setPresentaciones([{ nombre: "Unidad Completa", precio: 0, medida_descuento: 1, codigo_barras: "" }]);
    setShowModal(true);
  };

  const openEdit = (producto: any) => {
    setEditingId(producto.id);
    setFormData({ 
      nombre: producto.nombre, 
      categoria: producto.categoria || "Licores", 
      inventario_inicial: "", 
      costo_inicial: "" 
    });
    
    if (producto.productos && producto.productos.length > 0) {
      setPresentaciones(producto.productos.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        medida_descuento: p.medida_descuento,
        codigo_barras: p.codigo_barras || ""
      })));
    } else {
      setPresentaciones([{ nombre: "Unidad Completa", precio: 0, medida_descuento: 1, codigo_barras: "" }]);
    }
    setShowModal(true);
  };

  const addPresentacion = () => {
    setPresentaciones([...presentaciones, { nombre: "Trago", precio: 0, medida_descuento: 0.1, codigo_barras: "" }]);
  };

  const updatePresentacion = (index: number, field: keyof Presentacion, value: string | number) => {
    const updated = [...presentaciones];
    updated[index] = { ...updated[index], [field]: value };
    setPresentaciones(updated);
  };

  const removePresentacion = (index: number) => {
    if (presentaciones.length > 1) {
      setPresentaciones(presentaciones.filter((_, i) => i !== index));
    } else {
      alert("Debes tener al menos una presentación de venta.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nombre: formData.nombre,
      categoria: formData.categoria,
      inventario_inicial: formData.inventario_inicial ? parseFloat(formData.inventario_inicial) : 0,
      costo_inicial: formData.costo_inicial ? parseFloat(formData.costo_inicial) : 0,
      presentaciones: presentaciones.map(p => ({
        ...p,
        precio: parseFloat(p.precio.toString()),
        medida_descuento: parseFloat(p.medida_descuento.toString())
      }))
    };

    const url = editingId ? `/api/tasca/productos-completos/${editingId}` : "/api/tasca/productos-completos";
    const method = editingId ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || err.message || "Error al guardar el producto");
        }
        setShowModal(false);
        loadProductos();
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que deseas eliminar este producto físico y todo su historial/presentaciones?")) {
      fetch(`/api/tasca/insumos/${id}`, { method: "DELETE" })
        .then(async res => {
          if (!res.ok) throw new Error("Error al eliminar");
          loadProductos();
        })
        .catch(err => alert(err.message));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filtered = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex justify-between mb-6">
        <div className="relative w-1/2">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar productos (inventario)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-md transition-transform hover:scale-105"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
              <th className="pb-3 font-semibold text-sm w-8"></th>
              <th className="pb-3 font-semibold text-sm">Producto Base</th>
              <th className="pb-3 font-semibold text-sm">Categoría</th>
              <th className="pb-3 font-semibold text-sm">Stock Total (Unidades)</th>
              <th className="pb-3 font-semibold text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <React.Fragment key={p.id}>
                <tr style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-gray-50/5">
                  <td className="py-3">
                    <button onClick={() => toggleExpand(p.id)} className="p-1 rounded-full hover:bg-gray-200">
                      {expandedId === p.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                  <td className="py-3 font-bold text-gray-800 flex items-center gap-2">
                    <Package size={16} className="text-green-500" />
                    {p.nombre}
                  </td>
                  <td className="py-3 text-sm text-gray-600">{p.categoria || '-'}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock_total > 5 ? 'bg-green-100 text-green-700' : p.stock_total > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {parseFloat(p.stock_total).toFixed(2)} Unds
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Editar Producto y Presentaciones">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar Producto">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
                {expandedId === p.id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={5} className="px-10 py-4">
                      <h4 className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                        <Beaker size={14} className="text-purple-500" /> Presentaciones de Venta Asociadas
                      </h4>
                      {p.productos && p.productos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {p.productos.map((pres: any) => (
                            <div key={pres.id} className="bg-white p-3 rounded-lg border shadow-sm flex justify-between items-center">
                              <div>
                                <span className="font-semibold text-gray-700">{pres.nombre}</span>
                                {pres.codigo_barras && <span className="text-xs ml-2 text-gray-400">[{pres.codigo_barras}]</span>}
                                <p className="text-xs text-gray-500">Descuenta: {parseFloat(pres.medida_descuento)} unds</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-green-600">${parseFloat(pres.precio).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No hay presentaciones registradas para este producto.</p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No se encontraron productos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-2xl shadow-xl max-h-[90vh] flex flex-col" style={{ backgroundColor: "var(--card)" }}>
            <h2 className="text-xl font-bold mb-4 flex-shrink-0 text-green-700">
              {editingId ? "Editar Producto" : "Registrar Nuevo Producto"}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Package size={16}/> 1. Información del Producto Físico</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Nombre (Insumo)</label>
                    <input required type="text" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500"
                      value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} 
                      placeholder="Ej: Ron Cacique 0.70L" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Categoría</label>
                    <select className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500"
                      value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} >
                      <option value="Licores">Licores</option>
                      <option value="Cervezas">Cervezas</option>
                      <option value="Ingredientes">Ingredientes Comida</option>
                      <option value="Servicios">Servicios (Ej. Descorche)</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>
              </div>

              {!editingId && (
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-700 mb-1 text-sm">2. Inventario Inicial (Opcional)</h3>
                  <p className="text-xs text-gray-500 mb-3">Si tienes este producto en físico ahora mismo, indícalo aquí para agregarlo al stock.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Unidades Físicas (Stock)</label>
                      <input type="number" step="0.01" min="0" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                        value={formData.inventario_inicial} onChange={e => setFormData({...formData, inventario_inicial: e.target.value})} 
                        placeholder="Ej: 12" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Costo Unitario (USD)</label>
                      <input type="number" step="0.01" min="0" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                        value={formData.costo_inicial} onChange={e => setFormData({...formData, costo_inicial: e.target.value})} 
                        placeholder="Ej: 15.50 (Costo por unidad)" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2"><Beaker size={16} className="text-purple-600"/> 3. Presentaciones de Venta</h3>
                  <button type="button" onClick={addPresentacion} className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
                    <Plus size={14} /> Añadir Presentación
                  </button>
                </div>
                
                <div className="space-y-3">
                  {presentaciones.map((pres, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border shadow-sm">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-500">Nombre</label>
                        <input required type="text" className="w-full p-1.5 text-sm rounded border focus:ring-1 focus:ring-purple-500"
                          value={pres.nombre} onChange={e => updatePresentacion(idx, "nombre", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500">Unidades</label>
                        <input required type="number" step="0.01" min="0.01" className="w-full p-1.5 text-sm rounded border focus:ring-1 focus:ring-purple-500"
                          value={pres.medida_descuento} onChange={e => updatePresentacion(idx, "medida_descuento", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500">Precio ($)</label>
                        <input required type="number" step="0.01" min="0" className="w-full p-1.5 text-sm rounded border focus:ring-1 focus:ring-purple-500"
                          value={pres.precio} onChange={e => updatePresentacion(idx, "precio", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500">Código</label>
                        <input type="text" className="w-full p-1.5 text-sm rounded border focus:ring-1 focus:ring-purple-500"
                          value={pres.codigo_barras || ""} onChange={e => updatePresentacion(idx, "codigo_barras", e.target.value)} />
                      </div>
                      <div className="col-span-1 flex justify-center items-end pb-1">
                        <button type="button" onClick={() => removePresentacion(idx)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white font-bold bg-green-600 hover:bg-green-700 shadow-md">
                  Guardar Todo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

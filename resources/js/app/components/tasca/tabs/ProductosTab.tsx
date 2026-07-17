import React, { useState, useEffect } from "react";
import { BarChart, Search, Plus, Filter, FileText, ChevronDown, ChevronUp, History, Edit2, Trash2, Package, Beaker, Upload } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { MovimientosInsumoView } from "./MovimientosInsumoView";

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
  const [movimientosInsumo, setMovimientosInsumo] = useState<{id: number, nombre: string} | null>(null);
  
  // Modal state
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "Licores",
    inventario_inicial: "",
    costo_inicial: "",
    tipo: "fisico"
  });
  const [componentes, setComponentes] = useState<{id: number, cantidad: number, nombre: string}[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [presentaciones, setPresentaciones] = useState<Presentacion[]>([
    { nombre: "Botella/Unidad", precio: 0, medida_descuento: 1 }
  ]);

  // Auto-calcular precio para productos compuestos
  useEffect(() => {
    if (formData.tipo === 'compuesto' && componentes.length > 0) {
      const allPresentaciones = productos.flatMap(p => p.productos);
      let total = 0;
      componentes.forEach(c => {
        const prod = allPresentaciones.find(pr => pr.id === c.id);
        if (prod) {
          total += (parseFloat(prod.precio) * c.cantidad);
        }
      });
      
      if (presentaciones.length > 0 && parseFloat(presentaciones[0].precio.toString()) !== total) {
        const updated = [...presentaciones];
        updated[0] = { ...updated[0], precio: total };
        setPresentaciones(updated);
      }
    }
  }, [componentes, formData.tipo, productos]);

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
    setFormData({ nombre: "", categoria: "Licores", inventario_inicial: "", costo_inicial: "", tipo: "fisico" });
    setImageFile(null);
    setExistingImage(null);
    setComponentes([]);
    setPresentaciones([{ nombre: "Unidad Completa", precio: 0, medida_descuento: 1, codigo_barras: "" }]);
    setShowModal(true);
  };

  const openEdit = (producto: any) => {
    setEditingId(producto.id);
    const tipoProd = (producto.productos && producto.productos.length > 0) ? producto.productos[0].tipo : 'fisico';
    setFormData({ 
      nombre: producto.nombre, 
      categoria: producto.categoria || "Licores", 
      inventario_inicial: "", 
      costo_inicial: "",
      tipo: tipoProd || "fisico"
    });
    setImageFile(null);
    setExistingImage(producto.imagen ? `/storage/${producto.imagen}` : null);
    
    if (producto.productos && producto.productos.length > 0) {
      setPresentaciones(producto.productos.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        medida_descuento: p.medida_descuento,
        codigo_barras: p.codigo_barras || ""
      })));
      
      if (tipoProd === 'compuesto' && producto.productos[0].componentes) {
        setComponentes(producto.productos[0].componentes.map((c: any) => ({
          id: c.id,
          cantidad: c.pivot?.cantidad || 1,
          nombre: c.nombre_completo || c.nombre
        })));
      } else {
        setComponentes([]);
      }
    } else {
      setPresentaciones([{ nombre: "Unidad Completa", precio: 0, medida_descuento: 1, codigo_barras: "" }]);
      setComponentes([]);
    }
    setShowModal(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const options = {
          maxSizeMB: 0.5, // Máximo 500KB
          maxWidthOrHeight: 1200, // Máximo 1200px de ancho o alto
          useWebWorker: true,
          initialQuality: 0.8, // 80% de calidad inicial
        };
        const compressedFile = await imageCompression(file, options);
        setImageFile(compressedFile);
        setExistingImage(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Error comprimiendo imagen:", error);
        // Fallback si falla la compresión
        setImageFile(file);
        setExistingImage(URL.createObjectURL(file));
      }
    }
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append('nombre', formData.nombre);
    fd.append('categoria', formData.categoria);
    fd.append('tipo', formData.tipo);
    if (formData.inventario_inicial) fd.append('inventario_inicial', formData.inventario_inicial);
    if (formData.costo_inicial) fd.append('costo_inicial', formData.costo_inicial);

    fd.append('presentaciones', JSON.stringify(presentaciones.map(p => ({
      ...p,
      precio: parseFloat(p.precio.toString()),
      medida_descuento: parseFloat(p.medida_descuento.toString())
    }))));

    if (formData.tipo === 'compuesto' && componentes.length > 0) {
      componentes.forEach((c, index) => {
        fd.append(`componentes[${index}][id]`, c.id.toString());
        fd.append(`componentes[${index}][cantidad]`, c.cantidad.toString());
      });
    }

    if (imageFile) {
      fd.append('imagen', imageFile);
    }

    if (editingId) {
      fd.append('_method', 'PUT');
    }

    const url = editingId ? `/api/tasca/productos-completos/${editingId}` : "/api/tasca/productos-completos";

    fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json"
      },
      body: fd
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || err.message || "Error al guardar el producto");
        }
        setIsSubmitting(false);
        setShowModal(false);
        loadProductos();
      })
      .catch(err => {
        setIsSubmitting(false);
        alert(err.message);
      });
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
      {movimientosInsumo ? (
        <MovimientosInsumoView
          insumoId={movimientosInsumo.id}
          insumoNombre={movimientosInsumo.nombre}
          onClose={() => setMovimientosInsumo(null)}
          onAdjusted={loadProductos}
        />
      ) : (
        <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center border-b relative">
              {p.imagen_url || p.imagen ? (
                <img src={p.imagen_url || `/storage/${p.imagen}`} alt={p.nombre} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-gray-300" />
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => setMovimientosInsumo({id: p.id, nombre: p.nombre})} className="p-1.5 bg-white/90 text-purple-600 rounded-lg hover:bg-purple-100 shadow-sm transition-colors" title="Historial de Movimientos y Ajustes">
                  <History size={14} />
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 bg-white/90 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm transition-colors" title="Editar Producto y Presentaciones">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-white/90 text-red-600 rounded-lg hover:bg-red-100 shadow-sm transition-colors" title="Eliminar Producto">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{p.nombre}</h3>
              <p className="text-sm text-gray-500 mb-3">{p.categoria || "Sin categoría"}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-3 bg-gray-50 rounded-lg p-2 border border-gray-100 text-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Actual</p>
                  <span className={`inline-block px-1.5 py-0.5 mt-1 rounded text-xs font-bold ${
                    p.stock_total <= (p.stock_seguridad || 0) && p.stock_total > 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : p.stock_total === 0 
                        ? 'bg-red-100 text-red-700' 
                        : p.stock_total > (p.stock_maximo || 999999) 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                  }`}>
                    {parseFloat(p.stock_total).toFixed(1)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Min</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{p.stock_seguridad !== undefined ? parseFloat(p.stock_seguridad).toFixed(1) : '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Max</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{p.stock_maximo !== undefined ? parseFloat(p.stock_maximo).toFixed(1) : '-'}</p>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => toggleExpand(p.id)} 
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-500 py-2 hover:text-gray-800 transition-colors"
                >
                  <span className="flex items-center gap-1"><Beaker size={12} className="text-purple-500" /> Presentaciones ({p.productos?.length || 0})</span>
                  {expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {expandedId === p.id && (
                  <div className="mt-2 space-y-2 border-t pt-2">
                    {p.productos && p.productos.length > 0 ? (
                      p.productos.map((pres: any) => (
                        <div key={pres.id} className="bg-gray-50 p-2 rounded border border-gray-100 flex justify-between items-center">
                          <div className="overflow-hidden">
                            <p className="font-semibold text-gray-700 text-xs truncate" title={pres.nombre}>{pres.nombre}</p>
                            <p className="text-[10px] text-gray-500">Desc: {parseFloat(pres.medida_descuento)}</p>
                          </div>
                          <div className="text-right pl-2 shrink-0">
                            <p className="font-bold text-green-600 text-xs">${parseFloat(pres.precio).toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-2">No hay presentaciones.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border shadow-sm">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold">No se encontraron productos</p>
            <p className="text-sm">Ajusta tu búsqueda o crea un nuevo producto.</p>
          </div>
        )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Nombre (Insumo)</label>
                    <input required type="text" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500"
                      value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} 
                      placeholder="Ej: Ron Cacique 0.70L" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Tipo de Producto</label>
                    <select className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500 bg-green-50 font-semibold"
                      value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} >
                      <option value="fisico">Físico (Inventariable)</option>
                      <option value="servicio">Servicio (Sin Stock)</option>
                      <option value="compuesto">Compuesto (Combo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Categoría</label>
                    <select className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500"
                      value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} >
                      <option value="Licores">Licores</option>
                      <option value="Cervezas">Cervezas</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Dulces">Dulces</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Imagen del Producto (Opcional)</label>
                    <div className="flex items-center gap-4">
                      {existingImage && !imageFile && (
                        <img src={existingImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                      )}
                      {imageFile && (
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                      )}
                      <input type="file" accept="image/*" className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500 text-sm"
                        onChange={e => e.target.files && setImageFile(e.target.files[0])} />
                    </div>
                  </div>
                </div>
              </div>

              {!editingId && formData.tipo === 'fisico' && (
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-700 mb-1 text-sm">2. Inventario Inicial (Opcional)</h3>
                  <p className="text-xs text-gray-500 mb-3">Si tienes este producto en físico ahora mismo, indícalo aquí para agregarlo al stock.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {formData.tipo === 'compuesto' && (
                <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><Package size={16} className="text-orange-600"/> Componentes del Combo</h3>
                    <button type="button" onClick={() => setComponentes([...componentes, {id: 0, cantidad: 1, nombre: ""}])} className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1">
                      <Plus size={14} /> Añadir Producto
                    </button>
                  </div>
                  <div className="space-y-2">
                    {componentes.map((c, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500">Producto Físico</label>
                          <select className="w-full p-2 rounded border focus:ring-1 focus:ring-orange-500 text-sm"
                            value={c.id} onChange={e => {
                              const pId = parseInt(e.target.value);
                              const selected = productos.flatMap(p => p.productos).find(pr => pr.id === pId);
                              const updated = [...componentes];
                              updated[idx] = { ...c, id: pId, nombre: selected ? selected.nombre : "" };
                              setComponentes(updated);
                            }}>
                            <option value="0">Seleccionar...</option>
                            {productos.flatMap(p => p.productos).filter(pr => pr.tipo === 'fisico' || !pr.tipo).map(pr => (
                              <option key={pr.id} value={pr.id}>{pr.nombre_completo || pr.nombre}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-gray-500">Cantidad</label>
                          <input type="number" step="0.01" min="0.01" className="w-full p-2 rounded border focus:ring-1 focus:ring-orange-500 text-sm"
                            value={c.cantidad} onChange={e => {
                              const updated = [...componentes];
                              updated[idx].cantidad = parseFloat(e.target.value) || 1;
                              setComponentes(updated);
                            }} />
                        </div>
                        <button type="button" onClick={() => setComponentes(componentes.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {componentes.length === 0 && <p className="text-xs text-gray-400 italic text-center">No hay productos en este combo.</p>}
                  </div>
                </div>
              )}

              <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2"><Beaker size={16} className="text-purple-600"/> {formData.tipo === 'fisico' ? "3. Presentaciones de Venta" : "Precio de Venta"}</h3>
                  {formData.tipo === 'fisico' && (
                    <button type="button" onClick={addPresentacion} className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
                      <Plus size={14} /> Añadir Presentación
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {presentaciones.map((pres, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-2 items-center bg-white p-3 md:p-2 rounded-lg border shadow-sm relative">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-500">Nombre Presentación</label>
                        <input required type="text" className="w-full p-2 md:p-1.5 text-sm rounded border focus:ring-1 focus:ring-purple-500"
                          value={pres.nombre} onChange={e => updatePresentacion(idx, "nombre", e.target.value)} 
                          placeholder="Ej: Trago, Botella, Six-Pack" />
                      </div>
                      <div className="grid grid-cols-2 md:contents gap-3">
                        {formData.tipo === 'fisico' && (
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500">Unidades de Descuento</label>
                            <input required type="number" step="0.01" min="0.01" className="w-full p-2 md:p-1.5 text-sm rounded border focus:ring-1 focus:ring-purple-500"
                              value={pres.medida_descuento} onChange={e => updatePresentacion(idx, "medida_descuento", e.target.value)} 
                              title="Cuántas unidades físicas resta del inventario al vender esta presentación" />
                          </div>
                        )}
                        <div className={formData.tipo === 'fisico' ? "md:col-span-2" : "md:col-span-4"}>
                          <label className="block text-xs font-medium text-gray-500">Precio Venta ($)</label>
                          <input required type="number" step="0.01" min="0" className="w-full p-2 md:p-1.5 text-sm rounded border focus:ring-1 focus:ring-purple-500"
                            value={pres.precio} onChange={e => updatePresentacion(idx, "precio", e.target.value)} />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-blue-600">Código de Barras</label>
                        <input type="text" className="w-full p-2 md:p-1.5 text-sm rounded border-blue-300 focus:ring-1 focus:ring-blue-500"
                          value={pres.codigo_barras || ""} onChange={e => updatePresentacion(idx, "codigo_barras", e.target.value)} 
                          placeholder="Escanea o escribe" />
                      </div>
                      <div className="md:col-span-1 flex justify-end md:justify-center items-end md:pb-1 absolute top-2 right-2 md:relative md:top-0 md:right-0">
                        {formData.tipo === 'fisico' && (
                          <button type="button" onClick={() => removePresentacion(idx)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full md:bg-transparent md:p-1">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-white font-bold bg-green-600 hover:bg-green-700 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Todo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </>
      )}
    </div>
  );
}

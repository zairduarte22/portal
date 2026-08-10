import React, { useState, useEffect } from "react";
import { BarChart, Search, Plus, Filter, FileText, ChevronDown, ChevronUp, History, Edit2, Trash2, Package, Beaker, Upload, Target, X, DollarSign, TrendingUp, Box } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { MovimientosInsumoView } from "./MovimientosInsumoView";

interface Presentacion {
  id?: number;
  nombre: string;
  precio: number;
  precio_miembro?: number | string;
  medida_descuento: number;
  codigo_barras?: string;
}

export default function ProductosTab() {
  const [productos, setProductos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ultimoCosto, setUltimoCosto] = useState<number | null>(null);
  const [movimientosInsumo, setMovimientosInsumo] = useState<{id: number, nombre: string} | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");
  const [showMetrics, setShowMetrics] = useState(false);
  const [metricasReales, setMetricasReales] = useState({ totalProductos: 0, valorTotalCosto: 0, valorTotalVenta: 0 });
  
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
    { nombre: "Botella/Unidad", precio: 0, precio_miembro: "", medida_descuento: 1 }
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
    fetch("/api/tienda/insumos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          setProductos([]);
        }
      })
      .catch(console.error);

    fetch("/api/tienda/inventario/metricas")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalProductos !== 'undefined') {
          setMetricasReales(data);
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
    setPresentaciones([{ nombre: "Unidad Completa", precio: 0, precio_miembro: "", medida_descuento: 1, codigo_barras: "" }]);
    setUltimoCosto(null);
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
    if (producto.lotes && producto.lotes.length > 0) {
      const sortedLotes = [...producto.lotes].sort((a, b) => new Date(b.created_at || b.fecha_compra).getTime() - new Date(a.created_at || a.fecha_compra).getTime());
      setUltimoCosto(parseFloat(sortedLotes[0].costo_unitario));
    } else {
      setUltimoCosto(null);
    }
    
    if (producto.productos && producto.productos.length > 0) {
      setPresentaciones(producto.productos.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        precio_miembro: p.precio_miembro !== null && p.precio_miembro !== undefined ? parseFloat(p.precio_miembro) : "",
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
      setPresentaciones([{ nombre: "Unidad Completa", precio: 0, precio_miembro: "", medida_descuento: 1, codigo_barras: "" }]);
      setComponentes([]);
    }
    setShowModal(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const options = {
          maxSizeMB: 0.2, // Reducir a 200KB para carga más rápida
          maxWidthOrHeight: 800, // Reducir a 800px (suficiente para catálogos y POS)
          useWebWorker: true,
          initialQuality: 0.7, // 70% de calidad inicial
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
    setPresentaciones([...presentaciones, { nombre: "Trago", precio: 0, precio_miembro: "", medida_descuento: 0.1, codigo_barras: "" }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      precio_miembro: p.precio_miembro !== "" && p.precio_miembro !== undefined ? parseFloat(p.precio_miembro.toString()) : null,
      medida_descuento: parseFloat(p.medida_descuento.toString())
    }))));

    if (formData.tipo === 'compuesto' && componentes.length > 0) {
      componentes.forEach((c, index) => {
        fd.append(`componentes[${index}][id]`, c.id.toString());
        fd.append(`componentes[${index}][cantidad]`, c.cantidad.toString());
      });
    }

    if (imageFile) {
      try {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.8
        });
        fd.append('imagen', compressedFile);
      } catch (error) {
        console.error("Error comprimiendo imagen en frontend:", error);
        fd.append('imagen', imageFile); // fallback al original
      }
    }

    if (editingId) {
      fd.append('_method', 'PUT');
    }

    const url = editingId ? `/api/tienda/productos-completos/${editingId}` : "/api/tienda/productos-completos";

    fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json"
      },
      body: fd
    })
      .then(async res => {
        if (!res.ok) {
          let errorMessage = "Error al guardar el producto";
          try {
            const err = await res.json();
            errorMessage = err.error || err.message || errorMessage;
          } catch (e) {
            if (res.status === 413) {
              errorMessage = "La imagen es demasiado pesada para el servidor. Por favor, recórtala o sube una más pequeña.";
            } else {
              errorMessage = "Error en el servidor (" + res.status + "). Es probable que la imagen sea muy pesada y haya agotado la memoria.";
            }
          }
          throw new Error(errorMessage);
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
      fetch(`/api/tienda/insumos/${id}`, { method: "DELETE" })
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

  const filtered = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || p.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Cálculo de Métricas (ahora desde backend)
  const totalProductos = metricasReales.totalProductos;
  const valorTotalCosto = metricasReales.valorTotalCosto;
  const valorTotalVenta = metricasReales.valorTotalVenta;


  const categoriasUnicas = ["Todas", ...Array.from(new Set(productos.map(p => p.categoria || "Otros")))];

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
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar productos (inventario)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              style={{ color: "var(--foreground)", borderColor: "var(--border)" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white transition-transform hover:scale-105 w-full md:w-auto shadow-[4px_4px_10px_#a3b1c6,-4px_-4px_10px_#ffffff]"
          style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {/* VISTA MÓVIL (Cards) */}
      <div className="grid grid-cols-1 gap-6 mt-6 md:hidden">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-3xl overflow-hidden flex flex-col shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] border border-white">
            <div className="w-full h-40 bg-gray-50 flex items-center justify-center relative">
              {p.imagen_url || p.imagen ? (
                <img src={p.imagen_url || `/storage/${p.imagen}`} alt={p.nombre} className="w-full h-full object-cover" />
              ) : (
                <Package size={40} className="text-gray-300" />
              )}
            </div>

            <div className="p-5 flex flex-col flex-1 bg-gradient-to-br from-white to-gray-50/50">
              <h3 className="font-bold text-gray-800 text-xl leading-tight mb-1 font-sans line-clamp-2" title={p.nombre}>{p.nombre}</h3>
              <p className="text-sm text-gray-500 mb-4 truncate">{p.categoria || "Sin categoría"}</p>
              
              <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-2xl bg-[#f0f4f8] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-center">
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider truncate">Actual</p>
                  <span className={`inline-block px-2 py-1 mt-1.5 rounded-lg text-sm font-bold shadow-sm ${
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
                <div className="flex flex-col justify-center border-l border-gray-200/50">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Min</p>
                  <p className="text-sm font-bold text-gray-700 mt-1.5">{p.stock_seguridad !== undefined ? parseFloat(p.stock_seguridad).toFixed(1) : '-'}</p>
                </div>
                <div className="flex flex-col justify-center border-l border-gray-200/50">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Max</p>
                  <p className="text-sm font-bold text-gray-700 mt-1.5">{p.stock_maximo !== undefined ? parseFloat(p.stock_maximo).toFixed(1) : '-'}</p>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => toggleExpand(p.id)} 
                  className="w-full flex items-center justify-between text-sm font-bold text-gray-600 py-2 hover:text-gray-900 transition-colors"
                >
                  <span className="flex items-center gap-2"><Beaker size={16} className="text-[#1e3a8a]" /> Presentaciones ({p.productos?.length || 0})</span>
                  {expandedId === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {expandedId === p.id && (
                  <div className="mt-3 space-y-3 border-t border-gray-100 pt-3 mb-4">
                    {p.productos && p.productos.length > 0 ? (
                      p.productos.map((pres: any) => (
                        <div key={pres.id} className="bg-gray-50 p-3 rounded-2xl flex justify-between items-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)]">
                          <div className="overflow-hidden">
                            <p className="font-bold text-gray-700 text-sm truncate" title={pres.nombre}>{pres.nombre}</p>
                          </div>
                          <div className="text-right pl-3 shrink-0">
                            <p className="font-bold text-[#16a34a] text-sm">${parseFloat(pres.precio).toFixed(2)}</p>
                            {pres.precio_miembro !== null && pres.precio_miembro !== undefined && (
                              <p className="font-bold text-[#2563eb] text-xs">M: ${parseFloat(pres.precio_miembro).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-2">Sin presentaciones.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => setMovimientosInsumo({id: p.id, nombre: p.nombre})} className="flex-1 p-2 flex justify-center items-center bg-gray-50 text-purple-600 rounded-xl hover:bg-purple-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] transition-colors" title="Historial">
                    <History size={20} />
                  </button>
                  <button onClick={() => openEdit(p)} className="flex-1 p-2 flex justify-center items-center bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] transition-colors" title="Editar">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 p-2 flex justify-center items-center bg-gray-50 text-red-600 rounded-xl hover:bg-red-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] transition-colors" title="Eliminar">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VISTA ESCRITORIO (Tabla) */}
      <div className="hidden md:block overflow-x-auto mt-6 pb-4">
        <div className="rounded-3xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] bg-white overflow-hidden border border-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 rounded-tl-3xl">ID / Img</th>
                <th className="p-4">Producto & Categoría</th>
                <th className="p-4">Precios (Reg / Miembro)</th>
                <th className="p-4 text-center">Últ. Costo</th>
                <th className="p-4 text-center">Existencia (U / $)</th>
                <th className="p-4 text-center">Min/Max</th>
                <th className="p-4 rounded-tr-3xl text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => {
                let costoItem = 0;
                if (p.lotes && p.lotes.length > 0) {
                  const sortedLotes = [...p.lotes].sort((a, b) => new Date(b.created_at || b.fecha_compra).getTime() - new Date(a.created_at || a.fecha_compra).getTime());
                  costoItem = parseFloat(sortedLotes[0].costo_unitario);
                }
                const stockValVenta = p.productos?.length > 0 ? (parseFloat(p.stock_total) * Math.max(...p.productos.map((pr:any) => parseFloat(pr.precio)))) : 0;
                
                return (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                        {p.imagen_url || p.imagen ? (
                          <img src={p.imagen_url || `/storage/${p.imagen}`} alt="img" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-base">{p.nombre}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.categoria || "Sin categoría"}</div>
                    </td>
                    <td className="p-4">
                      {p.productos && p.productos.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {p.productos.slice(0, 2).map((pres:any) => (
                            <div key={pres.id} className="text-sm">
                              <span className="font-medium text-gray-600">{pres.nombre}:</span> 
                              <span className="font-bold text-green-600 ml-1">${parseFloat(pres.precio).toFixed(2)}</span>
                              {pres.precio_miembro && (
                                <span className="font-bold text-blue-500 ml-2 text-xs">(M: ${parseFloat(pres.precio_miembro).toFixed(2)})</span>
                              )}
                            </div>
                          ))}
                          {p.productos.length > 2 && <div className="text-xs text-gray-400 italic">+{p.productos.length - 2} más...</div>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-700">
                      ${costoItem.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-bold shadow-sm ${
                        p.stock_total <= (p.stock_seguridad || 0) && p.stock_total > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : p.stock_total === 0 
                            ? 'bg-red-100 text-red-700' 
                            : p.stock_total > (p.stock_maximo || 999999) 
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                      }`}>
                        {parseFloat(p.stock_total).toFixed(1)} u
                      </div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">
                        ≈ ${stockValVenta.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-gray-600">
                      <div>Min: {p.stock_seguridad || '-'}</div>
                      <div className="mt-1">Max: {p.stock_maximo || '-'}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setMovimientosInsumo({id: p.id, nombre: p.nombre})} className="p-2 bg-gray-50 text-purple-600 rounded-xl hover:bg-purple-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] transition-colors" title="Historial">
                          <History size={16} />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-2 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-gray-50 text-red-600 rounded-xl hover:bg-red-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {filtered.length === 0 && (
        <div className="py-12 mt-6 text-center text-gray-500 bg-white rounded-3xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-bold font-sans">No se encontraron productos</p>
          <p className="text-sm">Ajusta tu búsqueda o crea un nuevo producto.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/40 backdrop-blur-md transition-all">
          <div className="w-full max-w-3xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-h-[90vh] flex flex-col bg-white/95 backdrop-blur-xl border border-white overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 flex-shrink-0 bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a8a] to-[#10b981] font-sans">
              {editingId ? "Editar Producto" : "Registrar Nuevo Producto"}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 sm:pr-4 space-y-8 custom-scrollbar">
              
              {/* SECCIÓN 1: INFO */}
              <div className="bg-white/60 p-5 sm:p-7 rounded-3xl border border-white shadow-[0_8px_16px_rgba(0,0,0,0.03)]">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-3 text-lg"><Package size={20} className="text-[#3b82f6]"/> 1. Información del Producto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 ml-1">Nombre (Insumo)</label>
                    <input required type="text" 
                      className="w-full p-3.5 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 transition-all text-gray-800 font-medium"
                      value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} 
                      placeholder="Ej: Ron Cacique 0.70L" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 ml-1">Tipo de Producto</label>
                    <select 
                      className="w-full p-3.5 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 transition-all text-gray-800 font-bold"
                      value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} >
                      <option value="fisico">Físico (Inventariable)</option>
                      <option value="servicio">Servicio (Sin Stock)</option>
                      <option value="compuesto">Compuesto (Combo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 ml-1">Categoría</label>
                    <select 
                      className="w-full p-3.5 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 transition-all text-gray-800 font-medium"
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
                    <label className="block text-sm font-bold mb-3 text-gray-700 ml-1">Imagen del Producto (Opcional)</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      {existingImage && !imageFile && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] shrink-0">
                          <img src={existingImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {imageFile && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] shrink-0">
                          <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input type="file" accept="image/*" 
                        className="w-full p-3.5 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                        onChange={e => e.target.files && setImageFile(e.target.files[0])} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: INVENTARIO INICIAL */}
              {!editingId && formData.tipo === 'fisico' && (
                <div className="bg-blue-50/40 p-5 sm:p-7 rounded-3xl border border-white shadow-[0_8px_16px_rgba(0,0,0,0.03)]">
                  <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-3 text-lg"><Package size={20} className="text-blue-500"/> 2. Inventario Inicial (Opcional)</h3>
                  <p className="text-sm text-gray-500 mb-5 ml-8">Si tienes este producto en físico ahora mismo, indícalo aquí para agregarlo al stock.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700 ml-1">Unidades Físicas (Stock)</label>
                      <input type="number" step="0.01" min="0" 
                        className="w-full p-3.5 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 transition-all text-gray-800 font-medium"
                        value={formData.inventario_inicial} onChange={e => setFormData({...formData, inventario_inicial: e.target.value})} 
                        placeholder="Ej: 12" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700 ml-1">Costo Unitario (USD)</label>
                      <input type="number" step="0.01" min="0" 
                        className="w-full p-3.5 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 transition-all text-gray-800 font-medium"
                        value={formData.costo_inicial} onChange={e => setFormData({...formData, costo_inicial: e.target.value})} 
                        placeholder="Ej: 15.50 (Costo por unidad)" />
                    </div>
                  </div>
                </div>
              )}

              {formData.tipo === 'compuesto' && (
                <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2.5"><Package size={16} className="text-orange-600"/> Componentes del Combo</h3>
                    <button type="button" onClick={() => setComponentes([...componentes, {id: 0, cantidad: 1, nombre: ""}])} className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1">
                      <Plus size={14} /> Añadir Producto
                    </button>
                  </div>
                  <div className="space-y-2">
                    {componentes.map((c, idx) => (
                      <div key={idx} className="flex gap-2.5 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500">Producto Físico</label>
                          <select className="w-full p-2.5 rounded border focus:ring-1 focus:ring-orange-500 text-sm"
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
                          <input type="number" step="0.01" min="0.01" className="w-full p-2.5 rounded border focus:ring-1 focus:ring-orange-500 text-sm"
                            value={c.cantidad} onChange={e => {
                              const updated = [...componentes];
                              updated[idx].cantidad = parseFloat(e.target.value) || 1;
                              setComponentes(updated);
                            }} />
                        </div>
                        <button type="button" onClick={() => setComponentes(componentes.filter((_, i) => i !== idx))} className="text-red-500 p-2.5 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {componentes.length === 0 && <p className="text-xs text-gray-400 italic text-center">No hay productos en este combo.</p>}
                  </div>
                </div>
              )}

              {/* SECCIÓN 3: PRESENTACIONES DE VENTA */}
              <div className="bg-[#f0fdf4]/50 p-5 sm:p-7 rounded-3xl border border-white shadow-[0_8px_16px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-3 text-lg"><Beaker size={20} className="text-[#10b981]"/> {formData.tipo === 'fisico' ? "3. Presentaciones de Venta" : "Precio de Venta"}</h3>
                  {formData.tipo === 'fisico' && (
                    <button type="button" onClick={addPresentacion} className="px-4 py-2 rounded-xl text-sm font-bold text-[#10b981] hover:text-white bg-[#10b981]/10 hover:bg-[#10b981] flex items-center gap-2 transition-colors shadow-sm">
                      <Plus size={16} /> Añadir Presentación
                    </button>
                  )}
                </div>
                
                {editingId && ultimoCosto !== null && (
                  <div className="bg-[#1e3a8a]/5 p-4 rounded-2xl mb-6 flex items-center justify-between border border-[#1e3a8a]/10">
                    <span className="text-sm text-[#1e3a8a] font-bold">Último costo de compra:</span>
                    <span className="text-lg font-bold text-[#1e3a8a]">${ultimoCosto.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="space-y-6">
                  {presentaciones.map((pres, idx) => (
                    <div key={idx} className="bg-white/80 p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        <div className={formData.tipo === 'fisico' ? "md:col-span-3" : "md:col-span-4"}>
                          <label className="block text-xs font-bold mb-2 text-gray-600 ml-1">Nombre Presentación</label>
                          <input required type="text" 
                            className="w-full p-3 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-[#10b981] focus:bg-white focus:border-[#10b981] transition-all text-sm font-medium"
                            value={pres.nombre} onChange={e => updatePresentacion(idx, "nombre", e.target.value)} 
                            placeholder="Ej: Trago, Botella, Six-Pack" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:contents gap-5">
                          {formData.tipo === 'fisico' && (
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold mb-2 text-gray-600 ml-1 whitespace-nowrap overflow-hidden text-ellipsis">U. Desc.</label>
                              <input required type="number" step="0.01" min="0.01" 
                                className="w-full p-3 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-[#10b981] focus:bg-white focus:border-[#10b981] transition-all text-sm font-medium"
                                value={pres.medida_descuento} onChange={e => updatePresentacion(idx, "medida_descuento", e.target.value)} 
                                title="Cuántas unidades físicas resta del inventario al vender" />
                            </div>
                          )}
                          <div className="md:col-span-3">
                            <label className="block text-xs font-bold mb-2 text-gray-600 ml-1">Precio ($)</label>
                            <input required type="number" step="0.01" min="0" 
                              className="w-full p-3 rounded-xl border border-gray-200 shadow-sm bg-gray-50/50 focus:ring-2 focus:ring-[#10b981] focus:bg-white focus:border-[#10b981] transition-all text-sm font-bold text-gray-800"
                              value={pres.precio} onChange={e => updatePresentacion(idx, "precio", e.target.value)} />
                          </div>
                          <div className={formData.tipo === 'fisico' ? "md:col-span-4" : "md:col-span-5"}>
                            <label className="block text-xs font-bold text-[#2563eb] mb-2 ml-1">P. Miembro ($)</label>
                            <div className="flex gap-2">
                              <input type="number" step="0.01" min="0" 
                                className="w-full p-3 rounded-xl border border-blue-200 shadow-sm bg-blue-50/30 focus:ring-2 focus:ring-[#2563eb] focus:bg-white focus:border-[#2563eb] transition-all text-sm font-bold text-[#1e3a8a]"
                                value={pres.precio_miembro !== undefined ? pres.precio_miembro : ""} onChange={e => updatePresentacion(idx, "precio_miembro", e.target.value)}
                                placeholder="Regular" />
                              <button type="button" onClick={() => {
                                  const calc = parseFloat(pres.precio.toString()) * 0.9;
                                  if (!isNaN(calc)) updatePresentacion(idx, "precio_miembro", calc.toFixed(2));
                                }} 
                                className="flex-shrink-0 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-blue-600 px-3 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center active:scale-95" title="Calcular descuento (10%)">
                                -10%
                              </button>
                            </div>
                          </div>
                        </div>
                        {formData.tipo === 'fisico' && (
                          <div className="md:col-span-12 flex justify-end mt-2 md:mt-0 md:absolute md:-top-3 md:-right-3">
                            <button type="button" onClick={() => removePresentacion(idx)} className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-200/60 flex-shrink-0">
                    <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting} 
                      className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold shadow-sm hover:bg-gray-200 hover:shadow-md transition-all disabled:opacity-50">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold shadow-[0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        <>{editingId ? "Actualizar Todo" : "Guardar Todo"}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

        </>
      )}
      {/* WIDGET FLOTANTE DE MÉTRICAS (Glassmorfismo) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {showMetrics && (
          <div className="mb-4 p-5 rounded-3xl w-72 backdrop-blur-xl bg-[#1e3a8a]/80 border border-white/20 shadow-[0_8px_32px_rgba(30,58,138,0.37)] text-white transform transition-all duration-300 ease-out origin-bottom-right">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold font-sans text-lg flex items-center gap-2">
                <Box size={20} className="text-[#10b981]" /> Métricas Totales
              </h4>
              <button onClick={() => setShowMetrics(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <p className="text-xs text-white/70 uppercase tracking-wide font-bold mb-1">Productos Únicos (Físicos)</p>
                <p className="text-2xl font-bold text-white flex items-center gap-2">
                  <Package size={24} className="text-[#10b981]" /> {totalProductos}
                </p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <p className="text-xs text-white/70 uppercase tracking-wide font-bold mb-1">Valor Total (Costo)</p>
                <p className="text-xl font-bold text-[#93c5fd] flex items-center gap-2">
                  <DollarSign size={20} /> {valorTotalCosto.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <p className="text-xs text-white/70 uppercase tracking-wide font-bold mb-1">Valor Total (PVP Proyectado)</p>
                <p className="text-xl font-bold text-[#34d399] flex items-center gap-2">
                  <TrendingUp size={20} /> {valorTotalVenta.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className={`flex items-center justify-center p-4 rounded-full shadow-[0_8px_32px_rgba(30,58,138,0.3)] backdrop-blur-xl transition-all duration-300 border ${
            showMetrics 
              ? 'bg-[#10b981]/80 text-white rotate-90 scale-90 border-white/30' 
              : 'bg-white/30 text-[#1e3a8a] border-white/50 hover:bg-white/40 hover:scale-110'
          }`}
          title="Ver Métricas de Inventario"
        >
          {showMetrics ? <X size={24} /> : <Box size={28} />}
        </button>
      </div>
    </div>
  );
}

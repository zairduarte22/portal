import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, DollarSign, ListFilter, PlusCircle, X } from "lucide-react";
import { format } from "date-fns";

export default function GastosTab() {
  const [gastos, setGastos] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [gastoEditId, setGastoEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    categoria: "Compra de Mercancia",
    descripcion: "",
    monto_usd: "",
    monto_bs: "",
    metodo_pago: "Efectivo Divisas",
    referencia_pago: "",
    fecha: new Date().toISOString().split('T')[0],
    proveedor_id: ""
  });

  const loadGastos = () => {
    setLoading(true);
    fetch("/api/tasca/gastos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGastos(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadProveedores = () => {
    fetch("/api/tasca/proveedores")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProveedores(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadGastos();
    loadProveedores();
  }, []);

  const openNewGasto = () => {
    setGastoEditId(null);
    setForm({
      categoria: "Compra de Mercancia",
      descripcion: "",
      monto_usd: "",
      monto_bs: "",
      metodo_pago: "Efectivo Divisas",
      referencia_pago: "",
      fecha: new Date().toISOString().split('T')[0],
      proveedor_id: ""
    });
    setShowGastoModal(true);
  };

  const openEditGasto = (gasto: any) => {
    setGastoEditId(gasto.id);
    setForm({
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      monto_usd: gasto.monto_usd,
      monto_bs: gasto.monto_bs || "",
      metodo_pago: gasto.metodo_pago,
      referencia_pago: gasto.referencia_pago || "",
      fecha: gasto.fecha,
      proveedor_id: gasto.proveedor_id?.toString() || ""
    });
    setShowGastoModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = gastoEditId ? `/api/tasca/gastos/${gastoEditId}` : "/api/tasca/gastos";
    const method = gastoEditId ? "PUT" : "POST";
    
    const payload = {
      ...form,
      monto_usd: parseFloat(form.monto_usd),
      monto_bs: form.monto_bs ? parseFloat(form.monto_bs) : null,
      proveedor_id: form.proveedor_id ? parseInt(form.proveedor_id) : null
    };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) throw new Error("Error al guardar gasto");
        setShowGastoModal(false);
        loadGastos();
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este gasto?")) {
      fetch(`/api/tasca/gastos/${id}`, { method: "DELETE" })
        .then(async res => {
          if (!res.ok) throw new Error("Error al eliminar");
          loadGastos();
        })
        .catch(err => alert(err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <DollarSign size={24} className="text-red-600" />
            Gastos de la Tasca
          </h2>
          <button 
            onClick={openNewGasto}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white shadow-md transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            <PlusCircle size={20} /> Registrar Gasto
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : gastos.length === 0 ? (
          <div className="py-12 text-center" style={{ color: "var(--muted-foreground)" }}>
            No hay gastos registrados en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  <th className="pb-3 font-semibold text-sm">Fecha</th>
                  <th className="pb-3 font-semibold text-sm">Categoría</th>
                  <th className="pb-3 font-semibold text-sm">Descripción</th>
                  <th className="pb-3 font-semibold text-sm">Proveedor</th>
                  <th className="pb-3 font-semibold text-sm text-right">Monto ($)</th>
                  <th className="pb-3 font-semibold text-sm text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map(g => (
                  <tr key={g.id} style={{ borderBottom: "1px solid var(--border)", color: "var(--foreground)" }} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="py-3 text-sm">{format(new Date(g.fecha), 'dd/MM/yyyy')}</td>
                    <td className="py-3 font-semibold">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                        {g.categoria}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{g.descripcion}</td>
                    <td className="py-3 text-sm">{g.proveedor?.nombre || '-'}</td>
                    <td className="py-3 font-black text-red-600 text-right">${parseFloat(g.monto_usd).toFixed(2)}</td>
                    <td className="py-3 text-right space-x-2">
                      <button onClick={() => openEditGasto(g)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGastoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {gastoEditId ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h2>
              <button onClick={() => setShowGastoModal(false)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Fecha *</label>
                  <input 
                    type="date" required
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                    value={form.fecha}
                    onChange={e => setForm({...form, fecha: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Categoría *</label>
                  <select 
                    required
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                    value={form.categoria}
                    onChange={e => {
                      if (e.target.value === 'nuevo') {
                        const nombre = prompt("Nombre de la nueva categoría:");
                        if (nombre) {
                          setForm({...form, categoria: nombre});
                        }
                      } else {
                        setForm({...form, categoria: e.target.value});
                      }
                    }}
                  >
                    {!["Compra de Mercancia", "Servicios", "Mantenimiento", "Pago de Personal", "Otros"].includes(form.categoria) && form.categoria && (
                      <option value={form.categoria}>{form.categoria}</option>
                    )}
                    <option value="Compra de Mercancia">Compra de Mercancía</option>
                    <option value="Servicios">Servicios Básicos</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Pago de Personal">Pago de Personal</option>
                    <option value="Otros">Otros</option>
                    <option value="nuevo" className="font-bold text-blue-600">+ Agregar Nueva Categoría</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Descripción / Motivo *</label>
                <input 
                  type="text" required
                  className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                  value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  placeholder="Ej: Pago de Luz eléctrica"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1">Proveedor (Opc)</label>
                  <select 
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                    value={form.proveedor_id}
                    onChange={e => {
                      if (e.target.value === 'nuevo') {
                        const nombre = prompt("Nombre del nuevo proveedor:");
                        if (nombre) {
                          fetch("/api/tasca/proveedores", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ nombre })
                          }).then(res => res.json()).then(data => {
                            setProveedores([...proveedores, data]);
                            setForm({...form, proveedor_id: data.id.toString()});
                          }).catch(err => alert("Error al crear proveedor"));
                        }
                      } else {
                        setForm({...form, proveedor_id: e.target.value});
                      }
                    }}
                  >
                    <option value="">Ninguno / Independiente</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                    <option value="nuevo" className="font-bold text-red-600">+ Agregar Nuevo Proveedor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Monto (USD) *</label>
                  <input 
                    type="number" required min="0.01" step="0.01"
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 font-bold text-red-600"
                    value={form.monto_usd}
                    onChange={e => setForm({...form, monto_usd: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Monto en Bs (Opc)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                    value={form.monto_bs}
                    onChange={e => setForm({...form, monto_bs: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Método de Pago *</label>
                <select 
                  required
                  className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                  value={form.metodo_pago}
                  onChange={e => setForm({...form, metodo_pago: e.target.value})}
                >
                  <option value="Efectivo Divisas">Efectivo Divisas</option>
                  <option value="Pago Movil/Transferencia">Pago Móvil / Transferencia</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Punto de Venta/POS">Punto de Venta / POS</option>
                  <option value="Efectivo Bs.">Efectivo Bs.</option>
                </select>
              </div>

              {!form.metodo_pago.includes('Efectivo') && (
                <div>
                  <label className="block text-xs font-bold mb-1">Referencia (Opcional)</label>
                  <input 
                    type="text"
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                    value={form.referencia_pago}
                    onChange={e => setForm({...form, referencia_pago: e.target.value})}
                    placeholder="Ej: 123456789"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setShowGastoModal(false)} className="w-1/2 p-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 p-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-md">
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

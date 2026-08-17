import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";

interface TiendaBancoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: any;
  tipo: "ves" | "usd";
  mode: "view" | "edit" | "create";
  categorias: any[];
  refreshCategorias: () => void;
  beneficiarios: any[];
  refreshBeneficiarios: () => void;
}

export function TiendaBancoModal({ isOpen, onClose, onSuccess, record, tipo, mode, categorias, refreshCategorias, beneficiarios, refreshBeneficiarios }: TiendaBancoModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bancos, setBancos] = useState<any[]>([]);
  
  const [managingCategories, setManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [managingBeneficiarios, setManagingBeneficiarios] = useState(false);
  const [newBeneficiarioName, setNewBeneficiarioName] = useState("");

  const fetchHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    // Cargar bancos permitidos para la tienda en el modo crear/editar
    if (isOpen && (mode === "create" || mode === "edit")) {
      fetch("/api/tienda/finanzas/bancos", { headers: { 'Accept': 'application/json' } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBancos(data.filter((b: any) => b.divisa === (tipo === 'ves' ? 'VES' : 'USD') || b.divisa === 'AMBOS'));
          }
        })
        .catch(console.error);
    }
  }, [isOpen, mode, tipo]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setFormData({
          tipo_operacion: "TRANSF",
          debe: 0,
          haber: 0,
          fecha: new Date().toISOString().split('T')[0]
        });
      } else if (record) {
        setFormData(record);
      }
    }
  }, [isOpen, record, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return onClose();

    setIsSubmitting(true);
    try {
      const url = mode === "create" 
        ? `/api/tienda/finanzas/conciliacion/${tipo}`
        : `/api/tienda/finanzas/conciliacion/${tipo}/${record.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: fetchHeaders,
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar el registro");
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al guardar cambios");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/finanzas/categorias-fondo", {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({ categoria: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName("");
        refreshCategorias();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      const res = await fetch(`/api/finanzas/categorias-fondo/${id}`, { 
        method: "DELETE",
        headers: fetchHeaders
      });
      if (res.ok) refreshCategorias();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddBeneficiario = async () => {
    if (!newBeneficiarioName.trim()) return;
    try {
      const res = await fetch("/api/finanzas/beneficiarios-fondo", {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({ nombre: newBeneficiarioName })
      });
      if (res.ok) {
        setNewBeneficiarioName("");
        refreshBeneficiarios();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBeneficiario = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este beneficiario?")) return;
    try {
      const res = await fetch(`/api/finanzas/beneficiarios-fondo/${id}`, { 
        method: "DELETE",
        headers: fetchHeaders
      });
      if (res.ok) refreshBeneficiarios();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* MODAL GESTIÓN CATEGORÍAS */}
        {managingCategories && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Gestionar Categorías</h2>
              <button onClick={() => setManagingCategories(false)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Nueva categoría..."
                  className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-200"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              <ul className="space-y-2">
                {categorias.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                    <span className="font-semibold text-gray-700">{cat.categoria}</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 font-bold text-sm">
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* MODAL GESTIÓN BENEFICIARIOS */}
        {managingBeneficiarios && (
          <div className="absolute inset-0 bg-white z-30 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Gestionar Beneficiarios</h2>
              <button onClick={() => setManagingBeneficiarios(false)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Nuevo beneficiario..."
                  className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                  value={newBeneficiarioName}
                  onChange={e => setNewBeneficiarioName(e.target.value)}
                />
                <button
                  onClick={handleAddBeneficiario}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              <ul className="space-y-2">
                {beneficiarios.map(ben => (
                  <li key={ben.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                    <span className="font-semibold text-gray-700">{ben.nombre}</span>
                    <button onClick={() => handleDeleteBeneficiario(ben.id)} className="text-red-500 hover:text-red-700 font-bold text-sm">
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === "view" ? "Detalles de Movimiento" : mode === "create" ? "Nuevo Movimiento de Tienda" : "Editar Movimiento de Tienda"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          <form id="tiendaBancoForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Fecha</label>
                <input
                  type="date"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.fecha || ""}
                  onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Tipo de Operación</label>
                <select
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.tipo_operacion || "TRANSF"}
                  onChange={e => setFormData({ ...formData, tipo_operacion: e.target.value })}
                >
                  <option value="TRANSF">TRANSF</option>
                  <option value="COM">COM</option>
                  <option value="EFE">EFE</option>
                  <option value="PAGO MOVIL">PAGO MOVIL</option>
                  <option value="PUNTO">PUNTO DE VENTA</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Banco (Destino/Origen)</label>
                <select
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.id_banco || ""}
                  onChange={e => setFormData({ ...formData, id_banco: e.target.value })}
                >
                  <option value="">Seleccione un banco...</option>
                  {bancos.map(b => (
                    <option key={b.id} value={b.id}>{b.nombre} ({b.divisa})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Categoría</label>
                  {mode !== "view" && (
                    <button 
                      type="button" 
                      onClick={() => setManagingCategories(true)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-800"
                    >
                      Gestionar
                    </button>
                  )}
                </div>
                <select
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.categoria_id || ""}
                  onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoria}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Referencia</label>
                <input
                  type="text"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.referencia || ""}
                  onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Beneficiario / Cliente</label>
                  {mode !== "view" && (
                    <button 
                      type="button" 
                      onClick={() => setManagingBeneficiarios(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      Gestionar
                    </button>
                  )}
                </div>
                <select
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.beneficiario_id || ""}
                  onChange={e => setFormData({ ...formData, beneficiario_id: e.target.value })}
                >
                  <option value="">Seleccione o sin beneficiario</option>
                  {beneficiarios.map(ben => (
                    <option key={ben.id} value={ben.id}>{ben.nombre}</option>
                  ))}
                </select>
                {mode === "view" && !formData.beneficiario_id && formData.beneficiario && (
                  <div className="mt-1 text-xs text-gray-500">Valor anterior: {formData.beneficiario}</div>
                )}
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Descripción</label>
                <textarea
                  disabled={mode === "view"}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.descripcion || ""}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Debe (Ingresos)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70 text-green-600 font-bold"
                  value={formData.debe || ""}
                  onChange={e => setFormData({ ...formData, debe: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Haber (Egresos)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:opacity-70 text-red-600 font-bold"
                  value={formData.haber || ""}
                  onChange={e => setFormData({ ...formData, haber: e.target.value })}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {mode === "view" ? "Cerrar" : "Cancelar"}
          </button>
          
          {mode !== "view" && (
            <button
              form="tiendaBancoForm"
              type="submit"
              disabled={isSubmitting || (mode === 'create' && !formData.id_banco)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 text-white disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)", boxShadow: "0 4px 14px rgba(234,88,12,0.3)" }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {mode === "create" ? "Crear Movimiento" : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

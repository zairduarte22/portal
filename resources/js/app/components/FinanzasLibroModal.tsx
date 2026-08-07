import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";

interface FinanzasLibroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: any;
  tipo: "ventas" | "compras";
  mode: "view" | "edit" | "create";
  miembros?: any[];
  proveedores?: any[];
  bancos?: any[];
  categorias?: any[];
  metodosPago?: any[];
  refreshProveedores?: () => void;
}

export function FinanzasLibroModal({ isOpen, onClose, onSuccess, record, tipo, mode, miembros = [], proveedores = [], bancos = [], categorias = [], metodosPago = [], refreshProveedores }: FinanzasLibroModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [managingProveedores, setManagingProveedores] = useState(false);
  const [newProveedorName, setNewProveedorName] = useState("");
  const [newProveedorRif, setNewProveedorRif] = useState("");

  const handleAddProveedor = async () => {
    if (!newProveedorName.trim()) return;
    try {
      const res = await fetch("/api/finanzas/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razon_social: newProveedorName, rif: newProveedorRif })
      });
      if (res.ok) {
        setNewProveedorName("");
        setNewProveedorRif("");
        if (refreshProveedores) refreshProveedores();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProveedor = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proveedor?")) return;
    try {
      const res = await fetch(`/api/finanzas/proveedores/${id}`, { method: "DELETE" });
      if (res.ok && refreshProveedores) refreshProveedores();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setFormData({
          fecha: new Date().toISOString().split('T')[0],
          monto: 0,
          monto_bs: 0,
          metodo_pago: "",
          referencia: "",
          numero_factura: "",
          numero_control: "",
          id_miembro: "",
          id_proveedor: "",
          registrar_banco: false,
          id_banco: "",
          categoria_banco: ""
        });
      } else if (record) {
        setFormData(record);
      }
    }
  }, [isOpen, record, mode]);

  if (!isOpen) return null;

  const handleMetodoPagoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombreMetodo = e.target.value;
    const metodo = metodosPago?.find((m: any) => m.nombre === nombreMetodo);
    
    setFormData((prev: any) => {
      const updates = { ...prev, metodo_pago: nombreMetodo };
      if (metodo && metodo.id_banco) {
        updates.registrar_banco = true;
        updates.id_banco = metodo.id_banco;
      } else {
        updates.id_banco = ''; // Reset if it doesn't link to a bank
      }
      return updates;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return onClose();

    setIsSubmitting(true);
    try {
      const isCreate = mode === "create";
      const url = isCreate 
        ? `/api/finanzas/libro/${tipo}` 
        : `/api/finanzas/libro/${tipo}/${record.id}`;
      
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(isCreate ? "Error al crear el registro" : "Error al actualizar el registro");
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar cambios");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === "view" ? "Detalles del Libro" : mode === "create" ? "Nuevo Registro" : "Editar Registro del Libro"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          <form id="libroForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Fecha</label>
                <input
                  type="date"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.fecha || ""}
                  onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>

              {tipo === "ventas" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Miembro (Cliente)</label>
                  <select
                    disabled={mode === "view"}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                    value={formData.id_miembro || ""}
                    onChange={e => setFormData({ ...formData, id_miembro: e.target.value })}
                  >
                    <option value="">General / Sin especificar</option>
                    {miembros.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.razon_social} ({m.rif})</option>
                    ))}
                  </select>
                </div>
              )}

              {tipo === "compras" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Proveedor</label>
                    <button
                      type="button"
                      onClick={() => setManagingProveedores(true)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-700 underline"
                    >
                      Administrar
                    </button>
                  </div>
                  <select
                    disabled={mode === "view"}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                    value={formData.id_proveedor || ""}
                    onChange={e => setFormData({ ...formData, id_proveedor: e.target.value })}
                  >
                    <option value="">Desconocido / Sin especificar</option>
                    {proveedores.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.razon_social} ({p.rif})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Método de Pago</label>
                <select
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.metodo_pago || ""}
                  onChange={handleMetodoPagoChange}
                >
                  <option value="">Seleccione un método...</option>
                  {metodosPago.map((m: any) => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Referencia</label>
                <input
                  type="text"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.referencia || ""}
                  onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Número de Factura</label>
                <input
                  type="text"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.numero_factura || ""}
                  onChange={e => setFormData({ ...formData, numero_factura: e.target.value })}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Número de Control</label>
                <input
                  type="text"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.numero_control || ""}
                  onChange={e => setFormData({ ...formData, numero_control: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Monto $</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.monto || ""}
                  onChange={e => setFormData({ ...formData, monto: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Monto Bs</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.monto_bs || ""}
                  onChange={e => setFormData({ ...formData, monto_bs: e.target.value })}
                />
              </div>
              {mode === "create" && (
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      checked={formData.registrar_banco || false}
                      onChange={e => setFormData({ ...formData, registrar_banco: e.target.checked })}
                    />
                    <span className="text-sm font-bold text-gray-700">Registrar movimiento automáticamente en el Banco</span>
                  </label>

                  {formData.registrar_banco && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Cuenta Bancaria</label>
                        <select
                          className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                          value={formData.id_banco || ""}
                          onChange={e => setFormData({ ...formData, id_banco: e.target.value })}
                          required={formData.registrar_banco}
                          disabled={!!(metodosPago.find(m => m.nombre === formData.metodo_pago)?.id_banco)}
                        >
                          <option value="">Seleccione un banco...</option>
                          {bancos.map((b: any) => (
                            <option key={b.id} value={b.id}>
                              {b.nombre} - {b.divisa} ({b.titular})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Categoría (Opcional)</label>
                        <select
                          className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                          value={formData.categoria_banco || ""}
                          onChange={e => setFormData({ ...formData, categoria_banco: e.target.value })}
                        >
                          <option value="">Sin Categoría</option>
                          {categorias.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.categoria}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              form="libroForm"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 text-white disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {mode === "create" ? "Crear Registro" : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>

      {managingProveedores && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Gestionar Proveedores</h3>
              <button onClick={() => setManagingProveedores(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={18} className="text-gray-500"/></button>
            </div>
            
            <div className="flex flex-col gap-2 mb-4 border-b pb-4">
              <input
                type="text"
                placeholder="Razón Social (Ej: Distribuidora XYZ)"
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                value={newProveedorName}
                onChange={e => setNewProveedorName(e.target.value)}
              />
              <input
                type="text"
                placeholder="RIF (Opcional)"
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                value={newProveedorRif}
                onChange={e => setNewProveedorRif(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddProveedor}
                disabled={!newProveedorName.trim()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl font-bold disabled:opacity-50"
              >
                Agregar
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              {proveedores.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <span className="text-sm font-bold text-gray-700 block">{p.razon_social}</span>
                    <span className="text-xs text-gray-500">{p.rif}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProveedor(p.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {proveedores.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay proveedores registrados.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

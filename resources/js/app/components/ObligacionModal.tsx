import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

interface ObligacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipo: "COBRAR" | "PAGAR";
  config: any;
  editData?: any;
}

export function ObligacionModal({ isOpen, onClose, onSuccess, tipo, config, editData }: ObligacionModalProps) {
  const [formData, setFormData] = useState({
    categoria: editData?.categoria || config?.categorias?.[0] || "",
    tercero: editData?.tercero || config?.terceros?.[0] || "",
    descripcion: editData?.descripcion || "",
    monto_original: editData?.monto_original || "",
    moneda: editData?.moneda || "VES",
    fecha_emision: editData?.fecha_emision ? new Date(editData.fecha_emision + "T12:00:00Z").toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    fecha_limite: editData?.fecha_limite ? new Date(editData.fecha_limite + "T12:00:00Z").toISOString().split("T")[0] : "",
    banco_origen_id: editData?.banco_origen_id || "",
    referencia: editData?.referencia || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewCategoria, setIsNewCategoria] = useState(false);
  const [isNewTercero, setIsNewTercero] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Registrar nueva categoría o tercero si no existe en la config
      const isNewCategoria = !config?.categorias?.includes(formData.categoria);
      const isNewTercero = !config?.terceros?.includes(formData.tercero);

      if (isNewCategoria || isNewTercero) {
        await fetch("/api/finanzas/obligaciones/config", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            categoria: isNewCategoria ? formData.categoria : null,
            tercero: isNewTercero ? formData.tercero : null
          })
        });
      }

      const payload = { 
        ...formData, 
        tipo_obligacion: tipo,
        banco_origen_id: formData.banco_origen_id ? parseInt(formData.banco_origen_id) : null
      };
      const url = editData ? `/api/finanzas/obligaciones/${editData.id}` : "/api/finanzas/obligaciones";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || (editData ? "Error al editar" : "Error al crear"));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? "Editar " : "Registrar "}
            {tipo === "COBRAR" ? "Cuenta por Cobrar" : "Cuenta por Pagar"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          <form id="obligacionForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Categoría</label>
                  <button 
                    type="button" 
                    onClick={() => setIsNewCategoria(!isNewCategoria)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    {isNewCategoria ? "Elegir existente" : "+ Nueva"}
                  </button>
                </div>
                {isNewCategoria ? (
                  <input
                    type="text"
                    required
                    placeholder="Escribe la nueva categoría..."
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  />
                ) : (
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    {config?.categorias?.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Tercero (Entidad/Persona)</label>
                  <button 
                    type="button" 
                    onClick={() => setIsNewTercero(!isNewTercero)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    {isNewTercero ? "Elegir existente" : "+ Nuevo"}
                  </button>
                </div>
                {isNewTercero ? (
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nuevo tercero..."
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                    value={formData.tercero}
                    onChange={e => setFormData({ ...formData, tercero: e.target.value })}
                  />
                ) : (
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                    value={formData.tercero}
                    onChange={e => setFormData({ ...formData, tercero: e.target.value })}
                  >
                    {config?.terceros?.map((t: string) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Préstamo para equipos..."
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Monto Total</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                  value={formData.monto_original}
                  onChange={e => setFormData({ ...formData, monto_original: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Moneda de Anclaje</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                  value={formData.moneda}
                  onChange={e => setFormData({ ...formData, moneda: e.target.value })}
                >
                  <option value="VES">Bolívares (VES)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Fecha de Emisión</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                  value={formData.fecha_emision}
                  onChange={e => setFormData({ ...formData, fecha_emision: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Fecha Límite (Opcional)</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                  value={formData.fecha_limite}
                  onChange={e => setFormData({ ...formData, fecha_limite: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Banco Origen/Destino (Opcional)</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                  value={formData.banco_origen_id}
                  onChange={e => setFormData({ ...formData, banco_origen_id: e.target.value })}
                >
                  <option value="">Seleccione si aplica (movimiento bancario)...</option>
                  {config?.bancos?.filter((b: any) => b.moneda === formData.moneda).map((b: any) => (
                    <option key={b.id} value={b.id}>{b.nombre}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Si seleccionas un banco, se registrará el ingreso o egreso en la conciliación.
                </p>
                
                {formData.banco_origen_id && (
                  <div className="mt-3 space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Referencia de Transacción</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                      value={formData.referencia}
                      onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                      placeholder="Ej. 12345678"
                    />
                  </div>
                )}
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
            Cancelar
          </button>
          
          <button
            form="obligacionForm"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 text-white disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Crear Registro
          </button>
        </div>
      </div>
    </div>
  );
}

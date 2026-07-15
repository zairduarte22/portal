import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";

interface FinanzasConciliacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: any;
  tipo: "ves" | "usd";
  mode: "view" | "edit";
}

export function FinanzasConciliacionModal({ isOpen, onClose, onSuccess, record, tipo, mode }: FinanzasConciliacionModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setFormData(record);
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return onClose();

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/finanzas/conciliacion/${tipo}/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Error al actualizar el registro");
      
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
            {mode === "view" ? "Detalles de Conciliación" : "Editar Movimiento Bancario"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          <form id="concilForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Fecha</label>
                <input
                  type="date"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.fecha || ""}
                  onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Tipo de Operación</label>
                <select
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.tipo_operacion || "TRANSF"}
                  onChange={e => setFormData({ ...formData, tipo_operacion: e.target.value })}
                >
                  <option value="TRANSF">TRANSF</option>
                  <option value="COM">COM</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Referencia</label>
                <input
                  type="text"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.referencia || ""}
                  onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Beneficiario</label>
                <input
                  type="text"
                  disabled={mode === "view"}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:opacity-70"
                  value={formData.beneficiario || ""}
                  onChange={e => setFormData({ ...formData, beneficiario: e.target.value })}
                />
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Descripción</label>
                <textarea
                  disabled={mode === "view"}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:opacity-70"
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
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:opacity-70 text-green-600 font-bold"
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
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:opacity-70 text-red-600 font-bold"
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
          
          {mode === "edit" && (
            <button
              form="concilForm"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 text-white disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #a855f7, #9333ea)", boxShadow: "0 4px 14px rgba(168,85,247,0.3)" }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar Cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

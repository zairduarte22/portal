import { useState, useMemo } from "react";
import { X, Save, Loader2, DollarSign, Wallet } from "lucide-react";

interface AbonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  obligacion: any;
  config: any;
  editData?: any;
}

export function AbonoModal({ isOpen, onClose, onSuccess, obligacion, config, editData }: AbonoModalProps) {
  const [formData, setFormData] = useState({
    fecha: editData?.fecha ? new Date(editData.fecha + "T12:00:00Z").toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    monto_abonado: editData?.monto_abonado || "",
    banco_id: editData?.banco_id?.toString() || "",
    referencia: editData?.referencia || "",
    tasa_cambio: editData ? (editData.monto_banco / editData.monto_abonado).toFixed(2) : ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derivar el tipo de operación (Ingreso o Egreso) y la moneda del banco
  const bancoSeleccionado = useMemo(() => {
    if (!formData.banco_id) return null;
    return config?.bancos?.find((b: any) => b.id.toString() === formData.banco_id);
  }, [formData.banco_id, config]);

  const monedaDeuda = obligacion?.moneda || "VES";
  const monedaBanco = bancoSeleccionado?.moneda || monedaDeuda;
  
  // Requiere conversión si la deuda es en USD pero el pago se hace desde un banco en VES (o viceversa)
  const requiereConversion = monedaBanco !== monedaDeuda;

  // Calculo automático para sugerir montos
  const montoBancoCalculado = useMemo(() => {
    const abonado = parseFloat(formData.monto_abonado) || 0;
    const tasa = parseFloat(formData.tasa_cambio) || 0;
    
    if (!requiereConversion) return abonado;
    
    // Si la deuda es USD y pago con VES
    if (monedaDeuda === "USD" && monedaBanco === "VES") {
      return abonado * tasa;
    }
    // Si la deuda es VES y pago con USD
    if (monedaDeuda === "VES" && monedaBanco === "USD") {
      return tasa > 0 ? abonado / tasa : 0;
    }
    return abonado;
  }, [formData.monto_abonado, formData.tasa_cambio, requiereConversion, monedaDeuda, monedaBanco]);

  if (!isOpen || !obligacion) return null;

  const maxAbonar = (parseFloat(obligacion.monto_original) - parseFloat(obligacion.monto_abonado)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      fecha: formData.fecha,
      monto_abonado: parseFloat(formData.monto_abonado),
      monto_banco: montoBancoCalculado,
      moneda_pago: monedaBanco,
      tasa_cambio: requiereConversion ? parseFloat(formData.tasa_cambio) : null,
      banco_id: formData.banco_id ? parseInt(formData.banco_id) : null,
      referencia: formData.referencia
    };

    try {
      const url = editData ? `/api/finanzas/obligaciones/abonos/${editData.id}` : `/api/finanzas/obligaciones/${obligacion.id}/abonar`;
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || (editData ? "Error al editar el abono" : "Error al procesar el abono"));
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
      <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? "Editar Abono" : "Registrar Abono"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          <div className="mb-6 p-4 bg-white border rounded-2xl shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase">Deuda Actual ({monedaDeuda})</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">
              {monedaDeuda === "USD" ? "$" : "Bs."} {maxAbonar}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{obligacion.categoria} - {obligacion.tercero}</p>
          </div>

          <form id="abonoForm" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Fecha del Abono</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Cuenta Bancaria ({obligacion.tipo_obligacion === 'COBRAR' ? 'Ingreso' : 'Egreso'})</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                value={formData.banco_id}
                onChange={e => setFormData({ ...formData, banco_id: e.target.value })}
              >
                <option value="">-- Ninguno (Cruce / Otro) --</option>
                {config?.bancos?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.nombre} ({b.moneda})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Monto a Descontar de la Deuda ({monedaDeuda})</label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                max={maxAbonar}
                className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200 font-bold"
                value={formData.monto_abonado}
                onChange={e => setFormData({ ...formData, monto_abonado: e.target.value })}
              />
            </div>

            {requiereConversion && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-100 rounded-xl mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-blue-800 tracking-wider">
                    Tasa de Cambio ({monedaDeuda} a {monedaBanco})
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-300"
                    value={formData.tasa_cambio}
                    onChange={e => setFormData({ ...formData, tasa_cambio: e.target.value })}
                  />
                </div>
                
                <div>
                  <p className="text-xs text-blue-800 font-bold uppercase">Movimiento Bancario Real ({monedaBanco})</p>
                  <p className="text-xl font-black text-blue-900 mt-1">
                    {monedaBanco === "USD" ? "$" : "Bs."} {montoBancoCalculado.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Referencia Bancaria</label>
              <input
                type="text"
                required={!!formData.banco_id}
                placeholder={formData.banco_id ? "N° de Transferencia / Recibo" : "Opcional (Ej. Cruce/Compensación)"}
                className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-200"
                value={formData.referencia}
                onChange={e => setFormData({ ...formData, referencia: e.target.value })}
              />
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
            form="abonoForm"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 text-white disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Procesar Abono
          </button>
        </div>
      </div>
    </div>
  );
}

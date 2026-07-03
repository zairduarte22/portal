import { useState, useEffect } from "react";
import { X, Plus, DollarSign, Hash, Calendar, CreditCard, FileText, Banknote, TrendingUp, CheckCircle } from "lucide-react";
import { Miembro } from "../mockData";
import { PagoCredito, MetodoPago, METODOS_PAGO } from "./carnetData";
import { SearchableSelect } from "../ui/SearchableSelect";

interface ModalPagoProps {
  miembros: Miembro[];
  initData: { tasa_dia: number; costo_carnet: number };
  onClose: () => void;
  onSave: (pago: PagoCredito) => void;
}

const inp =
  "w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400";
const inpStyle = {
  borderColor: "var(--border)",
  backgroundColor: "#f9fafb",
  color: "var(--foreground)",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)", fontWeight: 700 }}>
      {children}
    </label>
  );
}

export function ModalPago({ miembros, initData, onClose, onSave }: ModalPagoProps) {
  const [idMiembro, setIdMiembro] = useState<number | "">(miembros[0]?.id ?? "");
  const [creditos, setCreditos] = useState(1);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [tasa, setTasa] = useState(initData.tasa_dia);
  const [montoUsd, setMontoUsd] = useState(initData.costo_carnet);
  const [montoBs, setMontoBs] = useState(initData.costo_carnet * initData.tasa_dia);
  const [metodo, setMetodo] = useState<MetodoPago>("Transferencia / Pago Móvil");
  const [referencia, setReferencia] = useState("");

  const miembroOptions = miembros.map(m => ({
    value: m.id,
    label: `${m.razon_social} (${m.acronimo}) - ${m.carnets_disponibles} créditos disp.`
  }));

  useEffect(() => {
    const total = creditos * initData.costo_carnet;
    setMontoUsd(total);
    setMontoBs(parseFloat((total * tasa).toFixed(2)));
  }, [creditos, tasa, initData.costo_carnet]);

  const handleTasaChange = (val: number) => {
    setTasa(val);
    setMontoBs(parseFloat((montoUsd * val).toFixed(2)));
  };

  const handleMontoUsdChange = (val: number) => {
    setMontoUsd(val);
    setMontoBs(parseFloat((val * tasa).toFixed(2)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idMiembro === "") return;
    onSave({
      id: Date.now(),
      id_miembro: idMiembro as number,
      fecha,
      monto_usd: montoUsd,
      monto_bs: montoBs,
      tasa,
      creditos,
      estado: "Pendiente",
      metodo_pago: metodo,
      referencia,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,15,20,0.6)" }}>
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 8px 32px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-7 py-6 flex items-center justify-between rounded-t-3xl"
          style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <Plus size={18} style={{ color: "#4ade80" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#d1fae5", fontSize: "1.1rem" }}>
                Registrar Pago
              </h3>
              <p className="text-xs" style={{ color: "#6ee7b7", opacity: 0.8 }}>Créditos para carnets</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <X size={16} style={{ color: "#a7f3d0" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          {/* Row 1: Member */}
          <div>
            <Label>Miembro</Label>
            <SearchableSelect
              options={miembroOptions}
              value={idMiembro}
              onChange={(val) => setIdMiembro(val as number)}
              placeholder="Buscar miembro..."
              className={inp}
              style={inpStyle}
            />
          </div>

          {/* Row 2: Credits + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cantidad de Créditos</Label>
              <div className="relative">
                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="number"
                  className={inp}
                  style={{ ...inpStyle, paddingLeft: "2.25rem" }}
                  value={creditos}
                  min={1}
                  max={100}
                  onChange={(e) => setCreditos(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Fecha de Pago</Label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="date"
                  className={inp}
                  style={{ ...inpStyle, paddingLeft: "2.25rem" }}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 3: Tasa + USD + Bs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tasa (Bs/$)</Label>
              <div className="relative">
                <TrendingUp size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="number"
                  className={inp}
                  style={{ ...inpStyle, paddingLeft: "2.25rem" }}
                  value={tasa}
                  step={0.01}
                  min={0}
                  onChange={(e) => handleTasaChange(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Monto ($)</Label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#16a34a" }} />
                <input
                  type="number"
                  className={inp}
                  style={{ ...inpStyle, paddingLeft: "2.25rem", borderColor: "#bbf7d0" }}
                  value={montoUsd}
                  step={0.01}
                  min={0}
                  onChange={(e) => handleMontoUsdChange(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Monto (Bs)</Label>
              <div className="relative">
                <Banknote size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="number"
                  className={inp}
                  style={{ ...inpStyle, paddingLeft: "2.25rem" }}
                  value={montoBs}
                  step={0.01}
                  min={0}
                  onChange={(e) => setMontoBs(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Method + Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Método de Pago</Label>
              <div className="relative">
                <CreditCard size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <select
                  className={inp}
                  style={{ ...inpStyle, paddingLeft: "2.25rem" }}
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value as MetodoPago)}
                >
                  {METODOS_PAGO.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Referencia de Pago</Label>
              <div className="relative">
                <FileText size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  className={inp}
                  style={{ ...inpStyle, paddingLeft: "2.25rem" }}
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Nº de referencia o confirmación"
                />
              </div>
            </div>
          </div>

          {/* Summary box */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "1px solid #bbf7d0",
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#15803d", fontWeight: 700 }}>
              Resumen del pago
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: "#4d7a5e", fontWeight: 500 }}>Precio unitario</p>
                <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#15803d" }}>
                  ${initData.costo_carnet}
                </p>
                <p className="text-xs" style={{ color: "#6b9e7a" }}>por crédito</p>
              </div>
              <div className="text-center border-x" style={{ borderColor: "#bbf7d0" }}>
                <p className="text-xs mb-1" style={{ color: "#4d7a5e", fontWeight: 500 }}>Total USD</p>
                <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#15803d" }}>
                  ${montoUsd.toFixed(2)}
                </p>
                <p className="text-xs" style={{ color: "#6b9e7a" }}>{creditos} crédito{creditos !== 1 ? "s" : ""}</p>
              </div>
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: "#4d7a5e", fontWeight: 500 }}>Total Bs.</p>
                <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#15803d" }}>
                  {montoBs.toLocaleString("es-VE")}
                </p>
                <p className="text-xs" style={{ color: "#6b9e7a" }}>a tasa {tasa}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#ffffff",
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(22,163,74,0.45)",
              }}
            >
              <CheckCircle size={15} />
              Aprobar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

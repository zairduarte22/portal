import { useState } from "react";
import { X, CreditCard, AlertTriangle, CheckSquare, Square } from "lucide-react";
import { Miembro, Persona } from "../mockData";
import { CarnetEmitido } from "./carnetData";
import { SearchableSelect } from "../ui/SearchableSelect";

interface ModalEmitirProps {
  miembros: Miembro[];
  personas: Persona[];
  onClose: () => void;
  onSave: (carnets: any[]) => void;
  vinculaciones?: any[];
  carnets?: any[];
}

function initials(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#16a34a,#4ade80)",
  "linear-gradient(135deg,#0284c7,#38bdf8)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#db2777,#f472b6)",
];

const inpStyle = {
  borderColor: "var(--border)",
  backgroundColor: "#f9fafb",
  color: "var(--foreground)",
};

const inp = "w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-violet-200 focus:border-violet-400";

export function ModalEmitir({ miembros, personas, vinculaciones = [], carnets = [], onClose, onSave }: ModalEmitirProps) {
  const miembrosDisponibles = miembros.filter(m => m.carnets_disponibles > 0);
  const [idMiembro, setIdMiembro] = useState<number | -1>(miembrosDisponibles[0]?.id ?? -1);
  const [selectedPersonas, setSelectedPersonas] = useState<number[]>([]);
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean; message: string; payload: any[] } | null>(null);

  const miembroOptions = [
    ...miembrosDisponibles.map(m => ({
      value: m.id,
      label: `${m.razon_social} (${m.acronimo}) - ${m.carnets_disponibles} créditos disp.`
    })),
    { value: -1, label: "🌟 Ex-presidentes / Honorarios" }
  ];

  const isHonorarioMode = idMiembro === -1;
  const miembro = isHonorarioMode ? null : miembros.find((m) => m.id === idMiembro);
  
  let availablePersonas: Persona[] = [];
  if (isHonorarioMode) {
    availablePersonas = personas.filter(p => p.ex_presidente || p.honorario);
  } else {
    const myVincs = vinculaciones.filter((v) => v.id_miembro === idMiembro);
    availablePersonas = myVincs
      .map((v) => personas.find((p) => p.id === v.id_persona))
      .filter((p): p is Persona => p !== undefined);
  }

  const handleTogglePersona = (pid: number) => {
    if (selectedPersonas.includes(pid)) {
      setSelectedPersonas(selectedPersonas.filter((id) => id !== pid));
    } else {
      setSelectedPersonas([...selectedPersonas, pid]);
    }
  };

  const doSave = (carnetsToSave: any[]) => {
    setWarningModal(null);
    onSave(carnetsToSave);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPersonas.length === 0) return;

    // Check for recents (last 60 days)
    const recentsInfo = selectedPersonas.map(pid => {
      const c = carnets.find(x => x.id_persona === pid && x.estado === 'Activo');
      if (!c) return null;
      const d = new Date(c.fecha_emision + "T12:00:00Z");
      const diff = Date.now() - d.getTime();
      if (diff < 60 * 24 * 60 * 60 * 1000) {
        return { c, pid };
      }
      return null;
    }).filter((item): item is { c: any; pid: number } => item !== null);

    const hoy = new Date();
    const carnetsToSave = selectedPersonas.map(pid => {
      const persona = personas.find(p => p.id === pid);
      const isHonorario = persona?.honorario || persona?.ex_presidente;
      const vinc = vinculaciones.find(v => v.id_persona === pid && v.id_miembro === idMiembro);
      const isDirector = vinc?.director || vinc?.presidente;
      
      let vencimiento = null;
      if (!isHonorario) {
        const venc = new Date(hoy);
        if (isDirector) venc.setFullYear(venc.getFullYear() + 2);
        else venc.setFullYear(venc.getFullYear() + 1);
        vencimiento = venc.toISOString().split("T")[0];
      }

      return {
        id: Date.now() + Math.random(),
        id_persona: pid,
        id_miembro: idMiembro === -1 ? null : idMiembro,
        fecha_emision: hoy.toISOString().split("T")[0],
        fecha_vencimiento: vencimiento,
        estado: "Activo",
        numero_carnet: `AGC-${hoy.getFullYear()}-${String(Date.now() + Math.random()).slice(-4)}`,
      };
    });

    if (recentsInfo.length > 0) {
      const formatObj = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      const msgs = recentsInfo.map(({ c, pid }) => {
        const p = personas.find(x => x.id === pid);
        const m = miembros.find(x => x.id === c.id_miembro);
        const dateStr = formatObj.format(new Date(c.fecha_emision + 'T12:00:00Z'));
        return `${p?.nombre} tiene un carnet activo desde el día ${dateStr}, mediante el miembro ${m?.razon_social || 'N/A'}`;
      });
      const finalMsg = msgs.join("\n\n") + "\n\n¿Seguro que deseas proceder?";
      
      setWarningModal({
        isOpen: true,
        message: finalMsg,
        payload: carnetsToSave
      });
      return;
    }

    doSave(carnetsToSave);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,10,20,0.6)" }}>
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 8px 32px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.07)",
          maxHeight: "90vh",
        }}
      >
        <div
          className="px-7 py-6 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #2e1065 0%, #4c1d95 60%, #5b21b6 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(167,139,250,0.25)", border: "1px solid rgba(167,139,250,0.4)" }}>
              <CreditCard size={18} style={{ color: "#c4b5fd" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#ede9fe", fontSize: "1.1rem" }}>
                Emitir Carnets
              </h3>
              <p className="text-xs" style={{ color: "#c4b5fd", opacity: 0.85 }}>Credenciales de identificación</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <X size={16} style={{ color: "#c4b5fd" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)", fontWeight: 700 }}>
              Miembro
            </label>
            <SearchableSelect
              options={miembroOptions}
              value={idMiembro}
              onChange={(val) => {
                setIdMiembro(val as number);
                setSelectedPersonas([]);
              }}
              placeholder="Seleccionar..."
              className={inp}
              style={inpStyle}
            />

            {!isHonorarioMode && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                    fontWeight: 700,
                  }}
                >
                  <CreditCard size={11} />
                  {`${selectedPersonas.length} de ${miembro?.carnets_disponibles ?? 0} créditos utilizados`}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)", fontWeight: 700 }}>
              Personas
            </label>
            {availablePersonas.length === 0 ? (
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#fef3c7", border: "1px solid #fde68a" }}>
                <p className="text-xs" style={{ color: "#92400e", fontWeight: 600 }}>
                  No hay personas disponibles en esta categoría.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {availablePersonas.map((p) => {
                  const isChecked = selectedPersonas.includes(p.id);
                  const isDisabled = !isChecked && !isHonorarioMode && selectedPersonas.length >= (miembro?.carnets_disponibles ?? 0);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isChecked ? "bg-violet-50 border-violet-300" : "bg-white border-gray-200"} ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}`}
                      onClick={() => !isDisabled && handleTogglePersona(p.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
                          style={{ background: AVATAR_COLORS[p.id % AVATAR_COLORS.length], fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
                        >
                          {initials(p.nombre)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{p.nombre}</p>
                          <p className="text-xs text-gray-500">{p.ci_numero}</p>
                        </div>
                      </div>
                      <div className="text-violet-600">
                        {isChecked ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
          >
            <AlertTriangle size={16} style={{ color: "#d97706", marginTop: "1px", flexShrink: 0 }} />
            <p className="text-sm" style={{ color: "#92400e", fontWeight: 500, lineHeight: 1.5 }}>
              Las personas seleccionadas recibirán un carnet activo. Honorarios o Ex-presidentes no consumen créditos. Los carnets tienen un vencimiento dinámico según el rol.
            </p>
          </div>

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
              disabled={selectedPersonas.length === 0}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: selectedPersonas.length === 0 ? "#9ca3af" : "linear-gradient(135deg, #2e1065 0%, #5b21b6 100%)",
                boxShadow: selectedPersonas.length > 0 ? "0 4px 14px rgba(91, 33, 182, 0.4)" : "none",
              }}
            >
              Generar ({selectedPersonas.length})
            </button>
          </div>
        </form>
      </div>

      {warningModal?.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border" style={{ borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#fef2f2" }}>
              <AlertTriangle size={24} style={{ color: "#ef4444" }} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "var(--foreground)" }}>Carnet Reciente Detectado</h3>
            <div className="text-sm text-center mb-6 space-y-3" style={{ color: "var(--muted-foreground)" }}>
              {warningModal.message.split("\n\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setWarningModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => doSave(warningModal.payload)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#ef4444", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)" }}
              >
                Proceder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, User, Shield, Star, Crown, X, Save, Award } from "lucide-react";
import { Persona, Vinculacion, GENEROS, GeneroPersona, RelacionFamiliar } from "./mockData";

interface PersonasPanelProps {
  miembroId: number;
  personas: Persona[];
  vinculaciones: Vinculacion[];
  relacionesFamiliares: RelacionFamiliar[];
  onAddPersona: (p: Persona, v?: Vinculacion) => void;
  onUpdatePersona: (p: Persona) => void;
  onDeletePersona: (id: number) => void;
  onUpdateVinculacion: (v: Vinculacion) => void;
}

const EMPTY_PERSONA: Omit<Persona, "id"> = {
  nombre: "",
  ci_numero: "",
  fecha_nacimiento: "",
  correo: "",
  telefono: "",
  genero: "Masculino",
  ex_presidente: false,
  honorario: false,
};

const inputClass = "w-full px-3 py-2 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-300";
const inputStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--input-background)",
  color: "var(--foreground)",
};

export function PersonaFormModal({
  persona,
  miembroId,
  vinculacion,
  relacionFamiliar,
  accionistas,
  contextoMiembros,
  todasVinculaciones,
  onSwitchMiembro,
  onDeleteVinculacion,
  onClose,
  onSave,
}: {
  persona: Persona | null;
  miembroId: number;
  vinculacion?: Vinculacion;
  relacionFamiliar?: RelacionFamiliar;
  accionistas: Persona[];
  contextoMiembros?: { id: number; nombre: string }[];
  todasVinculaciones?: Vinculacion[];
  onSwitchMiembro?: (id: number) => void;
  onDeleteVinculacion?: (idMiembro: number) => void;
  onClose: () => void;
  onSave: (p: Persona, v: Vinculacion) => void;
}) {
  const isEditing = !!persona;
  const [form, setForm] = useState<Omit<Persona, "id">>(
    persona ? (({ id, ...rest }) => rest)(persona) : { ...EMPTY_PERSONA }
  );
  
  const defaultTitular = accionistas.length > 0 ? accionistas[0].id : null;
  
  const [vinc, setVinc] = useState<Omit<Vinculacion, "id_miembro" | "id_persona">>(
    vinculacion
      ? { representante: vinculacion.representante, director: vinculacion.director, accionista: vinculacion.accionista, presidente: vinculacion.presidente, parentesco: relacionFamiliar?.parentesco || "Ninguno", id_persona_titular: relacionFamiliar?.id_persona_titular || defaultTitular }
      : { representante: false, director: false, accionista: false, presidente: false, parentesco: "Ninguno", id_persona_titular: defaultTitular }
  );

  // Sync vinc state if miembroId changes from external context switch
  useEffect(() => {
    setVinc(
      vinculacion
        ? { representante: vinculacion.representante, director: vinculacion.director, accionista: vinculacion.accionista, presidente: vinculacion.presidente, parentesco: relacionFamiliar?.parentesco || "Ninguno", id_persona_titular: relacionFamiliar?.id_persona_titular || defaultTitular }
        : { representante: false, director: false, accionista: false, presidente: false, parentesco: "Ninguno", id_persona_titular: defaultTitular }
    );
  }, [miembroId, vinculacion, relacionFamiliar, defaultTitular]);

  const set = (k: keyof typeof form, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const setV = (k: keyof typeof vinc, v: unknown) => setVinc((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = persona?.id ?? Date.now();
    onSave(
      { ...form, id },
      { id_miembro: miembroId, id_persona: id, ...vinc }
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border" style={{ borderColor: "var(--border)" }}>
        <div className="sticky top-0 bg-card px-6 py-5 border-b flex items-center justify-between rounded-t-3xl" style={{ borderColor: "var(--border)" }}>
          <h3 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
            {isEditing ? "Editar Persona" : "Agregar Persona"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Nombre completo</label>
            <input className={inputClass} style={inputStyle} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Cédula</label>
              <input className={inputClass} style={inputStyle} value={form.ci_numero} onChange={(e) => set("ci_numero", e.target.value)} placeholder="V-00.000.000" required />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Género</label>
              <select className={inputClass} style={inputStyle} value={form.genero} onChange={(e) => set("genero", e.target.value as GeneroPersona)}>
                {GENEROS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Correo</label>
              <input type="email" className={inputClass} style={inputStyle} value={form.correo} onChange={(e) => set("correo", e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Teléfono</label>
              <input className={inputClass} style={inputStyle} value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Fecha de Nacimiento</label>
            <input type="date" className={inputClass} style={inputStyle} value={form.fecha_nacimiento} onChange={(e) => set("fecha_nacimiento", e.target.value)} />
          </div>

          {/* Vinculación */}
          <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--muted)" }}>
            {contextoMiembros && contextoMiembros.length > 0 && (
              <div className="mb-4 pb-4 border-b space-y-3" style={{ borderColor: "var(--border)" }}>
                {todasVinculaciones && todasVinculaciones.length > 0 && (
                  <div>
                    <label className="text-xs uppercase tracking-wide block mb-2" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Vinculaciones Actuales</label>
                    <div className="flex flex-wrap gap-2">
                      {todasVinculaciones.map(tv => {
                        const m = contextoMiembros?.find(x => x.id === tv.id_miembro);
                        if (!m) return null;
                        const isSelected = m.id === miembroId;
                        return (
                          <div 
                            key={m.id} 
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${isSelected ? 'ring-2 ring-[var(--accent)]' : 'cursor-pointer hover:bg-black/5'}`}
                            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                            onClick={() => !isSelected && onSwitchMiembro && onSwitchMiembro(m.id)}
                          >
                            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{m.nombre}</span>
                            {onDeleteVinculacion && (
                              <button 
                                type="button"
                                className="ml-1 w-5 h-5 rounded-md flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                                style={{ color: "var(--muted-foreground)" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("¿Estás seguro de eliminar la vinculación con " + m.nombre + "?")) {
                                    onDeleteVinculacion(m.id);
                                  }
                                }}
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>{todasVinculaciones && todasVinculaciones.length > 0 ? "Editar/Añadir a Hacienda o Miembro:" : "Hacienda / Miembro"}</label>
                  <select 
                    className={inputClass} style={inputStyle} 
                    value={miembroId}
                    onChange={(e) => onSwitchMiembro && onSwitchMiembro(parseInt(e.target.value))}
                  >
                    {contextoMiembros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
            )}
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted-foreground)", fontWeight: 700 }}>Roles en esta Vinculación</p>
            {([
              { key: "presidente", label: "Presidente", icon: Award },
              { key: "representante", label: "Representante Legal", icon: Shield },
              { key: "director", label: "Director", icon: Crown },
              { key: "accionista", label: "Accionista", icon: Star },
            ] as { key: keyof typeof vinc; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <div
                  className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ backgroundColor: vinc[key] ? "var(--accent)" : "var(--switch-background)" }}
                  onClick={() => setV(key, !vinc[key])}
                >
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm" style={{ left: vinc[key] ? "1.25rem" : "0.25rem" }} />
                </div>
                <Icon size={15} style={{ color: vinc[key] ? "var(--accent)" : "var(--muted-foreground)" }} />
                <span className="text-sm" style={{ color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer pt-1 border-t" style={{ borderColor: "var(--border)" }}>
              <div
                className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{ backgroundColor: form.ex_presidente ? "#f59e0b" : "var(--switch-background)" }}
                onClick={() => set("ex_presidente", !form.ex_presidente)}
              >
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm" style={{ left: form.ex_presidente ? "1.25rem" : "0.25rem" }} />
              </div>
              <Crown size={15} style={{ color: form.ex_presidente ? "#f59e0b" : "var(--muted-foreground)" }} />
              <span className="text-sm" style={{ color: "var(--foreground)", fontWeight: 500 }}>Ex-Presidente</span>
            </label>
            
            {/* Honorario */}
            <label className="flex items-center gap-3 cursor-pointer pt-1 border-t" style={{ borderColor: "var(--border)" }}>
              <div
                className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{ backgroundColor: form.honorario ? "#8b5cf6" : "var(--switch-background)" }}
                onClick={() => set("honorario", !form.honorario)}
              >
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm" style={{ left: form.honorario ? "1.25rem" : "0.25rem" }} />
              </div>
              <Star size={15} style={{ color: form.honorario ? "#8b5cf6" : "var(--muted-foreground)" }} />
              <span className="text-sm" style={{ color: "var(--foreground)", fontWeight: 500 }}>Honorario</span>
            </label>
            
            {/* Parentesco (only if not accionista) */}
            {!vinc.accionista && accionistas.length > 0 && (
              <div className="pt-3 border-t mt-3 space-y-3" style={{ borderColor: "var(--border)" }}>
                <div>
                  <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Es Familiar De (Accionista)</label>
                  <select className={inputClass} style={inputStyle} value={vinc.id_persona_titular || ""} onChange={(e) => setV("id_persona_titular", e.target.value ? parseInt(e.target.value) : null)}>
                    <option value="">Selecciona Accionista...</option>
                    {accionistas.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide block mb-1" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Parentesco</label>
                  <select className={inputClass} style={inputStyle} value={vinc.parentesco || "Ninguno"} onChange={(e) => setV("parentesco", e.target.value)}>
                    <option value="Ninguno">Ninguno</option>
                    <option value="Conyuge">Conyuge</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Padre/Madre">Padre/Madre</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 600 }}>
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl text-sm flex items-center gap-2" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", fontWeight: 600, boxShadow: "0 4px 12px rgba(22,163,74,0.4)" }}>
              <Save size={14} />
              {isEditing ? "Guardar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ROLE_BADGES = [
  { key: "presidente" as keyof Vinculacion, label: "Presidente", color: "#b91c1c", bg: "#fee2e2", icon: Award },
  { key: "representante" as keyof Vinculacion, label: "Representante", color: "#0284c7", bg: "#e0f2fe", icon: Shield },
  { key: "director" as keyof Vinculacion, label: "Director", color: "#7c3aed", bg: "#ede9fe", icon: Crown },
  { key: "accionista" as keyof Vinculacion, label: "Accionista", color: "#d97706", bg: "#fef3c7", icon: Star },
];

function initials(nombre: string) {
  return String(nombre || "").substring(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#16a34a,#4ade80)",
  "linear-gradient(135deg,#0284c7,#38bdf8)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#db2777,#f472b6)",
  "linear-gradient(135deg,#0891b2,#22d3ee)",
];

export function PersonasPanel({
  miembroId, personas, vinculaciones, relacionesFamiliares = [],
  onAddPersona, onUpdatePersona, onDeletePersona, onUpdateVinculacion,
}: PersonasPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const myVincs = vinculaciones.filter((v) => v.id_miembro === miembroId);
  const myPersonas = myVincs
    .map((v) => personas.find((p) => p.id === v.id_persona))
    .filter((p): p is Persona => p !== undefined);
  
  const accionistasVincs = myVincs.filter((v) => v.accionista);
  const accionistas = accionistasVincs
    .map(v => personas.find(p => p.id === v.id_persona))
    .filter((p): p is Persona => p !== undefined);
    
  const getVinc = (id: number) => myVincs.find((v) => v.id_persona === id);

  const accionistasIds = accionistas.map(a => a.id);
  const familiares = myPersonas.filter(p => !accionistasIds.includes(p.id) && relacionesFamiliares.some(r => r.id_persona_familiar === p.id && accionistasIds.includes(r.id_persona_titular)));
  const familiaresIds = familiares.map(f => f.id);
  const otrasPersonas = myPersonas.filter(p => !accionistasIds.includes(p.id) && !familiaresIds.includes(p.id));

  const handleSave = (p: Persona, v: Vinculacion) => {
    if (editingPersona) { onUpdatePersona(p); onUpdateVinculacion(v); }
    else { onAddPersona(p, v); }
    setFormOpen(false);
    setEditingPersona(null);
  };

  const renderPersonaCard = (p: Persona, idx: number, isNested: boolean = false) => {
    const vinc = getVinc(p.id);
    const activeRoles = ROLE_BADGES.filter((r) => vinc?.[r.key]);
    const relacionFamiliar = (relacionesFamiliares || []).find(r => r.id_persona_familiar === p.id);
    
    return (
      <div
        key={p.id}
        className={`rounded-2xl p-4 flex items-start gap-4 ${isNested ? "ml-8 relative" : ""}`}
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {isNested && (
          <div className="absolute top-0 bottom-0 left-[-16px] w-[2px]" style={{ backgroundColor: "var(--border)", opacity: 0.5, borderLeft: "2px dashed var(--border)" }}></div>
        )}
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-sm relative z-10"
          style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length], fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
        >
          {initials(p.nombre)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "var(--foreground)" }}>
              {p.nombre}
            </p>
            {p.ex_presidente && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fef3c7", color: "#92400e", fontWeight: 700 }}>
                Ex-Presidente
              </span>
            )}
            {p.honorario && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#ede9fe", color: "#5b21b6", fontWeight: 700 }}>
                Honorario
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {p.ci_numero} • {p.genero}
            {p.fecha_nacimiento && ` • Nac. ${new Date(p.fecha_nacimiento + "T12:00:00Z").toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
          {(p.correo || p.telefono) && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>
              {[p.correo, p.telefono].filter(Boolean).join(" • ")}
            </p>
          )}
          
          {(activeRoles.length > 0 || (relacionFamiliar && relacionFamiliar.parentesco !== "Ninguno")) && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {activeRoles.map(({ key, label, color, bg, icon: Icon }) => (
                <span
                  key={key}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: bg, color, fontWeight: 700 }}
                >
                  <Icon size={10} />
                  {label}
                </span>
              ))}
              {relacionFamiliar && relacionFamiliar.parentesco !== "Ninguno" && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 700, border: "1px solid #d1d5db" }}>
                  <User size={10} />
                  Familiar: {relacionFamiliar.parentesco}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => { setEditingPersona(p); setFormOpen(true); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            <Pencil size={13} />
          </button>
          {deleteConfirm === p.id ? (
            <div className="flex items-center gap-1">
              <button onClick={() => { onDeletePersona(p.id); setDeleteConfirm(null); }} className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: 700 }}>Sí</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 700 }}>No</button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(p.id)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
              style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 700 }}>
            Personas Vinculadas
          </h4>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {myPersonas.length} {myPersonas.length === 1 ? "persona registrada" : "personas registradas"}
          </p>
        </div>
        <button
          onClick={() => { setEditingPersona(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", fontWeight: 600, boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}
        >
          <Plus size={14} />
          Agregar
        </button>
      </div>

      {myPersonas.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "var(--muted)", border: "2px dashed var(--border)" }}>
          <User size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>
            No hay personas vinculadas aún
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Accionistas and their family members */}
        {accionistas.map((a, idx) => {
          const familiaresDelAccionista = familiares.filter(f => 
            relacionesFamiliares.find(r => r.id_persona_familiar === f.id && r.id_persona_titular === a.id)
          );
          
          return (
            <div key={a.id} className="space-y-3">
              {renderPersonaCard(a, idx)}
              {familiaresDelAccionista.map((f, fIdx) => renderPersonaCard(f, fIdx, true))}
            </div>
          );
        })}
        
        {/* Other Personas */}
        {otrasPersonas.map((p, idx) => renderPersonaCard(p, idx + accionistas.length))}
      </div>

      {formOpen && (
        <PersonaFormModal
          persona={editingPersona}
          miembroId={miembroId}
          vinculacion={editingPersona ? getVinc(editingPersona.id) : undefined}
          relacionFamiliar={editingPersona ? (relacionesFamiliares || []).find(r => r.id_persona_familiar === editingPersona.id) : undefined}
          accionistas={accionistas}
          onClose={() => { setFormOpen(false); setEditingPersona(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

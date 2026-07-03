import { X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { Miembro, TIPOS_MIEMBRO, ESTADOS_SOLVENCIA, TIPOS_EXPLOTACION } from "./mockData";

interface MemberModalProps {
  member: Miembro | null;
  onClose: () => void;
  onSave: (member: Miembro) => void;
}

const EMPTY_MEMBER: Omit<Miembro, "id"> = {
  razon_social: "",
  acronimo: "",
  rif: "",
  fecha_ingreso: new Date().toISOString().split("T")[0],
  tipo: "Activo",
  direccion: "",
  hacienda: "",
  hectareas: 0,
  solvencia: "Solvente",
  saldo_pendiente: 0,
  ultimo_mes: new Date().toISOString().split("T")[0],
  correo: "",
  telefono: "",
  tipo_explotacion: "Ganadería",
  tractores: 0,
  plantas_electricas: 0,
  convenio: false,
  carnets_disponibles: 0,
  cupo_gasoil: false,
  distribuidor_diesel: "",
  cantidad_animales: 0,
  produccion_leche_diaria: 0,
  municipio: "",
  parroquia: "",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
      <span className="text-xs uppercase tracking-widest px-3" style={{ color: "var(--accent)", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
        {children}
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wide" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBase =
  "w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200";
const inputStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--input-background)",
  color: "var(--foreground)",
};

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-2">
      <div
        className="w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
        style={{ backgroundColor: value ? "var(--accent)" : "var(--switch-background)" }}
        onClick={() => onChange(!value)}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: value ? "1.375rem" : "0.25rem" }}
        />
      </div>
      <span className="text-sm" style={{ color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
    </label>
  );
}

export function MemberModal({ member, onClose, onSave }: MemberModalProps) {
  const [form, setForm] = useState<Omit<Miembro, "id">>(EMPTY_MEMBER);
  const isEditing = !!member;

  useEffect(() => {
    if (member) {
      const { id, ...rest } = member;
      setForm(rest);
    } else {
      setForm(EMPTY_MEMBER);
    }
  }, [member]);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: member?.id ?? Date.now() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
      <div
        className="bg-card w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border"
        style={{ borderColor: "var(--border)", boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between rounded-t-3xl"
          style={{ background: "linear-gradient(135deg, #0a1f12 0%, #132d1c 100%)" }}
        >
          <div>
            <h2 style={{ fontFamily: "Nunito, sans-serif", color: "#d1fae5", fontWeight: 800 }}>
              {isEditing ? "Editar Miembro" : "Nuevo Miembro"}
            </h2>
            {isEditing && (
              <p className="text-sm mt-0.5" style={{ color: "#6ee7b7" }}>{member.razon_social}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <X size={16} style={{ color: "#a7f3d0" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          {/* Datos Generales */}
          <div>
            <SectionTitle>Datos Generales</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Razón Social">
                  <input className={inputBase} style={inputStyle} value={form.razon_social} onChange={(e) => set("razon_social", e.target.value)} required placeholder="Nombre de la empresa o finca" />
                </Field>
              </div>
              <Field label="Acrónimo">
                <input className={inputBase} style={inputStyle} value={form.acronimo} onChange={(e) => set("acronimo", e.target.value)} placeholder="SIGLAS" />
              </Field>
              <Field label="RIF">
                <input className={inputBase} style={inputStyle} value={form.rif} onChange={(e) => set("rif", e.target.value)} placeholder="J-XXXXXXXX-X" />
              </Field>
              <Field label="Tipo de Miembro">
                <select className={inputBase} style={inputStyle} value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                  {TIPOS_MIEMBRO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Fecha de Ingreso">
                <input type="date" className={inputBase} style={inputStyle} value={form.fecha_ingreso} onChange={(e) => set("fecha_ingreso", e.target.value)} />
              </Field>
              <Field label="Correo">
                <input type="email" className={inputBase} style={inputStyle} value={form.correo} onChange={(e) => set("correo", e.target.value)} placeholder="correo@dominio.ve" />
              </Field>
              <Field label="Teléfono">
                <input className={inputBase} style={inputStyle} value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="+58-XXX-XXXXXXX" />
              </Field>
              <div className="col-span-2">
                <Field label="Dirección">
                  <input className={inputBase} style={inputStyle} value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
                </Field>
              </div>
              <Field label="Municipio">
                <input className={inputBase} style={inputStyle} value={form.municipio} onChange={(e) => set("municipio", e.target.value)} />
              </Field>
              <Field label="Parroquia">
                <input className={inputBase} style={inputStyle} value={form.parroquia} onChange={(e) => set("parroquia", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Hacienda */}
          <div>
            <SectionTitle>Hacienda y Explotación</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre de Hacienda">
                <input className={inputBase} style={inputStyle} value={form.hacienda} onChange={(e) => set("hacienda", e.target.value)} />
              </Field>
              <Field label="Hectáreas">
                <input type="number" className={inputBase} style={inputStyle} value={form.hectareas} onChange={(e) => set("hectareas", parseFloat(e.target.value) || 0)} min={0} step={0.01} />
              </Field>
              <Field label="Tipo de Explotación">
                <select className={inputBase} style={inputStyle} value={form.tipo_explotacion} onChange={(e) => set("tipo_explotacion", e.target.value)}>
                  {TIPOS_EXPLOTACION.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Cantidad de Animales">
                <input type="number" className={inputBase} style={inputStyle} value={form.cantidad_animales} onChange={(e) => set("cantidad_animales", parseInt(e.target.value) || 0)} min={0} />
              </Field>
              <Field label="Producción Leche Diaria (L)">
                <input type="number" className={inputBase} style={inputStyle} value={form.produccion_leche_diaria} onChange={(e) => set("produccion_leche_diaria", parseFloat(e.target.value) || 0)} min={0} />
              </Field>
              <Field label="Tractores">
                <input type="number" className={inputBase} style={inputStyle} value={form.tractores} onChange={(e) => set("tractores", parseInt(e.target.value) || 0)} min={0} />
              </Field>
              <Field label="Plantas Eléctricas">
                <input type="number" className={inputBase} style={inputStyle} value={form.plantas_electricas} onChange={(e) => set("plantas_electricas", parseInt(e.target.value) || 0)} min={0} />
              </Field>
            </div>
          </div>

          {/* Solvencia */}
          <div>
            <SectionTitle>Solvencia y Servicios</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Estado de Solvencia">
                <select className={inputBase} style={inputStyle} value={form.solvencia} onChange={(e) => set("solvencia", e.target.value)}>
                  {ESTADOS_SOLVENCIA.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Saldo Pendiente (Bs.)">
                <input type="number" className={inputBase} style={inputStyle} value={form.saldo_pendiente} onChange={(e) => set("saldo_pendiente", parseFloat(e.target.value) || 0)} min={0} step={0.01} />
              </Field>
              <Field label="Último Mes Pagado">
                <input type="date" className={inputBase} style={inputStyle} value={form.ultimo_mes} onChange={(e) => set("ultimo_mes", e.target.value)} />
              </Field>
              <Field label="Carnets Disponibles">
                <input type="number" className={inputBase} style={inputStyle} value={form.carnets_disponibles} onChange={(e) => set("carnets_disponibles", parseInt(e.target.value) || 0)} min={0} />
              </Field>
              <div className="col-span-2">
                <Field label="Distribuidor de Diesel">
                  <input className={inputBase} style={inputStyle} value={form.distribuidor_diesel} onChange={(e) => set("distribuidor_diesel", e.target.value)} />
                </Field>
              </div>
              <div className="col-span-2 rounded-2xl p-4 space-y-1" style={{ backgroundColor: "var(--muted)" }}>
                <Toggle value={form.convenio} onChange={(v) => set("convenio", v)} label="Tiene convenio activo" />
                <Toggle value={form.cupo_gasoil} onChange={(v) => set("cupo_gasoil", v)} label="Cupo de gasoil asignado" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 600 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 700, boxShadow: "0 4px 14px rgba(22,163,74,0.4)" }}
            >
              <Save size={15} />
              {isEditing ? "Guardar cambios" : "Crear miembro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

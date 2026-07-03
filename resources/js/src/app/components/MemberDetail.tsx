import { X, Pencil, MapPin, Mail, Phone, Shield } from "lucide-react";
import { Miembro, Persona, Vinculacion } from "./mockData";
import { PersonasPanel } from "./PersonasPanel";

interface MemberDetailProps {
  member: Miembro;
  personas: Persona[];
  vinculaciones: Vinculacion[];
  onClose: () => void;
  onEdit: (m: Miembro) => void;
  onAddPersona: (p: Persona) => void;
  onUpdatePersona: (p: Persona) => void;
  onDeletePersona: (id: number) => void;
  onUpdateVinculacion: (v: Vinculacion) => void;
}

const SOLVENCIA_STYLE: Record<string, { bg: string; color: string; text: string }> = {
  Solvente: { bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", color: "#15803d", text: "Solvente" },
  Insolvente: { bg: "linear-gradient(135deg,#fee2e2,#fecaca)", color: "#991b1b", text: "Insolvente" },
  En_Mora: { bg: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#92400e", text: "En Mora" },
  Exonerado: { bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)", color: "#5b21b6", text: "Exonerado" },
};

const TIPO_BADGE: Record<string, { bg: string; color: string }> = {
  Activo: { bg: "#d1fae5", color: "#15803d" },
  Pasivo: { bg: "#f1f5f9", color: "#475569" },
  Honorario: { bg: "#ede9fe", color: "#5b21b6" },
  Fundador: { bg: "#fef3c7", color: "#92400e" },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-xs uppercase tracking-wide" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>{label}</span>
      <span className="text-sm text-right" style={{ color: "var(--foreground)", fontWeight: 500, maxWidth: "55%" }}>{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
      <h4 className="mb-3" style={{ fontFamily: "Nunito, sans-serif", color: "var(--accent)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</h4>
      {children}
    </div>
  );
}

export function MemberDetail({ member: m, personas, vinculaciones, onClose, onEdit, onAddPersona, onUpdatePersona, onDeletePersona, onUpdateVinculacion }: MemberDetailProps) {
  const solv = SOLVENCIA_STYLE[m.solvencia];
  const tipo = TIPO_BADGE[m.tipo];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}>
      <div
        className="h-full w-full max-w-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--background)",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.15)",
          animation: "slideIn 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-6 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0a1f12 0%, #132d1c 100%)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: tipo.bg, color: tipo.color, fontWeight: 700 }}>
                {m.tipo}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: solv.bg, color: solv.color, fontWeight: 700 }}>
                {solv.text}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(m)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#052e16", fontWeight: 700, boxShadow: "0 4px 12px rgba(34,197,94,0.4)" }}
              >
                <Pencil size={13} />
                Editar
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <X size={16} style={{ color: "#a7f3d0" }} />
              </button>
            </div>
          </div>
          <h2 style={{ fontFamily: "Nunito, sans-serif", color: "#d1fae5", fontWeight: 800, lineHeight: 1.2 }}>
            {m.razon_social}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#6ee7b7" }}>
            {m.acronimo} · {m.rif}
          </p>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Hectáreas", value: m.hectareas.toLocaleString("es-VE") },
              { label: "Animales", value: m.cantidad_animales.toLocaleString("es-VE") },
              { label: "Leche/día", value: m.produccion_leche_diaria > 0 ? `${m.produccion_leche_diaria.toLocaleString()}L` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl px-3 py-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(110,231,183,0.1)" }}>
                <p className="text-lg" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#4ade80" }}>{value}</p>
                <p className="text-xs" style={{ color: "#6ee7b7", opacity: 0.8 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Card title="Contacto y Ubicación">
            {m.correo && <InfoRow label="Correo" value={<a href={`mailto:${m.correo}`} style={{ color: "var(--accent)" }}>{m.correo}</a>} />}
            {m.telefono && <InfoRow label="Teléfono" value={m.telefono} />}
            <InfoRow label="Dirección" value={m.direccion || "—"} />
            <InfoRow label="Municipio" value={m.municipio} />
            <InfoRow label="Parroquia" value={m.parroquia} />
          </Card>

          <Card title="Hacienda y Producción">
            <InfoRow label="Hacienda" value={m.hacienda} />
            <InfoRow label="Tipo de Explotación" value={m.tipo_explotacion} />
            <InfoRow label="Tractores" value={m.tractores} />
            <InfoRow label="Plantas Eléctricas" value={m.plantas_electricas} />
          </Card>

          <Card title="Solvencia y Servicios">
            <InfoRow label="Saldo Pendiente" value={
              m.saldo_pendiente > 0
                ? <span style={{ color: "#dc2626", fontWeight: 700 }}>Bs. {m.saldo_pendiente.toLocaleString("es-VE")}</span>
                : <span style={{ color: "#15803d", fontWeight: 600 }}>Sin deuda</span>
            } />
            <InfoRow label="Último Mes Pagado" value={m.ultimo_mes ? new Date(m.ultimo_mes).toLocaleDateString("es-VE", { month: "long", year: "numeric" }) : "—"} />
            <InfoRow label="Carnets Disponibles" value={m.carnets_disponibles} />
            <InfoRow label="Convenio" value={m.convenio ? <span style={{ color: "#15803d", fontWeight: 700 }}>Sí</span> : "No"} />
            <InfoRow label="Cupo Gasoil" value={m.cupo_gasoil ? <span style={{ color: "#15803d", fontWeight: 700 }}>Sí</span> : "No"} />
            {m.distribuidor_diesel && <InfoRow label="Distribuidor Diesel" value={m.distribuidor_diesel} />}
          </Card>

          <Card title="Registro">
            <InfoRow label="Fecha de Ingreso" value={new Date(m.fecha_ingreso).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })} />
            <InfoRow label="Tipo de Miembro" value={m.tipo} />
          </Card>

          {/* Personas */}
          <div className="rounded-3xl p-5" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <PersonasPanel
              miembroId={m.id}
              personas={personas}
              vinculaciones={vinculaciones}
              onAddPersona={onAddPersona}
              onUpdatePersona={onUpdatePersona}
              onDeletePersona={onDeletePersona}
              onUpdateVinculacion={onUpdateVinculacion}
            />
          </div>
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

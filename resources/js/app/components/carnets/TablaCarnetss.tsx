import { Download, Trash2, CreditCard, Search } from "lucide-react";
import { useState } from "react";
import { CarnetEmitido, EstadoCarnet } from "./carnetData";
import { Miembro, Persona } from "../mockData";

interface TablaCarnetsProps {
  carnets: CarnetEmitido[];
  miembros: Miembro[];
  personas: Persona[];
  onAnular: (id: number) => void;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#16a34a,#4ade80)",
  "linear-gradient(135deg,#0284c7,#38bdf8)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#db2777,#f472b6)",
  "linear-gradient(135deg,#0891b2,#22d3ee)",
];

const ESTADO_CFG: Record<EstadoCarnet, { bg: string; color: string; dot: string; label: string }> = {
  Activo: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Activo" },
  Vencido: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Vencido" },
  Anulado: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Anulado" },
};

function initials(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function diasRestantes(fecha: string): number {
  const d = new Date(fecha).getTime() - Date.now();
  return Math.max(0, Math.ceil(d / (1000 * 60 * 60 * 24)));
}

export function TablaCarnetss({ carnets, miembros, personas, onAnular }: TablaCarnetsProps) {
  const [search, setSearch] = useState("");
  const getPersona = (id: number) => personas.find((p) => p.id === id);
  const getMiembro = (id: number) => miembros.find((m) => m.id === id);

  const activos = carnets.filter((c) => c.estado === "Activo").length;
  const anulados = carnets.filter((c) => c.estado === "Anulado").length;

  const filteredCarnets = carnets.filter((c) => {
    if (!search) return true;
    const p = getPersona(c.id_persona);
    const m = getMiembro(c.id_miembro);
    const text = `${p?.nombre || ''} ${p?.ci_numero || ''} ${m?.razon_social || ''} AGC-${c.id}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Carnets Activos", value: String(activos), bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)", border: "#ddd6fe", color: "#5b21b6" },
          { label: "Total Emitidos", value: String(carnets.length), bg: "linear-gradient(135deg,#f8fafc,#f1f5f9)", border: "#e2e8f0", color: "#334155" },
          { label: "Anulados", value: String(anulados), bg: "linear-gradient(135deg,#fff1f2,#ffe4e6)", border: "#fecdd3", color: "#9f1239" },
        ].map(({ label, value, bg, border, color }) => (
          <div key={label} className="rounded-2xl px-4 py-3" style={{ background: bg, border: `1px solid ${border}` }}>
            <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1.25rem", color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color, opacity: 0.7, fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Cédula, Razón Social o Número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full rounded-2xl outline-none transition-all"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "0.875rem" }}
          />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filteredCarnets.length === 0 && (
          <div className="lg:col-span-2 rounded-3xl p-12 text-center" style={{ backgroundColor: "white", border: "1px solid var(--border)" }}>
            <CreditCard size={32} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px", opacity: 0.4 }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No hay carnets emitidos o que coincidan con la búsqueda</p>
          </div>
        )}
        {filteredCarnets.map((c, idx) => {
          const persona = getPersona(c.id_persona);
          const miembro = getMiembro(c.id_miembro);
          const est = ESTADO_CFG[c.estado];
          const dias = diasRestantes(c.fecha_vencimiento);
          const pronto = dias < 30 && c.estado === "Activo";

          return (
            <div
              key={c.id}
              className="rounded-3xl p-5 flex gap-4 transition-all duration-150"
              style={{
                backgroundColor: "white",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                opacity: c.estado === "Anulado" ? 0.6 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)")}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-sm"
                style={{ background: AVATAR_GRADIENTS[(persona?.id ?? idx) % AVATAR_GRADIENTS.length], fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
              >
                {persona ? initials(persona.nombre) : "?"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "var(--foreground)" }}>
                      {persona?.nombre ?? "Desconocido"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {persona?.ci_numero}
                    </p>
                  </div>
                  <span
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: est.bg, color: est.color, fontWeight: 700 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: est.dot }} />
                    {est.label}
                  </span>
                </div>

                {/* Razón Social badge */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f0fdf4", color: "#15803d", fontWeight: 600, border: "1px solid #bbf7d0" }}>
                    {miembro?.razon_social ?? "Desconocido"}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>AGC-{c.id}</span>
                </div>

                {/* Dates */}
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Emisión</p>
                    <p className="text-xs" style={{ color: "var(--foreground)" }}>
                      {new Date(c.fecha_emision + "T12:00:00Z").toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Vencimiento</p>
                    <p className="text-xs" style={{ color: pronto ? "#d97706" : "var(--foreground)", fontWeight: pronto ? 700 : 400 }}>
                      {new Date(c.fecha_vencimiento + "T12:00:00Z").toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })}
                      {pronto && <span className="ml-1" style={{ color: "#f59e0b" }}>· {dias}d</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {c.estado !== "Anulado" && (
                <div className="flex flex-col gap-2 flex-shrink-0 justify-start">
                  <button
                    onClick={() => {
                      window.open(`/api/carnets-emitidos/${c.id}/pdf`, '_blank');
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                    style={{ backgroundColor: "#f0fdf4", color: "#15803d" }}
                    title="Descargar PDF"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => onAnular(c.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                    style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
                    title="Anular carnet"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

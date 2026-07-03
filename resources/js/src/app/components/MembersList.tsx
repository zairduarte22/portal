import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Filter, ChevronUp, ChevronDown, Eye, Users } from "lucide-react";
import { Miembro, Persona, Vinculacion, ESTADOS_SOLVENCIA, TIPOS_EXPLOTACION } from "./mockData";
import { MemberModal } from "./MemberModal";
import { MemberDetail } from "./MemberDetail";

const SOLVENCIA_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  Solvente: { bg: "#dcfce7", color: "#15803d", label: "Solvente" },
  Insolvente: { bg: "#fee2e2", color: "#991b1b", label: "Insolvente" },
  En_Mora: { bg: "#fef3c7", color: "#92400e", label: "En Mora" },
  Exonerado: { bg: "#ede9fe", color: "#5b21b6", label: "Exonerado" },
};

const TIPO_BADGE: Record<string, { bg: string; color: string }> = {
  Activo: { bg: "#dcfce7", color: "#15803d" },
  Pasivo: { bg: "#f1f5f9", color: "#475569" },
  Honorario: { bg: "#ede9fe", color: "#5b21b6" },
  Fundador: { bg: "#fef3c7", color: "#92400e" },
};

interface MembersListProps {
  members: Miembro[];
  personas: Persona[];
  vinculaciones: Vinculacion[];
  onAdd: (m: Miembro) => void;
  onUpdate: (m: Miembro) => void;
  onDelete: (id: number) => void;
  onAddPersona: (p: Persona) => void;
  onUpdatePersona: (p: Persona) => void;
  onDeletePersona: (id: number) => void;
  onUpdateVinculacion: (v: Vinculacion) => void;
}

type SortKey = keyof Miembro;

export function MembersList({
  members, personas, vinculaciones,
  onAdd, onUpdate, onDelete,
  onAddPersona, onUpdatePersona, onDeletePersona, onUpdateVinculacion,
}: MembersListProps) {
  const [search, setSearch] = useState("");
  const [filterSolvencia, setFilterSolvencia] = useState("Todos");
  const [filterExplotacion, setFilterExplotacion] = useState("Todos");
  const [sortKey, setSortKey] = useState<SortKey>("razon_social");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingMember, setEditingMember] = useState<Miembro | null | undefined>(undefined);
  const [viewingMember, setViewingMember] = useState<Miembro | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = members
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.razon_social.toLowerCase().includes(q) ||
        m.rif.toLowerCase().includes(q) ||
        m.acronimo.toLowerCase().includes(q) ||
        m.hacienda.toLowerCase().includes(q) ||
        m.municipio.toLowerCase().includes(q)
      );
    })
    .filter((m) => filterSolvencia === "Todos" || m.solvencia === filterSolvencia)
    .filter((m) => filterExplotacion === "Todos" || m.tipo_explotacion === filterExplotacion)
    .sort((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), "es", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

  const Th = ({ label, sk }: { label: string; sk?: SortKey }) => (
    <th
      className="px-4 py-3.5 text-left whitespace-nowrap"
      style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em", cursor: sk ? "pointer" : "default" }}
      onClick={sk ? () => toggleSort(sk) : undefined}
    >
      <span className="flex items-center gap-1">
        {label}
        {sk && sortKey === sk && (sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
      </span>
    </th>
  );

  const getPersonasCount = (id: number) => personas.filter((p) => p.id_miembro === id).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
            Miembros
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {filtered.length} de {members.length} registros
          </p>
        </div>
        <button
          onClick={() => setEditingMember(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 700, boxShadow: "0 4px 14px rgba(22,163,74,0.35)" }}
        >
          <Plus size={16} />
          Nuevo Miembro
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border p-4" style={{ borderColor: "var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-52 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-green-200"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
              placeholder="Buscar por nombre, RIF, hacienda, municipio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "var(--muted-foreground)" }} />
            <select
              className="px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
              value={filterSolvencia}
              onChange={(e) => setFilterSolvencia(e.target.value)}
            >
              <option value="Todos">Solvencia: Todos</option>
              {ESTADOS_SOLVENCIA.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <select
              className="px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
              value={filterExplotacion}
              onChange={(e) => setFilterExplotacion(e.target.value)}
            >
              <option value="Todos">Explotación: Todos</option>
              {TIPOS_EXPLOTACION.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <Th label="Razón Social / RIF" sk="razon_social" />
                <Th label="Tipo" />
                <Th label="Hacienda" sk="hacienda" />
                <Th label="Hectáreas" sk="hectareas" />
                <Th label="Explotación" />
                <Th label="Solvencia" sk="solvencia" />
                <Th label="Saldo Pend." sk="saldo_pendiente" />
                <Th label="Municipio" />
                <Th label="Personas" />
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <Search size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px", opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No se encontraron miembros</p>
                  </td>
                </tr>
              )}
              {filtered.map((m) => {
                const solv = SOLVENCIA_BADGE[m.solvencia];
                const tipo = TIPO_BADGE[m.tipo];
                const nPersonas = getPersonasCount(m.id);
                return (
                  <tr
                    key={m.id}
                    className="border-t transition-all duration-100"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-sm" style={{ fontWeight: 700, color: "var(--foreground)", fontFamily: "Nunito, sans-serif" }}>
                        {m.razon_social}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{m.rif}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: tipo.bg, color: tipo.color, fontWeight: 700 }}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--foreground)", fontWeight: 500 }}>{m.hacienda}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--foreground)" }}>
                      {m.hectareas.toLocaleString("es-VE")} <span style={{ color: "var(--muted-foreground)" }}>ha</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--muted-foreground)" }}>{m.tipo_explotacion}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: solv.bg, color: solv.color, fontWeight: 700 }}>
                        {solv.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: m.saldo_pendiente > 0 ? "#dc2626" : "var(--muted-foreground)", fontWeight: m.saldo_pendiente > 0 ? 700 : 400 }}>
                      {m.saldo_pendiente > 0 ? `Bs. ${m.saldo_pendiente.toLocaleString("es-VE")}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--muted-foreground)" }}>{m.municipio}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} style={{ color: "var(--muted-foreground)" }} />
                        <span className="text-sm" style={{ color: nPersonas > 0 ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: nPersonas > 0 ? 700 : 400 }}>
                          {nPersonas}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingMember(m)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                          style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditingMember(m)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                          style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        {deleteConfirm === m.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { onDelete(m.id); setDeleteConfirm(null); }} className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: 700 }}>Sí</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 700 }}>No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(m.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                            style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingMember !== undefined && (
        <MemberModal
          member={editingMember}
          onClose={() => setEditingMember(undefined)}
          onSave={(m) => {
            if (editingMember) onUpdate(m);
            else onAdd(m);
            setEditingMember(undefined);
          }}
        />
      )}

      {viewingMember && (
        <MemberDetail
          member={viewingMember}
          personas={personas}
          vinculaciones={vinculaciones}
          onClose={() => setViewingMember(null)}
          onEdit={(m) => { setViewingMember(null); setEditingMember(m); }}
          onAddPersona={onAddPersona}
          onUpdatePersona={onUpdatePersona}
          onDeletePersona={onDeletePersona}
          onUpdateVinculacion={onUpdateVinculacion}
        />
      )}
    </div>
  );
}

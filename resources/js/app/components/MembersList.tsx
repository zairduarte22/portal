import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Filter, ChevronUp, ChevronDown, Eye, Users, ChevronLeft, ChevronRight, Download, Shield } from "lucide-react";
import { Miembro, Persona, Vinculacion, RelacionFamiliar, ESTADOS_SOLVENCIA, TIPOS_EXPLOTACION } from "./mockData";
import { MemberModal } from "./MemberModal";
import { MemberDetail } from "./MemberDetail";
import { ReportModal } from "./ReportModal";

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
  relacionesFamiliares: RelacionFamiliar[];
  onAdd: (m: Miembro) => void;
  onUpdate: (m: Miembro) => void;
  onDelete: (id: number) => void;
  onAddPersona: (p: Persona, v?: Vinculacion) => void;
  onUpdatePersona: (p: Persona) => void;
  onDeletePersona: (id: number) => void;
  onUpdateVinculacion: (v: Vinculacion) => void;
}

type SortKey = keyof Miembro;

export function MembersList({
  members, personas, vinculaciones, relacionesFamiliares,
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
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    setPage(1);
  }, [search, filterSolvencia, filterExplotacion]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const personasCountMap = useMemo(() => {
    const counts: Record<number, number> = {};
    // Ensure we count unique personas per miembro (in case one persona has multiple roles, vinculacion only has one row per member/persona pair though)
    for (const v of vinculaciones) {
      counts[v.id_miembro] = (counts[v.id_miembro] || 0) + 1;
    }
    return counts;
  }, [vinculaciones]);

  const filtered = useMemo(() => {
    return members
      .filter((m) => {
        const q = search.toLowerCase();
        return (
          (m.razon_social || "").toLowerCase().includes(q) ||
          (m.rif || "").toLowerCase().includes(q) ||
          (m.acronimo || "").toLowerCase().includes(q) ||
          (m.hacienda || "").toLowerCase().includes(q) ||
          (m.municipio || "").toLowerCase().includes(q)
        );
      })
      .filter((m) => filterSolvencia === "Todos" || m.solvencia === filterSolvencia)
      .filter((m) => filterExplotacion === "Todos" || m.tipo_explotacion === filterExplotacion)
      .sort((a, b) => {
        const cmp = String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""), "es", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [members, search, filterSolvencia, filterExplotacion, sortKey, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  const Th = ({ label, sk, className = "" }: { label: string; sk?: SortKey; className?: string }) => (
    <th
      className={`px-4 py-3.5 text-left whitespace-nowrap ${className}`}
      style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em", cursor: sk ? "pointer" : "default" }}
      onClick={sk ? () => toggleSort(sk) : undefined}
    >
      <span className="flex items-center gap-1">
        {label}
        {sk && sortKey === sk && (sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
      </span>
    </th>
  );

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90 border"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)", fontWeight: 700 }}
          >
            <Download size={16} />
            Descargar Reporte
          </button>
          <button
            onClick={() => setEditingMember(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 700, boxShadow: "0 4px 14px rgba(22,163,74,0.35)" }}
          >
            <Plus size={16} />
            Nuevo Miembro
          </button>
        </div>
      </div>

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

      <div className="bg-card rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <Th label="Cod." sk="id" />
                <Th label="Razón Social / RIF" sk="razon_social" />
                <Th label="Representante" />
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
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <Search size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px", opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No se encontraron miembros</p>
                  </td>
                </tr>
              )}
              {paginated.map((m) => {
                const solv = SOLVENCIA_BADGE[m.solvencia] || { bg: "#f1f5f9", color: "#475569", label: m.solvencia || "N/A" };
                const tipo = TIPO_BADGE[m.tipo] || { bg: "#f1f5f9", color: "#475569" };
                const nPersonas = personasCountMap[m.id] || 0;

                const repVinc = vinculaciones.find(v => v.id_miembro === m.id && v.representante);
                const representante = repVinc ? personas.find(p => p.id === repVinc.id_persona) : undefined;

                return (
                  <tr
                    key={m.id}
                    className="border-t transition-colors hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--muted-foreground)", fontWeight: 800 }}>
                      #{String(m.id).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm" style={{ fontWeight: 700, color: "var(--foreground)", fontFamily: "Nunito, sans-serif" }}>
                          {m.razon_social}
                        </p>
                        {m.congelado && (
                          <span className="px-1.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }} title={m.congelado_hasta ? `Congelado hasta ${m.congelado_hasta}` : 'Congelado indefinidamente'}>
                            Congelado
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{m.rif}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {representante ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0" title="Representante Legal">
                          <Shield size={12} className="flex-shrink-0" style={{ color: "var(--accent)", opacity: 0.8 }} />
                          <span className="text-sm truncate" style={{ color: "var(--foreground)", fontWeight: 600 }}>{representante.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>No asignado</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: tipo.bg, color: tipo.color, fontWeight: 700 }}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--foreground)", fontWeight: 500 }}>{m.hacienda}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--foreground)" }}>
                      {(m.hectareas || 0).toLocaleString("es-VE")} <span style={{ color: "var(--muted-foreground)" }}>ha</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--muted-foreground)" }}>{m.tipo_explotacion}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: solv.bg, color: solv.color, fontWeight: 700 }}>
                        {solv.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: m.saldo_pendiente > 0 ? "#dc2626" : "var(--muted-foreground)", fontWeight: m.saldo_pendiente > 0 ? 700 : 400 }}>
                      {m.saldo_pendiente > 0 ? `Bs. ${m.saldo_pendiente.toLocaleString("es-VE")}` : "--"}
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

        {/* Mobile Cards View */}
        <div className="block lg:hidden flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.length === 0 && (
            <div className="px-4 py-16 text-center">
              <Search size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No se encontraron miembros</p>
            </div>
          )}
          {paginated.map((m) => {
            const solv = SOLVENCIA_BADGE[m.solvencia] || { bg: "#f1f5f9", color: "#475569", label: m.solvencia || "N/A" };
            const tipo = TIPO_BADGE[m.tipo] || { bg: "#f1f5f9", color: "#475569" };
            const nPersonas = personasCountMap[m.id] || 0;

            const repVinc = vinculaciones.find(v => v.id_miembro === m.id && v.representante);
            const representante = repVinc ? personas.find(p => p.id === repVinc.id_persona) : undefined;

            return (
              <div key={m.id} className="p-4 space-y-3 transition-colors hover:bg-[var(--muted)]">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm" style={{ fontWeight: 800, color: "var(--foreground)", fontFamily: "Nunito, sans-serif" }}>
                      {m.razon_social}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>#{String(m.id).padStart(4, "0")}</span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{m.rif}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap" style={{ backgroundColor: solv.bg, color: solv.color, fontWeight: 700 }}>
                    {solv.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-black/5 p-2 rounded-xl">
                  {representante ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0" title="Representante Legal">
                      <Shield size={14} className="flex-shrink-0" style={{ color: "var(--accent)", opacity: 0.8 }} />
                      <span className="text-xs truncate" style={{ color: "var(--foreground)", fontWeight: 700 }}>{representante.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-xs italic" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>Representante no asignado</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px]" style={{ backgroundColor: tipo.bg, color: tipo.color, fontWeight: 700 }}>
                      {m.tipo}
                    </span>
                    <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      <Users size={11} />
                      <span style={{ fontWeight: 600 }}>{nPersonas} pers.</span>
                    </div>
                  </div>

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
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)" }}>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 hover:bg-black/5"
                style={{ color: "var(--foreground)" }}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 hover:bg-black/5"
                style={{ color: "var(--foreground)" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
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
          relacionesFamiliares={relacionesFamiliares}
          onClose={() => setViewingMember(null)}
          onEdit={(m) => { setViewingMember(null); setEditingMember(m); }}
          onAddPersona={(p, v) => onAddPersona(p, v)}
          onUpdatePersona={onUpdatePersona}
          onDeletePersona={onDeletePersona}
          onUpdateVinculacion={onUpdateVinculacion}
        />
      )}

      {reportModalOpen && (
        <ReportModal
          members={members}
          personas={personas}
          vinculaciones={vinculaciones}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
}

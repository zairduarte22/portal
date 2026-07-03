import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Filter, Eye, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Miembro, Persona, Vinculacion, RelacionFamiliar } from "./mockData";
import { PersonaFormModal } from "./PersonasPanel";
import { PersonaDetailModal } from "./PersonaDetailModal";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #3b82f6, #2563eb)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
];

function initials(name: string) {
  return name.substring(0, 2).toUpperCase();
}

interface PersonasListProps {
  members: Miembro[];
  personas: Persona[];
  vinculaciones: Vinculacion[];
  relacionesFamiliares: RelacionFamiliar[];
  onUpdatePersona: (p: Persona) => void;
  onUpdateVinculacion: (v: Vinculacion) => void;
  onDeletePersona: (id: number) => void;
  onDeleteVinculacion?: (mId: number, pId: number) => void;
  onAddPersona?: (p: Persona, v: Vinculacion) => void;
}

export function PersonasList({
  members,
  personas,
  vinculaciones,
  relacionesFamiliares,
  onUpdatePersona,
  onUpdateVinculacion,
  onDeletePersona,
  onDeleteVinculacion,
  onAddPersona,
}: PersonasListProps) {
  const [search, setSearch] = useState("");
  const [filterMiembro, setFilterMiembro] = useState("Todos");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [editingMiembroId, setEditingMiembroId] = useState<number | null>(null);
  const [viewingPersona, setViewingPersona] = useState<Persona | null>(null);
  const [addingPersona, setAddingPersona] = useState(false);
  const [addingMiembroId, setAddingMiembroId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, filterMiembro]);

  const filtered = useMemo(() => {
    return personas.filter(p => {
      // Filtrar por búsqueda
      const q = search.toLowerCase();
      const matchSearch = 
        (p.nombre || "").toLowerCase().includes(q) ||
        (p.ci_numero || "").toLowerCase().includes(q) ||
        (p.correo || "").toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Filtrar por miembro
      if (filterMiembro !== "Todos") {
        const miembroId = parseInt(filterMiembro);
        const hasVinculacion = vinculaciones.some(v => v.id_persona === p.id && v.id_miembro === miembroId);
        if (!hasVinculacion) return false;
      }

      return true;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
  }, [personas, search, filterMiembro, vinculaciones]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  // Lógica de guardado al editar desde el modal
  const handleSave = (p: Persona, v: Vinculacion) => {
    onUpdatePersona(p);
    onUpdateVinculacion(v);
    setEditingPersona(null);
    setEditingMiembroId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
            Personas y Contactos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {filtered.length} de {personas.length} registros
          </p>
        </div>
        {onAddPersona && (
          <button
            onClick={() => {
              setAddingPersona(true);
              setAddingMiembroId(members[0]?.id || 0);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "var(--accent)", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
          >
            <Plus size={16} /> Agregar Persona
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border p-4" style={{ borderColor: "var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-52 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-green-200"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
              placeholder="Buscar por nombre, cédula, pasaporte o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-56 relative flex items-center">
            <Filter size={15} className="absolute left-3.5" style={{ color: "var(--muted-foreground)" }} />
            <select
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-green-200"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
              value={filterMiembro}
              onChange={(e) => setFilterMiembro(e.target.value)}
            >
              <option value="Todos">Todos los Miembros</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.razon_social}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-card rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3.5 text-left whitespace-nowrap" style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Persona</th>
                <th className="px-4 py-3.5 text-left whitespace-nowrap" style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Contacto</th>
                <th className="px-4 py-3.5 text-left whitespace-nowrap" style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Miembro(s) Asociado(s)</th>
                <th className="px-4 py-3.5 text-left whitespace-nowrap" style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Roles y Familia</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap" style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <User size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px", opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No se encontraron personas</p>
                  </td>
                </tr>
              )}
              {paginated.map((p, idx) => {
                const myVincs = vinculaciones.filter(v => v.id_persona === p.id);
                const assignedMembers = members.filter(m => myVincs.some(v => v.id_miembro === m.id));
                const relacionFamiliar = relacionesFamiliares.find(r => r.id_persona_familiar === p.id);

                return (
                  <tr key={p.id} className="border-t transition-colors hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm"
                          style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length], fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
                        >
                          {initials(p.nombre)}
                        </div>
                        <div>
                          <p className="text-sm" style={{ fontWeight: 700, color: "var(--foreground)", fontFamily: "Nunito, sans-serif" }}>
                            {p.nombre}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {p.ci_numero} • {p.genero}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        {p.correo && <span className="text-sm" style={{ color: "var(--foreground)" }}>{p.correo}</span>}
                        {p.telefono && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.telefono}</span>}
                        {!p.correo && !p.telefono && <span className="text-xs italic" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>Sin contacto</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        {assignedMembers.length > 0 ? assignedMembers.map(m => (
                          <span key={m.id} className="text-sm px-2 py-0.5 rounded-lg w-fit" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", fontWeight: 600 }}>
                            {m.razon_social}
                          </span>
                        )) : (
                          <span className="text-xs italic" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>No asociado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {myVincs.map(vinc => {
                          const roles = [];
                          if (vinc.representante) roles.push({ key: 'representante', label: 'Representante', bg: '#dbeafe', color: '#1d4ed8' });
                          if (vinc.director) roles.push({ key: 'director', label: 'Director', bg: '#f3e8ff', color: '#7e22ce' });
                          if (vinc.accionista) roles.push({ key: 'accionista', label: 'Accionista', bg: '#dcfce7', color: '#15803d' });
                          if (vinc.presidente) roles.push({ key: 'presidente', label: 'Presidente', bg: '#fee2e2', color: '#b91c1c' });

                          return roles.map(r => (
                            <span key={`${vinc.id_miembro}-${r.key}`} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: r.bg, color: r.color, fontWeight: 700 }}>
                              {r.label}
                            </span>
                          ));
                        })}
                        {relacionFamiliar && relacionFamiliar.parentesco !== "Ninguno" && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 700, border: "1px solid #d1d5db" }}>
                            Familiar: {relacionFamiliar.parentesco}
                          </span>
                        )}
                        {myVincs.every(v => !v.representante && !v.director && !v.accionista && !v.presidente) && (!relacionFamiliar || relacionFamiliar.parentesco === "Ninguno") && (
                           <span className="text-xs italic" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>Otro</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingPersona(p)}
                          className="w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all hover:opacity-80"
                          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
                          title="Ver Ficha"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPersona(p);
                            const firstMiembroId = myVincs[0]?.id_miembro || (members[0]?.id || 0);
                            setEditingMiembroId(firstMiembroId);
                          }}
                          className="w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all hover:opacity-80"
                          style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                          title="Editar Ficha"
                        >
                          <Pencil size={13} />
                        </button>
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
              <User size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No se encontraron personas</p>
            </div>
          )}
          {paginated.map((p, idx) => {
            const myVincs = vinculaciones.filter(v => v.id_persona === p.id);
            const assignedMembers = members.filter(m => myVincs.some(v => v.id_miembro === m.id));
            const relacionFamiliar = relacionesFamiliares.find(r => r.id_persona_familiar === p.id);

            return (
              <div key={p.id} className="p-4 space-y-3 transition-colors hover:bg-[var(--muted)]">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm"
                    style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length], fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
                  >
                    {initials(p.nombre)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ fontWeight: 800, color: "var(--foreground)", fontFamily: "Nunito, sans-serif" }}>
                      {p.nombre}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {p.ci_numero} • {p.genero}
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {p.correo && <span className="truncate max-w-[120px]">{p.correo}</span>}
                    {p.telefono && <span>{p.telefono}</span>}
                    {!p.correo && !p.telefono && <span className="italic opacity-60">Sin contacto</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {assignedMembers.length > 0 ? assignedMembers.map(m => (
                    <span key={m.id} className="text-xs px-2 py-0.5 rounded-lg w-fit" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", fontWeight: 600 }}>
                      {m.razon_social}
                    </span>
                  )) : (
                    <span className="text-xs italic" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>No asociado a miembro</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {myVincs.map(vinc => {
                      const roles = [];
                      if (vinc.representante) roles.push({ key: 'representante', label: 'Representante', bg: '#dbeafe', color: '#1d4ed8' });
                      if (vinc.director) roles.push({ key: 'director', label: 'Director', bg: '#f3e8ff', color: '#7e22ce' });
                      if (vinc.accionista) roles.push({ key: 'accionista', label: 'Accionista', bg: '#dcfce7', color: '#15803d' });
                      if (vinc.presidente) roles.push({ key: 'presidente', label: 'Presidente', bg: '#fee2e2', color: '#b91c1c' });

                      return roles.map(r => (
                        <span key={`${vinc.id_miembro}-${r.key}`} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: r.bg, color: r.color, fontWeight: 700 }}>
                          {r.label}
                        </span>
                      ));
                    })}
                    {relacionFamiliar && relacionFamiliar.parentesco !== "Ninguno" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 700, border: "1px solid #d1d5db" }}>
                        Fam: {relacionFamiliar.parentesco}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setViewingPersona(p)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                      style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
                      title="Ver Ficha"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPersona(p);
                        const firstMiembroId = myVincs[0]?.id_miembro || (members[0]?.id || 0);
                        setEditingMiembroId(firstMiembroId);
                      }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                      style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                      title="Editar Ficha"
                    >
                      <Pencil size={13} />
                    </button>
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

      {viewingPersona && (
        <PersonaDetailModal
          persona={viewingPersona}
          miembros={members}
          vinculaciones={vinculaciones}
          relacionesFamiliares={relacionesFamiliares}
          accionistas={personas} // Ideally we pass only accionistas, but for simplicity we pass all personas to be filtered inside
          onClose={() => setViewingPersona(null)}
          onEdit={(p) => {
            setViewingPersona(null);
            setEditingPersona(p);
            const myVincs = vinculaciones.filter(v => v.id_persona === p.id);
            const firstMiembroId = myVincs[0]?.id_miembro || (members[0]?.id || 0);
            setEditingMiembroId(firstMiembroId);
          }}
          onDelete={(id) => {
            onDeletePersona(id);
            setViewingPersona(null);
          }}
        />
      )}

      {editingPersona && editingMiembroId !== null && (
        <PersonaFormModal
          persona={editingPersona}
          miembroId={editingMiembroId}
          vinculacion={vinculaciones.find(v => v.id_persona === editingPersona.id && v.id_miembro === editingMiembroId)}
          relacionFamiliar={relacionesFamiliares.find(r => r.id_persona_familiar === editingPersona.id && vinculaciones.some(v => v.id_persona === r.id_persona_titular && v.id_miembro === editingMiembroId && v.accionista))}
          accionistas={
            (() => {
              const accionistasVincs = vinculaciones.filter(v => v.id_miembro === editingMiembroId && v.accionista);
              return accionistasVincs.map(v => personas.find(p => p.id === v.id_persona)).filter((p): p is Persona => p !== undefined);
            })()
          }
          contextoMiembros={members.map(m => ({ id: m.id, nombre: m.razon_social }))}
          todasVinculaciones={vinculaciones.filter(v => v.id_persona === editingPersona.id)}
          onSwitchMiembro={(newId) => setEditingMiembroId(newId)}
          onDeleteVinculacion={(mId) => {
            if (onDeleteVinculacion) onDeleteVinculacion(mId, editingPersona.id);
            // Optionally, if they deleted the currently edited member, switch to another
            if (mId === editingMiembroId) {
              const remaining = vinculaciones.filter(v => v.id_persona === editingPersona.id && v.id_miembro !== mId);
              setEditingMiembroId(remaining.length > 0 ? remaining[0].id_miembro : (members[0]?.id || 0));
            }
          }}
          onClose={() => {
            setEditingPersona(null);
            setEditingMiembroId(null);
          }}
          onSave={handleSave}
        />
      )}

      {addingPersona && addingMiembroId !== null && onAddPersona && (
        <PersonaFormModal
          persona={null}
          miembroId={addingMiembroId}
          accionistas={
            (() => {
              const accionistasVincs = vinculaciones.filter(v => v.id_miembro === addingMiembroId && v.accionista);
              return accionistasVincs.map(v => personas.find(p => p.id === v.id_persona)).filter((p): p is Persona => p !== undefined);
            })()
          }
          contextoMiembros={members.map(m => ({ id: m.id, nombre: m.razon_social }))}
          onSwitchMiembro={(newId) => setAddingMiembroId(newId)}
          onClose={() => {
            setAddingPersona(false);
            setAddingMiembroId(null);
          }}
          onSave={(p, v) => {
            onAddPersona(p, v);
            setAddingPersona(false);
            setAddingMiembroId(null);
          }}
        />
      )}
    </div>
  );
}

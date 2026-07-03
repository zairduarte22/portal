import { X, Pencil, Award, Shield, Crown, Star, User, UserCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Miembro, Persona, Vinculacion, RelacionFamiliar } from "./mockData";

interface PersonaDetailModalProps {
  persona: Persona;
  miembros: Miembro[];
  vinculaciones: Vinculacion[];
  relacionesFamiliares: RelacionFamiliar[];
  accionistas: Persona[];
  onClose: () => void;
  onEdit: (p: Persona) => void;
  onDelete: (id: number) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
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

export function PersonaDetailModal({ 
  persona, 
  miembros, 
  vinculaciones, 
  relacionesFamiliares, 
  accionistas, 
  onClose, 
  onEdit, 
  onDelete 
}: PersonaDetailModalProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [carnets, setCarnets] = useState<any[]>([]);
  const myVincs = vinculaciones.filter(v => v.id_persona === persona.id);

  useEffect(() => {
    fetch('/api/carnets-emitidos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCarnets(data.filter((c: any) => c.id_persona === persona.id));
        }
      })
      .catch(console.error);
  }, [persona.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
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
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f1f5f9", color: "#475569", fontWeight: 700 }}>
                Ficha de Persona
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#fca5a5", fontWeight: 700 }}
              >
                <Trash2 size={13} />
                Borrar
              </button>
              <button
                onClick={() => onEdit(persona)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 700, boxShadow: "0 4px 12px rgba(34,197,94,0.4)" }}
              >
                <Pencil size={13} />
                Editar
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              >
                <X size={16} style={{ color: "rgba(255,255,255,0.7)" }} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}>
              {persona.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl" style={{ fontFamily: "Nunito, sans-serif", color: "#fff", fontWeight: 800 }}>
                {persona.nombre}
              </h2>
              <div className="flex items-center gap-4 mt-1.5 opacity-80">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "#d1d5db" }}>
                  <UserCircle size={14} /> CI/Pasaporte: {persona.ci_numero}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card title="Contacto">
              <Row label="Correo" value={persona.correo || "N/A"} />
              <Row label="Teléfono" value={persona.telefono || "N/A"} />
            </Card>
            <Card title="Detalles Personales">
              <Row label="Género" value={persona.genero} />
              <Row label="F. Nacimiento" value={persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento + "T12:00:00Z").toLocaleDateString("es-VE") : "N/A"} />
            </Card>
          </div>

          <Card title="Relaciones (Haciendas/Miembros)">
            <div className="space-y-3">
              {myVincs.length === 0 && (
                <p className="text-sm italic text-center py-4" style={{ color: "var(--muted-foreground)" }}>No está asociado a ningún miembro.</p>
              )}
              {myVincs.map(vinc => {
                const miembro = miembros.find(m => m.id === vinc.id_miembro);
                const relacion = relacionesFamiliares.find(r => r.id_persona_familiar === persona.id && r.id_persona_titular && accionistas.some(a => a.id === r.id_persona_titular));
                const titular = relacion ? accionistas.find(a => a.id === relacion.id_persona_titular) : null;

                return (
                  <div key={vinc.id_miembro} className="rounded-2xl p-4 border" style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <p className="text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>{miembro?.razon_social || "Miembro Desconocido"}</p>
                    <div className="flex flex-wrap gap-2">
                      {vinc.presidente && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: 700 }}>
                          <Award size={12} /> Presidente
                        </span>
                      )}
                      {vinc.representante && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}>
                          <Shield size={12} /> Representante
                        </span>
                      )}
                      {vinc.director && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", fontWeight: 700 }}>
                          <Crown size={12} /> Director
                        </span>
                      )}
                      {vinc.accionista && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#15803d", fontWeight: 700 }}>
                          <Star size={12} /> Accionista
                        </span>
                      )}
                      {relacion && titular && relacion.parentesco !== "Ninguno" && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border" style={{ backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 700, borderColor: "#d1d5db" }}>
                          <User size={12} /> Familiar ({relacion.parentesco}) de {titular.nombre}
                        </span>
                      )}
                      {!vinc.presidente && !vinc.representante && !vinc.director && !vinc.accionista && (!relacion || relacion.parentesco === "Ninguno") && (
                        <span className="text-xs px-2 py-1 italic" style={{ color: "var(--muted-foreground)" }}>Asociado sin roles</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Carnets Emitidos">
            <div className="space-y-3">
              {carnets.length === 0 && (
                <p className="text-sm italic text-center py-4" style={{ color: "var(--muted-foreground)" }}>No tiene carnets emitidos.</p>
              )}
              {carnets.map(carnet => (
                <div key={carnet.id} className="rounded-2xl p-4 border flex justify-between items-center" style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{carnet.miembro?.razon_social || "Hacienda"}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Emitido: {carnet.fecha_emision} | Vence: {carnet.fecha_vencimiento || 'N/A'}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-lg font-bold bg-blue-500/10 text-blue-500">{carnet.estado}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-center" style={{ borderColor: "var(--border)" }}>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: "#fee2e2" }}>
              <Trash2 size={24} style={{ color: "#dc2626" }} />
            </div>
            <h3 className="text-lg mb-2" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
              ¿Eliminar Persona?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              Se eliminará permanentemente a <strong>{persona.nombre}</strong> y todas sus vinculaciones asociadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(persona.id);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                style={{ backgroundColor: "#ef4444", color: "#fff", fontWeight: 600 }}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

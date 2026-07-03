import { X, Pencil, MapPin, Mail, Phone, Shield, FileText, UserCircle, IdCard, CheckCircle, Clock, XCircle, CreditCard, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Miembro, Persona, Vinculacion, RelacionFamiliar } from "./mockData";
import { PersonasPanel } from "./PersonasPanel";
import { EstadoCuentaPanel } from "./EstadoCuentaPanel";
import { DocumentosPanel } from "./DocumentosPanel";

interface MemberDetailProps {
  member: Miembro;
  personas: Persona[];
  vinculaciones: Vinculacion[];
  relacionesFamiliares: RelacionFamiliar[];
  onClose: () => void;
  onEdit: (m: Miembro) => void;
  onAddPersona: (p: Persona, v?: Vinculacion) => void;
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

export function MemberDetail({ member: mProp, personas, vinculaciones, relacionesFamiliares, onClose, onEdit, onAddPersona, onUpdatePersona, onDeletePersona, onUpdateVinculacion }: MemberDetailProps) {
  const [m, setM] = useState<Miembro>(mProp);

  useEffect(() => {
    fetch(`/api/miembros/${mProp.id}`)
      .then(res => res.json())
      .then(data => setM(data))
      .catch(console.error);
  }, [mProp.id]);

  const solv = SOLVENCIA_STYLE[m.solvencia] || { bg: "linear-gradient(135deg,#f1f5f9,#e2e8f0)", color: "#475569", text: m.solvencia || "N/A" };
  const tipo = TIPO_BADGE[m.tipo] || { bg: "#f1f5f9", color: "#475569" };
  
  const [activeTab, setActiveTab] = useState<"detalles" | "estado_cuenta" | "carnets" | "documentos">("detalles");

  const [pagosCarnets, setPagosCarnets] = useState<any[]>([]);
  const [carnetsEmitidos, setCarnetsEmitidos] = useState<any[]>([]);
  const [loadingCarnetsData, setLoadingCarnetsData] = useState(false);

  useEffect(() => {
    if (activeTab === "carnets") {
      setLoadingCarnetsData(true);
      Promise.all([
        fetch('/api/pagos-carnets'),
        fetch('/api/carnets-emitidos')
      ])
      .then(async ([resP, resC]) => {
        if (resP.ok && resC.ok) {
          const p = await resP.json();
          const c = await resC.json();
          setPagosCarnets(p.filter((x: any) => x.id_miembro === m.id));
          setCarnetsEmitidos(c.filter((x: any) => x.id_miembro === m.id));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCarnetsData(false));
    }
  }, [activeTab, m.id]);

  const getPersona = (id: number) => personas.find(p => p.id === id);

  const ESTADO_CFG: Record<string, { bg: string; color: string; icon: React.ElementType; label: string; dot: string }> = {
    Aprobado: { bg: "#dcfce7", color: "#15803d", icon: CheckCircle, label: "Aprobado", dot: "#22c55e" },
    Pendiente: { bg: "#fef3c7", color: "#92400e", icon: Clock, label: "Pendiente", dot: "#f59e0b" },
    Rechazado: { bg: "#fee2e2", color: "#991b1b", icon: XCircle, label: "Rechazado", dot: "#ef4444" },
  };

  const ESTADO_CARNET_CFG: Record<string, { bg: string; color: string; label: string; dot: string }> = {
    Activo: { bg: "#dcfce7", color: "#15803d", label: "Activo", dot: "#22c55e" },
    Vencido: { bg: "#fee2e2", color: "#991b1b", label: "Vencido", dot: "#ef4444" },
    Anulado: { bg: "#f1f5f9", color: "#475569", label: "Anulado", dot: "#94a3b8" },
  };

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
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: tipo.bg, color: tipo.color, fontWeight: 700 }}>
                {m.tipo || "N/A"}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: solv.bg, color: solv.color, fontWeight: 700 }}>
                {solv.text}
              </span>
              {m.congelado && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }} title={m.congelado_hasta ? `Congelado hasta ${m.congelado_hasta}` : 'Congelado indefinidamente'}>
                  <Clock size={12} />
                  CONGELADO
                </span>
              )}
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
              { label: "Hectáreas", value: (m.hectareas || 0).toLocaleString("es-VE") },
              { label: "Animales", value: (m.cantidad_animales || 0).toLocaleString("es-VE") },
              { label: "Leche/día", value: m.produccion_leche_diaria > 0 ? `${m.produccion_leche_diaria.toLocaleString()}L` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl px-3 py-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(110,231,183,0.1)" }}>
                <p className="text-lg" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#4ade80" }}>{value}</p>
                <p className="text-xs" style={{ color: "#6ee7b7", opacity: 0.8 }}>{label}</p>
              </div>
            ))}
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => setActiveTab("detalles")}
              className="px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
              style={{
                borderColor: activeTab === "detalles" ? "#4ade80" : "transparent",
                color: activeTab === "detalles" ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              <UserCircle size={16} />
              Detalles Generales
            </button>
            <button
              onClick={() => setActiveTab("estado_cuenta")}
              className="px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
              style={{
                borderColor: activeTab === "estado_cuenta" ? "#4ade80" : "transparent",
                color: activeTab === "estado_cuenta" ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              <FileText size={16} />
              Estado de Cuenta
            </button>
            <button
              onClick={() => setActiveTab("carnets")}
              className="px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
              style={{
                borderColor: activeTab === "carnets" ? "#4ade80" : "transparent",
                color: activeTab === "carnets" ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              <IdCard size={16} />
              Carnets
            </button>
            <button
              onClick={() => setActiveTab("documentos")}
              className="px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
              style={{
                borderColor: activeTab === "documentos" ? "#4ade80" : "transparent",
                color: activeTab === "documentos" ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              <FileText size={16} />
              Documentos
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "detalles" ? (
            <>
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
                <InfoRow label="Último Mes Pagado" value={m.ultimo_mes ? new Date(m.ultimo_mes + "T12:00:00Z").toLocaleDateString("es-VE", { month: "long", year: "numeric" }) : "—"} />
                <InfoRow label="Carnets Disponibles" value={m.carnets_disponibles} />
                <InfoRow label="Convenio" value={m.convenio ? <span style={{ color: "#15803d", fontWeight: 700 }}>Sí</span> : "No"} />
                <InfoRow label="Cupo Gasoil" value={m.cupo_gasoil ? <span style={{ color: "#15803d", fontWeight: 700 }}>Sí</span> : "No"} />
                {m.distribuidor_diesel && <InfoRow label="Distribuidor Diesel" value={m.distribuidor_diesel} />}
              </Card>

              <Card title="Registro">
                <InfoRow label="Fecha de Ingreso" value={new Date(m.fecha_ingreso + "T12:00:00Z").toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })} />
                <InfoRow label="Tipo de Miembro" value={m.tipo} />
              </Card>

              {/* Personas */}
              <div className="rounded-3xl p-5" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                <PersonasPanel
                  miembroId={m.id}
                  personas={personas}
                  vinculaciones={vinculaciones}
                  relacionesFamiliares={relacionesFamiliares}
                  onAddPersona={onAddPersona}
                  onUpdatePersona={onUpdatePersona}
                  onDeletePersona={onDeletePersona}
                  onUpdateVinculacion={onUpdateVinculacion}
                />
              </div>
            </>
          ) : activeTab === "estado_cuenta" ? (
            <EstadoCuentaPanel 
              memberId={m.id} 
            />
          ) : activeTab === "carnets" ? (
            <div className="space-y-4">
              <Card title="Créditos de Carnets">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-green-500">{m.carnets_disponibles || 0}</div>
                  <div className="text-sm text-[rgba(255,255,255,0.6)]">Créditos Disponibles para emisión de carnets.</div>
                </div>
              </Card>
              
              {loadingCarnetsData ? (
                <div className="text-center py-8 text-sm" style={{ color: "var(--muted-foreground)" }}>Cargando historial...</div>
              ) : (
                <>
                  <Card title="Historial de Pagos (Créditos Comprados)">
                    {pagosCarnets.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No hay compras de créditos registradas.</p>
                    ) : (
                      <div className="space-y-3">
                        {pagosCarnets.map((p) => {
                          const est = ESTADO_CFG[p.estado] || ESTADO_CFG["Pendiente"];
                          const EstIcon = est.icon;
                          return (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                              <div>
                                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>${Number(p.monto || p.monto_usd || 0).toLocaleString("es-VE")} <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>({p.metodo_pago})</span></p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                  {new Date(p.fecha + "T12:00:00Z").toLocaleDateString("es-VE")} - Ref: {p.referencia || "N/A"}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold" style={{ color: "#15803d" }}>+{p.cantidad_carnets || p.creditos} créditos</span>
                                <div className="mt-1 flex justify-end">
                                  <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: est.bg, color: est.color, fontWeight: 700 }}>
                                    <EstIcon size={10} />
                                    {est.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  <Card title="Carnets Emitidos (Créditos Gastados)">
                    {carnetsEmitidos.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No se han emitido carnets para este miembro.</p>
                    ) : (
                      <div className="space-y-3">
                        {carnetsEmitidos.map((c) => {
                          const persona = getPersona(c.id_persona);
                          const est = ESTADO_CARNET_CFG[c.estado] || ESTADO_CARNET_CFG["Anulado"];
                          return (
                            <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", opacity: c.estado === "Anulado" ? 0.6 : 1 }}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                                  <CreditCard size={14} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{persona?.nombre ?? "Desconocido"}</p>
                                  <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{c.numero_carnet}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: est.bg, color: est.color, fontWeight: 700 }}>
                                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: est.dot }} />
                                  {est.label}
                                </span>
                                <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                                  Vence: {new Date(c.fecha_vencimiento + "T12:00:00Z").toLocaleDateString("es-VE")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DocumentosPanel miembroId={m.id} />
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

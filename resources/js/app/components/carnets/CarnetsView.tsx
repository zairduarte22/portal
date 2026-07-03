import { useState, useEffect } from "react";
import { Plus, CreditCard, Receipt, BookUser, Loader2 } from "lucide-react";
import { Miembro, Persona } from "../mockData";
import { ModalPago } from "./ModalPago";
import { ModalEmitir } from "./ModalEmitir";
import { TablaPagos } from "./TablaPagos";
import { TablaCarnetss } from "./TablaCarnetss";

type Tab = "pagos" | "carnets";

export function CarnetsPanel() {
  const [tab, setTab] = useState<Tab>("pagos");
  const [pagos, setPagos] = useState<any[]>([]);
  const [carnets, setCarnets] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [vinculaciones, setVinculaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initData, setInitData] = useState({ tasa_dia: 36.5, costo_carnet: 5 });

  const [showModalPago, setShowModalPago] = useState(false);
  const [showModalEmitir, setShowModalEmitir] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({
    isOpen: false, message: "", onConfirm: () => {}
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pagosRes, emisionesRes, miembrosRes, personasRes, initRes, vincRes] = await Promise.all([
        fetch('/api/pagos-carnets'),
        fetch('/api/carnets-emitidos'),
        fetch('/api/miembros'),
        fetch('/api/personas'),
        fetch('/api/pagos/init'),
        fetch('/api/vinculaciones')
      ]);

      if (pagosRes.ok) setPagos(await pagosRes.json());
      if (emisionesRes.ok) setCarnets(await emisionesRes.json());
      if (miembrosRes.ok) setMiembros(await miembrosRes.json());
      if (personasRes.ok) setPersonas(await personasRes.json());
      if (vincRes.ok) setVinculaciones(await vincRes.json());
      if (initRes.ok) {
        const initJson = await initRes.json();
        setInitData({
          tasa_dia: initJson.tasa_dia ? Number(initJson.tasa_dia) : 36.5,
          costo_carnet: initJson.costo_carnet ? Number(initJson.costo_carnet) : 5
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPago = async (p: any) => {
    try {
      await fetch('/api/pagos-carnets', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...p,
          metodo_pago: p.metodo_pago || p.metodo,
          cantidad_carnets: p.creditos,
          monto: p.monto_usd,
          tasa_cambio: p.tasa,
          precio_unitario: p.monto_usd / p.creditos,
          estado: p.estado || "Pendiente"
        })
      });
      setShowModalPago(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAprobar = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      message: "¿Seguro que deseas aprobar este pago? Se sumarán los créditos al miembro.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/pagos-carnets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "Aprobado" })
          });
          if (res.ok) fetchData();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleEmitir = async (carnetsArray: any[]) => {
    try {
      for (const c of carnetsArray) {
        const res = await fetch('/api/carnets-emitidos', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c)
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Error al emitir carnet");
          return;
        }
      }
      setShowModalEmitir(false);
      fetchData(); // reload
    } catch (e) {
      console.error(e);
      alert("Error de red");
    }
  };

  const handleAnular = (id: string | number) => {
    setConfirmDialog({
      isOpen: true,
      message: "¿Anular este carnet? Se devolverá 1 crédito al miembro.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/carnets-emitidos/${id}`, { method: "DELETE" });
          if (res.ok) fetchData();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const pendientesCount = pagos.filter((p) => p.estado === "Pendiente").length;
  const activosCount = carnets.filter((c) => c.estado === "Activo").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 4px 14px rgba(22,163,74,0.4)" }}
            >
              <BookUser size={18} color="#fff" />
            </div>
            <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "var(--foreground)" }}>
              Gestión de Carnets
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)", paddingLeft: "3.25rem" }}>
            Registra pagos de créditos y emite carnets para los miembros
          </p>
        </div>

        {/* Primary actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setShowModalPago(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              fontWeight: 700,
              boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
              transition: "all 0.15s ease",
            }}
          >
            <Plus size={16} />
            Registrar Pago
            {pendientesCount > 0 && (
              <span className="ml-1 min-w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "rgba(255,255,255,0.3)", fontWeight: 800 }}>
                {pendientesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowModalEmitir(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              color: "#fff",
              fontWeight: 700,
              boxShadow: "0 4px 14px rgba(109,40,217,0.4)",
              transition: "all 0.15s ease",
            }}
          >
            <CreditCard size={16} />
            Emitir Carnet
          </button>
        </div>
      </div>

      {/* Segmented control */}
      <div
        className="inline-flex p-1 rounded-2xl"
        style={{ backgroundColor: "white", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {([
          { id: "pagos", label: "Pagos de Créditos", icon: Receipt, badge: pendientesCount },
          { id: "carnets", label: "Carnets Emitidos", icon: CreditCard, badge: activosCount },
        ] as { id: Tab; label: string; icon: React.ElementType; badge: number }[]).map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all duration-200"
            style={{
              background: tab === id
                ? id === "pagos"
                  ? "linear-gradient(135deg,#22c55e,#16a34a)"
                  : "linear-gradient(135deg,#8b5cf6,#6d28d9)"
                : "transparent",
              color: tab === id ? "#fff" : "var(--muted-foreground)",
              fontWeight: tab === id ? 700 : 500,
              boxShadow: tab === id ? (id === "pagos" ? "0 2px 10px rgba(22,163,74,0.35)" : "0 2px 10px rgba(109,40,217,0.35)") : "none",
            }}
          >
            <Icon size={15} />
            {label}
            {badge > 0 && (
              <span
                className="min-w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: tab === id ? "rgba(255,255,255,0.25)" : "var(--secondary)",
                  color: tab === id ? "#fff" : "var(--secondary-foreground)",
                  fontWeight: 800,
                  padding: "0 6px",
                }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]"/></div>
      ) : tab === "pagos" ? (
        <TablaPagos pagos={pagos} miembros={miembros} onAprobar={handleAprobar} />
      ) : (
        <TablaCarnetss carnets={carnets} miembros={miembros} personas={personas} onAnular={handleAnular as any} />
      )}

      {/* Modals */}
      {showModalPago && (
        <ModalPago miembros={miembros} initData={initData} onClose={() => setShowModalPago(false)} onSave={handleAddPago} />
      )}
      {showModalEmitir && (
        <ModalEmitir miembros={miembros} personas={personas} vinculaciones={vinculaciones} carnets={carnets} onClose={() => setShowModalEmitir(false)} onSave={handleEmitir} />
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDialog(c => ({ ...c, isOpen: false }))}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" style={{ border: "1px solid var(--border)" }}>
            <div className="mb-6">
              <h3 className="text-lg font-bold" style={{ fontFamily: "Nunito, sans-serif" }}>Confirmación</h3>
              <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>{confirmDialog.message}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(c => ({ ...c, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-slate-200"
                style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(c => ({ ...c, isOpen: false }));
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", boxShadow: "0 2px 8px rgba(22,163,74,0.35)" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

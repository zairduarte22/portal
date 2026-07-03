import { useState } from "react";
import "../styles/fonts.css";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { MembersList } from "./components/MembersList";
import { Reports } from "./components/Reports";
import { miembros as initialMembers, personas as initialPersonas, vinculaciones as initialVincs, Miembro, Persona, Vinculacion } from "./components/mockData";
import { Menu, Settings } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [members, setMembers] = useState<Miembro[]>(initialMembers);
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [vinculaciones, setVinculaciones] = useState<Vinculacion[]>(initialVincs);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAdd = (m: Miembro) => setMembers((prev) => [...prev, m]);
  const handleUpdate = (m: Miembro) => setMembers((prev) => prev.map((x) => (x.id === m.id ? m : x)));
  const handleDelete = (id: number) => setMembers((prev) => prev.filter((x) => x.id !== id));

  const handleAddPersona = (p: Persona) => setPersonas((prev) => [...prev, p]);
  const handleUpdatePersona = (p: Persona) => setPersonas((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const handleDeletePersona = (id: number) => {
    setPersonas((prev) => prev.filter((x) => x.id !== id));
    setVinculaciones((prev) => prev.filter((v) => v.id_persona !== id));
  };
  const handleUpdateVinculacion = (v: Vinculacion) => {
    setVinculaciones((prev) => {
      const exists = prev.some((x) => x.id_persona === v.id_persona && x.id_miembro === v.id_miembro);
      if (exists) return prev.map((x) => (x.id_persona === v.id_persona && x.id_miembro === v.id_miembro ? v : x));
      return [...prev, v];
    });
  };

  const viewLabel: Record<string, string> = {
    dashboard: "Dashboard",
    members: "Miembros",
    reports: "Reportes",
    settings: "Configuración",
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:block transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          activeView={activeView}
          onNavigate={(v) => { setActiveView(v); setSidebarOpen(false); }}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 px-6 py-3.5 flex items-center gap-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
          }}
        >
          <button
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--muted)" }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>

          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl"
              style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
                <span style={{ fontSize: "0.6rem", color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}>AD</span>
              </div>
              <span className="text-xs" style={{ color: "var(--secondary-foreground)", fontWeight: 600 }}>Administrador</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "members" && (
            <MembersList
              members={members}
              personas={personas}
              vinculaciones={vinculaciones}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddPersona={handleAddPersona}
              onUpdatePersona={handleUpdatePersona}
              onDeletePersona={handleDeletePersona}
              onUpdateVinculacion={handleUpdateVinculacion}
            />
          )}
          {activeView === "reports" && <Reports />}
          {activeView === "settings" && (
            <div className="space-y-5">
              <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
                Configuración
              </h1>
              <div
                className="rounded-3xl p-12 flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <div className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)" }}>
                  <Settings size={24} style={{ color: "#15803d" }} />
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>
                  Módulo de configuración en desarrollo
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

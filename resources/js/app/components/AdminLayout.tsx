import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

export function AdminLayout({ currentUser, onLogout }: { currentUser?: any, onLogout?: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST', headers: { 'Accept': 'application/json' } })
      .then(() => {
        if (onLogout) onLogout();
      });
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
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
          currentUser={currentUser}
          onLogout={handleLogout}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 px-6 py-3.5 flex items-center gap-4 flex-shrink-0"
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

          <div className="flex items-center gap-3 relative">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
              style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
                <span style={{ fontSize: "0.6rem", color: "#fff", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}>
                  {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'AD'}
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--secondary-foreground)", fontWeight: 600 }}>
                {currentUser?.name || 'Administrador'}
              </span>
            </div>
            
            {menuOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border rounded-xl shadow-lg w-48 overflow-hidden z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
           <Outlet />
        </main>
      </div>
    </div>
  );
}

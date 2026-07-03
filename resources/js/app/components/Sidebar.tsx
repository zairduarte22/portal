import { LayoutDashboard, Users, BarChart3, Settings, Leaf, ChevronRight, Wallet, IdCard, BookOpen, Landmark } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "miembros", label: "Miembros", icon: Users },
  { id: "personas", label: "Personas", icon: Users },
  { id: "pagos", label: "Pago de Cuotas", icon: Wallet },
  { id: "carnets", label: "Gestión de Carnets", icon: IdCard },
  { id: "libros", label: "Libros Contables", icon: BookOpen },
  { id: "obligaciones", label: "Obligaciones", icon: Landmark },
  { id: "conciliacion", label: "Conciliación", icon: Landmark },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar({ onCloseMobile }: SidebarProps) {
  return (
    <aside
      className="w-64 h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: "var(--sidebar)" }}
    >
      {/* Decorative gradient orbs */}
      <div
        className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #22c55e, transparent)" }}
      />
      <div
        className="absolute bottom-32 -right-12 w-36 h-36 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #4ade80, transparent)" }}
      />

      {/* Logo */}
      <div className="relative px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
            }}
          >
            <Leaf size={18} color="#052e16" strokeWidth={2.5} />
          </div>
          <div>
            <p
              className="text-sm"
              style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#d1fae5" }}
            >
              SIGAMA
            </p>
            <p className="text-[9px]" style={{ color: "#6ee7b7", opacity: 0.8, lineHeight: 1.1 }}>
              Sistema de Gestión Administrativa<br />y Membresías de Agroproductores
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px mb-5" style={{ background: "var(--sidebar-border)" }} />

      {/* Label */}
      <p className="px-5 mb-2 text-xs uppercase tracking-widest" style={{ color: "#6ee7b7", opacity: 0.5, fontWeight: 700 }}>
        Navegación
      </p>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <NavLink
            key={id}
            to={`/admin/${id}`}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-left group`
            }
            style={({ isActive }) => ({
              background: isActive
                ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.12))"
                : "transparent",
              border: isActive ? "1px solid rgba(34,197,94,0.25)" : "1px solid transparent",
              color: isActive ? "#4ade80" : "#6ee7b7",
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? "rgba(34,197,94,0.2)" : "transparent",
                  }}
                >
                  <Icon size={16} />
                </div>
                <span
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.875rem",
                    color: isActive ? "#4ade80" : "#a7f3d0",
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <ChevronRight size={13} style={{ marginLeft: "auto", color: "#4ade80" }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom card */}
      <div className="px-4 pb-6 mt-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.07))",
            border: "1px solid rgba(110,231,183,0.12)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
            <p style={{ color: "#6ee7b7", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sistema Activo
            </p>
          </div>
          <p style={{ color: "#a7f3d0", fontSize: "0.75rem", opacity: 0.7 }}>
            Fondo UGAVI · v2.1.0
          </p>
        </div>
      </div>
    </aside>
  );
}

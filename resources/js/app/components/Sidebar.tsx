import React, { useState, useEffect } from "react";
import { LayoutDashboard, Users, BarChart3, Settings, Leaf, ChevronRight, ChevronDown, Wallet, IdCard, BookOpen, Landmark, Store, Package, MessageCircle, CreditCard, ShoppingBag, Receipt, Users2, ChevronLeft, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarProps {
  onCloseMobile?: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  moduleId: string;
  subItems?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroupsTemplate: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, moduleId: "Dashboard" },
    ]
  },
  {
    title: "Membresías",
    items: [
      { id: "miembros", label: "Miembros", icon: Users, moduleId: "MembersList" },
      { id: "personas", label: "Personas", icon: Users, moduleId: "PersonasList" },
      { id: "carnets", label: "Carnets", icon: IdCard, moduleId: "CarnetsPanel" },
      { id: "whatsapp-logs", label: "Historial WhatsApp", icon: MessageCircle, moduleId: "MembersList" },
    ]
  },
  // "Tiendas" will be injected dynamically here
  {
    title: "Administración",
    items: [
      { id: "pagos", label: "Cuotas y Pagos", icon: Wallet, moduleId: "PagosPanel" },
      { id: "obligaciones", label: "Obligaciones", icon: Landmark, moduleId: "ObligacionesPanel" },
      { id: "conciliacion", label: "Conciliación Bancaria", icon: Landmark, moduleId: "ConciliacionPanel" },
      { id: "libros", label: "Libros Contables", icon: BookOpen, moduleId: "LibrosPanel" },
    ]
  },
  {
    title: "Sistema",
    items: [
      { id: "reportes", label: "Reportes Generales", icon: BarChart3, moduleId: "Reports" },
      { id: "configuraciones", label: "Configuración", icon: Settings, moduleId: "ConfiguracionesPanel" },
    ]
  }
];

export function Sidebar({ onCloseMobile, currentUser, onLogout }: SidebarProps) {
  const userModules = currentUser?.modules ? JSON.parse(currentUser.modules) : [];
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tiendas, setTiendas] = useState<any[]>([]);

  const fetchTiendas = () => {
    fetch('/api/configuraciones/tiendas')
      .then(res => res.json())
      .then(data => {
        // Solo tiendas activas
        setTiendas(data.filter((t: any) => t.activa));
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchTiendas();
    window.addEventListener('tiendas-updated', fetchTiendas);
    return () => window.removeEventListener('tiendas-updated', fetchTiendas);
  }, []);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasAccess = (moduleId: string) => {
    if (currentUser?.is_master) return true;
    return userModules.includes(moduleId);
  };

  const hasAnyTiendaAccess = () => {
    if (currentUser?.is_master) return true;
    // Comprobar si tiene acceso a al menos un submódulo de tienda (usamos los viejos IDs para compatibilidad)
    return ["UgaviBarVentas", "UgaviBarCreditos", "UgaviBarCatalogo", "UgaviBarInventario", "UgaviBarGastos", "UgaviBarCompras", "UgaviBarClientes", "UgaviBarReportes"].some(m => userModules.includes(m));
  };

  let navGroups = [...navGroupsTemplate];
  
  if (hasAnyTiendaAccess() && tiendas.length > 0) {
    const tiendasItems = tiendas.map(t => ({
      id: `tienda/${t.slug}`,
      label: t.nombre,
      icon: Store,
      moduleId: "TiendasAccess" // Dummy id, ya verificamos acceso global arriba
    }));

    navGroups.splice(2, 0, {
      title: "Tiendas",
      items: tiendasItems
    });
  }

  const filteredGroups = navGroups.map(group => {
    const items = group.items.map(item => {
      if (item.subItems) {
        const filteredSub = item.subItems.filter(sub => hasAccess(sub.moduleId));
        if (filteredSub.length > 0) return { ...item, subItems: filteredSub };
        return null;
      }
      return (item.moduleId === "TiendasAccess" || hasAccess(item.moduleId)) ? item : null;
    }).filter(Boolean) as NavItem[];

    return { ...group, items };
  }).filter(group => group.items.length > 0);

  const sidebarWidth = isCollapsed ? "w-20" : "w-64";

  return (
    <aside
      className={`${sidebarWidth} h-screen flex flex-col relative flex-shrink-0 transition-all duration-300 group/sidebar`}
      style={{ backgroundColor: "var(--sidebar)" }}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #22c55e, transparent)" }}
        />
        <div
          className="absolute bottom-32 -right-12 w-36 h-36 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4ade80, transparent)" }}
        />
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-8 -right-3 z-50 bg-[#16a34a] text-white p-1 rounded-full shadow-md hidden lg:flex items-center justify-center border-2 border-white hover:scale-110 transition-transform opacity-0 group-hover/sidebar:opacity-100"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={`relative pt-7 pb-6 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-4' : 'px-5'}`}>
        <div className="flex items-center gap-3">
          <div
            className={`rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'}`}
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
            }}
          >
            <Leaf size={isCollapsed ? 24 : 18} color="#052e16" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap overflow-hidden opacity-100 transition-opacity duration-300">
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
          )}
        </div>
      </div>

      <div className="mx-4 h-px mb-2 flex-shrink-0" style={{ background: "var(--sidebar-border)" }} />

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <nav className={`pb-6 pt-2 ${isCollapsed ? 'px-2 space-y-4' : 'px-3 space-y-6'}`}>
          {filteredGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: "#6ee7b7", opacity: 0.6, fontWeight: 700 }}>
                  {group.title}
                </p>
              )}
              {isCollapsed && (
                <div className="w-full border-t border-[#6ee7b7]/10 my-2" />
              )}
              {group.items.map((item) => {
                if (item.subItems) {
                  const isExpanded = expandedMenus[item.id];
                  const hasActiveChild = item.subItems.some(sub => location.pathname === `/gestion/${sub.id}`);
                  return (
                    <div key={item.id} className="relative group/menu">
                      <button
                        onClick={() => !isCollapsed && toggleMenu(item.id)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'} rounded-2xl transition-all duration-200 text-left`}
                        style={{
                          background: hasActiveChild && !isExpanded
                            ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.05))"
                            : "transparent",
                          color: hasActiveChild ? "#4ade80" : "#6ee7b7",
                        }}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: hasActiveChild ? "rgba(34,197,94,0.15)" : "transparent",
                          }}
                        >
                          <item.icon size={isCollapsed ? 20 : 16} />
                        </div>
                        {!isCollapsed && (
                          <>
                            <span
                              style={{
                                fontFamily: "Nunito, sans-serif",
                                fontWeight: hasActiveChild ? 700 : 500,
                                fontSize: "0.875rem",
                                color: hasActiveChild ? "#4ade80" : "#a7f3d0",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {item.label}
                            </span>
                            {isExpanded ? (
                              <ChevronDown size={13} style={{ marginLeft: "auto", color: hasActiveChild ? "#4ade80" : "#6ee7b7" }} />
                            ) : (
                              <ChevronRight size={13} style={{ marginLeft: "auto", color: hasActiveChild ? "#4ade80" : "#6ee7b7" }} />
                            )}
                          </>
                        )}
                      </button>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="mt-1 ml-4 pl-4 border-l border-[#6ee7b7]/20 space-y-1">
                          {item.subItems.map((sub) => (
                            <NavLink
                              key={sub.id}
                              to={`/gestion/${sub.id}`}
                              onClick={onCloseMobile}
                              className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left`
                              }
                              style={({ isActive }) => ({
                                background: isActive
                                  ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.12))"
                                  : "transparent",
                                color: isActive ? "#4ade80" : "#a7f3d0",
                              })}
                            >
                              {({ isActive }) => (
                                <span
                                  style={{
                                    fontFamily: "Nunito, sans-serif",
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: "0.8125rem",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {sub.label}
                                </span>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Normal Link
                // Check active state taking into account nested paths for Tiendas
                const isActive = location.pathname.startsWith(`/gestion/${item.id}`);

                return (
                  <NavLink
                    key={item.id}
                    to={`/gestion/${item.id}`}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'} rounded-2xl transition-all duration-200 text-left group/link`}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.12))"
                        : "transparent",
                      border: isActive ? "1px solid rgba(34,197,94,0.25)" : "1px solid transparent",
                      color: isActive ? "#4ade80" : "#6ee7b7",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isActive ? "rgba(34,197,94,0.2)" : "transparent",
                      }}
                    >
                      <item.icon size={isCollapsed ? 20 : 16} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span
                          style={{
                            fontFamily: "Nunito, sans-serif",
                            fontWeight: isActive ? 700 : 500,
                            fontSize: "0.875rem",
                            color: isActive ? "#4ade80" : "#a7f3d0",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronRight size={13} style={{ marginLeft: "auto", color: "#4ade80" }} />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

    </aside>
  );
}

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "../styles/fonts.css";
import { AdminLayout } from "./components/AdminLayout";
import { Dashboard } from "./components/Dashboard";
import { MembersList } from "./components/MembersList";
import { PersonasList } from "./components/PersonasList";
import { Reports } from "./components/Reports";
import { PagosPanel } from "./components/PagosPanel";
import { CarnetsPanel } from "./components/carnets/CarnetsView";
import { LibrosPanel } from "./components/LibrosPanel";
import { ConciliacionPanel } from "./components/ConciliacionPanel";
import { ObligacionesPanel } from "./components/ObligacionesPanel";
import { VentasTascaPanel } from "./components/tasca/VentasTascaPanel";
import { VentaPos } from "./components/tasca/VentaPos";
import { GestionTascaPanel } from "./components/tasca/GestionTascaPanel";
import { ReportesTascaPanel } from "./components/tasca/ReportesTascaPanel";
import { Miembro, Persona, Vinculacion, RelacionFamiliar } from "./components/mockData";
import { Settings } from "lucide-react";
import { Login } from "./components/Login";
import { ConfiguracionesPanel } from "./components/ConfiguracionesPanel";
import { CarnetPublico } from "./components/public/CarnetPublico";
import { MenuPublico } from "./components/public/MenuPublico";
// Placeholder for Public Portal
function PublicPortal() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-xl" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: "1.5rem", fontFamily: "Nunito, sans-serif" }}>AG</span>
      </div>
      <h1 className="text-3xl mb-3" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900 }}>
        Bienvenido a SIGAMA
      </h1>
      <p className="max-w-md mx-auto mb-8" style={{ color: "var(--muted-foreground)" }}>
        Sistema de Gestión Administrativa y Membresías de Agroproductores. El portal público para clientes y miembros estará disponible pronto.
      </p>
      <a
        href="/gestion/dashboard"
        className="px-6 py-3 rounded-2xl text-sm font-bold transition-transform hover:scale-105"
        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 4px 14px rgba(34,197,94,0.4)" }}
      >
        Ir al Panel Administrativo
      </a>
    </div>
  );
}

const ProtectedRoute = ({ children, moduleId, user }: { children: React.ReactNode, moduleId: string, user: any }) => {
  if (user?.is_master) return <>{children}</>;
  // Everyone has access to the Dashboard by default
  if (moduleId === 'Dashboard') return <>{children}</>;
  
  const userModules = user?.modules ? JSON.parse(user.modules) : [];
  if (!userModules.includes(moduleId)) {
    return <Navigate to="/gestion/dashboard" replace />;
  }
  return <>{children}</>;
};
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<Miembro[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [vinculaciones, setVinculaciones] = useState<Vinculacion[]>([]);
  const [relacionesFamiliares, setRelacionesFamiliares] = useState<RelacionFamiliar[]>([]);

  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error("No auth");
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;

    fetch('/api/miembros')
      .then(res => res.json())
      .then(data => setMembers(data));
      
    fetch('/api/personas')
      .then(res => res.json())
      .then(data => setPersonas(data));

    fetch('/api/vinculaciones')
      .then(res => res.json())
      .then(data => setVinculaciones(data));

    fetch('/api/relaciones-familiares')
      .then(res => res.json())
      .then(data => setRelacionesFamiliares(data));
  }, [user]);

  const handleAdd = (m: Miembro) => {
    fetch('/api/miembros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m)
    }).then(res => res.json()).then(data => {
        setMembers((prev) => [...prev, data]);
    });
  };
  const handleUpdate = (m: Miembro) => {
    fetch(`/api/miembros/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m)
    }).then(() => {
        setMembers((prev) => prev.map((x) => (x.id === m.id ? m : x)));
    });
  };
  const handleDelete = (id: number) => {
    fetch(`/api/miembros/${id}`, { method: 'DELETE' }).then(() => {
        setMembers((prev) => prev.filter((x) => x.id !== id));
    });
  };

  const handleAddPersona = (p: Persona, v?: Vinculacion) => {
    fetch(`/api/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
    }).then(async res => {
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert("Error al crear persona: " + (err.message || "Error desconocido"));
            throw new Error("API Error");
        }
        return res.json();
    }).then(data => {
        setPersonas((prev) => [...prev, data]);
        if (v) {
            handleUpdateVinculacion({ ...v, id_persona: data.id });
        }
    }).catch(console.error);
  };
  const handleUpdatePersona = (p: Persona) => {
    fetch(`/api/personas/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
    }).then(async res => {
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert("Error al actualizar persona: " + (err.message || "Puede que la cédula ya exista"));
            throw new Error("API Error");
        }
        setPersonas((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    }).catch(console.error);
  };
  const handleDeletePersona = (id: number) => {
    fetch(`/api/personas/${id}`, { method: 'DELETE' }).then(async res => {
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert("Error al eliminar persona: " + (err.message || "Es posible que tenga carnets, pagos o vinculaciones asociadas que impiden su eliminación."));
            throw new Error("API Error");
        }
        setPersonas((prev) => prev.filter((x) => x.id !== id));
        // Also cleanup local state for vinculaciones
        setVinculaciones((prev) => prev.filter((x) => x.id_persona !== id));
    }).catch(console.error);
  };
  const handleUpdateVinculacion = (v: Vinculacion) => {
    fetch('/api/vinculaciones', {
        method: 'POST', // Backend handles upsert
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v)
    }).then(() => {
        setVinculaciones((prev) => {
          const exists = prev.some((x) => x.id_persona === v.id_persona && x.id_miembro === v.id_miembro);
          if (exists) return prev.map((x) => (x.id_persona === v.id_persona && x.id_miembro === v.id_miembro ? v : x));
          return [...prev, v];
        });
        // Refetch relaciones familiares in case parentesco changed
        fetch('/api/relaciones-familiares')
          .then(res => res.json())
          .then(data => setRelacionesFamiliares(data));
    });
  };

  const handleDeleteVinculacion = (id_miembro: number, id_persona: number) => {
    fetch('/api/vinculaciones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_miembro, id_persona })
    }).then(() => {
        setVinculaciones((prev) => prev.filter(v => !(v.id_miembro === id_miembro && v.id_persona === id_persona)));
    });
  };

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/c/:id" element={<CarnetPublico />} />
          <Route path="/menu" element={<MenuPublico />} />
          <Route path="/personal/login" element={<Login onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/personal/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/c/:id" element={<CarnetPublico />} />
        <Route path="/menu" element={<MenuPublico />} />
        <Route path="/" element={<Navigate to={user.default_route ? `/gestion/${user.default_route}` : "/gestion/dashboard"} replace />} />
        
        <Route path="/gestion" element={<AdminLayout currentUser={user} onLogout={() => setUser(null)} />}>
          <Route path="dashboard" element={<ProtectedRoute moduleId="Dashboard" user={user}><Dashboard /></ProtectedRoute>} />
          <Route path="miembros" element={
            <ProtectedRoute moduleId="MembersList" user={user}>
              <MembersList
              members={members}
              personas={personas}
              vinculaciones={vinculaciones}
              relacionesFamiliares={relacionesFamiliares}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddPersona={handleAddPersona}
              onUpdatePersona={handleUpdatePersona}
              onDeletePersona={handleDeletePersona}
              onUpdateVinculacion={handleUpdateVinculacion}
              />
            </ProtectedRoute>
          } />
          <Route path="personas" element={
            <ProtectedRoute moduleId="PersonasList" user={user}>
              <PersonasList
                personas={personas}
                members={members}
                vinculaciones={vinculaciones}
                relacionesFamiliares={relacionesFamiliares}
                onAddPersona={handleAddPersona}
                onUpdatePersona={handleUpdatePersona}
                onUpdateVinculacion={handleUpdateVinculacion}
                onDeleteVinculacion={handleDeleteVinculacion}
                onDeletePersona={handleDeletePersona}
              />
            </ProtectedRoute>
          } />
          <Route path="pagos" element={<ProtectedRoute moduleId="PagosPanel" user={user}><PagosPanel /></ProtectedRoute>} />
          <Route path="carnets" element={<ProtectedRoute moduleId="CarnetsPanel" user={user}><CarnetsPanel /></ProtectedRoute>} />
          <Route path="libros" element={<ProtectedRoute moduleId="LibrosPanel" user={user}><LibrosPanel /></ProtectedRoute>} />
          <Route path="obligaciones" element={<ProtectedRoute moduleId="ObligacionesPanel" user={user}><ObligacionesPanel /></ProtectedRoute>} />
          <Route path="conciliacion" element={<ProtectedRoute moduleId="ConciliacionPanel" user={user}><ConciliacionPanel /></ProtectedRoute>} />
          <Route path="ventas-tasca" element={<ProtectedRoute moduleId="VentasTascaPanel" user={user}><VentasTascaPanel /></ProtectedRoute>} />
          <Route path="ventas-tasca/:id" element={<ProtectedRoute moduleId="VentasTascaPanel" user={user}><VentaPos /></ProtectedRoute>} />
          <Route path="tasca/gestion" element={<ProtectedRoute moduleId="GestionTascaPanel" user={user}><GestionTascaPanel /></ProtectedRoute>} />
          <Route path="tasca/reportes" element={<ProtectedRoute moduleId="ReportesTascaPanel" user={user}><ReportesTascaPanel /></ProtectedRoute>} />
          <Route path="configuraciones" element={<ProtectedRoute moduleId="ConfiguracionesPanel" user={user}><ConfiguracionesPanel currentUser={user} /></ProtectedRoute>} />
          <Route path="reportes" element={<ProtectedRoute moduleId="Reports" user={user}><Reports members={members} personas={personas} /></ProtectedRoute>} />
          <Route path="" element={<Navigate to={user.default_route ? `/gestion/${user.default_route}` : "/gestion/dashboard"} replace />} />
        </Route>
        <Route path="*" element={<Navigate to={user.default_route ? `/gestion/${user.default_route}` : "/gestion/dashboard"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

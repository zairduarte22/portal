import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { Miembro, Persona, Vinculacion, RelacionFamiliar } from "./components/mockData";
import { Settings } from "lucide-react";

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
        href="/admin/dashboard"
        className="px-6 py-3 rounded-2xl text-sm font-bold transition-transform hover:scale-105"
        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 4px 14px rgba(34,197,94,0.4)" }}
      >
        Ir al Panel Administrativo
      </a>
    </div>
  );
}

export default function App() {
  const [members, setMembers] = useState<Miembro[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [vinculaciones, setVinculaciones] = useState<Vinculacion[]>([]);
  const [relacionesFamiliares, setRelacionesFamiliares] = useState<RelacionFamiliar[]>([]);

  useEffect(() => {
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
  }, []);

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

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portal */}
        <Route path="/" element={<PublicPortal />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="miembros" element={
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
          } />
          <Route path="personas" element={
              <PersonasList
                members={members}
                personas={personas}
                vinculaciones={vinculaciones}
                relacionesFamiliares={relacionesFamiliares}
                onAddPersona={handleAddPersona}
                onUpdatePersona={handleUpdatePersona}
                onUpdateVinculacion={handleUpdateVinculacion}
                onDeleteVinculacion={handleDeleteVinculacion}
                onDeletePersona={handleDeletePersona}
              />
            } />
          <Route path="pagos" element={<PagosPanel />} />
          <Route path="carnets" element={<CarnetsPanel />} />
          <Route path="libros" element={<LibrosPanel />} />
          <Route path="obligaciones" element={<ObligacionesPanel />} />
          <Route path="conciliacion" element={<ConciliacionPanel />} />
          <Route path="reportes" element={<Reports members={members} personas={personas} />} />
          <Route path="configuracion" element={
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
          } />
          <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

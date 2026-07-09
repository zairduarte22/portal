import { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Key, LayoutGrid } from "lucide-react";

export function ConfiguracionesPanel({ currentUser }: { currentUser: any }) {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const modulosDisponibles = [
    { id: 'Dashboard', nombre: 'Dashboard', route: 'dashboard' },
    { id: 'MembersList', nombre: 'Miembros', route: 'miembros' },
    { id: 'PersonasList', nombre: 'Personas', route: 'personas' },
    { id: 'Reports', nombre: 'Reportes', route: 'reportes' },
    { id: 'PagosPanel', nombre: 'Pagos y Recibos', route: 'pagos' },
    { id: 'CarnetsPanel', nombre: 'Carnets', route: 'carnets' },
    { id: 'LibrosPanel', nombre: 'Libros', route: 'libros' },
    { id: 'ConciliacionPanel', nombre: 'Conciliación', route: 'conciliacion' },
    { id: 'ObligacionesPanel', nombre: 'Obligaciones', route: 'obligaciones' },
    { id: 'VentasTascaPanel', nombre: 'Punto de Venta (Tasca)', route: 'ventas-tasca' },
    { id: 'GestionTascaPanel', nombre: 'Gestión de Tasca', route: 'tasca/gestion' },
    { id: 'ConfiguracionesPanel', nombre: 'Configuraciones', route: 'configuraciones' },
  ];

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    modules: [] as string[],
    default_route: ""
  });

  const loadUsuarios = () => {
    fetch('/api/usuarios')
      .then(res => res.json())
      .then(setUsuarios)
      .catch(console.error);
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const openNew = () => {
    setEditUser(null);
    setForm({ name: "", username: "", password: "", modules: [], default_route: "" });
    setShowModal(true);
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setForm({
      name: user.name,
      username: user.username,
      password: "",
      modules: user.modules ? JSON.parse(user.modules) : [],
      default_route: user.default_route || ""
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editUser ? `/api/usuarios/${editUser.id}` : '/api/usuarios';
    const method = editUser ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || 'Error al guardar usuario');
      }
      setShowModal(false);
      loadUsuarios();
    })
    .catch(err => alert(err.message));
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al eliminar');
        }
        loadUsuarios();
      })
      .catch(err => alert(err.message));
  };

  const toggleModule = (modId: string) => {
    if (form.modules.includes(modId)) {
      setForm({ ...form, modules: form.modules.filter(m => m !== modId) });
    } else {
      setForm({ ...form, modules: [...form.modules, modId] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800" style={{ fontFamily: "Nunito, sans-serif" }}>Configuraciones del Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">Administración de usuarios y roles de acceso</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-700">Usuarios Activos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuarios.map(u => (
            <div key={u.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{u.name}</h3>
                    <p className="text-xs text-gray-500">@{u.username}</p>
                  </div>
                </div>
                {!u.is_master && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                {u.is_master ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    <Key size={12} />
                    Acceso Total (Master)
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {(u.modules ? JSON.parse(u.modules) : []).map((m: string) => (
                      <span key={m} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-200 text-gray-700">
                        {modulosDisponibles.find(mod => mod.id === m)?.nombre || m}
                      </span>
                    ))}
                    {(!u.modules || JSON.parse(u.modules).length === 0) && (
                      <span className="text-xs text-red-500 font-bold">Sin módulos asignados</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <Trash2 size={16} className="text-transparent" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Nombre Completo</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full p-2.5 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Usuario</label>
                  <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required className="w-full p-2.5 border rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Contraseña {editUser && <span className="text-gray-400 font-normal">(Dejar en blanco para no cambiar)</span>}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!editUser} minLength={4} className="w-full p-2.5 border rounded-xl" />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid size={18} className="text-blue-500" />
                  <h3 className="font-bold text-gray-700">Módulos Permitidos</h3>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">Módulo/Pantalla por Defecto al Iniciar Sesión</label>
                  <select 
                    value={form.default_route} 
                    onChange={e => setForm({...form, default_route: e.target.value})}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="">-- Seleccionar (Por defecto Dashboard) --</option>
                    {modulosDisponibles.filter(m => form.modules.includes(m.id)).map(mod => (
                      <option key={mod.id} value={mod.route}>{mod.nombre}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">El usuario será redirigido a esta pantalla automáticamente al entrar.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {modulosDisponibles.map(mod => (
                    <label key={mod.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.modules.includes(mod.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={form.modules.includes(mod.id)}
                        onChange={() => toggleModule(mod.id)}
                      />
                      <span className="text-sm font-bold text-gray-700">{mod.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

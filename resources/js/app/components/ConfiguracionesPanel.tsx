import { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Key, LayoutGrid, Settings, Save, Loader2, Landmark, Store } from "lucide-react";
import { BancosConfigPanel } from './BancosConfigPanel';
import { TiendasConfigPanel } from './TiendasConfigPanel';

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
    { id: 'UgaviBarVentas', nombre: 'Ventas (POS)', route: 'ugavibar/ventas' },
    { id: 'UgaviBarCreditos', nombre: 'Créditos UGAVI', route: 'ugavibar/creditos' },
    { id: 'UgaviBarCatalogo', nombre: 'Catálogo UGAVI', route: 'ugavibar/catalogo' },
    { id: 'UgaviBarInventario', nombre: 'Inventario UGAVI', route: 'ugavibar/inventario' },
    { id: 'UgaviBarGastos', nombre: 'Gastos UGAVI', route: 'ugavibar/gastos' },
    { id: 'UgaviBarCompras', nombre: 'Compras UGAVI', route: 'ugavibar/compras' },
    { id: 'UgaviBarClientes', nombre: 'Clientes UGAVI', route: 'ugavibar/clientes' },
    { id: 'UgaviBarReportes', nombre: 'Reportes UGAVI', route: 'ugavibar/reportes' },
    { id: 'ConfiguracionesPanel', nombre: 'Configuraciones', route: 'configuraciones' },
  ];

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    modules: [] as string[],
    default_route: ""
  });

  const [activeTab, setActiveTab] = useState<'usuarios' | 'parametros'>('usuarios');
  const [generalConfigs, setGeneralConfigs] = useState({
    firma_secretario_nombre: '',
    firma_secretario_cedula: '',
    firma_admin_nombre: '',
    firma_admin_cedula: ''
  });
  const [savingConfigs, setSavingConfigs] = useState(false);

  const loadGeneralConfigs = () => {
    fetch('/api/configuraciones/general')
      .then(res => res.json())
      .then(data => {
        if(data) {
          setGeneralConfigs({
            firma_secretario_nombre: data.firma_secretario_nombre || '',
            firma_secretario_cedula: data.firma_secretario_cedula || '',
            firma_admin_nombre: data.firma_admin_nombre || '',
            firma_admin_cedula: data.firma_admin_cedula || ''
          });
        }
      });
  };

  const handleSaveConfigs = () => {
    setSavingConfigs(true);
    fetch('/api/configuraciones/general', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(generalConfigs)
    })
    .then(res => res.json())
    .then(() => {
      alert('Configuraciones guardadas exitosamente');
    })
    .finally(() => setSavingConfigs(false));
  };

  const loadUsuarios = () => {
    fetch('/api/usuarios')
      .then(res => res.json())
      .then(setUsuarios)
      .catch(console.error);
  };

  useEffect(() => {
    loadUsuarios();
    loadGeneralConfigs();
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

  const handleDelete = (id: number) => {
    if (confirm("¿Eliminar usuario?")) {
      fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
        .then(() => loadUsuarios());
    }
  };

  const saveUser = () => {
    const url = editUser ? `/api/usuarios/${editUser.id}` : '/api/usuarios';
    const method = editUser ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(form)
    }).then(res => {
      if (res.ok) {
        setShowModal(false);
        loadUsuarios();
      } else {
        alert("Error al guardar");
      }
    });
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
        {activeTab === 'usuarios' && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
            <Plus size={18} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b pb-2 mb-6">
        <button 
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <div className="flex items-center gap-2"><Users size={18}/> Usuarios Activos</div>
        </button>
        <button 
          onClick={() => setActiveTab('parametros')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'parametros' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <div className="flex items-center gap-2"><Settings size={18}/> Parámetros Generales</div>
        </button>
        <button 
          onClick={() => setActiveTab('bancos')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'bancos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <div className="flex items-center gap-2"><Landmark size={18}/> Bancos y Métodos</div>
        </button>
        <button 
          onClick={() => setActiveTab('tiendas')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'tiendas' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <div className="flex items-center gap-2"><Store size={18}/> Tiendas y Sucursales</div>
        </button>
      </div>

      {activeTab === 'usuarios' && (
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
                {u.is_master ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold">
                    <Key size={14} /> Master
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <LayoutGrid size={14} /> {(u.modules ? JSON.parse(u.modules) : []).length} módulos asignados
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'parametros' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-3xl">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Firmantes de Reportes</h2>
              <p className="text-gray-500 text-sm">Configura los nombres y cédulas que aparecerán en los comprobantes de entrega.</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Secretario(a) del Fondo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                  <input type="text" value={generalConfigs.firma_secretario_nombre} onChange={e => setGeneralConfigs({...generalConfigs, firma_secretario_nombre: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Ej. Pedro Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cédula de Identidad</label>
                  <input type="text" value={generalConfigs.firma_secretario_cedula} onChange={e => setGeneralConfigs({...generalConfigs, firma_secretario_cedula: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Ej. V-12345678" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Administrador(a) de UGAVI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                  <input type="text" value={generalConfigs.firma_admin_nombre} onChange={e => setGeneralConfigs({...generalConfigs, firma_admin_nombre: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Ej. Ana Gómez" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cédula de Identidad</label>
                  <input type="text" value={generalConfigs.firma_admin_cedula} onChange={e => setGeneralConfigs({...generalConfigs, firma_admin_cedula: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Ej. V-8765432" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleSaveConfigs} disabled={savingConfigs} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50">
                {savingConfigs ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Guardar Parámetros
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Usuario (ej. admin)</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                  disabled={editUser?.is_master}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña {editUser && '(Opcional)'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ruta por defecto</label>
                <select
                  value={form.default_route}
                  onChange={e => setForm({...form, default_route: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="">Ninguna</option>
                  {modulosDisponibles.map(m => (
                    <option key={m.route} value={m.route}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {!editUser?.is_master && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Permisos de Acceso a Módulos</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {modulosDisponibles.map(mod => (
                    <label key={mod.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.modules.includes(mod.id)}
                        onChange={() => toggleModule(mod.id)}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span className="text-sm font-medium">{mod.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">
                Cancelar
              </button>
              <button onClick={saveUser} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                Guardar Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bancos' && (
        <BancosConfigPanel />
      )}

      {activeTab === 'tiendas' && (
        <TiendasConfigPanel />
      )}
    </div>
  );
}

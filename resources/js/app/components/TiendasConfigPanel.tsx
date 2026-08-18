import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Store, Loader2, Landmark } from 'lucide-react';

export function TiendasConfigPanel() {
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [bancos, setBancos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editTienda, setEditTienda] = useState<any>(null);

  // Forms state
  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    tipo_negocio: 'restaurante_bar',
    activa: true,
    bancos: [] as number[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resT = await fetch('/api/configuraciones/tiendas');
      if (resT.ok) setTiendas(await resT.json());

      // Fetch bancos to allow linking them to tiendas
      const resB = await fetch('/api/finanzas/bancos');
      if (resB.ok) setBancos(await resB.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    setEditTienda(null);
    setForm({ nombre: '', slug: '', tipo_negocio: 'restaurante_bar', activa: true, bancos: [] });
    setShowModal(true);
  };

  const openEdit = (tienda: any) => {
    setEditTienda(tienda);
    setForm({
      nombre: tienda.nombre,
      slug: tienda.slug,
      tipo_negocio: tienda.tipo_negocio,
      activa: tienda.activa === 1 || tienda.activa === true,
      bancos: tienda.bancos || []
    });
    setShowModal(true);
  };

  const saveTienda = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editTienda ? `/api/configuraciones/tiendas/${editTienda.id}` : '/api/configuraciones/tiendas';
      const method = editTienda ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        fetchData();
        setShowModal(false);
        window.dispatchEvent(new Event('tiendas-updated'));
      } else {
        const error = await res.json();
        alert(error.message || 'Error al guardar');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTienda = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta tienda? Esta acción no se puede deshacer y eliminará todos sus registros.')) return;
    try {
      const res = await fetch(`/api/configuraciones/tiendas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        window.dispatchEvent(new Event('tiendas-updated'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBanco = (bancoId: number) => {
    if (form.bancos.includes(bancoId)) {
      setForm({ ...form, bancos: form.bancos.filter(id => id !== bancoId) });
    } else {
      setForm({ ...form, bancos: [...form.bancos, bancoId] });
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tiendas y Sucursales</h2>
              <p className="text-xs text-gray-500">Administración global de puntos de venta</p>
            </div>
          </div>
          <button onClick={openNew} className="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Nueva Tienda
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiendas.map(t => (
              <div key={t.id} className="p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                      {t.tipo_negocio === 'restaurante_bar' ? 'Restaurante / Bar' : 'Tienda General'}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${t.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{t.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">Slug: <span className="font-medium text-gray-700">{t.slug}</span></p>
                  
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Landmark size={14} className="text-blue-500" />
                    {(t.bancos || []).length} bancos vinculados
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(t)} className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors">
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => deleteTienda(t.id)} className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
            {tiendas.length === 0 && <p className="text-gray-400 col-span-3 text-center py-4">No hay tiendas registradas.</p>}
          </div>
        </div>
      </div>

      {/* TIENDA MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={saveTienda} className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editTienda ? 'Editar' : 'Nueva'} Tienda</h3>
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Nombre de la Tienda</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej. Tasca UGAVI" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Slug (Identificador URL)</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} placeholder="Ej. tasca" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Tipo de Negocio</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" value={form.tipo_negocio} onChange={e => setForm({...form, tipo_negocio: e.target.value})}>
                    <option value="restaurante_bar">Restaurante / Bar</option>
                    <option value="tienda_general">Tienda General</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" checked={form.activa} onChange={e => setForm({...form, activa: e.target.checked})} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500" />
                    <div>
                      <div className="font-bold text-gray-800 text-sm">Tienda Activa</div>
                      <div className="text-xs text-gray-500">Los usuarios pueden acceder a ella y registrar operaciones.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-wide flex items-center gap-2">
                  <Landmark size={14} /> Bancos Permitidos para esta Tienda
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {bancos.map(b => (
                    <label key={b.id} className="flex items-start gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={form.bancos.includes(b.id)} 
                        onChange={() => toggleBanco(b.id)}
                        className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                      />
                      <div>
                        <div className="font-bold text-gray-700 text-sm">{b.nombre}</div>
                        <div className="text-xs text-gray-500">{b.titular} ({b.divisa})</div>
                      </div>
                    </label>
                  ))}
                  {bancos.length === 0 && (
                    <div className="col-span-2 text-sm text-gray-500 italic">No hay bancos registrados en el sistema.</div>
                  )}
                </div>
              </div>

            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : null} Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

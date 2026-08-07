import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Landmark, CreditCard, Loader2 } from 'lucide-react';

export function BancosConfigPanel() {
  const [bancos, setBancos] = useState<any[]>([]);
  const [metodos, setMetodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showBancoModal, setShowBancoModal] = useState(false);
  const [showMetodoModal, setShowMetodoModal] = useState(false);
  
  const [editBanco, setEditBanco] = useState<any>(null);
  const [editMetodo, setEditMetodo] = useState<any>(null);

  // Forms state
  const [bancoForm, setBancoForm] = useState({ nombre: '', titular: '', divisa: 'VES', propietario: 'FONDO' });
  const [metodoForm, setMetodoForm] = useState({ nombre: '', id_banco: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resB = await fetch('/api/finanzas/bancos');
      if (resB.ok) setBancos(await resB.json());

      const resM = await fetch('/api/finanzas/metodos-pago');
      if (resM.ok) setMetodos(await resM.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewBanco = () => {
    setEditBanco(null);
    setBancoForm({ nombre: '', titular: '', divisa: 'VES', propietario: 'FONDO' });
    setShowBancoModal(true);
  };

  const openEditBanco = (banco: any) => {
    setEditBanco(banco);
    setBancoForm({ nombre: banco.nombre, titular: banco.titular, divisa: banco.divisa, propietario: banco.propietario });
    setShowBancoModal(true);
  };

  const openNewMetodo = () => {
    setEditMetodo(null);
    setMetodoForm({ nombre: '', id_banco: '' });
    setShowMetodoModal(true);
  };

  const openEditMetodo = (metodo: any) => {
    setEditMetodo(metodo);
    setMetodoForm({ nombre: metodo.nombre, id_banco: metodo.id_banco || '' });
    setShowMetodoModal(true);
  };

  const saveBanco = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editBanco ? `/api/finanzas/bancos/${editBanco.id}` : '/api/finanzas/bancos';
      const method = editBanco ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bancoForm)
      });
      if (res.ok) {
        setShowBancoModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveMetodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editMetodo ? `/api/finanzas/metodos-pago/${editMetodo.id}` : '/api/finanzas/metodos-pago';
      const method = editMetodo ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metodoForm, id_banco: metodoForm.id_banco === '' ? null : metodoForm.id_banco })
      });
      if (res.ok) {
        setShowMetodoModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBanco = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta cuenta bancaria?')) return;
    try {
      await fetch(`/api/finanzas/bancos/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMetodo = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este método de pago?')) return;
    try {
      await fetch(`/api/finanzas/metodos-pago/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* BANCOS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
              <Landmark size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Cuentas Bancarias</h2>
              <p className="text-xs text-gray-500">Cuentas y cajas donde ingresa y sale dinero</p>
            </div>
          </div>
          <button onClick={openNewBanco} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Nuevo Banco
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bancos.map(b => (
              <div key={b.id} className="p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">{b.propietario}</span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${b.divisa === 'USD' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {b.divisa}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{b.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">Titular: <span className="font-medium text-gray-700">{b.titular}</span></p>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => openEditBanco(b)} className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors">
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => deleteBanco(b.id)} className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
            {bancos.length === 0 && <p className="text-gray-400 col-span-3 text-center py-4">No hay cuentas bancarias registradas.</p>}
          </div>
        </div>
      </div>

      {/* METODOS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Métodos de Pago</h2>
              <p className="text-xs text-gray-500">Opciones que aparecen en el formulario y su banco destino</p>
            </div>
          </div>
          <button onClick={openNewMetodo} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Nuevo Método
          </button>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Método de Pago</th>
                  <th className="px-4 py-3">Banco Vinculado (Destino)</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metodos.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">{m.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.banco ? (
                        <span className="flex items-center gap-2">
                          <Landmark size={14} className="text-blue-500"/> 
                          {m.banco.nombre} <span className="text-xs px-1.5 bg-gray-100 rounded text-gray-500">{m.banco.divisa}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Ninguno (No concilia)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditMetodo(m)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => deleteMetodo(m.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {metodos.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No hay métodos de pago registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BANCO MODAL */}
      {showBancoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={saveBanco} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editBanco ? 'Editar' : 'Nueva'} Cuenta Bancaria</h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Nombre del Banco o Caja</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" value={bancoForm.nombre} onChange={e => setBancoForm({...bancoForm, nombre: e.target.value})} placeholder="Ej. BNC (Banco Nacional de Crédito)" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Titular de la Cuenta</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" value={bancoForm.titular} onChange={e => setBancoForm({...bancoForm, titular: e.target.value})} placeholder="Ej. Fondo de Ugavi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Divisa</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" value={bancoForm.divisa} onChange={e => setBancoForm({...bancoForm, divisa: e.target.value})}>
                    <option value="VES">VES (Bolívares)</option>
                    <option value="USD">USD (Dólares)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Propietario / Dept</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" value={bancoForm.propietario} onChange={e => setBancoForm({...bancoForm, propietario: e.target.value})}>
                    <option value="FONDO">Fondo UGAVI</option>
                    <option value="TASCA">La Tasca</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowBancoModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : null} Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* METODO MODAL */}
      {showMetodoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={saveMetodo} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editMetodo ? 'Editar' : 'Nuevo'} Método de Pago</h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Nombre del Método</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" value={metodoForm.nombre} onChange={e => setMetodoForm({...metodoForm, nombre: e.target.value})} placeholder="Ej. Pago Móvil / Transferencia" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wide">Banco Destino (Opcional)</label>
                <select className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" value={metodoForm.id_banco} onChange={e => setMetodoForm({...metodoForm, id_banco: e.target.value})}>
                  <option value="">-- Ninguno (No concilia en banco) --</option>
                  {bancos.map(b => (
                    <option key={b.id} value={b.id}>{b.nombre} ({b.divisa})</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wide">Si seleccionas un banco, se activará la conciliación automática al usar este método.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowMetodoModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : null} Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

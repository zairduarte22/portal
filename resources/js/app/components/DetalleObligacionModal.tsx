import { useState } from 'react';
import { X, Trash2, Edit2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { AbonoModal } from './AbonoModal';
import { ObligacionModal } from './ObligacionModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  obligacion: any | null;
  config: any;
  onSuccess: () => void;
}

export default function DetalleObligacionModal({ isOpen, onClose, obligacion, config, onSuccess }: Props) {
  const [editingAbono, setEditingAbono] = useState<any>(null);
  const [editingObligacion, setEditingObligacion] = useState(false);

  if (!isOpen || !obligacion) return null;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta obligación? Se borrarán todos los abonos y movimientos bancarios asociados.')) return;
    
    try {
      const res = await fetch(`/api/finanzas/obligaciones/${obligacion.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
      onClose();
    } catch (e: any) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  const handleDeleteAbono = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este abono? Se borrará el movimiento bancario asociado y se recalculará la deuda.')) return;
    
    try {
      const res = await fetch(`/api/finanzas/obligaciones/abonos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
      onClose();
    } catch (e: any) {
      alert('Error al eliminar abono: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Detalles de Obligación</h2>
            <p className="text-sm text-gray-500">Historial y gestión de pagos</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Info principal */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tercero / Beneficiario</p>
                <p className="font-bold text-gray-800">{obligacion.tercero}</p>
                <p className="text-sm text-gray-600">{obligacion.categoria}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fechas</p>
                <p className="text-sm text-gray-800">Emisión: {new Date(obligacion.fecha_emision + "T12:00:00Z").toLocaleDateString()}</p>
                <p className="text-sm text-gray-800">Límite: {obligacion.fecha_limite ? new Date(obligacion.fecha_limite + "T12:00:00Z").toLocaleDateString() : 'No aplica'}</p>
              </div>
              {obligacion.descripcion && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motivo / Descripción</p>
                  <p className="text-sm text-gray-800">{obligacion.descripcion}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white p-5 rounded-xl border shadow-sm min-w-[250px]">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-gray-500">Deuda Original:</span>
                  <span className="font-bold">{obligacion.moneda} {Number(obligacion.monto_original).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-green-600">Abonado:</span>
                  <span className="font-bold text-green-600">{obligacion.moneda} {Number(obligacion.monto_abonado).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-gray-800">Restante:</span>
                  <span className="font-bold text-red-600">{obligacion.moneda} {(Number(obligacion.monto_original) - Number(obligacion.monto_abonado)).toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button 
                  onClick={() => setEditingObligacion(true)}
                  className="flex-1 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 size={14} /> Editar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-2 bg-red-50 text-red-700 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          </div>

          {/* Abonos */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              Historial de Abonos
              <span className="bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full">{obligacion.abonos?.length || 0}</span>
            </h3>
            
            {obligacion.abonos && obligacion.abonos.length > 0 ? (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Referencia</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Banco (ID)</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Monto</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {obligacion.abonos.map((abono: any) => (
                      <tr key={abono.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium">{new Date(abono.fecha + "T12:00:00Z").toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{abono.referencia}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{config?.bancos?.find((b:any)=>b.id===abono.banco_id)?.nombre || abono.banco_id}</td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                          {abono.moneda_pago} {Number(abono.monto_abonado).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => setEditingAbono(abono)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteAbono(abono.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No hay abonos registrados para esta obligación.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingAbono && (
        <AbonoModal
          isOpen={true}
          onClose={() => setEditingAbono(null)}
          onSuccess={() => { setEditingAbono(null); onSuccess(); onClose(); }}
          obligacion={obligacion}
          config={config}
          editData={editingAbono}
        />
      )}

      {editingObligacion && (
        <ObligacionModal
          isOpen={true}
          onClose={() => setEditingObligacion(false)}
          onSuccess={() => { setEditingObligacion(false); onSuccess(); onClose(); }}
          tipo={obligacion.tipo_obligacion}
          config={config}
          editData={obligacion}
        />
      )}
    </div>
  );
}

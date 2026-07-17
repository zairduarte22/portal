import React, { useState, useEffect, useMemo } from "react";
import { X, ArrowDownRight, ArrowUpRight, FileText, TriangleAlert, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MovimientosViewProps {
  insumoId: number;
  insumoNombre: string;
  onClose: () => void;
  onAdjusted: () => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const dateOnly = dateStr.split('T')[0].split(' ')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export function MovimientosInsumoView({ insumoId, insumoNombre, onClose, onAdjusted }: MovimientosViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compras' | 'ventas' | 'ajustar'>('compras');
  
  const [ajusteForm, setAjusteForm] = useState({
    tipo: 'aumento',
    cantidad: '',
    motivo: ''
  });
  const [ajustando, setAjustando] = useState(false);
  const [ticketVentaId, setTicketVentaId] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || !data.ventas_detalladas) return [];
    
    // Agrupar por fecha
    const grouped = data.ventas_detalladas.reduce((acc: any, v: any) => {
      const d = v.fecha.split(' ')[0];
      if (!acc[d]) acc[d] = 0;
      acc[d] += parseFloat(v.cantidad);
      return acc;
    }, {});
    
    // Ordenar por fecha y formatear
    return Object.keys(grouped).sort().map(d => ({
      fecha: formatDate(d),
      unidades: grouped[d]
    }));
  }, [data]);

  useEffect(() => {
    fetch(`/api/tasca/insumos/${insumoId}/movimientos`)
      .then(res => res.json())
      .then(resData => {
        if (resData.message) {
          setData({ error: resData.message });
        } else {
          setData(resData);
        }
        setLoading(false);
      })
      .catch(err => {
        setData({ error: 'Error de conexión con el servidor' });
        setLoading(false);
      });
  }, [insumoId]);

  const handleAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ajusteForm.cantidad || !ajusteForm.motivo) return;
    
    setAjustando(true);
    fetch(`/api/tasca/insumos/${insumoId}/ajustar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        tipo: ajusteForm.tipo,
        cantidad: parseFloat(ajusteForm.cantidad),
        motivo: ajusteForm.motivo
      })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.error) {
        alert("Error: " + resData.error);
        setAjustando(false);
      } else {
        alert("Ajuste realizado correctamente.");
        onAdjusted();
        onClose();
      }
    })
    .catch(err => {
      alert("Error de conexión");
      setAjustando(false);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center text-gray-500">
          <p>Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg text-center border-t-4 border-red-500 shadow-sm">
          <TriangleAlert size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-6">{data.error}</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold">Volver al catálogo</button>
        </div>
      </div>
    );
  }

  if (!data || !data.compras) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p>Los datos recibidos son inválidos.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Volver al catálogo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white rounded-xl">
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h2 className="text-2xl font-black uppercase text-gray-800">{insumoNombre}</h2>
          <p className="text-sm text-gray-500 mt-1">Historial de Movimientos e Inventario</p>
        </div>
        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors">
          <X size={18} /> Volver al catálogo
        </button>
      </div>
        
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 font-semibold text-sm ${activeTab === 'compras' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('compras')}
          >
            Compras e Inventario Inicial
          </button>
          <button 
            className={`px-6 py-3 font-semibold text-sm ${activeTab === 'ventas' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('ventas')}
          >
            Ventas y Salidas
          </button>
          <button 
            className={`px-6 py-3 font-semibold text-sm ${activeTab === 'ajustar' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('ajustar')}
          >
            Ajustar Inventario
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {activeTab === 'compras' && (
            <div>
              <h3 className="font-bold text-lg mb-4 text-green-700 flex items-center gap-2">
                <ArrowDownRight size={20} /> Entradas de Mercancía
              </h3>
              
              <div className="bg-white rounded border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Referencia / Lote</th>
                      <th className="px-4 py-3 text-right">Cantidad Entrante</th>
                      <th className="px-4 py-3 text-right">Costo Unit.</th>
                      <th className="px-4 py-3 text-right">Stock Restante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.compras.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay entradas registradas</td>
                      </tr>
                    ) : (
                      data?.compras.map((c: any, idx: number) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">{c.fecha_compra}</td>
                          <td className="px-4 py-3">
                            {idx === 0 && !c.compra_id ? (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold mr-2">INVENTARIO INICIAL</span>
                            ) : null}
                            {c.codigo_lote || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600">+{c.cantidad_comprada}</td>
                          <td className="px-4 py-3 text-right">${parseFloat(c.costo_unitario).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold">{c.stock_actual}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ventas' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded border shadow-sm text-center">
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">Total Unidades Vendidas</p>
                  <p className="text-3xl font-black text-gray-800 mt-2">{parseFloat(data?.ventas_resumidas.total_unidades_vendidas || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded border shadow-sm text-center">
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">Ingresos Generados</p>
                  <p className="text-3xl font-black text-green-600 mt-2">${parseFloat(data?.ventas_resumidas.total_ingresos || 0).toFixed(2)}</p>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="bg-white p-4 rounded border shadow-sm mb-6">
                  <h3 className="text-sm text-gray-500 uppercase font-bold tracking-wide mb-4">Evolución de Ventas</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="fecha" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} width={40} />
                        <Tooltip 
                          formatter={(value: any) => [`${value} unidades`, 'Salidas']}
                          labelStyle={{color: '#374151', fontWeight: 'bold'}}
                        />
                        <Line type="monotone" dataKey="unidades" stroke="#dc2626" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <h3 className="font-bold text-lg mb-4 text-red-700 flex items-center gap-2 mt-8">
                <ArrowUpRight size={20} /> Salidas Detalladas
              </h3>

              <div className="bg-white rounded border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Presentación</th>
                      <th className="px-4 py-3 text-right">Cant.</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-center">Ticket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.ventas_detalladas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay salidas registradas</td>
                      </tr>
                    ) : (
                      data?.ventas_detalladas.map((v: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">{formatDate(v.fecha)}</td>
                          <td className="px-4 py-3">
                            {v.miembro_nombre ? (v.persona_nombre ? `${v.persona_nombre} (${v.miembro_nombre})` : `${v.miembro_nombre} ${v.miembro_apellido || ''}`) : (v.cliente_foraneo_nombre ? v.cliente_foraneo_nombre : 'Consumidor Final')}
                          </td>
                          <td className="px-4 py-3">{v.presentacion}</td>
                          <td className="px-4 py-3 text-right font-semibold text-red-600">-{v.cantidad}</td>
                          <td className="px-4 py-3 text-right">${parseFloat(v.total).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            {v.estado === 'Ajuste' ? (
                               <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-semibold">AJUSTE</span>
                            ) : (
                               <span className={`text-xs px-2 py-1 rounded font-semibold ${v.estado === 'Pagada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {v.estado}
                               </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {v.estado !== 'Ajuste' && v.id_venta && (
                              <button onClick={() => setTicketVentaId(v.id_venta)} className="inline-flex p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Ver detalle de la venta (Ticket)">
                                <Eye size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'ajustar' && (
            <div className="bg-white p-6 rounded border shadow-sm max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-6 text-yellow-600 bg-yellow-50 p-4 rounded">
                <TriangleAlert size={24} />
                <p className="text-sm">Utilice esta función solo para cuadrar el inventario real por pérdidas, daños o mermas, no para registrar compras.</p>
              </div>
              
              <form onSubmit={handleAjuste} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Ajuste</label>
                  <select 
                    value={ajusteForm.tipo}
                    onChange={(e) => setAjusteForm({...ajusteForm, tipo: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="aumento">Aumento (Encontré sobrante)</option>
                    <option value="disminucion">Disminución (Pérdida / Daño)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad (Unidades de Insumo)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={ajusteForm.cantidad}
                    onChange={(e) => setAjusteForm({...ajusteForm, cantidad: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej. 1.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Motivo / Justificación</label>
                  <textarea 
                    required
                    value={ajusteForm.motivo}
                    onChange={(e) => setAjusteForm({...ajusteForm, motivo: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Escriba la razón de este ajuste..."
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={ajustando}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {ajustando ? 'Procesando...' : 'Aplicar Ajuste'}
                </button>
              </form>
            </div>
          )}
        </div>
      {ticketVentaId && (
        <TicketModal ventaId={ticketVentaId} onClose={() => setTicketVentaId(null)} />
      )}
    </div>
  );
};

const TicketModal = ({ ventaId, onClose }: { ventaId: number, onClose: () => void }) => {
  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tasca/ventas/${ventaId}`)
      .then(res => res.json())
      .then(data => {
        setVenta(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching ticket", err);
        setLoading(false);
      });
  }, [ventaId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">Detalle del Ticket #{ventaId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Cargando detalles...</p>
          ) : !venta ? (
            <p className="text-center text-red-500 py-8">Error al cargar la venta</p>
          ) : (
            <div className="bg-white border rounded p-4 shadow-sm text-sm">
              <div className="text-center mb-6 border-b pb-4">
                <h4 className="font-bold text-xl uppercase tracking-widest text-gray-800">Tasca</h4>
                <p className="text-gray-500 mt-1">Ticket de Venta #{venta.id}</p>
                <p className="text-gray-500">{formatDate(venta.fecha)}</p>
              </div>

              <div className="mb-4">
                <p><span className="font-semibold text-gray-700">Cliente:</span> {venta.miembro ? `${venta.miembro.razon_social} ${venta.miembro.acronimo || ''}` : (venta.cliente_foraneo ? venta.cliente_foraneo.nombre : 'Consumidor Final')}</p>
                <p><span className="font-semibold text-gray-700">Estado:</span> <span className={`font-bold ${venta.estado === 'Pagada' ? 'text-green-600' : 'text-yellow-600'}`}>{venta.estado}</span></p>
              </div>

              <table className="w-full mb-4 border-t border-b py-2">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="text-left py-2">Cant</th>
                    <th className="text-left py-2">Producto</th>
                    <th className="text-right py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.detalles?.map((det: any) => (
                    <tr key={det.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 text-gray-700 font-semibold">{det.cantidad}</td>
                      <td className="py-2 text-gray-800">{det.producto?.nombre}</td>
                      <td className="py-2 text-right text-gray-800">${parseFloat(det.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700 text-lg">TOTAL:</span>
                <span className="font-black text-green-700 text-xl">${parseFloat(venta.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 text-xs mb-6">
                <span>Tasa BCV: {venta.tasa_bcv} Bs</span>
                <span>Ref: {(parseFloat(venta.total) * parseFloat(venta.tasa_bcv)).toFixed(2)} Bs</span>
              </div>

              {venta.pagos && venta.pagos.length > 0 && (
                <div className="bg-gray-50 p-3 rounded border">
                  <h5 className="font-bold text-gray-600 mb-2 border-b pb-1">Pagos Asociados</h5>
                  {venta.pagos.map((pago: any) => (
                    <div key={pago.id} className="flex justify-between text-xs py-1">
                      <span className="text-gray-600">
                        {pago.metodo_pago} {pago.referencia ? `(Ref: ${pago.referencia})` : ''}
                      </span>
                      <span className="font-semibold text-green-700">
                        ${parseFloat(pago.pivot?.monto_abonado_usd || pago.monto_usd || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

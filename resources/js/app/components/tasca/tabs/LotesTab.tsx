import { useState, useEffect } from "react";
import { Plus, Trash2, Layers, X, PlusCircle, Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function LotesTab() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  
  const [showNewCompraModal, setShowNewCompraModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState<any | null>(null);
  const [showAbonoModal, setShowAbonoModal] = useState<any | null>(null);
  const [abonoForm, setAbonoForm] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [pagosLista, setPagosLista] = useState<any[]>([]);
  const [pagoInput, setPagoInput] = useState({
    monto_usd: "",
    monto_bs: "",
    metodo_pago: "Efectivo Divisas",
    referencia_pago: ""
  });

  // Formulario de Nueva Compra (Cabecera)
  const [compraHeader, setCompraHeader] = useState({
    fecha_compra: format(new Date(), 'yyyy-MM-dd'),
    referencia_factura: "",
    proveedor_id: "",
    tipo_compra: "Contado",
    metodo_pago: "Efectivo Divisas",
    referencia_pago: "",
    monto_bs: "",
  });

  // Formulario de Nueva Compra (Detalles)
  const emptyLoteItem = () => ({
    id_insumo: "",
    cantidad_comprada: "",
    costo_unitario: "",
    fecha_caducidad: "",
  });

  const [compraItems, setCompraItems] = useState<any[]>([emptyLoteItem()]);

  const loadInsumos = () => {
    fetch("/api/tasca/insumos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInsumos(data);
      })
      .catch(console.error);
  };

  const loadCompras = () => {
    fetch("/api/tasca/compras")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCompras(data);
      })
      .catch(console.error);
  };

  const loadProveedores = () => {
    fetch("/api/tasca/proveedores")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProveedores(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadInsumos();
    loadCompras();
    loadProveedores();
  }, []);

  const handleCompraPreSubmit = () => {
    const isValid = compraItems.every(item => item.id_insumo && item.cantidad_comprada && item.costo_unitario);
    if (!isValid) {
      alert("Por favor complete Insumo, Cantidad y Costo en todos los ítems.");
      return;
    }
    setPagosLista([]);
    setPagoInput({ monto_usd: "", monto_bs: "", metodo_pago: "Efectivo Divisas", referencia_pago: "" });
    setShowPagoModal(true);
  };

  const handleCompraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    

    if (compraHeader.tipo_compra === 'Contado') {
      const totalPagado = pagosLista.reduce((sum, p) => sum + parseFloat(p.monto_usd), 0);
      const totalEsperado = calcularTotalEdicion();
      if (Math.abs(totalPagado - totalEsperado) > 0.05) {
        alert("El total de los pagos debe cubrir el 100% de la compra de contado.");
        return;
      }
    }

    const payload = {
      ...compraHeader,
      proveedor_id: compraHeader.proveedor_id ? parseInt(compraHeader.proveedor_id) : null,
      pagos: compraHeader.tipo_compra === 'Contado' ? pagosLista : [],
      lotes: compraItems.map(item => ({
        ...item,
        id_insumo: parseInt(item.id_insumo),
        cantidad_comprada: parseFloat(item.cantidad_comprada),
        costo_unitario: parseFloat(item.costo_unitario),
        fecha_caducidad: item.fecha_caducidad || null
      }))
    };

    fetch("/api/tasca/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) throw new Error("Error al registrar la compra");
        setShowPagoModal(false);
        setShowNewCompraModal(false);
        loadCompras();
        loadInsumos();
      })
      .catch(err => alert(err.message));
  };

  const anularCompra = (id: number) => {
    if (confirm("¿Seguro que deseas anular esta compra? Esto revertirá el stock de todos los insumos incluidos.")) {
      fetch(`/api/tasca/compras/${id}/anular`, { method: "POST" })
        .then(async res => {
          if (!res.ok) throw new Error("Error al anular compra");
          loadCompras();
          loadInsumos();
          if (showDetalleModal && showDetalleModal.id === id) {
            setShowDetalleModal(null);
          }
        })
        .catch(err => alert(err.message));
    }
  };

  const handlePagarAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAbonoModal) return;

    if (pagosLista.length === 0) {
      alert("Debes agregar al menos un pago.");
      return;
    }

    fetch(`/api/tasca/compras/${showAbonoModal.id}/pagar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fecha: abonoForm.fecha,
        pagos: pagosLista
      })
    })
      .then(async res => {
        if (!res.ok) throw new Error("Error al registrar abono");
        setShowAbonoModal(null);
        setAbonoForm({ fecha: format(new Date(), 'yyyy-MM-dd') });
        setPagosLista([]);
        loadCompras();
      })
      .catch(err => alert(err.message));
  };

  const addCompraItem = () => setCompraItems([...compraItems, emptyLoteItem()]);

  const removeCompraItem = (index: number) => {
    if (compraItems.length === 1) return;
    const newItems = [...compraItems];
    newItems.splice(index, 1);
    setCompraItems(newItems);
  };

  const updateCompraItem = (index: number, field: string, value: string) => {
    const newItems = [...compraItems];
    newItems[index][field] = value;
    setCompraItems(newItems);
  };

  const openNewCompra = () => {
    setCompraHeader({
      fecha_compra: format(new Date(), 'yyyy-MM-dd'),
      referencia_factura: "",
      proveedor_id: "",
      tipo_compra: "Contado",
      metodo_pago: "Efectivo Divisas",
      referencia_pago: "",
      monto_bs: "",
    });
    setCompraItems([emptyLoteItem()]);
    setShowNewCompraModal(true);
  };

  // Calcular el total de la compra que se está redactando
  const calcularTotalEdicion = () => {
    return compraItems.reduce((acc, item) => {
      const q = parseFloat(item.cantidad_comprada) || 0;
      const c = parseFloat(item.costo_unitario) || 0;
      return acc + (q * c);
    }, 0);
  };

  const addPago = (isAbono: boolean = false) => {
    const amount = parseFloat(pagoInput.monto_usd);
    if (isNaN(amount) || amount <= 0) return alert("Ingrese un monto válido");
    
    if ((pagoInput.metodo_pago.includes('Transferencia') || pagoInput.metodo_pago.includes('Zelle')) && !pagoInput.referencia_pago) {
        return alert("La referencia es obligatoria para este método de pago");
    }

    setPagosLista([...pagosLista, {
      ...pagoInput,
      monto_usd: amount,
      monto_bs: pagoInput.monto_bs ? parseFloat(pagoInput.monto_bs) : null
    }]);

    setPagoInput({ monto_usd: "", monto_bs: "", metodo_pago: "Efectivo Divisas", referencia_pago: "" });
  };

  const removePago = (index: number) => {
    setPagosLista(pagosLista.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Listado de Compras (Historial) */}
      <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Layers size={24} className="text-blue-600" />
            Historial de Compras de Inventario
          </h2>
          <button 
            onClick={openNewCompra}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white shadow-md transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
          >
            <PlusCircle size={20} /> Registrar Compra
          </button>
        </div>

        {compras.length === 0 ? (
          <div className="py-12 text-center" style={{ color: "var(--muted-foreground)" }}>
            No hay compras registradas en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  <th className="pb-3 font-semibold text-sm">Fecha</th>
                  <th className="pb-3 font-semibold text-sm">Factura / Ref</th>
                  <th className="pb-3 font-semibold text-sm">Proveedor</th>
                  <th className="pb-3 font-semibold text-sm">Total ($)</th>
                  <th className="pb-3 font-semibold text-sm">Pagado ($)</th>
                  <th className="pb-3 font-semibold text-sm">Estado</th>
                  <th className="pb-3 font-semibold text-sm text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", color: "var(--foreground)" }} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="py-3 text-sm">{format(new Date(c.fecha_compra), 'dd/MM/yyyy')}</td>
                    <td className="py-3 font-semibold">{c.referencia_factura || '-'}</td>
                    <td className="py-3 text-sm">{c.proveedor?.nombre || '-'}</td>
                    <td className="py-3 font-black text-blue-600">${parseFloat(c.total_usd).toFixed(2)}</td>
                    <td className="py-3 font-bold text-gray-700">${parseFloat(c.abono_usd || '0').toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        c.estado === 'Pagada' ? 'bg-green-100 text-green-700' : 
                        c.estado === 'Parcial' ? 'bg-orange-100 text-orange-700' :
                        c.estado === 'Anulada' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {(c.estado === 'Pendiente' || c.estado === 'Parcial') && (
                        <button onClick={() => setShowAbonoModal(c)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Abonar Pago">
                          <PlusCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => setShowDetalleModal(c)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Ver Detalles">
                        <Eye size={16} />
                      </button>
                      {c.estado !== 'Anulada' && (
                        <button onClick={() => anularCompra(c.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Anular Compra">
                          <AlertTriangle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Nueva Compra */}
      {showNewCompraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-6xl p-6 rounded-2xl shadow-xl max-h-[90vh] flex flex-col" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-blue-500">
                <PlusCircle size={24} /> Registrar Nueva Compra (Factura/Recibo)
              </h2>
              <button onClick={() => setShowNewCompraModal(false)} className="text-red-500 hover:text-red-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCompraSubmit} className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
              
              {/* Cabecera */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--muted-foreground)" }}>Fecha de Compra *</label>
                  <input 
                    required type="date" 
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                    value={compraHeader.fecha_compra} 
                    onChange={e => setCompraHeader({...compraHeader, fecha_compra: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--muted-foreground)" }}>Nro Factura / Referencia (Opc)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                    value={compraHeader.referencia_factura} 
                    onChange={e => setCompraHeader({...compraHeader, referencia_factura: e.target.value})}
                    placeholder="Ej: FAC-00123"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold mb-1" style={{ color: "var(--muted-foreground)" }}>Proveedor (Opc)</label>
                    <div className="flex gap-2 items-center">
                      <select 
                        className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                        value={compraHeader.proveedor_id} 
                        onChange={e => {
                          if (e.target.value === 'nuevo') {
                            const nombre = prompt("Nombre del nuevo proveedor:");
                            if (nombre) {
                              fetch("/api/tasca/proveedores", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ nombre })
                              }).then(res => res.json()).then(data => {
                                setProveedores([...proveedores, data]);
                                setCompraHeader({...compraHeader, proveedor_id: data.id.toString()});
                              }).catch(err => alert("Error al crear proveedor"));
                            }
                          } else {
                            setCompraHeader({...compraHeader, proveedor_id: e.target.value})
                          }
                        }}
                      >
                        <option value="">Ninguno / Consumidor</option>
                        {proveedores.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                        <option value="nuevo" className="font-bold text-blue-600">+ Agregar Nuevo Proveedor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Insumos Comprados</h3>
                
                <div className="overflow-x-auto border rounded-xl" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      <tr>
                        <th className="p-3 font-semibold text-sm w-1/3">Insumo *</th>
                        <th className="p-3 font-semibold text-sm w-32">Cantidad *</th>
                        <th className="p-3 font-semibold text-sm w-32">Costo Unit. ($) *</th>
                        <th className="p-3 font-semibold text-sm w-40">Vencimiento (Opc)</th>
                        <th className="p-3 font-semibold text-sm w-32 text-center">Subtotal</th>
                        <th className="p-3 font-semibold text-sm w-16 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {compraItems.map((item, index) => (
                        <tr key={index} className="border-b last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)" }}>
                          <td className="p-2">
                            <select 
                              required 
                              className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                              style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                              value={item.id_insumo} 
                              onChange={e => updateCompraItem(index, 'id_insumo', e.target.value)}
                            >
                              <option value="">Selecciona insumo...</option>
                              {insumos.map(i => (
                                <option key={i.id} value={i.id}>{i.nombre}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input 
                              required type="number" min="0.01" step="0.01" 
                              className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                              style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                              value={item.cantidad_comprada} 
                              onChange={e => updateCompraItem(index, 'cantidad_comprada', e.target.value)} 
                              placeholder="Unds"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              required type="number" min="0" step="0.01" 
                              className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                              style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                              value={item.costo_unitario} 
                              onChange={e => updateCompraItem(index, 'costo_unitario', e.target.value)}
                              placeholder="$0.00"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="date" 
                              className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                              style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                              value={item.fecha_caducidad} 
                              onChange={e => updateCompraItem(index, 'fecha_caducidad', e.target.value)} 
                            />
                          </td>
                          <td className="p-2">
                            <div className="p-2 text-sm font-bold rounded-lg text-center" style={{ color: "var(--foreground)" }}>
                              ${ ((parseFloat(item.cantidad_comprada) || 0) * (parseFloat(item.costo_unitario) || 0)).toFixed(2) }
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <button 
                              type="button" 
                              onClick={() => removeCompraItem(index)}
                              className={`p-2 rounded-lg transition-colors ${compraItems.length > 1 ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-300 cursor-not-allowed'}`}
                              disabled={compraItems.length <= 1}
                              title="Eliminar fila"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <button 
                    type="button" 
                    onClick={addCompraItem}
                    className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                  >
                    <Plus size={16} /> Añadir fila
                  </button>
                </div>
              </div>

            </form>

            <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="text-xl font-black" style={{ color: "var(--foreground)" }}>
                TOTAL: <span className="text-blue-500">${calcularTotalEdicion().toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewCompraModal(false)} className="px-6 py-2 rounded-xl font-semibold transition-colors" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
                  Cancelar
                </button>
                <button onClick={handleCompraPreSubmit} type="button" className="px-6 py-2 rounded-xl text-white font-semibold shadow-md hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                  Guardar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Compra */}
      {showDetalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
            <div className="flex justify-between items-start mb-6 border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Detalles de Factura / Compra
                </h2>
                <div className="text-sm mt-1 space-y-1" style={{ color: "var(--muted-foreground)" }}>
                  <p><strong style={{ color: "var(--foreground)" }}>Fecha:</strong> {format(new Date(showDetalleModal.fecha_compra), 'dd/MM/yyyy')}</p>
                  <p><strong style={{ color: "var(--foreground)" }}>Referencia:</strong> {showDetalleModal.referencia_factura || 'Sin referencia'}</p>
                  <p><strong style={{ color: "var(--foreground)" }}>Proveedor:</strong> {showDetalleModal.proveedor?.nombre || 'Sin proveedor'}</p>
                  <p><strong style={{ color: "var(--foreground)" }}>Estado:</strong> <span className={showDetalleModal.estado === 'Procesada' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{showDetalleModal.estado}</span></p>
                </div>
              </div>
              <button onClick={() => setShowDetalleModal(null)} className="text-red-500 hover:text-red-700 transition-colors">
                <X size={24} />
              </button>
            </div>

            <table className="w-full text-left border-collapse mb-4">
              <thead>
                <tr className="text-sm" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                  <th className="p-3 font-semibold rounded-tl-lg">Insumo</th>
                  <th className="p-3 font-semibold">Cantidad</th>
                  <th className="p-3 font-semibold">Costo Unit.</th>
                  <th className="p-3 font-semibold">Vencimiento</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {showDetalleModal.lotes?.map((l: any) => (
                  <tr key={l.id} className="border-b hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3 font-medium text-sm">{l.insumo?.nombre || 'Insumo Eliminado'}</td>
                    <td className="p-3 text-sm">{parseFloat(l.cantidad_comprada)}</td>
                    <td className="p-3 text-sm">${parseFloat(l.costo_unitario).toFixed(2)}</td>
                    <td className="p-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{l.fecha_caducidad ? format(new Date(l.fecha_caducidad), 'dd/MM/yyyy') : '-'}</td>
                    <td className="p-3 font-bold text-sm">
                      ${(parseFloat(l.cantidad_comprada) * parseFloat(l.costo_unitario)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right text-2xl font-black border-t pt-4" style={{ borderColor: "var(--border)" }}>
              TOTAL: <span className="text-blue-500">${parseFloat(showDetalleModal.total_usd).toFixed(2)}</span>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Abono a Compra a Crédito */}
      {showAbonoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">Registrar Pago a Proveedor</h2>
              <button onClick={() => setShowAbonoModal(null)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePagarAbono} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border mb-4 text-sm text-gray-700">
                <p><strong>Factura:</strong> {showAbonoModal.referencia_factura || `#${showAbonoModal.id}`}</p>
                <p><strong>Total:</strong> ${parseFloat(showAbonoModal.total_usd).toFixed(2)}</p>
                <p><strong>Abonado:</strong> ${parseFloat(showAbonoModal.abono_usd || '0').toFixed(2)}</p>
                <p className="text-red-600 font-bold mt-1 text-lg">
                  <strong>Restante:</strong> ${(parseFloat(showAbonoModal.total_usd) - parseFloat(showAbonoModal.abono_usd || '0')).toFixed(2)}
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                <h3 className="font-bold text-sm text-gray-700 mb-2">Agregar Pago Parcial</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Monto a Abonar (USD) *</label>
                    <input 
                      type="number" min="0.01" step="0.01"
                      className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                      value={pagoInput.monto_usd}
                      onChange={e => setPagoInput({...pagoInput, monto_usd: e.target.value})}
                      placeholder="Ej: 100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Método de Pago *</label>
                    <select 
                      className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                      value={pagoInput.metodo_pago}
                      onChange={e => setPagoInput({...pagoInput, metodo_pago: e.target.value})}
                    >
                      <option value="Efectivo Divisas">Efectivo Divisas</option>
                      <option value="Pago Movil/Transferencia">Pago Móvil / Transferencia</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Punto de Venta/POS">Punto de Venta / POS</option>
                      <option value="Efectivo Bs.">Efectivo Bs.</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {!pagoInput.metodo_pago.includes('Efectivo') ? (
                    <div>
                      <label className="block text-xs font-bold mb-1">Referencia (Opcional)</label>
                      <input 
                        type="text"
                        className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                        value={pagoInput.referencia_pago}
                        onChange={e => setPagoInput({...pagoInput, referencia_pago: e.target.value})}
                        placeholder="Ej: 123456789"
                      />
                    </div>
                  ) : <div></div>}
                  <div>
                    <label className="block text-xs font-bold mb-1">Monto Exacto Bs (Opc)</label>
                    <input 
                      type="number" step="0.01"
                      className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                      value={pagoInput.monto_bs}
                      onChange={e => setPagoInput({...pagoInput, monto_bs: e.target.value})}
                      placeholder="Ej: 3500.00"
                    />
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => addPago(true)} 
                  className="w-full py-2 mt-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Añadir Pago a la Lista
                </button>
              </div>

              {pagosLista.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-bold text-sm text-gray-700">Pagos a Procesar:</h4>
                  {pagosLista.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 border rounded-xl shadow-sm text-sm">
                      <div>
                        <p className="font-bold text-gray-800">${p.monto_usd} <span className="text-gray-500 font-normal">en {p.metodo_pago}</span></p>
                        {p.referencia_pago && <p className="text-xs text-gray-500">Ref: {p.referencia_pago}</p>}
                        {p.monto_bs && <p className="text-xs text-gray-500">Bs: {p.monto_bs}</p>}
                      </div>
                      <button type="button" onClick={() => removePago(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="text-right text-sm font-bold text-gray-700">
                    Total a Abonar: <span className="text-green-600 text-lg">${pagosLista.reduce((acc, p) => acc + p.monto_usd, 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">Fecha de Pago *</label>
                <input 
                  type="date" required
                  className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                  value={abonoForm.fecha}
                  onChange={e => setAbonoForm({...abonoForm, fecha: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => {setShowAbonoModal(null); setPagosLista([]);}} className="w-1/2 p-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 p-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700" disabled={pagosLista.length === 0}>
                  Registrar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Pago/Credito de Nueva Compra */}
      {showPagoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">Finalizar Compra</h2>
              <button onClick={() => setShowPagoModal(false)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCompraSubmit} className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                <p className="text-sm font-bold text-blue-800 uppercase tracking-wider">Total a Pagar</p>
                <p className="text-3xl font-black text-blue-600">${calcularTotalEdicion().toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--muted-foreground)" }}>Estado de Pago</label>
                <select 
                  className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 font-bold"
                  style={{ backgroundColor: compraHeader.tipo_compra === 'Contado' ? '#dcfce7' : '#fee2e2', color: compraHeader.tipo_compra === 'Contado' ? '#166534' : '#991b1b', borderColor: "var(--border)" }}
                  value={compraHeader.tipo_compra} 
                  onChange={e => setCompraHeader({...compraHeader, tipo_compra: e.target.value})}
                >
                  <option value="Contado">Pagada de Contado</option>
                  <option value="Credito">A Crédito (Deuda Pendiente)</option>
                </select>
              </div>
              
              {compraHeader.tipo_compra === 'Contado' && (
                <div className="space-y-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                    <h3 className="font-bold text-sm text-gray-700 mb-2">Agregar Pago Parcial</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Monto a Abonar (USD) *</label>
                        <input 
                          type="number" min="0.01" step="0.01"
                          className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                          value={pagoInput.monto_usd}
                          onChange={e => setPagoInput({...pagoInput, monto_usd: e.target.value})}
                          placeholder="Ej: 100.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Método de Pago *</label>
                        <select 
                          className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                          value={pagoInput.metodo_pago}
                          onChange={e => setPagoInput({...pagoInput, metodo_pago: e.target.value})}
                        >
                          <option value="Efectivo Divisas">Efectivo Divisas</option>
                          <option value="Pago Movil/Transferencia">Pago Móvil / Transferencia</option>
                          <option value="Zelle">Zelle</option>
                          <option value="Punto de Venta/POS">Punto de Venta / POS</option>
                          <option value="Efectivo Bs.">Efectivo Bs.</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {!pagoInput.metodo_pago.includes('Efectivo') ? (
                        <div>
                          <label className="block text-xs font-bold mb-1">Referencia (Opcional)</label>
                          <input 
                            type="text"
                            className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                            value={pagoInput.referencia_pago}
                            onChange={e => setPagoInput({...pagoInput, referencia_pago: e.target.value})}
                            placeholder="Ej: 123456789"
                          />
                        </div>
                      ) : <div></div>}
                      <div>
                        <label className="block text-xs font-bold mb-1">Monto Exacto Bs (Opc)</label>
                        <input 
                          type="number" step="0.01"
                          className="w-full p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500"
                          value={pagoInput.monto_bs}
                          onChange={e => setPagoInput({...pagoInput, monto_bs: e.target.value})}
                          placeholder="Ej: 3500.00"
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => addPago(false)} 
                      className="w-full py-2 mt-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      Añadir Pago a la Lista
                    </button>
                  </div>

                  {pagosLista.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-bold text-sm text-gray-700">Pagos a Procesar:</h4>
                      {pagosLista.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 border rounded-xl shadow-sm text-sm">
                          <div>
                            <p className="font-bold text-gray-800">${p.monto_usd} <span className="text-gray-500 font-normal">en {p.metodo_pago}</span></p>
                            {p.referencia_pago && <p className="text-xs text-gray-500">Ref: {p.referencia_pago}</p>}
                            {p.monto_bs && <p className="text-xs text-gray-500">Bs: {p.monto_bs}</p>}
                          </div>
                          <button type="button" onClick={() => removePago(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="text-right text-sm font-bold text-gray-700">
                        Total Pagado: <span className="text-green-600 text-lg">${pagosLista.reduce((acc, p) => acc + p.monto_usd, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setShowPagoModal(false)} className="w-1/2 p-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 p-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md" disabled={compraHeader.tipo_compra === 'Contado' && pagosLista.length === 0}>
                  Confirmar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

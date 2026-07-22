import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Check, Percent, CreditCard, Ban, Trash2, Search, Package } from "lucide-react";

export function VentaPos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  // Payment states
  const [pagos, setPagos] = useState<any[]>([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo Divisas");
  const [montoUsd, setMontoUsd] = useState("");
  const [referencia, setReferencia] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [tasa, setTasa] = useState("");
  const [loading, setLoading] = useState(false);
  const [directores, setDirectores] = useState<any[]>([]);

  // Auth Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState("");

  // Modal states for adding product quantity
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantityInput, setQuantityInput] = useState<number>(1);

  useEffect(() => {
    fetch(`/api/tasca/ventas/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.detalles) {
          data.detalles = data.detalles.map((d: any) => ({ ...d, original_cantidad: Number(d.cantidad) }));
        }
        setVenta(data);
      });
    fetch("/api/tasca/productos").then(res => res.json()).then(setProductos);
    fetch("/api/pagos/init").then(res => res.json()).then(data => {
      if (data.tasa_dia) setTasa(data.tasa_dia.toString());
    });
    fetch("/api/tasca/directores").then(res => res.json()).then(setDirectores).catch(() => {});
  }, [id]);

  if (!venta) return <div className="p-10 text-center">Cargando venta...</div>;

  const isSolvente = venta.miembro && venta.miembro.solvencia === 'Solvente';
  const isUgavi = venta.cliente_foraneo && venta.cliente_foraneo.nombre?.toLowerCase() === 'ugavi';
  
  const subtotal = venta.detalles?.reduce((acc: number, d: any) => acc + parseFloat(d.subtotal), 0) || 0;
  
  // Calcular descuento en vivo en el POS
  const descuentoAplicable = isSolvente ? subtotal * 0.10 : 0;
  const total = subtotal - descuentoAplicable;

  // Calculamos el saldo pendiente tomando en cuenta lo pagado anteriormente (si hubiera) y los pagos en memoria
  const pagadoAnteriormente = venta.pagos?.reduce((acc: number, p: any) => acc + parseFloat(p.pivot?.monto_abonado_usd || 0), 0) || 0;
  const pagadoAhora = pagos.reduce((acc: number, p: any) => acc + p.monto_usd, 0);
  const saldoPendiente = Math.max(0, total - pagadoAnteriormente - pagadoAhora);

  const handleAddProducto = (prod: any) => {
    const existingDetail = venta.detalles?.find((d: any) => Number(d.id_producto) === Number(prod.id));
    const qtyInCart = existingDetail ? Number(existingDetail.cantidad) : 0;
    const originalQty = existingDetail ? Number(existingDetail.original_cantidad || 0) : 0;
    
    // Only subtract from stock the extra items added in this session
    const newAddedQty = qtyInCart - originalQty;
    const availableStock = prod.stock - newAddedQty;
    
    if (availableStock <= 0) return alert("Sin stock");
    setSelectedProduct({ ...prod, stock: availableStock });
    setQuantityInput(1);
  };

  const addProductoToCart = (prod: any, qty: number = 1) => {
    if (qty <= 0) return alert("La cantidad debe ser mayor a 0");
    const currentDetalles = venta.detalles || [];
    const p = productos.find(p => Number(p.id) === Number(prod.id));
    
    const existing = currentDetalles.find((d: any) => Number(d.id_producto) === Number(prod.id));
    const existingQty = existing ? Number(existing.cantidad) : 0;
    const originalQty = existing ? Number(existing.original_cantidad || 0) : 0;
    
    const newAddedQty = existingQty - originalQty;
    
    if (p && newAddedQty + qty > p.stock) {
        return alert(`Stock insuficiente. Quedan ${p.stock - newAddedQty}`);
    }

    const precioReal = isUgavi ? parseFloat(prod.costo_calculado || prod.precio) : parseFloat(prod.precio);

    const newDetalles = existing 
      ? currentDetalles.map((d: any) => {
          if (Number(d.id_producto) === Number(prod.id)) {
            const newQty = Number(d.cantidad) + qty;
            return { ...d, cantidad: newQty, subtotal: precioReal * newQty };
          }
          return d;
        })
      : [...currentDetalles, { 
          id_producto: prod.id, 
          cantidad: qty, 
          precio_unitario: precioReal, 
          subtotal: precioReal * qty 
        }];

    updateDetalles(newDetalles);
  };

  const confirmAddProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    addProductoToCart(selectedProduct, quantityInput);
    setSelectedProduct(null);
  };

  const handleEditCantidad = (id_producto: number, newCantidad: number) => {
    if (newCantidad <= 0) return;
    const currentDetalles = venta.detalles || [];
    
    // Validar stock usando original_cantidad
    const p = productos.find(prod => Number(prod.id) === Number(id_producto));
    const existingDetail = currentDetalles.find((d: any) => Number(d.id_producto) === Number(id_producto));
    const originalQty = existingDetail ? Number(existingDetail.original_cantidad || 0) : 0;
    
    const newAddedQty = newCantidad - originalQty;
    
    if (p && newAddedQty > p.stock) {
      alert(`Stock insuficiente. Quedan ${p.stock + originalQty} en total, de los cuales ${originalQty} ya estaban en la factura. Puedes agregar hasta ${p.stock} más.`);
      return;
    }

    const newDetalles = currentDetalles.map((d: any) => {
      if (Number(d.id_producto) === Number(id_producto)) {
        const precioReal = isUgavi ? parseFloat(p?.costo_calculado || d.precio_unitario) : parseFloat(p?.precio || d.precio_unitario);
        return { ...d, cantidad: newCantidad, subtotal: precioReal * newCantidad };
      }
      return d;
    });
    updateDetalles(newDetalles);
  };

  const handleRemoveDetalle = (id_producto: number) => {
    const currentDetalles = venta.detalles || [];
    const existing = currentDetalles.find((d: any) => Number(d.id_producto) === Number(id_producto));
    if (!existing) return;

    let newDetalles;
    if (existing.cantidad > 1) {
      newDetalles = currentDetalles.map((d: any) => Number(d.id_producto) === Number(id_producto) ? { ...d, cantidad: d.cantidad - 1 } : d);
    } else {
      newDetalles = currentDetalles.filter((d: any) => Number(d.id_producto) !== Number(id_producto));
    }
    updateDetalles(newDetalles);
  };

  const updateDetalles = (detalles: any[]) => {
    fetch(`/api/tasca/ventas/${id}/detalles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ detalles })
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Error al actualizar la orden");
      }
      return data;
    }).then(data => {
      // Restaurar original_cantidad del estado anterior para no perder la referencia 
      // frente al array de productos (que no se vuelve a cargar de la DB en cada click)
      if (data.detalles) {
        data.detalles = data.detalles.map((newD: any) => {
          const oldD = venta.detalles?.find((d: any) => Number(d.id_producto) === Number(newD.id_producto));
          return { ...newD, original_cantidad: oldD?.original_cantidad || 0 };
        });
      }
      setVenta(data);
    }).catch(err => alert(err.message));
  };

  const handleAddPago = () => {
    const amount = parseFloat(montoUsd);
    if (isNaN(amount) || amount <= 0) return alert("Ingrese un monto válido");
    if (amount > saldoPendiente + 0.01) return alert("El monto supera el saldo pendiente");
    
    if ((metodoPago.includes('Transferencia') || metodoPago.includes('Zelle')) && !referencia) {
        return alert("La referencia es obligatoria para este método de pago");
    }

    const needsBs = metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo Bs');

    setPagos([...pagos, {
        metodo_pago: metodoPago,
        monto_usd: amount,
        tasa: parseFloat(tasa || "1"),
        monto_bs: needsBs ? amount * parseFloat(tasa || "1") : 0,
        referencia: referencia
    }]);
    
    setMontoUsd("");
    setReferencia("");
  };

  const handleProcesar = async (isCredit = false) => {
    if (!isCredit && saldoPendiente > 0.01) {
        return alert("La suma de los montos de los pagos debe ser igual al total facturado para cerrar la venta.");
    }
    
    setLoading(true);

    try {
      const res = await fetch(`/api/tasca/ventas/${id}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagos, id_autorizador: isCredit && !isSolvente ? selectedDirector : null })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al pagar");
      }
      const data = await res.json();
      setVenta(data);
      setShowPaymentModal(false);
      setShowAuthModal(false);
      alert("Venta procesada correctamente");
      navigate("/gestion/ventas-tasca");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = () => {
    if (confirm("¿Seguro que deseas anular esta venta?")) {
      fetch(`/api/tasca/ventas/${id}/anular`, { method: "POST" })
        .then(() => navigate("/gestion/ventas-tasca"));
    }
  };

  const isReadOnly = venta.estado === 'Pagada' || venta.estado === 'Anulada'; // 'Credito' y 'Parcial' pueden seguir recibiendo pagos y productos
  const isPendingPay = venta.estado === 'Pendiente' || venta.estado === 'Parcial' || venta.estado === 'Credito';

  const filteredProd = productos.filter(p => {
    const fullName = p.nombre_completo || p.nombre;
    return fullName.toLowerCase().includes(search.toLowerCase()) || 
           p.codigo_barras?.toLowerCase().includes(search.toLowerCase()) ||
           p.id.toString().includes(search);
  });
  return (
    <div className="space-y-6 h-[85vh] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">Venta #{venta.id}</h1>
            <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
              {venta.miembro ? (venta.persona ? `${venta.persona.nombre} (${venta.miembro.razon_social})` : `${venta.miembro.razon_social} (Miembro)`) : venta.cliente_foraneo ? `${venta.cliente_foraneo.nombre} (Foráneo)` : `Desconocido`}
              {venta.miembro && (
                 isSolvente 
                   ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-bold text-xs">SOLVENTE</span>
                   : <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-bold text-xs">INSOLVENTE</span>
              )}
            </p>
            {venta.autorizador && (
              <p className="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1">
                <Check size={14} /> Autorizado por: {venta.autorizador.nombre}
              </p>
            )}
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full font-bold text-sm ${
          venta.estado === 'Pagada' ? 'bg-green-100 text-green-700' :
          venta.estado === 'Credito' ? 'bg-blue-100 text-blue-700' :
          venta.estado === 'Parcial' ? 'bg-orange-100 text-orange-700' :
          venta.estado === 'Anulada' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {venta.estado}
        </span>
      </div>

      <div className="flex gap-6 h-full overflow-hidden">
        {/* Productos (Lado Izquierdo) */}
        <div className="flex-1 flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text" placeholder="Buscar producto o escanear código..." autoFocus
                className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background"
                value={search} onChange={(e) => setSearch(e.target.value)}
                disabled={isReadOnly}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim() !== '') {
                    // Buscar coincidencia exacta por código de barras
                    const matchByBarcode = productos.find(p => p.codigo_barras === search.trim());
                    if (matchByBarcode) {
                      addProductoToCart(matchByBarcode, 1);
                      setSearch("");
                    } 
                    // O si solo hay un producto filtrado en la lista
                    else if (filteredProd.length === 1) {
                      addProductoToCart(filteredProd[0], 1);
                      setSearch("");
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProd.map(p => {
                const existingDetail = venta.detalles?.find((d: any) => Number(d.id_producto) === Number(p.id));
                const qtyInCart = existingDetail ? Number(existingDetail.cantidad) : 0;
                const originalQty = existingDetail ? Number(existingDetail.original_cantidad || 0) : 0;
                
                const newAddedQty = qtyInCart - originalQty;
                const availableStock = p.stock - newAddedQty;
                
                return (
                  <button 
                    key={p.id} 
                    onClick={() => handleAddProducto(p)}
                    disabled={isReadOnly || availableStock <= 0}
                    className={`relative overflow-hidden rounded-xl border text-left transition-all flex flex-col justify-between ${availableStock > 0 ? 'hover:border-green-500 hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="p-3 flex-1 flex flex-col justify-between w-full">
                      <div>
                        <p className="font-bold text-sm mb-1 leading-tight break-words" title={p.nombre_completo || p.nombre}>{p.nombre_completo || p.nombre}</p>
                        <p className="text-green-600 font-bold">
                          ${isUgavi ? parseFloat(p.costo_calculado || p.precio).toFixed(2) : parseFloat(p.precio).toFixed(2)}
                          {isUgavi && p.costo_calculado !== undefined && <span className="text-xs text-orange-500 ml-2">(Costo)</span>}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Stock: {availableStock}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detalle de la Orden y Totales (Lado Derecho) */}
        <div className="w-[400px] flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-4 border-b font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Detalle de la Orden
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {venta.detalles?.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-semibold text-sm">{d.producto?.nombre_completo || d.producto?.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="number" 
                      className="w-16 p-1 border rounded text-xs text-center focus:ring-1 focus:ring-green-500" 
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                      value={d.cantidad} 
                      min="1"
                      disabled={isReadOnly}
                      onChange={(e) => handleEditCantidad(d.id_producto, parseInt(e.target.value) || 1)}
                    />
                    <span className="text-xs text-gray-500">x ${parseFloat(d.precio_unitario).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-sm">${parseFloat(d.subtotal).toFixed(2)}</p>
                  {!isReadOnly && (
                    <button onClick={() => handleRemoveDetalle(d.id_producto)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!venta.detalles || venta.detalles.length === 0) && (
              <div className="text-center text-gray-400 py-10">La orden está vacía.</div>
            )}
          </div>

          {/* Totales y Botones */}
          <div className="p-4 bg-gray-50/5 border-t">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <div className="text-right">
                  <span>${subtotal.toFixed(2)}</span>
                  <span className="text-xs ml-1 opacity-70">Bs. {(subtotal * parseFloat(tasa || "1")).toFixed(2)}</span>
                </div>
              </div>
              {descuentoAplicable > 0 && (
                <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg -mx-2">
                  <span className="flex items-center gap-1">Descuento (10%) <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded ml-1">Solvente</span></span>
                  <div className="text-right">
                    <span>-${descuentoAplicable.toFixed(2)}</span>
                    <span className="text-xs ml-1 opacity-70">Bs. -{(descuentoAplicable * parseFloat(tasa || "1")).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-blue-600">Total Venta</span>
                <div className="text-right text-blue-700">
                  <span>${total.toFixed(2)}</span>
                  <p className="text-xs font-bold text-blue-500 mt-0.5">Bs. {(total * parseFloat(tasa || "1")).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isPendingPay && (
                <button onClick={handleAnular} className="w-full py-2 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors border border-red-200 flex items-center justify-center gap-2">
                  <Ban size={18} /> {total === 0 ? "Anular Orden Vacía" : "Anular Venta"}
                </button>
              )}
              {!isReadOnly && total > 0 && (
                <>
                  <button 
                    onClick={() => setShowPaymentModal(true)} 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <CreditCard size={20} /> Pagar Factura
                  </button>
                  <button 
                    onClick={() => {
                        if (!isSolvente) {
                            setShowAuthModal(true);
                        } else {
                            handleProcesar(true);
                        }
                    }} 
                    className="w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Facturar a Crédito
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Modal for Quantity Input */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)" }}>
            <h2 className="text-xl font-bold mb-2 text-center" style={{ color: "var(--foreground)" }}>{selectedProduct.nombre_completo || selectedProduct.nombre}</h2>
            <p className="text-sm text-center mb-6" style={{ color: "var(--muted-foreground)" }}>
              Stock disponible: <span className="font-bold">{selectedProduct.stock}</span>
            </p>
            <form onSubmit={confirmAddProducto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-center" style={{ color: "var(--foreground)" }}>Cantidad a Añadir</label>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button type="button" onClick={() => setQuantityInput(Math.max(1, quantityInput - 1))} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors">-</button>
                  <input 
                    autoFocus
                    required 
                    type="number" 
                    min="1" 
                    max={selectedProduct.stock}
                    className="w-24 p-2 rounded-lg border text-center font-bold text-lg focus:ring-2 focus:ring-green-500"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
                    value={quantityInput} 
                    onChange={e => setQuantityInput(parseInt(e.target.value) || 1)} 
                  />
                  <button type="button" onClick={() => setQuantityInput(Math.min(selectedProduct.stock, quantityInput + 1))} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors">+</button>
                </div>
              </div>
              <div className="flex gap-3 justify-between mt-6">
                <button type="button" onClick={() => setSelectedProduct(null)} className="w-1/2 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2 rounded-lg text-white font-bold transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Payments */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <h2 className="text-2xl font-black text-center mb-6 text-gray-800">Procesar Pagos</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border text-center">
                 <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total de la Factura</p>
                 <p className="text-3xl font-black text-gray-800">${total.toFixed(2)}</p>
                 <p className="text-sm font-bold text-gray-500 mt-1">Bs. {(total * parseFloat(tasa||"1")).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                 <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Saldo Pendiente</p>
                 <p className="text-3xl font-black text-blue-700">${saldoPendiente.toFixed(2)}</p>
                 <p className="text-sm font-bold text-blue-600 mt-1">Bs. {(saldoPendiente * parseFloat(tasa||"1")).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
              {/* Historical & Current Payments List */}
              {(venta.pagos?.length > 0 || pagos.length > 0) && (
                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Pagos Registrados</h3>
                  {venta.pagos?.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-xl border border-gray-200">
                          <div>
                              <p className="font-bold text-gray-700">{p.metodo_pago}</p>
                              <p className="text-xs text-gray-500 font-medium">{p.fecha_pago} {p.referencia ? `- Ref: ${p.referencia}` : ''}</p>
                          </div>
                          <span className="font-black text-gray-700 text-lg">${parseFloat(p.pivot?.monto_abonado_usd || 0).toFixed(2)}</span>
                      </div>
                  ))}
                  {pagos.map((p, i) => (
                      <div key={`new-${i}`} className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <div>
                              <p className="font-bold text-blue-800">{p.metodo_pago}</p>
                              {p.referencia && <p className="text-xs text-blue-600 font-medium">Ref: {p.referencia}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="font-black text-blue-800 text-lg">${p.monto_usd.toFixed(2)}</span>
                              <button type="button" onClick={() => setPagos(pagos.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:text-red-700 bg-red-100 rounded-lg transition-colors">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                  ))}
                </div>
              )}

              {saldoPendiente > 0.01 ? (
                <div className="bg-gray-50 p-5 rounded-2xl border">
                    <h3 className="font-bold text-sm mb-3 text-gray-700 uppercase tracking-wider">Añadir Nuevo Pago</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Método de Pago</label>
                        <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full p-2.5 border rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500">
                            <option value="Efectivo Divisas">Efectivo Divisas</option>
                            <option value="Pago Movil/Transferencia">Pago Móvil / Transferencia</option>
                            <option value="Zelle">Zelle</option>
                            <option value="Punto de Venta/POS">Punto de Venta / POS</option>
                            <option value="Efectivo Bs.">Efectivo Bs.</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Monto (USD)</label>
                        <div className="flex gap-2">
                            <input type="number" step="0.01" value={montoUsd} onChange={e => setMontoUsd(e.target.value)} placeholder="Ej: 10.50" className="w-full p-2.5 border rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500" />
                            <button type="button" onClick={() => setMontoUsd(saldoPendiente.toFixed(2))} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-200 transition-colors">MAX</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      {!metodoPago.includes('Efectivo') && (
                          <div className="mb-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Referencia</label>
                            <input type="text" value={referencia} onChange={e => setReferencia(e.target.value)} placeholder={(metodoPago.includes('Transferencia') || metodoPago.includes('Zelle')) ? 'Obligatorio' : 'Opcional'} className="w-full p-2.5 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500" />
                          </div>
                      )}
                      {montoUsd && (metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo Bs')) && (
                          <p className="text-xs text-gray-500 font-bold mb-3">Equivalente: Bs. {(parseFloat(montoUsd) * parseFloat(tasa || "1")).toFixed(2)} (Tasa: {tasa})</p>
                      )}
                      <button type="button" onClick={handleAddPago} className="w-full py-3 bg-blue-100 text-blue-700 font-black rounded-xl text-sm transition-colors hover:bg-blue-200">
                          Añadir Pago
                      </button>
                    </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-bold flex flex-col items-center justify-center gap-2">
                  <Check size={40} className="text-green-500" />
                  <p className="text-lg">¡El saldo ha sido cubierto!</p>
                  <p className="text-sm font-normal">Ya puedes procesar la factura de forma segura.</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-auto pt-4 border-t">
               <button onClick={() => setShowPaymentModal(false)} className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancelar</button>
               <button 
                 onClick={() => handleProcesar(false)}
                 disabled={saldoPendiente > 0.01 || loading}
                 className="w-2/3 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2">
                 <Check size={20} /> Confirmar y Cerrar Factura
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Credit Authorization */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl flex flex-col">
            <h2 className="text-xl font-bold mb-2 text-center text-orange-600">Autorización de Crédito</h2>
            <p className="text-sm text-center mb-6 text-gray-500">
              El cliente no es solvente. Seleccione el director o presidente que autoriza este crédito:
            </p>
            
            <select 
              className="w-full p-3 border rounded-xl bg-gray-50 font-medium mb-6 focus:ring-2 focus:ring-orange-500"
              value={selectedDirector}
              onChange={e => setSelectedDirector(e.target.value)}
            >
              <option value="">-- Seleccionar Autorizador --</option>
              {directores.map(d => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setShowAuthModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                Cancelar
              </button>
              <button 
                onClick={() => handleProcesar(true)}
                disabled={!selectedDirector || loading}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed font-bold rounded-xl transition-colors"
              >
                Autorizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

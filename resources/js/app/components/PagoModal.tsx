import { useState, useMemo, useEffect } from "react";
import { Search, DollarSign, Wallet, Check, Save, X, ArrowLeft, Calendar, Tag, Loader2 } from "lucide-react";

interface PagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  miembros: any[];
  facturas: any[];
  tasaDia: number | "";
  mode?: "create" | "edit" | "view";
  pagoToEdit?: any;
}

export function PagoModal({ isOpen, onClose, onSuccess, miembros, facturas, tasaDia, mode = "create", pagoToEdit }: PagoModalProps) {
  const isCreating = mode === "create";
  const isViewing = mode === "view";
  const isEditing = mode === "edit";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{isOpen: boolean, type: "success" | "error", message: string, onClose?: () => void}>({isOpen: false, type: "success", message: ""});
  const [confirmation, setConfirmation] = useState<{isOpen: boolean, message: string, forceAction: () => void}>({isOpen: false, message: "", forceAction: () => {}});
  
  // Payment Form State
  const getLocalDateString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const [fecha, setFecha] = useState(getLocalDateString());
  const [monto, setMonto] = useState<number>(0);
  const [tasaCambio, setTasaCambio] = useState<number | "">("");
  const [montoBs, setMontoBs] = useState<number | "">("");
  const [metodoPago, setMetodoPago] = useState("Pago Movil/Transferencia");
  const [referencia, setReferencia] = useState("");
  const [facturaUgavi, setFacturaUgavi] = useState("");
  const [facturaFondo, setFacturaFondo] = useState("");
  const [mesesProntoPago, setMesesProntoPago] = useState<number>(0);
  
  // Local facturas state to allow appending new ones
  const [localFacturas, setLocalFacturas] = useState<any[]>([]);
  const [isAdelantando, setIsAdelantando] = useState(false);

  // Selected invoices state: a set of factura IDs
  const [selectedFacturas, setSelectedFacturas] = useState<Set<number>>(new Set());

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedMemberId(null);
      setFecha(new Date().toISOString().split('T')[0]);
      setMonto(0);
      setTasaCambio("");
      setMontoBs("");
      setMetodoPago("Pago Movil/Transferencia");
      setReferencia("");
      setFacturaUgavi("");
      setFacturaFondo("");
      setMesesProntoPago(0);
      setSelectedFacturas(new Set());
    } else {
      setLocalFacturas(facturas);
      if (isCreating) {
        if (tasaDia !== "") setTasaCambio(tasaDia);
      } else if (pagoToEdit) {
        // Edit/View mode
        if (pagoToEdit.facturas && pagoToEdit.facturas.length > 0) {
          setSelectedMemberId(pagoToEdit.facturas[0].id_miembro);
          setSelectedFacturas(new Set(pagoToEdit.facturas.map((f: any) => f.id)));
          
          // Calculate how many months were discounted
          let appliedDiscount = 0;
          pagoToEdit.facturas.forEach((f: any) => {
             appliedDiscount += Number(f.pivot?.descuento || 0);
          });
          setMesesProntoPago(appliedDiscount / 5);
        }
        setFecha(pagoToEdit.fecha || "");
        setMonto(Number(pagoToEdit.monto) || 0);
        setMontoBs(Number(pagoToEdit.monto_bs) || "");
        setTasaCambio(Number(pagoToEdit.tasa_cambio) || "");
        setMetodoPago(pagoToEdit.metodo_pago || "Pago Movil/Transferencia");
        setReferencia(pagoToEdit.referencia || "");
        setFacturaUgavi(pagoToEdit.factura_ugavi || "");
        setFacturaFondo(pagoToEdit.factura_fondo || "");
      }
    }
  }, [isOpen, tasaDia, mode, pagoToEdit]);

  // Filter members
  const filteredMembers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return miembros.filter(m => 
      (m.razon_social || '').toLowerCase().includes(term) ||
      (m.rif || '').toLowerCase().includes(term) ||
      (m.acronimo || '').toLowerCase().includes(term)
    );
  }, [searchTerm, miembros]);

  const selectedMember = miembros.find(m => m.id === selectedMemberId);

  // Invoices for selected member
  const memberInvoices = useMemo(() => {
    if (!selectedMemberId) return [];
    
    const pending = localFacturas.filter(f => f.id_miembro === selectedMemberId && Number(f.pendiente) > 0);
    const linked = (pagoToEdit?.facturas || []).filter((f: any) => f.id_miembro === selectedMemberId);
    
    const mergedMap = new Map();
    pending.forEach(f => mergedMap.set(f.id, f));
    linked.forEach((f: any) => mergedMap.set(f.id, f));
    
    return Array.from(mergedMap.values()).sort((a: any, b: any) => new Date(a.fecha + "T12:00:00Z").getTime() - new Date(b.fecha + "T12:00:00Z").getTime());
  }, [selectedMemberId, localFacturas, pagoToEdit]);

  const handleAdelantarCuotas = async () => {
    if (!selectedMemberId) return;
    const qty = window.prompt("¿Cuántos meses desea adelantar?", "1");
    if (!qty) return;
    const parsedQty = parseInt(qty, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) return;

    setIsAdelantando(true);
    try {
      const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const response = await fetch('/api/facturas/adelantos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({
          id_miembro: selectedMemberId,
          cantidad_meses: parsedQty
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al adelantar cuotas');
      }

      const data = await response.json();
      setLocalFacturas(prev => [...prev, ...data.facturas]);
      setNotification({
        isOpen: true,
        type: "success",
        message: `Se adelantaron ${data.facturas.length} cuotas exitosamente.`
      });
    } catch (e: any) {
      setNotification({
        isOpen: true,
        type: "error",
        message: e.message
      });
    } finally {
      setIsAdelantando(false);
    }
  };

  // Derived financial computations
  const descuentoTotal = mesesProntoPago * 5;
  
  const totalFacturasSeleccionadas = useMemo(() => {
    let sum = 0;
    for (const f of memberInvoices) {
      if (selectedFacturas.has(f.id)) {
        if (isCreating) {
          sum += Number(f.pendiente);
        } else {
          // Robust fallback if f.monto is undefined (e.g. cached state before DB migration)
          const fallbackMonto = Number(f.pendiente) + Number(f.pivot?.monto_aplicado || 0) + Number(f.pivot?.descuento || 0);
          sum += Number(f.monto) || fallbackMonto;
        }
      }
    }
    return sum;
  }, [selectedFacturas, memberInvoices, isCreating]);

  const montoRequerido = Math.max(0, totalFacturasSeleccionadas - descuentoTotal);
  const saldoAFavor = monto > montoRequerido ? monto - montoRequerido : 0;

  // Handle amount input change (Auto-select oldest invoices based on effective paying power)
  const handleMontoChange = (newMonto: number, currentProntoPago: number = mesesProntoPago) => {
    setMonto(newMonto);
    if (typeof tasaCambio === "number") {
      setMontoBs(Number((newMonto * tasaCambio).toFixed(2)));
    }
    
    const currDescuento = currentProntoPago * 5;
    // Paga facturas asumiendo que el descuento nos ayuda a pagar
    let remaining = newMonto + currDescuento;
    const newSelected = new Set<number>();
    
    for (const f of memberInvoices) {
      if (remaining >= Number(f.pendiente)) {
        newSelected.add(f.id);
        remaining -= Number(f.pendiente);
      } else if (remaining > 0) {
        // Partially pay the next one
        newSelected.add(f.id);
        remaining = 0;
      } else {
        break;
      }
    }
    
    setSelectedFacturas(newSelected);
  };

  const handleProntoPagoChange = (meses: number) => {
    setMesesProntoPago(meses);
    handleMontoChange(monto, meses);
  };

  // Handle checkbox toggle
  const toggleFactura = (id: number) => {
    const next = new Set(selectedFacturas);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedFacturas(next);
    
    // Update amount to match exactly the sum of selected invoices minus discount
    let newTotalFacturas = 0;
    for (const f of memberInvoices) {
      if (next.has(f.id)) {
        if (isCreating) {
          newTotalFacturas += Number(f.pendiente);
        } else {
          const fallbackMonto = Number(f.pendiente) + Number(f.pivot?.monto_aplicado || 0) + Number(f.pivot?.descuento || 0);
          newTotalFacturas += Number(f.monto) || fallbackMonto;
        }
      }
    }
    const required = Math.max(0, newTotalFacturas - descuentoTotal);
    setMonto(required);
    if (typeof tasaCambio === "number") {
      setMontoBs(Number((required * tasaCambio).toFixed(2)));
    }
  };

  // Generate description
  const description = useMemo(() => {
    if (selectedFacturas.size === 0) return "";
    
    const formatMesCuota = (dateStr: string) => {
      try {
        const parts = dateStr.split('-');
        if (parts.length >= 2) {
          const year = parts[0];
          const monthIndex = parseInt(parts[1], 10) - 1;
          const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
          return `${months[monthIndex]} ${year}`;
        }
      } catch (e) {}
      return dateStr; // Fallback
    };

    const selectedMonths = memberInvoices
      .filter(f => selectedFacturas.has(f.id))
      .map(f => formatMesCuota(f.mes_cuota));
    
    let desc = selectedMonths.join(", ");
    if (saldoAFavor > 0) {
      desc += ` | Incluye abono a favor de $${saldoAFavor.toFixed(2)}`;
    }
    return desc;
  }, [selectedFacturas, memberInvoices, saldoAFavor]);

  const handleSubmit = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!selectedMemberId || selectedFacturas.size === 0 || monto <= 0) return;

    setIsSubmitting(true);
    
    try {
      // Build the facturas array to send to the backend
      // We need to figure out how much of the payment is applied to each invoice.
      let remainingMoney = monto + descuentoTotal;
      const facturasPayload = [];
      const appliedDescuentoPerMonth = 5;
      let appliedMonths = 0;

      for (const f of memberInvoices) {
        if (selectedFacturas.has(f.id)) {
          const pendiente = Number(f.pendiente);
          
          let currDescuento = 0;
          if (appliedMonths < mesesProntoPago) {
             currDescuento = appliedDescuentoPerMonth;
             appliedMonths++;
          }
          
          // The max we can apply to this invoice is its pendiente
          // The effective power is remainingMoney
          const effectivePaymentRequired = pendiente; 
          
          // We apply the maximum possible from our remainingMoney to cover the invoice
          const totalToApply = Math.min(effectivePaymentRequired, remainingMoney);
          
          // How much is actual cash vs discount?
          // The invoice reduces by totalToApply. The discount reduces it first (conceptually)
          const desc = Math.min(currDescuento, totalToApply);
          const cash = totalToApply - desc;

          facturasPayload.push({
            id: f.id,
            monto_aplicado: cash,
            descuento: desc
          });

          remainingMoney -= totalToApply;
        }
      }

      if (isCreating) {
        const payload = {
          monto,
          monto_bs: montoBs,
          tasa_cambio: tasaCambio,
          fecha,
          metodo_pago: metodoPago,
          referencia: metodoPago === 'Cruces' ? '' : referencia,
          factura_ugavi: facturaUgavi,
          factura_fondo: facturaFondo,
          facturas: facturasPayload,
          force_duplicate_reference: force
        };

        const res = await fetch('/api/pagos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          if (res.status === 409 && err.requires_confirmation) {
            setIsSubmitting(false);
            setConfirmation({
              isOpen: true,
              message: err.message,
              forceAction: () => {
                setConfirmation({ ...confirmation, isOpen: false });
                handleSubmit(undefined, true);
              }
            });
            return;
          }
          throw new Error(err.message || 'Error al procesar el pago');
        }

        setNotification({
          isOpen: true,
          type: "success",
          message: `Pago registrado exitosamente.\nAbono a Favor: $${saldoAFavor.toFixed(2)}\nDescripción: ${description}`,
          onClose: () => {
            onSuccess();
            onClose();
          }
        });
      } else if (isEditing) {
        const payload = {
          fecha,
          metodo_pago: metodoPago,
          referencia: metodoPago === 'Cruces' ? '' : referencia
        };

        const res = await fetch(`/api/pagos/${pagoToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Error al actualizar el pago');
        }

        setNotification({
          isOpen: true,
          type: "success",
          message: "Pago actualizado exitosamente.",
          onClose: () => {
            onSuccess();
            onClose();
          }
        });
      }
    } catch (error: any) {
      console.error(error);
      setNotification({
        isOpen: true,
        type: "error",
        message: error.message || 'Ocurrió un error inesperado al guardar el pago.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }} 
        onClick={onClose} 
      />
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Registrar Nuevo Pago</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
          {!selectedMember ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>1. Selecciona el Miembro</h3>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Busca el miembro al cual se le registrará el abono.</p>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} style={{ color: "var(--muted-foreground)" }} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por Razón Social, RIF..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-base border outline-none transition-all focus:ring-2 focus:ring-green-200 shadow-sm"
                  style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {filteredMembers.map(m => (
                  <div 
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className="p-4 rounded-2xl border cursor-pointer transition-all hover:border-green-400 bg-card hover:shadow-md flex items-center justify-between group"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <p className="text-base font-bold text-gray-800">{m.razon_social}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{m.rif} • {m.acronimo}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Check size={16} className="text-gray-400 group-hover:text-green-600" />
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="p-8 text-center rounded-2xl border border-dashed" style={{ borderColor: "var(--border)" }}>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No se encontraron miembros con esa búsqueda.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-card rounded-2xl p-4 border flex items-center justify-between shadow-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                    <Wallet size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 mb-0.5">Miembro Seleccionado</h3>
                    <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{selectedMember.razon_social}</p>
                    <p className="text-sm text-gray-500">{selectedMember.rif}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMemberId(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Cambiar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border space-y-8" style={{ borderColor: "var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                      <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 text-xs">2</span>
                      Cuotas Pendientes
                    </h3>
                  </div>

                  {memberInvoices.length === 0 ? (
                    <div className="p-5 rounded-2xl text-center text-sm border border-dashed" style={{ backgroundColor: "var(--muted)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                      Este miembro no tiene cuotas pendientes de pago en el sistema.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {memberInvoices.map(f => {
                        const isSelected = selectedFacturas.has(f.id);
                        
                        // Formatear mes_cuota (ej: "2026-06-01" -> "Junio 2026")
                        const dateObj = new Date(f.mes_cuota + 'T12:00:00Z');
                        const mesFormat = dateObj.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
                        const mesCapitalized = mesFormat.charAt(0).toUpperCase() + mesFormat.slice(1);

                        return (
                          <label 
                            key={f.id} 
                            className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
                            style={{ 
                              backgroundColor: isSelected ? "rgba(34, 197, 94, 0.05)" : "var(--input-background)",
                              borderColor: isSelected ? "#4ade80" : "var(--border)"
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                {isSelected && <Check size={12} color="#fff" />}
                              </div>
                              <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={isSelected}
                                disabled={!isCreating}
                                onChange={() => toggleFactura(f.id)}
                              />
                              <div>
                                <p className="text-base font-bold" style={{ color: "var(--foreground)" }}>Cuota {mesCapitalized.replace(' de ', ' ')}</p>
                                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Emitida: {new Date(f.fecha + "T12:00:00Z").toLocaleDateString("es-VE")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {isCreating ? (
                                <p className="text-base font-bold text-red-500">Debe ${(Number(f.pendiente) || 0).toFixed(2)}</p>
                              ) : (
                                <p className="text-base font-bold text-gray-700">Monto Original: ${(Number(f.monto) || (Number(f.pendiente) + Number(f.pivot?.monto_aplicado || 0) + Number(f.pivot?.descuento || 0))).toFixed(2)}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {isCreating && selectedMemberId && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAdelantarCuotas}
                        disabled={isAdelantando}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        {isAdelantando ? "Generando..." : "+ Adelantar Cuotas"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-6 flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                    <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 text-xs">3</span>
                    Abonos y Descuentos
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={16} className="text-green-600" />
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Descuento Pronto Pago</label>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Meses descontados:</span>
                        <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: "var(--border)" }}>
                          <button 
                            type="button"
                            disabled={!isCreating}
                            onClick={() => handleProntoPagoChange(Math.max(0, mesesProntoPago - 1))}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors font-bold"
                          >-</button>
                          <span className="px-4 py-1 text-sm font-bold bg-white">{mesesProntoPago}</span>
                          <button 
                            type="button"
                            disabled={!isCreating}
                            onClick={() => handleProntoPagoChange(mesesProntoPago + 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors font-bold"
                          >+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Total Descuento:</span>
                        <span className="text-base font-bold text-green-600">-${descuentoTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border shadow-inner" style={{ borderColor: "var(--border)" }}>
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Cuotas ({selectedFacturas.size}):</span>
                          <span className="font-semibold">${totalFacturasSeleccionadas.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Descuento aplicado:</span>
                          <span className="font-semibold text-green-600">-${descuentoTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-700">Monto Requerido:</span>
                          <span className="font-bold text-gray-900">${montoRequerido.toFixed(2)}</span>
                        </div>
                      </div>

                      {saldoAFavor > 0 && (
                        <div className="mt-3 p-3 rounded-xl bg-green-100 border border-green-200 flex justify-between items-center animate-in fade-in zoom-in duration-300">
                          <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Abono a Favor</span>
                          <span className="text-sm font-black text-green-700">+${saldoAFavor.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-6 flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                    <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 text-xs">4</span>
                    Detalles del Pago
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Monto Pagado por Miembro ($)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign size={16} style={{ color: "var(--muted-foreground)" }} />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          disabled={!isCreating}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-lg font-bold border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                          style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                          value={monto || ""}
                          onChange={(e) => handleMontoChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Fecha de Pago</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} style={{ color: "var(--muted-foreground)" }} />
                        </div>
                        <input
                          type="date"
                          required
                          disabled={isViewing}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                          style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Método de Pago</label>
                      <select
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                        style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        value={metodoPago}
                        disabled={isViewing}
                        onChange={(e) => setMetodoPago(e.target.value)}
                      >
                        <option value="Pago Movil/Transferencia">Pago Móvil / Transferencia</option>
                        <option value="Zelle">Zelle</option>
                        <option value="Efectivo Divisas">Efectivo Divisas</option>
                        <option value="Cruces">Cruces</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Referencia Bancaria</label>
                      <input
                        type="text"
                        required={metodoPago !== 'Cruces'}
                        disabled={isViewing || metodoPago === 'Cruces'}
                        placeholder={metodoPago === 'Cruces' ? "No aplica para cruces" : "Nro. de referencia o recibo"}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                        style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        value={metodoPago === 'Cruces' ? "" : referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Tasa de Cambio (Bs/$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        disabled={!isCreating}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                        style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        value={tasaCambio}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setTasaCambio(isNaN(val) ? "" : val);
                          if (!isNaN(val) && monto) {
                            setMontoBs(Number((monto * val).toFixed(2)));
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Monto en Bs</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        disabled={!isCreating}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                        style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        value={montoBs}
                        onChange={(e) => setMontoBs(parseFloat(e.target.value) || "")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Nº Factura UGAVI</label>
                      <input
                        type="text"
                        placeholder="Autogenerado si se deja en blanco"
                        disabled={isViewing}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                        style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        value={facturaUgavi}
                        onChange={(e) => setFacturaUgavi(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Nº Factura Fondo</label>
                      <input
                        type="text"
                        placeholder="Autogenerado si se deja en blanco"
                        disabled={isViewing}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-green-200 disabled:opacity-70"
                        style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        value={facturaFondo}
                        onChange={(e) => setFacturaFondo(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Descripción Automática</label>
                      <textarea
                        readOnly
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl text-base border outline-none shadow-inner"
                        style={{ backgroundColor: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)", fontWeight: 600 }}
                        value={description}
                      />
                    </div>
                  </div>

                  {!isViewing && (
                    <div className="flex justify-end pt-8">
                      <button
                        type="submit"
                        disabled={(isCreating && (selectedFacturas.size === 0 || monto <= 0)) || isSubmitting}
                        className="px-8 py-3.5 rounded-xl text-sm flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 800, boxShadow: "0 4px 14px rgba(22,163,74,0.4)" }}
                      >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isSubmitting ? 'Procesando...' : (isEditing ? 'Actualizar Pago' : 'Procesar Pago')}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Custom Notification Dialog */}
        {notification.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => {
              if (notification.onClose) notification.onClose();
              else setNotification(n => ({ ...n, isOpen: false }));
            }}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" style={{ border: "1px solid var(--border)" }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold" style={{ fontFamily: "Nunito, sans-serif" }}>
                  {notification.type === "success" ? "¡Éxito!" : "Error"}
                </h3>
                <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: "var(--muted-foreground)" }}>{notification.message}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (notification.onClose) notification.onClose();
                    else setNotification(n => ({ ...n, isOpen: false }));
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ 
                    background: notification.type === "success" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)", 
                    color: "#fff", 
                    boxShadow: notification.type === "success" ? "0 2px 8px rgba(22,163,74,0.35)" : "0 2px 8px rgba(220,38,38,0.35)" 
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmation.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmation(c => ({ ...c, isOpen: false }))}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" style={{ border: "1px solid var(--border)" }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-yellow-600" style={{ fontFamily: "Nunito, sans-serif" }}>
                  Confirmar Acción
                </h3>
                <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: "var(--muted-foreground)" }}>{confirmation.message}</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmation(c => ({ ...c, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmation.forceAction}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", boxShadow: "0 2px 8px rgba(217,119,6,0.35)" }}
                >
                  Sí, Proceder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

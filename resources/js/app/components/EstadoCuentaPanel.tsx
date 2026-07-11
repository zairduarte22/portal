import { useState, useMemo, useEffect } from "react";
import { DollarSign, CheckCircle2, Clock, ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react";

interface EstadoCuentaPanelProps {
  memberId: number;
}

export function EstadoCuentaPanel({ memberId }: EstadoCuentaPanelProps) {
  const [expandedCuota, setExpandedCuota] = useState<number | null>(null);
  
  const [Cuotas, setCuotas] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [vinculacionPagos, setVinculacionPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstadoCuenta = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/miembros/${memberId}/estado-cuenta`);
        if (!res.ok) throw new Error("Error al cargar estado de cuenta");
        const data = await res.json();
        setCuotas(data.facturas || []);
        setPagos(data.pagos || []);
        setVinculacionPagos(data.vinculacion_pagos || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (memberId) {
      fetchEstadoCuenta();
    }
  }, [memberId]);

  // Filtrar las Cuotas de este miembro (ya vienen filtradas del backend, pero por seguridad)
  const CuotasMiembro = useMemo(() => Cuotas.filter(f => f.id_miembro === memberId), [Cuotas, memberId]);

  // Pre-calcular montos originales de las Cuotas sumando lo pendiente, pagado en efectivo y descuentos
  const CuotasCalculadas = useMemo(() => {
    return CuotasMiembro.map(f => {
      // Ignorar pagos anulados para no duplicar el monto (ya que el backend restauró el pendiente)
      const pagosDeEsta = vinculacionPagos.filter(vp => {
        if (vp.id_factura !== f.id) return false;
        const pagoInfo = pagos.find(p => p.id === vp.id_pago);
        return pagoInfo && pagoInfo.estado !== 'Anulada';
      });
      
      const pagadoEfectivo = pagosDeEsta.reduce((acc, vp) => acc + Number(vp.monto_aplicado || 0), 0);
      const descuentoAplicado = pagosDeEsta.reduce((acc, vp) => acc + Number(vp.descuento || 0), 0);
      const montoOriginal = Number(f.pendiente) + pagadoEfectivo + descuentoAplicado;
      
      return {
        ...f,
        montoOriginal,
        pagadoEfectivo,
        descuentoAplicado,
        pagosAplicados: pagosDeEsta.map(vp => ({
          ...vp,
          pagoInfo: pagos.find(p => p.id === vp.id_pago)
        }))
      };
    });
  }, [CuotasMiembro, vinculacionPagos, pagos]);

  // Calcular métricas generales
  const totalCargado = CuotasCalculadas.reduce((acc, f) => acc + f.montoOriginal, 0);
  const totalPendiente = CuotasCalculadas.reduce((acc, f) => acc + Number(f.pendiente), 0);
  const totalEfectivo = CuotasCalculadas.reduce((acc, f) => acc + f.pagadoEfectivo, 0);
  const totalDescuentos = CuotasCalculadas.reduce((acc, f) => acc + f.descuentoAplicado, 0);
  const totalPagadoAbonado = totalEfectivo + totalDescuentos;

  const toggleCuota = (id: number) => {
    setExpandedCuota(prev => (prev === id ? null : id));
  };

  const formatMesCuota = (dateStr: string) => {
    if (!dateStr) return "Membresía Desconocida";
    const date = new Date(dateStr + "T00:00:00");
    const mes = date.toLocaleString('es-VE', { month: 'long' });
    const anio = date.getFullYear();
    return `Membresía ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-green-600">
        <Loader2 className="animate-spin w-8 h-8 mb-4" />
        <p className="font-bold">Cargando estado de cuenta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border" style={{ borderColor: "var(--border)", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <FileText size={16} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Total Cargado</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>${totalCargado.toFixed(2)}</p>
        </div>

        <div className="bg-card rounded-2xl p-5 border" style={{ borderColor: "var(--border)", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Total Abonado</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>${totalPagadoAbonado.toFixed(2)}</p>
          {totalDescuentos > 0 && (
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Incluye <span className="text-purple-500 font-bold">${totalDescuentos.toFixed(2)}</span> en desc.
            </p>
          )}
        </div>

        <div className="bg-card rounded-2xl p-5 border" style={{ borderColor: "var(--border)", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600">
              <Clock size={16} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Saldo Pendiente</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>${totalPendiente.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista de Cuotas */}
      <div className="bg-card rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
          <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: "var(--foreground)" }}>Historial de Cuotas</h3>
        </div>
        
        {CuotasCalculadas.length === 0 ? (
          <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
            No hay cuotas registradas para este miembro.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {CuotasCalculadas.map(Cuota => {
              const isExpanded = expandedCuota === Cuota.id;
              
              return (
                <div key={Cuota.id} className="transition-colors hover:bg-[var(--muted)]">
                  <div 
                    className="px-5 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleCuota(Cuota.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--input-background)", color: "var(--foreground)" }}>
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: "var(--foreground)" }}>{formatMesCuota(Cuota.mes_cuota)}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Emitida: {new Date(Cuota.fecha + "T12:00:00Z").toLocaleDateString("es-VE")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold" style={{ color: "var(--foreground)" }}>${Cuota.montoOriginal.toFixed(2)}</p>
                        {Number(Cuota.pendiente) > 0 ? (
                          <span className="text-xs font-bold text-red-500">Debe ${Number(Cuota.pendiente).toFixed(2)}</span>
                        ) : (
                          <span className="text-xs font-bold text-green-600">Pagada</span>
                        )}
                      </div>
                      <div style={{ color: "var(--muted-foreground)" }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Detalles del Pago (Acordeón) */}
                  {isExpanded && (
                    <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>Detalles Financieros</p>
                      
                      {Cuota.pagosAplicados.length === 0 ? (
                        <p className="text-sm text-red-500 italic">No hay abonos registrados para esta cuota.</p>
                      ) : (
                        <div className="space-y-3">
                          {Cuota.pagosAplicados.map((vp: any) => (
                            <div key={`${vp.id_factura}-${vp.id_pago}`} className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-3.5 rounded-xl border" style={{ borderColor: "var(--border)" }}>
                              <div className="mb-2 sm:mb-0">
                                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                  {vp.pagoInfo?.metodo_pago} - Ref: {vp.pagoInfo?.referencia}
                                </p>
                                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                  Fecha: {new Date(vp.pagoInfo?.fecha + "T12:00:00Z").toLocaleDateString("es-VE")} | Estado: <span className="font-bold">{vp.pagoInfo?.estado}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                {Number(vp.descuento) > 0 && (
                                  <div>
                                    <p className="text-sm font-bold text-purple-600">+${Number(vp.descuento).toFixed(2)}</p>
                                    <p className="text-[0.65rem] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Descuento Pr. Pago</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-green-600">+${Number(vp.monto_aplicado).toFixed(2)}</p>
                                  <p className="text-[0.65rem] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Abono Efectivo</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="pt-2 mt-2 border-t flex justify-between" style={{ borderColor: "var(--border)" }}>
                            <span className="text-xs uppercase tracking-wide font-bold" style={{ color: "var(--muted-foreground)" }}>Resumen de la Cuota</span>
                            <div className="text-right text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                              Original: ${Cuota.montoOriginal.toFixed(2)} | Abonado: ${Cuota.pagadoEfectivo.toFixed(2)} | Descontado: ${Cuota.descuentoAplicado.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

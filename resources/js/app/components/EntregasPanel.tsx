import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Calculator, Save, AlertCircle, ArrowRightLeft, DollarSign } from "lucide-react";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../utils/dateUtils";

interface EntregasPanelProps {
  onBack?: () => void;
  tasaDia?: number;
}

export function EntregasPanel({ onBack, tasaDia = 1 }: EntregasPanelProps) {
  const [desde, setDesde] = useState(getFirstDayOfMonth());
  const [hasta, setHasta] = useState(getLastDayOfMonth());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [resumen, setResumen] = useState<any>(null);

  const [descuentosCxCUsd, setDescuentosCxCUsd] = useState<Record<number, number>>({});
  const [descuentosCxCBs, setDescuentosCxCBs] = useState<Record<number, number>>({});
  const [bancos, setBancos] = useState<any[]>([]);
  
  const [bancoUgaviUsd, setBancoUgaviUsd] = useState("");
  const [referenciaUgaviUsd, setReferenciaUgaviUsd] = useState("");
  const [bancoUgaviBs, setBancoUgaviBs] = useState("");
  const [referenciaUgaviBs, setReferenciaUgaviBs] = useState("");
  
  const [bancoClubUsd, setBancoClubUsd] = useState("");
  const [referenciaClubUsd, setReferenciaClubUsd] = useState("");
  const [bancoClubBs, setBancoClubBs] = useState("");
  const [referenciaClubBs, setReferenciaClubBs] = useState("");
  
  const [tasaCambio, setTasaCambio] = useState<number>(tasaDia);
  const [montoPagadoUgaviUsd, setMontoPagadoUgaviUsd] = useState<number>(0);
  const [montoPagadoUgaviBs, setMontoPagadoUgaviBs] = useState<number>(0);
  const [montoPagadoClubUsd, setMontoPagadoClubUsd] = useState<number>(0);
  const [montoPagadoClubBs, setMontoPagadoClubBs] = useState<number>(0);

  useEffect(() => {
    fetch("/api/finanzas/obligaciones/config")
      .then(res => res.json())
      .then(data => {
        if (data && data.bancos) setBancos(data.bancos);
      })
      .catch(err => console.error(err));
  }, []);

  const calcularResumen = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/entregas/resumen?desde=${desde}&hasta=${hasta}`);
      if (!res.ok) throw new Error("Error fetching resumen");
      const data = await res.json();
      setResumen(data);
      
      const maxDiscountUsd = Math.min(data.balance_cxc, data.ugavi_base_usd);
      
      // We no longer auto-set discounts since they must be selected manually per CxC
      setDescuentosCxCUsd({});
      setDescuentosCxCBs({});
      
      const totalUgaviUsd = data.ugavi_base_usd;
      const totalClubUsd = data.club_base_usd;
      const totalUgaviBs = data.ugavi_base_bs + (data.ugavi_base_cruces_bs || 0);
      const totalClubBs = data.club_base_bs + (data.club_base_cruces_bs || 0);
      
      setMontoPagadoUgaviUsd(totalUgaviUsd);
      setMontoPagadoUgaviBs(totalUgaviBs);
      setMontoPagadoClubUsd(totalClubUsd);
      setMontoPagadoClubBs(totalClubBs);
      
    } catch (error) {
      console.error(error);
      alert("Error al calcular el resumen");
    } finally {
      setLoading(false);
    }
  };

  const handleDescuentoCxCUsd = (id: number, val: number) => {
      setDescuentosCxCUsd(prev => {
          const next = { ...prev, [id]: val };
          const totalUsd = Object.values(next).reduce((a, b) => a + (Number(b) || 0), 0);
          if (resumen) {
              const totalUgaviUsdBase = resumen.ugavi_base_usd;
              const totalClubUsdBase = resumen.club_base_usd;
              
              let ugaviPayout = totalUgaviUsdBase - totalUsd;
              let clubPayout = totalClubUsdBase;
              if (ugaviPayout < 0) {
                  clubPayout += ugaviPayout;
                  ugaviPayout = 0;
              }
              setMontoPagadoUgaviUsd(Math.max(0, ugaviPayout));
              setMontoPagadoClubUsd(Math.max(0, clubPayout));
          }
          return next;
      });
  };

  const handleDescuentoCxCBs = (id: number, val: number) => {
      setDescuentosCxCBs(prev => {
          const next = { ...prev, [id]: val };
          const totalBs = Object.values(next).reduce((a, b) => a + (Number(b) || 0), 0);
          if (resumen) {
              const totalUgaviBsBase = resumen.ugavi_base_bs + (resumen.ugavi_base_cruces_bs || 0);
              const totalClubBsBase = resumen.club_base_bs + (resumen.club_base_cruces_bs || 0);
              
              let ugaviPayout = totalUgaviBsBase - totalBs;
              let clubPayout = totalClubBsBase;
              if (ugaviPayout < 0) {
                  clubPayout += ugaviPayout;
                  ugaviPayout = 0;
              }
              setMontoPagadoUgaviBs(Math.max(0, ugaviPayout));
              setMontoPagadoClubBs(Math.max(0, clubPayout));
          }
          return next;
      });
  };

  const handleSave = async () => {
    if (!resumen) return;
    if (resumen.pagos_count === 0) {
      alert("No hay pagos en este rango para entregar.");
      return;
    }
    
    let hasError = false;
    resumen.detalles_cxc.forEach((cxc: any) => {
        const descUsd = Number(descuentosCxCUsd[cxc.id] || 0);
        const descBs = Number(descuentosCxCBs[cxc.id] || 0);
        
        if (descUsd > 0 || descBs > 0) {
            let totalDescEnMonedaOriginal = 0;
            if (cxc.moneda === 'VES') {
                totalDescEnMonedaOriginal = descBs + (descUsd * tasaCambio);
            } else {
                totalDescEnMonedaOriginal = descUsd + (descBs / tasaCambio);
            }
            
            // Allow a small epsilon for floating point errors
            if (totalDescEnMonedaOriginal > Number(cxc.deuda) + 0.01) {
                alert(`Error: El descuento aplicado a la obligación "${cxc.descripcion}" supera su deuda pendiente de ${cxc.moneda === 'VES' ? 'Bs.' : '$'} ${Number(cxc.deuda).toFixed(2)}`);
                hasError = true;
            }
        }
    });

    if (hasError) return;
    
    const totalDiscountedUsd = Object.values(descuentosCxCUsd).reduce((a, b) => a + (Number(b) || 0), 0);
    const totalDiscountedBs = Object.values(descuentosCxCBs).reduce((a, b) => a + (Number(b) || 0), 0);
    
    const maxDiscountableUsd = resumen.ugavi_base_usd + resumen.club_base_usd;
    const maxDiscountableBs = resumen.ugavi_base_bs + (resumen.ugavi_base_cruces_bs || 0) + resumen.club_base_bs + (resumen.club_base_cruces_bs || 0);

    if (totalDiscountedUsd > maxDiscountableUsd) {
        alert(`Error: El total a descontar en divisas ($${totalDiscountedUsd.toFixed(2)}) supera el monto base a pagar en divisas ($${maxDiscountableUsd.toFixed(2)}).`);
        return;
    }
    
    if (totalDiscountedBs > maxDiscountableBs) {
        alert(`Error: El total a descontar en Bolívares (Bs. ${totalDiscountedBs.toFixed(2)}) supera el monto base a pagar en Bolívares (Bs. ${maxDiscountableBs.toFixed(2)}).`);
        return;
    }
    
    if (!confirm("¿Está seguro de registrar esta entrega? Los pagos seleccionados se marcarán como entregados y el saldo de CxC se actualizará.")) return;

    if (bancoUgaviUsd && !referenciaUgaviUsd) { alert("Falta referencia para UGAVI (USD)."); return; }
    if (bancoUgaviBs && !referenciaUgaviBs) { alert("Falta referencia para UGAVI (BS)."); return; }
    if (bancoClubUsd && !referenciaClubUsd) { alert("Falta referencia para Club (USD)."); return; }
    if (bancoClubBs && !referenciaClubBs) { alert("Falta referencia para Club (BS)."); return; }

    try {
      setSaving(true);
      const payload = {
        fecha: new Date().toISOString().split('T')[0],
        rango_desde: desde,
        rango_hasta: hasta,
        total_bs: resumen.total_bs,
        total_usd: resumen.total_usd,
        ugavi_base_bs: resumen.ugavi_base_bs,
        ugavi_base_usd: resumen.ugavi_base_usd,
        club_base_bs: resumen.club_base_bs,
        club_base_usd: resumen.club_base_usd,
        descuento_cruces_usd: Object.values(descuentosCxCUsd).reduce((a, b) => a + (Number(b) || 0), 0),
        descuento_cruces_bs: Object.values(descuentosCxCBs).reduce((a, b) => a + (Number(b) || 0), 0),
        descuentos_cxc_usd: descuentosCxCUsd,
        descuentos_cxc_bs: descuentosCxCBs,
        monto_pagado_ugavi_usd: montoPagadoUgaviUsd,
        monto_pagado_ugavi_bs: montoPagadoUgaviBs,
        monto_pagado_club_usd: montoPagadoClubUsd,
        monto_pagado_club_bs: montoPagadoClubBs,
        banco_ugavi_usd_id: bancoUgaviUsd || null,
        referencia_ugavi_usd: referenciaUgaviUsd,
        banco_ugavi_bs_id: bancoUgaviBs || null,
        referencia_ugavi_bs: referenciaUgaviBs,
        banco_club_usd_id: bancoClubUsd || null,
        referencia_club_usd: referenciaClubUsd,
        banco_club_bs_id: bancoClubBs || null,
        referencia_club_bs: referenciaClubBs,
        metodo_pago: 'Transferencia',
        tasa_cambio: tasaCambio
      };

      const res = await fetch('/api/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend Error Text:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || JSON.stringify(errorData.errors) || "Error guardando");
        } catch (parseError) {
          throw new Error(errorText.substring(0, 200)); // Show first 200 chars of HTML/Text error
        }
      }
      
      const successData = await res.json();
      alert("Entrega registrada con éxito.");
      setResumen(null);
      
      // Abrir el PDF de la entrega
      if (successData.id) {
        window.open(`/api/entregas/${successData.id}/pdf`, '_blank');
      }
    } catch (e: any) {
      console.error(e);
      alert("Hubo un error al registrar la entrega: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>Entregas a UGAVI</h1>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--muted-foreground)" }}>
              Calcula y registra las transferencias de los pagos recaudados
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-blue-500" />
          Configuración del Cálculo
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--muted-foreground)" }}>Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm border outline-none" style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--muted-foreground)" }}>Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm border outline-none" style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          </div>
          <button 
            onClick={calcularResumen} 
            disabled={loading}
            className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 h-[38px]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
            Calcular
          </button>
        </div>
      </div>
      
      {resumen && (() => {
        const totalDescUsd = Object.values(descuentosCxCUsd).reduce((a, b) => a + (Number(b) || 0), 0);
        const maxDescUsd = resumen.ugavi_base_usd + resumen.club_base_usd;
        const hasExcessUsd = totalDescUsd > maxDescUsd + 0.01;

        const totalDescBs = Object.values(descuentosCxCBs).reduce((a, b) => a + (Number(b) || 0), 0);
        const maxDescBs = resumen.ugavi_base_bs + (resumen.ugavi_base_cruces_bs || 0) + resumen.club_base_bs + (resumen.club_base_cruces_bs || 0);
        const hasExcessBs = totalDescBs > maxDescBs + 0.01;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Resultados del Cálculo */}
            <div className="space-y-4">
              
              {(hasExcessUsd || hasExcessBs) && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">Advertencia: Descuento Excesivo</p>
                    {hasExcessUsd && <p>El total descontado en Divisas (${totalDescUsd.toFixed(2)}) supera el monto que debes pagar (${maxDescUsd.toFixed(2)}).</p>}
                    {hasExcessBs && <p>El total descontado en Bolívares (Bs. {totalDescBs.toFixed(2)}) supera el monto que debes pagar (Bs. {maxDescBs.toFixed(2)}).</p>}
                  </div>
                </div>
              )}
              
              <div className="bg-card rounded-2xl p-6 border shadow-sm" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4">Resumen del Periodo</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Pagos Pendientes a Procesar</span>
                  <span className="font-bold">{resumen.pagos_count} pagos</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 font-bold mb-1">Pagos en Divisas (Efectivo/Zelle)</div>
                        <div className="font-black text-green-600 text-lg mb-2">${Number(resumen.total_usd).toFixed(2)}</div>
                        <div className="space-y-1 text-xs border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-blue-800">UGAVI (60%)</span>
                                <span className="font-black text-blue-800">${Number(resumen.ugavi_base_usd).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-orange-800">Club (20%)</span>
                                <span className="font-black text-orange-800">${Number(resumen.club_base_usd).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 font-bold mb-1">Pagos en Cruces (Bolívares)</div>
                        <div className="font-black text-purple-600 text-lg mb-2">Bs. {Number(resumen.total_cruces_bs).toFixed(2)}</div>
                        <div className="space-y-1 text-xs border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-blue-800">UGAVI (60%)</span>
                                <span className="font-black text-blue-800">Bs. {Number(resumen.ugavi_base_cruces_bs).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-orange-800">Club (20%)</span>
                                <span className="font-black text-orange-800">Bs. {Number(resumen.club_base_cruces_bs).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border md:col-span-2">
                        <div className="text-xs text-gray-500 font-bold mb-1">Pagos en Bolívares</div>
                        <div className="font-black text-blue-600 text-lg mb-2">Bs. {Number(resumen.total_bs).toFixed(2)}</div>
                        <div className="space-y-1 text-xs border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-blue-800">UGAVI (60%)</span>
                                <span className="font-black text-blue-800">Bs. {Number(resumen.ugavi_base_bs).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-orange-800">Club (20%)</span>
                                <span className="font-black text-orange-800">Bs. {Number(resumen.club_base_bs).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 shadow-sm max-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-black text-purple-800 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRightLeft size={16} />
                    Cuentas por Cobrar
                  </h3>
                  <div className="text-right">
                    <div className="text-sm font-black text-purple-700">
                      Total $: {Number(resumen.balance_cxc_usd).toFixed(2)}
                    </div>
                    <div className="text-sm font-black text-purple-700">
                      Total Bs: {Number(resumen.balance_cxc_bs).toFixed(2)}
                    </div>
                  </div>
              </div>
              <p className="text-xs text-purple-600 mb-4 shrink-0">
                Detalle de obligaciones pendientes por descuentos de cruces.
              </p>
              
              <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                  <table className="w-full text-xs text-left">
                      <thead>
                          <tr className="text-purple-800 border-b border-purple-200">
                              <th className="py-2">Fecha</th>
                              <th className="py-2">Descripción</th>
                              <th className="py-2">Deuda</th>
                              <th className="py-2 w-24">Desc. USD</th>
                              <th className="py-2 w-24">Desc. Bs</th>
                          </tr>
                      </thead>
                      <tbody>
                          {resumen.detalles_cxc?.map((cxc: any) => (
                              <tr key={cxc.id} className="border-b border-purple-100 last:border-0 hover:bg-purple-100/50 transition-colors">
                                  <td className="py-3 text-purple-600 whitespace-nowrap">{cxc.fecha_emision}</td>
                                  <td className="py-3 font-medium text-purple-900 pr-2">{cxc.descripcion || 'Sin descripción'}</td>
                                  <td className="py-3 font-bold text-purple-800">
                                      {cxc.moneda === 'VES' ? 'Bs. ' : '$'}{Number(cxc.deuda).toFixed(2)}
                                  </td>
                                  <td className="py-2 pr-2">
                                      <input 
                                          type="number" 
                                          value={descuentosCxCUsd[cxc.id] || ''} 
                                          onChange={e => handleDescuentoCxCUsd(cxc.id, Number(e.target.value))}
                                          className="w-full px-2 py-1 rounded border text-xs outline-none focus:ring-1 focus:ring-purple-500"
                                          placeholder="$0.00"
                                      />
                                  </td>
                                  <td className="py-2">
                                      <input 
                                          type="number" 
                                          value={descuentosCxCBs[cxc.id] || ''} 
                                          onChange={e => handleDescuentoCxCBs(cxc.id, Number(e.target.value))}
                                          className="w-full px-2 py-1 rounded border text-xs outline-none focus:ring-1 focus:ring-purple-500"
                                          placeholder="Bs 0.00"
                                      />
                                  </td>
                              </tr>
                          ))}
                          {(!resumen.detalles_cxc || resumen.detalles_cxc.length === 0) && (
                              <tr>
                                  <td colSpan={5} className="py-4 text-center text-purple-500 font-medium">No hay cuentas por cobrar pendientes.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
            </div>
          </div>

          {/* Formulario de Pago */}
          <div className="bg-card rounded-2xl p-6 border shadow-lg border-blue-200">
            <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2">
              <DollarSign size={20} />
              Liquidación a UGAVI
            </h3>

            <div className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Liquidacion Divisas */}
                  <div className="bg-gray-50 p-4 rounded-xl border">
                      <h4 className="text-sm font-black text-gray-800 mb-4">Liquidación UGAVI (Divisas)</h4>
                      <div className="space-y-4">
                          <div className="text-xs text-gray-500 italic">El descuento se aplica directamente en la tabla de arriba.</div>
                          <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                              <span className="text-xs font-bold text-blue-900">Neto a Pagar:</span>
                              <span className="text-lg font-black text-blue-700">${Math.max(0, montoPagadoUgaviUsd).toFixed(2)}</span>
                          </div>
                          <div>
                              <label className="block text-xs font-bold mb-1 text-gray-600">Cuenta Origen</label>
                              <select value={bancoUgaviUsd} onChange={e => setBancoUgaviUsd(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none mb-2 bg-white">
                                <option value="">-- No Registrar --</option>
                                {bancos.map(b => <option key={b.id} value={b.id}>{b.nombre} ({b.moneda})</option>)}
                              </select>
                              <input type="text" placeholder={bancoUgaviUsd ? "Ref. Requerida" : "Ref. Opcional"} value={referenciaUgaviUsd} onChange={e => setReferenciaUgaviUsd(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none bg-white"/>
                          </div>
                      </div>
                  </div>
                  
                  {/* Liquidacion Bs */}
                  <div className="bg-gray-50 p-4 rounded-xl border">
                      <h4 className="text-sm font-black text-gray-800 mb-4">Liquidación UGAVI (Bolívares)</h4>
                      <div className="space-y-4">
                          <div className="text-xs text-gray-500 italic">El descuento se aplica directamente en la tabla de arriba.</div>
                          <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                              <span className="text-xs font-bold text-blue-900">Neto a Pagar:</span>
                              <span className="text-lg font-black text-blue-700">Bs. {Math.max(0, montoPagadoUgaviBs).toFixed(2)}</span>
                          </div>
                          <div>
                              <label className="block text-xs font-bold mb-1 text-gray-600">Cuenta Origen</label>
                              <select value={bancoUgaviBs} onChange={e => setBancoUgaviBs(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none mb-2 bg-white">
                                <option value="">-- No Registrar --</option>
                                {bancos.map(b => <option key={b.id} value={b.id}>{b.nombre} ({b.moneda})</option>)}
                              </select>
                              <input type="text" placeholder={bancoUgaviBs ? "Ref. Requerida" : "Ref. Opcional"} value={referenciaUgaviBs} onChange={e => setReferenciaUgaviBs(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none bg-white"/>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Liquidacion Club Divisas */}
                  <div className="bg-gray-50 p-4 rounded-xl border">
                      <h4 className="text-sm font-black text-gray-800 mb-4">Liquidación Club (Divisas)</h4>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                              <span className="text-xs font-bold text-blue-900">Neto a Pagar:</span>
                              <span className="text-lg font-black text-blue-700">${Math.max(0, montoPagadoClubUsd).toFixed(2)}</span>
                          </div>
                          <div>
                              <label className="block text-xs font-bold mb-1 text-gray-600">Cuenta Origen</label>
                              <select value={bancoClubUsd} onChange={e => setBancoClubUsd(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none mb-2 bg-white">
                                <option value="">-- No Registrar --</option>
                                {bancos.map(b => <option key={b.id} value={b.id}>{b.nombre} ({b.moneda})</option>)}
                              </select>
                              <input type="text" placeholder={bancoClubUsd ? "Ref. Requerida" : "Ref. Opcional"} value={referenciaClubUsd} onChange={e => setReferenciaClubUsd(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none bg-white"/>
                          </div>
                      </div>
                  </div>
                  
                  {/* Liquidacion Club Bs */}
                  <div className="bg-gray-50 p-4 rounded-xl border">
                      <h4 className="text-sm font-black text-gray-800 mb-4">Liquidación Club (Bolívares)</h4>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                              <span className="text-xs font-bold text-blue-900">Neto a Pagar:</span>
                              <span className="text-lg font-black text-blue-700">Bs. {Math.max(0, montoPagadoClubBs).toFixed(2)}</span>
                          </div>
                          <div>
                              <label className="block text-xs font-bold mb-1 text-gray-600">Cuenta Origen</label>
                              <select value={bancoClubBs} onChange={e => setBancoClubBs(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none mb-2 bg-white">
                                <option value="">-- No Registrar --</option>
                                {bancos.map(b => <option key={b.id} value={b.id}>{b.nombre} ({b.moneda})</option>)}
                              </select>
                              <input type="text" placeholder={bancoClubBs ? "Ref. Requerida" : "Ref. Opcional"} value={referenciaClubBs} onChange={e => setReferenciaClubBs(e.target.value)} className="w-full px-3 py-1.5 rounded-lg text-xs border outline-none bg-white"/>
                          </div>
                      </div>
                  </div>
              </div>
                
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-600">Tasa de Cambio (Bs) del Pago</label>
                  <input 
                    type="number" 
                    value={tasaCambio} 
                    onChange={e => setTasaCambio(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-white"
                  />
                </div>

              <button 
                onClick={handleSave}
                disabled={saving || resumen.pagos_count === 0}
                className="w-full py-3 rounded-xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(to right, #2563eb, #1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Registrar Entrega
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

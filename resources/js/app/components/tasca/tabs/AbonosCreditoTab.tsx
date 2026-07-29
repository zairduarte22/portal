import { useState, useEffect, useMemo } from "react";
import { Search, DollarSign, Calendar, FileText, CheckSquare, Square, User, AlertTriangle, Activity, Users } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
export function AbonosCreditoTab({ onOpenDetalle }: { onOpenDetalle: (venta: any) => void }) {
  const [ventas, setVentas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  const [showAbonoModal, setShowAbonoModal] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [referencia, setReferencia] = useState("");
  const [tasa, setTasa] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadVentasCredito = () => {
    fetch("/api/tasca/ventas")
      .then(res => res.json())
      .then((data: any[]) => {
        setVentas(data.filter(v => v.estado === 'Credito' || v.estado === 'Parcial'));
      })
      .catch(console.error);

    fetch("/api/pagos/init")
      .then(res => res.json())
      .then(data => {
        if (data.tasa_dia) setTasa(data.tasa_dia.toString());
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadVentasCredito();
  }, []);

  const getClienteNombre = (v: any) => {
    if (v.miembro) {
      if (v.persona) return `${v.persona.nombre} (${v.miembro.razon_social})`;
      return v.miembro.razon_social;
    }
    if (v.cliente_foraneo) return v.cliente_foraneo.nombre;
    return "Desconocido";
  };

  const getSaldoPendiente = (v: any) => {
    const total = parseFloat(v.total) - parseFloat(v.descuento || "0");
    const pagado = v.pagos?.reduce((acc: number, p: any) => acc + parseFloat(p.pivot?.monto_abonado_usd || 0), 0) || 0;
    return Math.max(0, total - pagado);
  };

    const clientesAgrupados = useMemo(() => {
    const map = new Map<string, { clienteNombre: string, ventas: any[], totalDeuda: number, tieneVencidas: boolean, facturasVencidas: number }>();
    
    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    ventas.forEach(v => {
      const nombre = getClienteNombre(v);
      if (!map.has(nombre)) {
        map.set(nombre, { clienteNombre: nombre, ventas: [], totalDeuda: 0, tieneVencidas: false, facturasVencidas: 0 });
      }
      const group = map.get(nombre)!;
      group.ventas.push(v);
      group.totalDeuda += getSaldoPendiente(v);
      
      if (v.fecha_vencimiento) {
        // v.fecha_vencimiento is usually "YYYY-MM-DD"
        const vDate = new Date(v.fecha_vencimiento + 'T00:00:00');
        if (vDate < hoy) {
            group.tieneVencidas = true;
            group.facturasVencidas++;
        }
      }
    });

    const term = search.toLowerCase();
    return Array.from(map.values()).filter(g => g.clienteNombre.toLowerCase().includes(term)).sort((a, b) => b.totalDeuda - a.totalDeuda);
  }, [ventas, search]);

  const metricas = useMemo(() => {
    let deudaTotal = 0;
    let totalVencidas = 0;
    let clientesMora = 0;

    clientesAgrupados.forEach(g => {
        deudaTotal += g.totalDeuda;
        totalVencidas += g.facturasVencidas;
        if (g.tieneVencidas) clientesMora++;
    });

    return { deudaTotal, totalVencidas, clientesMora, totalClientes: clientesAgrupados.length };
  }, [clientesAgrupados]);

  const handleToggleInvoice = (vId: number) => {
    setSelectedInvoices(prev => {
      const isSelected = prev.includes(vId);
      const newSelection = isSelected ? prev.filter(id => id !== vId) : [...prev, vId];
      
      const suggestedAmount = newSelection.reduce((acc, id) => {
        const v = showAbonoModal?.ventas.find((v: any) => v.id === id);
        return acc + (v ? getSaldoPendiente(v) : 0);
      }, 0);
      
      setMontoAbono(suggestedAmount > 0 ? suggestedAmount.toFixed(2) : "");
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === showAbonoModal?.ventas.length) {
      setSelectedInvoices([]);
      setMontoAbono("");
    } else {
      const allIds = showAbonoModal?.ventas.map((v: any) => v.id) || [];
      setSelectedInvoices(allIds);
      const total = showAbonoModal?.ventas.reduce((acc: number, v: any) => acc + getSaldoPendiente(v), 0) || 0;
      setMontoAbono(total > 0 ? total.toFixed(2) : "");
    }
  };

  const handleAbonarMultiples = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAbonoModal || !montoAbono || parseFloat(montoAbono) <= 0 || selectedInvoices.length === 0) return;

    let amountToDistribute = parseFloat(montoAbono);
    const needsBs = metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo Bs');

    if ((metodoPago.includes('Transferencia') || metodoPago.includes('Zelle')) && !referencia) {
        return alert("La referencia es obligatoria para este método de pago");
    }

    const sortedInvoices = [...showAbonoModal.ventas]
      .filter(v => selectedInvoices.includes(v.id))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    setIsProcessing(true);

    try {
      for (const v of sortedInvoices) {
        if (amountToDistribute <= 0) break;

        const saldo = getSaldoPendiente(v);
        const pagoAsignado = Math.min(amountToDistribute, saldo);
        
        amountToDistribute -= pagoAsignado;
        amountToDistribute = Math.round(amountToDistribute * 100) / 100;

        const res = await fetch(`/api/tasca/ventas/${v.id}/pagar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pagos: [
              {
                metodo_pago: metodoPago,
                monto_usd: pagoAsignado,
                tasa: parseFloat(tasa),
                monto_bs: needsBs ? pagoAsignado * parseFloat(tasa) : 0,
                referencia: referencia
              }
            ]
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Error al procesar el abono en la factura #${v.id}`);
        }
      }

      setShowAbonoModal(null);
      setMontoAbono("");
      setReferencia("");
      setSelectedInvoices([]);
      loadVentasCredito();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generarReporteGeneral = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("REPORTE GENERAL DE CRÉDITOS", 14, 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Fecha de emisión: ${format(new Date(), 'dd/MM/yyyy - hh:mm a')}`, 14, 32);
    
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(1);
    doc.line(14, 36, 196, 36);

    let totalDeudaGlobal = 0;
    const tableData = [] as any[];
    
    clientesAgrupados.forEach(grupo => {
      totalDeudaGlobal += grupo.totalDeuda;
      tableData.push([
         grupo.clienteNombre,
         grupo.ventas.length.toString(),
         `$${grupo.totalDeuda.toFixed(2)}`
      ]);
    });
    
    autoTable(doc, {
      startY: 45,
      head: [['Cliente', 'Facturas Pendientes', 'Total Deuda']],
      body: tableData,
      foot: [[
        { content: 'Total de Crédito Pendiente por Cobrar:', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 0, 0] } },
        { content: `$${totalDeudaGlobal.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] } }
      ]],
      theme: 'striped',
      styles: { fontSize: 11, textColor: [0, 0, 0], cellPadding: 5, fontStyle: "bold", valign: 'middle' },
      headStyles: { fillColor: [10, 65, 35], fontSize: 12, fontStyle: "bold", textColor: [255, 255, 255], valign: 'middle', halign: 'center' },
      footStyles: { fillColor: [241, 245, 249], fontSize: 13 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right', textColor: [185, 28, 28] }
      }
    });
    
    doc.save(`Reporte_General_Creditos_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    setShowReportModal(false);
  };

  const generarReporteDeudores = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("REPORTE DE DEUDORES - UGAVI BAR", 14, 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Fecha de emisión: ${format(new Date(), 'dd/MM/yyyy - hh:mm a')}`, 14, 32);
    
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(1);
    doc.line(14, 36, 196, 36);

    let startY = 45;
    let totalDeudaGlobal = 0;
    
    clientesAgrupados.forEach(grupo => {
      totalDeudaGlobal += grupo.totalDeuda;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text(grupo.clienteNombre, 14, startY);
      
      const tableData = [] as any[];
      
      grupo.ventas.forEach((v: any) => {
         const pagado = v.pagos?.reduce((acc: number, p: any) => acc + parseFloat(p.pivot?.monto_abonado_usd || 0), 0) || 0;
         const totalFactura = parseFloat(v.total) - parseFloat(v.descuento || "0");
         const saldo = getSaldoPendiente(v);
         
         const productosStr = v.detalles?.map((d:any) => `${d.cantidad}x ${d.producto?.nombre_completo || 'Producto'}`).join(', ') || 'Sin detalles';
         
         tableData.push([
            `#${v.id}`,
            format(new Date(v.fecha), 'dd/MM/yyyy'),
            productosStr,
            `$${totalFactura.toFixed(2)}`,
            `$${pagado.toFixed(2)}`,
            `$${saldo.toFixed(2)}`
         ]);
      });
      
      autoTable(doc, {
        startY: startY + 5,
        head: [['Factura', 'Fecha', 'Detalles de Compra', 'Total', 'Abonado', 'Saldo']],
        body: tableData,
        foot: [[
          { content: 'Total de Crédito Pendiente por Cobrar:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 0, 0] } },
          { content: `$${grupo.totalDeuda.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] } }
        ]],
        theme: 'striped',
        styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 4, fontStyle: "bold", valign: 'middle' },
        headStyles: { fillColor: [10, 65, 35], fontSize: 11, fontStyle: "bold", textColor: [255, 255, 255], valign: 'middle', halign: 'center' },
        footStyles: { fillColor: [241, 245, 249], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'center' },
          2: { cellWidth: 'auto', halign: 'left' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right', textColor: [185, 28, 28] }
        }
      });
      
      startY = (doc as any).lastAutoTable.finalY + 10;
      
      if (startY > 250) {
         doc.addPage();
         startY = 20;
      }
    });
    
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(1);
    doc.rect(14, startY, 182, 20, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Créditos Pendientes Por Cobro:", 20, startY + 14);
    
    const globalText = `$${totalDeudaGlobal.toFixed(2)}`;
    doc.setTextColor(185, 28, 28);
    const gTextWidth = doc.getTextWidth(globalText);
    doc.text(globalText, 190 - gTextWidth, startY + 14);
    
    doc.save(`Reporte_Deudores_UGAVIBAR_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    setShowReportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-3xl p-5 relative overflow-hidden group" style={{ borderColor: "var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Deuda Pendiente</p>
              <h3 className="text-2xl font-black text-gray-900">${metricas.deudaTotal.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={100} />
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-5 relative overflow-hidden group" style={{ borderColor: "var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Con Deuda</p>
              <h3 className="text-2xl font-black text-gray-900">{metricas.totalClientes} Clientes</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={100} />
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-5 relative overflow-hidden group" style={{ borderColor: "var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vencidas</p>
              <h3 className="text-2xl font-black text-red-600">{metricas.totalVencidas} Facturas</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity text-red-900">
            <FileText size={100} />
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-5 relative overflow-hidden group" style={{ borderColor: "var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">En Mora</p>
              <h3 className="text-2xl font-black text-orange-600">{metricas.clientesMora} Clientes</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity text-orange-900">
            <AlertTriangle size={100} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-shadow shadow-sm"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-card border text-foreground rounded-2xl transition-colors shadow-sm whitespace-nowrap"
          style={{ borderColor: "var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <FileText size={18} className="text-red-500" />
          <span>Descargar PDF</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-3xl border overflow-hidden shadow-sm" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Facturas Pendientes</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Deuda Total</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {clientesAgrupados.map((grupo, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl">
                      <User size={18} />
                    </div>
                    <span className="font-bold text-gray-800">{grupo.clienteNombre}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center font-medium text-gray-600">
                  {grupo.ventas.length}
                </td>
                <td className="px-6 py-5 text-center">
                  {grupo.tieneVencidas ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
                      <AlertTriangle size={12} /> {grupo.facturasVencidas} Vencidas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      Al día
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right font-black text-red-600 text-lg">
                  ${grupo.totalDeuda.toFixed(2)}
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => {
                      setShowAbonoModal(grupo);
                      setSelectedInvoices([]);
                      setMontoAbono("");
                    }}
                    className="inline-flex justify-center items-center gap-2 px-4 py-2 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md text-sm"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                  >
                    <DollarSign size={16} /> Pagar
                  </button>
                </td>
              </tr>
            ))}
            {clientesAgrupados.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                  No hay clientes con saldo pendiente para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden flex flex-col gap-4">
        {clientesAgrupados.map((grupo, idx) => (
          <div key={idx} className={`bg-card rounded-3xl p-5 shadow-sm border relative overflow-hidden ${grupo.tieneVencidas ? 'border-red-200 shadow-red-500/10' : ''}`} style={{ borderColor: grupo.tieneVencidas ? '#fca5a5' : 'var(--border)' }}>
            {grupo.tieneVencidas && (
              <div className="absolute top-0 right-0 bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-red-100 flex items-center gap-1">
                <AlertTriangle size={10} /> En Mora
              </div>
            )}
            
            <div className="flex items-start gap-3 mb-4 mt-2">
              <div className={`p-3 rounded-2xl ${grupo.tieneVencidas ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                <User size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{grupo.clienteNombre}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{grupo.ventas.length} factura(s) pendiente(s)</p>
                {grupo.tieneVencidas && (
                  <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> {grupo.facturasVencidas} factura(s) vencida(s)</p>
                )}
              </div>
            </div>
            
            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-50 mb-4 text-center">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Deuda Total</p>
              <p className="text-3xl font-black text-red-600">${grupo.totalDeuda.toFixed(2)}</p>
            </div>
            
            <button 
              onClick={() => {
                setShowAbonoModal(grupo);
                setSelectedInvoices([]);
                setMontoAbono("");
              }}
              className="w-full py-3 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
            >
              <DollarSign size={18} /> Pagar Facturas
            </button>
          </div>
        ))}
        {clientesAgrupados.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-card rounded-3xl border" style={{ borderColor: 'var(--border)' }}>
            No hay clientes con saldo pendiente.
          </div>
        )}
      </div>

      {showAbonoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm lg:backdrop-blur-none">
          <div className="w-full max-w-2xl p-6 rounded-2xl shadow-xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "var(--card)" }}>
            <h2 className="text-xl font-bold mb-2">Registrar Abono: {showAbonoModal.clienteNombre}</h2>
            <p className="text-sm text-gray-500 mb-6">
              Deuda Total: <span className="font-bold text-red-600">${showAbonoModal.totalDeuda.toFixed(2)}</span>
            </p>

            <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-2 border-y py-4">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg mb-2 cursor-pointer border" onClick={handleSelectAll}>
                <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
                  {selectedInvoices.length === showAbonoModal.ventas.length ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-gray-400" size={18} />}
                  Seleccionar Todas
                </div>
                <span className="text-xs text-gray-500">{selectedInvoices.length} seleccionadas</span>
              </div>
              
              {showAbonoModal.ventas.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map((v: any) => {
                const saldo = getSaldoPendiente(v);
                const isSelected = selectedInvoices.includes(v.id);
                return (
                  <div key={v.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleToggleInvoice(v.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-gray-400" size={18} />}
                      <div>
                        <p className="font-semibold text-sm">Factura #{v.id}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12}/> {format(new Date(v.fecha), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                       <button onClick={(e) => { e.stopPropagation(); onOpenDetalle(v); }} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 bg-white border px-2 py-1 rounded shadow-sm">
                         <FileText size={12}/> Ver Detalles
                       </button>
                       <span className="font-bold text-red-600 block w-20 text-right">${saldo.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAbonarMultiples} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto a Abonar (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input required type="number" step="0.01" min="0.01" 
                      className="w-full pl-10 p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 font-bold"
                      style={{ backgroundColor: "var(--background)" }}
                      value={montoAbono} onChange={e => setMontoAbono(e.target.value)} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Método de Pago</label>
                  <select 
                    value={metodoPago}
                    onChange={e => setMetodoPago(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Seleccione un método</option>
                    <option value="Efectivo Divisas">Efectivo Divisas</option>
                    <option value="Pago Movil/Transferencia">Pago Móvil / Transferencia</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Punto de Venta/POS">Punto de Venta / POS</option>
                    <option value="Efectivo Bs.">Efectivo Bs.</option>
                  </select>
                </div>
              </div>

              {!metodoPago.includes('Efectivo') && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Referencia</label>
                  <input 
                    type="text" 
                    value={referencia} 
                    onChange={e => setReferencia(e.target.value)} 
                    placeholder={(metodoPago.includes('Transferencia') || metodoPago.includes('Zelle')) ? 'Obligatorio' : 'Opcional'}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {montoAbono && (metodoPago.includes('Transferencia') || metodoPago.includes('POS') || metodoPago.includes('Efectivo Bs') || metodoPago.includes('Pago Móvil')) && (
                  <p className="text-xs text-gray-500 font-bold mb-3 border-l-4 border-blue-500 pl-3">Equivalente: Bs. {(parseFloat(montoAbono) * parseFloat(tasa)).toFixed(2)} (Tasa: {tasa})</p>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
                <button type="button" onClick={() => setShowAbonoModal(null)} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold" disabled={isProcessing}>
                  Cancelar
                </button>
                <button type="submit" disabled={isProcessing || selectedInvoices.length === 0 || !metodoPago} className="px-5 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg">
                  {isProcessing ? 'Procesando Abonos...' : 'Registrar Abono Multiple'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm lg:backdrop-blur-none">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FileText size={24} />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Descargar Reporte PDF</h2>
              <p className="text-sm text-gray-500 text-center mb-6">¿Qué tipo de reporte deseas generar?</p>
              
              <div className="space-y-3">
                <button 
                  onClick={generarReporteGeneral}
                  className="w-full text-left p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-colors group"
                >
                  <h3 className="font-bold text-gray-800 group-hover:text-green-700">Reporte General (Resumido)</h3>
                  <p className="text-xs text-gray-500 mt-1">Muestra solo la lista de clientes, cantidad de facturas pendientes y el total que debe cada uno.</p>
                </button>

                <button 
                  onClick={generarReporteDeudores}
                  className="w-full text-left p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-700">Reporte Completo (Detallado)</h3>
                  <p className="text-xs text-gray-500 mt-1">Muestra cada cliente desglosado con cada una de sus facturas y lo que compró.</p>
                </button>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

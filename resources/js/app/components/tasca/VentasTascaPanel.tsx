import { useState, useEffect } from "react";
import { Plus, Search, Store, FileText, Ban, DollarSign, CreditCard, Activity, Printer } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

import { NuevaVentaModal } from "./NuevaVentaModal";
import { useNavigate } from "react-router-dom";
import { AbonosCreditoTab } from "./tabs/AbonosCreditoTab";
import { InventarioRapidoTab } from "./tabs/InventarioRapidoTab";
import { DetalleFacturaModal } from "./DetalleFacturaModal";
import { ReporteVentasModal } from "./ReporteVentasModal";

export function VentasTascaPanel() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [showNuevaVenta, setShowNuevaVenta] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'historial' | 'abonos' | 'inventario'>('historial');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const navigate = useNavigate();

  const loadVentas = () => {
    const query = `?start_date=${startDate}&end_date=${endDate}`;
    fetch(`/api/tasca/ventas${query}`)
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(console.error);

    fetch(`/api/tasca/ventas/estadisticas${query}`)
      .then(res => res.json())
      .then(data => setEstadisticas(data))
      .catch(console.error);
  };

  useEffect(() => {
    loadVentas();
  }, [startDate, endDate]);

  const handleAnular = (id: number) => {
    if (confirm("¿Estás seguro de anular esta venta? El stock se devolverá al inventario.")) {
      fetch(`/api/tasca/ventas/${id}/anular`, { method: "POST" })
        .then(async res => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Error al anular");
          }
          loadVentas();
        })
        .catch(err => alert(err.message));
    }
  };

  const getClienteNombre = (v: any) => {
    if (v.cliente_foraneo) return v.cliente_foraneo.nombre + " (Foráneo)";
    if (v.miembro) return v.miembro.razon_social + " (Miembro)";
    return "Sin Cliente";
  };

  const handleVerDetalles = (v: any) => {
    if (v.estado === 'Pendiente') {
      navigate(`/gestion/ventas-tasca/${v.id}`);
    } else {
      setVentaSeleccionada(v);
    }
  };

  const handleImprimirTicket = async (v: any) => {
    try {
      const res = await fetch(`/api/tasca/ventas/${v.id}`);
      if (!res.ok) throw new Error("Error al obtener detalles");
      const ventaDetallada = await res.json();
      
      const drawTicket = (docToDraw: any, isDummy: boolean) => {
          const marginX = 4;
          let cursorY = 10;
          const pageWidth = 80;

          const printCenter = (text: string, y: number, size: number, isBold = false) => {
            docToDraw.setFontSize(size);
            docToDraw.setFont("helvetica", isBold ? "bold" : "normal");
            const textWidth = docToDraw.getTextWidth(text);
            docToDraw.text(text, (pageWidth - textWidth) / 2, y);
          };

          const printDashedLine = () => {
              if (!isDummy) {
                  docToDraw.setLineDashPattern([1, 1], 0);
                  docToDraw.line(marginX, cursorY, pageWidth - marginX, cursorY);
                  docToDraw.setLineDashPattern([], 0);
              }
          }

          printCenter("Unión de Ganaderos del Municipio", cursorY, 10, true);
          cursorY += 4;
          printCenter("Rosario de Perijá - TASCA", cursorY, 10, true);
          cursorY += 5;
          
          printCenter("RIF: J-07002231-0", cursorY, 8);
          cursorY += 4;
          printCenter("Tlf: 02634511191", cursorY, 8);
          cursorY += 4;

          const addressLines = docToDraw.splitTextToSize("Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora. Villa del Rosario Municipio Rosario de Perijá", pageWidth - marginX * 2);
          docToDraw.setFont("helvetica", "normal");
          docToDraw.setFontSize(7);
          addressLines.forEach((line: string) => {
            printCenter(line, cursorY, 7);
            cursorY += 3;
          });

          cursorY += 2;
          printDashedLine();
          cursorY += 5;

          printCenter("TICKET DE VENTA TASCA", cursorY, 11, true);
          cursorY += 6;

          docToDraw.setFontSize(8);
          docToDraw.setFont("helvetica", "normal");
          docToDraw.text(`Ref: ${ventaDetallada.id}`, marginX, cursorY);
          const dateText = `Fecha: ${format(new Date(ventaDetallada.fecha), 'dd/MM/yyyy')}`;
          docToDraw.text(dateText, pageWidth - marginX - docToDraw.getTextWidth(dateText), cursorY);
          cursorY += 4;
          docToDraw.text(`Estado: ${ventaDetallada.estado}`, marginX, cursorY);
          docToDraw.text(`Caja: Tasca`, pageWidth - marginX - docToDraw.getTextWidth(`Caja: Tasca`), cursorY);
          cursorY += 5;

          printDashedLine();
          cursorY += 5;

          docToDraw.setFont("helvetica", "bold");
          docToDraw.text("CLIENTE:", marginX, cursorY);
          cursorY += 4;
          docToDraw.setFont("helvetica", "normal");
          const clienteName = ventaDetallada.miembro ? ventaDetallada.miembro.razon_social : (ventaDetallada.clienteForaneo ? ventaDetallada.clienteForaneo.nombre : "Consumidor Final");
          const clienteRif = ventaDetallada.miembro ? ventaDetallada.miembro.rif : (ventaDetallada.clienteForaneo ? ventaDetallada.clienteForaneo.cedula_rif : "");
          
          const nameLines = docToDraw.splitTextToSize(clienteName, pageWidth - marginX * 2);
          nameLines.forEach((line: string) => {
            docToDraw.text(line, marginX, cursorY);
            cursorY += 3;
          });
          if (clienteRif) {
            docToDraw.text(`RIF/C.I: ${clienteRif}`, marginX, cursorY);
            cursorY += 4;
          }
          
          const metodoPrincipal = ventaDetallada.pagos && ventaDetallada.pagos.length > 0 ? ventaDetallada.pagos[0].metodo_pago : 'N/A';
          docToDraw.text(`Método: ${metodoPrincipal}`, marginX, cursorY);
          cursorY += 5;

          if (ventaDetallada.autorizador) {
              docToDraw.setFont("helvetica", "bold");
              docToDraw.text("AUTORIZADO POR:", marginX, cursorY);
              cursorY += 4;
              docToDraw.setFont("helvetica", "normal");
              const authLines = docToDraw.splitTextToSize(ventaDetallada.autorizador.nombre, pageWidth - marginX * 2);
              authLines.forEach((line: string) => {
                docToDraw.text(line, marginX, cursorY);
                cursorY += 3;
              });
              cursorY += 2;
          }

          printDashedLine();
          cursorY += 5;

          docToDraw.setFont("helvetica", "bold");
          docToDraw.text("DESCRIPCIÓN", marginX, cursorY);
          docToDraw.text("CANT", 38, cursorY);
          docToDraw.text("USD", 50, cursorY);
          docToDraw.text("BS", pageWidth - marginX - docToDraw.getTextWidth("BS"), cursorY);
          cursorY += 4;
          docToDraw.setFont("helvetica", "normal");

          if (ventaDetallada.detalles) {
              const tasaBcv = Number(ventaDetallada.tasa_bcv || 36.5);
              ventaDetallada.detalles.forEach((det: any) => {
                 const nombreInsumo = det.producto?.insumo?.nombre || "";
                 const nombreProd = det.producto?.nombre_completo || det.producto?.nombre || "Producto";
                 const nombre = nombreInsumo ? `${nombreInsumo} - ${nombreProd}` : nombreProd;
                 const nombreLines = docToDraw.splitTextToSize(nombre, 38 - marginX - 2);
                 
                 let firstLine = true;
                 nombreLines.forEach((line: string) => {
                     docToDraw.text(line, marginX, cursorY);
                     if (firstLine) {
                         const qtyStr = String(det.cantidad);
                         docToDraw.text(qtyStr, 38 + docToDraw.getTextWidth("CANT")/2 - docToDraw.getTextWidth(qtyStr)/2, cursorY);
                         const subUsd = Number(det.subtotal).toFixed(2);
                         docToDraw.text(subUsd, 50 + docToDraw.getTextWidth("USD")/2 - docToDraw.getTextWidth(subUsd)/2, cursorY);
                         const subBs = (Number(det.subtotal) * tasaBcv).toFixed(2);
                         docToDraw.text(subBs, pageWidth - marginX - docToDraw.getTextWidth(subBs), cursorY);
                         firstLine = false;
                     }
                     cursorY += 3;
                 });
                 cursorY += 1;
              });
          }

          cursorY += 2;
          printDashedLine();
          cursorY += 5;

          docToDraw.setFont("helvetica", "bold");
          docToDraw.text("TOTAL:", marginX, cursorY);
          
          const tasaBcv = Number(ventaDetallada.tasa_bcv || 36.5);
          const totalUsdStr = Number(ventaDetallada.total).toFixed(2);
          const totalBsStr = (Number(ventaDetallada.total) * tasaBcv).toFixed(2);

          docToDraw.text(totalUsdStr, 50 + docToDraw.getTextWidth("USD")/2 - docToDraw.getTextWidth(totalUsdStr)/2, cursorY);
          docToDraw.text(totalBsStr, pageWidth - marginX - docToDraw.getTextWidth(totalBsStr), cursorY);
          cursorY += 5;

          docToDraw.setFontSize(7);
          docToDraw.setFont("helvetica", "normal");
          docToDraw.text(`Tasa BCV del día: Bs. ${tasaBcv.toFixed(2)}`, marginX, cursorY);
          cursorY += 5;
          docToDraw.setFontSize(8);
          
          let totalPagadoBs = 0;
          let totalPagadoUsd = 0;
          if (ventaDetallada.pagos) {
             ventaDetallada.pagos.forEach((p:any) => {
                 if (Number(p.monto_bs) > 0) {
                     totalPagadoBs += Number(p.monto_bs);
                 } else {
                     totalPagadoUsd += Number(p.monto_usd || 0);
                 }
             });
          }
          
          if (totalPagadoUsd > 0 || totalPagadoBs > 0) {
             docToDraw.setFont("helvetica", "bold");
             cursorY += 2;
             docToDraw.text("DETALLE DE PAGO", marginX, cursorY);
             cursorY += 4;
             docToDraw.setFont("helvetica", "normal");
             if (totalPagadoUsd > 0) {
                 docToDraw.text("Pagado en USD:", marginX, cursorY);
                 const pagoUsdStr = `$${totalPagadoUsd.toFixed(2)}`;
                 docToDraw.text(pagoUsdStr, pageWidth - marginX - docToDraw.getTextWidth(pagoUsdStr), cursorY);
                 cursorY += 4;
             }
             if (totalPagadoBs > 0) {
                 docToDraw.text("Pagado en Bs:", marginX, cursorY);
                 const pagoBsStr = `Bs. ${totalPagadoBs.toFixed(2)}`;
                 docToDraw.text(pagoBsStr, pageWidth - marginX - docToDraw.getTextWidth(pagoBsStr), cursorY);
                 cursorY += 4;
             }
             cursorY += 1;
          }
          
          cursorY += 2;
          printCenter("*** GRACIAS POR SU COMPRA ***", cursorY, 9, true);
          cursorY += 4;
          
          const footerLines = docToDraw.splitTextToSize("Este documento es un comprobante de venta interno de la Tasca y carece de validez fiscal o tributaria.", pageWidth - marginX * 2);
          docToDraw.setFontSize(7);
          docToDraw.setFont("helvetica", "normal");
          footerLines.forEach((line: string) => {
            printCenter(line, cursorY, 7);
            cursorY += 3;
          });
          
          if (['credito', 'parcial'].includes(ventaDetallada.estado.toLowerCase())) {
              cursorY += 8;
              printDashedLine();
              cursorY += 4;
              printCenter("Firma del Cliente", cursorY, 8);
              cursorY += 4;
              printCenter(`Saldo pendiente: $${Number(ventaDetallada.pendiente || 0).toFixed(2)}`, cursorY, 8, true);
          }

          cursorY += 6;
          printCenter("SIGAMA", cursorY, 8, true);
          cursorY += 4;
          printCenter("Sistema de Gestión Administrativa", cursorY, 7);
          cursorY += 4;
          printCenter(`y Membresías de Agroproductores`, cursorY, 7);
          cursorY += 6;

          return cursorY;
      };

      const dummyDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 500] });
      const finalHeight = drawTicket(dummyDoc, true);
      
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, finalHeight] });
      drawTicket(doc, false);

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
    } catch (e) {
       console.error(e);
       alert("Error generando el ticket.");
    }
  };

  const filtered = ventas.filter(v => {
    const matchSearch = getClienteNombre(v).toLowerCase().includes(search.toLowerCase()) || 
                        v.id.toString().includes(search);
    const matchEstado = filterEstado === "" || v.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Store size={28} className="text-green-600" />
            Ventas de Tasca
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Facturación y cobro en la tasca</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors font-bold shadow-sm"
          >
            <FileText size={18} /> Reporte de Ventas
          </button>
          <button 
            onClick={() => setShowNuevaVenta(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-md transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            <Plus size={18} /> Nueva Venta
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase">Desde</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="p-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase">Hasta</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="p-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        <button 
          onClick={() => setActiveTab('historial')} 
          className={`pb-3 px-6 text-sm font-bold ${activeTab === 'historial' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Historial de Ventas
        </button>
        <button 
          onClick={() => setActiveTab('abonos')} 
          className={`pb-3 px-6 text-sm font-bold ${activeTab === 'abonos' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Abonos a Crédito
        </button>
        <button 
          onClick={() => setActiveTab('inventario')} 
          className={`pb-3 px-6 text-sm font-bold ${activeTab === 'inventario' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Inventario Rápido
        </button>
      </div>

      {activeTab === 'historial' ? (
        <>
          {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 rounded-2xl border flex items-center gap-4 bg-white shadow-sm">
            <div className="p-4 bg-green-100 text-green-600 rounded-xl"><DollarSign size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ventas del Período</p>
              <h3 className="text-2xl font-black">${parseFloat(estadisticas.ventas_dia_usd).toFixed(2)}</h3>
            </div>
          </div>
          <div className="p-6 rounded-2xl border flex items-center gap-4 bg-white shadow-sm">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">A Crédito (Período)</p>
              <h3 className="text-2xl font-black">${parseFloat(estadisticas.credito_otorgado_hoy).toFixed(2)}</h3>
            </div>
          </div>
          <div className="p-6 rounded-2xl border flex items-center gap-4 bg-white shadow-sm">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Activity size={24} /></div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Desglose de Pagos</p>
              <div className="text-xs space-y-1">
                {Object.entries(estadisticas.desglose_pagos || {}).map(([metodo, monto]: any) => (
                  <div key={metodo} className="flex justify-between font-medium">
                    <span>{metodo}</span>
                    <span className="text-gray-700">${parseFloat(monto).toFixed(2)}</span>
                  </div>
                ))}
                {Object.keys(estadisticas.desglose_pagos || {}).length === 0 && (
                  <span className="text-gray-400">Sin pagos registrados hoy.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente o ID de venta..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-64">
            <select
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Pagada">Pagada</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Crédito">Crédito</option>
              <option value="Anulada">Anulada</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                <th className="pb-3 font-semibold text-sm"># Venta</th>
                <th className="pb-3 font-semibold text-sm">Fecha</th>
                <th className="pb-3 font-semibold text-sm">Cliente</th>
                <th className="pb-3 font-semibold text-sm">Estado</th>
                <th className="pb-3 font-semibold text-sm">Total (USD)</th>
                <th className="pb-3 font-semibold text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-gray-50/5">
                  <td className="py-3 font-medium">#{v.id}</td>
                  <td className="py-3 text-sm">{format(new Date(v.fecha), 'dd/MM/yyyy')}</td>
                  <td className="py-3 text-sm font-medium">{getClienteNombre(v)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      v.estado === 'Pagada' ? 'bg-green-100 text-green-700' :
                      v.estado === 'Credito' ? 'bg-blue-100 text-blue-700' :
                      v.estado === 'Parcial' ? 'bg-orange-100 text-orange-700' :
                      v.estado === 'Anulada' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {v.estado}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-gray-800">${(parseFloat(v.total) - parseFloat(v.descuento || "0")).toFixed(2)}</td>
                  <td className="py-3">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => handleVerDetalles(v)} className="p-2 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Ver Detalles">
                        <FileText size={16} />
                      </button>
                      <button onClick={() => handleImprimirTicket(v)} className="p-2 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title="Imprimir Ticket">
                        <Printer size={16} />
                      </button>
                      {v.estado !== 'Anulada' && (
                        <button onClick={() => handleAnular(v.id)} className="p-2 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Anular Venta">
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No hay ventas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : activeTab === 'abonos' ? (
        <AbonosCreditoTab onOpenDetalle={(v) => setVentaSeleccionada(v)} />
      ) : (
        <InventarioRapidoTab />
      )}

      {showNuevaVenta && (
        <NuevaVentaModal
          onClose={() => setShowNuevaVenta(false)}
          onVentaCreated={(ventaId) => {
            setShowNuevaVenta(false);
            navigate(`/gestion/ventas-tasca/${ventaId}`);
          }}
        />
      )}

      {ventaSeleccionada && (
        <DetalleFacturaModal 
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}

      {showReportModal && (
        <ReporteVentasModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}

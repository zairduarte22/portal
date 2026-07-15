import React, { useState } from "react";
import { format } from "date-fns";
import { FileText, Calendar, Receipt, X } from "lucide-react";
import { jsPDF } from "jspdf";

export function ReporteVentasModal({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportFormat, setReportFormat] = useState<"carta" | "ticket">("carta");

  const handleGenerate = async () => {
    if (reportFormat === "carta") {
        window.open(`/api/tasca/ventas/reporte-pdf?start_date=${startDate}&end_date=${endDate}&format=carta`, '_blank');
        onClose();
        return;
    }

    try {
        const res = await fetch(`/api/tasca/ventas/reporte-data?start_date=${startDate}&end_date=${endDate}`);
        if (!res.ok) throw new Error("Error obteniendo datos");
        const data = await res.json();
        
        const resUser = await fetch('/api/me', { headers: { 'Accept': 'application/json' } });
        let userName = "Administrador";
        if (resUser.ok) {
            const userData = await resUser.json();
            userName = userData.name || "Administrador";
        }

        const drawTicket = (docToDraw: any, isDummy: boolean) => {
            let cursorY = 10;
            const marginX = 4;
            const pageWidth = 80;

            const printCenter = (text: string, y: number, size: number, isBold = false) => {
              docToDraw.setFontSize(size);
              docToDraw.setFont("helvetica", isBold ? "bold" : "normal");
              const textWidth = docToDraw.getTextWidth(text);
              docToDraw.text(text, (pageWidth - textWidth) / 2, y);
            };
            
            const printDashedLine = () => {
               cursorY += 2;
               if (!isDummy) {
                   docToDraw.setLineDashPattern([1, 1], 0);
                   docToDraw.line(marginX, cursorY, pageWidth - marginX, cursorY);
                   docToDraw.setLineDashPattern([], 0);
               }
               cursorY += 4;
            };

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

            printDashedLine();
            
            printCenter("REPORTE DE CIERRE DE CAJA", cursorY, 11, true);
            cursorY += 5;
            
            const rangoTexto = startDate === endDate ? format(new Date(startDate + "T00:00:00"), 'dd/MM/yyyy') : `${format(new Date(startDate + "T00:00:00"), 'dd/MM/yyyy')} al ${format(new Date(endDate + "T00:00:00"), 'dd/MM/yyyy')}`;
            printCenter(`Fechas: ${rangoTexto}`, cursorY, 8);
            cursorY += 2;
            
            printDashedLine();
            
            // Seccion 1: Resumen
            printCenter("RESUMEN DE FACTURACIÓN", cursorY, 9, true);
            cursorY += 5;
            
            docToDraw.setFontSize(8);
            docToDraw.setFont("helvetica", "normal");
            docToDraw.text("Ventas al Contado", marginX, cursorY);
            docToDraw.text(`$${Number(data.totalContado).toFixed(2)}`, pageWidth - marginX - docToDraw.getTextWidth(`$${Number(data.totalContado).toFixed(2)}`), cursorY);
            cursorY += 4;
            
            docToDraw.text("Ventas a Crédito", marginX, cursorY);
            docToDraw.text(`$${Number(data.totalPendiente).toFixed(2)}`, pageWidth - marginX - docToDraw.getTextWidth(`$${Number(data.totalPendiente).toFixed(2)}`), cursorY);
            cursorY += 2;
            
            printDashedLine();
            
            docToDraw.setFont("helvetica", "bold");
            docToDraw.text("TOTAL FACTURADO", marginX, cursorY);
            docToDraw.text(`$${Number(data.totalFacturado).toFixed(2)}`, pageWidth - marginX - docToDraw.getTextWidth(`$${Number(data.totalFacturado).toFixed(2)}`), cursorY);
            cursorY += 2;
            
            printDashedLine();
            
            // Seccion 2: Ingresos
            printCenter("INGRESOS RECIBIDOS", cursorY, 9, true);
            cursorY += 5;
            
            const colUsdRight = pageWidth - marginX - 28; // Termina en 48
            const colBsRight = pageWidth - marginX;       // Termina en 76
            
            docToDraw.setFont("helvetica", "bold");
            docToDraw.setFontSize(7);
            docToDraw.text("MÉTODO (NUEVOS)", marginX, cursorY);
            docToDraw.text("USD", colUsdRight - docToDraw.getTextWidth("USD"), cursorY);
            docToDraw.text("Bs", colBsRight - docToDraw.getTextWidth("Bs"), cursorY);
            cursorY += 4;
            
            docToDraw.setFont("helvetica", "normal");
            let hasNuevas = false;
            Object.entries(data.ingresosVentasNuevas).forEach(([metodo, totales]: any) => {
                hasNuevas = true;
                let mStr = String(metodo);
                if (mStr.length > 13) mStr = mStr.substring(0, 13) + ".";
                docToDraw.text(mStr, marginX, cursorY);
                
                const usdStr = `$${Number(totales.usd).toFixed(2)}`;
                docToDraw.text(usdStr, colUsdRight - docToDraw.getTextWidth(usdStr), cursorY);
                
                const bsStr = totales.bs > 0 ? `Bs ${Number(totales.bs).toFixed(2)}` : "-";
                docToDraw.text(bsStr, colBsRight - docToDraw.getTextWidth(bsStr), cursorY);
                cursorY += 4;
            });
            if (!hasNuevas) {
                docToDraw.text("No hay ingresos.", marginX, cursorY);
                cursorY += 4;
            }
            
            printDashedLine();
            
            docToDraw.setFont("helvetica", "bold");
            docToDraw.text("SUBTOTAL NUEVAS", marginX, cursorY);
            const sub1UsdStr = `$${Number(data.totalVentasNuevasUsd).toFixed(2)}`;
            docToDraw.text(sub1UsdStr, colUsdRight - docToDraw.getTextWidth(sub1UsdStr), cursorY);
            const sub1BsStr = `Bs ${Number(data.totalVentasNuevasBs).toFixed(2)}`;
            docToDraw.text(sub1BsStr, colBsRight - docToDraw.getTextWidth(sub1BsStr), cursorY);
            cursorY += 6;
            
            docToDraw.setFontSize(7);
            docToDraw.text("MÉTODO (ABONOS)", marginX, cursorY);
            docToDraw.text("USD", colUsdRight - docToDraw.getTextWidth("USD"), cursorY);
            docToDraw.text("Bs", colBsRight - docToDraw.getTextWidth("Bs"), cursorY);
            cursorY += 4;
            
            docToDraw.setFont("helvetica", "normal");
            let hasAbonos = false;
            Object.entries(data.ingresosAbonos).forEach(([metodo, totales]: any) => {
                hasAbonos = true;
                let mStr = String(metodo);
                if (mStr.length > 13) mStr = mStr.substring(0, 13) + ".";
                docToDraw.text(mStr, marginX, cursorY);
                
                const usdStr = `$${Number(totales.usd).toFixed(2)}`;
                docToDraw.text(usdStr, colUsdRight - docToDraw.getTextWidth(usdStr), cursorY);
                
                const bsStr = totales.bs > 0 ? `Bs ${Number(totales.bs).toFixed(2)}` : "-";
                docToDraw.text(bsStr, colBsRight - docToDraw.getTextWidth(bsStr), cursorY);
                cursorY += 4;
            });
            if (!hasAbonos) {
                docToDraw.text("No hay abonos.", marginX, cursorY);
                cursorY += 4;
            }
            
            printDashedLine();
            
            docToDraw.setFont("helvetica", "bold");
            docToDraw.text("SUBTOTAL ABONOS", marginX, cursorY);
            const sub2UsdStr = `$${Number(data.totalAbonosUsd).toFixed(2)}`;
            docToDraw.text(sub2UsdStr, colUsdRight - docToDraw.getTextWidth(sub2UsdStr), cursorY);
            const sub2BsStr = `Bs ${Number(data.totalAbonosBs).toFixed(2)}`;
            docToDraw.text(sub2BsStr, colBsRight - docToDraw.getTextWidth(sub2BsStr), cursorY);
            cursorY += 2;
            
            printDashedLine();
            
            docToDraw.setFontSize(8);
            docToDraw.text("RECIBIDO (DIVISAS):", marginX, cursorY);
            docToDraw.text(`$${Number(data.totalPuroDivisas).toFixed(2)}`, pageWidth - marginX - docToDraw.getTextWidth(`$${Number(data.totalPuroDivisas).toFixed(2)}`), cursorY);
            cursorY += 4;
            
            const totBs = Number(data.totalVentasNuevasBs) + Number(data.totalAbonosBs);
            docToDraw.text("RECIBIDO (Bs):", marginX, cursorY);
            docToDraw.text(`Bs ${totBs.toFixed(2)}`, pageWidth - marginX - docToDraw.getTextWidth(`Bs ${totBs.toFixed(2)}`), cursorY);
            cursorY += 4;
            
            const totUsd = Number(data.totalVentasNuevasUsd) + Number(data.totalAbonosUsd);
            docToDraw.text("TOTAL INGRESADO:", marginX, cursorY);
            docToDraw.text(`$${totUsd.toFixed(2)}`, pageWidth - marginX - docToDraw.getTextWidth(`$${totUsd.toFixed(2)}`), cursorY);
            cursorY += 2;
            
            if (data.ventasCredito && data.ventasCredito.length > 0) {
                printDashedLine();
                printCenter("CUENTAS POR COBRAR", cursorY, 9, true);
                cursorY += 5;
                
                docToDraw.setFontSize(7);
                docToDraw.text("CLIENTE", marginX, cursorY);
                docToDraw.text("PENDIENTE", pageWidth - marginX - docToDraw.getTextWidth("PENDIENTE"), cursorY);
                cursorY += 4;
                
                docToDraw.setFont("helvetica", "normal");
                data.ventasCredito.forEach((vc: any) => {
                    const nombre = vc.miembro ? vc.miembro.razon_social : (vc.cliente_foraneo ? vc.cliente_foraneo.nombre : `Factura #${vc.id}`);
                    docToDraw.text(nombre.substring(0, 20), marginX, cursorY);
                    const p = `$${Number(vc.pendiente).toFixed(2)}`;
                    docToDraw.text(p, pageWidth - marginX - docToDraw.getTextWidth(p), cursorY);
                    cursorY += 4;
                });
                
                printDashedLine();
                
                docToDraw.setFont("helvetica", "bold");
                docToDraw.setFontSize(8);
                docToDraw.text("TOTAL A CRÉDITO", marginX, cursorY);
                const tc = `$${Number(data.totalCreditoOtorgado).toFixed(2)}`;
                docToDraw.text(tc, pageWidth - marginX - docToDraw.getTextWidth(tc), cursorY);
                cursorY += 2;
            }
            
            printDashedLine();
            printCenter("*** FIN DEL REPORTE ***", cursorY, 8);
            cursorY += 4;
            printCenter("SIGAMA", cursorY, 8, true);
            cursorY += 4;
            printCenter("Sistema de Gestión Administrativa", cursorY, 7);
            cursorY += 4;
            printCenter(`y Membresías de Agroproductores - ${userName}`, cursorY, 7);
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
        onClose();

    } catch (e) {
        console.error(e);
        alert("Error generando el reporte.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Reporte de Ventas</h2>
              <p className="text-blue-100 text-sm">Genera resúmenes por fecha</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Fecha de Inicio</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Fecha de Fin</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-gray-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Formato del Documento</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setReportFormat("carta")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${reportFormat === 'carta' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
              >
                <FileText size={32} />
                <span className="font-bold text-sm">Tamaño Carta</span>
              </button>
              <button 
                onClick={() => setReportFormat("ticket")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${reportFormat === 'ticket' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
              >
                <Receipt size={32} />
                <span className="font-bold text-sm">Formato Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

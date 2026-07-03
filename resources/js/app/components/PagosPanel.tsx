import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Wallet, FileText, Filter, Loader2, Eye, Pencil, Trash2, Ban, Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { PagoModal } from "./PagoModal";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../utils/dateUtils";
import { printInvoiceHTML } from "../utils/printUtils";
import { EntregasPanel } from "./EntregasPanel";

export function PagosPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [pagoSeleccionado, setPagoSeleccionado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEntregas, setShowEntregas] = useState(false);

  const [desde, setDesde] = useState(getFirstDayOfMonth());
  const [hasta, setHasta] = useState(getLastDayOfMonth());
  const [isExporting, setIsExporting] = useState(false);

  // Datos reales desde Laravel
  const [miembros, setMiembros] = useState<any[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [tasaDia, setTasaDia] = useState<number | "">("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pagos/init');
      if (!res.ok) throw new Error('Error al cargar datos');
      const data = await res.json();
      setMiembros(data.miembros || []);
      setFacturas(data.facturas || []);
      setPagos(data.pagos || []);
      if (data.tasa_dia) {
        setTasaDia(Number(data.tasa_dia));
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error cargando los datos de pagos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to find member name for a payment
  const getMemberNameForPago = (pago: any) => {
    // Si la relación facturas y miembro viene cargada (with('facturas.miembro'))
    if (pago.facturas && pago.facturas.length > 0) {
      const miembro = pago.facturas[0].miembro;
      if (miembro) return miembro.razon_social;
    }
    return "Desconocido / Sin Asignar";
  };

  // Processed payments for the table
  const processedPagos = useMemo(() => {
    return pagos.map(p => ({
      ...p,
      miembroName: getMemberNameForPago(p)
    }));
  }, [pagos]);

  const formatMesCuota = (dateStr: string) => {
    if (!dateStr) return "Desconocida";
    const date = new Date(dateStr + "T00:00:00");
    const mes = date.toLocaleString('es-VE', { month: 'long' });
    const anio = date.getFullYear();
    return `Membresía ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`;
  };

  // Filtered payments
  const filteredPagos = useMemo(() => {
    return processedPagos.filter(p => 
      p.miembroName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.metodo_pago?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedPagos, searchTerm]);

  const handleAction = async (action: string, pago: any) => {
    if (action === "view") {
      setModalMode("view");
      setPagoSeleccionado(pago);
      setIsModalOpen(true);
    } else if (action === "edit") {
      if (pago.estado === "Anulada") {
        alert("No se puede editar un pago anulado.");
        return;
      }
      setModalMode("edit");
      setPagoSeleccionado(pago);
      setIsModalOpen(true);
    } else if (action === "anular") {
      if (pago.estado === "Anulada") return;
      if (!confirm(`¿Está seguro que desea ANULAR el pago referenciado ${pago.referencia || pago.id}? Esta acción restaurará la deuda de las cuotas pagadas.`)) return;
      try {
        const res = await fetch(`/api/pagos/${pago.id}/anular`, { method: 'PUT' });
        if (!res.ok) throw new Error('Error al anular pago');
        alert('Pago anulado exitosamente');
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Error al anular el pago');
      }
    } else if (action === "delete") {
      if (!confirm(`¿Está seguro que desea ELIMINAR PERMANENTEMENTE el pago referenciado ${pago.referencia || pago.id}?`)) return;
      try {
        const res = await fetch(`/api/pagos/${pago.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar pago');
        alert('Pago eliminado exitosamente');
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Error al eliminar el pago');
      }
    } else if (action === "pdf") {
      generatePDF(pago);
    } else if (action === "print") {
      handlePrint(pago);
    }
  };

  const handleExportGeneral = async () => {
    try {
      setIsExporting(true);
      const form = new FormData();
      if (desde) form.append('desde', desde);
      if (hasta) form.append('hasta', hasta);

      const res = await fetch('/api/pagos/reporte-general', {
        method: 'POST',
        body: form
      });
      
      if (!res.ok) throw new Error('Error al generar el reporte');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_General_Pagos_${desde || 'inicio'}_${hasta || 'fin'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error al descargar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = (pago: any) => {
    let name = "Desconocido";
    let address = "N/A";
    let idStr = "N/A";
    let monthsArr: string[] = [];
    
    if (pago.facturas && pago.facturas.length > 0) {
      const miembro = pago.facturas[0].miembro;
      if (miembro) {
         name = miembro.razon_social || "Desconocido";
         address = miembro.direccion || "N/A";
         idStr = miembro.rif || "N/A";
      }
      pago.facturas.forEach((fac: any) => {
         monthsArr.push(formatMesCuota(fac.mes_cuota));
      });
    }
    const monthStr = monthsArr.join(", ") || "Desconocida";
    
    const d = new Date(pago.fecha + "T00:00:00");
    const day = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    const montoBs = Number(pago.monto_bs) || 0;
    const monto_ugavi = montoBs * 0.6;
    const monto_fondo = montoBs * 0.2;
    const total1 = monto_ugavi + monto_fondo;

    const htmlContent = printInvoiceHTML(
      day, monthNum, year, name, address, idStr, monthStr, monto_ugavi, monto_fondo, total1
    );

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    if (iframe.contentWindow) {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(htmlContent);
      iframe.contentWindow.document.close();
      
      iframe.contentWindow.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        
        // Registrar que se imprimió
        axios.put(`/api/pagos/${pago.id}/imprimir`).then((res: any) => {
           // Actualizar el estado local
           const updatedPagos = pagos.map((p: any) => p.id === pago.id ? {...p, impreso: true} : p);
           setPagos(updatedPagos);
        }).catch((err: any) => console.error("Error marcando como impreso", err));

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  const generatePDF = (pago: any) => {
    // Thermal receipt size: 80mm width. Height is dynamic but let's say 200mm to be safe.
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200]
    });

    const marginX = 4;
    let cursorY = 10;
    const pageWidth = 80;

    // Helper for centering text
    const printCenter = (text: string, y: number, size: number, isBold = false) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // 1. Header Emisor
    printCenter("Fondo de UGAVI para", cursorY, 10, true);
    cursorY += 4;
    printCenter("Desarrollo Agropecuario", cursorY, 10, true);
    cursorY += 5;
    
    printCenter("RIF: J-30646602-9", cursorY, 8);
    cursorY += 4;
    printCenter("Teléfono: 0424-6088302", cursorY, 8);
    cursorY += 4;

    const addressLines = doc.splitTextToSize("Avenida 23 Esq. 27 Edif. UGAVI. Piso PB OF 01 Sector UGAVI, Villa del Rosario, Municipio Rosario de Perijá Estado Zulia. ZP: 4047", pageWidth - marginX * 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    addressLines.forEach((line: string) => {
      printCenter(line, cursorY, 7);
      cursorY += 3;
    });

    cursorY += 2;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    doc.setLineDashPattern([], 0);
    cursorY += 5;

    // 2. Info de Recibo
    printCenter("RECIBO DE PAGO", cursorY, 11, true);
    cursorY += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${pago.referencia || pago.id}`, marginX, cursorY);
    const dateText = `Fecha: ${new Date(pago.fecha + "T12:00:00Z").toLocaleDateString('es-VE')}`;
    doc.text(dateText, pageWidth - marginX - doc.getTextWidth(dateText), cursorY);
    cursorY += 4;
    doc.text(`Estado: ${pago.estado || 'Vigente'}`, marginX, cursorY);
    doc.text(`Caja: Principal`, pageWidth - marginX - doc.getTextWidth(`Caja: Principal`), cursorY);
    cursorY += 5;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    doc.setLineDashPattern([], 0);
    cursorY += 5;

    // 3. Info del Cliente
    const memberName = pago.facturas && pago.facturas[0] && pago.facturas[0].miembro ? pago.facturas[0].miembro.razon_social : pago.miembroName;
    const memberRif = pago.facturas && pago.facturas[0] && pago.facturas[0].miembro ? pago.facturas[0].miembro.rif : "";

    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", marginX, cursorY);
    cursorY += 4;
    doc.setFont("helvetica", "normal");
    const nameLines = doc.splitTextToSize(memberName, pageWidth - marginX * 2);
    nameLines.forEach((line: string) => {
      doc.text(line, marginX, cursorY);
      cursorY += 3;
    });
    if (memberRif) {
      doc.text(`RIF: ${memberRif}`, marginX, cursorY);
      cursorY += 4;
    }

    doc.text(`Método: ${pago.metodo_pago}`, marginX, cursorY);
    cursorY += 4;
    doc.text(`Tasa (Bs/$): ${Number(pago.tasa_cambio).toFixed(2)}`, marginX, cursorY);
    cursorY += 5;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    doc.setLineDashPattern([], 0);
    cursorY += 5;

    // 4. Detalle
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN", marginX, cursorY);
    doc.text("MONTO", pageWidth - marginX - doc.getTextWidth("MONTO"), cursorY);
    cursorY += 4;
    doc.setFont("helvetica", "normal");

    if (pago.facturas && pago.facturas.length > 0) {
      pago.facturas.forEach((f: any) => {
        const desc = formatMesCuota(f.mes_cuota);
        const montoCash = Number(f.pivot ? f.pivot.monto_aplicado : 0);
        const descApplied = Number(f.pivot ? f.pivot.descuento : 0);
        
        doc.text(desc, marginX, cursorY);
        doc.text(`$${montoCash.toFixed(2)}`, pageWidth - marginX - doc.getTextWidth(`$${montoCash.toFixed(2)}`), cursorY);
        cursorY += 4;

        if (descApplied > 0) {
          doc.setFontSize(7);
          doc.text(`  (Desc. Pronto Pago: -$${descApplied.toFixed(2)})`, marginX, cursorY);
          cursorY += 3;
          doc.setFontSize(8);
        }
      });
    } else {
      doc.text("Pago general sin detalle", marginX, cursorY);
      doc.text(`$${Number(pago.monto).toFixed(2)}`, pageWidth - marginX - doc.getTextWidth(`$${Number(pago.monto).toFixed(2)}`), cursorY);
      cursorY += 4;
    }

    cursorY += 2;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    doc.setLineDashPattern([], 0);
    cursorY += 5;

    // 5. Totales
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL PAGADO (USD):", marginX, cursorY);
    doc.text(`$${Number(pago.monto).toFixed(2)}`, pageWidth - marginX - doc.getTextWidth(`$${Number(pago.monto).toFixed(2)}`), cursorY);
    cursorY += 5;

    doc.text("TOTAL PAGADO (Bs):", marginX, cursorY);
    doc.text(`Bs. ${Number(pago.monto_bs).toFixed(2)}`, pageWidth - marginX - doc.getTextWidth(`Bs. ${Number(pago.monto_bs).toFixed(2)}`), cursorY);
    cursorY += 8;

    // 6. Footer Disclaimer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    printCenter("*** GRACIAS POR SU PAGO ***", cursorY, 8, true);
    cursorY += 5;
    
    const disclaimer = doc.splitTextToSize("Este documento es solo un comprobante interno de recibo de pago y carece de validez fiscal o tributaria.", pageWidth - marginX * 2);
    disclaimer.forEach((line: string) => {
      printCenter(line, cursorY, 7);
      cursorY += 3;
    });

    // Save
    doc.save(`Recibo_Pago_${pago.referencia || pago.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-green-600">
        <Loader2 className="animate-spin w-8 h-8 mb-4" />
        <p className="font-bold">Cargando módulo de pagos...</p>
      </div>
    );
  }

  if (showEntregas) {
    return <EntregasPanel 
      onBack={() => {
        setShowEntregas(false);
        fetchData();
      }} 
      tasaDia={tasaDia ? Number(tasaDia) : 1} 
    />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Wallet size={24} style={{ color: "#22c55e" }} />
            Historial de Pagos
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Gestiona y registra los pagos de cuotas de los miembros.
          </p>
        </div>
        
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowEntregas(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors hover:bg-blue-50" 
            style={{ borderColor: "var(--border)", color: "#2563eb" }}
          >
            Módulo Entregas
          </button>

          <button 
            onClick={handleExportGeneral}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors hover:bg-gray-50 disabled:opacity-50" 
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {isExporting ? "Generando..." : "Reporte General (PDF)"}
          </button>
          
          <button
            onClick={() => {
              setModalMode("create");
              setPagoSeleccionado(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ 
              background: "linear-gradient(135deg, #22c55e, #16a34a)", 
              color: "#fff", 
              boxShadow: "0 4px 14px rgba(34,197,94,0.3)" 
            }}
          >
            <Plus size={18} />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 border flex flex-col lg:flex-row gap-4 items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="relative w-full lg:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          </div>
          <input
            type="text"
            placeholder="Buscar por Miembro, Referencia o Método..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-green-200 transition-all"
            style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-background border px-3 py-2 rounded-xl" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-medium">Desde:</span>
            <input 
              type="date" 
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="bg-transparent text-sm text-foreground outline-none" 
            />
          </div>
          <div className="flex items-center gap-2 bg-background border px-3 py-2 rounded-xl" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-medium">Hasta:</span>
            <input 
              type="date" 
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="bg-transparent text-sm text-foreground outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Fecha</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Miembro</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Cuotas Pagas</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>N° UGAVI</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>N° Fondo</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right" style={{ color: "var(--muted-foreground)" }}>Monto $</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-right" style={{ color: "var(--muted-foreground)" }}>Monto Bs.</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Método</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>Estado</th>
                <th className="px-4 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-center" style={{ color: "var(--muted-foreground)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filteredPagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                      {new Date(pago.fecha + 'T12:00:00Z').toLocaleDateString("es-VE")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-bold truncate max-w-[150px] inline-block" style={{ color: "var(--foreground)" }}>
                      {pago.miembroName}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {pago.facturas && pago.facturas.length > 0 ? pago.facturas.map((f: any) => (
                        <span key={f.id} className="text-[0.65rem] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {formatMesCuota(f.mes_cuota)}
                        </span>
                      )) : (
                        <span className="text-[0.65rem] text-gray-400">Sin cuotas</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                      {pago.factura_ugavi || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                      {pago.factura_fondo || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-xs font-bold text-green-600">
                      ${Number(pago.monto).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                      Bs. {Number(pago.monto_bs).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md text-[0.65rem] font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {pago.metodo_pago || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold inline-block ${
                        pago.estado === "Vigente" || !pago.estado ? "bg-green-100 text-green-700" :
                        pago.estado === "Anulada" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {pago.estado || "Vigente"}
                      </span>
                      {pago.impreso && (
                        <span className="text-[0.6rem] font-medium text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded flex items-center gap-1" title="Factura Impresa">
                          <Printer size={10} /> Impreso
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleAction("view", pago)} className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors" title="Ver Detalle">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleAction("pdf", pago)} className="p-1.5 rounded hover:bg-purple-100 text-purple-600 transition-colors" title="Descargar Recibo PDF">
                        <Download size={14} />
                      </button>
                      <button onClick={() => handleAction("print", pago)} className="p-1.5 rounded hover:bg-teal-100 text-teal-600 transition-colors" title="Imprimir Factura">
                        <Printer size={14} />
                      </button>
                      {pago.estado !== "Anulada" && (
                        <>
                          <button onClick={() => handleAction("edit", pago)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleAction("anular", pago)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600 transition-colors" title="Anular">
                            <Ban size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleAction("delete", pago)} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPagos.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={32} style={{ color: "var(--muted-foreground)", opacity: 0.5, marginBottom: "1rem" }} />
                      <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>No hay pagos registrados</p>
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Registra un pago para verlo aquí.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Pago */}
      {isModalOpen && (
        <PagoModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setPagoSeleccionado(null);
          }} 
          onSuccess={() => {
            fetchData();
          }}
          miembros={miembros}
          facturas={facturas}
          tasaDia={tasaDia}
          mode={modalMode}
          pagoToEdit={pagoSeleccionado}
        />
      )}
    </div>
  );
}

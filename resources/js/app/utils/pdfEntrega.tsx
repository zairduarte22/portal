import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ComprobanteEntrega } from "../components/reports/ReportesModernos";

export const downloadEntregaPDF = async (id: number) => {
  try {
    const res = await fetch(`/api/entregas/${id}`);
    if (!res.ok) throw new Error("Error fetching entrega data");
    const data = await res.json();
    const { entrega, rangoUgavi, rangoFondo, configuraciones } = data;

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<ComprobanteEntrega data={entrega} rango={rangoUgavi} periodo={rangoFondo} config={configuraciones} />);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 800));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'pt', 'letter');
    
    // Letter dimensions in pt: 612 x 792
    const pdfWidth = 612;
    const pdfHeight = 792;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`comprobante_entrega_${id}.pdf`);

    root.unmount();
    document.body.removeChild(container);
  } catch (error) {
    console.error("Error generating PDF", error);
    alert("Ocurrió un error al generar el PDF.");
  }
};

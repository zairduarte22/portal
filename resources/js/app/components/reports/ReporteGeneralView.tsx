import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ReporteGeneral } from "./ReportesModernos";
import { Printer, ArrowLeft } from "lucide-react";

export function ReporteGeneralView() {
  const [searchParams] = useSearchParams();
  const desde = searchParams.get('desde') || '';
  const hasta = searchParams.get('hasta') || '';
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const [y, m, d] = dateString.split('-');
      if (!y || !m || !d) return dateString;
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${d}/${months[parseInt(m)-1]}/${y}`;
    } catch (e) {
      return dateString;
    }
  };

  const periodoStr = `${formatDate(desde) || 'INICIO'} — ${formatDate(hasta) || 'FIN'}`;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/pagos/exportar/general/json?desde=${desde}&hasta=${hasta}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el reporte");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [desde, hasta]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 font-bold bg-white p-6 rounded shadow">{error || "Reporte no encontrado"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white flex flex-col items-center pb-10">
      <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center mb-8 print:hidden" style={{ maxWidth: 816 }}>
        <button 
          onClick={() => window.close()} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={18} /> Cerrar
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 shadow"
        >
          <Printer size={18} /> Imprimir / Guardar PDF
        </button>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: letter !important; }
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <div id="printable-report" className="shadow-lg print:shadow-none bg-white" style={{ width: 816, minHeight: 1056 }}>
        <ReporteGeneral data={data} periodo={periodoStr} titulo="Reporte General de Pagos" />
      </div>
    </div>
  );
}

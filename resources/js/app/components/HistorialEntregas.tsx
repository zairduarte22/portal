import React, { useState, useEffect } from "react";

import { Download, Loader2, Calendar, FileText } from "lucide-react";

export function HistorialEntregas() {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entregas")
      .then(res => res.json())
      .then(data => {
        setEntregas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = (id: number) => {
    window.open(`/gestion/entregas/${id}/reporte`, '_blank');
  };

  const fmt = (val: string | number) => Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden" style={{ borderColor: "var(--border)" }}>
      {entregas.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No hay entregas registradas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">ID</th>
                <th className="px-6 py-4">Fecha Emisión</th>
                <th className="px-6 py-4">Período</th>
                <th className="px-6 py-4 text-right">Monto USD</th>
                <th className="px-6 py-4 text-right">Monto BS</th>
                <th className="px-6 py-4 text-center rounded-tr-2xl">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {entregas.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">#{e.id}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={14} />
                      {new Date(e.fecha + 'T12:00:00Z').toLocaleDateString("es-VE")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">
                      {new Date(e.rango_desde + 'T12:00:00Z').toLocaleDateString("es-VE")} - {new Date(e.rango_hasta + 'T12:00:00Z').toLocaleDateString("es-VE")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-green-600">
                    ${fmt(e.total_usd)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-700">
                    Bs {fmt(e.total_bs)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDownload(e.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs transition-colors"
                    >
                      <FileText size={14} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

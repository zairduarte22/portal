import React, { useState } from "react";
import { format } from "date-fns";
import { FileText, Calendar, Receipt, X } from "lucide-react";

export function ReporteVentasModal({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportFormat, setReportFormat] = useState<"carta" | "ticket">("carta");

  const handleGenerate = () => {
    // Abrir en nueva pestaña
    window.open(`/api/tasca/ventas/reporte-pdf?start_date=${startDate}&end_date=${endDate}&format=${reportFormat}`, '_blank');
    onClose();
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

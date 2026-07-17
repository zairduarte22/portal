import { ReportesTascaTab } from "./tabs/ReportesTascaTab";

export function ReportesTascaPanel() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes de la Tasca</h1>
        <p className="text-gray-500 mt-1">Métricas, rendimiento y estadísticas de ventas de la tasca.</p>
      </div>
      <ReportesTascaTab />
    </div>
  );
}

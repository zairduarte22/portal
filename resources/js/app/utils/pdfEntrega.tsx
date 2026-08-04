export const downloadEntregaPDF = async (id: number) => {
  // Ahora en lugar de generar un PDF con html2canvas,
  // abrimos la vista de impresión en una nueva pestaña.
  window.open(`/gestion/entregas/${id}/reporte`, '_blank');
};

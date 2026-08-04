import React from "react";
import { InventarioRapidoTab } from "../tabs/InventarioRapidoTab";
import { Package } from "lucide-react";

export function UgaviBarCatalogo() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black font-sans text-gray-900 tracking-tight flex items-center gap-2">
          <Package size={28} className="text-emerald-600" />
          Catálogo de Inventario
        </h2>
      </div>
      <InventarioRapidoTab />
    </div>
  );
}

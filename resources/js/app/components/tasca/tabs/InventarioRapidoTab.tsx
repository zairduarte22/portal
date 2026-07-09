import { useState, useEffect } from "react";
import { Package, Search } from "lucide-react";

export function InventarioRapidoTab() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/tasca/insumos")
      .then(res => res.json())
      .then(setInsumos)
      .catch(console.error);
  }, []);

  const filtered = insumos.filter(i => 
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (i.categoria && i.categoria.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-200">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar producto por nombre o categoría..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="pb-3 font-semibold text-sm">Producto / Características</th>
              <th className="pb-3 font-semibold text-sm">Categoría</th>
              <th className="pb-3 font-semibold text-sm text-right">Inventario Restante (Stock)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-b hover:bg-gray-50/50">
                <td className="py-3 font-medium flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{i.nombre}</p>
                    {i.productos && i.productos.length > 0 && (
                      <p className="text-xs text-gray-400">
                        Presentaciones: {i.productos.map((p: any) => p.nombre).join(", ")}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-600">
                  {i.categoria || "Sin categoría"}
                </td>
                <td className="py-3 text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    i.stock_total > 10 ? 'bg-green-100 text-green-700' :
                    i.stock_total > 0 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {i.stock_total || 0}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">No hay productos disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

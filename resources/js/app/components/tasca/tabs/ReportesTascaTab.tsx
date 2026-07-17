import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { format, startOfMonth, parseISO, startOfWeek, differenceInDays, differenceInWeeks } from "date-fns";
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, Percent, ArrowRight, BarChart2 } from "lucide-react";

export function ReportesTascaTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(today);
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  const fetchRendimiento = async () => {
    setLoading(true);
    try {
      const query = `?start_date=${startDate}&end_date=${endDate}`;
      const res = await fetch(`/api/tasca/reportes/rendimiento${query}`);
      if (!res.ok) throw new Error("Error al obtener los datos de rendimiento");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRendimiento();
  }, [startDate, endDate]);

  const chartData = useMemo(() => {
    if (!data) return [];
    if (granularity === 'daily') return data.grafica_ventas_diarias;

    const grouped = data.grafica_ventas_diarias.reduce((acc: any, curr: any) => {
      const weekStart = format(startOfWeek(parseISO(curr.fecha), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      if (!acc[weekStart]) acc[weekStart] = 0;
      acc[weekStart] += curr.ingresos;
      return acc;
    }, {});

    return Object.keys(grouped).map(date => ({
      fecha: date,
      ingresos: grouped[date]
    })).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [data, granularity]);

  const promedioVentas = useMemo(() => {
    if (!data) return 0;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (granularity === 'daily') {
      const days = differenceInDays(end, start) + 1;
      return days > 0 ? data.kpis.ingresos_totales / days : 0;
    } else {
      const weeks = differenceInWeeks(end, start) + 1;
      return weeks > 0 ? data.kpis.ingresos_totales / weeks : 0;
    }
  }, [data, granularity, startDate, endDate]);

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#ff7300'];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Rendimiento de Ventas</h2>
          <p className="text-sm text-gray-500">Métricas y estadísticas del periodo seleccionado.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
          />
          <ArrowRight size={16} className="text-gray-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
          />
          <button 
            onClick={fetchRendimiento}
            className="px-3 py-1 bg-white border shadow-sm rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Filtrar
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="p-12 text-center text-gray-500 font-medium">Cargando métricas...</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider">Ingresos Totales</h3>
                <DollarSign size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{formatCurrency(data.kpis.ingresos_totales)}</p>
              <p className="text-xs text-gray-500 mt-1">{data.kpis.total_ventas} ventas concretadas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-l-4 border-l-red-400">
              <div className="flex items-center justify-between text-red-500 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider">Costo de Ventas</h3>
                <TrendingDown size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{formatCurrency(data.kpis.costo_total)}</p>
              <p className="text-xs text-gray-500 mt-1">Costo calculado de la mercancía</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-l-4 border-l-green-500">
              <div className="flex items-center justify-between text-green-600 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider">Ganancia Bruta</h3>
                <TrendingUp size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{formatCurrency(data.kpis.ganancia_bruta)}</p>
              <p className="text-xs text-gray-500 mt-1">Beneficio después de costos</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider">Margen</h3>
                <Percent size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{data.kpis.margen}%</p>
              <p className="text-xs text-gray-500 mt-1">Rentabilidad del periodo</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-l-4 border-l-orange-400">
              <div className="flex items-center justify-between text-orange-500 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider">Ticket Promedio</h3>
                <ShoppingCart size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{formatCurrency(data.kpis.ticket_promedio)}</p>
              <p className="text-xs text-gray-500 mt-1">Ingreso promedio por venta</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-l-4 border-l-indigo-400">
              <div className="flex items-center justify-between text-indigo-500 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider">Promedio {granularity === 'daily' ? 'Diario' : 'Semanal'}</h3>
                <BarChart2 size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{formatCurrency(promedioVentas)}</p>
              <p className="text-xs text-gray-500 mt-1">Ingreso medio {granularity === 'daily' ? 'por día' : 'por semana'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Ingresos {granularity === 'daily' ? 'Diarios' : 'Semanales'}</h3>
                <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1">
                  <button 
                    onClick={() => setGranularity('daily')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md ${granularity === 'daily' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Diario
                  </button>
                  <button 
                    onClick={() => setGranularity('weekly')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md ${granularity === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Semanal
                  </button>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="fecha" 
                      tickFormatter={(tick) => format(parseISO(tick), 'dd/MM')} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dx={-10}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']}
                      labelFormatter={(label) => format(parseISO(label as string), 'dd/MM/yyyy')}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3B82F6' }}
                      activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Top 5 Mayor Liquidez (Ingresos)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_liquidez} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="nombre" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }}
                      width={120}
                    />
                    <RechartsTooltip 
                      formatter={(value: number, name: string, props: any) => [`$${value.toFixed(2)} (${props.payload.cantidad} unds)`, 'Ingresos']}
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="ingresos" 
                      fill="#10B981" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Top 5 Mayor Salida (Cantidad)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_salida} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="nombre" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }}
                      width={120}
                    />
                    <RechartsTooltip 
                      formatter={(value: number, name: string, props: any) => [`${value} unidades`, 'Cantidad']}
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="cantidad" 
                      fill="#3B82F6" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Top 10 Menos Salida (Cantidad)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.menos_salida} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="nombre" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }}
                      width={120}
                    />
                    <RechartsTooltip 
                      formatter={(value: number, name: string, props: any) => [`${value} unidades`, 'Cantidad']}
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="cantidad" 
                      fill="#EF4444" 
                      radius={[0, 4, 4, 0]} 
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between">
                <span>Productos Olvidados</span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{data.olvidados?.length || 0}</span>
              </h3>
              <p className="text-xs text-gray-500 mb-4">Productos con 0 ventas desde su ingreso.</p>
              <div className="h-64 overflow-y-auto pr-2">
                {data.olvidados && data.olvidados.length > 0 ? (
                  <ul className="space-y-2">
                    {data.olvidados.map((prod: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-transparent hover:border-red-200 transition-colors">
                        <span className="text-sm font-medium text-gray-700">{prod.nombre}</span>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">0 uds</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    No hay productos olvidados.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Desglose por Método de Pago</h3>
              <div className="h-72 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ventas_por_metodo}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="monto"
                      nameKey="metodo"
                    >
                      {data.ventas_por_metodo.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monto']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

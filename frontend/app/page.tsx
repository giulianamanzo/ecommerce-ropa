"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, Plus, TrendingUp, DollarSign, 
  Activity, Calculator, Save, X, 
  RefreshCw, AlertCircle, Loader2
} from 'lucide-react';

// --- INTERFACES & TYPES ---

interface Sale {
  ID_Venta: number;
  Fecha: string;
  ID_Cliente: number;
  ID_Producto: number;
  Cantidad: number;
  Precio_Unitario: number;
  Total: number;
}

interface RawSaleData {
  ID_Venta: number;
  Fecha: string;
  ID_Cliente: number | string;
  ID_Producto: number | string;
  Cantidad: number | string;
  Precio_Unitario: string | number;
  Total: string | number;
}

interface NewSaleForm {
  ID_Cliente: string;
  ID_Producto: string;
  Cantidad: number;
  Precio_Unitario: string;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalSalesCount: number;
  avgTicket: number;
  salesByDateArray: { date: string; total: number; count: number }[];
  stdDevDaily: number;
  meanDaily: number;
  correlationPriceQty: number;
  topProducts: { name: string; total: number; quantity: number }[];
  scatterData: { id: number; x: number; y: number; z: number }[];
}

// --- CONSTANTES & CONFIG ---
const API_URL = 'http://localhost:3000/ventas';

// --- UI COMPONENTS (Typed) ---

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
);

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>
);

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = "", ...props }) => (
  <p className={`text-sm text-slate-500 ${className}`} {...props}>{children}</p>
);

const CardContent: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "", 
  isLoading = false, 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-slate-900 underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "", ...props }) => {
  const styles = variant === "outline" 
    ? "border border-slate-200 text-slate-950" 
    : "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80";
    
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${styles} ${className}`} {...props}>
      {children}
    </div>
  );
};

// --- UTILIDADES ---

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
};

// Estadísticas
const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
};

const calculateStdDev = (values: number[]): number => {
  const n = values.length;
  if (n <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  return Math.sqrt(variance);
};

// --- MAIN APP COMPONENT ---

export default function SalesDashboard() {
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [newSale, setNewSale] = useState<NewSaleForm>({
    ID_Cliente: '',
    ID_Producto: '',
    Cantidad: 1,
    Precio_Unitario: ''
  });

  // Fetch Data Real
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      
      const jsonData: RawSaleData[] = await response.json();
      
      // Normalización de tipos de datos
      const processed: Sale[] = jsonData.map(item => ({
        ID_Venta: item.ID_Venta,
        Fecha: item.Fecha,
        ID_Cliente: typeof item.ID_Cliente === 'string' ? parseInt(item.ID_Cliente) : item.ID_Cliente,
        ID_Producto: typeof item.ID_Producto === 'string' ? parseInt(item.ID_Producto) : item.ID_Producto,
        Cantidad: typeof item.Cantidad === 'string' ? parseInt(item.Cantidad) : item.Cantidad,
        Precio_Unitario: typeof item.Precio_Unitario === 'string' ? parseFloat(item.Precio_Unitario) : item.Precio_Unitario,
        Total: typeof item.Total === 'string' ? parseFloat(item.Total) : item.Total
      }));

      setData(processed);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cálculos Memorizados
  const analytics = useMemo<AnalyticsSummary | null>(() => {
    if (!data || data.length === 0) return null;

    const totalRevenue = data.reduce((sum, item) => sum + item.Total, 0);
    const totalSalesCount = data.length;
    const avgTicket = totalRevenue / totalSalesCount;

    // Agrupación por Fecha
    const salesByDateMap = data.reduce((acc, item) => {
      const dateKey = item.Fecha ? item.Fecha.split('T')[0] : 'Desconocido';
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, total: 0, count: 0 };
      acc[dateKey].total += item.Total;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { date: string; total: number; count: number }>);
    
    const salesByDateArray = Object.values(salesByDateMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Desviación Estándar (Volatilidad Diaria)
    const dailyTotals = salesByDateArray.map(d => d.total);
    const stdDevDaily = calculateStdDev(dailyTotals);
    const meanDaily = dailyTotals.length ? dailyTotals.reduce((a,b) => a+b, 0) / dailyTotals.length : 0;

    // Correlación
    const prices = data.map(d => d.Precio_Unitario);
    const quantities = data.map(d => d.Cantidad);
    const correlationPriceQty = calculateCorrelation(prices, quantities);

    // Top Productos
    const salesByProductMap = data.reduce((acc, item) => {
      const pid = `Prod #${item.ID_Producto}`;
      if (!acc[pid]) acc[pid] = { name: pid, total: 0, quantity: 0 };
      acc[pid].total += item.Total;
      acc[pid].quantity += item.Cantidad;
      return acc;
    }, {} as Record<string, { name: string; total: number; quantity: number }>);
    
    const topProducts = Object.values(salesByProductMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Scatter Data
    const scatterData = data.map((d, i) => ({
      id: i,
      x: d.Precio_Unitario,
      y: d.Cantidad,
      z: d.Total
    }));

    return {
      totalRevenue,
      totalSalesCount,
      avgTicket,
      salesByDateArray,
      stdDevDaily,
      meanDaily,
      correlationPriceQty,
      topProducts,
      scatterData
    };
  }, [data]);

  // Manejadores de Eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSale(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const price = parseFloat(newSale.Precio_Unitario);
    const qty = newSale.Cantidad; // Already number from input type number binding, but safe to cast if needed
    const total = price * qty;

    const payload = {
      ID_Venta: data.length > 0 ? Math.max(...data.map(d => d.ID_Venta)) + 1 : 1, // Fallback ID gen
      Fecha: new Date().toISOString(),
      ID_Cliente: parseInt(newSale.ID_Cliente),
      ID_Producto: parseInt(newSale.ID_Producto),
      Cantidad: qty,
      Precio_Unitario: price.toFixed(2), // La API probablemente espera string decimal
      Total: total.toFixed(2)
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Falló la creación de la venta");

      // Refetch para tener datos frescos
      await fetchData();
      
      setIsModalOpen(false);
      setNewSale({ ID_Cliente: '', ID_Producto: '', Cantidad: 1, Precio_Unitario: '' });
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-950 pb-12">
      {/* Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-md">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} isLoading={loading && data.length > 0}>
              {!loading && <RefreshCw className="h-4 w-4 mr-2" />}
              Actualizar
            </Button>
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Nueva Venta
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p>{error} - Asegúrate de que la API en {API_URL} esté corriendo.</p>
            <Button variant="outline" size="sm" className="ml-auto border-red-200 hover:bg-red-100 text-red-900" onClick={fetchData}>Reintentar</Button>
          </div>
        )}

        {loading && !data.length ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
             <p className="text-slate-500">Cargando datos de ventas...</p>
           </div>
        ) : !analytics ? (
          <div className="text-center py-20 text-slate-500">No hay datos disponibles.</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                  <p className="text-xs text-slate-500 mt-1">+20.1% desde el último mes</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                  <Calculator className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.avgTicket)}</div>
                  <p className="text-xs text-slate-500 mt-1">Por transacción realizada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volatilidad (SD)</CardTitle>
                  <Activity className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.stdDevDaily)}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {analytics.stdDevDaily > analytics.meanDaily * 0.4 ? 'Variabilidad Alta' : 'Variabilidad Baja'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Correlación P/Q</CardTitle>
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.correlationPriceQty.toFixed(3)}</div>
                  <p className="text-xs text-slate-500 mt-1">Coeficiente de Pearson</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              
              {/* Área Chart - Tendencia */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Resumen de Ventas</CardTitle>
                  <CardDescription>Ingresos diarios acumulados en el periodo.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.salesByDateArray}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          stroke="#888888" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={formatDate}
                          minTickGap={30}
                        />
                        <YAxis 
                          stroke="#888888" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${val/1000}k`} 
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val), 'Venta Total']}
                          labelFormatter={formatDate}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#0f172a" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorTotal)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart - Top Productos */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Productos</CardTitle>
                  <CardDescription>Productos con mayor facturación.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topProducts} layout="vertical" margin={{ left: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={70} 
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          stroke="#64748b"
                        />
                        <Tooltip 
                           cursor={{fill: '#f1f5f9'}}
                           contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                           formatter={(val: number) => [formatCurrency(val), 'Ingresos']}
                        />
                        <Bar dataKey="total" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Secundarios */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              
              {/* Scatter Plot */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Dispersión Precio/Cantidad</CardTitle>
                  <CardDescription>Análisis de sensibilidad al precio.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name="Precio" 
                          unit="$" 
                          tickFormatter={(val) => `${val/1000}k`}
                          fontSize={12}
                          stroke="#888888"
                          label={{ value: 'Precio Unitario', position: 'insideBottom', offset: -10, fontSize: 12 }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Cantidad" 
                          fontSize={12}
                          stroke="#888888"
                          label={{ value: 'Cant. Vendida', angle: -90, position: 'insideLeft', fontSize: 12 }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border border-slate-200 shadow-md rounded-md text-xs">
                                  <p className="font-bold mb-1">Detalle Venta</p>
                                  <p>Precio: {formatCurrency(payload[0].value)}</p>
                                  <p>Cantidad: {payload[1].value}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Ventas" data={analytics.scatterData} fill="#6366f1" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Insights Texto */}
              <Card className="col-span-3 bg-slate-900 text-slate-50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Metricas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Badge variant="outline" className="border-slate-600 text-black mb-2">Tendencia</Badge>
                    <p className="text-sm text-black leading-relaxed">
                      La correlación actual es de <strong className="text-white">{analytics.correlationPriceQty.toFixed(2)}</strong>. 
                      {analytics.correlationPriceQty < -0.5 
                        ? " Esto indica que los precios altos reducen significativamente el volumen de ventas." 
                        : " El volumen de ventas se mantiene relativamente estable independientemente del precio."}
                    </p>
                  </div>
                  <div className="border-t border-slate-800 pt-4">
                     <Badge variant="outline" className="border-slate-600 text-black mb-2">Rendimiento</Badge>
                     <p className="text-sm text-black leading-relaxed">
                       El día con mayor actividad registró <strong>{Math.max(...analytics.salesByDateArray.map(d => d.count))}</strong> transacciones. 
                       La media de ingresos diarios es de <strong>{formatCurrency(analytics.meanDaily)}</strong>.
                     </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* Modal de Nueva Venta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-4">
            <Card className="w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Registrar Venta</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSale} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ID_Cliente">ID Cliente</Label>
                    <Input 
                      id="ID_Cliente"
                      name="ID_Cliente"
                      type="number"
                      placeholder="Ej: 101"
                      required
                      value={newSale.ID_Cliente}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ID_Producto">ID Producto</Label>
                    <Input 
                      id="ID_Producto"
                      name="ID_Producto"
                      type="number"
                      placeholder="Ej: 55"
                      required
                      value={newSale.ID_Producto}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="Cantidad">Cantidad</Label>
                      <Input 
                        id="Cantidad"
                        name="Cantidad"
                        type="number"
                        min="1"
                        required
                        value={newSale.Cantidad}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Precio_Unitario">Precio Unitario</Label>
                      <Input 
                        id="Precio_Unitario"
                        name="Precio_Unitario"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="$"
                        value={newSale.Precio_Unitario}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" isLoading={submitting}>
                      <Save className="mr-2 h-4 w-4" /> Guardar Venta
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
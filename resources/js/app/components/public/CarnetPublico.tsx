import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShieldCheck, ShieldAlert, User, Briefcase, Calendar, Info } from 'lucide-react';

export function CarnetPublico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCarnet = async () => {
      try {
        const res = await fetch(`/api/carnets/public/${id}`);
        if (!res.ok) {
          throw new Error('Carnet no encontrado o código inválido');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarnet();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Verificando credencial...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border-t-4 border-red-500">
          <h2 className="text-2xl font-black text-gray-800 mb-2">Carnet Inválido</h2>
          <p className="text-gray-600 mb-6">{error || 'Carnet no encontrado'}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const { persona, miembro, vigente, motivo_invalidez, cargo, fecha_emision, fecha_vencimiento } = data;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center px-6 min-w-[140px] h-16 bg-white rounded-2xl shadow-sm mb-3 border border-gray-200">
            <span className="text-green-700 font-black text-2xl tracking-tighter">SIG<span className="text-gray-800">AMA</span></span>
          </div>
          <h1 className="text-lg font-bold text-gray-800">Verificación de Credencial</h1>
          <p className="text-sm text-gray-500">Sistema de Gestión Administrativa</p>
        </div>

        {/* Estatus Banner */}
        <div className={`mb-4 rounded-2xl p-4 shadow-lg text-white flex items-center gap-3 transition-all duration-500 transform hover:scale-[1.02] ${vigente ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30' : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30'}`}>
          {vigente ? <ShieldCheck size={32} className="shrink-0" /> : <ShieldAlert size={32} className="shrink-0" />}
          <div>
            <h2 className="text-xl font-black tracking-wide uppercase">{vigente ? 'Credencial Vigente' : 'Credencial Inválida'}</h2>
            {!vigente && motivo_invalidez && (
              <p className="text-sm font-medium opacity-90">{motivo_invalidez}</p>
            )}
            {vigente && (
              <p className="text-sm font-medium opacity-90">Verificación exitosa</p>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
          {/* Header Card */}
          <div className="bg-gray-50 p-6 pt-10 text-center relative border-b border-gray-100">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-gray-800 leading-tight">{persona.nombre}</h3>
              <p className="text-gray-500 font-medium mt-1 flex items-center justify-center gap-1">
                <span className="text-xs px-2 py-1 bg-gray-200 rounded-md text-gray-700 font-bold">{persona.ci_tipo}-{persona.ci_numero}</span>
              </p>
            </div>
          </div>

          {/* Body Card */}
          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Briefcase size={14}/> Cargo / Rol</p>
              <p className="text-lg font-bold text-gray-800">{cargo}</p>
            </div>

            {miembro && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><User size={14}/> Finca / Miembro Asociado</p>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {miembro.logo ? (
                    <img src={`/storage/${miembro.logo}`} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shadow-sm">
                      {miembro.razon_social.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-800 leading-tight">{miembro.razon_social}</p>
                    <p className="text-sm text-gray-500">RIF: {miembro.rif}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={14}/> Emisión</p>
                <p className="font-bold text-gray-700">{fecha_emision ? format(new Date(fecha_emision.substring(0,10) + 'T00:00:00'), 'dd MMM yyyy', { locale: es }) : 'N/A'}</p>
              </div>
              <div className={`p-3 rounded-xl border ${vigente ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${vigente ? 'text-green-600' : 'text-red-600'}`}><Calendar size={14}/> Vencimiento</p>
                <p className={`font-bold ${vigente ? 'text-green-800' : 'text-red-800'}`}>{fecha_vencimiento ? format(new Date(fecha_vencimiento.substring(0,10) + 'T00:00:00'), 'dd MMM yyyy', { locale: es }) : 'N/A'}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Info size={12} /> ID de Credencial: <span className="font-mono">{id ? id.split('-')[0] : 'N/A'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center pb-8">
          <p className="text-xs text-gray-400">Desarrollado para Unión de Ganaderos de Villa del Rosario</p>
          <p className="text-xs text-gray-400 font-bold mt-1">© {new Date().getFullYear()} SIGAMA</p>
        </div>
      </div>
    </div>
  );
}

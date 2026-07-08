import { useState } from "react";
import { Lock, User } from "lucide-react";

export function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Laravel CSRF cookie
    fetch('/sanctum/csrf-cookie').then(() => {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Credenciales incorrectas");
        }
        return res.json();
      })
      .then(data => {
        onLogin(data.user);
      })
      .catch(err => {
        setError(err.message);
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            <span className="text-white font-black text-2xl" style={{ fontFamily: "Nunito, sans-serif" }}>AG</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800" style={{ fontFamily: "Nunito, sans-serif" }}>Bienvenido a SIGAMA</h2>
          <p className="text-sm text-gray-500 mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ingresa tu usuario"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full p-3 rounded-xl text-white font-bold transition-transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

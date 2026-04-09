import { useAuth } from './lib/AuthContext';
import { TaxCalculator } from './components/TaxCalculator';
import { CalculationHistoryList } from './components/CalculationHistory';
import { Button } from '../components/ui/button';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LogIn, LogOut, ShieldCheck, Zap, TrendingUp, Users, BookOpen, Calculator as CalcIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Toaster } from '../components/ui/sonner';

export default function App() {
  const { user, profile, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Cargando CalculaSAT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(59,130,246,0.05)_0%,rgba(248,250,252,0)_100%)]" />
      <Toaster position="top-center" richColors />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
                <CalcIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900">CalculaSAT</span>
              {profile?.isPro && (
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ml-2">
                  PRO
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-900 leading-none">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} className="rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button onClick={login} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 flex items-center gap-2 transition-all active:scale-95">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorBoundary>
          {!user ? (
            <div className="space-y-24">
              {/* Hero Section */}
              <section className="text-center space-y-8 py-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
                   <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                   <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
                    Domina tus impuestos <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">sin complicaciones.</span>
                  </h1>
                  <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                    La plataforma inteligente para contribuyentes en México. 
                    Cálculos precisos, análisis de riesgo y ahorro real.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <Button onClick={login} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-7 text-lg rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">
                    Empezar Gratis Ahora
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-7 text-lg rounded-2xl border-2 hover:bg-slate-50 transition-all">
                    Ver Demo
                  </Button>
                </motion.div>
              </section>

              {/* Features Grid */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: TrendingUp, title: "Optimización Fiscal", desc: "Descubre cómo reducir tu carga fiscal legalmente." },
                  { icon: ShieldCheck, title: "100% Seguro", desc: "Tus datos están protegidos con encriptación de grado bancario." },
                  { icon: Zap, title: "Resultados Instantáneos", desc: "Cálculos precisos basados en las tablas del SAT 2026." }
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                      <f.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </section>

              {/* Social Proof / Stats */}
              <section className="bg-slate-900 rounded-[3rem] p-12 text-center text-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                  <div>
                    <p className="text-4xl font-black mb-1">+10k</p>
                    <p className="text-slate-400 font-medium">Usuarios Activos</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black mb-1">99.9%</p>
                    <p className="text-slate-400 font-medium">Precisión Fiscal</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black mb-1">$0</p>
                    <p className="text-slate-400 font-medium">Costo Inicial</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-12">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">Bienvenido, {user.displayName?.split(' ')[0]}</h2>
                  <p className="text-slate-500">Aquí tienes el resumen de tu situación fiscal actual.</p>
                </div>
                {!profile?.isPro && (
                  <div className="bg-blue-600 p-6 rounded-3xl text-white flex items-center gap-6 shadow-xl shadow-blue-200">
                    <div className="space-y-1">
                      <p className="font-bold text-lg">Mejora a Pro</p>
                      <p className="text-blue-100 text-sm">Desbloquea historial y reportes PDF.</p>
                    </div>
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl px-6">
                      Actualizar
                    </Button>
                  </div>
                )}
              </header>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-2 space-y-8">
                  <TaxCalculator />
                </div>
                <div className="space-y-8">
                  <CalculationHistoryList />
                  
                  {/* Quick Tips Card */}
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl">
                    <BookOpen className="w-8 h-8 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">Guía Fiscal 2026</h3>
                    <p className="text-indigo-100 text-sm mb-6">Hemos preparado una guía gratuita para que entiendas el nuevo régimen RESICO.</p>
                    <Button variant="secondary" className="w-full font-bold rounded-xl">
                      Descargar Guía
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 opacity-50 grayscale">
            <CalcIcon className="w-5 h-5" />
            <span className="font-bold tracking-tighter">CalculaSAT</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2026 CalculaSAT México. No somos el SAT. Los cálculos son estimaciones informativas.
          </p>
          <div className="flex justify-center gap-6 text-slate-400 text-sm font-medium">
            <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

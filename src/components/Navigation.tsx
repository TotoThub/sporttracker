import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, BookOpen, Plus, BarChart3, Target, Dumbbell, Play, Clock, X } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/templates', icon: BookOpen, label: 'Programmes' },
  { to: '__action__', icon: Plus, label: '', accent: true },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/goals', icon: Target, label: 'Objectifs' },
]

export default function Navigation() {
  const navigate = useNavigate()
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  return (
    <>
      {showQuickMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowQuickMenu(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col gap-2.5 items-center animate-fade-in">
            {[
              { label: 'Séance libre', icon: Play, color: 'bg-primary-500/20 text-primary-400', path: '/session/new' },
              { label: 'Exercices', icon: Dumbbell, color: 'bg-orange-500/20 text-orange-400', path: '/exercises' },
              { label: 'Historique', icon: Clock, color: 'bg-purple-500/20 text-purple-400', path: '/history' },
            ].map(({ label, icon: Icon, color, path }) => (
              <button
                key={path}
                onClick={() => { setShowQuickMenu(false); navigate(path) }}
                className="flex items-center gap-3 glass rounded-2xl px-5 py-3.5 shadow-2xl hover:bg-white/[0.08] transition-all active:scale-95 min-w-[200px]"
              >
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon size={17} />
                </div>
                <span className="font-semibold text-white text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass border-t border-white/[0.06] backdrop-blur-2xl">
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {navItems.map(({ to, icon: Icon, label, accent }) =>
              accent ? (
                <button
                  key={to}
                  onClick={() => setShowQuickMenu(!showQuickMenu)}
                  className="flex flex-col items-center -mt-7"
                >
                  <div className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all active:scale-90 ${
                    showQuickMenu
                      ? 'bg-slate-700 rotate-45'
                      : 'bg-gradient-to-br from-primary-400 to-primary-600 glow-primary'
                  }`}>
                    {showQuickMenu
                      ? <X size={24} className="text-white" />
                      : <Icon size={24} className="text-white" />
                    }
                  </div>
                </button>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                      isActive ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span className="text-[10px] font-medium">{label}</span>
                    </>
                  )}
                </NavLink>
              )
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

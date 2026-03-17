import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useGoals } from '../hooks/useGoals'
import { useTemplates } from '../hooks/useTemplates'
import { TEMPLATE_COLORS } from '../types'
import { Plus, TrendingUp, Calendar, Target, Flame, Play, ArrowRight } from 'lucide-react'
import { format, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Dashboard() {
  const navigate = useNavigate()
  const { sessions, loading: loadingSessions } = useSessions()
  const { goals, loading: loadingGoals } = useGoals()
  const { templates, loading: loadingTemplates, startSessionFromTemplate } = useTemplates()

  const thisWeekSessions = sessions.filter((s) => isThisWeek(parseISO(s.date), { weekStartsOn: 1 }))
  const thisMonthSessions = sessions.filter((s) => isThisMonth(parseISO(s.date)))
  const activeGoals = goals.filter((g) => !g.achieved)
  const achievedGoals = goals.filter((g) => g.achieved)
  const totalSessions = sessions.length

  const lastSession = sessions[0]
  const loading = loadingSessions || loadingGoals || loadingTemplates

  const handleStartTemplate = async (templateId: string) => {
    const session = await startSessionFromTemplate(templateId)
    if (session) navigate(`/session/${session.id}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-slate-500 mb-0.5">{format(new Date(), "EEEE d MMMM", { locale: fr })}</p>
          <h1 className="text-3xl font-bold text-white">Sport Tracker</h1>
        </div>
        <button onClick={() => navigate('/session/new')} className="btn-primary !py-2.5 !px-4">
          <Plus size={18} />
          <span className="hidden sm:inline">Séance</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: thisWeekSessions.length, label: 'Semaine', icon: Flame, color: 'text-orange-400 bg-orange-500/15' },
              { value: thisMonthSessions.length, label: 'Mois', icon: Calendar, color: 'text-blue-400 bg-blue-500/15' },
              { value: activeGoals.length, label: 'Objectifs', icon: Target, color: 'text-green-400 bg-green-500/15' },
              { value: totalSessions, label: 'Total', icon: TrendingUp, color: 'text-purple-400 bg-purple-500/15' },
            ].map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="card !p-3 text-center">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={16} />
                </div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Programmes rapides */}
          {templates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Programmes</h2>
                <button onClick={() => navigate('/templates')} className="text-xs text-primary-400 flex items-center gap-1">
                  Voir tout <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {templates.slice(0, 5).map((template) => {
                  const colors = TEMPLATE_COLORS[template.color] ?? TEMPLATE_COLORS.blue
                  const exCount = template.exercises?.length ?? 0
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleStartTemplate(template.id)}
                      className={`flex-shrink-0 w-40 ${colors.bg} border ${colors.border} rounded-2xl p-4 text-left hover:brightness-125 transition-all active:scale-[0.97]`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <Play size={14} className={colors.text} />
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-sm truncate">{template.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{exCount} exercice{exCount > 1 ? 's' : ''}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dernière séance */}
          {lastSession && (
            <div>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Dernière séance</h2>
              <button
                onClick={() => navigate(`/session/${lastSession.id}`)}
                className="card w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {format(parseISO(lastSession.date), "EEEE d MMMM", { locale: fr })}
                    </p>
                    {lastSession.duration_minutes && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {lastSession.duration_minutes} min
                      </p>
                    )}
                  </div>
                  <span className={`badge ${lastSession.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {lastSession.completed ? 'Terminée' : 'En cours'}
                  </span>
                </div>
                {lastSession.notes && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{lastSession.notes}</p>
                )}
              </button>
            </div>
          )}

          {/* Objectifs en cours (aperçu) */}
          {activeGoals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Objectifs</h2>
                <button onClick={() => navigate('/goals')} className="text-xs text-primary-400 flex items-center gap-1">
                  Voir tout <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-2">
                {activeGoals.slice(0, 3).map((goal) => {
                  const progress = goal.target_value > 0
                    ? Math.min(100, (goal.current_value / goal.target_value) * 100)
                    : 0
                  return (
                    <div key={goal.id} className="card !p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{goal.exercise?.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Objectifs atteints */}
          {achievedGoals.length > 0 && activeGoals.length === 0 && (
            <div className="card text-center py-6">
              <TrendingUp size={32} className="text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-white">{achievedGoals.length} objectif{achievedGoals.length > 1 ? 's' : ''} atteint{achievedGoals.length > 1 ? 's' : ''}</p>
              <p className="text-sm text-slate-500 mt-1">Fixe-toi de nouveaux défis !</p>
            </div>
          )}

          {/* CTA si vide */}
          {sessions.length === 0 && templates.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                <Flame size={28} className="text-primary-400" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Prêt à commencer ?</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                Crée un programme d'entraînement ou lance une séance libre
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/templates')} className="btn-secondary">
                  Créer un programme
                </button>
                <button onClick={() => navigate('/session/new')} className="btn-primary">
                  <Plus size={18} />
                  Séance libre
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

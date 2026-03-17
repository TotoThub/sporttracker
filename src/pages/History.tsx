import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { Clock, Trash2, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function History() {
  const navigate = useNavigate()
  const { sessions, loading, deleteSession } = useSessions()

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Supprimer cette séance ?')) {
      await deleteSession(id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Historique"
        subtitle={`${sessions.length} séance${sessions.length > 1 ? 's' : ''}`}
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Aucune séance"
          description="Ton historique apparaîtra ici après ta première séance"
        />
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => navigate(`/session/${session.id}`)}
              className="card w-full text-left flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">
                    {format(parseISO(session.date), "EEE d MMM yyyy", { locale: fr })}
                  </p>
                  <span className={`badge text-xs ${session.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {session.completed ? 'Terminée' : 'En cours'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {session.duration_minutes && (
                    <span className="text-sm text-slate-500">{session.duration_minutes} min</span>
                  )}
                  {session.notes && (
                    <span className="text-sm text-slate-600 truncate">{session.notes}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
                <ChevronRight size={18} className="text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

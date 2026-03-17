import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '../hooks/useTemplates'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { TEMPLATE_COLORS, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS } from '../types'
import { Plus, BookOpen, Trash2, Play, ChevronRight } from 'lucide-react'

const COLOR_OPTIONS = Object.keys(TEMPLATE_COLORS)

export default function Templates() {
  const navigate = useNavigate()
  const { templates, loading, createTemplate, deleteTemplate, startSessionFromTemplate } = useTemplates()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('blue')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const template = await createTemplate({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    })

    if (template) {
      setName('')
      setDescription('')
      setColor('blue')
      setShowForm(false)
      navigate(`/templates/${template.id}`)
    }
  }

  const handleStart = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const session = await startSessionFromTemplate(templateId)
    if (session) {
      navigate(`/session/${session.id}`)
    }
  }

  const handleDelete = async (id: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Supprimer le programme "${templateName}" ?`)) {
      await deleteTemplate(id)
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
        title="Programmes"
        subtitle={`${templates.length} programme${templates.length > 1 ? 's' : ''}`}
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary !py-2.5 !px-4">
            <Plus size={18} />
          </button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucun programme"
          description="Crée un programme pour regrouper tes exercices et lancer des séances pré-configurées"
          action={{ label: 'Créer un programme', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {templates.map((template) => {
            const colors = TEMPLATE_COLORS[template.color] ?? TEMPLATE_COLORS.blue
            const exerciseCount = template.exercises?.length ?? 0
            const muscleGroups = [...new Set(template.exercises?.map((e) => e.exercise?.muscle_group).filter(Boolean))]

            return (
              <button
                key={template.id}
                onClick={() => navigate(`/templates/${template.id}`)}
                className={`card w-full text-left border ${colors.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`w-3 h-3 rounded-full ${colors.bg} ring-2 ${colors.border}`} />
                      <h3 className="font-bold text-white text-lg truncate">{template.name}</h3>
                    </div>
                    {template.description && (
                      <p className="text-sm text-slate-500 mb-2.5 ml-[22px]">{template.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap ml-[22px]">
                      <span className="text-xs text-slate-500">
                        {exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}
                      </span>
                      {muscleGroups.slice(0, 3).map((mg) => mg && (
                        <span key={mg} className={`badge text-[10px] ${MUSCLE_GROUP_COLORS[mg]}`}>
                          {MUSCLE_GROUP_LABELS[mg]}
                        </span>
                      ))}
                      {muscleGroups.length > 3 && (
                        <span className="badge text-[10px] bg-white/5 text-slate-500">
                          +{muscleGroups.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                    <button
                      onClick={(e) => handleStart(template.id, e)}
                      className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center hover:brightness-125 transition-all`}
                      title="Débuter ce programme"
                    >
                      <Play size={18} className={colors.text} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(template.id, template.name, e)}
                      className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center hover:bg-red-500/15 transition-colors"
                    >
                      <Trash2 size={15} className="text-slate-600" />
                    </button>
                    <ChevronRight size={18} className="text-slate-600" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal création */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouveau programme">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Push Day, Full Body, Jambes..."
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objectif du programme, fréquence..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Couleur</label>
            <div className="flex gap-2.5">
              {COLOR_OPTIONS.map((c) => {
                const cc = TEMPLATE_COLORS[c]
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-11 h-11 rounded-xl ${cc.bg} border-2 transition-all ${
                      color === c ? cc.border + ' scale-110 ring-1 ring-white/10' : 'border-transparent'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Créer le programme
          </button>
        </form>
      </Modal>
    </div>
  )
}

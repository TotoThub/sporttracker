import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTemplates } from '../hooks/useTemplates'
import { useExercises } from '../hooks/useExercises'
import Modal from '../components/Modal'
import ExercisePicker from '../components/ExercisePicker'
import {
  TEMPLATE_COLORS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUP_COLORS,
} from '../types'
import {
  Plus, Play, Trash2, ArrowLeft, GripVertical, Settings2,
} from 'lucide-react'

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    templates, loading,
    addExerciseToTemplate, updateTemplateExercise,
    removeExerciseFromTemplate, startSessionFromTemplate,
  } = useTemplates()
  const { exercises } = useExercises()

  const [showAddExercise, setShowAddExercise] = useState(false)
  const [configExerciseId, setConfigExerciseId] = useState<string | null>(null)

  const [cfgSets, setCfgSets] = useState('3')
  const [cfgReps, setCfgReps] = useState('')
  const [cfgWeight, setCfgWeight] = useState('')
  const [cfgResistance, setCfgResistance] = useState('')
  const [cfgRest, setCfgRest] = useState('90')
  const [cfgNotes, setCfgNotes] = useState('')

  const template = templates.find((t) => t.id === id)
  const colors = template ? (TEMPLATE_COLORS[template.color] ?? TEMPLATE_COLORS.blue) : TEMPLATE_COLORS.blue

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!template) {
    return <p className="text-slate-500 text-center py-20">Programme introuvable</p>
  }

  const templateExercises = template.exercises ?? []
  const availableExercises = exercises.filter(
    (e) => !templateExercises.some((te) => te.exercise_id === e.id)
  )

  const handleAddExercise = async (exerciseId: string) => {
    await addExerciseToTemplate(template.id, exerciseId)
    setShowAddExercise(false)
  }

  const handleStart = async () => {
    const session = await startSessionFromTemplate(template.id)
    if (session) navigate(`/session/${session.id}`)
  }

  const openConfig = (teId: string) => {
    const te = templateExercises.find((t) => t.id === teId)
    if (!te) return
    setCfgSets(String(te.default_sets))
    setCfgReps(te.default_reps ? String(te.default_reps) : '')
    setCfgWeight(te.default_weight_kg ? String(te.default_weight_kg) : '')
    setCfgResistance(te.default_resistance_level ?? '')
    setCfgRest(String(te.default_rest_seconds))
    setCfgNotes(te.notes ?? '')
    setConfigExerciseId(teId)
  }

  const handleSaveConfig = async () => {
    if (!configExerciseId) return
    await updateTemplateExercise(configExerciseId, {
      default_sets: Number(cfgSets) || 3,
      default_reps: cfgReps ? Number(cfgReps) : null,
      default_weight_kg: cfgWeight ? Number(cfgWeight) : null,
      default_resistance_level: cfgResistance || null,
      default_rest_seconds: Number(cfgRest) || 90,
      notes: cfgNotes || null,
    })
    setConfigExerciseId(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/templates')} className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.08] transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div className={`w-3 h-3 rounded-full ${colors.bg} ring-2 ${colors.border}`} />
        <h1 className="text-2xl font-bold text-white truncate flex-1">{template.name}</h1>
      </div>
      {template.description && (
        <p className="text-sm text-slate-500 mb-5 ml-[3.25rem]">{template.description}</p>
      )}

      {/* Start button */}
      {templateExercises.length > 0 && (
        <button
          onClick={handleStart}
          className={`w-full mb-6 py-4 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center gap-3 hover:brightness-125 transition-all active:scale-[0.98]`}
        >
          <Play size={22} className={colors.text} />
          <span className={`font-bold text-lg ${colors.text}`}>Débuter ce programme</span>
        </button>
      )}

      {/* Exercises list */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Exercices ({templateExercises.length})
        </h2>
      </div>

      {templateExercises.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-slate-500 mb-4">Ajoute des exercices à ce programme</p>
          <button onClick={() => setShowAddExercise(true)} className="btn-primary">
            <Plus size={18} />
            Ajouter un exercice
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {templateExercises
            .sort((a, b) => a.order_index - b.order_index)
            .map((te, index) => {
              const exercise = te.exercise
              if (!exercise) return null

              return (
                <div key={te.id} className="card flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <GripVertical size={16} />
                    <span className="text-xs font-mono w-5 text-slate-500">{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{exercise.name}</span>
                      <span className={`badge text-[10px] ${MUSCLE_GROUP_COLORS[exercise.muscle_group]}`}>
                        {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{te.default_sets}s</span>
                      {te.default_reps && <span>{te.default_reps}r</span>}
                      {te.default_weight_kg && <span>{te.default_weight_kg}kg</span>}
                      {te.default_resistance_level && <span>{te.default_resistance_level}</span>}
                      <span>{te.default_rest_seconds}s repos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openConfig(te.id)}
                      className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
                    >
                      <Settings2 size={14} className="text-slate-400" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Retirer "${exercise.name}" ?`)) await removeExerciseFromTemplate(te.id)
                      }}
                      className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center hover:bg-red-500/15 transition-colors"
                    >
                      <Trash2 size={14} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      <button onClick={() => setShowAddExercise(true)} className="btn-secondary w-full mt-4">
        <Plus size={18} />
        Ajouter un exercice
      </button>

      {/* Modal add exercise */}
      <Modal open={showAddExercise} onClose={() => setShowAddExercise(false)} title="Ajouter un exercice">
        <ExercisePicker
          exercises={availableExercises}
          onSelect={handleAddExercise}
          emptyMessage="Tous les exercices sont déjà dans ce programme."
        />
      </Modal>

      {/* Modal config */}
      <Modal open={!!configExerciseId} onClose={() => setConfigExerciseId(null)} title="Configuration par défaut">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Séries</label>
              <input type="number" inputMode="numeric" value={cfgSets} onChange={(e) => setCfgSets(e.target.value)} className="text-center" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Reps</label>
              <input type="number" inputMode="numeric" value={cfgReps} onChange={(e) => setCfgReps(e.target.value)} placeholder="—" className="text-center" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Poids (kg)</label>
              <input type="number" inputMode="decimal" value={cfgWeight} onChange={(e) => setCfgWeight(e.target.value)} placeholder="—" className="text-center" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Résistance</label>
              <input type="text" value={cfgResistance} onChange={(e) => setCfgResistance(e.target.value)} placeholder="ex: R2+R3" className="text-center" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Repos (secondes)</label>
            <input type="number" inputMode="numeric" value={cfgRest} onChange={(e) => setCfgRest(e.target.value)} className="text-center" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Notes</label>
            <textarea value={cfgNotes} onChange={(e) => setCfgNotes(e.target.value)} placeholder="Consignes d'exécution..." rows={2} className="resize-none" />
          </div>

          <button onClick={handleSaveConfig} className="btn-primary w-full mt-2">
            Enregistrer
          </button>
        </div>
      </Modal>
    </div>
  )
}

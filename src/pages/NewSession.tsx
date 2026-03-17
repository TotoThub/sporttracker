import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import PageHeader from '../components/PageHeader'
import { format } from 'date-fns'

export default function NewSession() {
  const navigate = useNavigate()
  const { createSession } = useSessions()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    const session = await createSession({ date, notes: notes.trim() || undefined })
    if (session) {
      navigate(`/session/${session.id}`)
    }
    setCreating(false)
  }

  return (
    <div>
      <PageHeader title="Nouvelle séance" subtitle="Prêt à t'entraîner ?" />

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-400 mb-1.5 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-400 mb-1.5 block">Notes (optionnel)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Focus du jour, état de forme..."
            rows={3}
            className="w-full resize-none"
          />
        </div>

        <button type="submit" disabled={creating} className="btn-primary w-full">
          {creating ? 'Création...' : 'Commencer la séance'}
        </button>
      </form>
    </div>
  )
}

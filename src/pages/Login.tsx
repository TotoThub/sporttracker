import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Dumbbell, Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (isSignUp && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }

    setLoading(true)

    if (isSignUp) {
      const { error: err } = await signUp(email, password)
      if (err) {
        setError(err)
      } else {
        setSuccess('Compte créé ! Vérifie tes emails pour confirmer ton inscription.')
      }
    } else {
      const { error: err } = await signIn(email, password)
      if (err) {
        setError(err === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : err)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{
           background: '#060a13',
           backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(14, 165, 233, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99, 102, 241, 0.08), transparent)',
         }}>

      {/* Logo */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-6 shadow-2xl glow-primary">
        <Dumbbell size={36} className="text-white" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-1">Sport Tracker</h1>
      <p className="text-slate-500 text-sm mb-10">Suivi de renforcement musculaire</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="!pl-12"
            required
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="!pl-12"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
        </div>

        {isSignUp && (
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              className="!pl-12"
              required
              autoComplete="new-password"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Toggle */}
      <button
        onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
        className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
      </button>
    </div>
  )
}

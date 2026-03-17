import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Exercises from './pages/Exercises'
import Templates from './pages/Templates'
import TemplateDetail from './pages/TemplateDetail'
import NewSession from './pages/NewSession'
import SessionDetail from './pages/SessionDetail'
import History from './pages/History'
import Stats from './pages/Stats'
import Goals from './pages/Goals'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: '#060a13' }}>
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/templates/:id" element={<TemplateDetail />} />
        <Route path="/session/new" element={<NewSession />} />
        <Route path="/session/:id" element={<SessionDetail />} />
        <Route path="/history" element={<History />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/goals" element={<Goals />} />
      </Routes>
    </Layout>
  )
}

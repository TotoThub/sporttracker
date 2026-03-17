import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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

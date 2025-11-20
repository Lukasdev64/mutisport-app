import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Sports from './components/Sports'
import FreemiumModel from './components/FreemiumModel'
import Events from './components/Events'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import './App.css'
import './accessibility.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Route de la landing page */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Hero />
              <FreemiumModel />
              <Sports />
              <Events />
              <Footer />
            </>
          }
        />

        {/* Routes d'authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirections depuis anciennes routes publiques vers dashboard */}
        <Route path="/tournament/create" element={<Navigate to="/dashboard/tournaments/create" replace />} />
        <Route path="/tournament/:code" element={<Navigate to="/dashboard/tournaments" replace />} />
        <Route path="/tournament/:code/manage" element={<Navigate to="/dashboard/tournaments" replace />} />
        <Route path="/competition/:id" element={<Navigate to="/dashboard/tournaments" replace />} />

        {/* Routes protégées - TOUT dans le dashboard */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/welcome" element={<Navigate to="/dashboard" replace />} />
        
        {/* Redirection pour les routes non trouvées */}
        <Route path="*" element={
          <>
            <Header />
            <main style={{ 
              minHeight: '70vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '2rem'
            }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
              <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                Page non trouvée
              </p>
              <a 
                href="/" 
                style={{ 
                  color: '#667eea',
                  textDecoration: 'none',
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #667eea',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#667eea'
                  e.target.style.color = 'white'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#667eea'
                }}
              >
                Retour à l'accueil
              </a>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </Router>
  )
}

export default App

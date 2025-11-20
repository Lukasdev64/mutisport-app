import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Sports from './components/Sports'
import FreemiumModel from './components/FreemiumModel'
import Events from './components/Events'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CompetitionDetails from './pages/CompetitionDetails'
import TournamentCreate from './pages/tournament/TournamentCreate'
import TournamentView from './pages/tournament/TournamentView'
import TournamentManage from './pages/tournament/TournamentManage'
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

        {/* Routes de tournoi anonyme (tennis pour seniors) */}
        <Route path="/tournament/create" element={<TournamentCreate />} />
        <Route path="/tournament/:code" element={<TournamentView />} />
        <Route path="/tournament/:code/manage" element={<TournamentManage />} />

        {/* Routes protégées */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/competition/:id" element={<CompetitionDetails />} />
        <Route path="/welcome" element={<Dashboard />} />
        
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

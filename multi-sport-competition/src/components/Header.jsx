import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Header.css'

function Header() {
  const location = useLocation()
  const [user, setUser] = useState(null)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  // Header simplifié pour les pages d'authentification
  if (isAuthPage) {
    return (
      <header className="header auth-header" role="banner">
        <nav className="navbar" role="navigation" aria-label="Navigation principale">
          <div className="nav-brand">
            <h2>
              <Link to="/" aria-label="SportChampions - Retour à l'accueil">
                SportChampions
              </Link>
            </h2>
          </div>
          <div className="nav-auth">
            {location.pathname === '/login' ? (
              <Link to="/register" className="btn-secondary">
                S'inscrire
              </Link>
            ) : (
              <Link to="/login" className="btn-secondary">
                Se connecter
              </Link>
            )}
          </div>
        </nav>
      </header>
    )
  }
  
  return (
    <header className="header" role="banner">
      <nav className="navbar" role="navigation" aria-label="Navigation principale">
        <div className="nav-brand">
          <h2>
            <Link to="/" aria-label="SportChampions - Retour à l'accueil">
              SportChampions
            </Link>
          </h2>
        </div>
        <ul className="nav-menu" role="menubar">
          <li role="none">
            <a href="#accueil" role="menuitem" aria-current="page">Accueil</a>
          </li>
          <li role="none">
            <a href="#sports" role="menuitem">Fonctionnalités</a>
          </li>
          <li role="none">
            <Link to="/pricing" role="menuitem">Tarifs</Link>
          </li>
          <li role="none">
            <a href="#evenements" role="menuitem">Événements</a>
          </li>
          <li role="none">
            <a href="#inscription" role="menuitem">Démarrer</a>
          </li>
          <li role="none">
            <a href="#contact" role="menuitem">Contact</a>
          </li>
        </ul>
        <div className="nav-cta">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Mon Espace
            </Link>
          ) : (
            <>
              <Link 
                to="/register"
                className="btn-primary"
                aria-describedby="access-desc"
              >
                Accès gratuit
              </Link>
              <span id="access-desc" className="sr-only">
                Commencer à utiliser la plateforme gratuitement sans inscription
              </span>
              <Link to="/login" className="btn-secondary">
                Se connecter
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
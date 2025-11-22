import { NavLink } from 'react-router-dom'
import { 
  FiUser, 
  FiCalendar, 
  FiMessageSquare, 
  FiCheckSquare, 
  FiTrendingUp, 
  FiSettings,
  FiUsers,
  FiAward,
  FiCreditCard
} from 'react-icons/fi'
import './Sidebar.css'

function Sidebar({ user, onSignOut }) {
  const navItems = [
    { 
      path: '/dashboard/profile', 
      icon: <FiUser />, 
      label: 'Mon Profil',
      description: 'Informations personnelles'
    },
    { 
      path: '/dashboard/competitions', 
      icon: <FiCalendar />, 
      label: 'Compétitions',
      description: 'Gérer les événements'
    },
    { 
      path: '/dashboard/participants', 
      icon: <FiUsers />, 
      label: 'Participants',
      description: 'Inscriptions et équipes'
    },
    { 
      path: '/dashboard/availability', 
      icon: <FiCheckSquare />, 
      label: 'Disponibilités',
      description: 'Présences confirmées'
    },
    { 
      path: '/dashboard/results', 
      icon: <FiAward />, 
      label: 'Résultats',
      description: 'Classements et scores'
    },
    { 
      path: '/dashboard/stats', 
      icon: <FiTrendingUp />, 
      label: 'Statistiques',
      description: 'Analyses et graphiques'
    },
    { 
      path: '/dashboard/messages', 
      icon: <FiMessageSquare />, 
      label: 'Messages',
      description: 'Communication',
      badge: 3
    },
    { 
      path: '/pricing', 
      icon: <FiCreditCard />, 
      label: 'Tarifs',
      description: 'Plans et abonnements'
    },
    { 
      path: '/dashboard/settings', 
      icon: <FiSettings />, 
      label: 'Paramètres',
      description: 'Configuration'
    },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">🏆</div>
          <h2>SportChampions</h2>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
             user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="user-info">
            <p className="user-name">
              {user?.user_metadata?.full_name || 'Utilisateur'}
            </p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={onSignOut} className="signout-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

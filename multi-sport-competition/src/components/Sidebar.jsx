import { NavLink } from 'react-router-dom'
import { 
  User, 
  Trophy, 
  Users, 
  Calendar, 
  BarChart2, 
  MessageSquare, 
  Settings, 
  LogOut,
  Award,
  CheckSquare
} from 'lucide-react'
import './Sidebar.css'

function Sidebar({ user, onSignOut }) {
  const navItems = [
    {
      path: '/dashboard/profile',
      icon: <User size={20} />,
      label: 'Mon Profil',
    },
    {
      path: '/dashboard/tournaments',
      icon: <Trophy size={20} />,
      label: 'Tournois',
    },
    {
      path: '/dashboard/participants',
      icon: <Users size={20} />,
      label: 'Participants',
    },
    { 
      path: '/dashboard/availability', 
      icon: <CheckSquare size={20} />, 
      label: 'Disponibilités',
    },
    { 
      path: '/dashboard/results', 
      icon: <Award size={20} />, 
      label: 'Résultats',
    },
    { 
      path: '/dashboard/stats', 
      icon: <BarChart2 size={20} />, 
      label: 'Statistiques',
    },
    { 
      path: '/dashboard/messages', 
      icon: <MessageSquare size={20} />, 
      label: 'Messages',
      badge: 3
    },
    { 
      path: '/dashboard/settings', 
      icon: <Settings size={20} />, 
      label: 'Paramètres',
    },
  ]

  // Get initials for avatar
  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Trophy className="logo-icon" size={28} />
          <h2>SportChampions</h2>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {getInitials()}
        </div>
        <div className="user-info">
          <p className="user-name">
            {user?.user_metadata?.full_name || 'Utilisateur'}
          </p>
          <p className="user-email">{user?.email}</p>
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
                <span className="nav-label">{item.label}</span>
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
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

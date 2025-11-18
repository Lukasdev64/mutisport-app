import './Events.css'

function Events() {
  const events = [
    {
      name: 'Championnat Multi-Sport d\'Été',
      date: '15-25 Juin 2025',
      location: 'Paris, France',
      sports: ['Tennis', 'Natation', 'Athlétisme', 'Cyclisme'],
      participants: 1200,
      prize: '50,000€',
      status: 'Inscriptions ouvertes'
    },
    {
      name: 'Coupe Internationale de Football',
      date: '10-20 Juillet 2025',
      location: 'Lyon, France',
      sports: ['Football'],
      participants: 800,
      prize: '75,000€',
      status: 'Bientôt disponible'
    },
    {
      name: 'Festival des Sports Aquatiques',
      date: '5-15 Août 2025',
      location: 'Nice, France',
      sports: ['Natation', 'Water-polo'],
      participants: 400,
      prize: '30,000€',
      status: 'Inscriptions ouvertes'
    }
  ]

  return (
    <section id="evenements" className="events-section" aria-label="Événements à venir">
      <div className="container">
        <header className="section-header">
          <h2>Événements À Venir</h2>
          <p>Participez aux plus grands événements sportifs de l'année</p>
        </header>
        <div className="events-grid" role="list">
          {events.map((event, index) => (
            <article key={index} className="event-card" role="listitem">
              <header className="event-header">
                <h3>{event.name}</h3>
                <span 
                  className={`event-status ${event.status === 'Inscriptions ouvertes' ? 'open' : 'soon'}`}
                  aria-label={event.status === 'Inscriptions ouvertes' ? 'Inscriptions actuellement ouvertes' : 'Inscriptions bientôt disponibles'}
                >
                  {event.status}
                </span>
              </header>
              <div className="event-details">
                <div className="event-info">
                  <div className="info-item">
                    <span className="icon" aria-hidden="true">📅</span>
                    <span>{event.date}</span>
                  </div>
                  <div className="info-item">
                    <span className="icon" aria-hidden="true">📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="icon" aria-hidden="true">👥</span>
                    <span>{event.participants} participants attendus</span>
                  </div>
                  <div className="info-item">
                    <span className="icon" aria-hidden="true">🏆</span>
                    <span>Prix total: {event.prize}</span>
                  </div>
                </div>
                <div className="event-sports">
                  <h4>Sports inclus:</h4>
                  <div className="sports-list" role="list">
                    {event.sports.map((sport, sportIndex) => (
                      <span key={sportIndex} className="sport-tag" role="listitem">{sport}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="event-actions" role="group" aria-label="Actions pour l'événement">
                <button 
                  className={`btn-event ${event.status === 'Inscriptions ouvertes' ? 'primary' : 'disabled'}`}
                  aria-describedby={`event-action-desc-${index}`}
                  disabled={event.status !== 'Inscriptions ouvertes'}
                >
                  {event.status === 'Inscriptions ouvertes' ? 'Accéder gratuitement' : 'Bientôt disponible'}
                </button>
                <span id={`event-action-desc-${index}`} className="sr-only">
                  {event.status === 'Inscriptions ouvertes' 
                    ? `Accéder à l'événement ${event.name} sans inscription`
                    : `Les inscriptions pour ${event.name} ouvriront bientôt`
                  }
                </span>
                <button className="btn-event secondary">Découvrir</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Events
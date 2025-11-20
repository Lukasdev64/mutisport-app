/**
 * Tournament Error Boundary
 * Specialized error boundary for tournament pages
 */

import React from 'react'
import ErrorBoundary from '../ErrorBoundary'
import { useNavigate } from 'react-router-dom'
import '../ErrorBoundary.css'

const TournamentErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate()

  const handleGoToTournaments = () => {
    navigate('/dashboard/tournaments')
  }

  return (
    <div className="error-boundary">
      <div className="error-boundary__content">
        <div className="error-boundary__icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>

        <h1 className="error-boundary__title">Tournament Error</h1>

        <p className="error-boundary__message">
          We encountered an error while loading this tournament.
          This might be due to invalid data or a network issue.
        </p>

        <div className="error-boundary__actions">
          <button
            className="error-boundary__btn error-boundary__btn--primary"
            onClick={resetError}
          >
            Retry
          </button>

          <button
            className="error-boundary__btn error-boundary__btn--secondary"
            onClick={handleGoToTournaments}
          >
            View All Tournaments
          </button>
        </div>
      </div>
    </div>
  )
}

const TournamentErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<TournamentErrorFallback />}
      message="An error occurred while loading the tournament."
    >
      {children}
    </ErrorBoundary>
  )
}

export default TournamentErrorBoundary

/**
 * FormatSelector - Composant pour sélectionner le format de tournoi
 * Design optimisé pour seniors avec grandes cartes cliquables
 */

import { useState } from 'react'
import { Trophy, Swords, RotateCw, BarChart2, Check } from 'lucide-react'
import { getFormatName, calculateMatchCount } from '../../utils/bracketAlgorithms'
import './FormatSelector.css'

const FormatSelector = ({ selectedFormat, onSelect, playerCount = 8 }) => {
  const formats = [
    {
      id: 'single-elimination',
      name: 'Élimination Simple',
      icon: <Trophy size={40} />,
      description: 'Une défaite = élimination',
      details: 'Le format le plus simple et rapide. Chaque match perdu élimine le joueur.',
      recommended: true,
    },
    {
      id: 'double-elimination',
      name: 'Double Élimination',
      icon: <Swords size={40} />,
      description: 'Deux défaites pour être éliminé',
      details: 'Plus de matchs, seconde chance pour les perdants via le bracket des perdants.',
      recommended: false,
    },
    {
      id: 'round-robin',
      name: 'Round-Robin',
      icon: <RotateCw size={40} />,
      description: 'Tous contre tous',
      details: 'Chaque joueur affronte tous les autres. Classement au nombre de victoires.',
      recommended: false,
    },
    {
      id: 'swiss',
      name: 'Système Suisse',
      icon: <BarChart2 size={40} />,
      description: 'Appariements dynamiques',
      details: 'Les joueurs affrontent des adversaires de niveau similaire à chaque tour.',
      recommended: false,
    },
  ]

  const handleSelect = (formatId) => {
    onSelect(formatId)
  }

  return (
    <div className="format-selector" role="radiogroup" aria-labelledby="format-selector-title">
      <div className="format-selector-header">
        <h2 id="format-selector-title">Choisissez le format de votre tournoi</h2>
        <p className="format-selector-subtitle">
          Sélectionnez le type de tournoi qui convient le mieux à votre événement
        </p>
      </div>

      <div className="format-cards">
        {formats.map((format) => {
          const matchCount = calculateMatchCount(format.id, playerCount)
          const isSelected = selectedFormat === format.id

          return (
            <div
              key={format.id}
              className={`format-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(format.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(format.id)
                }
              }}
            >
              {format.recommended && (
                <div className="format-badge">Recommandé</div>
              )}

              <div className="format-icon" aria-hidden="true">{format.icon}</div>

              <h3 className="format-name">{format.name}</h3>

              <p className="format-description">{format.description}</p>

              <p className="format-details">{format.details}</p>

              <div className="format-stats">
                <div className="format-stat">
                  <span className="stat-label">Matchs:</span>
                  <span className="stat-value">{matchCount}</span>
                </div>
              </div>

              {isSelected && (
                <div className="format-selected-indicator">
                  <Check size={14} style={{ marginRight: 4 }} /> Sélectionné
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedFormat && (
        <div className="format-confirmation">
          <p>
            <Check size={18} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} />
            Format sélectionné: <strong>{getFormatName(selectedFormat)}</strong>
          </p>
          <p className="format-match-info">
            Ce tournoi comprendra <strong>{calculateMatchCount(selectedFormat, playerCount)} matchs</strong> au total.
          </p>
        </div>
      )}
    </div>
  )
}

export default FormatSelector

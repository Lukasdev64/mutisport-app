import React from 'react'
import './AvailabilityDisplay.css'

/**
 * Displays a player's availability
 * @param {object} props
 * @param {object} props.availability - { dates: [], time_ranges: [] }
 */
export default function AvailabilityDisplay({ availability }) {
  if (!availability || (!availability.dates && !availability.time_ranges)) {
    return <span className="availability-empty">No availability info</span>
  }

  const dates = availability.dates || []
  const ranges = availability.time_ranges || []

  return (
    <div className="availability-display">
      <div className="availability-section">
        <span className="availability-label">Dates:</span>
        {dates.length > 0 ? (
          <div className="availability-tags">
            {dates.map(date => (
              <span key={date} className="availability-tag date-tag">
                {new Date(date).toLocaleDateString()}
              </span>
            ))}
          </div>
        ) : (
          <span className="availability-text">All dates</span>
        )}
      </div>

      <div className="availability-section">
        <span className="availability-label">Times:</span>
        {ranges.length > 0 ? (
          <div className="availability-tags">
            {ranges.map((range, idx) => (
              <span key={idx} className="availability-tag time-tag">
                {range.start} - {range.end}
              </span>
            ))}
          </div>
        ) : (
          <span className="availability-text">All times</span>
        )}
      </div>
    </div>
  )
}

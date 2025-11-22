/**
 * Scheduling Service
 *
 * Handles the automatic scheduling of matches based on player availability.
 *
 * @module schedulingService
 */

import { supabase } from '../../lib/supabase'

/**
 * Helper to parse time string "HH:MM" to minutes from midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Helper to format minutes from midnight to "HH:MM"
 */
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * Find common availability between two players
 * @param {object} p1 - Player 1 object with availability
 * @param {object} p2 - Player 2 object with availability
 * @returns {object|null} - { date: "YYYY-MM-DD", start: "HH:MM", end: "HH:MM" } or null
 */
export function findCommonAvailability(p1, p2) {
  const p1Avail = p1.availability || { dates: [], time_ranges: [] }
  const p2Avail = p2.availability || { dates: [], time_ranges: [] }

  // 1. Find common dates
  // If no specific dates listed, assume available all dates of tournament (simplified)
  // For this implementation, we require explicit dates or assume intersection if both have them
  const p1Dates = p1Avail.dates || []
  const p2Dates = p2Avail.dates || []
  
  let commonDates = []
  if (p1Dates.length === 0 && p2Dates.length === 0) {
      // Fallback: assume today/tomorrow if nothing specified
      commonDates = [new Date().toISOString().split('T')[0]] 
  } else if (p1Dates.length === 0) {
      commonDates = p2Dates
  } else if (p2Dates.length === 0) {
      commonDates = p1Dates
  } else {
      commonDates = p1Dates.filter(d => p2Dates.includes(d))
  }

  if (commonDates.length === 0) return null

  // 2. Find common time ranges on those dates
  // Simplified: assume time ranges apply to all dates
  const p1Ranges = p1Avail.time_ranges || [{ start: "09:00", end: "18:00" }]
  const p2Ranges = p2Avail.time_ranges || [{ start: "09:00", end: "18:00" }]

  for (const date of commonDates) {
    for (const r1 of p1Ranges) {
      for (const r2 of p2Ranges) {
        const start1 = timeToMinutes(r1.start)
        const end1 = timeToMinutes(r1.end)
        const start2 = timeToMinutes(r2.start)
        const end2 = timeToMinutes(r2.end)

        const commonStart = Math.max(start1, start2)
        const commonEnd = Math.min(end1, end2)

        // Need at least 60 mins for a match
        if (commonEnd - commonStart >= 60) {
          return {
            date,
            start: minutesToTime(commonStart),
            end: minutesToTime(commonStart + 60) // Schedule for 1 hour
          }
        }
      }
    }
  }

  return null
}

/**
 * Generate schedule for pending matches in a tournament
 * @param {string} tournamentId
 * @returns {Promise<{scheduled: number, error: object|null}>}
 */
export async function generateSchedule(tournamentId) {
  try {
    // 1. Get pending matches with players
    const { data: matches, error: matchError } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        player1:player1_id(*),
        player2:player2_id(*)
      `)
      .eq('tournament_id', tournamentId)
      .eq('status', 'pending')
      .not('player1_id', 'is', null)
      .not('player2_id', 'is', null)

    if (matchError) throw matchError
    
    let scheduledCount = 0
    const updates = []

    // 2. Iterate and find slots
    // Naive approach: doesn't check for court conflicts yet, just player availability
    for (const match of matches) {
      if (match.scheduled_at) continue // Already scheduled

      const slot = findCommonAvailability(match.player1, match.player2)
      
      if (slot) {
        const scheduledAt = `${slot.date}T${slot.start}:00`
        
        updates.push(
          supabase
            .from('tournament_matches')
            .update({ 
              scheduled_at: scheduledAt,
              court: 'Court TBD' // Placeholder
            })
            .eq('id', match.id)
        )
        scheduledCount++
      }
    }

    await Promise.all(updates)

    return { scheduled: scheduledCount, error: null }

  } catch (err) {
    console.error('Scheduling failed:', err)
    return { scheduled: 0, error: err }
  }
}

export default {
  generateSchedule,
  findCommonAvailability
}

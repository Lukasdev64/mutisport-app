/**
 * Verification Script for Tournament Scheduling
 * 
 * Run this script to verify the selection and scheduling logic.
 * Usage: node test_scheduling_flow.js
 * 
 * Note: This script mocks Supabase calls to test logic in isolation.
 */

import selectionService from './src/services/tournament/selectionService.js'
import schedulingService from './src/services/tournament/schedulingService.js'

// Mock Data
const mockPlayers = [
    { id: 'p1', name: 'Early Bird', registration_date: '2023-10-01T10:00:00Z', status: 'registered', availability: { dates: ['2023-10-27'] } },
    { id: 'p2', name: 'Late Comer', registration_date: '2023-10-05T10:00:00Z', status: 'registered', availability: { dates: ['2023-10-27'] } },
    { id: 'p3', name: 'Busy Bee', registration_date: '2023-10-02T10:00:00Z', status: 'registered', availability: { time_ranges: [{ start: '09:00', end: '10:00' }] } } // Very limited
]

// Mock Supabase
const mockSupabase = {
    from: (table) => ({
        select: () => ({
            eq: () => ({
                eq: () => ({ data: mockPlayers, error: null }), // For selectPlayers
                single: () => ({ data: { name: 'Test Tournament' } }) // For tournament details
            }),
            single: () => ({ data: { count: 0 } }) // For current confirmed count
        }),
        update: (updates) => ({
            eq: (col, val) => {
                console.log(`[MOCK DB] Update ${table} where ${col}=${val}:`, updates)
                return { then: (cb) => cb() } // Mock promise
            }
        })
    })
}

// Monkey patch services to use mock supabase (if possible, or just test logic functions)
// Since we can't easily mock imports in this script without a test runner, 
// we will test the pure functions we exposed.

console.log('--- Testing Selection Logic ---')

const score1 = selectionService.scorePlayer(mockPlayers[0])
const score2 = selectionService.scorePlayer(mockPlayers[1])
const score3 = selectionService.scorePlayer(mockPlayers[2])

console.log(`Player 1 Score (Early): ${score1}`)
console.log(`Player 2 Score (Late): ${score2}`)
console.log(`Player 3 Score (Busy): ${score3}`)

if (score1 < score2) console.log('✅ Early registration prioritized')
else console.error('❌ Early registration NOT prioritized')

if (score3 > score2) console.log('✅ Constraints penalized')
else console.error('❌ Constraints NOT penalized')


console.log('\n--- Testing Scheduling Logic ---')

const p1 = { availability: { dates: ['2023-10-27'], time_ranges: [{ start: '09:00', end: '12:00' }] } }
const p2 = { availability: { dates: ['2023-10-27'], time_ranges: [{ start: '11:00', end: '14:00' }] } }
const p3 = { availability: { dates: ['2023-10-28'] } } // Different date

const common12 = schedulingService.findCommonAvailability(p1, p2)
console.log('Common P1-P2:', common12)

if (common12 && common12.start === '11:00' && common12.end === '12:00') {
    console.log('✅ Found correct overlap')
} else {
    console.error('❌ Failed to find overlap')
}

const common13 = schedulingService.findCommonAvailability(p1, p3)
console.log('Common P1-P3:', common13)

if (common13 === null) {
    console.log('✅ Correctly identified no overlap')
} else {
    console.error('❌ Incorrectly found overlap')
}

import { describe, it, expect, vi } from 'vitest'
import selectionService from './src/services/tournament/selectionService'
import schedulingService from './src/services/tournament/schedulingService'

// Mock Supabase
vi.mock('./src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ data: [], error: null })),
          single: vi.fn(() => ({ data: {} }))
        })),
        single: vi.fn(() => ({ data: { count: 0 } }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    }))
  }
}))

// Mock Notification Service
vi.mock('./src/services/notificationService', () => ({
  default: {
    sendConfirmationEmail: vi.fn(),
    sendWaitlistEmail: vi.fn(),
    sendRejectionEmail: vi.fn()
  }
}))

describe('Selection Service', () => {
  it('prioritizes early registration', () => {
    const p1 = { registration_date: '2023-10-01T10:00:00Z' }
    const p2 = { registration_date: '2023-10-05T10:00:00Z' }
    
    const score1 = selectionService.scorePlayer(p1)
    const score2 = selectionService.scorePlayer(p2)
    
    expect(score1).toBeLessThan(score2)
  })

  it('penalizes constraints', () => {
    const p1 = { 
      registration_date: '2023-10-01T10:00:00Z',
      availability: { time_ranges: [{ start: '09:00', end: '10:00' }] } // 1 hour avail
    }
    const p2 = { 
      registration_date: '2023-10-01T10:00:00Z',
      availability: { time_ranges: [{ start: '09:00', end: '18:00' }] } // 9 hours avail
    }
    
    const score1 = selectionService.scorePlayer(p1)
    const score2 = selectionService.scorePlayer(p2)
    
    expect(score1).toBeGreaterThan(score2)
  })
})

describe('Scheduling Service', () => {
  it('finds common availability', () => {
    const p1 = { availability: { dates: ['2023-10-27'], time_ranges: [{ start: '09:00', end: '12:00' }] } }
    const p2 = { availability: { dates: ['2023-10-27'], time_ranges: [{ start: '11:00', end: '14:00' }] } }
    
    const common = schedulingService.findCommonAvailability(p1, p2)
    
    expect(common).not.toBeNull()
    expect(common.date).toBe('2023-10-27')
    expect(common.start).toBe('11:00')
    expect(common.end).toBe('12:00')
  })

  it('returns null for no overlap', () => {
    const p1 = { availability: { dates: ['2023-10-27'] } }
    const p2 = { availability: { dates: ['2023-10-28'] } }
    
    const common = schedulingService.findCommonAvailability(p1, p2)
    
    expect(common).toBeNull()
  })
})

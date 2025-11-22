/**
 * Notification Service
 *
 * Handles sending notifications (emails) to players.
 * Currently simulates email sending by logging to console and returning success.
 * In a real production environment, this would integrate with a provider like Resend or SendGrid.
 *
 * @module notificationService
 */

/**
 * Send a confirmation email to a player
 * @param {object} player - The player object
 * @param {object} tournament - The tournament object
 * @returns {Promise<boolean>}
 */
export async function sendConfirmationEmail(player, tournament) {
  console.log(`📧 [MOCK EMAIL] Sending confirmation to ${player.email || player.name}`)
  console.log(`Subject: Registration Confirmed for ${tournament.name}`)
  console.log(`Body: Hello ${player.name}, you have been selected for the tournament!`)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return true
}

/**
 * Send a waitlist email to a player
 * @param {object} player - The player object
 * @param {object} tournament - The tournament object
 * @returns {Promise<boolean>}
 */
export async function sendWaitlistEmail(player, tournament) {
  console.log(`📧 [MOCK EMAIL] Sending waitlist notification to ${player.email || player.name}`)
  console.log(`Subject: You are on the waitlist for ${tournament.name}`)
  console.log(`Body: Hello ${player.name}, the tournament is full but you are on the waitlist.`)
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return true
}

/**
 * Send a rejection email to a player
 * @param {object} player - The player object
 * @param {object} tournament - The tournament object
 * @param {string} reason - The reason for rejection
 * @returns {Promise<boolean>}
 */
export async function sendRejectionEmail(player, tournament, reason) {
  console.log(`📧 [MOCK EMAIL] Sending rejection notification to ${player.email || player.name}`)
  console.log(`Subject: Update regarding ${tournament.name}`)
  console.log(`Body: Hello ${player.name}, unfortunately we could not accommodate your registration. Reason: ${reason}`)
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return true
}

export default {
  sendConfirmationEmail,
  sendWaitlistEmail,
  sendRejectionEmail
}

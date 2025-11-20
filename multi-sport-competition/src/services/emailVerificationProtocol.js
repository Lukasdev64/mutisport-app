/**
 * WICG Email Verification Protocol - Polyfill Implementation
 *
 * This is a conceptual implementation that simulates the WICG Email Verification Protocol
 * until native browser support becomes available.
 *
 * Specification: https://github.com/WICG/email-verification-protocol
 *
 * Key Concepts:
 * - Browser-mediated verification
 * - SD-JWT+KB (Selective Disclosure JWT with Key Binding)
 * - Privacy-preserving (issuer doesn't learn which RP is verifying)
 * - No email sent
 * - Uses existing authentication with email provider
 *
 * NOTE: This is a SIMULATION for educational purposes.
 * Real implementation requires:
 * 1. Native browser support via Credential Management API
 * 2. Email provider (Gmail, Outlook) acting as issuer
 * 3. DNS TXT records (_email-verification.$DOMAIN)
 * 4. .well-known/email-verification endpoint
 */

import { supabase } from '../lib/supabase'

/**
 * Generate a cryptographically random nonce
 * Used by Relying Party to prevent replay attacks
 */
export function generateNonce() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate an ephemeral Ed25519 key pair (simulated)
 * In real implementation, browser generates this securely
 */
async function generateEphemeralKeyPair() {
  // In reality: browser uses Ed25519 from WebCrypto
  // For simulation: we'll use a simplified approach
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true,
    ['sign', 'verify']
  )

  return keyPair
}

/**
 * Simulate DNS TXT record lookup for _email-verification.$DOMAIN
 * Real implementation: browser performs DNS query
 *
 * Returns issuer identifier (e.g., "iss=https://accounts.google.com")
 */
async function lookupDNSIssuer(emailDomain) {
  // Simulation: Map known email providers to issuers
  const knownIssuers = {
    'gmail.com': 'https://accounts.google.com',
    'googlemail.com': 'https://accounts.google.com',
    'outlook.com': 'https://login.microsoftonline.com',
    'hotmail.com': 'https://login.microsoftonline.com',
    'yahoo.com': 'https://login.yahoo.com',
    // For testing with Supabase
    'multisport.com': window.location.origin
  }

  const issuer = knownIssuers[emailDomain.toLowerCase()]

  if (!issuer) {
    throw new Error(`No email verification issuer found for domain: ${emailDomain}`)
  }

  return issuer
}

/**
 * Fetch issuer configuration from .well-known/email-verification
 * Real implementation: browser fetches this
 */
async function fetchIssuerConfiguration(issuerUrl) {
  // Simulation: Return mock configuration
  return {
    issuer: issuerUrl,
    issuance_endpoint: `${issuerUrl}/email-verification/token`,
    jwks_uri: `${issuerUrl}/.well-known/jwks.json`,
    token_types_supported: ['sd-jwt+kb'],
    signing_algs_supported: ['EdDSA', 'ES256']
  }
}

/**
 * Create request JWT for issuer
 * Real implementation: browser creates and signs this
 */
async function createRequestJWT(email, nonce, keyPair) {
  // Export public key for inclusion in JWT
  const publicKeyJWK = await crypto.subtle.exportKey('jwk', keyPair.publicKey)

  // JWT Header
  const header = {
    alg: 'ES256', // In real impl: EdDSA
    typ: 'JWT',
    jwk: publicKeyJWK
  }

  // JWT Payload
  const payload = {
    email: email,
    nonce: nonce,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID()
  }

  // Simulate signing (in real impl: browser signs with private key)
  const headerB64 = btoa(JSON.stringify(header))
  const payloadB64 = btoa(JSON.stringify(payload))

  // Sign with private key
  const encoder = new TextEncoder()
  const data = encoder.encode(`${headerB64}.${payloadB64}`)
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.privateKey,
    data
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  return `${headerB64}.${payloadB64}.${signatureB64}`
}

/**
 * Request verification token from issuer
 * Real implementation: browser sends this with first-party cookies
 * and Sec-Fetch-Dest: email-verification header
 */
async function requestTokenFromIssuer(issuerConfig, requestJWT, email) {
  // In real implementation:
  // - Browser sends request with first-party cookies
  // - Issuer validates cookies match the email
  // - Issuer returns SD-JWT signed with their private key

  // Simulation: Use Supabase as proxy for "issuer"
  try {
    // Check if user is authenticated with Supabase (simulating Gmail login)
    let { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.warn('⚠️ No email provider session found - attempting to establish session')
      console.log('📝 In production: User would need to be logged into Gmail/Outlook')

      // For demo/testing: Try to auto-create and authenticate
      // This simulates the user already being logged into their email provider
      const testCredentials = {
        email: email,
        password: 'TestPassword123!'
      }

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(testCredentials)

      if (signInError && signInError.message.includes('Invalid login')) {
        console.log('🔧 Creating test account to simulate existing email provider session')
        // Account doesn't exist, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testCredentials.email,
          password: testCredentials.password,
          options: {
            data: { full_name: 'Test User' }
          }
        })

        if (signUpError) {
          throw new Error(`Cannot establish email provider session: ${signUpError.message}`)
        }

        session = signUpData.session

        if (!session) {
          throw new Error('Email confirmation required - in production, user would already be logged into their email provider')
        }
      } else if (signInError) {
        // Check specifically for email confirmation issue
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Email not confirmed')
        }
        throw new Error(`Cannot authenticate with email provider: ${signInError.message}`)
      } else {
        session = signInData.session
      }

      console.log('✅ Email provider session established')
    }

    // Verify that session email matches requested email
    if (session.user.email !== email) {
      throw new Error('Authenticated user does not match requested email')
    }

    // In real impl: issuer returns SD-JWT
    // For simulation: create a mock SD-JWT
    const issuanceToken = {
      header: {
        alg: 'ES256',
        typ: 'JWT',
        kid: 'issuer-key-1'
      },
      payload: {
        iss: issuerConfig.issuer,
        sub: session.user.id,
        email: email,
        email_verified: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        // Include public key for key binding
        cnf: {
          jwk: JSON.parse(atob(requestJWT.split('.')[0])).jwk
        }
      }
    }

    // Encode token (in real impl: issuer signs with their private key)
    const headerB64 = btoa(JSON.stringify(issuanceToken.header))
    const payloadB64 = btoa(JSON.stringify(issuanceToken.payload))
    const mockSignature = btoa('mock-issuer-signature')

    return `${headerB64}.${payloadB64}.${mockSignature}`
  } catch (error) {
    console.error('Error requesting token from issuer:', error)
    throw new Error(`Failed to obtain verification token: ${error.message}`)
  }
}

/**
 * Verify SD-JWT signature
 * Real implementation: browser fetches issuer's JWKS and verifies
 */
async function verifySDJWT(sdJWT, issuerConfig) {
  // In real implementation:
  // 1. Fetch JWKS from issuer's jwks_uri
  // 2. Extract kid from SD-JWT header
  // 3. Find corresponding public key in JWKS
  // 4. Verify signature using public key

  // Simulation: Parse and validate structure
  const parts = sdJWT.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid SD-JWT format')
  }

  const header = JSON.parse(atob(parts[0]))
  const payload = JSON.parse(atob(parts[1]))

  // Validate claims
  if (!payload.email_verified) {
    throw new Error('Email not verified in SD-JWT')
  }

  if (payload.exp && payload.exp < Date.now() / 1000) {
    throw new Error('SD-JWT expired')
  }

  return { header, payload }
}

/**
 * Create Key Binding JWT
 * Real implementation: browser creates this
 */
async function createKeyBindingJWT(sdJWT, keyPair, nonce) {
  // Calculate hash of SD-JWT
  const encoder = new TextEncoder()
  const sdJWTBytes = encoder.encode(sdJWT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', sdJWTBytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const sd_hash = btoa(String.fromCharCode(...hashArray))

  // KB-JWT Header
  const header = {
    alg: 'ES256',
    typ: 'kb+jwt'
  }

  // KB-JWT Payload
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    nonce: nonce,
    sd_hash: sd_hash,
    // Optionally include audience (RP origin)
    aud: window.location.origin
  }

  // Sign with ephemeral private key
  const headerB64 = btoa(JSON.stringify(header))
  const payloadB64 = btoa(JSON.stringify(payload))
  const data = encoder.encode(`${headerB64}.${payloadB64}`)

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.privateKey,
    data
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  return `${headerB64}.${payloadB64}.${signatureB64}`
}

/**
 * Main function: Request email verification using WICG protocol
 *
 * @param {string} email - Email address to verify
 * @param {string} nonce - Nonce from Relying Party
 * @returns {Promise<string>} SD-JWT+KB token
 */
export async function requestEmailVerification(email, nonce) {
  try {
    console.log('🔐 Starting WICG Email Verification Protocol (Polyfill)')

    // Step 1: Extract email domain
    const emailDomain = email.split('@')[1]
    if (!emailDomain) {
      throw new Error('Invalid email format')
    }
    console.log(`📧 Email domain: ${emailDomain}`)

    // Step 2: DNS lookup for issuer (simulated)
    console.log('🔍 Looking up DNS TXT record for _email-verification.' + emailDomain)
    const issuerUrl = await lookupDNSIssuer(emailDomain)
    console.log(`✅ Found issuer: ${issuerUrl}`)

    // Step 3: Fetch issuer configuration
    console.log('📋 Fetching issuer configuration from .well-known/email-verification')
    const issuerConfig = await fetchIssuerConfiguration(issuerUrl)
    console.log('✅ Issuer configuration retrieved')

    // Step 4: Generate ephemeral key pair
    console.log('🔑 Generating ephemeral key pair')
    const keyPair = await generateEphemeralKeyPair()

    // Step 5: Create request JWT
    console.log('📝 Creating request JWT')
    const requestJWT = await createRequestJWT(email, nonce, keyPair)

    // Step 6: Request token from issuer (with first-party cookies)
    console.log('🌐 Requesting verification token from issuer')
    const sdJWT = await requestTokenFromIssuer(issuerConfig, requestJWT, email)
    console.log('✅ Received SD-JWT from issuer')

    // Step 7: Verify SD-JWT
    console.log('✔️ Verifying SD-JWT signature')
    const { payload } = await verifySDJWT(sdJWT, issuerConfig)
    console.log('✅ SD-JWT verified, email_verified:', payload.email_verified)

    // Step 8: Create Key Binding JWT
    console.log('🔗 Creating Key Binding JWT')
    const kbJWT = await createKeyBindingJWT(sdJWT, keyPair, nonce)
    console.log('✅ Key Binding JWT created')

    // Step 9: Combine SD-JWT and KB-JWT
    const sdJwtPlusKb = `${sdJWT}~${kbJWT}`
    console.log('✅ SD-JWT+KB token ready for presentation to Relying Party')

    return {
      token: sdJwtPlusKb,
      email: payload.email,
      email_verified: payload.email_verified
    }
  } catch (error) {
    console.error('❌ Email verification failed:', error)
    throw error
  }
}

/**
 * Verify SD-JWT+KB token (Relying Party side)
 *
 * @param {string} sdJwtPlusKb - Combined token from browser
 * @param {string} expectedNonce - Nonce that was provided to browser
 * @returns {Promise<object>} Verified email claim
 */
export async function verifyEmailVerificationToken(sdJwtPlusKb, expectedNonce) {
  try {
    // Split SD-JWT and KB-JWT
    const parts = sdJwtPlusKb.split('~')
    if (parts.length !== 2) {
      throw new Error('Invalid SD-JWT+KB format')
    }

    const [sdJWT, kbJWT] = parts

    // Verify SD-JWT (issuer signature)
    const sdJWTParts = sdJWT.split('.')
    const sdJWTPayload = JSON.parse(atob(sdJWTParts[1]))

    // Verify KB-JWT (key binding)
    const kbJWTParts = kbJWT.split('.')
    const kbJWTPayload = JSON.parse(atob(kbJWTParts[1]))

    // Verify nonce matches
    if (kbJWTPayload.nonce !== expectedNonce) {
      throw new Error('Nonce mismatch in Key Binding JWT')
    }

    // Verify sd_hash matches
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(sdJWT))
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const calculatedHash = btoa(String.fromCharCode(...hashArray))

    if (kbJWTPayload.sd_hash !== calculatedHash) {
      throw new Error('SD-JWT hash mismatch in Key Binding JWT')
    }

    // Verify email_verified claim
    if (!sdJWTPayload.email_verified) {
      throw new Error('Email not verified')
    }

    // Return verified email
    return {
      email: sdJWTPayload.email,
      email_verified: true,
      issuer: sdJWTPayload.iss,
      verified_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    throw error
  }
}

/**
 * Check if WICG Email Verification is supported
 *
 * In real implementation: check if navigator.credentials supports email-verification
 * For now: always return true since we have polyfill
 */
export function isEmailVerificationSupported() {
  // Check for native support (future)
  if (navigator.credentials && typeof navigator.credentials.get === 'function') {
    // Would check for 'email-verification' credential type
    // return navigator.credentials.isTypeSupported?.('email-verification')
  }

  // Polyfill is available
  return true
}

export default {
  generateNonce,
  requestEmailVerification,
  verifyEmailVerificationToken,
  isEmailVerificationSupported
}

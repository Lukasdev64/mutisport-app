/**
 * Test Login Button
 * Quick login for development/testing with test account
 *
 * WARNING: Remove this component in production!
 */

import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  generateNonce,
  requestEmailVerification,
  isEmailVerificationSupported
} from '../services/emailVerificationProtocol'
import './TestLoginButton.css'

const TestLoginButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCredentials, setShowCredentials] = useState(false)

  const TEST_CREDENTIALS = {
    email: 'test@multisport.com',
    password: 'TestPassword123!'
  }

  const handleTestLoginWithWICG = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔬 Attempting WICG Email Verification Protocol')
      console.log('ℹ️ In production: This would use your existing Gmail/Outlook session')

      // Check if WICG protocol is supported
      if (!isEmailVerificationSupported()) {
        throw new Error('WICG Email Verification not supported')
      }

      // Generate nonce (Relying Party)
      const nonce = generateNonce()
      console.log('📝 Generated nonce:', nonce.substring(0, 16) + '...')

      // Request email verification using WICG protocol
      // Note: The protocol will auto-establish email provider session if needed
      const result = await requestEmailVerification(TEST_CREDENTIALS.email, nonce)

      console.log('✅ Email verification successful via WICG protocol!')
      console.log('📧 Verified email:', result.email)
      console.log('✓ Email verified:', result.email_verified)
      console.log('🎉 User is now authenticated (email provider session was used)')

      // In production: RP would now create account/session based on verified email
      // For our demo: Session was already created during WICG flow

      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        console.log('✅ Authenticated with verified email')
        onSuccess?.({ session })
        window.location.href = '/dashboard'
      } else {
        throw new Error('Session not established after verification')
      }
    } catch (err) {
      console.error('WICG verification failed:', err)

      // Check if it's an email confirmation error
      if (err.message.includes('Email not confirmed')) {
        setError('⚠️ Email not confirmed. Check instructions below to bypass confirmation.')
        setLoading(false)
        return
      }

      // Fallback to traditional login for other errors
      console.log('↩️ Falling back to traditional login')
      await handleTestLoginTraditional()
    }
  }

  const handleTestLoginTraditional = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to sign in with test account
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password
      })

      if (signInError) {
        // If account doesn't exist, create it
        if (signInError.message.includes('Invalid login')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: TEST_CREDENTIALS.email,
            password: TEST_CREDENTIALS.password,
            options: {
              data: {
                full_name: 'Test User'
              },
              emailRedirectTo: window.location.origin + '/dashboard'
            }
          })

          if (signUpError) {
            throw signUpError
          }

          // Check if email confirmation is required
          if (signUpData.user && !signUpData.session) {
            setError('⚠️ Account created but email confirmation required. Check instructions below.')
            return
          }

          console.log('✅ Test account created and logged in')
          onSuccess?.(signUpData)
          window.location.href = '/dashboard'
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('⚠️ Email not confirmed. Check instructions below to bypass confirmation.')
          return
        } else {
          throw signInError
        }
      } else {
        console.log('✅ Logged in with test account')
        onSuccess?.(data)
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Test login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async () => {
    // Try WICG protocol first, fallback to traditional
    await handleTestLoginWithWICG()
  }

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div className="test-login">
      <button
        className="test-login__btn"
        onClick={handleTestLogin}
        disabled={loading}
        title="Quick login for testing (dev only)"
      >
        {loading ? (
          <>
            <span className="test-login__spinner" />
            Connecting...
          </>
        ) : (
          <>
            🧪 Test Login
          </>
        )}
      </button>

      <button
        className="test-login__info-btn"
        onClick={() => setShowCredentials(!showCredentials)}
        title="Show test credentials"
      >
        ℹ️
      </button>

      {showCredentials && (
        <div className="test-login__credentials">
          <div className="test-login__credentials-header">
            <span>Test Account Credentials</span>
            <button onClick={() => setShowCredentials(false)}>✕</button>
          </div>
          <div className="test-login__credentials-content">
            <div className="test-login__credential-item">
              <strong>Email:</strong>
              <code>{TEST_CREDENTIALS.email}</code>
            </div>
            <div className="test-login__credential-item">
              <strong>Password:</strong>
              <code>{TEST_CREDENTIALS.password}</code>
            </div>
            <p className="test-login__note">
              💡 The account will be auto-created if it doesn't exist
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="test-login__error">
          <strong>Error:</strong> {error}

          {error.includes('Email not confirmed') && (
            <div className="test-login__instructions">
              <p><strong>📧 Email Confirmation Requise</strong></p>
              <p className="test-login__note">
                ℹ️ <strong>WICG Protocol Note:</strong> En production, le protocole utilise votre session
                Gmail/Outlook existante (vous êtes déjà connecté). Pour la démo, nous devons créer
                un compte Supabase, mais il nécessite une confirmation d'email.
              </p>
              <p><strong>Solution rapide:</strong></p>
              <ol>
                <li>Ouvrir <strong>Supabase Dashboard</strong></li>
                <li>Aller dans <strong>Authentication → Users</strong></li>
                <li>Trouver <code>test@multisport.com</code></li>
                <li>Cliquer sur le menu (⋮) → <strong>Confirm email</strong></li>
                <li>Rafraîchir cette page et recliquer sur Test Login</li>
              </ol>
              <p><strong>Ou désactiver la confirmation d'email:</strong></p>
              <ol>
                <li>Supabase Dashboard → <strong>Authentication → Providers</strong></li>
                <li>Email provider → <strong>Settings</strong></li>
                <li>Décocher <strong>"Confirm email"</strong></li>
                <li>Save</li>
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="test-login__warning">
        ⚠️ Development only - This button won't appear in production
      </div>
    </div>
  )
}

export default TestLoginButton

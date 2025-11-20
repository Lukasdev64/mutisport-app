/**
 * Toast Notifications Utility
 * Wrapper around react-hot-toast with custom styling
 */

import toast from 'react-hot-toast'

/**
 * Default toast configuration
 */
export const toastConfig = {
  duration: 4000,
  position: 'bottom-right',
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff'
    }
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff'
    }
  },
  loading: {
    duration: Infinity
  }
}

/**
 * Show success toast
 * @param {string} message
 * @param {object} options
 */
export function showSuccess(message, options = {}) {
  return toast.success(message, {
    ...toastConfig.success,
    ...options
  })
}

/**
 * Show error toast
 * @param {string} message
 * @param {object} options
 */
export function showError(message, options = {}) {
  return toast.error(message, {
    ...toastConfig.error,
    ...options
  })
}

/**
 * Show info toast
 * @param {string} message
 * @param {object} options
 */
export function showInfo(message, options = {}) {
  return toast(message, {
    icon: 'ℹ️',
    ...toastConfig,
    ...options
  })
}

/**
 * Show loading toast
 * @param {string} message
 * @param {object} options
 * @returns {string} Toast ID (use with dismiss)
 */
export function showLoading(message, options = {}) {
  return toast.loading(message, {
    ...toastConfig.loading,
    ...options
  })
}

/**
 * Dismiss a toast
 * @param {string} toastId
 */
export function dismissToast(toastId) {
  toast.dismiss(toastId)
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  toast.dismiss()
}

/**
 * Show promise toast (automatic success/error handling)
 * @param {Promise} promise
 * @param {object} messages - { loading, success, error }
 * @param {object} options
 */
export function showPromise(promise, messages = {}, options = {}) {
  const defaultMessages = {
    loading: 'Loading...',
    success: 'Success!',
    error: 'Something went wrong'
  }

  return toast.promise(
    promise,
    {
      loading: messages.loading || defaultMessages.loading,
      success: messages.success || defaultMessages.success,
      error: (err) => messages.error || err.message || defaultMessages.error
    },
    options
  )
}

/**
 * Tournament-specific toast messages
 */
export const tournamentToasts = {
  matchUpdated: () => showSuccess('Match result saved successfully'),
  matchUndone: () => showInfo('Match result reverted'),
  matchError: (error) => showError(`Failed to update match: ${error}`),

  tournamentCreated: () => showSuccess('Tournament created successfully!'),
  tournamentUpdated: () => showSuccess('Tournament updated'),
  tournamentDeleted: () => showInfo('Tournament deleted'),
  tournamentError: (error) => showError(`Tournament error: ${error}`),

  playerAdded: (name) => showSuccess(`${name} added to tournament`),
  playerRemoved: (name) => showInfo(`${name} removed`),
  playerError: (error) => showError(`Player error: ${error}`),

  seedingUpdated: () => showSuccess('Seeding updated'),
  seedingError: (error) => showError(`Seeding error: ${error}`),

  roundGenerated: (roundNum) => showSuccess(`Round ${roundNum} generated!`),
  roundError: (error) => showError(`Failed to generate round: ${error}`),

  exportSuccess: () => showSuccess('PDF exported successfully!'),
  exportError: (error) => showError(`Export failed: ${error}`),

  linkCopied: () => showSuccess('Link copied to clipboard!'),
  linkError: () => showError('Failed to copy link'),

  realtimeConnected: () => showInfo('Live updates enabled'),
  realtimeDisconnected: () => showInfo('Live updates disconnected'),
  realtimeError: (error) => showError(`Realtime error: ${error}`)
}

/**
 * Custom toast with action button
 * @param {string} message
 * @param {string} actionLabel
 * @param {Function} onAction
 * @param {object} options
 */
export function showToastWithAction(message, actionLabel, onAction, options = {}) {
  return toast((t) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span>{message}</span>
      <button
        onClick={() => {
          onAction()
          toast.dismiss(t.id)
        }}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {actionLabel}
      </button>
    </div>
  ), options)
}

export default {
  showSuccess,
  showError,
  showInfo,
  showLoading,
  dismissToast,
  dismissAllToasts,
  showPromise,
  showToastWithAction,
  tournamentToasts,
  toastConfig
}

/**
 * Share Panel Component
 * QR Code generation + social sharing + copy link
 */

import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import './SharePanel.css'

const SharePanel = ({
  tournamentUrl,
  tournamentName,
  className = ''
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tournamentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = tournamentUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out this tournament: ${tournamentName}`)
    const url = encodeURIComponent(tournamentUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const handleShareFacebook = () => {
    const url = encodeURIComponent(tournamentUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this tournament: ${tournamentName}\n${tournamentUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Tournament: ${tournamentName}`)
    const body = encodeURIComponent(`I'd like to share this tournament with you:\n\n${tournamentName}\n\n${tournamentUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleDownloadQR = () => {
    const canvas = document.querySelector('.share-panel__qr canvas')
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${tournamentName.replace(/\s+/g, '-')}-qr-code.png`
    link.href = url
    link.click()
  }

  return (
    <div className={`share-panel ${className}`}>
      {/* QR Code */}
      <div className="share-panel__qr">
        <h3 className="share-panel__title">🔗 Share Tournament</h3>

        <div className="share-panel__qr-wrapper">
          <QRCode
            value={tournamentUrl}
            size={200}
            level="H"
            includeMargin
            renderAs="canvas"
          />
        </div>

        <button
          className="share-panel__btn share-panel__btn--secondary"
          onClick={handleDownloadQR}
        >
          📥 Download QR Code
        </button>
      </div>

      {/* Copy Link */}
      <div className="share-panel__copy">
        <label className="share-panel__label">Tournament Link</label>
        <div className="share-panel__copy-input-group">
          <input
            type="text"
            className="share-panel__copy-input"
            value={tournamentUrl}
            readOnly
          />
          <button
            className={`share-panel__btn share-panel__btn--copy ${copied ? 'share-panel__btn--copied' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="share-panel__social">
        <label className="share-panel__label">Share on Social Media</label>

        <div className="share-panel__social-buttons">
          <button
            className="share-panel__social-btn share-panel__social-btn--twitter"
            onClick={handleShareTwitter}
            title="Share on Twitter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
            <span>Twitter</span>
          </button>

          <button
            className="share-panel__social-btn share-panel__social-btn--facebook"
            onClick={handleShareFacebook}
            title="Share on Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
            <span>Facebook</span>
          </button>

          <button
            className="share-panel__social-btn share-panel__social-btn--whatsapp"
            onClick={handleShareWhatsApp}
            title="Share on WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            className="share-panel__social-btn share-panel__social-btn--email"
            onClick={handleShareEmail}
            title="Share via Email"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Email</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SharePanel

/**
 * Optimized Image Component
 * Lazy loading images with placeholder and error handling
 */

import React, { useState, useEffect, useRef } from 'react'
import './OptimizedImage.css'

const OptimizedImage = ({
  src,
  alt,
  placeholder = null,
  className = '',
  width,
  height,
  objectFit = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px' // Start loading 50px before visible
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [])

  const handleLoad = (e) => {
    setIsLoaded(true)
    onLoad?.(e)
  }

  const handleError = (e) => {
    setHasError(true)
    onError?.(e)
  }

  const containerStyle = {
    width: width || '100%',
    height: height || 'auto',
    position: 'relative',
    overflow: 'hidden'
  }

  const imgStyle = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0
  }

  return (
    <div
      ref={imgRef}
      className={`optimized-image ${className}`}
      style={containerStyle}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="optimized-image__placeholder">
          {placeholder || <div className="optimized-image__skeleton" />}
        </div>
      )}

      {/* Image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="optimized-image__error">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Image not available</span>
        </div>
      )}
    </div>
  )
}

export default OptimizedImage

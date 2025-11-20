/**
 * Lazy Loading Utilities
 * Code splitting helpers for performance optimization
 */

import React, { lazy, Suspense } from 'react'

/**
 * Loading spinner component
 */
const LoadingSpinner = () => (
  <div className="lazy-loader">
    <div className="lazy-loader__spinner" />
    <p className="lazy-loader__text">Loading...</p>
  </div>
)

/**
 * Loading skeleton for pages
 */
const PageSkeleton = () => (
  <div className="page-skeleton">
    <div className="page-skeleton__header" />
    <div className="page-skeleton__content">
      <div className="page-skeleton__line" />
      <div className="page-skeleton__line" />
      <div className="page-skeleton__line page-skeleton__line--short" />
    </div>
  </div>
)

/**
 * Lazy load a component with custom fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Custom loading component
 * @returns {React.Component}
 */
export function lazyLoad(importFunc, fallback = <LoadingSpinner />) {
  const LazyComponent = lazy(importFunc)

  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Lazy load a page with page skeleton
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.Component}
 */
export function lazyLoadPage(importFunc) {
  return lazyLoad(importFunc, <PageSkeleton />)
}

/**
 * Preload a lazy component
 * Useful for preloading on hover or route anticipation
 * @param {Function} importFunc - Dynamic import function
 */
export function preloadComponent(importFunc) {
  importFunc()
}

/**
 * Retry logic for failed lazy loads
 * Handles chunk load errors (common in deployments)
 * @param {Function} importFunc - Dynamic import function
 * @param {number} retries - Number of retry attempts
 * @returns {Promise}
 */
export function lazyWithRetry(importFunc, retries = 3) {
  return new Promise((resolve, reject) => {
    importFunc()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error)
          return
        }

        console.warn(`Chunk load failed, retrying... (${retries} attempts left)`)

        setTimeout(() => {
          lazyWithRetry(importFunc, retries - 1)
            .then(resolve)
            .catch(reject)
        }, 1000)
      })
  })
}

/**
 * Lazy load with retry and fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Loading component
 * @returns {React.Component}
 */
export function lazyLoadWithRetry(importFunc, fallback = <LoadingSpinner />) {
  const LazyComponent = lazy(() => lazyWithRetry(importFunc))

  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

export { LoadingSpinner, PageSkeleton }

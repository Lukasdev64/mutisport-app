/**
 * SEO Component
 * Manages meta tags and document head for SEO optimization
 */

import { useEffect } from 'react'

const SEO = ({
  title = 'Multi-Sport Competition',
  description = 'Manage sports competitions and tournaments with ease',
  keywords = 'sports, competition, tournament, management',
  image = '/og-image.jpg',
  url,
  type = 'website',
  author = 'Multi-Sport Competition',
  twitterCard = 'summary_large_image',
  noindex = false,
  canonical
}) => {
  useEffect(() => {
    // Set document title
    document.title = title

    // Helper to set or update meta tags
    const setMetaTag = (name, content, attribute = 'name') => {
      if (!content) return

      let element = document.querySelector(`meta[${attribute}="${name}"]`)

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    // Basic meta tags
    setMetaTag('description', description)
    setMetaTag('keywords', keywords)
    setMetaTag('author', author)

    // Robots
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow')
    } else {
      setMetaTag('robots', 'index, follow')
    }

    // Open Graph
    setMetaTag('og:title', title, 'property')
    setMetaTag('og:description', description, 'property')
    setMetaTag('og:type', type, 'property')
    setMetaTag('og:url', url || window.location.href, 'property')
    setMetaTag('og:image', image, 'property')
    setMetaTag('og:site_name', 'Multi-Sport Competition', 'property')

    // Twitter Card
    setMetaTag('twitter:card', twitterCard)
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)
    setMetaTag('twitter:image', image)

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', canonical)
    }
  }, [title, description, keywords, image, url, type, author, twitterCard, noindex, canonical])

  return null // This component doesn't render anything
}

/**
 * Generate tournament-specific meta tags
 */
export const TournamentSEO = ({ tournament }) => {
  if (!tournament) return null

  const title = `${tournament.name} - Tournament`
  const description = `View ${tournament.name} tournament bracket, matches, and results. ${tournament.format} format with ${tournament.maxParticipants || tournament.players?.length || 0} players.`
  const url = `${window.location.origin}/tournament/${tournament.uniqueUrlCode}`
  const keywords = `${tournament.name}, ${tournament.format}, tournament, bracket, ${tournament.sport || 'sports'}`

  return (
    <SEO
      title={title}
      description={description}
      url={url}
      keywords={keywords}
      type="article"
    />
  )
}

/**
 * Generate competition-specific meta tags
 */
export const CompetitionSEO = ({ competition }) => {
  if (!competition) return null

  const title = `${competition.name} - Competition`
  const description = `${competition.description || `Join ${competition.name} competition`}. ${competition.sport} competition in ${competition.city}.`
  const url = `${window.location.origin}/competition/${competition.id}`
  const keywords = `${competition.name}, ${competition.sport}, competition, ${competition.city}`

  return (
    <SEO
      title={title}
      description={description}
      url={url}
      keywords={keywords}
      type="event"
    />
  )
}

/**
 * SEO for 404 pages
 */
export const NotFoundSEO = () => (
  <SEO
    title="Page Not Found - 404"
    description="The page you're looking for doesn't exist."
    noindex={true}
  />
)

/**
 * SEO for dashboard pages (noindex for private pages)
 */
export const DashboardSEO = ({ pageTitle = 'Dashboard' }) => (
  <SEO
    title={`${pageTitle} - Multi-Sport Competition`}
    description="Manage your competitions and tournaments"
    noindex={true}
  />
)

export default SEO

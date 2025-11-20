/**
 * Sitemap Generation Utilities
 * Generate dynamic sitemap for public pages
 *
 * Note: For production, use a server-side solution or build-time generation
 * This is a client-side example for reference
 */

/**
 * Generate XML sitemap string
 * @param {Array} urls - Array of URL objects
 * @returns {string} XML sitemap
 */
export function generateSitemap(urls) {
  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || '0.5'}</priority>
  </url>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

/**
 * Get all public tournament URLs for sitemap
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Array>}
 */
export async function getTournamentUrls(baseUrl) {
  try {
    // In production, this would fetch from your API
    // For now, return example structure
    const tournaments = [] // await tournamentService.getPublicTournaments()

    return tournaments.map((tournament) => ({
      loc: `${baseUrl}/tournament/${tournament.uniqueUrlCode}`,
      lastmod: tournament.updatedAt
        ? new Date(tournament.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.8'
    }))
  } catch (error) {
    console.error('Error fetching tournament URLs:', error)
    return []
  }
}

/**
 * Get all public competition URLs for sitemap
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Array>}
 */
export async function getCompetitionUrls(baseUrl) {
  try {
    // In production, this would fetch from your API
    const competitions = [] // await competitionService.getAllCompetitions()

    return competitions.map((competition) => ({
      loc: `${baseUrl}/competition/${competition.id}`,
      lastmod: competition.updatedAt
        ? new Date(competition.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7'
    }))
  } catch (error) {
    console.error('Error fetching competition URLs:', error)
    return []
  }
}

/**
 * Generate complete sitemap with all public URLs
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<string>} Complete sitemap XML
 */
export async function generateCompleteSitemap(baseUrl) {
  const staticUrls = [
    {
      loc: baseUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${baseUrl}/login`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      loc: `${baseUrl}/register`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.5'
    }
  ]

  const tournamentUrls = await getTournamentUrls(baseUrl)
  const competitionUrls = await getCompetitionUrls(baseUrl)

  const allUrls = [...staticUrls, ...tournamentUrls, ...competitionUrls]

  return generateSitemap(allUrls)
}

/**
 * Download sitemap as file (for development/testing)
 */
export function downloadSitemap(sitemapXml, filename = 'sitemap.xml') {
  const blob = new Blob([sitemapXml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Structured data (JSON-LD) for tournaments
 * @param {Object} tournament
 * @returns {Object} JSON-LD structured data
 */
export function generateTournamentStructuredData(tournament) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: tournament.name,
    description: tournament.description || `${tournament.format} tournament`,
    startDate: tournament.startDate || tournament.createdAt,
    sport: tournament.sport || 'Sports',
    organizer: {
      '@type': 'Organization',
      name: 'Multi-Sport Competition'
    },
    url: `${window.location.origin}/tournament/${tournament.uniqueUrlCode}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
  }
}

/**
 * Inject structured data into page head
 * @param {Object} data - Structured data object
 */
export function injectStructuredData(data) {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.text = JSON.stringify(data)

  // Remove existing structured data if present
  const existing = document.querySelector('script[type="application/ld+json"]')
  if (existing) {
    existing.remove()
  }

  document.head.appendChild(script)
}

export default {
  generateSitemap,
  getTournamentUrls,
  getCompetitionUrls,
  generateCompleteSitemap,
  downloadSitemap,
  generateTournamentStructuredData,
  injectStructuredData
}

import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export default function SEO({
  title = "Azora OS - Build the Future, Compliantly",
  description = "Azora OS is Africa's first full software infrastructure. Learn, mint digital currency, access enterprise tools, and participate in a compliant, AI-powered ecosystem.",
  keywords = "Azora OS, blockchain, AI, compliance, digital economy, South Africa, learning platform, token minting, enterprise software",
  image = "https://azora.world/og-image.jpg",
  url = "https://azora.world",
  type = "website"
}: SEOProps) {
  const siteName = "Azora OS"
  const twitterHandle = "@AzoraOS"

  useEffect(() => {
    // Update document title
    document.title = title

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement

      if (element) {
        element.content = content
      } else {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        element.content = content
        document.head.appendChild(element)
      }
    }

    // Basic meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', 'Azora OS (Pty) Ltd')
    updateMetaTag('robots', 'index, follow')

    // Open Graph meta tags
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:site_name', siteName, true)

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)
    updateMetaTag('twitter:site', twitterHandle)

    // Additional meta tags
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    updateMetaTag('theme-color', '#0891b2')

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (canonicalLink) {
      canonicalLink.href = url
    } else {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      canonicalLink.href = url
      document.head.appendChild(canonicalLink)
    }

    // Add structured data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script') as HTMLScriptElement
      structuredDataScript.type = 'application/ld+json'
      document.head.appendChild(structuredDataScript)
    }

    structuredDataScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Azora ES",
      "url": "https://azora.world",
      "logo": "https://azora.world/azora-light.png",
      "description": description,
      "foundingDate": "2024",
      "founders": [
        {
          "@type": "Person",
          "name": "Azora ES Team"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ZA",
        "addressRegion": "Western Cape",
        "addressLocality": "Cape Town"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+27-21-123-4567",
        "contactType": "customer service",
        "email": "hello@azora.world"
      },
      "sameAs": [
        "https://twitter.com/AzoraES",
        "https://linkedin.com/company/azora-es",
        "https://github.com/azora-es"
      ]
    })

  }, [title, description, keywords, image, url, type])

  return null
}
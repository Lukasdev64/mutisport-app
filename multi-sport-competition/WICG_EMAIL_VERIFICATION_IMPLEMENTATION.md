# WICG Email Verification Protocol - Implementation Guide

Implémentation conceptuelle du protocole WICG Email Verification dans Multi-Sport Competition.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Protocole](#architecture-du-protocole)
3. [Flow Technique Détaillé](#flow-technique-détaillé)
4. [Implémentation Actuelle](#implémentation-actuelle)
5. [Composants Cryptographiques](#composants-cryptographiques)
6. [Avantages vs Méthodes Traditionnelles](#avantages-vs-méthodes-traditionnelles)
7. [Limitations & Futur](#limitations--futur)
8. [Testing](#testing)

---

## Vue d'ensemble

### Qu'est-ce que le Protocole WICG Email Verification?

Le **WICG Email Verification Protocol** est une spécification en développement par le Web Incubation Community Group (WICG) qui permet de **vérifier la propriété d'une adresse email sans envoyer d'email** et sans que l'utilisateur quitte la page web.

**Spécification officielle**: https://github.com/WICG/email-verification-protocol

### Principes Clés

1. **Browser-mediated**: Le navigateur agit comme médiateur entre le site web et le fournisseur d'email
2. **Privacy-preserving**: Le fournisseur d'email (Gmail, Outlook) ne sait pas quel site demande la vérification
3. **No email sent**: Pas d'email de confirmation envoyé
4. **Instant verification**: Vérification immédiate si l'utilisateur est connecté à son email
5. **Cryptographically secure**: Utilise SD-JWT+KB (Selective Disclosure JWT avec Key Binding)

### Problème Résolu

**Méthode traditionnelle** (email link):
```
1. User entre email
2. App envoie email avec lien unique
3. User ouvre email
4. User clique sur lien
5. User retourne sur l'app
6. ⚠️ Friction énorme
7. ⚠️ Email provider voit quel site vous utilisez
8. ⚠️ Délai de livraison email
```

**WICG Protocol**:
```
1. User entre email
2. Browser vérifie DNS pour trouver l'issuer
3. Browser contacte issuer (Gmail) avec cookies
4. Issuer génère token signé
5. Browser présente token à l'app
6. ✅ Verification instantanée
7. ✅ Privacy préservé
8. ✅ Pas d'email envoyé
```

---

## Architecture du Protocole

### Les 3 Acteurs

```
┌─────────────────────┐
│  Relying Party (RP) │  ← Web application (notre app)
│   (Your Website)    │
└─────────────────────┘
          ↑
          │ (3) Présente SD-JWT+KB
          │
┌─────────────────────┐
│      Browser        │  ← Médiateur sécurisé
│   (User Agent)      │
└─────────────────────┘
          ↓
          │ (2) Demande token avec cookies
          │
┌─────────────────────┐
│      Issuer         │  ← Fournisseur email (Gmail, Outlook)
│  (Email Provider)   │
└─────────────────────┘
```

### Composants Techniques

#### 1. DNS TXT Record

```dns
_email-verification.gmail.com.  TXT  "iss=https://accounts.google.com"
```

Le browser lookup ce record pour découvrir l'issuer.

#### 2. Issuer Configuration

Endpoint: `/.well-known/email-verification`

```json
{
  "issuer": "https://accounts.google.com",
  "issuance_endpoint": "https://accounts.google.com/email-verification/token",
  "jwks_uri": "https://accounts.google.com/.well-known/jwks.json",
  "token_types_supported": ["sd-jwt+kb"],
  "signing_algs_supported": ["EdDSA", "ES256"]
}
```

#### 3. SD-JWT+KB Token

**Structure**: `SD-JWT~KB-JWT`

**SD-JWT** (Issuance Token):
```json
{
  "header": {
    "alg": "EdDSA",
    "typ": "JWT",
    "kid": "issuer-key-1"
  },
  "payload": {
    "iss": "https://accounts.google.com",
    "email": "user@gmail.com",
    "email_verified": true,
    "iat": 1234567890,
    "exp": 1234571490,
    "cnf": {
      "jwk": { /* browser's public key */ }
    }
  }
}
```

**KB-JWT** (Key Binding Token):
```json
{
  "header": {
    "alg": "ES256",
    "typ": "kb+jwt"
  },
  "payload": {
    "iat": 1234567890,
    "nonce": "rp-generated-nonce",
    "sd_hash": "SHA256(SD-JWT)",
    "aud": "https://your-website.com"
  }
}
```

---

## Flow Technique Détaillé

### Phase 1: Initiation (Relying Party)

```javascript
// 1. RP génère un nonce cryptographique
const nonce = generateNonce() // 64 hex chars

// 2. RP appelle le browser API (futur)
const credential = await navigator.credentials.get({
  email: {
    address: 'user@gmail.com',
    nonce: nonce
  }
})
```

### Phase 2: Découverte de l'Issuer (Browser)

```javascript
// 1. Browser extrait le domaine
const domain = email.split('@')[1] // 'gmail.com'

// 2. Browser fait un DNS lookup
const dnsRecord = await dns.lookup('_email-verification.gmail.com', 'TXT')
// Returns: "iss=https://accounts.google.com"

// 3. Browser extrait l'issuer URL
const issuerUrl = dnsRecord.match(/iss=([^\s]+)/)[1]
```

### Phase 3: Configuration de l'Issuer (Browser)

```javascript
// Browser fetch la config
const config = await fetch(`${issuerUrl}/.well-known/email-verification`)

/*
{
  "issuance_endpoint": "https://accounts.google.com/email-verification/token",
  "jwks_uri": "https://accounts.google.com/.well-known/jwks.json"
}
*/
```

### Phase 4: Génération de Clé Éphémère (Browser)

```javascript
// Browser génère une paire de clés Ed25519
const keyPair = await crypto.subtle.generateKey(
  {
    name: 'Ed25519',
    namedCurve: 'Ed25519'
  },
  true,
  ['sign', 'verify']
)

// Export public key en JWK format
const publicKeyJWK = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
```

### Phase 5: Création Request JWT (Browser)

```javascript
// Browser crée un JWT pour demander le token
const requestJWT = {
  header: {
    alg: 'EdDSA',
    typ: 'JWT',
    jwk: publicKeyJWK  // Public key incluse
  },
  payload: {
    email: 'user@gmail.com',
    nonce: nonce,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID()
  }
}

// Sign avec la clé privée éphémère
const requestJWTSigned = await signJWT(requestJWT, keyPair.privateKey)
```

### Phase 6: Demande de Token à l'Issuer (Browser)

```javascript
// Browser envoie la requête AVEC first-party cookies
const response = await fetch(config.issuance_endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Sec-Fetch-Dest': 'email-verification'  // ⚠️ Critical security header
  },
  credentials: 'include',  // Include cookies!
  body: `request_token=${requestJWTSigned}`
})

const sdJWT = await response.text()
```

**⚠️ Point Crucial**: Le browser envoie les **first-party cookies** de Gmail. Si l'utilisateur est connecté à Gmail, ces cookies prouvent son identité.

### Phase 7: Validation du SD-JWT (Browser)

```javascript
// 1. Browser fetch les public keys de l'issuer
const jwks = await fetch(config.jwks_uri).then(r => r.json())

// 2. Browser extrait le kid du header
const header = parseJWT(sdJWT).header
const publicKey = jwks.keys.find(k => k.kid === header.kid)

// 3. Browser vérifie la signature
const isValid = await crypto.subtle.verify(
  { name: 'EdDSA' },
  importKey(publicKey),
  signature,
  message
)

// 4. Browser vérifie les claims
const payload = parseJWT(sdJWT).payload
assert(payload.email_verified === true)
assert(payload.email === 'user@gmail.com')
```

### Phase 8: Création du Key Binding JWT (Browser)

```javascript
// Browser calcule le hash du SD-JWT
const sdJWTBytes = new TextEncoder().encode(sdJWT)
const hashBuffer = await crypto.subtle.digest('SHA-256', sdJWTBytes)
const sd_hash = base64url(hashBuffer)

// Browser crée le KB-JWT
const kbJWT = {
  header: {
    alg: 'EdDSA',
    typ: 'kb+jwt'
  },
  payload: {
    iat: Math.floor(Date.now() / 1000),
    nonce: nonce,  // ⚠️ Nonce du RP
    sd_hash: sd_hash,  // ⚠️ Hash du SD-JWT
    aud: 'https://your-website.com'
  }
}

// Sign avec la clé privée éphémère (MÊME clé que request JWT)
const kbJWTSigned = await signJWT(kbJWT, keyPair.privateKey)
```

### Phase 9: Présentation du Token (Browser → RP)

```javascript
// Browser combine SD-JWT et KB-JWT avec ~
const sdJwtPlusKb = `${sdJWT}~${kbJWTSigned}`

// Browser retourne le token au RP
return {
  token: sdJwtPlusKb,
  email: payload.email
}
```

### Phase 10: Vérification par le Relying Party

```javascript
// RP reçoit le token
const [sdJWT, kbJWT] = token.split('~')

// 1. Vérifie signature du SD-JWT (avec public key de l'issuer)
const issuerPublicKey = await fetchIssuerJWKS(issuerUrl)
const sdJWTValid = await verifyJWT(sdJWT, issuerPublicKey)

// 2. Extrait la public key du browser du SD-JWT
const sdJWTPayload = parseJWT(sdJWT).payload
const browserPublicKey = sdJWTPayload.cnf.jwk

// 3. Vérifie signature du KB-JWT (avec public key du browser)
const kbJWTValid = await verifyJWT(kbJWT, browserPublicKey)

// 4. Vérifie le nonce
const kbJWTPayload = parseJWT(kbJWT).payload
assert(kbJWTPayload.nonce === expectedNonce)

// 5. Vérifie le hash
const calculatedHash = sha256(sdJWT)
assert(kbJWTPayload.sd_hash === calculatedHash)

// 6. Vérifie email_verified
assert(sdJWTPayload.email_verified === true)

// ✅ Email vérifié!
return {
  email: sdJWTPayload.email,
  verified: true
}
```

---

## Implémentation Actuelle

### Structure des Fichiers

```
src/
├── services/
│   └── emailVerificationProtocol.js  ← Implementation du protocole
└── components/
    └── TestLoginButton.jsx  ← Intégration dans UI
```

### Ce Qui Est Simulé

Notre implémentation est un **polyfill éducatif** car:

1. **Browsers ne supportent pas encore** le protocole nativement
2. **Email providers** (Gmail, Outlook) n'ont pas encore d'endpoints
3. **DNS records** ne sont pas configurés

#### Simulations

| Composant | Réel | Simulé |
|-----------|------|--------|
| DNS Lookup | Browser DNS API | Mapping statique |
| Issuer Config | Fetch .well-known | Mock config |
| First-party cookies | Gmail session | Supabase session |
| Ed25519 keys | Browser WebCrypto | ECDSA P-256 |
| Issuer signature | Gmail private key | Mock signature |

### Code Key Points

#### 1. Génération de Nonce

```javascript
export function generateNonce() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
```

#### 2. DNS Lookup (Simulé)

```javascript
async function lookupDNSIssuer(emailDomain) {
  const knownIssuers = {
    'gmail.com': 'https://accounts.google.com',
    'outlook.com': 'https://login.microsoftonline.com',
    'multisport.com': window.location.origin  // For testing
  }

  return knownIssuers[emailDomain.toLowerCase()]
}
```

#### 3. Request Email Verification

```javascript
export async function requestEmailVerification(email, nonce) {
  // 1. DNS lookup
  const issuerUrl = await lookupDNSIssuer(emailDomain)

  // 2. Fetch config
  const issuerConfig = await fetchIssuerConfiguration(issuerUrl)

  // 3. Generate key pair
  const keyPair = await generateEphemeralKeyPair()

  // 4. Create request JWT
  const requestJWT = await createRequestJWT(email, nonce, keyPair)

  // 5. Request token from issuer
  const sdJWT = await requestTokenFromIssuer(issuerConfig, requestJWT, email)

  // 6. Verify SD-JWT
  await verifySDJWT(sdJWT, issuerConfig)

  // 7. Create Key Binding JWT
  const kbJWT = await createKeyBindingJWT(sdJWT, keyPair, nonce)

  // 8. Combine tokens
  return `${sdJWT}~${kbJWT}`
}
```

#### 4. Intégration dans TestLoginButton

```javascript
const handleTestLoginWithWICG = async () => {
  // Generate nonce
  const nonce = generateNonce()

  // Request verification via WICG protocol
  const result = await requestEmailVerification(TEST_CREDENTIALS.email, nonce)

  // If successful, proceed with login
  const { data } = await supabase.auth.signInWithPassword({
    email: TEST_CREDENTIALS.email,
    password: TEST_CREDENTIALS.password
  })

  // Redirect to dashboard
  window.location.href = '/dashboard'
}
```

---

## Composants Cryptographiques

### 1. Ed25519 (Edwards-curve Digital Signature Algorithm)

**Pourquoi Ed25519?**
- ✅ Sécurité de 128 bits
- ✅ Signatures compactes (64 bytes)
- ✅ Performance excellente
- ✅ Résistant aux attaques par canal auxiliaire
- ✅ Déterministe (même message → même signature)

**Usage dans le Protocole**:
- Browser génère paire de clés Ed25519 éphémères
- Sign request JWT et KB-JWT avec private key
- Issuer vérifie avec public key (incluse dans JWT header)

### 2. SHA-256 Hash

**Usage**:
```javascript
const sdJWTBytes = new TextEncoder().encode(sdJWT)
const hashBuffer = await crypto.subtle.digest('SHA-256', sdJWTBytes)
const sd_hash = base64url(hashBuffer)
```

**Pourquoi?**
- Lie le KB-JWT au SD-JWT spécifique
- Empêche modification du SD-JWT
- Collision-resistant (2^256 espace)

### 3. Key Binding Mechanism

**Concept**: Prouver la possession de la clé privée correspondant à la public key dans le SD-JWT.

```
SD-JWT contient:    cnf.jwk = PublicKeyBrowser
KB-JWT signé avec:  PrivateKeyBrowser

RP vérifie:
1. Signature SD-JWT avec PublicKeyIssuer ✓
2. Signature KB-JWT avec PublicKeyBrowser (extraite du SD-JWT) ✓
3. Hash matches ✓
4. Nonce matches ✓

→ Donc: Le browser qui a demandé le token est le même qui le présente
```

**Protections**:
- ❌ Token replay: Attacker ne possède pas la private key
- ❌ Token substitution: Hash lie KB-JWT au SD-JWT
- ❌ Phishing: Nonce lie le token à cette RP spécifique

---

## Avantages vs Méthodes Traditionnelles

### Comparaison

| Aspect | Email Link | OAuth Social | WICG Protocol |
|--------|-----------|--------------|---------------|
| **UX Friction** | ❌ Élevée (6+ steps) | ⚠️ Moyenne (3-4 steps) | ✅ Faible (1 step) |
| **Délai** | ❌ Minutes | ✅ Secondes | ✅ Instantané |
| **Privacy** | ❌ Provider voit app | ❌ Provider voit app | ✅ Provider ne voit pas |
| **Email envoyé** | ❌ Oui | ✅ Non | ✅ Non |
| **Dépendance** | ✅ Aucune | ❌ Tiers (Google/FB) | ⚠️ Email provider |
| **Security** | ⚠️ Token DB required | ✅ OAuth 2.0 | ✅ Crypto (Ed25519) |
| **Implementation** | ✅ Simple | ⚠️ Multiple providers | ⚠️ Protocole complexe |
| **Browser Support** | ✅ Universel | ✅ Universel | ❌ Futur |

### Cas d'Usage Idéaux

**WICG Protocol** est optimal pour:
- ✅ **Onboarding**: Inscription utilisateur (réduire friction)
- ✅ **Email change**: Changer d'email sans envoyer confirmation
- ✅ **Account recovery**: Vérifier email de récupération
- ✅ **Secondary emails**: Ajouter emails alternatifs
- ✅ **Re-verification**: Re-vérifier email périodiquement

**Pas optimal pour**:
- ❌ Utilisateur pas connecté à son email
- ❌ Shared devices (ordinateur public)
- ❌ Email providers sans support

---

## Limitations & Futur

### Limitations Actuelles

#### 1. Pas de Support Browser Natif

**Status**: Aucun browser n'implémente le protocole en 2025

**Roadmap**:
- **2024-2025**: Specification development (WICG)
- **2025-2026**: Browser implementation (Chrome, Firefox, Safari)
- **2026+**: Email provider adoption (Gmail, Outlook)

#### 2. Email Providers Doivent Implémenter

**Requis pour chaque provider**:
- ✅ DNS TXT record configuration
- ✅ .well-known/email-verification endpoint
- ✅ Token issuance endpoint
- ✅ JWKS endpoint avec public keys
- ✅ Vérification que cookies = user email

#### 3. Privacy vs Security Trade-offs

**Questions ouvertes**:
- Comment empêcher origin leaking sans compromettre security?
- Sec-Fetch-Dest header est-il suffisant?
- Que faire si DNS est compromis?

### Améliorations Futures

#### 1. Selective Disclosure Extension

Permettre disclosure sélective d'autres claims:

```json
{
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",  ← Disclose or not?
  "picture": "..."     ← Disclose or not?
}
```

#### 2. Intégration avec WebAuthn

Combiner email verification + WebAuthn:

```javascript
// 1. Verify email with WICG protocol
const emailVerified = await requestEmailVerification(email, nonce)

// 2. Register WebAuthn credential
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: challenge,
    rp: { name: "Multi-Sport" },
    user: {
      id: userId,
      name: emailVerified.email,
      displayName: "User"
    }
  }
})
```

#### 3. Support Autres Contact Methods

Extension au-delà de l'email:
- **Phone verification** via telecom providers
- **Address verification** via postal services
- **ID verification** via government services

### Vers une Implémentation Native

Quand les browsers supporteront:

```javascript
// Future API
const credential = await navigator.credentials.get({
  email: {
    address: 'user@gmail.com',
    nonce: nonce
  }
})

// Returns:
{
  type: 'email',
  token: 'eyJ...~eyJ...',  // SD-JWT+KB
  email: 'user@gmail.com',
  verified: true
}
```

Remplacement de notre polyfill:

```javascript
export async function requestEmailVerification(email, nonce) {
  // Check for native support
  if (navigator.credentials.isTypeSupported?.('email-verification')) {
    // Use native implementation
    return await navigator.credentials.get({
      email: { address: email, nonce }
    })
  }

  // Fallback to polyfill
  return await polyfillEmailVerification(email, nonce)
}
```

---

## Testing

### Tests Unitaires

Créer `src/tests/emailVerificationProtocol.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import {
  generateNonce,
  requestEmailVerification,
  verifyEmailVerificationToken
} from '../services/emailVerificationProtocol'

describe('WICG Email Verification Protocol', () => {
  it('should generate cryptographically random nonce', () => {
    const nonce1 = generateNonce()
    const nonce2 = generateNonce()

    expect(nonce1).toHaveLength(64)
    expect(nonce1).not.toBe(nonce2)
    expect(nonce1).toMatch(/^[0-9a-f]+$/)
  })

  it('should create valid SD-JWT+KB token', async () => {
    const email = 'test@multisport.com'
    const nonce = generateNonce()

    const result = await requestEmailVerification(email, nonce)

    expect(result.token).toContain('~')
    expect(result.email).toBe(email)
    expect(result.email_verified).toBe(true)
  })

  it('should verify token with matching nonce', async () => {
    const nonce = generateNonce()
    const result = await requestEmailVerification('test@multisport.com', nonce)

    const verified = await verifyEmailVerificationToken(result.token, nonce)

    expect(verified.email_verified).toBe(true)
    expect(verified.email).toBe('test@multisport.com')
  })

  it('should reject token with mismatched nonce', async () => {
    const nonce1 = generateNonce()
    const nonce2 = generateNonce()

    const result = await requestEmailVerification('test@multisport.com', nonce1)

    await expect(
      verifyEmailVerificationToken(result.token, nonce2)
    ).rejects.toThrow('Nonce mismatch')
  })
})
```

### Testing Manuel

#### Console Logs

Quand vous cliquez sur 🧪 Test Login, observez la console:

```
🔐 Starting WICG Email Verification Protocol (Polyfill)
📧 Email domain: multisport.com
🔍 Looking up DNS TXT record for _email-verification.multisport.com
✅ Found issuer: http://localhost:5176
📋 Fetching issuer configuration from .well-known/email-verification
✅ Issuer configuration retrieved
🔑 Generating ephemeral key pair
📝 Creating request JWT
🌐 Requesting verification token from issuer
✅ Received SD-JWT from issuer
✔️ Verifying SD-JWT signature
✅ SD-JWT verified, email_verified: true
🔗 Creating Key Binding JWT
✅ Key Binding JWT created
✅ SD-JWT+KB token ready for presentation to Relying Party
✅ Email verification successful via WICG protocol!
📧 Verified email: test@multisport.com
✓ Email verified: true
```

#### Network Tab

Regardez les requêtes réseau:
1. DNS lookup (simulé, pas visible)
2. Fetch issuer config (mock)
3. POST to issuance_endpoint (simule avec Supabase)

---

## Ressources

### Spécifications

- **WICG Email Verification Protocol**: https://github.com/WICG/email-verification-protocol
- **SD-JWT Specification**: https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/
- **Credential Management API**: https://w3c.github.io/webappsec-credential-management/
- **WebAuthn**: https://www.w3.org/TR/webauthn-2/

### Standards Cryptographiques

- **EdDSA/Ed25519**: https://ed25519.cr.yp.to/
- **JWT (RFC 7519)**: https://tools.ietf.org/html/rfc7519
- **JWK (RFC 7517)**: https://tools.ietf.org/html/rfc7517
- **JWKS**: https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets

### Articles & Discussions

- **Hacker News Discussion**: https://news.ycombinator.com/item?id=45782192
- **Web Authentication Guide**: https://web.dev/articles/security-credential-management

---

## Conclusion

### Notre Implémentation

✅ **Fonctionnelle**: Démontre le flow complet du protocole
✅ **Éducative**: Code commenté et logs détaillés
✅ **Réaliste**: Suit la spécification WICG
⚠️ **Simulation**: Pas d'implémentation browser/issuer native

### Prêt pour l'Avenir

Quand le support natif arrivera:

1. **Remplacer polyfill** par `navigator.credentials` API
2. **Configurer DNS** records pour votre domaine
3. **Intégrer issuer** (si vous êtes email provider)
4. **Tests** avec vrais browsers et issuers

### Impact Potentiel

Si le protocole est adopté:
- 📈 **+30-50%** completion rate registrations
- ⚡ **-90%** temps de vérification (minutes → secondes)
- 🔒 **Privacy** améliorée pour utilisateurs
- 🌐 **Standard web** pour email verification

---

**Version**: 1.0.0 (Polyfill)
**Date**: Janvier 2025
**Status**: ⚠️ Conceptual Implementation - En attente support browser natif

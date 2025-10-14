export type Jwk = JsonWebKey

const EC_CURVE = "P-256"

export async function generateIdentityKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: EC_CURVE,
    },
    true,
    ["deriveBits", "deriveKey"],
  )
  return keyPair
}

export async function exportPublicKeyJwk(publicKey: CryptoKey): Promise<Jwk> {
  return (await crypto.subtle.exportKey("jwk", publicKey)) as Jwk
}

export async function exportPrivateKeyJwk(privateKey: CryptoKey): Promise<Jwk> {
  return (await crypto.subtle.exportKey("jwk", privateKey)) as Jwk
}

export async function importPublicKeyJwk(jwk: Jwk): Promise<CryptoKey> {
  return await crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: EC_CURVE }, true, [])
}

export async function importPrivateKeyJwk(jwk: Jwk): Promise<CryptoKey> {
  return await crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: EC_CURVE }, true, [
    "deriveBits",
    "deriveKey",
  ])
}

// Derive a symmetric AES-GCM key from our private key and peer's public key
export async function deriveSharedKey(myPrivateKey: CryptoKey, peerPublicJwk: Jwk): Promise<CryptoKey> {
  const peerPub = await importPublicKeyJwk(peerPublicJwk)
  const bits = await crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: peerPub,
    },
    myPrivateKey,
    256,
  )
  // Wrap derived bits into a raw key for AES-GCM
  return await crypto.subtle.importKey("raw", bits, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])
}

function toBase64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}
function fromBase64(b64: string) {
  const str = atob(b64)
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i)
  return bytes.buffer
}

export async function encryptText(sharedKey: CryptoKey, plaintext: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, enc)
  return {
    ciphertextB64: toBase64(ciphertext),
    ivB64: toBase64(iv.buffer),
  }
}

export async function decryptText(sharedKey: CryptoKey, ciphertextB64: string, ivB64: string) {
  const iv = new Uint8Array(fromBase64(ivB64))
  const ct = fromBase64(ciphertextB64)
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, sharedKey, ct)
  return new TextDecoder().decode(pt)
}

// Local storage helpers for private key (demo only; consider stronger protection)
const LS_PRIVATE_KEY = "e2e_private_jwk"
const LS_PUBLIC_KEY = "e2e_public_jwk"

export async function ensureIdentityKeys(): Promise<{
  publicJwk: Jwk
  privateJwk: Jwk
}> {
  const existingPriv = localStorage.getItem(LS_PRIVATE_KEY)
  const existingPub = localStorage.getItem(LS_PUBLIC_KEY)
  if (existingPriv && existingPub) {
    return { publicJwk: JSON.parse(existingPub), privateJwk: JSON.parse(existingPriv) }
  }
  const pair = await generateIdentityKeyPair()
  const pub = await exportPublicKeyJwk(pair.publicKey)
  const priv = await exportPrivateKeyJwk(pair.privateKey)
  localStorage.setItem(LS_PRIVATE_KEY, JSON.stringify(priv))
  localStorage.setItem(LS_PUBLIC_KEY, JSON.stringify(pub))
  return { publicJwk: pub, privateJwk: priv }
}

export function getStoredPrivateKeyJwk(): Jwk | null {
  const v = localStorage.getItem(LS_PRIVATE_KEY)
  return v ? JSON.parse(v) : null
}

export function getStoredPublicKeyJwk(): Jwk | null {
  const v = localStorage.getItem(LS_PUBLIC_KEY)
  return v ? JSON.parse(v) : null
}

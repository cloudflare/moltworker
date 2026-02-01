---
name: crypto
description: Cryptographic utilities for encryption, hashing, key generation, and secure random data. Supports AES-GCM, RSA, ECDSA, SHA-256/384/512, Argon2, and modern cryptographic standards.
---

# Crypto & Security

Modern cryptographic utilities for secure data handling.

## Quick Start

### Hash Data
```bash
node /path/to/skills/crypto/scripts/hash.js "data to hash" --algorithm sha256
```

### Encrypt Data
```bash
node /path/to/skills/crypto/scripts/encrypt.js "secret message" --password "mypassword"
```

### Generate Random
```bash
node /path/to/skills/crypto/scripts/random.js --bytes 32 --encoding hex
```

## Scripts

### hash.js
Cryptographic hashing with multiple algorithms.

**Usage:**
```bash
node hash.js <data> [OPTIONS]
```

**Options:**
- `--algorithm <alg>` - Hash algorithm: sha256, sha384, sha512, sha3-256 (default: sha256)
- `--encoding <enc>` - Output encoding: hex, base64, base64url (default: hex)
- `--file` - Treat input as file path
- `--hmac <key>` - Generate HMAC with key

### encrypt.js
Symmetric encryption using AES-256-GCM.

**Usage:**
```bash
node encrypt.js <data> --password <password>
node encrypt.js <data> --key <hex_key>
```

**Options:**
- `--password <pwd>` - Derive key from password (PBKDF2)
- `--key <hex>` - Use raw 256-bit key (hex encoded)
- `--output <file>` - Save encrypted data to file

### decrypt.js
Decrypt AES-256-GCM encrypted data.

**Usage:**
```bash
node decrypt.js <encrypted> --password <password>
node decrypt.js --file <path> --key <hex_key>
```

### random.js
Cryptographically secure random data generation.

**Usage:**
```bash
node random.js [OPTIONS]
```

**Options:**
- `--bytes <n>` - Number of bytes (default: 32)
- `--encoding <enc>` - Output: hex, base64, base64url, uuid, words (default: hex)
- `--count <n>` - Generate multiple values

### keygen.js
Generate cryptographic keys and key pairs.

**Usage:**
```bash
node keygen.js <type> [OPTIONS]
```

**Types:**
- `aes` - AES-256 symmetric key
- `rsa` - RSA key pair (2048, 4096 bits)
- `ecdsa` - ECDSA key pair (P-256, P-384)
- `ed25519` - Ed25519 key pair
- `password` - Password hash (bcrypt/argon2 style)

### sign.js
Digital signatures with RSA or ECDSA.

**Usage:**
```bash
node sign.js <data> --key <private_key_file>
node sign.js --verify <signature> --key <public_key_file> <data>
```

## Examples

### File Integrity Hash
```bash
node hash.js important-document.pdf --file --algorithm sha256
```

### Encrypt Sensitive Data
```bash
node encrypt.js '{"api_key":"sk-..."}' --password "strong-password-here"
```

### Generate API Key
```bash
node random.js --bytes 24 --encoding base64url
```

### Generate JWT Secret
```bash
node random.js --bytes 64 --encoding base64
```

### Create Key Pair for Signing
```bash
node keygen.js ecdsa --curve P-256 --output keys/
```

### HMAC Verification
```bash
node hash.js "message" --hmac "shared-secret" --algorithm sha256
```

## Output Formats

### hash.js
```json
{
  "algorithm": "sha256",
  "hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "encoding": "hex"
}
```

### encrypt.js
```json
{
  "algorithm": "aes-256-gcm",
  "iv": "base64_iv",
  "salt": "base64_salt",
  "tag": "base64_tag",
  "ciphertext": "base64_encrypted_data"
}
```

### keygen.js (ECDSA)
```json
{
  "type": "ecdsa",
  "curve": "P-256",
  "publicKey": "-----BEGIN PUBLIC KEY-----...",
  "privateKey": "-----BEGIN PRIVATE KEY-----..."
}
```

## Security Notes

- **Passwords**: Uses PBKDF2 with 600,000 iterations for key derivation
- **Encryption**: AES-256-GCM provides authenticated encryption
- **Random**: Uses Node.js crypto.randomBytes (CSPRNG)
- **Key Storage**: Private keys should never be logged or transmitted

# Changelog

All notable changes to the HackHub platform will be documented in this file.

## [1.1.0] - 2026-08-06

### 🛡️ Critical Security & Authentication Hardening

#### 1. Hardcoded JWT Secret Fallback Removal
- **Vulnerability Found**: `auth.middleware.js` contained a hardcoded fallback string for `JWT_SECRET`. If `process.env.JWT_SECRET` was omitted in deployment, any attacker who inspected source code could forge valid JWT auth tokens for any user.
- **Remediation**: Completely removed the hardcoded fallback. Implemented mandatory server startup validation in `server.js` that halts server boot immediately if `JWT_SECRET` is missing or empty. Rotated local JWT secret with a cryptographically generated 256-bit secret key.

#### 2. Universal Backdoor Password Removal
- **Vulnerability Found**: `auth.controller.js` contained an explicit bypass check during login allowing universal passwords (`Demo@2026!`, `Password123!`) to authenticate as *any* user account regardless of their actual password.
- **Remediation**: Removed all hardcoded password comparison fallbacks. Authentication now relies strictly on standard `bcrypt.compare()` hash verification against the user's stored password hash. Official demo accounts retain `Demo@2026!` as their explicit individual bcrypt hash.

#### 3. Cross-Domain Email Alias Fallback Elimination
- **Vulnerability Found**: The login endpoint attempted silent user lookups across fallback domain aliases (`@hackops.test`, `@hackops.ai`, `@hackhub.ai`) if the provided email address did not match a record directly.
- **Remediation**: Removed silent domain fallback looping. Login queries strictly enforce exact email matches (`User.findOne({ email: normEmail })`).

#### 4. CORS Allow-List Strict Enforcement
- **Vulnerability Found**: The CORS configuration included a permissive fallback `return callback(null, true)` that inadvertently accepted cross-origin requests from unapproved third-party domains.
- **Remediation**: Configured CORS to strictly reject origins not matching the explicit allow-list or authorized `.vercel.app` / `.netlify.app` subdomains, returning an explicit CORS error for disallowed origins.

#### 5. Environment-Based Staff Invite Code Gate & Secret Rotation
- **Vulnerability Found**: Privileged staff role registration (Organizer, Judge, Mentor, Sponsor) verified hardcoded invite code strings committed directly to source control (`auth.controller.js`).
- **Remediation**: Shifted staff invite code verification to `process.env.STAFF_INVITE_CODES` environment variables, rotated all valid codes, and added placeholder entries to `.env.example`.

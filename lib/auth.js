import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-use-a-strong-secret-in-production';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'ecom_session';

/**
 * Sign a JWT token with user payload.
 * @param {{ id: number, email: string, role: string }} payload
 */
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or null if invalid/expired.
 * @param {string} token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

/**
 * Build a Set-Cookie header string for the session token.
 * @param {string} token
 */
export function buildSessionCookie(token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

/**
 * Build a Set-Cookie header that clears the session cookie.
 */
export function clearSessionCookie() {
    return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

export { COOKIE_NAME };

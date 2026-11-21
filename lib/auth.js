import { SignJWT, jwtVerify } from 'jose';
const key = () => new TextEncoder().encode(process.env.JWT_SECRET);
export const sign = (p) => new SignJWT(p).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('8h').sign(key());
export const verify = async (t) => { try { return (await jwtVerify(t, key())).payload; } catch { return null; } };

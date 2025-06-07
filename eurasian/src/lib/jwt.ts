import { SignJWT } from 'jose';

type JwtPayload = {
  sub: string;
  [key: string]: any;
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

export async function signJwt(payload: JwtPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .setSubject(payload.sub)
    .setAudience('securebase-app')
    .sign(secret);
  return token;
}

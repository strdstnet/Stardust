export function decodeJWT(token: string): any {
  const [, payload] = token.split('.')

  const buffer = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  return JSON.parse(buffer.toString())
}

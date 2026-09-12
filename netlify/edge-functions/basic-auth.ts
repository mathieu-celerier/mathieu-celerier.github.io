import type { Config, Context } from '@netlify/edge-functions'

// Gates the whole site behind HTTP Basic Auth. Credentials come from
// BASIC_AUTH_USER / BASIC_AUTH_PASS site environment variables (Netlify
// dashboard), never committed to the repo. Fails closed if unset.
export default async (request: Request, context: Context) => {
  const user = Deno.env.get('BASIC_AUTH_USER')
  const pass = Deno.env.get('BASIC_AUTH_PASS')

  const unauthorized = () =>
    new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="devel preview", charset="UTF-8"' }
    })

  if (!user || !pass) return unauthorized()

  const auth = request.headers.get('authorization')
  if (auth !== `Basic ${btoa(`${user}:${pass}`)}`) return unauthorized()

  return context.next()
}

export const config: Config = { path: '/*' }

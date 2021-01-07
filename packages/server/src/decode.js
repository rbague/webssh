export function credentials (string) {
  const decoded = Buffer.from(string, 'base64').toString()
  const credentials = /^(.+):(.+)$/.exec(decoded)
  if (!credentials) return undefined

  const [, username, password] = credentials
  return { username, password }
}

export function hostPort (string) {
  const [host, port] = decodeURIComponent(string).split(':', 2)
  return { host, port }
}

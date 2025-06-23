export default function loginHandler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { username, password } = req.body
  // Validación simple: chequear que campos no estén vacíos
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' })
  }

  // Aquí validaría contra BD; por ahora token dummy
  const token = Buffer.from(JSON.stringify({ user: username })).toString('base64')

  // Setear cookie de sesión
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`)
  return res.status(200).json({ success: true })
} 
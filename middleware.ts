

export function middleware(req: any) {
  const url = req.nextUrl.clone()
  // Proteger /dashboard y sus subrutas
  if (url.pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('token')
    if (!token) {
      url.pathname = '/login'
      return Response.redirect(url)
    }
  }
  return Response.NextApiResponse()
}

export const config = {
  matcher: ['/dashboard/:path*'],
} 
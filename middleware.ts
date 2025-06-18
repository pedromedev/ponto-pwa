import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicPaths = ['/auth/login', '/auth/register']

// Rotas de API públicas (se houver)
const publicApiPaths = ['/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso a arquivos estáticos e recursos do Next.js
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/manifest.json') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verificar se é uma rota pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  const isPublicApiPath = publicApiPaths.some(path => pathname.startsWith(path))

  if (isPublicPath || isPublicApiPath) {
    return NextResponse.next()
  }

  // Verificar se o usuário está autenticado através do cookie de sessão
  const authToken = request.cookies.get('auth-token')

  if (!authToken) {
    // Redirecionar para login se não estiver autenticado
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Continuar se estiver autenticado
  return NextResponse.next()
}

// Configurar matcher para aplicar o middleware em todas as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
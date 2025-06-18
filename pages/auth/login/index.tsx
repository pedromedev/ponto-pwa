import AuthLayout from '../layout'
import { ReactElement, useState } from 'react'
import type { NextPageWithLayout } from '../../_app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'

const Login: NextPageWithLayout = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login, isLoading } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Por favor, preencha todos os campos')
            return
        }

        const success = await login(email, password)
        if (success) {
            router.push('/')
        } else {
            setError('Email ou senha inválidos')
        }
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>
                    Digite suas credenciais para acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className="w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
                <div className="text-center text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <Link href="/auth/register" className="text-primary hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

Login.getLayout = function getLayout(page: ReactElement) {
    return <AuthLayout>{page}</AuthLayout>
}

export default Login
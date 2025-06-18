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

const Register: NextPageWithLayout = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const { register, isLoading } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validações básicas
        if (!name || !email || !password || !confirmPassword) {
            setError('Por favor, preencha todos os campos')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        const result = await register(email, password, name)
        
        if (result.success) {
            setSuccess(result.message || 'Conta criada com sucesso!')
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                router.push('/auth/login')
            }, 2000)
        } else {
            setError(result.message || 'Erro ao criar conta')
        }
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                <CardDescription>
                    Preencha os campos abaixo para criar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                            {success}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome completo"
                            className="w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                </form>
                <div className="text-center text-sm text-muted-foreground">
                    Já tem uma conta?{' '}
                    <Link href="/auth/login" className="text-primary hover:underline">
                        Faça login
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

Register.getLayout = function getLayout(page: ReactElement) {
    return <AuthLayout>{page}</AuthLayout>
}

export default Register
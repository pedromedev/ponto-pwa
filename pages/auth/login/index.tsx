import AuthLayout from '../layout'
import { ReactElement, useEffect } from 'react'
import type { NextPageWithLayout } from '../../_app'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

import { useLoginFormStore } from "@/stores/login"
import { useAuth } from '@/lib/auth'

const Login: NextPageWithLayout = () => {

    const { login } = useAuth()
    const { 
        email, 
        password, 
        isSubmitting, 
        error,
        
        setEmail, 
        setPassword, 
        setError,
        setSubmitting,
        clearForm 
    } = useLoginFormStore() // Estado do formulário

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const result = await login(email, password)
            if(result) clearForm()
            // Redirecionar ou mostrar sucesso
        } catch (err: any) {
            // Tratar erro
            setError(`${err.message}`)
            console.error('Erro durante o login:', error)
        } finally {
            setSubmitting(false)
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
                    {error !== null && (
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
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
import AuthLayout from '../layout'
import { ReactElement } from 'react'
import type { NextPageWithLayout } from '../../_app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const Register: NextPageWithLayout = () => {
    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                <CardDescription>
                    Preencha os campos abaixo para criar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="w-full"
                    />
                </div>
                <Button className="w-full" size="lg">
                    Criar Conta
                </Button>
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
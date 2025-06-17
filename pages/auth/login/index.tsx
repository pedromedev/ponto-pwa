import AuthLayout from '../layout'
import { ReactElement } from 'react'
import type { NextPageWithLayout } from '../../_app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const Login: NextPageWithLayout = () => {
    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>
                    Digite suas credenciais para acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button className="w-full" size="lg">
                    Entrar
                </Button>
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
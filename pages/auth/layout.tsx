import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    // Evitar hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Renderizar sem padrão durante a hidratação
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md relative z-10">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Padrão de fundo corrigido */}
            <div 
                className="absolute inset-0 w-full h-full"
                style={{
                    backgroundImage: `url(/images/pattern.svg)`,
                    backgroundSize: '200px 200px',
                    backgroundPosition: '0 0',
                    backgroundRepeat: 'repeat',
                }}
            />
            
            {/* Gradient overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/40 to-background/70" />
            
            {/* Conteúdo principal */}
            <div className="w-full max-w-md relative z-10">
                <div className="backdrop-blur-sm bg-background/80 rounded-xl p-2 shadow-xl border border-border/30">
                    {children}
                </div>
            </div>
        </div>
    )
}
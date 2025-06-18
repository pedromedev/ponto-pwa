# Sistema de Autenticação - Ponto PWA

Este documento descreve como funciona o sistema de autenticação implementado no Ponto PWA.

## Componentes do Sistema

### 1. Middleware (`middleware.ts`)
- **Função**: Intercepta todas as requisições e verifica se o usuário está autenticado
- **Localização**: Raiz do projeto
- **Como funciona**:
  - Verifica se existe um cookie `auth-token`
  - Permite acesso livre às rotas de autenticação (`/auth/login`, `/auth/register`)
  - Redireciona para `/auth/login` se não há token válido
  - Permite acesso a arquivos estáticos e recursos do Next.js

### 2. Context de Autenticação (`lib/auth.tsx`)
- **Função**: Gerencia o estado global de autenticação
- **Funcionalidades**:
  - `login(email, password)`: Autentica o usuário
  - `logout()`: Remove dados de autenticação e redireciona
  - `user`: Dados do usuário logado
  - `isAuthenticated`: Status de autenticação
  - `isLoading`: Estado de carregamento

### 3. AuthGuard (`components/auth-guard.tsx`)
- **Função**: Componente de proteção adicional para páginas
- **Como usar**: Envolve páginas que precisam de autenticação
- **Funcionalidades**:
  - Mostra loading enquanto verifica autenticação
  - Redireciona para login se não autenticado
  - Renderiza conteúdo se autenticado

### 4. Páginas Protegidas
- Todas as páginas exceto `/auth/*` são protegidas
- Usam o `AuthGuard` como camada extra de segurança
- Têm acesso ao contexto de autenticação via `useAuth()`

## Como Usar

### 1. Login com API Real
O sistema está conectado com a API do backend em `http://localhost:3001`.
Certifique-se de que o backend esteja rodando na porta 3001.

### 2. Proteger uma Nova Página
```tsx
import AuthGuard from '@/components/auth-guard'
import { useAuth } from '@/lib/auth'

const MinhaPagena = () => {
  const { user } = useAuth()
  
  return (
    <AuthGuard>
      <div>Conteúdo protegido para {user?.name}</div>
    </AuthGuard>
  )
}
```

### 3. Fazer Logout
O botão de logout está disponível no dropdown do usuário no header.
Também pode ser chamado programaticamente:

```tsx
const { logout } = useAuth()
// logout() // Remove dados e redireciona
```

## Armazenamento

### LocalStorage
- `auth-token`: Token de autenticação
- `user-data`: Dados do usuário (JSON)

### Cookies
- `auth-token`: Usado pelo middleware para verificação server-side

## Fluxo de Autenticação

1. **Usuário não logado**:
   - Middleware detecta ausência de cookie
   - Redireciona para `/auth/login`

2. **Login**:
   - Usuário preenche credenciais
   - Sistema valida (atualmente simulado)
   - Salva token no localStorage e cookie
   - Redireciona para página inicial

3. **Navegação**:
   - Middleware verifica cookie em cada requisição
   - AuthGuard verifica estado no cliente
   - Acesso permitido se autenticado

4. **Logout**:
   - Remove dados do localStorage
   - Remove cookie
   - Redireciona para login

## API Integrada

✅ **Já conectado com o backend!**

### Funcionalidades Implementadas:

1. **Login** - `/auth/login`
   - Autentica usuário e retorna tokens
   - Busca automaticamente dados do perfil

2. **Registro** - `/auth/register`
   - Cria novo usuário
   - Validação de email único

3. **Logout** - `/auth/logout`
   - Invalida sessão no servidor
   - Limpa dados locais

4. **Refresh Token** - `/auth/refresh`
   - Renovação automática de tokens expirados
   - Interceptação transparente nas requisições

### Utilitário de API (`lib/api.ts`):
- Interceptação automática de tokens expirados
- Refresh automático de tokens
- Logout automático em caso de erro de autenticação
- Métodos de conveniência (get, post, put, delete)

## Segurança

### Implementado
- ✅ Middleware protege todas as rotas
- ✅ AuthGuard como proteção adicional
- ✅ Logout remove todos os dados
- ✅ Cookies com tempo de expiração

### A Implementar (Produção)
- [ ] HTTPS obrigatório
- [ ] Validação de token no servidor
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Criptografia de dados sensíveis 
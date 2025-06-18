# 🏗️ Arquitetura Clean Code - Sistema de Ponto

## 📁 Estrutura de Pastas

```
ponto-pwa/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes básicos de UI
│   ├── time-field-component.tsx  # Componente específico para campos de tempo
│   └── ...
├── hooks/               # Custom hooks para lógica de negócio
│   └── use-time-entry.ts
├── types/               # Definições de tipos e interfaces
│   └── time-entry.ts
├── pages/               # Páginas da aplicação
│   └── index.tsx        # Página principal (clean e simples)
└── lib/                 # Utilitários e configurações
    ├── api.ts
    └── auth.tsx
```

## 🧩 Princípios Aplicados

### 1. **Separação de Responsabilidades**
- **Components**: Apenas apresentação e UI
- **Hooks**: Lógica de negócio e estado
- **Types**: Contratos e interfaces
- **Pages**: Orquestração e layout

### 2. **Single Responsibility Principle**
- Cada arquivo tem uma responsabilidade única e bem definida
- Componentes pequenos e focados
- Hooks específicos para cada funcionalidade

### 3. **Dependency Inversion**
- Componentes dependem de abstrações (props/interfaces)
- Lógica de negócio isolada em hooks
- Types centralizados para reutilização

## 📝 Componentes Principais

### `useTimeEntry` Hook
Centraliza toda a lógica de:
- Gerenciamento de estado dos campos
- Validações
- Submissão para API
- Formatação de dados

### `TimeFieldComponent`
Componente reutilizável que:
- Recebe props com callbacks
- Não possui lógica de negócio
- Focado apenas na apresentação

### `index.tsx` (Página Principal)
- Mínima e limpa
- Apenas orquestração
- Componentes pequenos e focados

## 🎯 Benefícios

### ✅ **Manutenibilidade**
- Código organizado e fácil de encontrar
- Mudanças isoladas em responsabilidades específicas
- Testes mais simples e diretos

### ✅ **Reutilização**
- Componentes independentes
- Hooks reutilizáveis
- Types compartilhados

### ✅ **Escalabilidade**
- Estrutura preparada para crescimento
- Padrões consistentes
- Baixo acoplamento

### ✅ **Legibilidade**
- Código autodocumentado
- Nomes descritivos
- Fluxo claro de dados

## 🔄 Fluxo de Dados

```
Page (index.tsx)
    ↓
useTimeEntry Hook
    ↓
TimeFieldComponent
    ↓
User Interaction
    ↓
Callback Props
    ↓
Hook Updates State
    ↓
Re-render Components
```

## 🧪 Testing Strategy

- **Unit Tests**: Hooks isolados
- **Component Tests**: Props e rendering
- **Integration Tests**: Fluxo completo
- **E2E Tests**: User journey

## 📋 Convenções

### Naming
- `use[Feature]`: Custom hooks
- `[Feature]Component`: Componentes específicos
- `[Feature].types.ts`: Tipos relacionados

### Files
- Um componente por arquivo
- Exports nomeados preferencialmente
- Interfaces co-localizadas quando específicas

### Props
- Callbacks com prefixo `on`
- Props descritivas e tipadas
- Desestruturação consistente 
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript chat application for communicating with Claude AI via the Anthropic API. The interface is inspired by the official Claude app.

## Development Commands

### Setup
```bash
npm install  # Install dependencies
```

### Development
```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Type Checking
```bash
npx tsc --noEmit  # Check TypeScript types without emitting files
```

## Architecture

### Component Structure
- **Hooks-based**: All components are functional components using React hooks (no classes)
- **Component hierarchy**: `App → ChatContainer → (ApiKeyInput | MessageList + MessageInput)`
- **State management**: Centralized in `useChat` hook using useState
- **Service layer**: `claudeService` singleton handles all API communication

### Key Patterns
1. **useChat hook**: Main state management hook that handles:
   - Message history
   - API key storage (localStorage)
   - Message sending and receiving
   - Loading and error states

2. **claudeService**: Singleton service using `@anthropic-ai/sdk`
   - Must be initialized with API key before use
   - Uses `dangerouslyAllowBrowser: true` for direct browser API calls
   - Model: `claude-3-5-sonnet-20241022`
   - Max tokens: 8096

3. **Component colocation**: Each component has its own CSS file
   - CSS uses CSS variables for theming (defined in index.css)
   - BEM-like naming convention for CSS classes

### File Organization
```
src/
├── components/    # UI components with colocated CSS
├── hooks/         # Custom React hooks (useChat)
├── services/      # API services (claudeService)
├── types/         # TypeScript interfaces
├── App.tsx        # Root component
├── main.tsx       # Entry point
└── index.css      # Global styles + CSS variables
```

### TypeScript Types
- **Message**: `{ id: string, role: 'user' | 'assistant', content: string, timestamp: number }`
- **ChatState**: `{ messages: Message[], isLoading: boolean, error: string | null }`

### API Integration
- Library: `@anthropic-ai/sdk` (official Anthropic TypeScript SDK)
- API key stored in localStorage (not secure for production)
- Direct browser-to-API communication (requires CORS configuration)
- Messages are sent with full conversation history

### Styling
- CSS Variables for theming (see `src/index.css`)
- No CSS frameworks or libraries
- Responsive design principles
- Claude-inspired color scheme:
  - Primary accent: `#c5915f` (brown/tan)
  - User messages: `#f0ebe6` (light beige)
  - Assistant messages: white background

### State Persistence
- API key stored in localStorage as `claude_api_key`
- Messages are not persisted (cleared on page reload)
- Auto-loads API key on mount if available

## Important Notes

1. **Security**: Current implementation stores API key in localStorage and makes direct API calls from browser. For production:
   - Move API calls to backend proxy
   - Implement proper authentication
   - Use environment variables for API keys

2. **Adding Features**: When adding new features:
   - Keep using hooks (no class components)
   - Follow the existing file structure (components, hooks, services, types)
   - Colocate CSS with components
   - Update TypeScript types in `src/types/`

3. **Testing**: No tests are currently configured. When adding tests:
   - Use Vitest (Vite's test framework)
   - Test hooks separately from components
   - Mock `claudeService` for component tests

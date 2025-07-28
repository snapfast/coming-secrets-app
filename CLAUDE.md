# CLAUDE.md - Coming Secrets App

## 🚨 CRITICAL STYLING RULE
**ALWAYS USE ONLY `cs-` CLASSES FROM `globals.css` - NEVER DIRECT TAILWIND**
- ✅ CORRECT: `<h1 className="cs-secret-title">Secret Locked</h1>`
- ❌ WRONG: `<h1 className="text-4xl font-bold">Secret Locked</h1>`

## Quick Reference

### Tech Stack
- **Framework**: Next.js 15.3.5 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4.0 with centralized `cs-` design system
- **Security**: Brotli compression + AES encryption (v3 format)
- **Time**: Server-synchronized UTC (WorldTimeAPI)

### Commands
```bash
npm run dev    # Development
npm run build  # Production build
npm run lint   # Linting
```

### File Structure
```
src/app/
├── page.tsx         # Message creation (1000 char limit)
├── view/page.tsx    # Message viewing (single hint, calendar)
├── profile/page.tsx # Local storage management
├── test/page.tsx    # 1000-word integrity testing
└── globals.css      # Centralized CSS design system

src/lib/
├── crypto.ts        # Brotli + AES encryption (v3 only)
├── time.ts          # Server time sync (WorldTimeAPI)
├── storage.ts       # Local storage utilities
└── analytics.ts     # Google Analytics tracking
```

## Key Features (Alpha)

### Message Creation (`src/app/page.tsx`)
- 8 message templates + preview modal
- Character limits: 1000 message / 100 sender / 200 hint
- Single hint system (always visible)
- Multi-platform sharing (6 platforms)
- Automatic profile storage

### Message Viewing (`src/app/view/page.tsx`)
- Single hint display (no progressive unlock)
- Multi-format countdown + progress bar
- Calendar reminders (locked messages only)
- Celebration animations
- Green "Create New Message" button (`cs-button-green`)

### Calendar Integration (Locked Only)
- Unified `cs-calendar-button` class
- Google (popup), Apple (ICS), Outlook (popup)
- Horizontal on desktop, vertical on mobile
- Purple focus rings, no borders

### Profile Management (`src/app/profile/page.tsx`)
- Local storage-based secret management
- Statistics dashboard (total/locked/unlocked)
- Copy/delete functionality

## Security System

### Time Security (`src/lib/time.ts`)
- Server-synchronized UTC prevents clock manipulation
- WorldTimeAPI → HTTP headers → local time fallbacks
- 5-minute re-sync intervals
- Functions: `getServerTime()`, `isDateUnlockedSecure()`

### Encryption (`src/lib/crypto.ts`)
- Brotli compression + AES encryption
- v3 format only (no backward compatibility)
- Base64URL encoding for URL safety

### Data Structure
```typescript
interface SecretData {
  message: string;       // Max 1000 chars
  unlockDate: string;
  senderName?: string;   // Max 100 chars
  hint?: string;         // Max 200 chars
}
```

## Design System (`src/app/globals.css`)

### Core Principles
- All classes use `cs-` prefix
- Single semantic class per element
- No class-to-class references (avoid Tailwind errors)
- Mobile-first responsive design

### Key Classes
```css
/* Buttons */
.cs-button-green     # Green buttons (no gradient)
.cs-button-primary   # White/gray with purple text
.cs-calendar-button  # Unified calendar styling

/* Layout */
.cs-page-layout → .cs-page-content → .cs-page-inner
.cs-flex-center      # Centered flex containers
.cs-form-wrapper     # Card containers

/* Typography */
.cs-heading-1/2/3    # Text hierarchy
.cs-text-purple-dark # Themed colors
```

### Recent Consolidations
- Unified green buttons: `cs-button-green` (removed gradient)
- Calendar buttons: Single `cs-calendar-button` class
- Form inputs: Consolidated base patterns
- Card system: Unified glass effects

## Layout Patterns

### Responsive Calendar Buttons
```tsx
<div className="flex flex-col sm:flex-row gap-3 justify-center">
  <button className="cs-calendar-button">Google</button>
  <button className="cs-calendar-button">Apple</button>
  <button className="cs-calendar-button">Outlook</button>
</div>
```

### Standard Page Structure
```tsx
<div className="cs-page-layout">
  <div className="cs-page-content">
    <div className="cs-page-inner">
      <Header />
      <div className="cs-form-wrapper">
        {/* Content */}
      </div>
      <Footer />
    </div>
  </div>
</div>
```

## Alpha Features (Current State)
- ✅ Single hint system (always visible)
- ✅ Calendar reminders (locked messages only)
- ✅ Brotli compression + AES encryption
- ✅ Server time synchronization
- ✅ Profile management with local storage
- ✅ Centralized CSS design system
- ❌ Progressive hints (removed)
- ❌ Reaction/reply system (removed)
- ❌ Backward compatibility (removed)

## Common Tasks

### Adding New CSS Classes
1. Add to `src/app/globals.css` with `cs-` prefix
2. Use only base Tailwind utilities (no class references)
3. Test build with `npm run build`

### Calendar Button Updates
- All use unified `cs-calendar-button` class
- Responsive: vertical mobile, horizontal desktop
- No borders, purple focus rings

### Form Styling
- Use `cs-field-input`, `cs-field-textarea` for inputs
- Character limits: validate and display counters
- Error states: `cs-field-input-error`

## Testing Checklist
- [ ] Character limits (1000/100/200)
- [ ] Single hint display (always visible)
- [ ] Calendar buttons (locked only)
- [ ] Server time sync resistance
- [ ] Mobile/desktop responsiveness
- [ ] Build passes (`npm run build`)

---
*Alpha version - Centralized design system, consolidated CSS, server time security*
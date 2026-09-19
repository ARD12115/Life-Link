# LifeLink Frontend - Modern 3D Emergency Blood Network

A modern, performant frontend for the LifeLink emergency blood donor matching platform built with Next.js 14, React Three Fiber, and Framer Motion.

## Features

- **Modern 3D Animations**: Scroll-driven 3D globe morphing, floating particles, morphing models
- **Light/Dark/System Theme**: Complete theming system with CSS variables, localStorage persistence
- **Adaptive 3D**: Progressive enhancement - full 3D on capable devices, graceful fallbacks
- **Modern Auth Pages**: Login/Register with 3D backgrounds, Framer Motion animations
- **Responsive Design**: Mobile-first, works on all devices
- **Accessibility**: Reduced motion support, high contrast, focus management
- **TypeScript**: Full type safety
- **Supabase Integration**: Auth, Database, Real-time

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **3D Engine**: React Three Fiber (R3F) + Drei
- **Animations**: Framer Motion + GSAP
- **State**: Zustand + TanStack Query
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + CSS Variables

## Quick Start

```bash
# Install dependencies
cd C:/LifeLink/lifelink-frontend
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Get these from Supabase Dashboard → Settings → API

## Project Structure

```
lifelink-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Login page with 3D background
│   │   │   └── register/page.tsx   # Register page with 3D background
│   │   ├── globals.css             # Global styles + CSS variables
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── 3d/                     # 3D components (HeroGlobe, Logo3D, LoginBackground)
│   │   ├── providers/              # ThemeProvider, SupabaseProvider
│   │   └── ui/                     # Reusable UI components (Button, Input, Card, Toast, etc.)
│   ├── hooks/
│   │   ├── useDeviceCapabilities.ts # Device detection, reduced motion
│   │   └── useScrollAnimations.ts   # Scroll-triggered animations
│   ├── lib/
│   │   └── supabase.ts             # Supabase client + types
│   ├── styles/
│   │   └── variables.css           # CSS variables for theming
│   └── hooks/
├── public/
│   └── models/                     # 3D models (GLTF/GLB)
└── tailwind.config.ts
```

## Key Features

### 1. Theme System
- Light/Dark/System mode with CSS variables
- Persists to localStorage
- Respects system preference
- No flash on load (inline script in layout)

### 3D Hero Globe
- Scroll-driven morphing (wireframe → low-poly → textured → detailed)
- Adaptive: full 3D on capable devices, static fallback on low-end
- Reduced motion support

### Auth Pages
- Login page with 3D background, social login, password toggle
- Register page with user type selection (donor/hospital), blood group selection
- Framer Motion animations throughout
- Toast notifications

### Adaptive 3D
- Detects WebGL2 support, device memory, reduced motion preference
- Graceful fallbacks for low-end devices
- Respects `prefers-reduced-motion`

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Deployment

### Cloudflare Pages
1. Connect GitHub repo
2. Build command: `npm run build`
3. Output directory: `.next`
4. Root directory: `lifelink-frontend`
4. Add environment variables in Cloudflare Pages settings

### Vercel
```bash
vercel deploy
```

## Performance

- Dynamic imports for 3D components (`ssr: false`)
- DRACO-compressed GLTF models
- Lazy loading with Suspense
- DRACO compression for 3D models
- Reduced motion support
- Code splitting with Next.js App Router

## Accessibility

- Semantic HTML
- Focus management
- Reduced motion support
- High contrast mode support
- ARIA labels
- Focus visible styles
- Color contrast ratios

## 3D Models

Place GLTF/GLB models in `public/models/`:
- `globe-wireframe.glb`
- `globe-lowpoly.glb`
- `globe-textured.glb`
- `globe-detailed.glb`

Compress with DRACO:
```bash
gltf-pipeline -i model.glb -o model.draco.glb -d
gltf-transform lod model.glb model-lod.glb --levels=4 --ratio=0.5
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
4. Open Pull Request

## Support

For issues, open a GitHub issue or contact the LifeLink team.
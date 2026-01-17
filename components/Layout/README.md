# Layout Component Structure

Refactored layout into modular, reusable components for better maintainability and scalability.

## 📁 Directory Structure

```
components/Layout/
├── Header/
│   ├── Header.tsx              # Main header wrapper
│   ├── Logo.tsx                # Brand logo with animation
│   ├── LanternDecoration.tsx   # Tet lantern decorations
│   ├── Navigation.tsx          # Desktop navigation menu
│   ├── ThemeToggle.tsx         # Dark/Light mode toggle
│   ├── HeaderActions.tsx       # Search, Cart, Login buttons
│   └── MobileMenu.tsx          # Mobile hamburger menu
├── Footer/
│   ├── Footer.tsx              # Main footer wrapper
│   ├── FeatureBanner.tsx       # Feature cards (shipping, support, etc.)
│   ├── CompanyInfo.tsx         # Company logo, description, contact
│   ├── FooterLinks.tsx         # Footer link sections
│   └── StoreMap.tsx            # Google Maps + Contact cards
└── index.ts                    # Central export point
```

## 🎯 Benefits

### 1. **Modularity**
- Each component has single responsibility
- Easy to locate and modify specific features
- Components can be reused across pages

### 2. **Maintainability**
- Smaller files (~20-80 lines each)
- Clear separation of concerns
- Easier debugging and testing

### 3. **Reusability**
- `Logo` can be used in other pages
- `ThemeToggle` can be placed anywhere
- `FeatureBanner` can be reused in product pages

### 4. **Performance**
- Easier to implement React.memo for optimization
- Potential for code-splitting
- Lazy loading for mobile menu

### 5. **Team Collaboration**
- Multiple developers can work on different components
- Reduced merge conflicts
- Clear component ownership

## 📝 Component Details

### Header Components

**Header.tsx** (Main)
- Manages theme state
- Coordinates all header sub-components
- Handles responsive layout

**Logo.tsx**
- Brand identity with gradient effect
- Click to navigate home
- Chinese character decoration (春)

**LanternDecoration.tsx**
- Traditional Tet lantern animations
- Left and right decorative elements
- Hidden on mobile

**Navigation.tsx**
- Desktop menu items
- Active state highlighting
- Smooth hover effects

**ThemeToggle.tsx**
- Dark/Light mode switcher
- Icon animation
- Persists theme preference

**HeaderActions.tsx**
- Search button
- Shopping cart with badge
- Login/Register button

**MobileMenu.tsx**
- Hamburger menu toggle
- Slide-down animation
- Full-width navigation

### Footer Components

**Footer.tsx** (Main)
- Coordinates all footer sections
- Responsive grid layout
- Tet-themed background

**FeatureBanner.tsx**
- 4 feature cards
- Icons with descriptions
- Responsive grid (2 cols → 4 cols)

**CompanyInfo.tsx**
- Company logo and name
- Business description
- Contact information (address, phone, email)

**FooterLinks.tsx**
- 3 link sections (About, Support, Categories)
- Hover effects
- SEO-friendly structure

**StoreMap.tsx**
- Google Maps embed
- Contact information cards
- Direction button
- Store hours

## 🔧 Usage

Import from the centralized index:

```tsx
import { Header, Footer } from './components/Layout';

// Use in your app
<Header onNavigate={handleNavigate} currentScreen={currentScreen} />
<Footer />
```

Or import specific components:

```tsx
import { Logo } from './components/Layout/Header/Logo';
import { ThemeToggle } from './components/Layout/Header/ThemeToggle';
```

## 🚀 Future Improvements

1. **Add TypeScript interfaces file** - Create `types.ts` for shared interfaces
2. **Implement React.memo** - Optimize re-renders for static components
3. **Add Storybook** - Document and test components in isolation
4. **Create custom hooks** - Extract theme logic to `useTheme` hook
5. **Add analytics** - Track navigation and button clicks
6. **Accessibility** - Add ARIA labels and keyboard navigation
7. **Testing** - Unit tests for each component

## 📊 Metrics

**Before Refactor:**
- Layout.tsx: 353 lines
- 2 components (Header, Footer)
- Hard to maintain

**After Refactor:**
- 13 small components
- Average 30-80 lines per file
- Easy to maintain and extend

## 🎨 Design Patterns Used

- **Component Composition** - Building complex UI from simple pieces
- **Props Drilling** - Passing data through component tree
- **Separation of Concerns** - Each component has one job
- **DRY Principle** - Reusable feature cards and link sections
- **Responsive Design** - Mobile-first approach

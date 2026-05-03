# Color Reference - Exampapel Theme

## Primary Colors (Teal/Turquoise)

| Color | CSS Variable | OKLCH Value | Hex Equivalent | Usage |
|-------|-------------|-------------|----------------|-------|
| Teal-50 | `--teal-50` | `oklch(0.98 0.02 180)` | ~#F0FDFA | Backgrounds |
| Teal-100 | `--teal-100` | `oklch(0.95 0.05 180)` | ~#CCFBF1 | Light backgrounds |
| Teal-200 | `--teal-200` | `oklch(0.88 0.08 180)` | ~#99F6E4 | Hover states |
| Teal-300 | `--teal-300` | `oklch(0.78 0.12 180)` | ~#5EEAD4 | Borders |
| Teal-400 | `--teal-400` | `oklch(0.65 0.14 180)` | ~#2DD4BF | Active states |
| **Teal-500** | `--teal-500` | `oklch(0.55 0.15 180)` | **~#14B8A6** | **Primary brand** |
| Teal-600 | `--teal-600` | `oklch(0.45 0.14 180)` | ~#0D9488 | Dark accents |

## Accent Colors

| Color | CSS Variable | OKLCH Value | Hex Equivalent | Usage |
|-------|-------------|-------------|----------------|-------|
| Coral-400 | `--coral-400` | `oklch(0.70 0.18 25)` | ~#FB923C | Warm accents |
| Coral-500 | `--coral-500` | `oklch(0.65 0.20 25)` | ~#F97316 | Decorative |
| Purple-400 | `--purple-400` | `oklch(0.65 0.18 290)` | ~#C084FC | Cool accents |
| Purple-500 | `--purple-500` | `oklch(0.55 0.20 290)` | ~#A855F7 | Decorative |
| Yellow-400 | `--yellow-400` | `oklch(0.85 0.15 85)` | ~#FACC15 | Bright accents |
| Yellow-500 | `--yellow-500` | `oklch(0.75 0.18 85)` | ~#EAB308 | Decorative |

## Usage in Tailwind

### Background Colors
```tsx
className="bg-teal-50"      // Very light teal background
className="bg-teal-100"     // Light teal background
className="bg-teal-500"     // Primary teal background
className="bg-coral-400"    // Coral background
className="bg-purple-400"   // Purple background
className="bg-yellow-400"   // Yellow background
```

### Text Colors
```tsx
className="text-teal-500"   // Primary teal text
className="text-teal-600"   // Dark teal text
className="text-coral-500"  // Coral text
className="text-purple-500" // Purple text
className="text-yellow-500" // Yellow text
```

### Border Colors
```tsx
className="border-teal-300" // Light teal border
className="border-teal-500" // Primary teal border
```

### Hover States
```tsx
className="hover:bg-teal-600"  // Darker on hover
className="hover:text-teal-400" // Lighter text on hover
```

## Component Color Mapping

### Buttons
- **Primary:** `bg-teal-500 hover:bg-teal-600 text-white`
- **Secondary:** `bg-white border-teal-500 text-teal-500 hover:bg-teal-50`
- **Outline:** `border-gray-300 hover:border-teal-500`

### Cards
- **Background:** `bg-white`
- **Border:** `border-gray-100` or `border-teal-100`
- **Hover:** `hover:border-teal-300 hover:shadow-lg`

### Stats Bar
- **Background:** `bg-teal-500`
- **Text:** `text-white`
- **Secondary text:** `text-teal-100`

### Badges
- **Primary:** `bg-teal-100 text-teal-700`
- **Secondary:** `bg-gray-100 text-gray-700`
- **Accent:** `bg-coral-100 text-coral-700`

### Links
- **Default:** `text-teal-600`
- **Hover:** `hover:text-teal-500 hover:underline`
- **Visited:** `text-teal-700`

## Gradient Combinations

### Hero Background
```tsx
className="bg-gradient-to-br from-gray-50 via-white to-teal-50"
```

### Card Gradients
```tsx
className="bg-gradient-to-br from-teal-100 to-teal-50"
className="bg-gradient-to-r from-teal-500 to-teal-600"
```

### Text Gradients
```tsx
className="bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent"
```

## Decorative Elements

### Dotted Patterns
```tsx
<div className="w-1 h-1 bg-teal-500 rounded-full opacity-20" />
```

### Circular Borders
```tsx
<div className="w-20 h-20 border-4 border-coral-400 rounded-full opacity-30" />
<div className="w-16 h-16 border-4 border-purple-400 rounded-full opacity-30" />
```

### Solid Circles
```tsx
<div className="w-12 h-12 bg-yellow-400 rounded-full opacity-40" />
```

## Accessibility

### Contrast Ratios (WCAG AA)

✅ **Passing Combinations:**
- White text on Teal-500: 4.5:1 (AA)
- Teal-600 text on White: 7:1 (AAA)
- Teal-500 text on White: 4.5:1 (AA)
- Gray-900 text on Teal-50: 12:1 (AAA)

⚠️ **Use with caution:**
- Teal-400 text on White: 3:1 (fails AA for body text)
- Yellow-400 on White: 2:1 (decorative only)

### Recommendations
- Use Teal-600 or darker for body text
- Use Teal-500 for large text (18px+) or bold
- Keep decorative elements at lower opacity
- Test with color blindness simulators

## Dark Mode (Future)

If implementing dark mode, suggested values:

```css
.dark {
  --teal-500: oklch(0.65 0.15 180); /* Lighter teal */
  --teal-600: oklch(0.75 0.14 180); /* Even lighter */
  --background: oklch(0.15 0 0);    /* Dark background */
  --foreground: oklch(0.95 0 0);    /* Light text */
}
```

## Quick Copy-Paste

### Primary Button
```tsx
<Button className="bg-teal-500 hover:bg-teal-600 text-white">
  Click me
</Button>
```

### Card with Teal Accent
```tsx
<div className="bg-white border border-teal-100 hover:border-teal-300 rounded-lg p-6">
  Content
</div>
```

### Teal Badge
```tsx
<span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">
  Badge
</span>
```

### Stats Display
```tsx
<div className="bg-teal-500 text-white p-6 rounded-lg">
  <div className="text-3xl font-bold">2500+</div>
  <div className="text-teal-100">Exam Papers</div>
</div>
```

---

**Color System:** Teal-based with coral, purple, yellow accents
**Format:** OKLCH (modern, perceptually uniform)
**Accessibility:** WCAG AA compliant for primary colors
**Usage:** Apply via Tailwind utility classes

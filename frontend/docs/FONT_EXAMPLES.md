# GTSuper Font Examples

## How GTSuper is Applied to Your Landing Page

### Hero Section

```tsx
// src/components/public/hero-section.tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
  Master Your Exams with
  <span className="text-blue-600"> Past Papers</span>
</h1>
```

**Result:** This h1 will use **GTSuper at 400 weight** (even though `font-bold` is applied, the base font-family is GTSuper)

### Recent Questions Section

```tsx
// src/components/public/recent-questions-section.tsx
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
  Recent Questions
</h2>
```

**Result:** This h2 will use **GTSuper at 400 weight**

### Featured Institutions Section

```tsx
// src/components/public/featured-institutions-section.tsx
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
  Featured Institutions
</h2>
```

**Result:** This h2 will use **GTSuper at 400 weight**

### Stats Section

```tsx
// src/components/public/stats-section.tsx
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
  Growing Library of Resources
</h2>
```

**Result:** This h2 will use **GTSuper at 400 weight**

### Question Card

```tsx
// src/components/public/question-card.tsx
<h3 className="font-semibold text-base line-clamp-2 mb-1">
  {paperTitle}
</h3>
```

**Result:** This h3 will use **GTSuper at 400 weight**

### Institution Card

```tsx
// src/components/public/institution-card.tsx
<h3 className="font-semibold text-lg line-clamp-2">
  {institution.name}
</h3>
```

**Result:** This h3 will use **GTSuper at 400 weight**

## Font Weight Behavior

### Important Note about Font Weight

The CSS configuration sets all headings to `font-weight: 400`:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
}
```

This means:
- ✅ **Font family:** GTSuper (custom)
- ✅ **Font weight:** 400 (Regular) - as requested
- ⚠️ **Tailwind classes like `font-bold` will be overridden**

### If You Want Bold Headings

If you need some headings to be bold, you have two options:

#### Option 1: Add GTSuper Bold font file

```typescript
// src/app/layout.tsx
const gtSuper = localFont({
  src: [
    {
      path: "../../public/fonts/GTSuper-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTSuper-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gt-super",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
```

Then update CSS:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
  /* Remove fixed weight to allow Tailwind classes to work */
}
```

#### Option 2: Keep 400 weight only (Current Setup)

All headings will be GTSuper Regular (400), giving a clean, elegant look.

## Visual Hierarchy with 400 Weight

Even with a single weight, you can create hierarchy using:

### Size Variations
```tsx
<h1 className="text-6xl">Main Heading</h1>      {/* Largest */}
<h2 className="text-4xl">Section Heading</h2>   {/* Large */}
<h3 className="text-2xl">Subsection</h3>        {/* Medium */}
```

### Color Variations
```tsx
<h1 className="text-gray-900">Primary</h1>      {/* Darkest */}
<h2 className="text-gray-700">Secondary</h2>    {/* Medium */}
<h3 className="text-gray-600">Tertiary</h3>     {/* Lighter */}
```

### Letter Spacing
```tsx
<h1 className="tracking-tight">Tight</h1>       {/* Compact */}
<h2 className="tracking-normal">Normal</h2>     {/* Default */}
<h3 className="tracking-wide">Wide</h3>         {/* Spacious */}
```

## Testing the Font

### Visual Test Checklist

1. **Landing Page Hero**
   - [ ] Main headline uses GTSuper
   - [ ] Font looks elegant and readable
   - [ ] Weight is 400 (not bold)

2. **Section Headings**
   - [ ] All h2 elements use GTSuper
   - [ ] Consistent appearance across sections
   - [ ] Good contrast with body text (Inter)

3. **Card Titles**
   - [ ] Question card titles use GTSuper
   - [ ] Institution card titles use GTSuper
   - [ ] Readable at smaller sizes

4. **Responsive Behavior**
   - [ ] Font scales properly on mobile
   - [ ] No layout shifts when font loads
   - [ ] Fallback font looks acceptable

### Browser DevTools Check

```javascript
// Run in browser console
const h1 = document.querySelector('h1');
const styles = window.getComputedStyle(h1);
console.log('Font Family:', styles.fontFamily);
console.log('Font Weight:', styles.fontWeight);
// Should show: GTSuper, 400
```

## Fallback Behavior

If GTSuper font file is not found:

1. **Inter** will be used (already loaded from Google Fonts)
2. **system-ui** as next fallback
3. **sans-serif** as final fallback

The page will still look good with Inter as the fallback!

## Performance Impact

- **Font file size:** ~20-40KB (WOFF2 compressed)
- **Load time:** <100ms on good connection
- **Caching:** Loaded once, cached by browser
- **Display:** `swap` strategy prevents invisible text

## Next Steps

1. ✅ Configuration complete
2. ⏳ Add `GTSuper-Regular.woff2` to `public/fonts/`
3. ⏳ Test in browser
4. ⏳ Verify font loading in DevTools
5. ⏳ Check responsive behavior

---

**Current Status:** Ready for font file
**Font Weight:** 400 (Regular) as requested
**Applied To:** All h1-h6 elements automatically

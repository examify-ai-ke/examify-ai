# How to Add Your Hero Image

## Quick Guide

### Step 1: Add Your Image File

1. Place your hero image in the `public` folder:
   ```
   public/hero-image.jpg
   ```
   or
   ```
   public/hero-image.png
   ```

2. Recommended image specifications:
   - **Dimensions:** 600x500px or larger (maintains aspect ratio)
   - **Format:** JPG, PNG, or WebP
   - **File size:** Under 500KB (optimized for web)
   - **Subject:** Person holding books/materials (like the screenshot)

### Step 2: Update the Hero Component

Open `src/components/public/hero-section.tsx` and find this section (around line 95):

```tsx
{/* Right Column - Image */}
<div className="relative lg:block hidden">
  <div className="relative w-full h-[500px]">
    {/* Placeholder for hero image */}
    <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-teal-200 rounded-full flex items-center justify-center">
          <Users className="w-16 h-16 text-teal-600" />
        </div>
        <p className="text-gray-500 text-sm">
          Add your hero image here
          <br />
          <span className="text-xs">(Replace in hero-section.tsx)</span>
        </p>
      </div>
    </div>
```

**Replace with:**

```tsx
{/* Right Column - Image */}
<div className="relative lg:block hidden">
  <div className="relative w-full h-[500px]">
    {/* Hero Image */}
    <Image
      src="/hero-image.jpg"
      alt="Student with exam materials"
      fill
      className="object-contain"
      priority
    />
```

### Step 3: Keep the Decorative Elements

The decorative wave lines will remain. Your final code should look like:

```tsx
{/* Right Column - Image */}
<div className="relative lg:block hidden">
  <div className="relative w-full h-[500px]">
    {/* Hero Image */}
    <Image
      src="/hero-image.jpg"
      alt="Student with exam materials"
      fill
      className="object-contain"
      priority
    />
    
    {/* Decorative wave lines */}
    <div className="absolute top-10 right-0 w-24 h-16">
      <svg viewBox="0 0 100 50" className="text-teal-400 opacity-40">
        <path d="M0,25 Q25,10 50,25 T100,25" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M0,35 Q25,20 50,35 T100,35" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M0,45 Q25,30 50,45 T100,45" fill="none" stroke="currentColor" strokeWidth="3"/>
      </svg>
    </div>
  </div>
</div>
```

## Image Optimization Tips

### For Best Results:

1. **Remove background:** Use a transparent PNG or clean white background
2. **Crop properly:** Focus on the subject (person with materials)
3. **Optimize file size:** Use tools like:
   - [TinyPNG](https://tinypng.com/)
   - [Squoosh](https://squoosh.app/)
   - [ImageOptim](https://imageoptim.com/)

### Alternative: Use a Stock Photo

If you don't have a custom image, you can use stock photos from:
- [Unsplash](https://unsplash.com/s/photos/student-studying)
- [Pexels](https://www.pexels.com/search/student/)
- [Pixabay](https://pixabay.com/images/search/education/)

Search terms: "student studying", "education", "exam preparation"

## Advanced: Add the Instructor Badge Overlay

To match the screenshot exactly, you can add an instructor badge overlay:

```tsx
{/* Hero Image */}
<Image
  src="/hero-image.jpg"
  alt="Student with exam materials"
  fill
  className="object-contain"
  priority
/>

{/* Instructor Badge Overlay */}
<div className="absolute bottom-10 left-10 bg-white rounded-lg shadow-lg px-4 py-3 border border-gray-100">
  <div className="text-xs text-gray-600 mb-2">Instructor</div>
  <div className="flex -space-x-2 mb-2">
    <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-white" />
    <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white" />
    <div className="w-8 h-8 rounded-full bg-coral-500 border-2 border-white" />
    <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-white" />
  </div>
  <div className="text-sm font-semibold text-gray-900">200+</div>
  <div className="text-xs text-gray-600">Instructors</div>
</div>
```

## Testing

After adding your image:

1. Restart the dev server: `npm run dev`
2. Check the homepage
3. Verify the image loads correctly
4. Test on mobile (image is hidden on mobile by default)

## Troubleshooting

### Image not showing?
- Check the file path is correct
- Verify the file is in the `public` folder
- Check the file extension matches (jpg vs jpeg vs png)
- Clear browser cache (Ctrl+Shift+R)

### Image looks stretched?
- Change `object-contain` to `object-cover`
- Adjust the height: `h-[500px]` to `h-[600px]`

### Image too large?
- Optimize the file size
- Use WebP format for better compression
- Reduce dimensions to 1200x1000px max

---

**Current Status:** ✅ Hero section redesigned with placeholder
**Next Step:** Add your hero image to `public/hero-image.jpg`

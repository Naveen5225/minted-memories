# Logo Setup Instructions

## Adding the Logo

1. **Create the public folder** (if it doesn't exist):
   ```bash
   cd frontend
   mkdir -p public
   ```

2. **Add your logo image**:
   - Place your logo image in `frontend/public/` folder
   - Name it `logo.png` (or update the path in Navbar.jsx if using a different name)
   - Recommended size: 200-300px height, transparent background preferred

3. **Supported formats**:
   - PNG (recommended for transparency)
   - SVG (scalable, best quality)
   - JPG (if no transparency needed)

## Current Logo Path

The logo is configured to load from:
- Path: `/logo.png` (served from `frontend/public/logo.png`)
- Fallback: If logo not found, it will show "mintedmemories" text

## To Use a Different Logo Name

If your logo has a different name (e.g., `minted-memories-logo.svg`), update `Navbar.jsx`:

```jsx
<img 
  src="/minted-memories-logo.svg" 
  alt="Minted Memories" 
  className="h-12 w-auto object-contain"
  onError={() => setLogoError(true)}
/>
```

## Logo Styling

The logo is styled with:
- Height: `h-12` (48px) - adjust as needed
- Auto width to maintain aspect ratio
- Object-contain to preserve image proportions
- Hover effect for better UX

You can adjust the size by changing `h-12` to:
- `h-8` (32px) - smaller
- `h-10` (40px) - medium
- `h-14` (56px) - larger
- `h-16` (64px) - extra large

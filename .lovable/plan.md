

# Add Forge Logo to Welcome Page

Add the same Forge logo (with glow effect) from the Auth page to the top of the Welcome page.

## Change

**`src/pages/Welcome.tsx`**
- Import `forgeLogo` from `@/assets/forge-logo.png`
- Add the logo block (same as Auth page) above the "Welcome to Forge!" heading:
  - Container: `relative mx-auto w-20 h-20 sm:w-24 sm:h-24`
  - Glow: `absolute inset-0 bg-primary/30 rounded-2xl blur-xl`
  - Image: `relative w-full h-full object-contain drop-shadow-lg`

One file changed, purely visual addition.




# Remove Sign-Up Option from Auth Page

## Change
Remove the "New here? Apply for the Circle" toggle and all sign-up related UI/logic from `src/pages/Auth.tsx`. The page becomes login-only.

## What to remove
- The `isSignUp` state and all conditional branches for sign-up
- `fullName`, `confirmPassword`, `showConfirmPassword` states
- `signUpSchema` import/usage
- The sign-up form fields (Full Name, Confirm Password)
- The bottom "New here? Apply for the Circle" toggle button
- The `toggleMode` and `resetForm` functions
- The `signUp` import from `useAuth`

## File
`src/pages/Auth.tsx` — simplify to login-only form


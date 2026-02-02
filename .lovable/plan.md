
# Make Marker.io Widget Visible to All Users

## Summary
Update the `MarkerProvider` component to show the Marker.io feedback widget to **all authenticated users**, not just admins.

---

## Current Behavior
- Widget only shows for users with `admin` role
- Regular users see `window.Marker.hide()` called
- Reporter name is hardcoded as "Admin User"

## New Behavior
- Widget shows for **all authenticated users**
- Reporter name uses actual user's name from profile
- Custom data includes user role info for context

---

## Changes Required

### File: `src/components/feedback/MarkerProvider.tsx`

**1. Remove admin check logic** (lines 19, 30-33, 46-47)
- Remove `isAdmin` state
- Remove the `has_role` RPC call
- Simplify the auth check

**2. Update visibility logic** (lines 78-98)
- Show widget for **any authenticated user**
- Change condition from `if (isAdmin && user)` to `if (user)`

**3. Improve reporter information**
- Fetch user's profile name instead of hardcoding "Admin User"
- Include whether user is admin in custom data for context

---

## Updated Code

```tsx
export const MarkerProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [markerReady, setMarkerReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Fetch user's profile name for reporter info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          setProfileName(profile?.full_name || '');
        }
      } catch (error) {
        console.error('MarkerProvider auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfileName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ... marker ready polling stays the same ...

  // Show widget for all authenticated users
  useEffect(() => {
    if (loading || !markerReady || !window.Marker) return;

    if (user) {
      window.Marker.show();

      window.Marker.setReporter({
        email: user.email || '',
        fullName: profileName || user.email?.split('@')[0] || 'User',
      });

      window.Marker.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        userId: user.id,
      });
    } else {
      window.Marker.hide();
    }
  }, [loading, markerReady, user, profileName]);

  return null;
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/feedback/MarkerProvider.tsx` | Remove admin-only restriction, show for all authenticated users |

---

## Behavior Matrix

| User State | Widget Visible? | Reporter Name |
|------------|-----------------|---------------|
| Not logged in | No | N/A |
| Logged in (regular user) | **Yes** ✓ | User's profile name |
| Logged in (admin) | **Yes** ✓ | User's profile name |

---

## Technical Notes
- No database changes required
- Uses existing `profiles` table to get user's name
- Falls back to email username if no profile name set
- Widget hidden for unauthenticated visitors (public portfolio pages)

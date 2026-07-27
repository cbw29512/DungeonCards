# Character Vault accounts

Character Vault remains fully usable for browsing and printing without an account. Cloud saves activate only when the public Supabase browser configuration is present.

## Data schema

- `character_vault_profiles` stores owner display preferences.
- `saved_characters` stores mutable play state: HP, Temporary HP, Inspiration, Death Saves, class resources, spell slots, item charges, attuned items, notes, and archive state.
- Every saved row references one immutable `base_build_id` from the verified Vault catalog.

## Authorization model

- The browser uses only a Supabase publishable key or legacy anon key.
- Never expose a secret key or service-role key in a `VITE_` variable.
- Authenticated table grants permit Data API access.
- Row Level Security restricts every profile and saved character to `auth.uid()`.
- The repository also verifies that the requested owner matches the active session before sending a request.

## Supabase setup

1. Create or select the Supabase project.
2. Run migrations in `supabase/migrations` in filename order.
3. Enable email Magic Link authentication.
4. Optionally enable Google as an Auth provider.
5. Set the production Site URL and add local and production URLs to the redirect allow list.
6. Copy `.env.example` to `.env.local` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
7. Restart Vite after changing environment variables.

## Runtime flow

1. Magic Link or Google redirects back to the current Character Vault URL.
2. The client consumes the implicit-flow token fragment and immediately removes it from the visible URL.
3. The session is stored in local storage and refreshed shortly before access-token expiry.
4. Cross-tab storage events update the visible account state.
5. Save creates a complete state snapshot from the selected optimized profile.
6. Archive hides a character from the active list; Delete permanently removes it.

## Current boundary

This release saves, lists, archives, and deletes character copies. Editing live HP, slots, resources, charges, notes, and attunement from the saved-character view is the next stateful-sheet slice; the database fields and validation logic already exist.

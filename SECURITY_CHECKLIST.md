# Security Checklist - Diary Dump

## Implemented Security Measures

### 1. KEY MANAGEMENT
- [x] SERVICE_ROLE key ONLY in server-side code (`lib/supabase/admin.ts`)
- [x] ANON key only used for client-side reads
- [x] All writes go through API routes using service_role
- [x] .env.local in .gitignore
- [x] NO real API keys hardcoded in any file

### 2. ROW LEVEL SECURITY (RLS)
- [x] RLS enabled on ALL tables (users, spaces, notes, comments, reactions)
- [x] NO "USING (true)" on write operations
- [x] All write policies restrict to auth.uid() = owner_id
- [x] Read policies allow public data but protect private

### 3. API ROUTE SECURITY
- [x] ALL writes (INSERT/UPDATE/DELETE) go through server API routes
- [x] Frontend NEVER calls supabase.from() directly for writes
- [x] Input validation in EVERY API route
- [x] Generic error messages returned to client

### 4. AUTHENTICATION
- [x] Custom JWT with jose (secure, httpOnly cookies)
- [x] Password hashing with bcrypt (12 rounds)
- [x] Auth required for all write operations
- [x] Token verification on every protected route

### 5. INPUT VALIDATION
- [x] Email format validation
- [x] Password minimum length (6 chars)
- [x] Content length limits
- [x] File size limits (5MB for images)
- [x] File type restrictions (images only)

### 6. SECURITY HEADERS
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Content-Security-Policy configured

### 7. ERROR HANDLING
- [x] Generic error messages to client
- [x] Detailed errors logged server-side only
- [x] No database structure exposed

## Pre-Deployment Checks
- [ ] Regenerate Supabase keys if previously exposed
- [ ] Run SQL migration in Supabase dashboard
- [ ] Verify RLS is enabled on all tables in Supabase UI
- [ ] Set all environment variables in Vercel
- [ ] Test unauthenticated access is blocked
- [ ] Test rate limiting

## Post-Deployment
- [ ] Monitor Supabase logs for suspicious activity
- [ ] Enable automated backups in Supabase
- [ ] Review Vercel function logs regularly

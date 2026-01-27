# Setup Guide - Niğtaş Üretim Takip Sistemi

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

#### Option A: Use Existing Supabase Project
If you already have a Supabase project:

1. Copy `.env.example` to `.env` (already done)
2. Open `.env` and update the values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Option B: Create New Supabase Project

1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Fill in:
   - **Name:** nigtas-production
   - **Database Password:** (choose a strong password)
   - **Region:** Choose closest to Turkey
4. Wait 2-3 minutes for project creation

5. **Get Your Credentials:**
   - Click "Settings" (gear icon in sidebar)
   - Click "API" section
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public** key → `VITE_SUPABASE_ANON_KEY`

6. **Create Database Schema:**
   - Click "SQL Editor" in sidebar
   - Click "New Query"
   - Copy contents of `database/schema.sql`
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success" message

7. **Add Seed Data (Optional):**
   - Create another new query
   - Copy contents of `database/seed.sql`
   - Run the query

8. **Create First User:**
   - Go to "Authentication" → "Users" in Supabase dashboard
   - Click "Add user" → "Create new user"
   - Enter email: `admin@nigtas.com` and password
   - Copy the user UUID (something like `a1b2c3d4-...`)
   - Go back to SQL Editor and run:
   ```sql
   INSERT INTO users (id, email, full_name, role, is_active)
   VALUES ('paste-user-uuid-here', 'admin@nigtas.com', 'Admin User', 'admin', true);
   ```

9. **Update `.env` file:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Login
- Email: `admin@nigtas.com`
- Password: (whatever you set in Supabase)

---

## Current Status

### ✅ Working
- All TypeScript compilation
- All 6 modules implemented (Dashboard, Mills, Silos, Production, Packaging, Reports, Admin)
- PWA features (offline indicator, install prompt)
- Service Worker with caching
- Responsive design

### ⚠️ Needs Configuration
- **Supabase credentials** - Currently using placeholder values in `.env`
- **PWA icons** - Using placeholder SVG icon (replace with branded icons)

### 📋 Temporary/Placeholder Items
1. **Icon:** `public/icon-placeholder.svg`
   - Simple blue square with "N" letter
   - Replace with real company logo for production
   - See `public/ICONS_NEEDED.txt` for requirements

2. **Environment Variables:** `.env`
   - Currently has placeholder values
   - Must update with real Supabase credentials

---

## Testing Checklist

Before deploying to production, test:

- [ ] Login with real credentials works
- [ ] All navigation links work
- [ ] Create/Edit/Delete for each module:
  - [ ] Mills
  - [ ] Silos
  - [ ] Products
  - [ ] Production Sessions
  - [ ] Packaging Entries
  - [ ] Users (admin only)
- [ ] Reports generate correctly
- [ ] CSV export works
- [ ] PWA install prompt appears
- [ ] Offline mode shows indicator
- [ ] Mobile responsive design
- [ ] Browser back/forward buttons work

---

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Go to https://vercel.com
3. Import GitHub repository
4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Netlify
1. Push code to GitHub
2. Go to https://netlify.com
3. Import GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Netlify dashboard
6. Deploy

### Manual (Any Static Host)
1. Update `.env` with production credentials
2. Run: `npm run build`
3. Upload `dist/` folder to your web server
4. Configure server to serve `index.html` for all routes (SPA)

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check `.env` file exists in project root
- Make sure values don't have quotes around them
- Restart dev server after changing `.env`

### Error: "Failed to fetch from Supabase"
- Check Supabase project is active (not paused)
- Verify credentials are correct
- Check database schema is created
- Ensure Row Level Security (RLS) policies are set up

### PWA not installing on mobile
- Must use HTTPS (http://localhost works for testing)
- Check manifest is valid
- Try different browser (Chrome/Edge work best)
- Clear browser cache and try again

### Database queries failing
- Check user has been created in both Auth AND users table
- Verify RLS policies allow the operation
- Check foreign key constraints are satisfied

---

## Important Files

```
.env                     - Environment variables (SECRET - don't commit)
.env.example             - Template for environment variables
src/lib/supabase.ts      - Supabase client configuration
database/schema.sql      - Full database schema
database/seed.sql        - Sample data for testing
vite.config.ts           - PWA and build configuration
BUILD_SUMMARY.md         - Detailed build information
```

---

## Security Notes

- ⚠️ Never commit `.env` file to Git (it's in .gitignore)
- ⚠️ Never share your Supabase anon key publicly (though it's "public", it still needs RLS)
- ⚠️ Always use Row Level Security (RLS) policies in Supabase
- ⚠️ Use strong passwords for admin accounts
- ✅ The app uses JWT tokens for authentication
- ✅ All database operations go through Supabase RLS

---

## Next Steps

1. ✅ **Completed:** Build and fix all TypeScript errors
2. ⏳ **Next:** Set up Supabase and configure `.env`
3. ⏳ **Then:** Test all features with real data
4. ⏳ **Finally:** Deploy to production (Vercel/Netlify)

---

## Support

For issues or questions:
- Check `BUILD_SUMMARY.md` for detailed build information
- Check `README.md` for project overview
- Check Supabase documentation: https://supabase.com/docs

# LifeLink Development Setup Guide

This guide explains how to set up the LifeLink project for development, including both the hospital web portal and donor mobile application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Setup](#supabase-setup)
4. [Running the Applications](#running-the-applications)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js** (v20.x recommended)
- **npm** (comes with Node.js)
- **Expo CLI** (for mobile development)
- **Supabase CLI** (for local database)
- **Git**
- **Optional**: Docker (for Supabase local setup)

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd LifeLink
```

### 2. Install Dependencies

#### Hospital Web Portal
```bash
cd hospital_web
npm install
```

#### Donor Mobile Application
```bash
cd donor_app
npm install
```

### 3. Environment Variables

Create `.env` files based on the provided examples:

#### Hospital Web (`hospital_web/.env`)
```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key_here
REACT_APP_PUBLIC_URL=http://localhost:3001
REACT_APP_EXPO_URL=exp://localhost:8081
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_NUMBER=your_twilio_from_number_here
```

#### Donor App (`donor_app/.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
EXPO_PUBLIC_APP_URL=http://localhost:3001
```

> **Note**: Get your Supabase URL and keys from your Supabase project settings. Generate VAPID keys using `npx web-push generate-vapid-keys`.

## Supabase Setup

### Option A: Local Development (Recommended for development)
1. Install Supabase CLI: `npm install -g supabase`
2. Initialize Supabase: `supabase init` (run in project root)
3. Start Supabase: `supabase start`
4. Apply migrations:
   - Copy the SQL files from the root directory (`migrations/fix_is_verified_column.sql`, `migrations/fix_push_subscriptions_table.sql`, `migrations/migration_v2.1_run_now.sql`) to the Supabase SQL editor or run via CLI:
   ```bash
   supabase db push --db-url postgresql://postgres:postgres@localhost:54322/postgres
   ```
5. Enable Realtime for tables: In Supabase Dashboard (http://localhost:54323), go to Database > Replication and enable for `donors`, `hospitals`, `blood_requests`, `donor_responses`, `push_subscriptions`.

### Option B: Hosted Supabase
1. Create a project at https://supabase.com
2. Get your URL and anon key from Settings > API
3. Apply the SQL migrations via the Supabase Dashboard SQL Editor
4. Enable Realtime for the necessary tables
5. Enable Anonymous Sign-In in Authentication > Settings

## Running the Applications

### Hospital Web Portal
```bash
# From hospital_web directory
npm start
```
The web portal will be available at http://localhost:3001

### Donor Mobile Application
```bash
# From donor_app directory
npm start
```
Then choose:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web version (http://localhost:19006)
- Scan QR code with Expo Go app on physical device

## Testing

### Linting
```bash
# Hospital web
npm run lint
npm run lint:fix

# Donor app
npm run lint
```

### Formatting
```bash
# Hospital web
npm run format

# Donor app (uses Prettier config from hospital_web, adjust as needed)
npx prettier --write "src/**/*.{js,jsx,ts,tsx}"
```

### Unit Tests (Example)
```bash
# Hospital web (Jest)
npm test
```

## Project Structure

### Hospital Web
```
hospital_web/
├── public/               # Static assets (logo, sitemap, legal pages)
├── src/
│   ├── components/       # UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (Supabase client, logger, etc.)
│   └── context/          # React contexts (Theme)
├── .env                  # Environment variables
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
└── package.json
```

### Donor App
```
donor_app/
├── app/                  # Expo Router screens
├── assets/               # Images, fonts
├── components/           # Reusable components
├── hooks/                # Custom React Native hooks
├── lib/                  # Utilities (Supabase client)
├── screens/              # Standalone screens (Privacy, Terms, etc.)
├── theme/                # Design tokens
├── .env                  # Environment variables
├── .eslintrc.js          # ESLint configuration
└── package.json
```

## Legal Pages

Both applications include the following legal pages:
- Privacy Policy (`/privacy.html` web, `/privacy` mobile)
- Terms of Service (`/terms.html` web, `/terms` mobile)
- Affiliations & Partners (`/affiliations.html` web, `/affiliations` mobile)
- Error 404 page (`/404.html` web only)
- Sitemap (`/sitemap.xml` web only)

These are accessible via the footer in the web portal and Settings screen in the mobile app.

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify environment variables are correct
   - Ensure Anonymous Sign-In is enabled in Supabase Auth settings
   - Check that the database is running (for local setup)

2. **Mobile App Not Running**
   - Ensure Expo CLI is installed: `npm install -g expo-cli`
   - Try clearing Expo cache: `expo start -c`
   - For Android: Ensure Android Studio emulator is running or device connected via USB

3. **Web Portal Not Loading**
   - Check browser console for errors
   - Ensure port 3001 is available (change PORT in package.json if needed)
   - Clear browser cache or try incognito mode

4. **Map Not Showing**
   - For web: Ensure MapLibre GL CSS is imported
   - For mobile: Verify device has internet connection and location permissions granted

### Getting Help

- Check the console/logs for error messages
- Refer to the Supabase documentation: https://supabase.com/docs
- Refer to Expo documentation: https://docs.expo.dev
- For React-specific issues: https://react.dev

## Contributing

Please read [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.

## Acknowledgments

- Canara Engineering College for providing the initial concept and medical guidance
- Indian Red Cross Society for partnership in blood donation awareness
- The open-source community for tools like React, Expo, Supabase, and MapLibre
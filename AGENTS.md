# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

## Testing

The project has comprehensive testing infrastructure:

- **Unit Tests**: Vitest with React Testing Library (`pnpm test`)
- **E2E Tests**: Playwright for cross-browser testing (`pnpm test:e2e`)
- **Performance Tests**: Lighthouse integration (`pnpm test:performance`)
- **Security Tests**: npm audit and Snyk (`pnpm test:security`)
- **Device Testing**: Capacitor Android/iOS testing (`pnpm cap:test:android`, `pnpm cap:test:ios`)

Test files are located in:
- `src/test/` - Unit tests for components and functionality
- `e2e/` - End-to-end browser tests
- `scripts/performance-test.js` - Lighthouse performance automation

See `TESTING_GUIDE.md` for detailed testing procedures and guidelines.

## Launch and Deployment

The project is configured for Google Play Store deployment:

- **Analytics**: Custom analytics service in `src/lib/analytics.ts` for event tracking and error logging
- **Android Build**: Capacitor-based Android app with signing configuration
- **Release Scripts**: Automated build scripts for APK/AAB generation
- **Store Submission**: Complete Google Play Store submission process

Build commands:
- `npm run android:build:debug` - Build debug APK
- `npm run android:build:release` - Build release APK
- `npm run android:build:bundle` - Build release AAB for Play Store
- `npm run android:install:debug` - Install debug APK to connected device

Launch documentation:
- `LAUNCH_GUIDE.md` - Complete launch procedures and checklist
- `GOOGLE_PLAY_SUBMISSION.md` - Detailed Play Store submission guide
- `scripts/prepare-play-store.sh` - Automated preparation script

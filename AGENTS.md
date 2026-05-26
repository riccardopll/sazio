# Sazio

Nutrition/macro tracking app. pnpm monorepo: Expo mobile app, Hono/Cloudflare Workers server, shared tRPC API.

## Workflow

- After modifying any TypeScript file, run `pnpm check`.
- The mobile app's primary target is iOS. Keep iOS-first UI code simple; do not add platform availability checks, alternate platform branches, or fallback UI paths unless explicitly requested.
- `mobile/lib/theme.ts` exposes the app's color theme from `mobile/theme.json` and the React Navigation theme. Use it when code needs concrete color values, such as icon colors, chart/ring colors, or navigation configuration.
- `mobile/lib/styles.ts` defines shared NativeWind class tokens for repeated layout, typography, and surface styles. Use it to keep screen gutters, headers, text hierarchy, card chrome, and row spacing consistent across screens.
- Use `cn` from `mobile/lib/styles.ts` as the standard path for composed or conditional classes.
- Mobile UI styling is handled through NativeWind class names. Inline `style` props are only allowed for runtime-calculated dimensions/insets or style-only third-party APIs that NativeWind cannot express.
- Repeated mobile style tokens belong in `mobile/lib/styles.ts`; reusable mobile color/theme values belong in `mobile/lib/theme.ts`.

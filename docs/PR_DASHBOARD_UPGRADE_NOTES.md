# Dashboard Upgrade PR Notes

Branch: `feat/dashboard-upgrade`

## Summary
Modernized the mobile-first dashboard using shadcn/ui + Tailwind, preserved business logic and Supabase API flows. Added animated header, notifications sheet, clickable cards, settings dialog, and inbox placeholder.

## Key Changes
- `src/components/Header.tsx`: Personalized greeting, avatar dropdown (Profile/Settings/Logout), notifications bell with pulse, refresh button.
- `src/components/notifications/NotificationSheet.tsx`: Sheet-based notifications with clear all, mark read, delete, scrollable list.
- `src/components/DashboardCard.tsx`: Clickable Card wrapper for accessible, fully-clickable cards.
- `src/app/inbox/page.tsx`: Placeholder inbox route.
- `src/components/SettingsDialog.tsx`: Placeholder settings dialog with toggles and save toast.
- Integrated Framer Motion for subtle entrance animations.

## Tests (suggested small tests)
- Notification sheet open/close: simulate click on trigger and expect sheet in document.
- Card click navigation: render DashboardCard with href and expect next/link to be called.
- Logout action: render Header and simulate click on Logout; expect provided onLogout handler to run.

## Manual QA Checklist
- [ ] Mobile vs desktop layouts: header spacing, buttons wrap correctly, cards stack on mobile, grid on desktop.
- [ ] Notifications: open sheet, mark one read, delete one, clear all. Toasts appear.
- [ ] Accessibility: tab through header controls; sheet traps focus; ESC closes; click outside closes.
- [ ] Avatar menu: profile/settings links present; logout fires and redirects.
- [ ] Cards: hover/press animation; entire card clickable; keyboard Enter/Space activates.
- [ ] Real-time: create a notification in DB; toast shows; bell pulses; badge increments.
- [ ] Refresh: header refresh triggers refetch (if wired in parent).

## Notes
- All existing data fetching and Supabase subscriptions remain intact.
- Styling uses only Tailwind utilities and shadcn/ui components.
- Minimal custom CSS; animations via Framer Motion where applicable. 
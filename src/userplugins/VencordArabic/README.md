# VencordArabic

Built-in Arabic localization layer maintained by the Vencord Arabic fork.

## Design goals

- Translate Vencord-owned settings and UI without translating Discord globally
- Keep canonical plugin names in English where they are displayed as plugin names
- Apply RTL presentation only to translated Arabic text
- Work locally with no translation API, telemetry, native code or data collection
- Stay reviewable when upstream Vencord changes its settings UI

## Translation dictionaries

The dictionaries are intentionally split by responsibility:

- `translations/ar.json` — general/common translations
- `translations/ar-overrides.json` — wording overrides and selected plugin-description improvements
- `translations/ar-core.json` — reviewed core Vencord settings UI
- `translations/ar-themes.json` — theme and QuickCSS related UI
- `translations/ar-patch-helper.json` — Patch Helper UI

`index.ts` merges these dictionaries into one runtime map and also handles dynamic strings such as counts, update messages and selected errors.

## Maintenance guard

The project-level command below validates the Arabic dictionaries and the reviewed upstream source baseline:

```sh
pnpm checkArabicTranslations
```

The strict guard is used by the Arabic DevBuild and upstream-sync workflows. If a tracked Vencord settings source file changes upstream, the sync should stop until the affected UI is reviewed and the baseline in `translation-sources.json` is intentionally refreshed.

## Scope

This plugin is fork-specific infrastructure. It is not intended to be submitted to upstream Vencord by project automation. Upstream synchronization is one-way into this fork.

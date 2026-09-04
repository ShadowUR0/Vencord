# Vencord Arabic fork modifications

This repository is an unofficial fork of [Vendicated/Vencord](https://github.com/Vendicated/Vencord).

The goal is to remain close to upstream Vencord while carrying a small, clearly identifiable Arabic-localization layer and the infrastructure required to build and distribute that fork independently.

## Fork-specific functionality

### `src/userplugins/VencordArabic/`

Built-in Arabic localization plugin maintained by this fork.

It currently provides:

- Local translation of Vencord settings and related Vencord UI text
- RTL presentation for translated Arabic text
- Translation of selected placeholders, titles and accessibility labels
- Dynamic handling for several count/status/error strings
- Preservation of canonical Vencord plugin names in English for documentation and search compatibility
- No translation API, telemetry or external network request from the localization plugin

The translation dictionaries and styling used by the plugin live in the same directory.

## Project identity

The fork has its own project identity and documentation:

- `README.md` describes Vencord Arabic rather than the upstream project
- `assets/vencord-arabic-logo.png` is the Arabic project mark
- Distribution points to `ShadowUR0/Vencord` and `ShadowUR0/Installer`

## Releases

`.github/workflows/arabic-release.yml` builds and publishes the Vencord Arabic development build used by the installer.

The release is intended to follow the same rolling DevBuild concept used by upstream Vencord: the release assets are replaced as `main` changes rather than creating a permanent release for every commit.

`ShadowUR0/Installer` consumes this fork's build assets instead of the official Vencord build.

## Upstream synchronization

`.github/workflows/upstream-sync.yml` periodically fetches `Vendicated/Vencord` and merges upstream `main` into this fork when necessary.

Before an upstream update is pushed to this repository, the temporary merged tree is validated with the project's build/test tooling. If validation fails, the workflow must fail without updating `main`.

Synchronization is one-way into this fork. The workflow does not create a pull request, issue or plugin submission in the upstream Vencord repository.

## Installer

The companion installer is maintained separately at:

`https://github.com/ShadowUR0/Installer`

It is based on the official Vencord Installer but uses this repository's releases and carries the Vencord Arabic branding and UI adjustments.

## Keeping this file useful

When adding fork-only code, prefer keeping it isolated in clearly named files/directories where practical. If a future upstream merge requires modifying shared Vencord code for Arabic-specific functionality, document the affected paths here so future upstream syncs are easier to review.

## License

Vencord Arabic remains licensed under GPL-3.0-or-later in accordance with the upstream project. Original Vencord copyright and attribution notices should be preserved.

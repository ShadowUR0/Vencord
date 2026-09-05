# Vencord Arabic website

The deployed website uses the real open-source Vencord website as its base instead of a hand-recreated design.

Upstream source: `Vencord/vencord.dev`

Pinned upstream revision used by the deployment workflow:

`723bda03da6826518272b11f02df1791005c8f97`

The upstream website is licensed under GNU AGPL-3.0. The deployment clones that exact revision, applies the small Vencord Arabic branding/download-link changes in `apply-overrides.mjs`, then builds it for GitHub Pages.

This keeps Vencord's real Astro/Svelte components, CSS, cards, download tabs, responsive behavior and theme system rather than imitating them manually.

The modified website source is reproducible from the upstream revision plus the override script in this directory.

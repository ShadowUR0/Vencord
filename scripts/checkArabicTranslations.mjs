/*
 * Vencord Arabic translation maintenance guard
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const strict = process.argv.includes("--strict");

const translationFiles = [
    "src/userplugins/VencordArabic/translations/ar.json",
    "src/userplugins/VencordArabic/translations/ar-overrides.json",
    "src/userplugins/VencordArabic/translations/ar-core.json",
    "src/userplugins/VencordArabic/translations/ar-themes.json",
    "src/userplugins/VencordArabic/translations/ar-patch-helper.json"
];

const requiredKeys = [
    "Vencord Settings",
    "Plugins",
    "Themes",
    "Updater",
    "Cloud",
    "Backup & Restore",
    "Patch Helper",
    "Search for a plugin...",
    "Show Favorites",
    "Restart Required",
    "Restart now",
    "Quick Actions",
    "Notification Log",
    "Notification Settings",
    "Edit QuickCSS",
    "Relaunch Discord",
    "Open Settings Folder",
    "View Source Code",
    "Enable Custom CSS",
    "Automatically update",
    "Check for Updates",
    "Update Now",
    "Local Themes",
    "Online Themes",
    "Open Themes Folder",
    "Blocked Resources",
    "Import Settings",
    "Export Settings",
    "Cloud Integrations",
    "Enable Settings Sync",
    "Upload Settings",
    "Download Settings",
    "Reset Cloud Data",
    "Full patch",
    "Copy to Clipboard"
];

const arabicPattern = /[\u0600-\u06ff]/;
const mergedTranslations = {};
const errors = [];
const warnings = [];

for (const relativePath of translationFiles) {
    const absolutePath = resolve(root, relativePath);
    let parsed;

    try {
        parsed = JSON.parse(readFileSync(absolutePath, "utf8"));
    } catch (error) {
        errors.push(`${relativePath}: invalid or unreadable JSON (${error.message})`);
        continue;
    }

    for (const [source, translated] of Object.entries(parsed)) {
        if (typeof translated !== "string" || !translated.trim()) {
            errors.push(`${relativePath}: empty translation for ${JSON.stringify(source)}`);
            continue;
        }
        mergedTranslations[source] = translated;
    }
}

for (const key of requiredKeys) {
    const translated = mergedTranslations[key];
    if (!translated) {
        errors.push(`Missing required Arabic translation: ${JSON.stringify(key)}`);
        continue;
    }

    // Product names and technical tokens may remain Latin, but every required
    // user-facing phrase should contain Arabic after localization.
    if (!arabicPattern.test(translated)) {
        errors.push(`Required translation does not contain Arabic: ${JSON.stringify(key)} -> ${JSON.stringify(translated)}`);
    }
}

const pluginEntry = readFileSync(resolve(root, "src/userplugins/VencordArabic/index.ts"), "utf8");
for (const relativePath of translationFiles) {
    const fileName = relativePath.split("/").at(-1);
    if (!pluginEntry.includes(`./translations/${fileName}`)) {
        errors.push(`VencordArabic/index.ts does not load ${fileName}`);
    }
}

const reviewedSourcesPath = "src/userplugins/VencordArabic/translation-sources.json";
let reviewedSources = {};
try {
    reviewedSources = JSON.parse(readFileSync(resolve(root, reviewedSourcesPath), "utf8"));
} catch (error) {
    errors.push(`${reviewedSourcesPath}: invalid or unreadable JSON (${error.message})`);
}

for (const [relativePath, reviewedBlob] of Object.entries(reviewedSources)) {
    let currentBlob;
    try {
        currentBlob = execFileSync("git", ["hash-object", relativePath], {
            cwd: root,
            encoding: "utf8"
        }).trim();
    } catch {
        errors.push(`Reviewed translation source is missing: ${relativePath}`);
        continue;
    }

    if (currentBlob !== reviewedBlob) {
        const message = [
            `Vencord settings source changed: ${relativePath}`,
            `reviewed ${reviewedBlob}`,
            `current  ${currentBlob}`,
            "Review any new/changed user-facing strings, update Arabic translations, then refresh translation-sources.json."
        ].join(" | ");

        if (strict) errors.push(message);
        else warnings.push(message);
    }
}

if (warnings.length) {
    console.warn("\nArabic translation review warnings:");
    for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
    console.error("\nArabic translation guard failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log(`Arabic translation guard passed (${Object.keys(mergedTranslations).length} translation keys, ${Object.keys(reviewedSources).length} reviewed core source files).`);
}

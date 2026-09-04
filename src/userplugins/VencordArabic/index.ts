/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Shadow and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType, StartAt } from "@utils/types";

import { canonicalPluginNames } from "./pluginNames";
import style from "./styles.css?managed";
import coreTranslations from "./translations/ar-core.json";
import overrides from "./translations/ar-overrides.json";
import patchHelperTranslations from "./translations/ar-patch-helper.json";
import themeTranslations from "./translations/ar-themes.json";
import translations from "./translations/ar.json";

type TranslationMap = Record<string, string>;
type TextState = { original: string; translated: string; };
type AttributeState = { original: string; translated: string; };

const AUTHOR = {
    name: "Shadow",
    id: 843784503167680512n
};
const ATTRIBUTE_NAMES = ["aria-label", "placeholder", "title"] as const;
const VENCORD_ID_PATTERN = /vencord(?:_|-|\b)/i;
const TRANSLATION_MAP: TranslationMap = {
    ...(translations as TranslationMap),
    ...(overrides as TranslationMap),
    ...(coreTranslations as TranslationMap),
    ...(themeTranslations as TranslationMap),
    ...(patchHelperTranslations as TranslationMap)
};
const CANONICAL_PLUGIN_NAMES = new Set<string>(canonicalPluginNames);
const textStates = new Map<Text, TextState>();
const attributeStates = new Map<Element, Map<string, AttributeState>>();
const markedElements = new Set<HTMLElement>();
let observer: MutationObserver | undefined;
let scanScheduled = false;
let vencordSettingsActive = false;

const settings = definePluginSettings({
    rightToLeftText: {
        type: OptionType.BOOLEAN,
        description: "Use right-to-left direction for translated Arabic text",
        default: true,
        onChange: scheduleFullScan
    },
    translateTooltips: {
        type: OptionType.BOOLEAN,
        description: "Translate placeholders, tooltips and accessibility labels",
        default: true,
        onChange: scheduleFullScan
    }
});

function normalizeText(value: string) {
    return value.replace(/\s+/g, " ").trim();
}

type ArabicCountForms = {
    zero: string;
    one: string;
    two: string;
    few: string;
    many: string;
    other: string;
};

const arabicPluralRules = new Intl.PluralRules("ar");

function formatArabicCount(rawCount: string, forms: ArabicCountForms) {
    const count = Number(rawCount);
    if (!Number.isFinite(count)) return `${rawCount} ${forms.other}`;

    switch (arabicPluralRules.select(count)) {
        case "zero": return `${rawCount} ${forms.zero}`;
        case "one": return forms.one;
        case "two": return forms.two;
        case "few": return `${rawCount} ${forms.few}`;
        case "many": return `${rawCount} ${forms.many}`;
        default: return `${rawCount} ${forms.other}`;
    }
}

function localizePlatform(platform: string) {
    const knownPlatforms: Record<string, string> = {
        desktop: "سطح المكتب",
        web: "الويب",
        vesktop: "Vesktop",
        discorddesktop: "تطبيق Discord لسطح المكتب"
    };

    return knownPlatforms[platform.trim().toLowerCase()] ?? platform;
}

function localizeKnownLabel(label: string) {
    return TRANSLATION_MAP[normalizeText(label)] ?? label;
}

function translateDynamicText(value: string) {
    const dynamicRules: Array<[RegExp, (...matches: string[]) => string]> = [
        [/^(\d+) plugins?$/i, count => formatArabicCount(count, { zero: "إضافات", one: "إضافة واحدة", two: "إضافتان", few: "إضافات", many: "إضافة", other: "إضافة" })],
        [/^(\d+) themes?$/i, count => formatArabicCount(count, { zero: "ثيمات", one: "ثيم واحد", two: "ثيمان", few: "ثيمات", many: "ثيم", other: "ثيم" })],
        [/^(\d+) results?$/i, count => formatArabicCount(count, { zero: "نتائج", one: "نتيجة واحدة", two: "نتيجتان", few: "نتائج", many: "نتيجة", other: "نتيجة" })],
        [/^There is 1 Update$/i, () => "يوجد تحديث واحد"],
        [/^There are (\d+) Updates$/i, count => formatArabicCount(count, { zero: "تحديثات", one: "تحديث واحد", two: "تحديثان", few: "تحديثات", many: "تحديثا", other: "تحديث" })],
        [/^Only available on the (.+)$/i, platform => `متاح فقط على ${localizePlatform(platform)}`],
        [/^Failed to start dependencies: (.+)$/i, dependencies => `تعذر تشغيل الإضافات المطلوبة: ${dependencies}`],
        [/^Error while (starting|stopping) plugin (.+)$/i, (action, plugin) => `حدث خطأ أثناء ${action === "starting" ? "تشغيل" : "إيقاف"} الإضافة ${plugin}`],
        [/^Failed to render the (.+) tab\. If this issue persists, try using the installer to reinstall!$/i, tab => `تعذر عرض تبويب ${localizeKnownLabel(tab)}. إذا استمرت المشكلة فجرب إعادة التثبيت باستخدام الانستولر!`],
        [/^Module (\d+)$/i, id => `الوحدة ${id}`],
        [/^Group (\d+): (.+)$/i, (group, content) => `المجموعة ${group}: ${content}`]
    ];

    for (const [pattern, replacement] of dynamicRules) {
        const match = value.match(pattern);
        if (match) return replacement(...match.slice(1));
    }

    return null;
}

function isCanonicalPluginNameElement(element: Element | null, normalized: string) {
    if (!CANONICAL_PLUGIN_NAMES.has(normalized)) return false;

    // Keep canonical plugin names in English only where they are actually
    // rendered as plugin names. This avoids accidentally leaving ordinary UI
    // labels such as "Settings" untranslated just because a plugin shares the
    // same name.
    return Boolean(element?.closest(".vc-addon-title, .vc-plugin-modal-header"));
}

function translateValue(value: string, element: Element | null = null) {
    const normalized = normalizeText(value);
    if (!normalized) return null;

    if (isCanonicalPluginNameElement(element, normalized)) return null;

    const direct = TRANSLATION_MAP[normalized];
    if (direct) return preserveOuterWhitespace(value, direct);

    const dynamic = translateDynamicText(normalized);
    if (dynamic) return preserveOuterWhitespace(value, dynamic);

    return null;
}

function preserveOuterWhitespace(source: string, translated: string) {
    const leading = source.match(/^\s*/)?.[0] ?? "";
    const trailing = source.match(/\s*$/)?.[0] ?? "";
    return `${leading}${translated}${trailing}`;
}

function hasVencordIdentifier(element: Element | null) {
    if (!element) return false;

    for (const attribute of ["id", "data-list-item-id", "data-item-id", "data-section", "aria-controls"]) {
        const value = element.getAttribute(attribute);
        if (value && VENCORD_ID_PATTERN.test(value)) return true;
    }

    return false;
}

function findVencordIdentifierAncestor(element: Element | null) {
    for (let current = element; current; current = current.parentElement) {
        if (hasVencordIdentifier(current)) return current;
    }

    return null;
}

function detectVencordSettingsActive() {
    const candidates = document.querySelectorAll<HTMLElement>(
        '[data-list-item-id*="vencord" i], [data-item-id*="vencord" i], [id*="vencord" i]'
    );

    return Array.from(candidates).some(element => {
        if (element.getAttribute("aria-selected") === "true") return true;
        if (element.getAttribute("aria-current") === "page") return true;
        return Array.from(element.classList).some(className => /selected|active/i.test(className));
    });
}

function isWithinActiveVencordContent(element: Element | null) {
    if (!element || !vencordSettingsActive) return false;

    return Boolean(element.closest(
        '[class*="contentRegion"], [class*="contentColumn"], [role="main"], [role="dialog"]'
    ));
}

function shouldTranslate(element: Element | null, rawText?: string) {
    if (!element) return false;
    if (findVencordIdentifierAncestor(element)) return true;
    if (isWithinActiveVencordContent(element)) return true;

    const normalized = rawText ? normalizeText(rawText) : "";
    return normalized === "Vencord Settings" || normalized === "Vencord";
}

function syncDirection(element: HTMLElement, translated: boolean) {
    if (translated && settings.store.rightToLeftText) {
        element.classList.add("vc-vencord-arabic-text");
        markedElements.add(element);
        return;
    }

    element.classList.remove("vc-vencord-arabic-text");
    markedElements.delete(element);
}

function processTextNode(node: Text) {
    const parent = node.parentElement;
    if (!parent || !shouldTranslate(parent, node.data)) return;

    const current = node.data;
    const previous = textStates.get(node);

    if (previous?.translated === current) {
        syncDirection(parent, true);
        return;
    }

    const translated = translateValue(current, parent);
    if (!translated || translated === current) {
        if (previous && current !== previous.original) textStates.delete(node);
        syncDirection(parent, false);
        return;
    }

    textStates.set(node, { original: current, translated });
    node.data = translated;
    syncDirection(parent, true);
}

function processAttributes(element: Element) {
    if (!settings.store.translateTooltips || !shouldTranslate(element)) return;

    let states = attributeStates.get(element);

    for (const attribute of ATTRIBUTE_NAMES) {
        const current = element.getAttribute(attribute);
        if (!current) continue;

        const previous = states?.get(attribute);
        if (previous?.translated === current) continue;

        const translated = translateValue(current, element);
        if (!translated || translated === current) {
            if (previous && current !== previous.original) states?.delete(attribute);
            continue;
        }

        states ??= new Map();
        states.set(attribute, { original: current, translated });
        element.setAttribute(attribute, translated);
    }

    if (states?.size) attributeStates.set(element, states);
}

function processElement(element: Element) {
    processAttributes(element);

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        processTextNode(node as Text);
    }

    for (const descendant of element.querySelectorAll("*")) {
        processAttributes(descendant);
    }
}

function processNode(node: Node) {
    if (node instanceof Text) {
        processTextNode(node);
        return;
    }

    if (node instanceof Element) processElement(node);
}

function scanDocument() {
    if (!document.body) return;

    vencordSettingsActive = detectVencordSettingsActive();
    const roots = new Set<Element>();

    for (const element of document.querySelectorAll(
        '[data-list-item-id*="vencord" i], [data-item-id*="vencord" i], [id*="vencord" i]'
    )) {
        roots.add(element);
    }

    if (vencordSettingsActive) {
        for (const element of document.querySelectorAll(
            '[class*="contentRegion"], [class*="contentColumn"], [role="main"], [role="dialog"]'
        )) {
            roots.add(element);
        }
    }

    for (const element of document.querySelectorAll("*")) {
        if (element.childNodes.length !== 1 || !(element.firstChild instanceof Text)) continue;
        const value = normalizeText(element.firstChild.data);
        if (value === "Vencord Settings" || value === "Vencord") roots.add(element);
    }

    for (const root of roots) processElement(root);
}

function scheduleFullScan() {
    if (scanScheduled) return;
    scanScheduled = true;

    requestAnimationFrame(() => {
        scanScheduled = false;
        scanDocument();
    });
}

function startTranslator() {
    if (!document.body || observer) return;

    scanDocument();

    observer = new MutationObserver(mutations => {
        const wasActive = vencordSettingsActive;
        vencordSettingsActive = detectVencordSettingsActive();
        let needsFullScan = wasActive !== vencordSettingsActive;

        for (const mutation of mutations) {
            if (mutation.type === "characterData") {
                processNode(mutation.target);
                continue;
            }

            if (mutation.type === "attributes") {
                processNode(mutation.target);
                if (mutation.attributeName === "aria-selected" || mutation.attributeName === "aria-current") {
                    needsFullScan = true;
                }
                continue;
            }

            for (const node of mutation.addedNodes) processNode(node);
        }

        if (needsFullScan) scheduleFullScan();
    });

    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-selected", "aria-current", ...ATTRIBUTE_NAMES]
    });
}

function stopTranslator() {
    observer?.disconnect();
    observer = undefined;

    for (const [node, state] of textStates) {
        if (node.isConnected && node.data === state.translated) node.data = state.original;
    }
    textStates.clear();

    for (const [element, states] of attributeStates) {
        if (!element.isConnected) continue;
        for (const [attribute, state] of states) {
            if (element.getAttribute(attribute) === state.translated) {
                element.setAttribute(attribute, state.original);
            }
        }
    }
    attributeStates.clear();

    for (const element of markedElements) element.classList.remove("vc-vencord-arabic-text");
    markedElements.clear();
}

export default definePlugin({
    name: "VencordArabic",
    description: "Translates Vencord settings into Arabic without network access, native code or data collection",
    authors: [AUTHOR],
    tags: ["Accessibility", "Appearance"],
    settings,
    managedStyle: style,
    requiresRestart: false,
    startAt: StartAt.DOMContentLoaded,

    start: startTranslator,
    stop: stopTranslator
});

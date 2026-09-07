/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const ROOT_CLASSES = [
    "vc-cleaner-hide-quests",
    "vc-cleaner-hide-shop",
    "vc-cleaner-hide-nitro",
    "vc-cleaner-hide-nitro-upsells",
    "vc-cleaner-hide-gift-button",
    "vc-cleaner-hide-app-launcher"
] as const;

function syncRootClasses() {
    const root = document.documentElement;

    root.classList.toggle("vc-cleaner-hide-quests", settings.store.hideQuests);
    root.classList.toggle("vc-cleaner-hide-shop", settings.store.hideShop);
    root.classList.toggle("vc-cleaner-hide-nitro", settings.store.hideNitro);
    root.classList.toggle("vc-cleaner-hide-nitro-upsells", settings.store.hideNitroUpsells);
    root.classList.toggle("vc-cleaner-hide-gift-button", settings.store.hideGiftButton);
    root.classList.toggle("vc-cleaner-hide-app-launcher", settings.store.hideAppLauncher);
}

function clearRootClasses() {
    document.documentElement.classList.remove(...ROOT_CLASSES);
}

const settings = definePluginSettings({
    hideQuests: {
        type: OptionType.BOOLEAN,
        displayName: "إخفاء المهام",
        description: "يخفي تبويب Quests من قائمة الرسائل الخاصة بدون تعطيل نظام المهام نفسه",
        default: true,
        onChange: syncRootClasses
    },
    hideShop: {
        type: OptionType.BOOLEAN,
        displayName: "إخفاء المتجر",
        description: "يخفي تبويب Shop من قائمة الرسائل الخاصة فقط",
        default: true,
        onChange: syncRootClasses
    },
    hideNitro: {
        type: OptionType.BOOLEAN,
        displayName: "إخفاء تبويب Nitro",
        description: "يخفي اختصار Nitro من قائمة الرسائل الخاصة بدون المساس باشتراكك أو ميزاته",
        default: true,
        onChange: syncRootClasses
    },
    hideNitroUpsells: {
        type: OptionType.BOOLEAN,
        displayName: "إخفاء عروض Nitro الترويجية",
        description: "يخفي البنرات والتنبيهات الترويجية المعروفة لـ Nitro مع ترك صفحات الإعدادات والميزات الأساسية تعمل",
        default: true,
        onChange: syncRootClasses
    },
    hideGiftButton: {
        type: OptionType.BOOLEAN,
        displayName: "إخفاء زر الهدية",
        description: "يخفي زر إرسال هدية من حقل الكتابة. معطل افتراضيا لأنه زر وظيفي وليس مجرد إعلان",
        default: false,
        onChange: syncRootClasses
    },
    hideAppLauncher: {
        type: OptionType.BOOLEAN,
        displayName: "إخفاء زر التطبيقات",
        description: "يخفي زر App Launcher من حقل الكتابة. معطل افتراضيا حتى لا تختفي ميزة قد تستخدمها",
        default: false,
        onChange: syncRootClasses
    }
});

export default definePlugin({
    name: "DiscordCleaner",
    description: "ينظف واجهة Discord من التبويبات والعروض الترويجية المزعجة بدون مراقبة DOM أو استهلاك مستمر للموارد",
    authors: [],
    tags: ["Appearance", "Customisation"],
    settings,
    requiresRestart: false,

    start: syncRootClasses,
    stop: clearRootClasses
});

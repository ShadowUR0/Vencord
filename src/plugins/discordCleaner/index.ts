/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const ROOT_CLASS = "vc-cleaner-hide-promotions";

function syncRootClass() {
    document.documentElement.classList.toggle(ROOT_CLASS, settings.store.hidePromotions);
}

function clearRootClass() {
    document.documentElement.classList.remove(ROOT_CLASS);
}

const settings = definePluginSettings({
    hidePromotions: {
        type: OptionType.BOOLEAN,
        displayName: "إخفاء العروض الترويجية",
        description: "يخفي نوافذ وبطاقات وبنرات الترقية المزعجة مثل عروض Nitro، بدون إخفاء Nitro أو Shop أو Quests من القوائم",
        default: true,
        onChange: syncRootClass
    }
});

export default definePlugin({
    name: "DiscordCleaner",
    description: "يخفي العروض الترويجية المزعجة من Discord بدون تغيير القوائم أو تعطيل الميزات الأساسية",
    authors: [],
    tags: ["Appearance", "Customisation"],
    settings,
    requiresRestart: false,

    start: syncRootClass,
    stop: clearRootClass
});

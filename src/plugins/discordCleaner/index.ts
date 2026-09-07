/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { definePluginSettings, migratePluginSetting } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const ROOT_CLASSES = [
    "vc-cleaner-hide-quests",
    "vc-cleaner-hide-shop",
    "vc-cleaner-hide-nitro",
    "vc-cleaner-hide-nitro-upsells",
    "vc-cleaner-hide-gift-button",
    "vc-cleaner-hide-app-launcher"
] as const;

const COPY = {
    en: {
        pluginDescription: "Hide Discord UI elements and promotions you do not want",
        hideQuestsName: "Hide Quests",
        hideQuestsDescription: "Hides Quests from the sidebar",
        hideShopName: "Hide Shop",
        hideShopDescription: "Hides Shop from the sidebar",
        hideNitroName: "Hide Nitro",
        hideNitroDescription: "Hides Nitro from the sidebar",
        hideNitroUpsellsName: "Hide Nitro promotions",
        hideNitroUpsellsDescription: "Hides promotional popups and banners",
        hideGiftButtonName: "Hide gift button",
        hideGiftButtonDescription: "Hides the gift button from the message box",
        hideAppLauncherName: "Hide Apps button",
        hideAppLauncherDescription: "Hides App Launcher from the message box"
    },
    ar: {
        pluginDescription: "يخفي عناصر وعروض Discord التي لا تريدها",
        hideQuestsName: "إخفاء Quests",
        hideQuestsDescription: "يخفي Quests من الشريط الجانبي",
        hideShopName: "إخفاء Shop",
        hideShopDescription: "يخفي Shop من الشريط الجانبي",
        hideNitroName: "إخفاء Nitro",
        hideNitroDescription: "يخفي Nitro من الشريط الجانبي",
        hideNitroUpsellsName: "إخفاء عروض Nitro",
        hideNitroUpsellsDescription: "يخفي النوافذ والبنرات الترويجية",
        hideGiftButtonName: "إخفاء زر الهدية",
        hideGiftButtonDescription: "يخفي زر الهدية من صندوق الكتابة",
        hideAppLauncherName: "إخفاء زر التطبيقات",
        hideAppLauncherDescription: "يخفي App Launcher من صندوق الكتابة"
    },
    fr: {
        pluginDescription: "Masque les éléments et promotions Discord dont vous ne voulez pas",
        hideQuestsName: "Masquer Quests",
        hideQuestsDescription: "Masque Quests dans la barre latérale",
        hideShopName: "Masquer Shop",
        hideShopDescription: "Masque Shop dans la barre latérale",
        hideNitroName: "Masquer Nitro",
        hideNitroDescription: "Masque Nitro dans la barre latérale",
        hideNitroUpsellsName: "Masquer les offres Nitro",
        hideNitroUpsellsDescription: "Masque les fenêtres et bannières promotionnelles",
        hideGiftButtonName: "Masquer le bouton cadeau",
        hideGiftButtonDescription: "Masque le bouton cadeau dans la zone de message",
        hideAppLauncherName: "Masquer le bouton Apps",
        hideAppLauncherDescription: "Masque App Launcher dans la zone de message"
    },
    es: {
        pluginDescription: "Oculta elementos y promociones de Discord que no quieres ver",
        hideQuestsName: "Ocultar Quests",
        hideQuestsDescription: "Oculta Quests de la barra lateral",
        hideShopName: "Ocultar Shop",
        hideShopDescription: "Oculta Shop de la barra lateral",
        hideNitroName: "Ocultar Nitro",
        hideNitroDescription: "Oculta Nitro de la barra lateral",
        hideNitroUpsellsName: "Ocultar promociones de Nitro",
        hideNitroUpsellsDescription: "Oculta ventanas y banners promocionales",
        hideGiftButtonName: "Ocultar botón de regalo",
        hideGiftButtonDescription: "Oculta el botón de regalo del cuadro de mensaje",
        hideAppLauncherName: "Ocultar botón de Apps",
        hideAppLauncherDescription: "Oculta App Launcher del cuadro de mensaje"
    },
    de: {
        pluginDescription: "Blendet unerwünschte Discord-Elemente und Werbung aus",
        hideQuestsName: "Quests ausblenden",
        hideQuestsDescription: "Blendet Quests in der Seitenleiste aus",
        hideShopName: "Shop ausblenden",
        hideShopDescription: "Blendet Shop in der Seitenleiste aus",
        hideNitroName: "Nitro ausblenden",
        hideNitroDescription: "Blendet Nitro in der Seitenleiste aus",
        hideNitroUpsellsName: "Nitro-Werbung ausblenden",
        hideNitroUpsellsDescription: "Blendet Werbe-Popups und Banner aus",
        hideGiftButtonName: "Geschenk-Button ausblenden",
        hideGiftButtonDescription: "Blendet den Geschenk-Button im Nachrichtenfeld aus",
        hideAppLauncherName: "Apps-Button ausblenden",
        hideAppLauncherDescription: "Blendet den App Launcher im Nachrichtenfeld aus"
    },
    tr: {
        pluginDescription: "İstemediğin Discord öğelerini ve tanıtımları gizler",
        hideQuestsName: "Quests'i gizle",
        hideQuestsDescription: "Quests'i kenar çubuğundan gizler",
        hideShopName: "Shop'u gizle",
        hideShopDescription: "Shop'u kenar çubuğundan gizler",
        hideNitroName: "Nitro'yu gizle",
        hideNitroDescription: "Nitro'yu kenar çubuğundan gizler",
        hideNitroUpsellsName: "Nitro tanıtımlarını gizle",
        hideNitroUpsellsDescription: "Tanıtım pencerelerini ve bannerlarını gizler",
        hideGiftButtonName: "Hediye düğmesini gizle",
        hideGiftButtonDescription: "Mesaj kutusundaki hediye düğmesini gizler",
        hideAppLauncherName: "Uygulamalar düğmesini gizle",
        hideAppLauncherDescription: "Mesaj kutusundaki App Launcher'ı gizler"
    },
    ru: {
        pluginDescription: "Скрывает ненужные элементы и рекламу Discord",
        hideQuestsName: "Скрыть Quests",
        hideQuestsDescription: "Скрывает Quests на боковой панели",
        hideShopName: "Скрыть Shop",
        hideShopDescription: "Скрывает Shop на боковой панели",
        hideNitroName: "Скрыть Nitro",
        hideNitroDescription: "Скрывает Nitro на боковой панели",
        hideNitroUpsellsName: "Скрыть рекламу Nitro",
        hideNitroUpsellsDescription: "Скрывает рекламные окна и баннеры",
        hideGiftButtonName: "Скрыть кнопку подарка",
        hideGiftButtonDescription: "Скрывает кнопку подарка в поле сообщения",
        hideAppLauncherName: "Скрыть кнопку приложений",
        hideAppLauncherDescription: "Скрывает App Launcher в поле сообщения"
    },
    pt: {
        pluginDescription: "Oculta elementos e promoções do Discord que você não quer ver",
        hideQuestsName: "Ocultar Quests",
        hideQuestsDescription: "Oculta Quests da barra lateral",
        hideShopName: "Ocultar Shop",
        hideShopDescription: "Oculta Shop da barra lateral",
        hideNitroName: "Ocultar Nitro",
        hideNitroDescription: "Oculta Nitro da barra lateral",
        hideNitroUpsellsName: "Ocultar promoções do Nitro",
        hideNitroUpsellsDescription: "Oculta pop-ups e banners promocionais",
        hideGiftButtonName: "Ocultar botão de presente",
        hideGiftButtonDescription: "Oculta o botão de presente da caixa de mensagem",
        hideAppLauncherName: "Ocultar botão de Apps",
        hideAppLauncherDescription: "Oculta o App Launcher da caixa de mensagem"
    }
} as const;

type Language = keyof typeof COPY;
type CopyKey = keyof typeof COPY.en;

function getLanguage(): Language {
    const locale = typeof document === "undefined"
        ? "en"
        : document.documentElement.lang || navigator.language || "en";
    const language = locale.toLowerCase().split("-")[0] as Language;

    return language in COPY ? language : "en";
}

function text(key: CopyKey) {
    return COPY[getLanguage()][key];
}

function syncRootClasses() {
    const root = document.documentElement;

    root.classList.remove("vc-cleaner-hide-promotions");
    root.classList.toggle("vc-cleaner-hide-quests", settings.store.hideQuests);
    root.classList.toggle("vc-cleaner-hide-shop", settings.store.hideShop);
    root.classList.toggle("vc-cleaner-hide-nitro", settings.store.hideNitro);
    root.classList.toggle("vc-cleaner-hide-nitro-upsells", settings.store.hideNitroUpsells);
    root.classList.toggle("vc-cleaner-hide-gift-button", settings.store.hideGiftButton);
    root.classList.toggle("vc-cleaner-hide-app-launcher", settings.store.hideAppLauncher);
}

function clearRootClasses() {
    document.documentElement.classList.remove(...ROOT_CLASSES, "vc-cleaner-hide-promotions");
}

const settings = definePluginSettings({
    hideQuests: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("hideQuestsName"); },
        get description() { return text("hideQuestsDescription"); },
        default: true,
        onChange: syncRootClasses
    },
    hideShop: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("hideShopName"); },
        get description() { return text("hideShopDescription"); },
        default: true,
        onChange: syncRootClasses
    },
    hideNitro: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("hideNitroName"); },
        get description() { return text("hideNitroDescription"); },
        default: true,
        onChange: syncRootClasses
    },
    hideNitroUpsells: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("hideNitroUpsellsName"); },
        get description() { return text("hideNitroUpsellsDescription"); },
        default: true,
        onChange: syncRootClasses
    },
    hideGiftButton: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("hideGiftButtonName"); },
        get description() { return text("hideGiftButtonDescription"); },
        default: false,
        onChange: syncRootClasses
    },
    hideAppLauncher: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("hideAppLauncherName"); },
        get description() { return text("hideAppLauncherDescription"); },
        default: false,
        onChange: syncRootClasses
    }
});

export default definePlugin({
    name: "DiscordCleaner",
    get description() { return text("pluginDescription"); },
    authors: [],
    tags: ["Appearance", "Customisation"],
    settings,
    requiresRestart: false,

    start() {
        migratePluginSetting("DiscordCleaner", "hidePromotions", "hideNitroUpsells");
        syncRootClasses();
    },

    stop: clearRootClasses
});

/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { definePluginSettings, Settings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@vencord/discord-types";
import { IconUtils, UserStore, useState } from "@webpack/common";

const COPY = {
    en: {
        clickToLoadName: "Click to load images",
        clickToLoadDesc: "Stops message images from loading until you choose",
        saverSizeName: "Saver image size",
        saverSizeDesc: "Resolution used by the enhanced saver button",
        smallAssetsName: "Avatars and icons",
        smallAssetsDesc: "Limits small Discord images to a sensible size",
        staticAvatarsName: "Static avatars",
        staticAvatarsDesc: "Stops animated avatars to save more data",
        off: "Off",
        balanced: "Balanced",
        aggressive: "Aggressive",
        notLoaded: "Image not loaded",
        enhanced: "Enhanced saver",
        full: "Full quality"
    },
    ar: {
        clickToLoadName: "الصور عند الطلب",
        clickToLoadDesc: "يمنع تحميل صور الرسائل حتى تختار",
        saverSizeName: "حجم الصورة الموفرة",
        saverSizeDesc: "الدقة المستخدمة في العرض الموفر المحسن",
        smallAssetsName: "الافتارات والايقونات",
        smallAssetsDesc: "يقلل حجم صور Discord الصغيرة بدون تخريبها",
        staticAvatarsName: "افتارات ثابتة",
        staticAvatarsDesc: "يوقف حركة الافتارات لتوفير بيانات اكثر",
        off: "متوقف",
        balanced: "متوازن",
        aggressive: "اقصى توفير",
        notLoaded: "الصورة لم تحمل",
        enhanced: "موفر محسن",
        full: "الجودة الكاملة"
    },
    fr: {
        clickToLoadName: "Images à la demande",
        clickToLoadDesc: "Empêche le chargement des images jusqu'à votre choix",
        saverSizeName: "Taille des images économisées",
        saverSizeDesc: "Résolution utilisée par le mode économiseur amélioré",
        smallAssetsName: "Avatars et icônes",
        smallAssetsDesc: "Limite les petites images Discord à une taille raisonnable",
        staticAvatarsName: "Avatars statiques",
        staticAvatarsDesc: "Désactive les avatars animés pour économiser plus de données",
        off: "Désactivé",
        balanced: "Équilibré",
        aggressive: "Maximum",
        notLoaded: "Image non chargée",
        enhanced: "Économiseur amélioré",
        full: "Qualité complète"
    },
    es: {
        clickToLoadName: "Imágenes bajo demanda",
        clickToLoadDesc: "Evita cargar imágenes hasta que elijas",
        saverSizeName: "Tamaño de imagen ahorrador",
        saverSizeDesc: "Resolución usada por el modo ahorrador mejorado",
        smallAssetsName: "Avatares e iconos",
        smallAssetsDesc: "Limita las imágenes pequeñas de Discord a un tamaño razonable",
        staticAvatarsName: "Avatares estáticos",
        staticAvatarsDesc: "Desactiva avatares animados para ahorrar más datos",
        off: "Desactivado",
        balanced: "Equilibrado",
        aggressive: "Máximo",
        notLoaded: "Imagen no cargada",
        enhanced: "Ahorro mejorado",
        full: "Calidad completa"
    },
    de: {
        clickToLoadName: "Bilder nur auf Abruf",
        clickToLoadDesc: "Lädt Nachrichtenbilder erst nach deiner Auswahl",
        saverSizeName: "Datensparende Bildgröße",
        saverSizeDesc: "Auflösung für die verbesserte Sparansicht",
        smallAssetsName: "Avatare und Symbole",
        smallAssetsDesc: "Begrenzt kleine Discord-Bilder auf eine sinnvolle Größe",
        staticAvatarsName: "Statische Avatare",
        staticAvatarsDesc: "Deaktiviert animierte Avatare und spart mehr Daten",
        off: "Aus",
        balanced: "Ausgewogen",
        aggressive: "Maximum",
        notLoaded: "Bild nicht geladen",
        enhanced: "Verbessert sparen",
        full: "Volle Qualität"
    },
    tr: {
        clickToLoadName: "Görselleri isteğe bağlı yükle",
        clickToLoadDesc: "Sen seçene kadar mesaj görsellerini yüklemez",
        saverSizeName: "Tasarruflu görsel boyutu",
        saverSizeDesc: "Geliştirilmiş tasarruf modu çözünürlüğü",
        smallAssetsName: "Avatarlar ve simgeler",
        smallAssetsDesc: "Küçük Discord görsellerini makul bir boyutla sınırlar",
        staticAvatarsName: "Sabit avatarlar",
        staticAvatarsDesc: "Daha fazla veri tasarrufu için hareketli avatarları kapatır",
        off: "Kapalı",
        balanced: "Dengeli",
        aggressive: "Maksimum",
        notLoaded: "Görsel yüklenmedi",
        enhanced: "Geliştirilmiş tasarruf",
        full: "Tam kalite"
    },
    ru: {
        clickToLoadName: "Загружать изображения по нажатию",
        clickToLoadDesc: "Не загружает изображения сообщений до вашего выбора",
        saverSizeName: "Размер экономного изображения",
        saverSizeDesc: "Разрешение для улучшенного экономного режима",
        smallAssetsName: "Аватары и значки",
        smallAssetsDesc: "Ограничивает размер небольших изображений Discord",
        staticAvatarsName: "Статичные аватары",
        staticAvatarsDesc: "Отключает анимацию аватаров для экономии данных",
        off: "Выкл.",
        balanced: "Баланс",
        aggressive: "Максимум",
        notLoaded: "Изображение не загружено",
        enhanced: "Улучшенная экономия",
        full: "Полное качество"
    },
    pt: {
        clickToLoadName: "Imagens sob demanda",
        clickToLoadDesc: "Impede o carregamento de imagens até você escolher",
        saverSizeName: "Tamanho da imagem econômica",
        saverSizeDesc: "Resolução usada pelo modo econômico melhorado",
        smallAssetsName: "Avatares e ícones",
        smallAssetsDesc: "Limita imagens pequenas do Discord a um tamanho razoável",
        staticAvatarsName: "Avatares estáticos",
        staticAvatarsDesc: "Desativa avatares animados para economizar mais dados",
        off: "Desativado",
        balanced: "Equilibrado",
        aggressive: "Máximo",
        notLoaded: "Imagem não carregada",
        enhanced: "Economia melhorada",
        full: "Qualidade completa"
    }
} as const;

type Language = keyof typeof COPY;
type CopyKey = keyof typeof COPY.en;
type LoadMode = "blocked" | "enhanced" | "full";
type AssetMode = "off" | "balanced" | "aggressive";

type Attachment = {
    id: string;
    filename: string;
    content_type?: string;
    size?: number;
    url: string;
    proxy_url?: string;
    width?: number | null;
    height?: number | null;
};

const loadedModes = new Map<string, LoadMode>();
const iconUtilsOriginals = new Map<string, Function>();
let userAvatarPrototype: any;
let originalUserAvatarUrl: Function | undefined;

function getLanguage(): Language {
    if (Settings.plugins.VencordArabic?.enabled) return "ar";

    const locale = typeof document === "undefined"
        ? "en"
        : document.documentElement.lang || navigator.language || "en";
    const language = locale.toLowerCase().split("-")[0] as Language;

    return language in COPY ? language : "en";
}

function text(key: CopyKey) {
    return COPY[getLanguage()][key];
}

const settings = definePluginSettings({
    clickToLoadImages: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("clickToLoadName"); },
        get description() { return text("clickToLoadDesc"); },
        default: true
    },
    saverImageSize: {
        type: OptionType.SELECT,
        get displayName() { return text("saverSizeName"); },
        get description() { return text("saverSizeDesc"); },
        options: [
            { label: "320 px", value: 320 },
            { label: "480 px", value: 480, default: true },
            { label: "640 px", value: 640 }
        ]
    },
    smallAssets: {
        type: OptionType.SELECT,
        get displayName() { return text("smallAssetsName"); },
        get description() { return text("smallAssetsDesc"); },
        options: [
            { get label() { return text("off"); }, value: "off" },
            { get label() { return text("balanced"); }, value: "balanced", default: true },
            { get label() { return text("aggressive"); }, value: "aggressive" }
        ]
    },
    staticAvatars: {
        type: OptionType.BOOLEAN,
        get displayName() { return text("staticAvatarsName"); },
        get description() { return text("staticAvatarsDesc"); },
        default: false
    }
});

function isImageAttachment(attachment: Attachment) {
    if (attachment.content_type?.startsWith("image/")) return true;
    return /\.(?:avif|gif|jpe?g|png|webp)$/i.test(attachment.filename ?? "");
}

function filterMessageAttachments(message: Message) {
    if (!settings.store.clickToLoadImages || !message?.attachments?.some(isImageAttachment as any)) return message;

    const attachments = message.attachments.filter(attachment => !isImageAttachment(attachment as Attachment));
    const copy = Object.assign(Object.create(Object.getPrototypeOf(message)), message);
    copy.attachments = attachments;
    return copy;
}

function getSaverUrl(attachment: Attachment) {
    const rawUrl = attachment.proxy_url || attachment.url;

    try {
        const url = new URL(rawUrl);
        const maxSide = Number(settings.store.saverImageSize) || 480;
        const width = attachment.width ?? maxSide;
        const height = attachment.height ?? maxSide;
        const scale = Math.min(1, maxSide / Math.max(width, height));

        url.searchParams.set("width", Math.max(1, Math.round(width * scale)).toString());
        url.searchParams.set("height", Math.max(1, Math.round(height * scale)).toString());
        url.searchParams.set("format", "webp");
        return url.toString();
    } catch {
        return rawUrl;
    }
}

function formatBytes(bytes?: number) {
    if (!bytes || bytes < 1024) return bytes ? `${bytes} B` : "";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayDimensions(attachment: Attachment) {
    const originalWidth = attachment.width || 400;
    const originalHeight = attachment.height || 260;
    const maxWidth = 520;
    const maxHeight = 420;
    const scale = Math.min(1, maxWidth / originalWidth, maxHeight / originalHeight);

    return {
        width: Math.max(180, Math.round(originalWidth * scale)),
        height: Math.max(120, Math.round(originalHeight * scale))
    };
}

function MediaAttachment({ attachment }: { attachment: Attachment; }) {
    const [mode, setModeState] = useState<LoadMode>(() => loadedModes.get(attachment.url) ?? "blocked");
    const { width, height } = displayDimensions(attachment);

    const setMode = (next: LoadMode) => {
        loadedModes.set(attachment.url, next);
        setModeState(next);
    };

    const controls = (
        <div className="vc-mediaSaver-controls" onClick={event => event.stopPropagation()}>
            <button
                className={`vc-mediaSaver-button${mode === "enhanced" ? " vc-mediaSaver-button-active" : ""}`}
                onClick={() => setMode("enhanced")}
                type="button"
            >
                {text("enhanced")}
            </button>
            <button
                className={`vc-mediaSaver-button${mode === "full" ? " vc-mediaSaver-button-active" : ""}`}
                onClick={() => setMode("full")}
                type="button"
            >
                {text("full")}
            </button>
        </div>
    );

    if (mode === "blocked") {
        return (
            <div className="vc-mediaSaver-item">
                <div
                    className="vc-mediaSaver-placeholder"
                    style={{ width, height }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setMode("enhanced")}
                    onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") setMode("enhanced");
                    }}
                >
                    <div className="vc-mediaSaver-placeholder-title">{text("notLoaded")}</div>
                    <div className="vc-mediaSaver-meta">
                        <span>{attachment.filename}</span>
                        {attachment.size ? <span>{formatBytes(attachment.size)}</span> : null}
                    </div>
                    {controls}
                </div>
            </div>
        );
    }

    const src = mode === "full" ? attachment.url : getSaverUrl(attachment);

    return (
        <div className="vc-mediaSaver-item">
            <div className="vc-mediaSaver-image-wrap" style={{ width, height }}>
                <img
                    className={`vc-mediaSaver-image${mode === "enhanced" ? " vc-mediaSaver-image-enhanced" : ""}`}
                    src={src}
                    alt={attachment.filename}
                    draggable={false}
                />
            </div>
            {controls}
        </div>
    );
}

function renderMessageAccessory({ message }: { message: Message; }) {
    if (!settings.store.clickToLoadImages) return null;

    const attachments = (message?.attachments as Attachment[] | undefined)?.filter(isImageAttachment);
    if (!attachments?.length) return null;

    return (
        <div className="vc-mediaSaver-list">
            {attachments.map(attachment => (
                <MediaAttachment key={attachment.id || attachment.url} attachment={attachment} />
            ))}
        </div>
    );
}

function getAssetLimit() {
    switch (settings.store.smallAssets as AssetMode) {
        case "aggressive": return 64;
        case "balanced": return 128;
        default: return 0;
    }
}

function limitDiscordAssetUrl(value: unknown) {
    if (typeof value !== "string") return value;

    const limit = getAssetLimit();
    if (!limit) return value;

    try {
        const url = new URL(value, window.location.href);
        const path = url.pathname;
        const isSmallAsset =
            /\/avatars\//.test(path) ||
            /\/icons\//.test(path) ||
            /\/role-icons\//.test(path) ||
            /\/embed\/avatars\//.test(path) ||
            /\/avatar-decoration-presets\//.test(path);

        if (!isSmallAsset) return value;

        const current = Number(url.searchParams.get("size"));
        url.searchParams.set("size", String(current > 0 ? Math.min(current, limit) : limit));
        return url.toString();
    } catch {
        return value;
    }
}

function patchUserAvatarUrls() {
    const user = UserStore.getCurrentUser?.();
    const prototype = user && Object.getPrototypeOf(user);
    if (!prototype?.getAvatarURL || originalUserAvatarUrl) return;

    userAvatarPrototype = prototype;
    originalUserAvatarUrl = prototype.getAvatarURL;
    prototype.getAvatarURL = function (guildId: string | undefined, size: number | undefined, canAnimate: boolean | undefined) {
        const limit = getAssetLimit();
        const requestedSize = limit ? Math.min(size || limit, limit) : size;
        const animate = settings.store.staticAvatars ? false : canAnimate;
        const result = originalUserAvatarUrl!.call(this, guildId, requestedSize, animate);
        return limitDiscordAssetUrl(result);
    };
}

const ICON_UTIL_NAMES = [
    "getUserAvatarURL",
    "getGuildMemberAvatarURLSimple",
    "getGuildIconURL",
    "getChannelIconURL",
    "getAvatarDecorationURL"
] as const;

function patchIconUtils() {
    const mutable = IconUtils as unknown as Record<string, any>;

    for (const name of ICON_UTIL_NAMES) {
        const original = mutable[name];
        if (typeof original !== "function" || iconUtilsOriginals.has(name)) continue;

        iconUtilsOriginals.set(name, original);
        mutable[name] = function (...args: any[]) {
            if (settings.store.staticAvatars) {
                if (name === "getUserAvatarURL" && typeof args[1] === "boolean") args[1] = false;
                if (args[0] && typeof args[0] === "object" && "canAnimate" in args[0]) {
                    args[0] = { ...args[0], canAnimate: false };
                }
            }

            return limitDiscordAssetUrl(original.apply(this, args));
        };
    }
}

function restoreAssetPatches() {
    if (userAvatarPrototype && originalUserAvatarUrl) {
        userAvatarPrototype.getAvatarURL = originalUserAvatarUrl;
    }
    userAvatarPrototype = undefined;
    originalUserAvatarUrl = undefined;

    const mutable = IconUtils as unknown as Record<string, any>;
    for (const [name, original] of iconUtilsOriginals) mutable[name] = original;
    iconUtilsOriginals.clear();
}

export default definePlugin({
    name: "MediaSaver",
    description: "Reduce Discord data usage by loading message images on demand and limiting small media assets",
    authors: [],
    tags: ["Media", "Utility"],
    settings,

    patches: [{
        find: "this.renderAttachments(",
        replacement: {
            match: /(?<=\i=)this\.renderAttachments\((\i)\)/,
            replace: "this.renderAttachments($self.filterMessageAttachments($1))"
        }
    }],

    filterMessageAttachments,
    renderMessageAccessory,

    start() {
        patchUserAvatarUrls();
        patchIconUtils();
    },

    stop() {
        restoreAssetPatches();
        loadedModes.clear();
    }
});

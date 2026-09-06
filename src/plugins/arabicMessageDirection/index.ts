/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import definePlugin from "@utils/types";

const MESSAGE_CONTENT_SELECTOR = '[id^="message-content-"]';
const COMPOSER_SELECTOR = 'form [role="textbox"][contenteditable="true"]';
const TARGET_SELECTOR = `${MESSAGE_CONTENT_SELECTOR}, ${COMPOSER_SELECTOR}`;
const MESSAGE_RTL_CLASS = "vc-arabic-message-rtl";
const COMPOSER_RTL_CLASS = "vc-arabic-composer-rtl";
const PREVIOUS_DIR_DATASET_KEY = "vcArabicPreviousDir";
const PREVIOUS_PADDING_DATASET_KEY = "vcArabicPreviousPaddingRight";
const BASE_PADDING_DATASET_KEY = "vcArabicBasePaddingRight";
const COMPOSER_BUTTON_CLEARANCE = 8;

// URLs can contain lots of Latin characters and should not decide the
// direction of an otherwise Arabic message.
const URL_REGEX = /(?:https?:\/\/|www\.)\S+/giu;
const ARABIC_REGEX = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/g;
const LATIN_REGEX = /[A-Za-z]/g;

let observer: MutationObserver | null = null;

function shouldUseRtl(text: string) {
    const sample = text.replace(URL_REGEX, " ");
    const arabicCount = sample.match(ARABIC_REGEX)?.length ?? 0;

    if (arabicCount === 0) return false;

    const latinCount = sample.match(LATIN_REGEX)?.length ?? 0;
    return arabicCount > latinCount;
}

function getRtlClass(element: HTMLElement) {
    return element.matches(COMPOSER_SELECTOR) ? COMPOSER_RTL_CLASS : MESSAGE_RTL_CLASS;
}

function hasVisibleCustomButton(composer: HTMLElement) {
    const form = composer.closest("form");
    if (!form) return false;

    for (const button of form.querySelectorAll<HTMLElement>(".vc-chatbar-button")) {
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) return true;
    }

    return false;
}

function syncComposerSpacing(element: HTMLElement) {
    if (!element.matches(COMPOSER_SELECTOR)) return;

    if (!(PREVIOUS_PADDING_DATASET_KEY in element.dataset)) {
        element.dataset[PREVIOUS_PADDING_DATASET_KEY] = element.style.paddingRight;
        element.dataset[BASE_PADDING_DATASET_KEY] = getComputedStyle(element).paddingRight;
    }

    const basePadding = Number.parseFloat(element.dataset[BASE_PADDING_DATASET_KEY] ?? "0") || 0;
    const clearance = hasVisibleCustomButton(element) ? COMPOSER_BUTTON_CLEARANCE : 0;
    element.style.paddingRight = `${basePadding + clearance}px`;
}

function restoreComposerSpacing(element: HTMLElement) {
    if (!(PREVIOUS_PADDING_DATASET_KEY in element.dataset)) return;

    element.style.paddingRight = element.dataset[PREVIOUS_PADDING_DATASET_KEY] ?? "";
    delete element.dataset[PREVIOUS_PADDING_DATASET_KEY];
    delete element.dataset[BASE_PADDING_DATASET_KEY];
}

function restoreDirection(element: HTMLElement) {
    if (PREVIOUS_DIR_DATASET_KEY in element.dataset) {
        const previousDir = element.dataset[PREVIOUS_DIR_DATASET_KEY];
        if (previousDir) element.setAttribute("dir", previousDir);
        else element.removeAttribute("dir");

        delete element.dataset[PREVIOUS_DIR_DATASET_KEY];
    }

    restoreComposerSpacing(element);
    element.classList.remove(MESSAGE_RTL_CLASS, COMPOSER_RTL_CLASS);
}

function updateDirection(element: Element) {
    if (!(element instanceof HTMLElement)) return;

    const text = element.textContent ?? "";
    if (!shouldUseRtl(text)) {
        restoreDirection(element);
        return;
    }

    if (!(PREVIOUS_DIR_DATASET_KEY in element.dataset))
        element.dataset[PREVIOUS_DIR_DATASET_KEY] = element.getAttribute("dir") ?? "";

    const rtlClass = getRtlClass(element);
    element.setAttribute("dir", "rtl");
    element.classList.remove(rtlClass === MESSAGE_RTL_CLASS ? COMPOSER_RTL_CLASS : MESSAGE_RTL_CLASS);
    element.classList.add(rtlClass);

    if (rtlClass === COMPOSER_RTL_CLASS) syncComposerSpacing(element);
}

function processNode(node: Node) {
    const element = node instanceof Element ? node : node.parentElement;
    if (!element) return;

    const containingTarget = element.closest(TARGET_SELECTOR);
    if (containingTarget) updateDirection(containingTarget);

    if (element.matches(TARGET_SELECTOR)) updateDirection(element);
    element.querySelectorAll(TARGET_SELECTOR).forEach(updateDirection);

    const form = element.closest("form");
    const composer = form?.querySelector(COMPOSER_SELECTOR);
    if (composer) updateDirection(composer);
}

function processVisibleContent() {
    document.querySelectorAll(TARGET_SELECTOR).forEach(updateDirection);
}

export default definePlugin({
    name: "ArabicMessageDirection",
    description: "يصلح اتجاه الرسائل العربية المختلطة بالانجليزية والروابط تلقائيا",
    authors: [],
    tags: ["Chat", "Accessibility"],

    start() {
        processVisibleContent();

        const root = document.getElementById("app-mount") ?? document.body;
        observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "characterData") {
                    processNode(mutation.target);
                    continue;
                }

                for (const node of mutation.addedNodes)
                    processNode(node);
            }
        });

        observer.observe(root, {
            subtree: true,
            childList: true,
            characterData: true
        });
    },

    stop() {
        observer?.disconnect();
        observer = null;

        document.querySelectorAll(`.${MESSAGE_RTL_CLASS}, .${COMPOSER_RTL_CLASS}`).forEach(element => {
            if (element instanceof HTMLElement) restoreDirection(element);
        });
    }
});

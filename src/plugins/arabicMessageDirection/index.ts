/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./style.css";

import definePlugin from "@utils/types";

const MESSAGE_CONTENT_SELECTOR = '[id^="message-content-"]';
const RTL_CLASS = "vc-arabic-message-rtl";
const PREVIOUS_DIR_DATASET_KEY = "vcArabicPreviousDir";

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

function restoreDirection(element: HTMLElement) {
    if (!(PREVIOUS_DIR_DATASET_KEY in element.dataset)) return;

    const previousDir = element.dataset[PREVIOUS_DIR_DATASET_KEY];
    if (previousDir) element.setAttribute("dir", previousDir);
    else element.removeAttribute("dir");

    delete element.dataset[PREVIOUS_DIR_DATASET_KEY];
    element.classList.remove(RTL_CLASS);
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

    element.setAttribute("dir", "rtl");
    element.classList.add(RTL_CLASS);
}

function processNode(node: Node) {
    const element = node instanceof Element ? node : node.parentElement;
    if (!element) return;

    const containingMessage = element.closest(MESSAGE_CONTENT_SELECTOR);
    if (containingMessage) updateDirection(containingMessage);

    if (element.matches(MESSAGE_CONTENT_SELECTOR)) updateDirection(element);
    element.querySelectorAll(MESSAGE_CONTENT_SELECTOR).forEach(updateDirection);
}

function processVisibleMessages() {
    document.querySelectorAll(MESSAGE_CONTENT_SELECTOR).forEach(updateDirection);
}

export default definePlugin({
    name: "ArabicMessageDirection",
    description: "يصلح اتجاه الرسائل العربية المختلطة بالانجليزية والروابط تلقائيا",
    authors: [{ name: "Vencord Arabic", id: 0n }],
    tags: ["Chat", "Accessibility"],

    start() {
        processVisibleMessages();

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

        document.querySelectorAll(`.${RTL_CLASS}`).forEach(element => {
            if (element instanceof HTMLElement) restoreDirection(element);
        });
    }
});
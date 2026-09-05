import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "vencord-site");
const overrides = path.resolve("site-vencord/overrides");

function copyTree(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);
        if (entry.isDirectory()) copyTree(from, to);
        else fs.copyFileSync(from, to);
    }
}

copyTree(overrides, root);

const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value);

// Localize document metadata and enforce a real RTL layout, while leaving code/commands LTR.
let layout = read("src/layouts/Layout.astro");
layout = layout
    .replace(
        'browserRequirements:\n            "Requires UserScript or extension support. Requires modern JavaScript support.",',
        'browserRequirements:\n            "يتطلب متصفحا حديثا يدعم الاضافات أو Userscript.",'
    )
    .replace('<!-- read if cute :3 -->', '<!-- واجهة Vencord Arabic -->');

if (!layout.includes("vencord-arabic-rtl")) {
    layout = layout.replace(
        "</html>",
        `<style is:global id="vencord-arabic-rtl">
    html[dir="rtl"] body {
        direction: rtl;
        text-align: start;
    }

    html[dir="rtl"] code,
    html[dir="rtl"] pre,
    html[dir="rtl"] kbd,
    html[dir="rtl"] samp {
        direction: ltr;
        text-align: left;
        unicode-bidi: isolate;
    }

    html[dir="rtl"] ul,
    html[dir="rtl"] ol {
        padding-inline-start: 1.25rem;
        padding-inline-end: 0;
    }
</style>
</html>`
    );
}
write("src/layouts/Layout.astro", layout);

// Keep Vencord's original footer/component, but localize every user-facing label in it.
let footer = read("src/components/Footer.astro");
footer = footer
    .replace("source code", "الشيفرة المصدرية")
    .replace(
        "Discord is trademark of Discord Inc. Vencord Arabic is an unofficial fork and is not affiliated with Discord Inc. or the official Vencord project.",
        "Discord علامة تجارية لشركة Discord Inc. وVencord Arabic نسخة غير رسمية وغير تابعة لديسكورد أو لفريق Vencord الرسمي."
    )
    .replace('title="Join Vencord Arabic\'s Discord Server"', 'title="الدعم والمشاكل"')
    .replace('title="Vencord Source Code"', 'title="الشيفرة المصدرية لـ Vencord Arabic"')
    .replace('title="Vencord on X (formerly Twitter)"', 'title="Vencord Arabic على GitHub"')
    .replace('title="Support Vencord Arabic\'s Development"', 'title="مصدر موقع Vencord الاصلي"')
    .replace("Switch to Light theme", "التبديل إلى الوضع الفاتح")
    .replace("Switch to Dark theme", "التبديل إلى الوضع الداكن");
write("src/components/Footer.astro", footer);

// Prefix static assets introduced by the Arabic override files for project GitHub Pages.
function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (/\.(astro|svelte|ts|css|mdx?)$/.test(entry.name)) {
            let text = fs.readFileSync(file, "utf8");
            text = text
                .replaceAll('"/assets/', '"/Vencord/assets/')
                .replaceAll("'/assets/", "'/Vencord/assets/")
                .replaceAll('url("/assets/', 'url("/Vencord/assets/')
                .replaceAll('"/fonts/', '"/Vencord/fonts/');
            fs.writeFileSync(file, text);
        }
    }
}
walk(path.join(root, "src"));

console.log("Applied full Arabic localization and RTL overrides");

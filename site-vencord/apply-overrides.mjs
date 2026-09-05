import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "vencord-site");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value);
const replace = (rel, from, to) => {
    const current = read(rel);
    if (!current.includes(from)) throw new Error(`Expected text not found in ${rel}`);
    write(rel, current.replace(from, to));
};

// GitHub Pages needs a static build under the repository base path.
write("astro.config.mjs", `import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";

export default defineConfig({
    site: "https://shadowur0.github.io",
    base: "/Vencord",
    output: "static",
    vite: { build: { sourcemap: true } },
    markdown: { shikiConfig: { theme: "css-variables" } },
    integrations: [mdx(), sitemap(), svelte()],
});
`);

// This deployment intentionally exposes only the homepage and download page.
for (const entry of fs.readdirSync(path.join(root, "src/pages"))) {
    if (["index.astro", "download.astro", "404.astro"].includes(entry)) continue;
    fs.rmSync(path.join(root, "src/pages", entry), { recursive: true, force: true });
}

// Point the original Vencord components at Vencord Arabic builds/source.
replace(
    "src/scripts/constants.ts",
    'export const GITHUB_URL = "https://github.com/Vendicated/Vencord";',
    'export const GITHUB_URL = "https://github.com/ShadowUR0/Vencord";'
);
replace(
    "src/scripts/constants.ts",
    'export const SOURCE_CODE = "https://github.com/Vencord/vencord.dev";',
    'export const SOURCE_CODE = "https://github.com/ShadowUR0/Vencord/tree/main/site-vencord";'
);
replace(
    "src/scripts/constants.ts",
    '    "https://github.com/Vencord/Installer/releases/latest/download/";',
    '    "https://github.com/ShadowUR0/Installer/releases/download/latest/";'
);
replace(
    "src/scripts/constants.ts",
    '    "https://chrome.google.com/webstore/detail/vencord-web/cbghhgpcnddeihccjmnadmkaejncjndb";',
    '    "https://github.com/ShadowUR0/Vencord/releases/download/devbuild/extension-chrome.zip";'
);
replace(
    "src/scripts/constants.ts",
    '    "https://raw.githubusercontent.com/Vencord/builds/main/Vencord.user.js";',
    '    "https://github.com/ShadowUR0/Vencord/releases/download/devbuild/Vencord.user.js";'
);

// Branding while retaining Vencord's original components and CSS.
let layout = read("src/layouts/Layout.astro")
    .replaceAll('name: "Vencord"', 'name: "Vencord Arabic"')
    .replace('<html lang="en">', '<html lang="ar" dir="rtl">')
    .replace('`${title} | Vencord` : "Vencord"', '`${title} | Vencord Arabic` : "Vencord Arabic"')
    .replace('content="Vencord Contributors"', 'content="Vencord Arabic Contributors"')
    .replace('content={title ?? "Vencord"}', 'content={title ?? "Vencord Arabic"}')
    .replace('content="Vencord"', 'content="Vencord Arabic"');
write("src/layouts/Layout.astro", layout);

let nav = read("src/components/NavBar.astro");
nav = nav.replace('import OptimizedImage from "./OptimizedImage.astro";\n\n', "");
nav = nav.replace(
`const navLinks = {
    download: ["Download", "accentPurple"],
    plugins: ["Plugins", "accentBlue"],
    faq: ["FAQ", "accentAqua"],
    cloud: ["Cloud", "accentYellow"],
};`,
`const navLinks = {
    download: ["Download", "accentPurple"],
};`
);
nav = nav.replace('const page = Astro.url.pathname.split("/")[1];', 'const page = Astro.url.pathname.split("/").filter(Boolean).at(-1);');
nav = nav.replace('href="/" id="title"', 'href="/Vencord/" id="title"');
nav = nav.replace(
    '<OptimizedImage src="/assets/logo-nav" id="logo-img" alt="Vencord Home" />',
    '<img src="/Vencord/assets/vencord-arabic-logo.png" id="logo-img" alt="Vencord Arabic" />'
);
nav = nav.replace('href={`/${link}`}', 'href={`/Vencord/${link}`}');
write("src/components/NavBar.astro", nav);

let home = read("src/pages/index.astro");
home = home.replace('import OptimizedImage from "@components/OptimizedImage.astro";\n', "");
home = home.replace(
`            <OptimizedImage
                id="cute-logo"
                src="/assets/cute-logo"
                alt="Vencord cute wordmark"
            />`,
`            <img
                id="cute-logo"
                src="/Vencord/assets/vencord-arabic-logo.png"
                alt="Vencord Arabic"
            />`
);
home = home
    .replace("The cutest Discord client mod", "Vencord بتجربة عربية مدمجة")
    .replace('href="/download"', 'href="/Vencord/download"')
    .replace("Download Vencord", "Download Vencord Arabic")
    .replace('<LinkButton href="/discord">Join our Support Server</LinkButton>', '<LinkButton href="https://github.com/ShadowUR0/Installer/releases/tag/latest">Installer Releases</LinkButton>')
    .replace('<LinkButton href="/github">View on GitHub</LinkButton>', '<LinkButton href="https://github.com/ShadowUR0/Vencord">View on GitHub</LinkButton>');
write("src/pages/index.astro", home);

let download = read("src/pages/download.astro")
    .replace('title="Download"', 'title="Download Vencord Arabic"')
    .replace('description="Download Vencord for Desktop or your favourite Browser"', 'description="Download Vencord Arabic for Desktop or Browser"')
    .replace('breadcrumbs={[["Download", "/download"]]}', 'breadcrumbs={[["Download", "/Vencord/download"]]}')
    .replace('Download Vencord</h1>', 'Download Vencord Arabic</h1>');
write("src/pages/download.astro", download);

// Keep Vencord's exact tab/card styling; only change filenames, links and relevant instructions.
let windows = read("src/components/pages/download/WindowsTab.astro")
    .replace('["VencordInstaller.exe", "VencordInstallerCli.exe"]', '["VencordArabicInstaller.exe", "VencordArabicInstallerCli.exe"]')
    .replaceAll("VencordInstaller.exe", "VencordArabicInstaller.exe")
    .replaceAll("VencordInstallerCli.exe", "VencordArabicInstallerCli.exe");
write("src/components/pages/download/WindowsTab.astro", windows);

let linux = read("src/components/pages/download/LinuxTab.astro")
    .replace('code={`sh -c "$(curl -sS ${Astro.url.origin}/install.sh)"`}', 'code={`sh -c "$(curl -sS https://shadowur0.github.io/Vencord/install.sh)"`}');
write("src/components/pages/download/LinuxTab.astro", linux);

let mac = read("src/components/pages/download/MacTab.astro")
    .replace('["VencordInstaller.MacOs.zip"]', '["VencordArabicInstaller-macos-universal.dmg"]')
    .replace('Download the zip, unzip it and run <Code>VencordInstaller.app</Code>!', 'Download the DMG, open it and run <Code>Vencord Arabic Installer</Code>!')
    .replaceAll("VencordInstaller.app", "Vencord Arabic Installer");
write("src/components/pages/download/MacTab.astro", mac);

let browser = read("src/components/pages/download/BrowserTab.astro")
    .replace("You can download Vencord from the Chrome Store or use the\n            Userscript.", "You can download the Vencord Arabic Chromium extension or use the\n            Userscript.")
    .replace("Install the extension from the <a", "Download the extension from <a")
    .replace("Chrome Webstore\n                        </a>.", "GitHub\n                        </a>, unzip it, enable Developer Mode in your browser's extensions page, then choose Load unpacked.")
    .replaceAll('href="/discord"', 'href="https://github.com/ShadowUR0/Vencord/issues"');
write("src/components/pages/download/BrowserTab.astro", browser);

// Footer: keep the original design/theme toggle but make source links truthful.
let footer = read("src/components/Footer.astro")
    .replace('href="/source"', 'href="https://github.com/ShadowUR0/Vencord/tree/main/site-vencord"')
    .replace('href="/github"', 'href="https://github.com/ShadowUR0/Vencord"')
    .replace('href="/discord"', 'href="https://github.com/ShadowUR0/Vencord/issues"')
    .replace('href="/twitter"', 'href="https://github.com/ShadowUR0/Vencord"')
    .replace('href="/donate"', 'href="https://github.com/Vencord/vencord.dev"')
    .replaceAll("Vencord's", "Vencord Arabic's")
    .replace("Discord is trademark of Discord Inc. Vencord is not\n                    affiliated with or endorsed by Discord Inc.", "Discord is trademark of Discord Inc. Vencord Arabic is an unofficial fork and is not affiliated with Discord Inc. or the official Vencord project.");
write("src/components/Footer.astro", footer);

// Prefix root-relative static assets for project GitHub Pages.
for (const dir of ["src"]) {
    const walk = d => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, entry.name);
            if (entry.isDirectory()) walk(p);
            else if (/\.(astro|svelte|ts|css|mdx?)$/.test(entry.name)) {
                let text = fs.readFileSync(p, "utf8");
                text = text
                    .replaceAll('"/assets/', '"/Vencord/assets/')
                    .replaceAll("'/assets/", "'/Vencord/assets/")
                    .replaceAll('url("/assets/', 'url("/Vencord/assets/')
                    .replaceAll('"/fonts/', '"/Vencord/fonts/')
                    .replaceAll('href="/sitemap-index.xml"', 'href="/Vencord/sitemap-index.xml"');
                fs.writeFileSync(p, text);
            }
        }
    };
    walk(path.join(root, dir));
}

console.log("Applied Vencord Arabic overrides on top of upstream vencord.dev");

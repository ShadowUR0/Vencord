<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import { IS_SERVER } from "@scripts/constants";

    interface Props {
        title?: Snippet;
        windowsTab?: Snippet;
        linuxTab?: Snippet;
        macTab?: Snippet;
        browserTab?: Snippet;
    }

    const { title, windowsTab, linuxTab, macTab, browserTab }: Props = $props();

    const options = $derived([
        { id: "Windows", label: "ويندوز", render: windowsTab },
        { id: "Linux", label: "لينكس", render: linuxTab },
        { id: "Mac", label: "ماك", render: macTab },
        { id: "Browser", label: "المتصفح", render: browserTab },
    ] as const);

    const accents: Record<string, string> = {
        Windows: "Blue",
        Linux: "Green",
        Mac: "Yellow",
        Browser: "Orange",
    };

    const initialValue: string = IS_SERVER
        ? "Windows"
        : (() => {
              const hash = location.hash.slice(1).toLowerCase();
              const hashOption = options.find(o => o.id.toLowerCase() === hash);
              if (hashOption) return hashOption.id;

              const stored = localStorage.platform;
              if (stored && options.some(o => o.id === stored)) return stored;

              const platform = navigator.platform.toLowerCase();
              if (platform.includes("linux")) return "Linux";
              if (platform.includes("mac")) return "Mac";
              return "Windows";
          })();

    let selected = $state(initialValue);
    let initialized = false;
    let isPopstate = false;

    $effect(() => {
        localStorage.platform = selected;
        const url = `#${selected.toLowerCase()}`;
        if (!initialized) {
            history.replaceState(null, "", url);
            initialized = true;
        } else if (isPopstate) {
            isPopstate = false;
        } else {
            history.pushState(null, "", url);
        }
    });

    onMount(() => {
        function onNavigate() {
            const hash = location.hash.slice(1).toLowerCase();
            const match = options.find(o => o.id.toLowerCase() === hash);
            if (match) {
                isPopstate = true;
                selected = match.id;
            }
        }

        window.addEventListener("popstate", onNavigate);
        window.addEventListener("hashchange", onNavigate);
        return () => {
            window.removeEventListener("popstate", onNavigate);
            window.removeEventListener("hashchange", onNavigate);
        };
    });
</script>

<div class="container">
    {@render title?.()}

    <div class="downloads">
        {#each options as { id, label }}
            <input
                id={`${id}-radio`}
                type="radio"
                name="os"
                bind:group={selected}
                value={id}
            />
            <label
                for={`${id}-radio`}
                style="--accent: var(--accent{accents[id]})"
            >
                {label}
            </label>
        {/each}

        {#each options as { id, render }}
            <section class="download-section" data-platform={id}>
                {@render render!()}
            </section>
        {/each}
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }

    .downloads {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(4, 1fr);
        margin-bottom: 1rem;
    }

    section {
        width: 100%;
        box-sizing: border-box;
        background-color: var(--bgCurrentWord);
        padding: 1rem;
        border-radius: var(--border-xl);
    }

    label {
        font-size: 1em;
        font-weight: var(--fontWeightSemiBold);
        letter-spacing: 0;
        padding: 1.25em 1.5rem;
        text-align: center;
        cursor: pointer;
        border-radius: var(--border-lg);
        background-color: var(--bg3);
    }

    @media screen and (max-width: 600px) {
        label { padding: 0.5em 0.75em; }
    }

    @media screen and (max-width: 400px) {
        .downloads { grid-template-columns: repeat(2, 1fr); }
        label { padding: 1em 0.75em; }
    }

    input { display: none; }

    input:checked + label {
        background-color: var(--accent);
        color: var(--bg2);
    }

    .download-section {
        display: none;
        grid-column: 1 / -1;
        opacity: 0;
        transition: opacity 150ms ease, display 0ms allow-discrete;
    }

    #Windows-radio:checked ~ .download-section[data-platform="Windows"],
    #Linux-radio:checked ~ .download-section[data-platform="Linux"],
    #Mac-radio:checked ~ .download-section[data-platform="Mac"],
    #Browser-radio:checked ~ .download-section[data-platform="Browser"] {
        display: block;
        opacity: 1;
        @starting-style { opacity: 0; }
    }
</style>

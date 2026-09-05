#!/bin/sh
set -eu

if [ "$(uname -s)" != "Linux" ]; then
    echo "This installer script is for Linux."
    exit 1
fi

if [ "$(id -u)" -eq 0 ]; then
    echo "Run me as a normal user, not root."
    exit 1
fi

if grep -q "CHROMEOS_RELEASE_NAME" /etc/lsb-release 2>/dev/null; then
    echo "ChromeOS is not supported by the desktop installer. Use the browser build instead:"
    echo "https://shadowur0.github.io/Vencord/#browser"
    exit 1
fi

case "$(uname -m)" in
    x86_64|amd64)
        asset="VencordArabicInstallerCli-linux-x86_64"
        ;;
    aarch64|arm64)
        asset="VencordArabicInstallerCli-linux-arm64"
        ;;
    *)
        echo "Unsupported CPU architecture: $(uname -m)"
        exit 1
        ;;
esac

outfile=$(mktemp "$HOME/.vencord-arabic-installer.XXXXXX")
trap 'rm -f "$outfile"' EXIT INT TERM

url="https://github.com/ShadowUR0/Installer/releases/download/latest/$asset"

echo "Downloading Vencord Arabic Installer..."
curl -fsSL "$url" -o "$outfile"
chmod +x "$outfile"

for elevate in sudo doas run0 pkexec; do
    if command -v "$elevate" >/dev/null 2>&1; then
        echo "Elevating with $elevate"
        "$elevate" env \
            "XDG_CONFIG_HOME=${XDG_CONFIG_HOME:-}" \
            "SUDO_USER=$(id -un)" \
            "$outfile" "$@"
        exit $?
    fi
done

echo "Please install sudo, doas, run0, or pkexec to continue."
exit 1

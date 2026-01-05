// Figma Bridge: The "Eyes" of Design Studio
// Maps Figma Design Tokens -> Egyptian Silk UI (Tailwind)

interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface FigmaNode {
    id: string;
    name: string;
    type: string;
    fills?: { type: string; color: FigmaColor }[];
    // Add other properties as needed (typography, spacing)
}

export class FigmaBridge {
    private personalAccessToken: string;

    constructor(token: string) {
        this.personalAccessToken = token;
    }

    async fetchDesignTokens(fileId: string) {
        const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
            headers: {
                'X-Figma-Token': this.personalAccessToken
            }
        });

        if (!response.ok) {
            throw new Error(`Figma API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return this.processNodes(data.document);
    }

    private processNodes(root: any) {
        const tokens = {
            colors: {} as Record<string, string>,
            // typography, spacing, etc.
        };

        // Recursive traversal to find defined styles or specific named nodes
        // For this prototype, we look for a "Design System" page or frame
        // Simplified: Just extract colors from any frame named "Colors"

        this.traverse(root, (node: FigmaNode) => {
            if (node.name === "Colors" && node.type === "FRAME") {
                // Extract children as colors
                // (Implementation detail would require traversing children)
            }

            // Direct mapping example:
            // If node name starts with "color/", treat as token
            if (node.name.startsWith("color/") && node.fills && node.fills[0]?.color) {
                const colorName = node.name.replace("color/", "");
                const hex = this.rgbaToHex(node.fills[0].color);
                tokens.colors[colorName] = hex;
            }
        });

        return tokens;
    }

    private traverse(node: any, callback: (n: FigmaNode) => void) {
        callback(node);
        if (node.children) {
            node.children.forEach((child: any) => this.traverse(child, callback));
        }
    }

    private rgbaToHex(color: FigmaColor): string {
        const toHex = (n: number) => {
            const hex = Math.round(n * 255).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
    }
}

// Usage Example:
// const bridge = new FigmaBridge(process.env.FIGMA_TOKEN!);
// const theme = await bridge.fetchDesignTokens("file_key");
// console.log(theme.colors); // -> { "primary": "#d4af37", "secondary": "#800000" }

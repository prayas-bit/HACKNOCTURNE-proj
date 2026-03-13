import path from 'path';

export function viteMetadataPlugin() {
    return {
        name: 'vite-plugin-metadata-injection',
        transform(code: string, id: string) {
            // Only process JSX/TSX files in the src directory
            if (!id.endsWith('.tsx') && !id.endsWith('.jsx')) return null;
            if (!id.includes('/src/')) return null;

            const relativePath = path.relative(process.cwd(), id).replace(/\\/g, '/');
            
            // Simple regex to find the first opening tag and inject the attribute
            // This is a simplified version for the demo
            const transformedCode = code.replace(
                /(<[a-zA-Z0-9]+)(\s|>)/,
                `$1 data-source-file="${relativePath}"$2`
            );

            return {
                code: transformedCode,
                map: null
            };
        }
    };
}

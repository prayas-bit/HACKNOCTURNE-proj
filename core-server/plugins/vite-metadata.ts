// The Build-time injection plugin
export function viteMetadataPlugin() {
    return {
        name: 'vite-plugin-metadata-injection',
        transform(code, id) {
            // Injection logic
            return code;
        }
    };
}

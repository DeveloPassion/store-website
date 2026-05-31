export const getSourceLabel = (url: string): string => {
    try {
        const host = new URL(url).hostname.replace(/^www\./, '')
        return host
    } catch {
        return 'Source'
    }
}

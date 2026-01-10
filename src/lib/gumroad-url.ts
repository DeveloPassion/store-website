/**
 * Build a Gumroad purchase URL with required parameters
 * @param url - Base Gumroad URL
 * @returns Complete Gumroad URL with ?wanted=true parameter
 */
export const buildGumroadUrl = (url: string | undefined): string => {
    if (!url) {
        return '#'
    }

    // Split URL into base and fragment
    const [baseUrl = '', fragment] = url.split('#')

    // Add wanted=true parameter to base URL
    const urlWithWanted = baseUrl.includes('?')
        ? `${baseUrl}&wanted=true`
        : `${baseUrl}?wanted=true`

    // Reattach fragment if it exists
    return fragment ? `${urlWithWanted}#${fragment}` : urlWithWanted
}

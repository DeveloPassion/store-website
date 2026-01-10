// Type augmentations for Bun test + jest-dom matchers

declare module 'bun:test' {
    interface Matchers {
        // jest-dom matchers
        toBeInTheDocument(): void
        toHaveAttribute(attr: string, value?: string | RegExp): void
        toHaveClass(...classNames: string[]): void
        toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): void
        toHaveValue(value: string | string[] | number): void
        toBeDisabled(): void
        toBeEnabled(): void
        toBeVisible(): void
        toBeChecked(): void
        toHaveFocus(): void
        toBeEmptyDOMElement(): void
        toBeInvalid(): void
        toBeRequired(): void
        toBeValid(): void
        toContainElement(element: HTMLElement | SVGElement | null): void
        toContainHTML(htmlText: string): void
        toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): void
        toHaveAccessibleName(expectedAccessibleName?: string | RegExp): void
        toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): void
        toHaveFormValues(expectedValues: Record<string, unknown>): void
        toHaveStyle(css: string | Record<string, unknown>): void
        toHaveErrorMessage(text?: string | RegExp): void
    }
}

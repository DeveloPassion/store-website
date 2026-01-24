// Global type declarations for test matchers

/// <reference types="@testing-library/jest-dom" />

// Extend bun test matchers with jest-dom matchers
declare global {
    namespace jest {
        interface Matchers<R = void> {
            toBeInTheDocument(): R
            toHaveAttribute(attr: string, value?: string | RegExp): R
            toHaveClass(...classNames: string[]): R
            toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R
            toHaveValue(value: string | string[] | number): R
            toBeDisabled(): R
            toBeEnabled(): R
            toBeVisible(): R
            toBeChecked(): R
            toHaveFocus(): R
        }
    }
}

export {}

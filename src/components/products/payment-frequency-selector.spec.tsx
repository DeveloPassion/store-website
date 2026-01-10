import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentFrequencySelector } from './payment-frequency-selector'

describe('PaymentFrequencySelector', () => {
    const mockOnChange = mock(() => {})

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    describe('Rendering', () => {
        it('should render monthly and yearly options', () => {
            const { getByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            expect(getByRole('button', { name: /monthly/i })).toBeDefined()
            expect(getByRole('button', { name: /yearly/i })).toBeDefined()
        })

        it('should return null when only one frequency available', () => {
            const { container } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            expect(container.firstChild).toBeNull()
        })

        it('should return null when no frequencies available', () => {
            const { container } = render(
                <PaymentFrequencySelector
                    frequencies={[]}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            expect(container.firstChild).toBeNull()
        })

        it('should render with custom className', () => {
            const { container } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                    className='custom-class'
                />
            )

            expect(container.firstChild).toHaveClass('custom-class')
        })

        it('should render billing frequency label', () => {
            const { getByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            expect(getByText(/billing frequency/i)).toBeDefined()
        })
    })

    describe('Selection State', () => {
        it('should highlight monthly button when monthly selected', () => {
            const { getByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            const monthlyButton = getByRole('button', { name: /monthly/i })
            expect(monthlyButton).toHaveAttribute('aria-pressed', 'true')
            expect(monthlyButton).toHaveClass('bg-primary')
        })

        it('should highlight yearly button when yearly selected', () => {
            const { getByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='yearly'
                    onChange={mockOnChange}
                />
            )

            const yearlyButton = getByRole('button', { name: /yearly/i })
            expect(yearlyButton).toHaveAttribute('aria-pressed', 'true')
            expect(yearlyButton).toHaveClass('bg-primary')
        })

        it('should not highlight monthly when yearly selected', () => {
            const { getByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='yearly'
                    onChange={mockOnChange}
                />
            )

            const monthlyButton = getByRole('button', { name: /monthly/i })
            expect(monthlyButton).toHaveAttribute('aria-pressed', 'false')
            expect(monthlyButton).not.toHaveClass('bg-primary')
        })
    })

    describe('User Interaction', () => {
        it('should call onChange when monthly button clicked', async () => {
            const user = userEvent.setup()
            const { getByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='yearly'
                    onChange={mockOnChange}
                />
            )

            const monthlyButton = getByRole('button', { name: /monthly/i })
            await user.click(monthlyButton)

            expect(mockOnChange).toHaveBeenCalledWith('monthly')
            expect(mockOnChange).toHaveBeenCalledTimes(1)
        })

        it('should call onChange when yearly button clicked', async () => {
            const user = userEvent.setup()
            const { getByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            const yearlyButton = getByRole('button', { name: /yearly/i })
            await user.click(yearlyButton)

            expect(mockOnChange).toHaveBeenCalledWith('yearly')
            expect(mockOnChange).toHaveBeenCalledTimes(1)
        })
    })

    describe('Savings Display', () => {
        it('should display savings badge when prices provided', () => {
            const { getByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                    monthlyPrice={10}
                    yearlyPrice={100}
                />
            )

            expect(getByText(/save \d+% with yearly/i)).toBeDefined()
        })

        it('should calculate savings percentage correctly', () => {
            // Monthly: €10, Yearly: €100 (instead of €120)
            // Savings: (1 - 100/(10*12)) * 100 = 16.67% ≈ 17%
            const { getByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                    monthlyPrice={10}
                    yearlyPrice={100}
                />
            )

            expect(getByText(/save 17% with yearly/i)).toBeDefined()
        })

        it('should not display savings badge when no prices provided', () => {
            const { queryByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            expect(queryByText(/save/i)).toBeNull()
        })

        it('should not display savings badge when yearly has no savings', () => {
            // Monthly: €10, Yearly: €120 (no savings)
            const { queryByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                    monthlyPrice={10}
                    yearlyPrice={120}
                />
            )

            expect(queryByText(/save/i)).toBeNull()
        })

        it('should show additional savings message when yearly selected', () => {
            const { getByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='yearly'
                    onChange={mockOnChange}
                    monthlyPrice={10}
                    yearlyPrice={100}
                />
            )

            expect(getByText(/smart choice!/i)).toBeDefined()
            expect(getByText(/you're saving 17%/i)).toBeDefined()
        })

        it('should not show additional savings message when monthly selected', () => {
            const { queryByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                    monthlyPrice={10}
                    yearlyPrice={100}
                />
            )

            expect(queryByText(/smart choice!/i)).toBeNull()
        })
    })

    describe('Accessibility', () => {
        it('should have proper aria-pressed attributes', () => {
            const { getByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            const monthlyButton = getByRole('button', { name: /monthly/i })
            const yearlyButton = getByRole('button', { name: /yearly/i })

            expect(monthlyButton).toHaveAttribute('aria-pressed', 'true')
            expect(yearlyButton).toHaveAttribute('aria-pressed', 'false')
        })

        it('should have button type set to button', () => {
            const { getAllByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            const buttons = getAllByRole('button')
            buttons.forEach((button) => {
                expect(button).toHaveAttribute('type', 'button')
            })
        })
    })

    describe('Edge Cases', () => {
        it('should handle extreme savings percentages', () => {
            // Monthly: €10, Yearly: €10 (91.67% savings)
            const { getByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                    monthlyPrice={10}
                    yearlyPrice={10}
                />
            )

            expect(getByText(/save 92% with yearly/i)).toBeDefined()
        })

        it('should handle fractional savings percentages', () => {
            // Monthly: €7.50, Yearly: €80
            // Savings: (1 - 80/(7.5*12)) * 100 = 11.11% ≈ 11%
            const { getByText } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'yearly']}
                    selected='monthly'
                    onChange={mockOnChange}
                    monthlyPrice={7.5}
                    yearlyPrice={80}
                />
            )

            expect(getByText(/save 11% with yearly/i)).toBeDefined()
        })

        it('should handle only yearly frequency', () => {
            const { queryByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['yearly']}
                    selected='yearly'
                    onChange={mockOnChange}
                />
            )

            // Should not render anything (only one option)
            expect(queryByRole('button')).toBeNull()
        })

        it('should handle monthly frequency without yearly', () => {
            const { getByRole, queryByRole } = render(
                <PaymentFrequencySelector
                    frequencies={['monthly', 'one-time']}
                    selected='monthly'
                    onChange={mockOnChange}
                />
            )

            expect(getByRole('button', { name: /monthly/i })).toBeDefined()
            expect(queryByRole('button', { name: /yearly/i })).toBeNull()
        })
    })
})

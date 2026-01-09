import { useEffect } from 'react'
import { Link } from 'react-router'
import {
    FaArrowLeft,
    FaQuestionCircle,
    FaEnvelope,
    FaBook,
    FaUndo,
    FaFileInvoice
} from 'react-icons/fa'
import Section from '@/components/ui/section'

const HelpPage: React.FC = () => {
    // Set page title and meta tags
    useEffect(() => {
        document.title = 'Help - Knowledge Forge'

        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Get assistance with your purchases and products. Contact support for issues, refunds, or product questions.'
            )
        }

        // Reset og:image to default for generic pages
        const ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) {
            ogImage.setAttribute(
                'content',
                'https://store.dsebastien.net/assets/images/social-card.png'
            )
        }

        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
            ogTitle.setAttribute('content', 'Help - Knowledge Forge')
        }

        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute('content', 'Get assistance with your purchases and products')
        }

        const ogUrl = document.querySelector('meta[property="og:url"]')
        if (ogUrl) {
            ogUrl.setAttribute('content', 'https://store.dsebastien.net/help')
        }
    }, [])

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-4xl'>
                    <Link
                        to='/'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Products
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaQuestionCircle className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Help</h1>
                            <p className='text-primary/70 mt-1'>
                                Get assistance with your purchases and products
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Content */}
            <Section className='pb-16 sm:pb-24'>
                <div className='mx-auto max-w-4xl'>
                    <div className='space-y-8'>
                        {/* Purchase Issues */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaEnvelope className='text-secondary h-5 w-5' />
                                </div>
                                <div>
                                    <h2 className='mb-2 text-xl font-semibold'>
                                        Problems with a Purchase
                                    </h2>
                                    <p className='text-primary/70 mb-4'>
                                        If you're experiencing any issues with your purchase,
                                        payment, or download, I'm here to help.
                                    </p>
                                    <a
                                        href='mailto:sebastien@developassion.be?subject=Purchase Issue'
                                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors'
                                    >
                                        <FaEnvelope className='h-4 w-4' />
                                        Contact Me
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Refund Requests */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaUndo className='text-secondary h-5 w-5' />
                                </div>
                                <div>
                                    <h2 className='mb-2 text-xl font-semibold'>Refund Requests</h2>
                                    <p className='text-primary/70 mb-4'>
                                        I offer a 30-day money-back guarantee on all products. If
                                        you're not satisfied with your purchase, let me know and
                                        I'll process your refund promptly.
                                    </p>
                                    <a
                                        href='mailto:sebastien@developassion.be?subject=Refund Request'
                                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors'
                                    >
                                        <FaEnvelope className='h-4 w-4' />
                                        Request a Refund
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Requests */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaFileInvoice className='text-secondary h-5 w-5' />
                                </div>
                                <div>
                                    <h2 className='mb-2 text-xl font-semibold'>Need an Invoice?</h2>
                                    <p className='text-primary/70 mb-4'>
                                        All purchases are processed through Gumroad. To get an
                                        invoice for your purchase:
                                    </p>
                                    <ol className='text-primary/70 mb-4 list-inside list-decimal space-y-2'>
                                        <li>
                                            Check your email for the purchase receipt from Gumroad
                                        </li>
                                        <li>
                                            Click the "View receipt" or "View invoice" link in the
                                            email
                                        </li>
                                        <li>
                                            You can download or print your invoice from the Gumroad
                                            receipt page
                                        </li>
                                    </ol>
                                    <p className='text-primary/70 mb-4'>
                                        If you can't find your receipt email or need additional
                                        help, visit the{' '}
                                        <a
                                            href='https://gumroad.com/help/article/194-i-need-an-invoice'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-secondary hover:text-secondary-text underline transition-colors'
                                        >
                                            Gumroad invoice help guide
                                        </a>{' '}
                                        or contact me directly.
                                    </p>
                                    <a
                                        href='mailto:sebastien@developassion.be?subject=Invoice Request'
                                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors'
                                    >
                                        <FaEnvelope className='h-4 w-4' />
                                        Request Invoice Help
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Product Support */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaBook className='text-secondary h-5 w-5' />
                                </div>
                                <div>
                                    <h2 className='mb-2 text-xl font-semibold'>
                                        Product Support & Questions
                                    </h2>
                                    <p className='text-primary/70 mb-4'>
                                        If you need help with a product you've purchased:
                                    </p>
                                    <ol className='text-primary/70 mb-6 list-inside list-decimal space-y-2'>
                                        <li>
                                            Check the product documentation included with your
                                            purchase
                                        </li>
                                        <li>
                                            Visit the product page on this website for additional
                                            resources
                                        </li>
                                        <li>
                                            Ask in the dedicated{' '}
                                            <a
                                                href='https://knowii.net'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-secondary hover:text-secondary-text underline transition-colors'
                                            >
                                                Knowii Community channels
                                            </a>
                                        </li>
                                        <li>
                                            If you still need help, send me an email with details
                                            about your issue
                                        </li>
                                    </ol>
                                    <a
                                        href='mailto:sebastien@developassion.be?subject=Product Support'
                                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors'
                                    >
                                        <FaEnvelope className='h-4 w-4' />
                                        Get Product Support
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* General Contact */}
                        <div className='bg-primary/5 rounded-lg p-6 sm:p-8'>
                            <h2 className='mb-2 text-xl font-semibold'>Other Questions?</h2>
                            <p className='text-primary/70 mb-4'>
                                For any other inquiries, feedback, or suggestions, feel free to
                                reach out. I typically respond within 24-48 hours.
                            </p>
                            <a
                                href='mailto:sebastien@developassion.be'
                                className='text-secondary hover:text-secondary-text inline-flex items-center gap-2 font-semibold transition-colors'
                            >
                                <FaEnvelope className='h-4 w-4' />
                                sebastien@developassion.be
                            </a>
                        </div>

                        {/* Additional Resources */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <h2 className='mb-4 text-xl font-semibold'>Additional Resources</h2>
                            <ul className='space-y-3'>
                                <li>
                                    <a
                                        href='https://www.dsebastien.net'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text transition-colors'
                                    >
                                        → Visit my main website
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://www.dsebastien.net/newsletter'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text transition-colors'
                                    >
                                        → Subscribe to my newsletter
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    )
}

export default HelpPage

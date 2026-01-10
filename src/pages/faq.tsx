import { useEffect } from 'react'
import {
    FaQuestionCircle,
    FaShoppingCart,
    FaShieldAlt,
    FaCreditCard,
    FaLock,
    FaGlobe,
    FaExternalLinkAlt
} from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

const FAQPage: React.FC = () => {
    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'FAQ' }])

    // Set page title and meta tags
    useEffect(() => {
        document.title = 'Frequently Asked Questions - Knowledge Forge'

        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Learn about our store, why we use Gumroad for secure payments, and how the shopping experience works.'
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
            ogTitle.setAttribute('content', 'Frequently Asked Questions - Knowledge Forge')
        }

        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute(
                'content',
                'Learn about our store, why we use Gumroad for secure payments, and how the shopping experience works.'
            )
        }

        const ogUrl = document.querySelector('meta[property="og:url"]')
        if (ogUrl) {
            ogUrl.setAttribute('content', 'https://store.dsebastien.net/faq')
        }
    }, [])

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-4xl'>
                    <Breadcrumb />
                    <div className='flex items-center gap-4'>
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaQuestionCircle className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Frequently Asked Questions
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Everything you need to know about shopping here
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Content */}
            <Section className='pb-16 sm:pb-24'>
                <div className='mx-auto max-w-4xl'>
                    <div className='space-y-8'>
                        {/* Why Cart Opens in New Tab */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaShoppingCart className='text-secondary h-5 w-5' />
                                </div>
                                <div className='flex-1'>
                                    <h2 className='mb-2 text-xl font-semibold'>
                                        Why does the shopping cart open in a new tab?
                                    </h2>
                                    <p className='text-primary/70 mb-3'>
                                        All products on this store are sold through{' '}
                                        <a
                                            href='https://gumroad.com'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-secondary hover:text-secondary-text inline-flex items-center gap-1 transition-colors'
                                        >
                                            Gumroad
                                            <FaExternalLinkAlt className='h-3 w-3' />
                                        </a>
                                        , a trusted e-commerce platform. When you click the shopping
                                        cart icon, it opens Gumroad's secure checkout page in a new
                                        tab.
                                    </p>
                                    <p className='text-primary/70'>
                                        This happens because Gumroad handles all payment processing
                                        on their own secure servers, which cannot be embedded in an
                                        iframe for security reasons. This design protects your
                                        payment information and prevents malicious websites from
                                        intercepting your transactions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Why We Use Gumroad */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaShieldAlt className='text-secondary h-5 w-5' />
                                </div>
                                <div className='flex-1'>
                                    <h2 className='mb-3 text-xl font-semibold'>
                                        Why do we use Gumroad?
                                    </h2>
                                    <p className='text-primary/70 mb-4'>
                                        Gumroad is a trusted platform used by thousands of creators
                                        worldwide. Here's why it's the perfect choice for this
                                        store:
                                    </p>
                                    <div className='space-y-4'>
                                        <div className='flex items-start gap-3'>
                                            <FaLock className='text-secondary mt-1 h-5 w-5 shrink-0' />
                                            <div>
                                                <h3 className='mb-1 font-semibold'>
                                                    Bank-Level Security
                                                </h3>
                                                <p className='text-primary/70 text-sm'>
                                                    Gumroad is PCI DSS Level 1 compliant, meaning
                                                    your payment information is protected with the
                                                    highest industry security standards. Your credit
                                                    card details never touch our servers.
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-start gap-3'>
                                            <FaCreditCard className='text-secondary mt-1 h-5 w-5 shrink-0' />
                                            <div>
                                                <h3 className='mb-1 font-semibold'>
                                                    Secure Payment Processing
                                                </h3>
                                                <p className='text-primary/70 text-sm'>
                                                    All payments are processed through Stripe and
                                                    PayPal, two of the most trusted payment
                                                    processors in the world. Gumroad accepts credit
                                                    cards, debit cards, PayPal, Apple Pay, and
                                                    Google Pay.
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-start gap-3'>
                                            <FaGlobe className='text-secondary mt-1 h-5 w-5 shrink-0' />
                                            <div>
                                                <h3 className='mb-1 font-semibold'>
                                                    Global Infrastructure
                                                </h3>
                                                <p className='text-primary/70 text-sm'>
                                                    Gumroad handles tax compliance, VAT collection,
                                                    and international payments automatically. This
                                                    means you can purchase from anywhere in the
                                                    world without worrying about complex tax
                                                    regulations.
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-start gap-3'>
                                            <FaShieldAlt className='text-secondary mt-1 h-5 w-5 shrink-0' />
                                            <div>
                                                <h3 className='mb-1 font-semibold'>
                                                    Buyer Protection
                                                </h3>
                                                <p className='text-primary/70 text-sm'>
                                                    Gumroad provides dispute resolution and fraud
                                                    protection. All purchases come with a 30-day
                                                    money-back guarantee, and refunds are processed
                                                    quickly and securely.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How Shopping Works */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaShoppingCart className='text-secondary h-5 w-5' />
                                </div>
                                <div className='flex-1'>
                                    <h2 className='mb-3 text-xl font-semibold'>
                                        How does shopping work?
                                    </h2>
                                    <ol className='text-primary/70 space-y-3'>
                                        <li className='flex gap-3'>
                                            <span className='bg-secondary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                                                1
                                            </span>
                                            <span>
                                                <strong>Browse products</strong> on this website and
                                                click "Quick Open" or view the product detail page
                                            </span>
                                        </li>
                                        <li className='flex gap-3'>
                                            <span className='bg-secondary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                                                2
                                            </span>
                                            <span>
                                                <strong>Click "Buy Now"</strong> to add items to
                                                your Gumroad cart (opens in a new tab)
                                            </span>
                                        </li>
                                        <li className='flex gap-3'>
                                            <span className='bg-secondary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                                                3
                                            </span>
                                            <span>
                                                <strong>View your cart</strong> by clicking the cart
                                                icon in the header or via the command palette using
                                                '/' (opens Gumroad checkout in a new tab)
                                            </span>
                                        </li>
                                        <li className='flex gap-3'>
                                            <span className='bg-secondary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                                                4
                                            </span>
                                            <span>
                                                <strong>Complete your purchase</strong> on Gumroad's
                                                secure checkout page using your preferred payment
                                                method
                                            </span>
                                        </li>
                                        <li className='flex gap-3'>
                                            <span className='bg-secondary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                                                5
                                            </span>
                                            <span>
                                                <strong>Receive instant access</strong> - After
                                                payment, you'll immediately receive an email with
                                                download links and access instructions
                                            </span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Payment & Security */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaLock className='text-secondary h-5 w-5' />
                                </div>
                                <div className='flex-1'>
                                    <h2 className='mb-2 text-xl font-semibold'>
                                        Is my payment information secure?
                                    </h2>
                                    <p className='text-primary/70 mb-3'>
                                        Absolutely. Your payment information is handled exclusively
                                        by Gumroad, Stripe, and PayPal - never by this website.
                                        These platforms use:
                                    </p>
                                    <ul className='text-primary/70 space-y-2 text-sm'>
                                        <li>• 256-bit SSL encryption for all data transmission</li>
                                        <li>
                                            • PCI DSS Level 1 compliance (highest security
                                            certification)
                                        </li>
                                        <li>• Tokenization to protect credit card numbers</li>
                                        <li>• Advanced fraud detection and prevention systems</li>
                                        <li>• Two-factor authentication support</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Gumroad Account */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <div className='mb-4 flex items-start gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                    <FaQuestionCircle className='text-secondary h-5 w-5' />
                                </div>
                                <div className='flex-1'>
                                    <h2 className='mb-2 text-xl font-semibold'>
                                        Do I need a Gumroad account?
                                    </h2>
                                    <p className='text-primary/70 mb-3'>
                                        No, you don't need to create a Gumroad account to make a
                                        purchase. However, creating a free Gumroad account offers
                                        several benefits:
                                    </p>
                                    <ul className='text-primary/70 space-y-2 text-sm'>
                                        <li>
                                            • Access all your purchases in one place (Gumroad
                                            Library)
                                        </li>
                                        <li>• Automatic product updates and new versions</li>
                                        <li>• Easy re-downloads if you lose files</li>
                                        <li>• Purchase history and invoices</li>
                                        <li>• Faster checkout for future purchases</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Refunds & Guarantees */}
                        <div className='bg-primary/5 rounded-lg p-6 sm:p-8'>
                            <h2 className='mb-3 text-xl font-semibold'>
                                What about refunds and guarantees?
                            </h2>
                            <p className='text-primary/70 mb-3'>
                                All products come with a{' '}
                                <strong>30-day money-back guarantee</strong>. If you're not
                                satisfied with your purchase for any reason, simply contact me
                                within 30 days and I'll process a full refund through Gumroad.
                            </p>
                            <p className='text-primary/70 text-sm'>
                                For refund requests or purchase issues, please email{' '}
                                <a
                                    href='mailto:sebastien@developassion.be'
                                    className='text-secondary hover:text-secondary-text transition-colors'
                                >
                                    sebastien@developassion.be
                                </a>
                            </p>
                        </div>

                        {/* Still Have Questions */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <h2 className='mb-2 text-xl font-semibold'>Still have questions?</h2>
                            <p className='text-primary/70 mb-4'>
                                If you have any other questions about purchasing, security, or how
                                the store works, feel free to reach out. I'm here to help!
                            </p>
                            <div className='flex flex-wrap gap-3'>
                                <a
                                    href='mailto:sebastien@developassion.be'
                                    className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors'
                                >
                                    Contact Me
                                </a>
                                <a
                                    href='https://help.gumroad.com'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='bg-primary/10 hover:bg-primary/20 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors'
                                >
                                    Gumroad Help Center
                                    <FaExternalLinkAlt className='h-3 w-3' />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    )
}

export default FAQPage

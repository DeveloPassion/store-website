import { useEffect } from 'react'
import { FaQuestionCircle, FaExternalLinkAlt } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import QuickNavigation from '@/components/navigation/quick-navigation'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { updateAllMetaTags } from '@/lib/update-meta-tags'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import globalFaqData from '@/data/faq-global.json'
import type { GlobalFAQ } from '@/schemas/global-faq.schema'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTimeOnPage } from '@/hooks/use-time-on-page'

// FAQ Item component for rendering individual FAQ entries
const FAQItem: React.FC<{ faq: GlobalFAQ }> = ({ faq }) => {
    const isHighlight = faq.style === 'highlight'

    return (
        <div
            className={`rounded-lg p-6 sm:p-8 ${
                isHighlight ? 'bg-primary/5' : 'border-primary/10 border'
            }`}
        >
            <div className='flex items-start gap-3'>
                {faq.icon && (
                    <div className='bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                        <DynamicIcon
                            iconName={faq.icon}
                            size='sm'
                            className='text-secondary'
                            useBrandColors={false}
                        />
                    </div>
                )}
                <div className='flex-1'>
                    <h2 className='mb-2 text-xl font-semibold'>{faq.question}</h2>
                    <MarkdownContent content={faq.answer} className='text-primary/70 mb-3' />

                    {/* Features (sub-items with icons) */}
                    {faq.features && faq.features.length > 0 && (
                        <div className='mt-4 space-y-4'>
                            {faq.features.map((feature, index) => (
                                <div key={index} className='flex items-start gap-3'>
                                    <DynamicIcon
                                        iconName={feature.icon}
                                        size='sm'
                                        className='text-secondary mt-1 shrink-0'
                                        useBrandColors={false}
                                    />
                                    <div>
                                        <h3 className='mb-1 font-semibold'>{feature.title}</h3>
                                        <MarkdownContent
                                            content={feature.description}
                                            className='text-primary/70 text-sm'
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Ordered steps */}
                    {faq.steps && faq.steps.length > 0 && (
                        <ol className='text-primary/70 mt-3 space-y-3'>
                            {faq.steps.map((step, index) => (
                                <li key={index} className='flex gap-3'>
                                    <span className='bg-secondary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                                        {index + 1}
                                    </span>
                                    <span>
                                        <strong>{step.title}</strong>{' '}
                                        <MarkdownContent content={step.description} inline />
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}

                    {/* Bullet points */}
                    {faq.bullets && faq.bullets.length > 0 && (
                        <ul className='text-primary/70 mt-3 space-y-2 text-sm'>
                            {faq.bullets.map((bullet, index) => (
                                <li key={index} className='flex gap-2'>
                                    <span>•</span>
                                    <MarkdownContent content={bullet} inline />
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Additional text */}
                    {faq.additionalText && (
                        <MarkdownContent
                            content={faq.additionalText}
                            className='text-primary/70 mt-3 text-sm'
                        />
                    )}

                    {/* Links */}
                    {faq.links && faq.links.length > 0 && (
                        <div className='mt-4 flex flex-wrap gap-3'>
                            {faq.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target={link.external ? '_blank' : undefined}
                                    rel={link.external ? 'noopener' : undefined}
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
                                        link.primary
                                            ? 'bg-secondary hover:bg-secondary/90 text-white'
                                            : 'bg-primary/10 hover:bg-primary/20'
                                    }`}
                                >
                                    {link.label}
                                    {link.external && <FaExternalLinkAlt className='h-3 w-3' />}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const FAQPage: React.FC = () => {
    // Scroll and time tracking
    useScrollTracking({ pageType: 'faq' })
    useTimeOnPage({ pageType: 'faq' })

    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'FAQ' }])

    // Set page title and meta tags
    useEffect(() => {
        updateAllMetaTags({
            title: 'Frequently Asked Questions - Knowledge Forge',
            description:
                'Learn about our store, why we use Gumroad for secure payments, and how the shopping experience works.',
            url: 'https://store.dsebastien.net/faq'
        })
    }, [])

    // Sort FAQs by order
    const sortedFaqs = [...(globalFaqData.data as GlobalFAQ[])].sort((a, b) => a.order - b.order)

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-4xl'>
                    <Breadcrumb className='mb-6 flex justify-center' />
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
                        {sortedFaqs.map((faq) => (
                            <FAQItem key={faq.id} faq={faq} />
                        ))}

                        {/* Still Have Questions - Static element */}
                        <div className='border-primary/10 rounded-lg border p-6 sm:p-8'>
                            <h2 className='mb-2 text-xl font-semibold'>Still have questions?</h2>
                            <p className='text-primary/70 mb-4'>
                                If you have any other questions about purchasing, security, or how
                                the store works, feel free to reach out. I&apos;m here to help!
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

            {/* Quick Navigation CTA */}
            <Section className='border-primary/10 bg-primary/5 border-t border-b py-0'>
                <QuickNavigation
                    title='Ready to Start Shopping?'
                    description='Now that you know how it works, explore our collections'
                />
            </Section>
        </>
    )
}

export default FAQPage

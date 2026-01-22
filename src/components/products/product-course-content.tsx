import { Disclosure } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
    FaChevronDown,
    FaClock,
    FaGraduationCap,
    FaCheckCircle,
    FaLayerGroup,
    FaPlayCircle
} from 'react-icons/fa'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { cn } from '@/lib/utils'
import { isEmoji } from '@/lib/is-emoji'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import type { Product } from '@/schemas/product.schema'

interface ProductCourseContentProps {
    product: Product
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: 'Beginner', color: 'bg-green-500/20 text-green-400' },
    intermediate: { label: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400' },
    advanced: { label: 'Advanced', color: 'bg-red-500/20 text-red-400' }
}

const ProductCourseContent: React.FC<ProductCourseContentProps> = ({ product }) => {
    const courseContent = product.salesCopy?.courseContent

    // Call hooks before any conditional returns (React hooks rule)
    const { containerVariants, itemVariants } = useAnimationVariants({
        staggerDelay: 0.05,
        itemYOffset: 10
    })

    // Conditional render - return null if no course content
    if (!courseContent?.modules?.length) return null

    const title = courseContent.sectionTitle || "What's Inside the Course"
    const description = courseContent.sectionDescription
    const totalModules = courseContent.modules.length
    const totalSections = courseContent.modules.reduce(
        (acc, module) => acc + (module.sections?.length || 0),
        0
    )

    return (
        <Section id='course-content' className='border-primary/10 border-t'>
            <div className='mx-auto max-w-4xl'>
                {/* Header */}
                <SectionHeader
                    title={title}
                    subtitle={description ?? undefined}
                    icon={
                        courseContent.sectionIcon ? (
                            isEmoji(courseContent.sectionIcon) ? (
                                <span className='text-3xl'>{courseContent.sectionIcon}</span>
                            ) : (
                                <DynamicIcon
                                    iconName={courseContent.sectionIcon}
                                    size='lg'
                                    className='text-secondary'
                                    useBrandColors={false}
                                />
                            )
                        ) : (
                            <FaGraduationCap className='text-secondary h-8 w-8' />
                        )
                    }
                />

                {/* Meta badges */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-8 flex flex-wrap items-center justify-center gap-3'
                >
                    {courseContent.totalDuration && (
                        <span className='bg-secondary/10 text-secondary inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium'>
                            <FaClock className='h-4 w-4' />
                            {courseContent.totalDuration}
                        </span>
                    )}
                    {courseContent.difficulty &&
                        (() => {
                            const difficultyInfo = difficultyLabels[courseContent.difficulty]
                            return difficultyInfo ? (
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium',
                                        difficultyInfo.color
                                    )}
                                >
                                    {difficultyInfo.label}
                                </span>
                            ) : null
                        })()}
                    <span className='bg-primary/10 text-primary/80 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium'>
                        <FaLayerGroup className='h-4 w-4' />
                        {totalModules} {totalModules === 1 ? 'module' : 'modules'} &middot;{' '}
                        {totalSections} {totalSections === 1 ? 'lesson' : 'lessons'}
                    </span>
                </motion.div>

                {/* Prerequisites */}
                {courseContent.prerequisites && courseContent.prerequisites.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='border-primary/10 bg-background/50 mb-8 rounded-lg border p-6'
                    >
                        <h3 className='text-primary/60 mb-3 text-sm font-semibold tracking-wider uppercase'>
                            Prerequisites
                        </h3>
                        <ul className='space-y-2'>
                            {courseContent.prerequisites.map((prereq, index) => (
                                <li
                                    key={index}
                                    className='text-primary/80 flex items-center gap-2 text-sm'
                                >
                                    <FaCheckCircle className='h-4 w-4 shrink-0 text-green-400' />
                                    <MarkdownContent content={prereq} inline />
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Modules Accordion */}
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className='space-y-3'
                >
                    {courseContent.modules.map((module, moduleIndex) => (
                        <motion.div key={moduleIndex} variants={itemVariants}>
                            <Disclosure>
                                {({ open }) => (
                                    <div
                                        className={cn(
                                            'border-primary/10 bg-background/50 overflow-hidden rounded-lg border transition-all',
                                            open && 'ring-secondary/30 ring-2 ring-inset'
                                        )}
                                    >
                                        <Disclosure.Button className='hover:bg-primary/5 flex w-full items-center gap-4 px-6 py-4 text-left transition-colors'>
                                            {/* Module icon/number */}
                                            <div className='bg-secondary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                                {module.icon ? (
                                                    isEmoji(module.icon) ? (
                                                        <span className='text-lg'>
                                                            {module.icon}
                                                        </span>
                                                    ) : (
                                                        <DynamicIcon
                                                            iconName={module.icon}
                                                            size='sm'
                                                            className='text-secondary'
                                                            useBrandColors={false}
                                                        />
                                                    )
                                                ) : (
                                                    <span className='text-secondary text-sm font-bold'>
                                                        {moduleIndex + 1}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Module info */}
                                            <div className='min-w-0 flex-1'>
                                                <h3 className='font-semibold break-words text-white'>
                                                    {module.name}
                                                </h3>
                                                <div className='text-primary/50 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                                                    {module.duration && (
                                                        <span className='flex items-center gap-1'>
                                                            <FaClock className='h-3 w-3' />
                                                            {module.duration}
                                                        </span>
                                                    )}
                                                    <span>
                                                        {module.sections.length}{' '}
                                                        {module.sections.length === 1
                                                            ? 'lesson'
                                                            : 'lessons'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Chevron */}
                                            <FaChevronDown
                                                className={cn(
                                                    'text-secondary h-5 w-5 shrink-0 transition-transform duration-200',
                                                    open && 'rotate-180'
                                                )}
                                            />
                                        </Disclosure.Button>

                                        <Disclosure.Panel className='border-primary/10 border-t px-6 py-4'>
                                            {/* Module description */}
                                            {module.description && (
                                                <MarkdownContent
                                                    content={module.description}
                                                    autoDetect
                                                    className='text-primary/70 mb-4 leading-relaxed'
                                                />
                                            )}

                                            {/* Sections list */}
                                            <div className='space-y-2'>
                                                {module.sections.map((section, sectionIndex) => (
                                                    <div
                                                        key={sectionIndex}
                                                        className='hover:bg-primary/5 flex items-start gap-3 rounded-lg p-2 transition-colors'
                                                    >
                                                        {/* Section icon/number */}
                                                        <div className='bg-primary/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-md'>
                                                            {section.icon ? (
                                                                isEmoji(section.icon) ? (
                                                                    <span className='text-sm'>
                                                                        {section.icon}
                                                                    </span>
                                                                ) : (
                                                                    <DynamicIcon
                                                                        iconName={section.icon}
                                                                        size='sm'
                                                                        className='text-primary/60'
                                                                        useBrandColors={false}
                                                                    />
                                                                )
                                                            ) : (
                                                                <span className='text-primary/50 text-xs font-medium'>
                                                                    {sectionIndex + 1}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Section info */}
                                                        <div className='min-w-0 flex-1'>
                                                            <div className='flex items-center justify-between gap-2'>
                                                                {section.url ? (
                                                                    <a
                                                                        href={section.url}
                                                                        target='_blank'
                                                                        rel='noopener noreferrer'
                                                                        className='text-secondary hover:text-secondary-text group inline-flex items-center gap-1.5 text-sm font-medium transition-colors'
                                                                    >
                                                                        <FaPlayCircle className='h-3.5 w-3.5 shrink-0' />
                                                                        <span className='group-hover:underline'>
                                                                            {section.name}
                                                                        </span>
                                                                        <span className='bg-secondary/20 text-secondary rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase'>
                                                                            Free
                                                                        </span>
                                                                    </a>
                                                                ) : (
                                                                    <span className='text-primary/90 text-sm font-medium'>
                                                                        {section.name}
                                                                    </span>
                                                                )}
                                                                {section.duration && (
                                                                    <span className='text-primary/50 shrink-0 text-xs'>
                                                                        {section.duration}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {section.description && (
                                                                <MarkdownContent
                                                                    content={section.description}
                                                                    inline
                                                                    className='text-primary/50 mt-0.5 text-xs'
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Disclosure.Panel>
                                    </div>
                                )}
                            </Disclosure>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </Section>
    )
}

export default ProductCourseContent

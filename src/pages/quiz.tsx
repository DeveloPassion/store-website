import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaLightbulb,
    FaArrowRight,
    FaArrowLeft,
    FaRedo,
    FaStar,
    FaCheck,
    FaShoppingCart,
    FaChevronDown,
    FaChevronUp,
    FaShare
} from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import productsData from '@/data/products.json'
import quizQuestionsData from '@/data/quiz-questions.json'
import quizOverridesData from '@/data/quiz-product-scoring-overrides.json'
import type { Product } from '@/schemas/product.schema'
import type { QuizQuestionsData, QuizOverrides } from '@/schemas/quiz.schema'
import {
    createEmptyFilters,
    mergeFilters,
    matchProducts,
    applyResultOverrides
} from '@/lib/quiz-scoring'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { updateAllMetaTags } from '@/lib/update-meta-tags'
import { buildGumroadUrl } from '@/lib/gumroad-url'
import type { MediaItem } from '@/schemas/media.schema'
import {
    trackQuizStarted,
    trackQuizQuestionAnswered,
    trackQuizCompleted,
    trackQuizRecommendationClicked,
    trackQuizResultsShared
} from '@/lib/analytics'

// Type assertions for JSON imports
const quizQuestions = (quizQuestionsData as QuizQuestionsData).questions
const quizOverrides = quizOverridesData as QuizOverrides

// Get first cover image from media array
const getCoverImage = (media: MediaItem[] | undefined): MediaItem | undefined => {
    if (!media) return undefined
    return media
        .filter((item) => item.type === 'image')
        .sort((a, b) => {
            const priority: Record<string, number> = { cover: 0, main: 1, secondary: 2, bonus: 3 }
            return (
                (priority[a.group ?? ''] ?? 999) - (priority[b.group ?? ''] ?? 999) ||
                (a.order ?? 0) - (b.order ?? 0)
            )
        })[0]
}

interface ProductMatch {
    product: Product
    matchReasons: string[]
}

// Get all products that are not excluded from quiz
const allProducts = (productsData as Product[]).filter(
    (p) => !quizOverrides.excludedProductIds.includes(p.id)
)

// Helper to parse URL search string into initial state
function getInitialStateFromUrlString(searchString: string) {
    const searchParams = new URLSearchParams(searchString)
    const urlAnswers: Record<string, number> = {}
    let hasAnswers = false

    quizQuestions.forEach((q) => {
        const param = searchParams.get(q.id)
        if (param !== null) {
            const index = parseInt(param, 10)
            if (!isNaN(index) && index >= 0 && index < q.options.length) {
                urlAnswers[q.id] = index
                hasAnswers = true
            }
        }
    })

    if (!hasAnswers) {
        return { answers: {}, currentStep: 0, showResults: false }
    }

    const allAnswered = quizQuestions.every((q) => urlAnswers[q.id] !== undefined)
    if (allAnswered) {
        return {
            answers: urlAnswers,
            currentStep: quizQuestions.length - 1,
            showResults: true
        }
    }

    // Find first unanswered question
    const firstUnanswered = quizQuestions.findIndex((q) => urlAnswers[q.id] === undefined)
    return {
        answers: urlAnswers,
        currentStep: firstUnanswered >= 0 ? firstUnanswered : 0,
        showResults: false
    }
}

const QuizPage: React.FC = () => {
    // Use pre-filtered products (excludes products in excludedProductIds)
    const products = allProducts
    const [searchParams, setSearchParams] = useSearchParams()

    // Use lazy state initializer - capture URL at mount time via window.location.search
    const [quizState, setQuizState] = useState(() =>
        getInitialStateFromUrlString(window.location.search)
    )
    const { currentStep, answers, showResults } = quizState

    const setCurrentStep = useCallback((step: number | ((prev: number) => number)) => {
        setQuizState((prev) => ({
            ...prev,
            currentStep: typeof step === 'function' ? step(prev.currentStep) : step
        }))
    }, [])

    const setAnswers = useCallback(
        (
            newAnswers:
                | Record<string, number>
                | ((prev: Record<string, number>) => Record<string, number>)
        ) => {
            setQuizState((prev) => ({
                ...prev,
                answers: typeof newAnswers === 'function' ? newAnswers(prev.answers) : newAnswers
            }))
        },
        []
    )

    const setShowResults = useCallback((show: boolean | ((prev: boolean) => boolean)) => {
        setQuizState((prev) => ({
            ...prev,
            showResults: typeof show === 'function' ? show(prev.showResults) : show
        }))
    }, [])
    const [expandedAlternatives, setExpandedAlternatives] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const quizStartTrackedRef = useRef(false)
    const quizCompletionTrackedRef = useRef(false)

    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Product Quiz' }])

    // Update URL params when answers change
    useEffect(() => {
        const params = new URLSearchParams()
        Object.entries(answers).forEach(([questionId, optionIndex]) => {
            params.set(questionId, optionIndex.toString())
        })

        // Only update if params actually changed
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        if (newParamsString !== currentParamsString) {
            setSearchParams(params, { replace: true })
        }
    }, [answers, searchParams, setSearchParams])

    useEffect(() => {
        updateAllMetaTags({
            title: 'Product Quiz - Find Your Perfect Match - Knowledge Forge',
            description:
                'Answer a few questions to get personalized product recommendations based on your goals, experience level, and learning style.',
            url: 'https://store.dsebastien.net/quiz'
        })
    }, [])

    const currentQuestion = quizQuestions[currentStep]
    const progress = ((currentStep + 1) / quizQuestions.length) * 100

    const handleAnswer = (optionIndex: number) => {
        if (!currentQuestion) return

        // Track quiz start only on first answer (not restored from URL)
        if (Object.keys(answers).length === 0 && !quizStartTrackedRef.current) {
            trackQuizStarted()
            quizStartTrackedRef.current = true
        }

        // Track the answer
        const selectedOption = currentQuestion.options[optionIndex]
        if (selectedOption) {
            trackQuizQuestionAnswered({
                questionId: currentQuestion.id,
                questionNumber: currentStep + 1,
                answerIndex: optionIndex,
                answerLabel: selectedOption.label
            })
        }

        setAnswers({ ...answers, [currentQuestion.id]: optionIndex })

        if (currentStep < quizQuestions.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 300)
        } else {
            setTimeout(() => setShowResults(true), 300)
        }
    }

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const restart = useCallback(() => {
        setQuizState({ currentStep: 0, answers: {}, showResults: false })
        setExpandedAlternatives(false)
        setSearchParams({}, { replace: true })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [setSearchParams])

    const shareResults = useCallback(async () => {
        trackQuizResultsShared()
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 3000)
        } catch {
            // Fallback for browsers without clipboard API
            alert(`Share this link: ${url}`)
        }
    }, [])

    // Build accumulated filters from answers and collect match reasons
    const { filters, matchReasons } = useMemo(() => {
        let accumulated = createEmptyFilters()
        const reasons: string[] = []

        Object.entries(answers).forEach(([questionId, optionIndex]) => {
            const question = quizQuestions.find((q) => q.id === questionId)
            if (!question) return

            const selectedOption = question.options[optionIndex]
            if (!selectedOption) return

            accumulated = mergeFilters(accumulated, selectedOption.filters)
            reasons.push(selectedOption.matchReason)
        })

        return { filters: accumulated, matchReasons: reasons }
    }, [answers])

    // Calculate product matches based on filters
    const recommendations = useMemo((): ProductMatch[] => {
        if (!showResults) return []

        // Get matched product IDs sorted by relevance
        const matchedIds = matchProducts(products, filters, quizOverrides.excludedProductIds)

        // Apply result-based overrides
        const finalIds = applyResultOverrides(
            matchedIds,
            filters,
            quizOverrides.resultOverrides,
            products
        )

        // Map to ProductMatch objects
        const productMap = new Map(products.map((p) => [p.id, p]))

        const results: ProductMatch[] = []
        for (const id of finalIds) {
            const product = productMap.get(id)
            if (product) {
                const productReasons: string[] = []

                // Add product-specific reasons
                if (product.averageRating && product.averageRating >= 4.8 && product.ratingsCount) {
                    productReasons.push(`${product.averageRating.toFixed(1)} rating`)
                }
                if (product.bestseller) {
                    productReasons.push('Bestseller')
                }
                if (product.bestValue) {
                    productReasons.push('Best Value')
                }
                if (product.featured) {
                    productReasons.push('Featured')
                }

                // Add relevant match reasons from user selections
                matchReasons.forEach((reason) => {
                    if (!productReasons.includes(reason)) {
                        productReasons.push(reason)
                    }
                })

                results.push({
                    product,
                    matchReasons: productReasons.slice(0, 4)
                })
            }
        }

        return results.slice(0, 8)
    }, [showResults, products, filters, matchReasons])

    const topRecommendation = recommendations[0]
    const alternativeRecommendations = recommendations.slice(1, 4)
    const moreAlternatives = recommendations.slice(4)

    // Track quiz completion when results are shown
    useEffect(() => {
        const topRecommendation = recommendations[0]
        if (showResults && topRecommendation && !quizCompletionTrackedRef.current) {
            trackQuizCompleted({
                totalQuestions: quizQuestions.length,
                productsRecommended: recommendations.length,
                topProductId: topRecommendation.product.id,
                topProductName: topRecommendation.product.name
            })
            quizCompletionTrackedRef.current = true
        }
    }, [showResults, recommendations])

    // Track recommendation click
    const handleRecommendationClick = useCallback((product: Product, rank: number) => {
        trackQuizRecommendationClicked({
            productId: product.id,
            productName: product.name,
            rank,
            isTopRecommendation: rank === 1
        })
    }, [])

    // Generate personalized explanation for top recommendation
    const getPersonalizedExplanation = useCallback(
        (rec: ProductMatch): string => {
            const reasons: string[] = []

            // Check categories match
            if (filters.categories.length > 0) {
                const categoryMatch = filters.categories.find(
                    (c) =>
                        rec.product.mainCategory === c ||
                        rec.product.secondaryCategories.some((sc) => sc.id === c)
                )
                if (categoryMatch) {
                    reasons.push(`It matches your interest in ${categoryMatch.replace(/-/g, ' ')}`)
                }
            }

            // Check experience level
            if (filters.experienceLevel) {
                const productLevel = rec.product.targetExperienceLevel
                if (
                    productLevel === filters.experienceLevel ||
                    productLevel === 'all-levels' ||
                    !productLevel
                ) {
                    reasons.push(`It's designed for your experience level`)
                }
            }

            // Check price preference
            if (filters.priceTiers.length > 0) {
                if (filters.priceTiers.includes('free') && rec.product.priceTier === 'free') {
                    reasons.push("It's completely free to get started")
                } else if (
                    filters.priceTiers.includes('premium') &&
                    (rec.product.priceTier === 'premium' || rec.product.bestValue)
                ) {
                    reasons.push('It offers exceptional value for your investment')
                }
            }

            // Check delivery style
            if (filters.deliveryStyle) {
                const productStyle = rec.product.deliveryStyle
                if (productStyle === filters.deliveryStyle || productStyle === 'hybrid') {
                    if (filters.deliveryStyle === 'hands-on') {
                        reasons.push('You can start using it immediately')
                    } else if (filters.deliveryStyle === 'conceptual') {
                        reasons.push('It teaches you the fundamentals before diving in')
                    }
                }
            }

            if (reasons.length === 0) {
                reasons.push('It matches your goals and preferences based on your answers')
            }

            return reasons.slice(0, 2).join('. ') + '.'
        },
        [filters]
    )

    return (
        <>
            <Section className='px-4 pt-16 pb-6 sm:px-6 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-[1400px] text-center'>
                    <Breadcrumb className='mb-4 flex justify-center sm:mb-6' />
                    <h1 className='mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl'>
                        <FaLightbulb className='text-secondary mr-2 inline-block h-6 w-6 sm:mr-3 sm:h-8 sm:w-8' />
                        Find Your Perfect Match
                    </h1>
                    <p className='text-primary/70 mx-auto max-w-2xl text-base sm:text-lg'>
                        Answer a few questions and get personalized recommendations based on your
                        goals and preferences.
                    </p>
                </div>
            </Section>

            <Section className='px-4 pb-12 sm:px-6 sm:pb-16'>
                <div className='mx-auto w-full max-w-2xl overflow-hidden'>
                    <AnimatePresence mode='wait'>
                        {!showResults ? (
                            <motion.div
                                key='quiz'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Progress Bar */}
                                <div className='mb-6 sm:mb-8'>
                                    <div className='mb-2 flex justify-between text-xs sm:text-sm'>
                                        <span className='text-primary/60'>
                                            Question {currentStep + 1} of {quizQuestions.length}
                                        </span>
                                        <span className='text-primary/60'>
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                    <div className='bg-primary/10 h-1.5 overflow-hidden rounded-full sm:h-2'>
                                        <motion.div
                                            className='bg-secondary h-full'
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>

                                {/* Question */}
                                {currentQuestion && (
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className='mb-6 text-center text-lg font-semibold sm:mb-8 sm:text-2xl'>
                                            {currentQuestion.question}
                                        </h2>

                                        <div className='grid gap-3 p-1 sm:grid-cols-2 sm:gap-4 sm:p-0'>
                                            {currentQuestion.options.map((option, index) => (
                                                <motion.button
                                                    key={index}
                                                    onClick={() => handleAnswer(index)}
                                                    className={`border-primary/10 hover:border-secondary/50 hover:bg-secondary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all sm:gap-4 sm:rounded-xl sm:p-4 ${
                                                        answers[currentQuestion.id] === index
                                                            ? 'border-secondary bg-secondary/10'
                                                            : ''
                                                    }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className='text-2xl sm:text-3xl'>
                                                        {option.icon}
                                                    </span>
                                                    <span className='text-sm font-medium sm:text-base'>
                                                        {option.label}
                                                    </span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Navigation */}
                                <div className='mt-6 flex justify-between sm:mt-8'>
                                    <button
                                        onClick={goBack}
                                        disabled={currentStep === 0}
                                        className='text-primary/60 hover:text-primary flex cursor-pointer items-center gap-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:gap-2 sm:text-base'
                                    >
                                        <FaArrowLeft className='h-3 w-3 sm:h-4 sm:w-4' />
                                        Back
                                    </button>
                                    <button
                                        onClick={restart}
                                        className='text-primary/60 hover:text-primary flex cursor-pointer items-center gap-1.5 text-sm transition-colors sm:gap-2 sm:text-base'
                                    >
                                        <FaRedo className='h-3 w-3 sm:h-4 sm:w-4' />
                                        Start Over
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key='results'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='text-center'
                            >
                                <div className='mb-6 sm:mb-8'>
                                    <span className='text-4xl sm:text-5xl'>🎯</span>
                                    <h2 className='mt-3 text-lg leading-tight font-bold sm:mt-4 sm:text-3xl'>
                                        Your Recommendations
                                    </h2>
                                    <p className='text-primary/70 mt-1.5 text-xs sm:mt-2 sm:text-base'>
                                        Based on your answers, here's what will help you most.
                                    </p>
                                </div>

                                {/* Top Recommendation */}
                                {topRecommendation && (
                                    <div className='border-secondary/30 bg-secondary/5 mb-6 overflow-hidden rounded-xl border-2 p-3 text-left sm:mb-8 sm:rounded-2xl sm:p-6'>
                                        <div className='text-secondary mb-3 text-center text-[10px] font-semibold tracking-wide uppercase sm:mb-4 sm:text-sm'>
                                            Best Match For You
                                        </div>
                                        <div className='flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4'>
                                            <Link
                                                to={`/product/${topRecommendation.product.id}`}
                                                onClick={() =>
                                                    handleRecommendationClick(
                                                        topRecommendation.product,
                                                        1
                                                    )
                                                }
                                                className='bg-primary/10 h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24 sm:rounded-xl'
                                            >
                                                {getCoverImage(topRecommendation.product.media) ? (
                                                    <img
                                                        src={
                                                            getCoverImage(
                                                                topRecommendation.product.media
                                                            )?.url
                                                        }
                                                        alt={topRecommendation.product.name}
                                                        className='h-full w-full object-cover'
                                                    />
                                                ) : (
                                                    <div className='flex h-full w-full items-center justify-center text-2xl sm:text-4xl'>
                                                        📦
                                                    </div>
                                                )}
                                            </Link>
                                            <div className='w-full min-w-0 flex-1 text-center sm:text-left'>
                                                <Link
                                                    to={`/product/${topRecommendation.product.id}`}
                                                    onClick={() =>
                                                        handleRecommendationClick(
                                                            topRecommendation.product,
                                                            1
                                                        )
                                                    }
                                                    className='hover:text-secondary block truncate text-base font-bold transition-colors sm:text-xl'
                                                >
                                                    {topRecommendation.product.name}
                                                </Link>
                                                <p className='text-primary/70 mt-1 line-clamp-2 text-[11px] leading-tight sm:text-sm'>
                                                    {topRecommendation.product.salesCopy?.tagline}
                                                </p>

                                                {/* Personalized explanation */}
                                                <p className='text-secondary mt-2 text-[11px] leading-tight font-medium sm:mt-3 sm:text-sm'>
                                                    Why it's perfect for you:{' '}
                                                    <span className='text-primary/80 font-normal'>
                                                        {getPersonalizedExplanation(
                                                            topRecommendation
                                                        )}
                                                    </span>
                                                </p>

                                                <div className='mt-2 flex flex-wrap items-center justify-center gap-2 sm:mt-3 sm:justify-start sm:gap-3'>
                                                    <span className='text-secondary text-sm font-bold sm:text-lg'>
                                                        {topRecommendation.product.priceTier ===
                                                        'free'
                                                            ? 'Free'
                                                            : topRecommendation.product
                                                                  .priceDisplay}
                                                    </span>
                                                    {topRecommendation.product.averageRating && (
                                                        <span className='flex items-center gap-0.5 text-[11px] sm:gap-1 sm:text-sm'>
                                                            <FaStar className='h-2.5 w-2.5 text-yellow-400 sm:h-4 sm:w-4' />
                                                            {topRecommendation.product.averageRating.toFixed(
                                                                1
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {topRecommendation.matchReasons.length > 0 && (
                                                    <div className='mt-2 flex flex-wrap justify-center gap-1 sm:mt-3 sm:justify-start sm:gap-2'>
                                                        {topRecommendation.matchReasons
                                                            .slice(0, 3)
                                                            .map((reason: string, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    className='bg-secondary/20 text-secondary rounded-full px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-xs'
                                                                >
                                                                    <FaCheck className='mr-0.5 inline h-1.5 w-1.5 sm:mr-1 sm:h-2 sm:w-2' />
                                                                    {reason}
                                                                </span>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='mt-3 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:justify-center sm:gap-3'>
                                            <a
                                                href={buildGumroadUrl(
                                                    topRecommendation.product.gumroadUrl
                                                )}
                                                target='_blank'
                                                rel='noopener'
                                                className='bg-secondary hover:bg-secondary/90 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-base'
                                            >
                                                <FaShoppingCart className='h-3 w-3 sm:h-4 sm:w-4' />
                                                {topRecommendation.product.priceTier === 'free'
                                                    ? 'Get Free'
                                                    : 'Get Started'}
                                            </a>
                                            <Link
                                                to={`/product/${topRecommendation.product.id}`}
                                                onClick={() =>
                                                    handleRecommendationClick(
                                                        topRecommendation.product,
                                                        1
                                                    )
                                                }
                                                className='border-secondary text-secondary hover:bg-secondary/10 inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-base'
                                            >
                                                View Details
                                                <FaArrowRight className='h-3 w-3 sm:h-4 sm:w-4' />
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Alternative Recommendations */}
                                {alternativeRecommendations.length > 0 && (
                                    <div className='text-left'>
                                        <h3 className='mb-3 text-base font-semibold sm:mb-4 sm:text-lg'>
                                            Also Great Options
                                        </h3>
                                        <div className='space-y-2 sm:space-y-3'>
                                            {alternativeRecommendations.map(
                                                (
                                                    { product, matchReasons }: ProductMatch,
                                                    index: number
                                                ) => (
                                                    <Link
                                                        key={product.id}
                                                        to={`/product/${product.id}`}
                                                        onClick={() =>
                                                            handleRecommendationClick(
                                                                product,
                                                                index + 2
                                                            )
                                                        }
                                                        className='border-primary/10 hover:border-secondary/50 group flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border p-2 transition-colors sm:gap-4 sm:rounded-xl sm:p-4'
                                                    >
                                                        <div className='bg-primary/10 h-10 w-10 flex-shrink-0 overflow-hidden rounded sm:h-16 sm:w-16 sm:rounded-lg'>
                                                            {getCoverImage(product.media) ? (
                                                                <img
                                                                    src={
                                                                        getCoverImage(product.media)
                                                                            ?.url
                                                                    }
                                                                    alt={product.name}
                                                                    className='h-full w-full object-cover'
                                                                />
                                                            ) : (
                                                                <div className='flex h-full w-full items-center justify-center text-lg sm:text-2xl'>
                                                                    📦
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='min-w-0 flex-1 overflow-hidden'>
                                                            <div className='group-hover:text-secondary text-xs leading-tight font-medium transition-colors sm:truncate sm:text-base'>
                                                                {product.name}
                                                            </div>
                                                            <div className='text-secondary text-[10px] font-semibold sm:text-sm'>
                                                                {product.priceTier === 'free'
                                                                    ? 'Free'
                                                                    : product.priceDisplay}
                                                            </div>
                                                            {matchReasons.length > 0 && (
                                                                <div className='text-primary/60 mt-0.5 hidden text-[10px] sm:block sm:truncate sm:text-xs'>
                                                                    {matchReasons
                                                                        .slice(0, 2)
                                                                        .join(' · ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FaArrowRight className='text-primary/30 group-hover:text-secondary h-3 w-3 flex-shrink-0 transition-colors sm:h-4 sm:w-4' />
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* More Alternatives (Expandable) */}
                                {moreAlternatives.length > 0 && (
                                    <div className='mt-4 text-left sm:mt-6'>
                                        <button
                                            onClick={() =>
                                                setExpandedAlternatives(!expandedAlternatives)
                                            }
                                            className='text-primary/60 hover:text-primary flex w-full cursor-pointer items-center justify-between rounded-lg py-1.5 text-xs transition-colors sm:py-2 sm:text-sm'
                                        >
                                            <span>
                                                {expandedAlternatives ? 'Hide' : 'Show'}{' '}
                                                {moreAlternatives.length} more
                                            </span>
                                            {expandedAlternatives ? (
                                                <FaChevronUp className='h-3 w-3 sm:h-4 sm:w-4' />
                                            ) : (
                                                <FaChevronDown className='h-3 w-3 sm:h-4 sm:w-4' />
                                            )}
                                        </button>
                                        <AnimatePresence>
                                            {expandedAlternatives && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className='mt-2 space-y-2 overflow-hidden sm:mt-3 sm:space-y-3'
                                                >
                                                    {moreAlternatives.map(
                                                        (
                                                            { product }: ProductMatch,
                                                            index: number
                                                        ) => (
                                                            <Link
                                                                key={product.id}
                                                                to={`/product/${product.id}`}
                                                                onClick={() =>
                                                                    handleRecommendationClick(
                                                                        product,
                                                                        index + 5
                                                                    )
                                                                }
                                                                className='border-primary/10 hover:border-secondary/50 group flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border p-2 transition-colors sm:gap-3 sm:rounded-xl sm:p-3'
                                                            >
                                                                <div className='bg-primary/10 h-8 w-8 flex-shrink-0 overflow-hidden rounded sm:h-12 sm:w-12 sm:rounded-lg'>
                                                                    {getCoverImage(
                                                                        product.media
                                                                    ) ? (
                                                                        <img
                                                                            src={
                                                                                getCoverImage(
                                                                                    product.media
                                                                                )?.url
                                                                            }
                                                                            alt={product.name}
                                                                            className='h-full w-full object-cover'
                                                                        />
                                                                    ) : (
                                                                        <div className='flex h-full w-full items-center justify-center text-sm sm:text-xl'>
                                                                            📦
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className='min-w-0 flex-1 overflow-hidden'>
                                                                    <div className='group-hover:text-secondary text-[11px] leading-tight font-medium transition-colors sm:truncate sm:text-sm'>
                                                                        {product.name}
                                                                    </div>
                                                                    <div className='text-secondary text-[10px] font-semibold sm:text-xs'>
                                                                        {product.priceTier ===
                                                                        'free'
                                                                            ? 'Free'
                                                                            : product.priceDisplay}
                                                                    </div>
                                                                </div>
                                                                <FaArrowRight className='text-primary/30 group-hover:text-secondary h-2.5 w-2.5 flex-shrink-0 transition-colors sm:h-3 sm:w-3' />
                                                            </Link>
                                                        )
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className='border-primary/10 mt-6 flex flex-col items-center gap-3 border-t pt-6 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 sm:pt-8'>
                                    <button
                                        onClick={shareResults}
                                        className='bg-secondary/10 hover:bg-secondary/20 text-secondary flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors sm:w-auto sm:py-2'
                                    >
                                        <FaShare className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                                        {copySuccess ? 'Link Copied!' : 'Share Results'}
                                    </button>
                                    <div className='flex gap-4'>
                                        <button
                                            onClick={restart}
                                            className='text-primary/60 hover:text-primary flex cursor-pointer items-center gap-1.5 text-sm transition-colors sm:gap-2'
                                        >
                                            <FaRedo className='h-3 w-3 sm:h-4 sm:w-4' />
                                            Retake Quiz
                                        </button>
                                        <Link
                                            to='/compare'
                                            className='text-secondary hover:text-secondary/80 flex items-center gap-1.5 text-sm transition-colors sm:gap-2'
                                        >
                                            Compare Products
                                            <FaArrowRight className='h-3 w-3 sm:h-4 sm:w-4' />
                                        </Link>
                                    </div>
                                </div>

                                {/* Help text */}
                                <p className='text-primary/50 mt-4 text-xs sm:mt-6 sm:text-sm'>
                                    Still not sure?{' '}
                                    <a
                                        href='mailto:sebastien@developassion.be?subject=Product%20Recommendation'
                                        className='text-secondary hover:text-secondary/80 underline'
                                    >
                                        Contact me
                                    </a>{' '}
                                    for personalized advice.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Section>
        </>
    )
}

export default QuizPage

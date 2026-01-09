import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FaArrowLeft, FaTag, FaSearch, FaStar } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { TagCard } from '@/components/tags/tag-card'
import productsData from '@/data/products.json'
import tagsData from '@/data/tags.json'
import type { Product } from '@/types/product'
import type { Tag, TagId, TagWithCount } from '@/types/tag'
import {
    buildTagsWithCounts,
    getFeaturedTagsSorted,
    getNonFeaturedTagsSorted
} from '@/lib/tag-utils'

const TagsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get('q') || ''

    // Build tags with counts and split into featured/non-featured
    const { featuredTags, nonFeaturedTags, allTagsCount } = useMemo(() => {
        const products = productsData as Product[]
        const tagsMetadata = tagsData as Record<TagId, Tag>
        const allTagsWithCounts = buildTagsWithCounts(products, tagsMetadata)

        return {
            featuredTags: getFeaturedTagsSorted(allTagsWithCounts),
            nonFeaturedTags: getNonFeaturedTagsSorted(allTagsWithCounts),
            allTagsCount: allTagsWithCounts.length
        }
    }, [])

    // Filter tags based on search
    const { filteredFeatured, filteredNonFeatured } = useMemo(() => {
        if (!searchQuery) {
            return {
                filteredFeatured: featuredTags,
                filteredNonFeatured: nonFeaturedTags
            }
        }

        const query = searchQuery.toLowerCase()
        return {
            filteredFeatured: featuredTags.filter(
                (tag) =>
                    tag.name.toLowerCase().includes(query) ||
                    tag.description.toLowerCase().includes(query)
            ),
            filteredNonFeatured: nonFeaturedTags.filter(
                (tag) =>
                    tag.name.toLowerCase().includes(query) ||
                    tag.description.toLowerCase().includes(query)
            )
        }
    }, [featuredTags, nonFeaturedTags, searchQuery])

    // Handle search input change
    const handleSearchChange = (value: string) => {
        if (value) {
            setSearchParams({ q: value })
        } else {
            setSearchParams({})
        }
    }

    const totalMatchingTags = filteredFeatured.length + filteredNonFeatured.length
    const hasResults = totalMatchingTags > 0

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-7xl'>
                    <Link
                        to='/'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Products
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaTag className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Tags</h1>
                            <p className='text-primary/70 mt-1'>Browse products by tag</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Stats and Search */}
            <Section className='pb-8'>
                <div className='mx-auto max-w-7xl'>
                    {/* Stats */}
                    <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        <div className='bg-primary/5 rounded-lg p-4'>
                            <div className='text-3xl font-bold text-green-400'>{allTagsCount}</div>
                            <div className='text-primary/60 text-sm'>Total Tags</div>
                        </div>
                        <div className='bg-primary/5 rounded-lg p-4'>
                            <div className='text-secondary text-3xl font-bold'>
                                {productsData.length}
                            </div>
                            <div className='text-primary/60 text-sm'>Total Products</div>
                        </div>
                        {searchQuery && (
                            <div className='bg-primary/5 rounded-lg p-4'>
                                <div className='text-3xl font-bold text-purple-400'>
                                    {totalMatchingTags}
                                </div>
                                <div className='text-primary/60 text-sm'>Matching Tags</div>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className='relative'>
                        <FaSearch className='text-primary/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2' />
                        <input
                            type='text'
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder='Search tags...'
                            className='bg-primary/5 border-primary/10 placeholder:text-primary/40 focus:border-secondary/50 w-full rounded-lg border py-3 pr-4 pl-12 text-lg transition-colors outline-none'
                        />
                    </div>
                </div>
            </Section>

            {/* Tags Content */}
            <Section className='pb-16 sm:pb-24'>
                <div className='mx-auto max-w-7xl'>
                    {hasResults ? (
                        <>
                            {/* Featured Tags Section */}
                            {filteredFeatured.length > 0 && (
                                <>
                                    <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold'>
                                        <FaStar className='text-secondary h-6 w-6' />
                                        Featured Tags
                                    </h2>
                                    <div className='mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                        {filteredFeatured.map((tag: TagWithCount) => (
                                            <TagCard
                                                key={tag.id}
                                                tag={tag}
                                                count={tag.count}
                                                showFeaturedBadge={true}
                                                variant='detailed'
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Non-Featured Tags Section */}
                            {filteredNonFeatured.length > 0 && (
                                <>
                                    {filteredFeatured.length > 0 && (
                                        <h2 className='mb-6 text-2xl font-bold'>More Tags</h2>
                                    )}
                                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                        {filteredNonFeatured.map((tag: TagWithCount) => (
                                            <TagCard
                                                key={tag.id}
                                                tag={tag}
                                                count={tag.count}
                                                showFeaturedBadge={false}
                                                variant='detailed'
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-4 text-6xl'>🔍</div>
                            <h3 className='mb-2 text-xl font-semibold'>No tags found</h3>
                            <p className='text-primary/60 mb-4'>Try adjusting your search query.</p>
                            <button
                                onClick={() => handleSearchChange('')}
                                className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white'
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </Section>
        </>
    )
}

export default TagsPage

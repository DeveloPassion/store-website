import { useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { FaArrowLeft, FaTag, FaSearch, FaArrowRight } from 'react-icons/fa'
import Section from '@/components/ui/section'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'

export interface TagData {
    name: string
    count: number
    products: Product[]
}

const TagsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get('q') || ''
    const navigate = useNavigate()

    // Build tag data from products
    const allTags = useMemo(() => {
        const tagMap = new Map<string, { count: number; products: Product[] }>()
        const products = productsData as Product[]

        products.forEach((product) => {
            product.tags.forEach((tag) => {
                if (!tagMap.has(tag)) {
                    tagMap.set(tag, { count: 0, products: [] })
                }
                const tagData = tagMap.get(tag)!
                tagData.count++
                tagData.products.push(product)
            })
        })

        const tags: TagData[] = Array.from(tagMap.entries())
            .map(([name, data]) => ({
                name,
                count: data.count,
                products: data.products
            }))
            .sort((a, b) => b.count - a.count)

        return tags
    }, [])

    // Filter tags based on search
    const filteredTags = useMemo(() => {
        if (!searchQuery) return allTags
        const query = searchQuery.toLowerCase()
        return allTags.filter((tag) => tag.name.toLowerCase().includes(query))
    }, [allTags, searchQuery])

    // Handle search input change
    const handleSearchChange = (value: string) => {
        if (value) {
            setSearchParams({ q: value })
        } else {
            setSearchParams({})
        }
    }

    // Color schemes for tag cards (cycling through 11 colors)
    const cardColors = [
        'from-rose-500/20 to-pink-500/20 border-rose-500/30',
        'from-pink-500/20 to-purple-500/20 border-pink-500/30',
        'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
        'from-green-500/20 to-emerald-500/20 border-green-500/30',
        'from-amber-500/20 to-orange-500/20 border-amber-500/30',
        'from-purple-500/20 to-violet-500/20 border-purple-500/30',
        'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
        'from-red-500/20 to-rose-500/20 border-red-500/30',
        'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
        'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
        'from-orange-500/20 to-red-500/20 border-orange-500/30'
    ]

    const iconColors = [
        'text-rose-500',
        'text-pink-500',
        'text-blue-500',
        'text-green-500',
        'text-amber-500',
        'text-purple-500',
        'text-cyan-500',
        'text-red-500',
        'text-indigo-500',
        'text-teal-500',
        'text-orange-500'
    ]

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
                            <div className='text-3xl font-bold text-green-400'>
                                {allTags.length}
                            </div>
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
                                    {filteredTags.length}
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

            {/* Tags Grid */}
            <Section className='pb-16 sm:pb-24'>
                <div className='mx-auto max-w-7xl'>
                    {filteredTags.length > 0 ? (
                        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                            {filteredTags.map((tag, index) => {
                                const colorIndex = index % cardColors.length

                                return (
                                    <button
                                        key={tag.name}
                                        onClick={() => {
                                            const tagId = tag.name
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, '-')
                                            navigate(`/tags/${tagId}`)
                                        }}
                                        className={`group border-primary/10 hover:border-secondary/30 flex cursor-pointer flex-col gap-3 rounded-xl border bg-gradient-to-br p-4 text-left transition-all hover:scale-102 hover:shadow-lg ${cardColors[colorIndex]}`}
                                    >
                                        <div className='flex items-start justify-between'>
                                            <FaTag
                                                className={`h-5 w-5 ${iconColors[colorIndex]}`}
                                            />
                                            <FaArrowRight className='text-primary/40 group-hover:text-secondary h-4 w-4 transition-colors' />
                                        </div>
                                        <div>
                                            <h3 className='mb-1 text-lg font-semibold'>
                                                {tag.name}
                                            </h3>
                                            <p className='text-primary/60 text-sm'>
                                                {tag.count}{' '}
                                                {tag.count === 1 ? 'product' : 'products'}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
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

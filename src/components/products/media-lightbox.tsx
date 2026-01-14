import { Fragment, useState, useEffect, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa'
import type { MediaItem } from '@/schemas/media.schema'
import { extractYouTubeId } from './media-item'

export interface MediaLightboxProps {
    mediaItems: MediaItem[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
    mediaItems,
    initialIndex = 0,
    isOpen,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

    // Sync currentIndex when lightbox opens - using React's recommended
    // "adjusting state during rendering" pattern instead of useEffect
    if (isOpen && !prevIsOpen) {
        setPrevIsOpen(true)
        setCurrentIndex(initialIndex)
    } else if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false)
    }

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
    }, [mediaItems.length])

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
    }, [mediaItems.length])

    // Global keyboard navigation - works regardless of focus
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                goToPrevious()
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                goToNext()
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, goToPrevious, goToNext, onClose])

    if (!mediaItems || mediaItems.length === 0) return null

    const currentMedia = mediaItems[currentIndex]

    // For videos, get YouTube ID
    const youtubeId =
        currentMedia?.type === 'video'
            ? currentMedia.youtubeId || extractYouTubeId(currentMedia.url)
            : null

    return (
        <Transition appear show={isOpen} as={Fragment}>
            {/* Dialog with static prop to prevent auto-close on outside click */}
            <Dialog as='div' className='relative z-50' onClose={() => {}} static>
                {/* Backdrop - clicks here close the lightbox */}
                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                >
                    <div className='fixed inset-0 bg-black' onClick={onClose} />
                </Transition.Child>

                {/* Full-screen Dialog.Panel so all buttons are "inside" */}
                <Dialog.Panel className='fixed inset-0'>
                    {/* Close Button - Fixed top-right */}
                    <button
                        onClick={onClose}
                        className='focus:ring-secondary hover:bg-secondary absolute top-4 right-4 z-20 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 focus:ring-2 focus:outline-none'
                        aria-label='Close lightbox'
                    >
                        <FaTimes className='h-6 w-6' aria-hidden='true' />
                    </button>

                    {/* Previous Button - Fixed left center */}
                    {mediaItems.length > 1 && (
                        <button
                            onClick={goToPrevious}
                            className='focus:ring-secondary hover:bg-secondary absolute top-1/2 left-4 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 focus:ring-2 focus:outline-none'
                            aria-label='Previous media'
                        >
                            <FaChevronLeft className='h-6 w-6' aria-hidden='true' />
                        </button>
                    )}

                    {/* Next Button - Fixed right center */}
                    {mediaItems.length > 1 && (
                        <button
                            onClick={goToNext}
                            className='focus:ring-secondary hover:bg-secondary absolute top-1/2 right-4 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 focus:ring-2 focus:outline-none'
                            aria-label='Next media'
                        >
                            <FaChevronRight className='h-6 w-6' aria-hidden='true' />
                        </button>
                    )}

                    <div className='flex min-h-full items-center justify-center p-4'>
                        <Transition.Child
                            as={Fragment}
                            enter='ease-out duration-300'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'
                        >
                            <div className='relative w-full max-w-7xl px-16'>
                                {/* Media Container */}
                                <div className='flex items-center justify-center'>
                                    {/* Media with Animation - max-h accounts for title, counter, and thumbnails below */}
                                    <AnimatePresence mode='wait'>
                                        {currentMedia?.type === 'image' ? (
                                            <motion.img
                                                key={currentIndex}
                                                src={currentMedia.url}
                                                alt={currentMedia.altText}
                                                className='max-h-[50vh] w-auto rounded-lg shadow-2xl sm:max-h-[55vh]'
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        ) : currentMedia?.type === 'video' && youtubeId ? (
                                            <motion.div
                                                key={currentIndex}
                                                className='aspect-video max-h-[50vh] w-full max-w-5xl rounded-lg shadow-2xl sm:max-h-[55vh]'
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <iframe
                                                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                                    title={currentMedia.title}
                                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                                    allowFullScreen
                                                    className='h-full w-full rounded-lg'
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key={currentIndex}
                                                className='bg-background/50 flex items-center justify-center rounded-lg p-8'
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <p className='text-primary/50'>Media unavailable</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Title and Counter */}
                                {currentMedia && (
                                    <div className='mt-4 text-center'>
                                        <h3 className='text-lg font-semibold text-white'>
                                            {currentMedia.title}
                                        </h3>
                                        {mediaItems.length > 1 && (
                                            <p className='mt-1 text-sm text-white/80'>
                                                {currentIndex + 1} / {mediaItems.length}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Thumbnail Navigation - hidden on mobile */}
                                {mediaItems.length > 1 && mediaItems.length <= 10 && (
                                    <div className='mt-6 hidden justify-center gap-2 sm:flex'>
                                        {mediaItems.map((item, idx) => {
                                            const itemYoutubeId =
                                                item.type === 'video'
                                                    ? item.youtubeId || extractYouTubeId(item.url)
                                                    : null
                                            const thumbnailSrc =
                                                item.type === 'video' && itemYoutubeId
                                                    ? item.thumbnailUrl ||
                                                      `https://img.youtube.com/vi/${itemYoutubeId}/default.jpg`
                                                    : item.url

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setCurrentIndex(idx)}
                                                    className={`focus:ring-secondary relative h-16 w-16 cursor-pointer overflow-hidden rounded border-2 transition-all focus:ring-2 focus:outline-none ${
                                                        idx === currentIndex
                                                            ? 'border-secondary scale-110'
                                                            : 'border-white/20 opacity-60 hover:opacity-100'
                                                    }`}
                                                    aria-label={`View ${item.title}`}
                                                >
                                                    <img
                                                        src={thumbnailSrc}
                                                        alt={`${item.title} thumbnail`}
                                                        className='h-full w-full object-cover'
                                                    />
                                                    {/* Play icon overlay for videos */}
                                                    {item.type === 'video' && (
                                                        <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                                            <FaPlay
                                                                className='h-4 w-4 text-white'
                                                                aria-hidden='true'
                                                            />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </Transition>
    )
}

export default MediaLightbox

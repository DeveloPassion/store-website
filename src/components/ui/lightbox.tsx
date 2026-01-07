import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export interface LightboxProps {
    images: string[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
    alt?: string
}

const Lightbox: React.FC<LightboxProps> = ({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    alt = 'Screenshot'
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrevious()
        if (e.key === 'ArrowRight') goToNext()
        if (e.key === 'Escape') onClose()
    }

    if (!images || images.length === 0) return null

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as='div' className='relative z-50' onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                >
                    <div className='fixed inset-0 bg-black/95' />
                </Transition.Child>

                {/* Full-screen container */}
                <div className='fixed inset-0' onKeyDown={handleKeyDown}>
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
                            <Dialog.Panel className='relative w-full max-w-7xl'>
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className='absolute top-0 right-0 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20'
                                    aria-label='Close lightbox'
                                >
                                    <FaTimes className='h-6 w-6' />
                                </button>

                                {/* Image Container */}
                                <div className='relative flex items-center justify-center'>
                                    {/* Previous Button */}
                                    {images.length > 1 && (
                                        <button
                                            onClick={goToPrevious}
                                            className='absolute left-0 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20'
                                            aria-label='Previous image'
                                        >
                                            <FaChevronLeft className='h-6 w-6' />
                                        </button>
                                    )}

                                    {/* Image with Animation */}
                                    <AnimatePresence mode='wait'>
                                        <motion.img
                                            key={currentIndex}
                                            src={images[currentIndex]}
                                            alt={`${alt} ${currentIndex + 1}`}
                                            className='max-h-[90vh] w-auto rounded-lg shadow-2xl'
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </AnimatePresence>

                                    {/* Next Button */}
                                    {images.length > 1 && (
                                        <button
                                            onClick={goToNext}
                                            className='absolute right-0 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20'
                                            aria-label='Next image'
                                        >
                                            <FaChevronRight className='h-6 w-6' />
                                        </button>
                                    )}
                                </div>

                                {/* Counter */}
                                {images.length > 1 && (
                                    <div className='mt-4 text-center text-white/80'>
                                        {currentIndex + 1} / {images.length}
                                    </div>
                                )}

                                {/* Thumbnail Navigation */}
                                {images.length > 1 && images.length <= 10 && (
                                    <div className='mt-6 flex justify-center gap-2'>
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`h-16 w-16 overflow-hidden rounded border-2 transition-all ${
                                                    idx === currentIndex
                                                        ? 'border-secondary scale-110'
                                                        : 'border-white/20 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className='h-full w-full object-cover'
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default Lightbox

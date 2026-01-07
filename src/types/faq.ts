export interface FAQ {
    id: string
    productId: string // Which product this FAQ is for
    question: string
    answer: string
    order: number // Display order
}

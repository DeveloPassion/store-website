#!/usr/bin/env bun

/**
 * Validate quiz configuration against the Zod schemas
 *
 * This script validates:
 * - quiz-questions.json: Quiz questions and options
 * - quiz-product-scoring-overrides.json: Product exclusions and result overrides
 *
 * Usage:
 *   npm run validate:quiz
 *   bun scripts/validate-quiz.ts
 *
 * Exit codes:
 *   0 - Quiz configuration is valid
 *   1 - Validation errors found
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
    QuizQuestionsDataSchema,
    QuizOverridesSchema,
    type QuizQuestionsData,
    type QuizOverrides
} from '../src/schemas/quiz.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const QUIZ_QUESTIONS_FILE = resolve(__dirname, '../src/data/quiz-questions.json')
const QUIZ_OVERRIDES_FILE = resolve(__dirname, '../src/data/quiz-product-scoring-overrides.json')

let hasErrors = false

function validateFile<T>(
    filePath: string,
    schema: {
        safeParse: (data: unknown) => {
            success: boolean
            data?: T
            error?: { errors: Array<{ path: (string | number)[]; message: string }> }
        }
    },
    label: string
): T | null {
    console.log(`\n📄 Validating ${label}...`)
    console.log(`   File: ${filePath}`)

    // Check if file exists
    if (!existsSync(filePath)) {
        console.error(`   ❌ File not found`)
        hasErrors = true
        return null
    }

    // Read and parse file
    let data: unknown
    try {
        const fileContent = readFileSync(filePath, 'utf-8')
        data = JSON.parse(fileContent)
    } catch (error) {
        console.error(`   ❌ Failed to read or parse file`)
        console.error(`      ${error instanceof Error ? error.message : String(error)}`)
        hasErrors = true
        return null
    }

    // Validate against schema
    const result = schema.safeParse(data)

    if (result.success) {
        console.log(`   ✅ Valid`)
        return result.data as T
    }

    // Validation failed
    console.error(`   ❌ Validation failed`)
    hasErrors = true

    if (result.error && result.error.errors) {
        result.error.errors.forEach((err) => {
            const path = err.path.join('.') || '[root]'
            console.error(`      • ${path}: ${err.message}`)
        })
    }

    return null
}

function displayQuestionsSummary(data: QuizQuestionsData) {
    const { questions } = data
    console.log(`\n   📊 Questions Summary:`)
    console.log(`      Total questions: ${questions.length}`)

    questions.forEach((q, idx) => {
        console.log(
            `      ${idx + 1}. [${q.id}] ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`
        )
        console.log(`         Options: ${q.options.length}`)
        q.options.forEach((opt, optIdx) => {
            const filters = Object.keys(opt.filters).join(', ') || 'none'
            console.log(`           ${optIdx}. ${opt.icon} ${opt.label} (filters: ${filters})`)
        })
    })
}

function displayOverridesSummary(data: QuizOverrides) {
    console.log(`\n   📊 Overrides Summary:`)
    console.log(`      Excluded products: ${data.excludedProductIds.length}`)
    if (data.excludedProductIds.length > 0) {
        data.excludedProductIds.forEach((id) => {
            console.log(`        - ${id}`)
        })
    }

    console.log(`      Result overrides: ${data.resultOverrides.length}`)
    if (data.resultOverrides.length > 0) {
        data.resultOverrides.forEach((override, idx) => {
            const conditions =
                Object.entries(override.conditions)
                    .filter(([, v]) => v !== undefined)
                    .map(([k]) => k)
                    .join(', ') || 'none'
            console.log(`        ${idx + 1}. Conditions: ${conditions}`)
            if (override.addProducts.length > 0) {
                console.log(`           Add: ${override.addProducts.join(', ')}`)
            }
            if (override.removeProducts.length > 0) {
                console.log(`           Remove: ${override.removeProducts.join(', ')}`)
            }
            if (override.setProducts) {
                console.log(`           Set: ${override.setProducts.join(', ')}`)
            }
        })
    }
}

function main() {
    console.log('🔍 Validating quiz configuration...')

    // Validate quiz questions
    const questionsData = validateFile<QuizQuestionsData>(
        QUIZ_QUESTIONS_FILE,
        QuizQuestionsDataSchema,
        'quiz-questions.json'
    )
    if (questionsData) {
        displayQuestionsSummary(questionsData)
    }

    // Validate quiz overrides
    const overridesData = validateFile<QuizOverrides>(
        QUIZ_OVERRIDES_FILE,
        QuizOverridesSchema,
        'quiz-product-scoring-overrides.json'
    )
    if (overridesData) {
        displayOverridesSummary(overridesData)
    }

    // Final result
    console.log('')
    if (hasErrors) {
        console.error('❌ Quiz validation failed!\n')
        console.error('💡 Tip: Check the schema definitions at src/schemas/quiz.schema.ts')
        console.error('💡 Tip: Ensure all required fields are present and correctly typed\n')
        process.exit(1)
    }

    console.log('✅ All quiz configuration is valid!\n')
    process.exit(0)
}

main()

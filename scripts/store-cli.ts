#!/usr/bin/env tsx

/**
 * Store CLI - Interactive menu to access all store management tools
 *
 * This script provides a centralized entrypoint to all store management CLIs
 * with an interactive menu interface.
 *
 * Usage:
 *   npm run store
 *   tsx scripts/store-cli.ts
 */

import { spawn } from 'child_process'
import { select } from '@inquirer/prompts'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ANSI color codes for better UX
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m'
}

// Available CLI tools
interface Choice {
    name: string
    value: string
    description?: string
}

/**
 * Display welcome banner
 */
function showBanner(): void {
    console.clear()
    console.log(`
${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🛍️  STORE MANAGEMENT CLI  🛍️                ║
║                                                           ║
║         Interactive menu for store configuration          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`)
}

/**
 * Build menu choices
 */
function buildChoices(): Choice[] {
    return [
        {
            name: '📦 Manage Products',
            value: 'update-products.ts',
            description: 'Add, edit, list, or remove products'
        },
        {
            name: '📝 Manage Product Content',
            value: 'manage-product-content.ts',
            description: 'Manage FAQs and testimonials for products'
        },
        {
            name: '🏷️ Manage Categories',
            value: 'update-categories.ts',
            description: 'Add, modify, list, or remove categories'
        },
        {
            name: '🏷️ Manage Tags',
            value: 'update-tags.ts',
            description: 'Add, modify, list, or remove tags'
        },
        {
            name: '🎉 Update Promotion Banner',
            value: 'update-promotion.ts',
            description: 'Configure promotion banner settings'
        },
        {
            name: '✅ Validate All',
            value: 'validate-all.sh',
            description: 'Run all validation checks'
        },
        {
            name: '✅ Validate Products',
            value: 'validate-products.ts',
            description: 'Validate product data and schema'
        },
        {
            name: '✅ Validate Categories',
            value: 'validate-categories.ts',
            description: 'Validate category data and schema'
        },
        {
            name: '✅ Validate Tags',
            value: 'validate-tags.ts',
            description: 'Validate tag data and schema'
        },
        {
            name: '✅ Validate Promotion',
            value: 'validate-promotion.ts',
            description: 'Validate promotion banner configuration'
        },
        {
            name: '✅ Validate Relationships',
            value: 'validate-relationships.ts',
            description: 'Validate cross-references between data'
        },
        {
            name: '👋 Exit',
            value: 'exit',
            description: 'Exit the CLI'
        }
    ]
}

/**
 * Launch a CLI tool
 */
async function launchTool(scriptName: string): Promise<void> {
    const scriptPath = resolve(__dirname, scriptName)

    console.log(`\n${colors.bright}${colors.green}→ Launching: ${scriptName}${colors.reset}\n`)

    return new Promise<void>((resolve, reject) => {
        const isShellScript = scriptName.endsWith('.sh')
        const command = isShellScript ? 'bash' : 'tsx'
        const args = [scriptPath]

        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: false
        })

        child.on('error', (error) => {
            console.error(`${colors.bright}Error launching tool:${colors.reset}`, error)
            reject(error)
        })

        child.on('close', (code) => {
            if (code !== 0) {
                console.log(`\n${colors.yellow}Tool exited with code ${code}${colors.reset}`)
            }
            resolve()
        })
    })
}

/**
 * Main menu loop
 */
async function mainMenu(): Promise<void> {
    while (true) {
        showBanner()

        const choices = buildChoices()

        const selectedTool = await select({
            message: 'What would you like to do?',
            choices,
            pageSize: 15
        })

        if (selectedTool === 'exit') {
            console.log(
                `\n${colors.bright}${colors.cyan}Thanks for using Store CLI! 👋${colors.reset}\n`
            )
            process.exit(0)
        }

        // Launch the selected tool
        try {
            await launchTool(selectedTool)

            // After tool completes, ask what to do next
            const nextAction = await select({
                message: 'What would you like to do next?',
                choices: [
                    { name: '🔄 Return to main menu', value: 'menu' },
                    { name: '👋 Exit', value: 'exit' }
                ]
            })

            if (nextAction === 'exit') {
                console.log(
                    `\n${colors.bright}${colors.cyan}Thanks for using Store CLI! 👋${colors.reset}\n`
                )
                process.exit(0)
            }
        } catch (error) {
            console.error(`${colors.bright}Failed to launch tool:${colors.reset}`, error)

            const continueAfterError = await select({
                message: 'An error occurred. What would you like to do?',
                choices: [
                    { name: '🔄 Return to main menu', value: true },
                    { name: '👋 Exit', value: false }
                ]
            })

            if (!continueAfterError) {
                process.exit(1)
            }
        }
    }
}

// Create validate-all.sh script if it doesn't exist
function ensureValidateAllScript(): void {
    const validateAllPath = resolve(__dirname, 'validate-all.sh')

    if (!fs.existsSync(validateAllPath)) {
        const scriptContent = `#!/bin/bash
# Run all validation checks

echo "Running all validation checks..."
echo ""

npm run validate:categories && \\
npm run validate:tags && \\
npm run validate:promotion && \\
npm run validate:products && \\
npm run validate:relationships

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All validations passed!"
else
    echo ""
    echo "❌ Some validations failed!"
    exit 1
fi
`
        fs.writeFileSync(validateAllPath, scriptContent, { mode: 0o755 })
    }
}

// Start the CLI
async function main(): Promise<void> {
    try {
        ensureValidateAllScript()
        await mainMenu()
    } catch (error) {
        // Handle Ctrl+C gracefully
        if (error && typeof error === 'object' && 'name' in error) {
            if (error.name === 'ExitPromptError') {
                console.log(
                    `\n${colors.bright}${colors.cyan}Thanks for using Store CLI! 👋${colors.reset}\n`
                )
                process.exit(0)
            }
        }
        console.error(`${colors.bright}Unexpected error:${colors.reset}`, error)
        process.exit(1)
    }
}

main()

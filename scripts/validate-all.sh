#!/bin/bash
# Run all validation checks

echo "Running all validation checks..."
echo ""

npm run validate:categories && \
npm run validate:tags && \
npm run validate:promotion && \
npm run validate:products && \
npm run validate:relationships

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All validations passed!"
else
    echo ""
    echo "❌ Some validations failed!"
    exit 1
fi

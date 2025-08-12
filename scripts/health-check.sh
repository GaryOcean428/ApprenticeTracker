#!/bin/bash

echo "=== ApprenticeTracker Health Check ==="
echo "Starting comprehensive system health audit..."
echo

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Security audit
echo "🔒 Security Audit..."
pnpm audit --audit-level moderate
audit_result=$?
print_status $audit_result "Security vulnerabilities check"
echo

# Dependency check
echo "📦 Dependency Analysis..."
pnpm outdated --depth=0
outdated_result=$?
print_status $outdated_result "Dependency currency check"
echo

# TypeScript compilation
echo "🔧 TypeScript Compilation..."
pnpm check > /dev/null 2>&1
ts_result=$?
print_status $ts_result "TypeScript compilation"
echo

# Code duplication analysis
echo "🔍 Code Quality Analysis..."
pnpm exec jscpd client/src server shared --min-lines 10 --min-tokens 50 --reporters console --silent
duplication_result=$?
print_status $duplication_result "Code duplication analysis"
echo

# Unused exports detection
echo "🧹 Unused Code Detection..."
pnpm exec ts-unused-exports tsconfig.json --excludePathsFromReport=node_modules > /dev/null 2>&1
unused_result=$?
print_status $unused_result "Unused exports check"
echo

# Linting
echo "📝 Code Style Check..."
pnpm lint > /dev/null 2>&1
lint_result=$?
print_status $lint_result "ESLint code style"
echo

# Build test
echo "🏗️  Build Verification..."
pnpm build > /dev/null 2>&1
build_result=$?
print_status $build_result "Production build"
echo

# Test execution
echo "🧪 Test Suite..."
pnpm test:run > /dev/null 2>&1
test_result=$?
print_status $test_result "Test suite execution"
echo

# Overall health score
total_checks=7
passed_checks=0

for result in $audit_result $ts_result $duplication_result $unused_result $lint_result $build_result $test_result; do
    if [ $result -eq 0 ]; then
        passed_checks=$((passed_checks + 1))
    fi
done

health_score=$((passed_checks * 100 / total_checks))

echo "=== Health Check Summary ==="
echo "Health Score: $health_score% ($passed_checks/$total_checks checks passed)"

if [ $health_score -ge 85 ]; then
    echo -e "${GREEN}System health is EXCELLENT${NC}"
    exit 0
elif [ $health_score -ge 70 ]; then
    echo -e "${YELLOW}System health is GOOD - minor issues detected${NC}"
    exit 0
else
    echo -e "${RED}System health is POOR - significant issues require attention${NC}"
    exit 1
fi
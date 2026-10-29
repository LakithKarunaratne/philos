import '@testing-library/jest-dom'

// Expected failure paths exercise lib/logger.ts, and its output would bury the
// test report. The logger's own suite sets LOG_LEVEL back to "debug".
process.env.LOG_LEVEL = 'silent'

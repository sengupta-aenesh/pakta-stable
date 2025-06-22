// Quick Sentry test script
// Run with: node test-sentry.js

const { captureErrorWithContext } = require('./lib/sentry-utils')

console.log('Testing Sentry integration...')

try {
  // This will throw an error
  throw new Error('Test error for Sentry integration')
} catch (error) {
  console.log('Capturing test error...')
  
  captureErrorWithContext(error, {
    feature: 'sentry_test',
    operation: 'integration_test',
    additionalData: { 
      testType: 'manual_verification',
      timestamp: new Date().toISOString()
    }
  })
  
  console.log('✅ Error captured and sent to Sentry!')
  console.log('Check your Sentry dashboard to see the error.')
}
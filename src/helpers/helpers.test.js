const formatPhoneNumber = require('./helpers')

// Test cases to test functions in helper.js file
test('formatPhoneNumber', () => {
  expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
})

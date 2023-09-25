export const calculateExpression = expression => {
  try {
    // Splitting by '+' first
    const additionParts = expression.split('+')

    const result = additionParts.reduce((acc, part) => {
      const subtractionParts = part
        .split('-')
        .map(num => parseFloat(num.trim()))

      if (subtractionParts.some(num => isNaN(num))) {
        throw new Error('Invalid number')
      }

      const subtractionResult = subtractionParts
        .slice(1)
        .reduce((acc, curr) => acc - curr, subtractionParts[0])

      return acc + subtractionResult
    }, 0)

    return result.toString()
  } catch (err) {
    return expression
  }
}

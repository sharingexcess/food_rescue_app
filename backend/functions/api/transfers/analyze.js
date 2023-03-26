const fs = require('fs')

const original = JSON.parse(fs.readFileSync('./_SKIPPED.json')).filter(
  (value, index, self) => index === self.findIndex(t => t.id === value.id)
)

console.log(original.reduce((total, curr) => total + curr.total_weight, 0))

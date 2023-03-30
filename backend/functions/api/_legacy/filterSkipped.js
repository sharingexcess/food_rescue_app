const fs = require('fs')

const original = JSON.parse(fs.readFileSync('./_SKIPPED.json')).filter(
  (value, index, self) => index === self.findIndex(t => t.id === value.id)
)

const repaired = JSON.parse(fs.readFileSync('./_IN_REPAIR.json')).filter(
  (value, index, self) => index === self.findIndex(t => t.id === value.id)
)

const filtered = original.filter(i => !repaired.find(j => i.id === j.id))

console.log(original.length, repaired.length, filtered.length)

// fs.writeFileSync('./_SKIPPED.json', JSON.stringify(filtered))

const fs = require('fs')

const component_list = fs
  .readdirSync('./src/components', { withFileTypes: true })
  .filter(dir => dir.isDirectory())
  .map(dir => dir.name)

let body = ``

for (const c of component_list) {
  body += `export * from './${c}/${c}'\n`
}

fs.writeFileSync('./src/components/index.js', body)

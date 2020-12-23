const { exec } = require('child_process')
const crypto = require('crypto')
const colors = require('colors')
const { series } = require('async')
const ENCODED_PASS_CODE =
  '10a35f32b13f533407ce443ab0d4aa5d734db37586c95e1e3bd116227b695ca1'

async function requestPassCodeAuthorization() {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => {
    rl.question(
      colors.cyan('\n\nEnter security pass code to continue '),
      res => {
        rl.close()
        const encoded_input = crypto
          .createHash('sha256')
          .update(res.toLowerCase())
          .digest('hex')
        resolve(encoded_input === ENCODED_PASS_CODE)
      }
    )
  })
}

async function runCommand(command, callback) {
  console.log(colors.cyan('\n\nRUNNING:', command))
  const process = exec(command, error => {
    console.log('completed process', command, ':', error)
    if (error) console.error(error)
    else callback()
  })
  process.stdout.on('data', data => {
    console.log(data.toString())
  })
}

async function main() {
  const approved = await requestPassCodeAuthorization()
  if (approved) {
    series(
      [
        callback => runCommand('npm run build:prod', callback),
        callback => runCommand('firebase use prod', callback),
        callback => runCommand('firebase deploy --only hosting', callback),
        callback => runCommand('firebase use default', callback),
      ],
      err => {
        err
          ? console.error('Error in deployment:', err)
          : console.log(colors.green.bold('DEPLOYMENT SUCCESSFUL!'))
      }
    )
  } else console.log('Invalid pass code. Exiting...')
}

main()

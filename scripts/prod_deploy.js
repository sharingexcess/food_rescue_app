const { exec } = require('child_process')
const crypto = require('crypto')
const colors = require('colors')
const { series } = require('async')
const git = require('git-state')
const ENCODED_PASS_CODE =
  '10a35f32b13f533407ce443ab0d4aa5d734db37586c95e1e3bd116227b695ca1'

async function validateGitState() {
  return new Promise(res => {
    git.isGit('.', function (exists) {
      if (!exists) return false
      git.check('.', (err, result) => {
        if (err) throw err
        console.log(colors.yellow.bold('Validating Git State:\n'), result, '\n')
        if (result.branch !== 'master') {
          console.error(
            colors.red.bold(
              'Cannot deploy to production from branch other than master. Exiting...\n'
            )
          )
          res(false)
        } else if (result.ahead > 0) {
          console.error(
            colors.red.bold(
              'Cannot deploy to production with un-pushed commits. Exiting...\n'
            )
          )
          res(false)
        } else if (result.dirty > 0) {
          console.error(
            colors.red.bold(
              'Cannot deploy to production with un-committed changes. Exiting...\n'
            )
          )
          res(false)
        } else {
          console.log(colors.green('\nGit state validated.'))
          res(true)
        }
      })
    })
  })
}

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
  console.log(colors.yellow('\n\nRUNNING:', command))
  const process = exec(command, error => {
    console.log(colors.green('\n\nCOMPLETED:', command))
    if (error) console.error(error)
    else callback()
  })
  process.stdout.on('data', data => {
    console.log(data.toString())
  })
}

async function main() {
  const valid_git_state = await validateGitState()
  if (!valid_git_state) return
  const approved = await requestPassCodeAuthorization()
  if (approved) {
    series(
      [
        callback =>
          runCommand(
            'cp environments/.env.prod .env.production.local',
            callback
          ),
        callback => runCommand('rm -rf build', callback),
        callback => runCommand('rm -rf node_modules', callback),
        callback => runCommand('npm ci', callback),
        callback => runCommand('npm run build', callback),
        callback => runCommand('rm .env.production.local', callback),
        callback =>
          runCommand(
            'cp environments/firebase.prod.json firebase.json',
            callback
          ),
        callback => runCommand('firebase use prod', callback),
        callback =>
          runCommand('firebase deploy --only hosting:sharingexcess', callback),
        callback =>
          runCommand(
            'cp environments/firebase.dev.json firebase.json',
            callback
          ),
        callback => runCommand('firebase use default', callback),
      ],
      err => {
        err
          ? console.error('Error in deployment:', err)
          : console.log(colors.green.bold('\n\nDEPLOYMENT SUCCESSFUL!\n'))
      }
    )
  } else console.log('Invalid pass code. Exiting...')
}

main()

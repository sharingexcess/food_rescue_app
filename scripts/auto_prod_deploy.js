const { exec } = require('child_process');
const colors = require('colors');
const { series } = require('async');
const git = require('git-state')
const pjson = require('../package.json')

require('dotenv').config({ path: 'environments/.env.prod' }); // eslint-disable-line

function getVersion() {
    // eslint-disable-next-line
    console.log(pjson.version);
    return pjson.version;
}

async function validateGitState() {
    return new Promise(res => {
        git.check('.', (err, result) => {
            if (err) throw err;
            console.log(colors.yellow.bold('Validating Git State:\n'), result, '\n');
            if (result.branch !== 'master') {
                console.error(colors.red.bold('Cannot deploy to production from branch other than master. Exiting...\n'));
                res(false);
            } else {
                console.log(colors.green('\nGit state validated.'));
                res(true);
            }
        });
    });
}

async function runCommand(command, callback) {
    console.log(colors.yellow('\n\nRUNNING:', command));
    const process = exec(command, error => {
        console.log(colors.green('\n\nCOMPLETED:', command));
        if (error) console.error(error); else callback();
    });
    process.stdout.on('data', data => {
        console.log(data.toString());
    });
}

async function main() {
    if (await validateGitState()) {
        series([
            callback => runCommand('cp environments/.env.prod .env.production.local',callback),
            callback => runCommand('rm -rf build', callback),
            callback => runCommand('rm -rf node_modules', callback),
            callback => runCommand('npm ci', callback),
            callback => runCommand('npm run build', callback),
            callback => runCommand('rm .env.production.local', callback),
            callback => runCommand('cp environments/firebase.prod.json firebase.json',callback),
            callback => runCommand('firebase use prod', callback),
            callback => runCommand('firebase deploy --only hosting:sharingexcess',callback),
            callback => runCommand('cp environments/firebase.dev.json firebase.json',callback),
            callback => runCommand('firebase use default', callback),
            callback => runCommand(`SENTRY_AUTH_TOKEN=${
                process.env.SENTRY_AUTH_TOKEN
            } sentry-cli releases --org sharingexcess -p rescue new ${getVersion()}`,callback),
            callback => runCommand(`SENTRY_AUTH_TOKEN=${
                process.env.SENTRY_AUTH_TOKEN
            } sentry-cli releases --org sharingexcess -p rescue deploys ${getVersion()} new -e production`,callback),
            callback => runCommand(`SENTRY_AUTH_TOKEN=${
                process.env.SENTRY_AUTH_TOKEN
            } sentry-cli releases --org sharingexcess -p rescue finalize ${getVersion()}`,callback)
        ], err => {
            err ? console.error('Error in deployment:', err) : console.log(colors.green.bold('\n\nDEPLOYMENT SUCCESSFUL!\n'));
        });
    } else console.log('Invalid Git branch. Exiting...')
}
  
main()
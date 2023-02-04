# Sharing Excess Food Rescue App

Welcome to the Food Rescue App! This project is managed by **[Sharing Excess](https://sharingexcess.com)**, a 501(c)(3) nonprofit organization based in Philadelphia, PA. The FRA is a [Progressive Web App](https://web.dev/progressive-web-apps/), built as a single web codebase to run in any browser, or installed as a "native" app on both iOS and Android.

We use this app to coordinate, track and measure food rescue work across the country, picking up surplus food from food businesses and redistributing it to local nonprofits and mutual aid groups. To read more on SE, feel free to visit our [about page](https://sharingexcess.com/about).

The app is hosted at [app.sharingexcess.com](https://app.sharingexcess.com), with a testing environment also live at [app.dev.sharingexcess.com](https://app.dev.sharingexcess.com).

## Tech Stack 🤖

The FRA includes two apps within the repo.

**Client**: We use [React.js](https://reactjs.org/) initialized with [Create React App](https://github.com/facebook/create-react-app) in the `frontend` subdirectory for a single page app (SPA) frontend architecture.
**Server**: We use [Node.js](https://nodejs.org/en/) with [Express](https://expressjs.com/) in the `backend` subdirectory for our API, hosted using Firebase Functions as a "serverless" backend architecture.
**CI/CD**: We use [Github Actions](https://github.com/features/actions) for automated DEV deployment, and manual PROD deployment - more details below.

### 3rd party resources:

[**Firebase**](https://firebase.com/): Our backend is entirely hosted via Google's Firebase platform, including Auth, Database (Firestore), Serverless Functions (Cloud Functions), Hosting, and Storage (used primarily for data backup). We have 2 firebase projects for our 2 active environments, `sharing-excess-dev` and `sharing-excess-prod`.

[**Chakra UI**](https://chakra-ui.com/): We use Chakra for our frontend design system and UI component structure. Our theme definition can be found at `frontend/src/styles/theme.js`.

[**Github Encrypted Secrets**](https://docs.github.com/en/actions/security-guides/encrypted-secrets): We use Github Secrets to manage our secrets and keys for our automated deployments. These are grouped by `DEV` and `PROD` environments, each containing an `ENV_FRONTEND` and `ENV_BACKEND` secret, which maps directly to the secret files we maintain locally. These are written to local files during the deployment process in Github Actions, and read into the builds with [dotenv](https://www.npmjs.com/package/dotenv).

[**Sentry**](https://sharingexcess.sentry.io/projects/): We use Sentry for error detection and tracking in both our frontend and backend code. For access, reach out to tech@sharingexcess.com.

[**Google APIs**](https://console.cloud.google.com/): We use 3 primary Google APIs: Calendar, Maps, and Directions. Calendar is used for creating events for each individual rescue, which by default send notifications via email to users. Maps and Directions are used to display the route a driver will take for retail rescues.

[**Prettier**](https://prettier.io/): We use Prettier as a code formatter, alongside [ESLint](https://eslint.org/). Strongly recommend installing both plugins to VSCode to take advantage of automatic formatting to maintain stylistic consistency!

## Getting Started 🏁

We use `yarn` to install dependencies and run the app locally.

**\*Note from a maintainer**: choose whatever versions work for you, but I can tell you I'm running the app currently with Node v16.15.1 and Yarn 1.22.19 :)\*

Before you get started, you'll need to retrieve a git-ignored `environments` directory and add it at the root level. This can be found in a `.zip` in a pinned message in our private slack channel (yeah I know, security is hard, but you don't have em eh? So it's not, not working...)

Reach out to tech@sharingexcess.com to get Slack access.

After cloning the repo, you should simply need to run `yarn install:all` to install dependencies for both the `frontend` React app and `backend` Node/Express app. Then run `yarn dev` or `yarn prod` to run both apps simultaneously using [concurrently](https://www.npmjs.com/package/concurrently) against the Firebase backend environment of your choice. Don't be silly and use `prod` if you don't have a _really_ good reason and know what you're doing, pls.

## Authentication 🥸

We use [Firebase Auth](https://firebase.google.com/docs/auth), and currently only support Google OAuth as a sign-in method. This is a conscious choice, which means we don't have to handle account merging, and also are protected from phishing, at least so far as someone can mass create Google accounts 😅

When a user signs in for the first time, they will be guided through a brief onboarding process, which results in them having a `public_profile` record created. The `Auth` context inside the React app ensures that there's an active Auth user, and a `public_profile` with a matching UID in order to view the inside of the app.

There's a second collection of profile records `private_profiles` which contains sensitive user data such as Driver's License and insurance information. This data is not accessible by any API endpoint, but is checked alongside the public profile, and returned as a boolean whether it is complete or not. A completed `private_profile` is required for some actions within the app, such as claiming a rescue that requires driving.

## Permissions 🦸

Currently, we support 3 permission levels, `standard`, `admin`, and `null`. A user's permission is stored as a property of their `public_profile`, and can only be updated by another user with `admin` level permission. User's permission can be updated from inside the app at `people/[user_id]`.

`standard` permission allows a user to claim, start, update and complete rescues assigned to them. They also have `read` level access throughout the majority of the app, including on the People and Organization pages. `admin` permission is required for the majority of `create`, `update`, or `delete` actions, including creating and editing rescues, organizations, and locations.

## Deployment (CI/CD) ⚙️

All of the app's hosting and deployment processes are run through Firebase and Github Actions. We continuously deploy to the development environment any time a Pull Request is merged into the `main` branch. Production deploys must be invoked manually, and require approval from a lead maintainer before they run.

As a best practice, we like to make a commit to the `main` branch bumping the version number in `package.json`, `frontend/package.json`, and `backend/package.json` before deploying to production. The commit message should simply be the new version number, so it's easy to see in the Github Actions history (ex. `git commit -m "v1.1.1"`).

## More Resources! 🤓

In general, visit the [Wiki](https://github.com/sharingexcess/food_rescue_app/wiki) to learn more of the nitty-gritty on how the app works. Specifically, we have pages with basic [Terminology](https://github.com/sharingexcess/food_rescue_app/wiki/1.-Terminology) used throughout the app, as well as a more granular [Data Model](https://github.com/sharingexcess/food_rescue_app/wiki/2.-Data-Model) showing the specific DB fields present in each collection.

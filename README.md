# Sharing Excess Food Rescue Web Application

![Sharing Excess Logo](public/logo192.png)

## Contributors

Ryan McHenry \
Luke Shin \
Abdullah Dawud \
Sam Nguyen \
Armando Parra 

## Tech Stack 🤖

The Rescue Web App is built using React, Redux, and Sass on the frontend, and Google Cloud Platform Firebase on the backend.\
React Hooks and Redux Toolkit provide a lightweight and scalable client side app, and Firebase bundles authentication, storage, and API services for a minimal management solution.

This project was created using [Create React App](https://github.com/facebook/create-react-app).

## Getting Started 🏁

_\* In order to run the application locally, you'll need **[node](https://nodejs.org/en/download/)** and **[npm](https://www.npmjs.com/get-npm)** installed on your computer._

_\* You'll also need to request environment files from an admin to connect to the Firebase API._

1. Open the terminal on your computer.
2. Clone this git repo wherever you want the code to live in your file system by running:
   `git clone git@github.com:sharingexcess/rescue.git`
3. Move into the newly cloned directory by running:
   `cd rescue`
4. Install the application's dependencies from NPM by running:
   `npm install` _(or `npm i` for short)_
5. Start the application locally by running:
   `npm run dev`
   This should open your browser automatically to `localhost:3000`, where you'll see the application running.

## Best Practices We Like 👍

### `React/JS ⚙️`

- We use function-based React components with Hooks throughout the client side application.
- Components are kept in the `src/components` directory
- Each component has a directory with it's name, containing a `.js` and `.scss` file sharing the same name
  ```
  - components
    - MyComponent
      - MyComponent.js
      - MyComponent.scss
    - AnotherComponent
      - AnotherComponent.js
      - AnotherComponent.scss
  ```
- Shared JS logic (custom hooks, global helper functions, constants, etc.) can be found in the `/src/helpers` directory
- **[FontAwesome](https://fontawesome.com/icons?d=gallery)** is setup to be used for icons, which can be used like this: `<i className='fa fa-[your icon name]/>`
- Images that need to be publicly available (favicons, app icons, logos, etc.) should be stored in the `/public` directory, while images used inside the UI can be stored in `src/assets`.
- **SVG images are always preferred**. They're smaller, load faster, and scale without pixelation. Win win!

### `Styling (sass/scss) 🎨`

- `SCSS` files are kept in two locations: global styles in `src/styles`, and component specific styles in their respective component directories (see above for details).
- **`index.scss`** is used for basic global styles and browser overrides. It also handles imports for all other global `.scss` files.
- **`reset.scss`** is an imported stylesheet that handles normalizing behavior on legacy browsers. Leave it be. It's happy.
- **`global.scss`** handles global styles for the application as a whole. Think: how buttons look across the entire app.
- **`animations.scss`** contains any and all `keyframes` definitions so they're not duplicated around the app.
- And _finally_ **`imports.scss`** contains all SASS variable definitions. This file should be imported at the top of all component `.scss` files to have access to any predefined colors, sizes, etc.

### `Environments 🌍`

- There are currently 2 environments set up, **development** and **production**.
- `.env` files are stored in `/environments`, and should be named `.env.[enviroment name]`.
- **_`.env` FILES ARE NOT STORED IN THE GIT REPO._** This is an obviously huge security risk. The `/environments` directory and all `.env` files are already protected in the `.gitignore` file, but be sure not to share those files. You'll need to contact an admin to get any `.env` files you don't already have.
- We use the scripts `npm run dev` and `npm run prod` to copy the correct `.env` file to `.env.local`, which will then be used to start the local development environment.

## Admin Access 💪

We use Firebase Auth's built-in `custom-claims` configuration to add Admin level permissions to user accounts. Inside the `Auth.js` React component, we provide stateful data on whether or not the current authenticated user is an admin in the `AuthContext`. That boolean state can be accessed in any component using:

`const { admin } = useContext(AuthContext)`

To protect admin level access inside the web app, we use `React lazy` to dynamically import all Admin level components. We also separate Admin routes into their own file, `routes/AdminRoutes.js`.

These protections ensure that if the authenticated user is not an admin, the front-end admin code will never be accessible to the browser.

## Version Control Practices 🌳

Surprise! We use **GitHub** for all of our version control excitement.

In order to avoid merge conflicts, we use the following patterns to work together as seamlessly as possible:

- Always develop on a branch. Always.
- To start a new branch, ensure you have the latest version of the `master` branch with `git checkout master` and `git pull origin master`, then run `git checkout -b myNewBranch`
- If you need to continue working on a branch while master is updated, use `rebase` to move your branch up to the latest version. First, checkout and pull the latest version of `master`. Then, checkout your branch, and run `git rebase master`. Follow the prompts to resolve any conflicts, and after the rebase is complete, use `git push origin myBranchName -f` to force update your branch remotely.
- When your branch is ready for prime time, open a `Pull Request`.
- **Never merge a branch directly into master without a pull request.** Committing or merging directly to master will automatically deploy code to the development endpoint, and should never occur without a reviewed pull request with approval.

## Deployment (CI/CD) ⚙️

All of the app's hosting and deployment processes are run through Firebase. Using **`Github Actions`**, we continuously deploy to the development endpoint any time a Pull Request is merged into the `master` branch. For more information on that process, checkout the scripts in the `/.github` directory.

Production deploys must be done manually so as to avoid any accidental breaking changes going out unintentionally. In order to do this, use the script `npm run deploy:prod` (see below for more info). That script is password protected, so contact an admin if you need to use it.

All of our CI/CD pipeline is auto-generated using Firebase CLI tools, and the scripts shouldn't need to be altered by hand.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run prod`

Runs the app in the PRODUCTION mode (using prod API and database).\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app in a minified production form into the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm deploy:prod`

This is the big one. The terminal command is a attached to a node script `scripts/prod_deploy.js`. This script will run a series of commands to (as safely as possible) deploy your local version of the web app to the production endpoint. The script will do the following

1.  Check your current git state to ensure that you are on the `master` branch with no local changes.
2.  Request a pass code confirmation to ensure that not just anyone can run a prod deploy (the sha256 hash of the pass code is saved in the script).
3.  Move the production environment vars file into the root directory temporarily.
4.  Delete your current `/build` and `node_modules` directories to ensure that a fresh build is created.
5.  Install all npm dependencies using `npm ci`
6.  Build the application in a minified, production ready form using `npm run build`
7.  Remove the temporary production environment variables file from the root directory
8.  Assume the `prod` role through the Firebase CLI
9.  Deploy the app to the firebase prod endpoint
10. Restore the `default` role through the Firebase CLI

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

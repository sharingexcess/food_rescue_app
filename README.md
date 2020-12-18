# Sharing Excess Food Rescue Web Application

![Sharing Excess Logo](public/logo192.png)

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

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run prod`

Runs the app in the PRODUCTION mode (using prod API and database).\
\_production database has not yet been configured.\*
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app in a minified production form into the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

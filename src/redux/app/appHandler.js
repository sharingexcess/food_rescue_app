// This file is REDUX MIDDLEWARE. We use middleware to run async logic like login and logout.
// It's important to do this *outside* of the actual reducer logic,
// so that the reducers are always pure functions (no side effects).
// Read more about redux middleware:
// https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-middleware-to-enable-async-logic

// appHandler is a wrapper function, around a wrapper function, around a wrapper function.
// This seems super scary => it's not. Think of it as a function with 3 arguments.

// storeAPI: this is literally just the redux store object, plain and simple.
// next: this is the function call to the actual reducer itself.
// action: this is what was passed into the dispatch function call.
//         it'll have a 'type' field denoting which reducer to run,
//         and a 'payload' field with the actual data it wants to pass.

// We'll commonly call next(action) at the end of a handler function to pass the action on to the reducer.

// appHandler is currently an empty function that will always just pass the data straight to the reducer.
// we'll keep this logic here in case we want to add functionality like we do in authHandler later.
const appHandler = storeAPI => next => action => {
  switch (action.type) {
    case 'app/setDarkMode':
      document.body.className = action.payload ? 'dark-theme' : 'light-theme'
      localStorage.setItem('darkMode', action.payload)
      return next(action)
    default:
      return next(action)
  }
}

export default appHandler

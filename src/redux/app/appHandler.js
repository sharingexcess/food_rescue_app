const appHandler = (storeAPI) => (next) => (action) => {
  switch (action.type) {
    default:
      return next(action)
  }
}

export default appHandler

import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

export default function configureStore(initialState) {
  const store = createStore(
    combineReducers(require('./reducers')),
    initialState,
    applyMiddleware(thunk, createLogger()),
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextRootReducer = combineReducers(require('./reducers'))
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}

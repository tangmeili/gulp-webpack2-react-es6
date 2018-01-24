/**
 * Created by Administrator on 2017/8/28.
 */
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger'

import reducer from './reducer'
const { createStore, applyMiddleware, compose } = Redux
var store

if(process.env.NODE_ENV !== 'production') {
  store = applyMiddleware(thunk,createLogger())(createStore)(reducer)
} else {
  store = applyMiddleware(thunk)(createStore)(reducer);
}

export default store
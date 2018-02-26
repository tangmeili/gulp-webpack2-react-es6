/**
 * Created by Administrator on 2017/9/11.
 */

import '../common/utils/lib'
import {Route, HashRouter, NavLink, Redirect, Switch} from 'react-router-dom';
import {Provider} from 'react-redux'
import '../css/common.less'

import store from '../common/redux/store'
import Test from '../component/test/test.component'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentWillMount() {

  }

  render() {
    return (
      <div>
        <h>Hello World</h>
        <Test/>
      </div>

    )
  }
}

ReactDOM.render(<App/>, document.getElementById('container'))

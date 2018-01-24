import {
  Route, Redirect
} from 'react-router-dom';

import UpdatePwd from './updatePwd'

class Mycenter extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match} = this.props
    return (
      <div id="wrap">
        <div className="content">
          <Route exact path={`${match.url}`} render={() => {
            return <Redirect to={`${match.url}/index`}/>
          }}/>
          <Route exact path={`${match.url}/index`} component={(props) => <UpdatePwd {...props}/> }/>
        </div>
      </div>
    )
  }

}

export default Mycenter
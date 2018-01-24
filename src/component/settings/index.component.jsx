import {
  Route, Redirect
} from 'react-router-dom';

import Info from './info.component'

class Setting extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match} = this.props
    return (
      <div id="wrap">
        <div className="content" style={{marginTop: 44}}>
          <Route exact path={`${match.url}`} render={() => {
            return <Redirect to={`${match.url}/index`}/>
          }}/>
          <Route exact path={`${match.url}/index`} component={(props) => <Info {...props}/> }/>
        </div>
      </div>
    )
  }

}

export default Setting
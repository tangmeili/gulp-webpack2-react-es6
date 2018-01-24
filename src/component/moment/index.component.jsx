import {
  Route, Redirect
} from 'react-router-dom';

import List from './list.component'
import Attention from './attention.component'
import DetailForm from './detail.component'


class Live extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match} = this.props
    return (
      <div>
        <Route exact path={`${match.url}`} render={() => {
          return <Redirect to={`${match.url}/list`}/>
        }}/>
        <Route exact path={`/moment/audit/list`} component={(props) => <List {...props}/> }/>
        <Route exact path={`/moment/attention/list`} component={(props) => <Attention {...props}/> }/>
        <Route path={`/moment/audit/list/edit/:id`}
               component={(props) => <DetailForm {...props}/> }/>
      </div>
    )
  }
}

export default Live
import {
  Route, Redirect
} from 'react-router-dom';

import List from './list.component'
import KeyList from './key_list.component'
import DetailForm from './detail.component'


class Recommend extends React.Component {
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
        <Route exact path={`/recommend/video/list`} component={(props) => <List {...props}/> } />
        <Route exact path={`/recommend/key/list`} component={(props) => <KeyList {...props}/> } />
        <Route path={`/recommend/video/list/add`} component={(props) => <DetailForm {...props}/> } />
        <Route path={`/recommend/video/list/edit/:id`} component={(props) => <DetailForm {...props}/> } />
      </div>
    )
  }
}

export default Recommend
import {
  Route, Redirect
} from 'react-router-dom';

import List from './list.component'
import VodCategory from './category.component'
import DetailForm from './detail.component'


class Live extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match, operate} = this.props
    return (
      <div>
        <Route exact path={`${match.url}`} render={() => {
          if(match.url.indexOf('category') > -1) {
            return <Redirect to={`${match.url}/index`}/>
          }
          return <Redirect to={`${match.url}/list`}/>
        }}/>
        <Route exact path={`${match.url}/list`} render={(props) => <List operate={operate} {...props}/> }/>
        <Route exact path={`${match.url}/index`} render={(props) => <VodCategory operate={operate} {...props}/> }/>
        <Route path={`${match.url}/list/add`} render={(props) => <DetailForm operate={operate} {...props}/> }/>
        <Route path={`${match.url}/list/edit/:id`}
               render={(props) => <DetailForm operate={operate} {...props}/> }/>
      </div>
    )
  }
}

export default Live
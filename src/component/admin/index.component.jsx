import {
  Route, Link, Redirect
} from 'react-router-dom';
import List from './list.component'
import RoleList from './role_list.component'
import DetailForm from './detail.component'


class Admin extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match, operate} = this.props
    return (
      <div>
        <Route exact path={`${match.url}`} render={() => {
          return <Redirect to={`${match.url}/index`}/>
        }}/>
        <Route exact path='/admin/list/index' component={(props) => <List {...props}/> }/>
        <Route exact path='/admin/role/index' component={(props) => <RoleList {...props}/> }/>
        <Route path={`${match.url}/index/add`} component={(props) => <DetailForm operate={operate} {...props}/> }/>
        <Route exact path={`${match.url}/index/edit/:id`}
               component={(props) => <DetailForm operate={operate} {...props}/> }/>
        <Route path={`${match.url}/index/edit/:id/:type`}
               component={(props) => <DetailForm operate={operate} {...props}/> }/>
      </div>
  )
  }
}

export default Admin
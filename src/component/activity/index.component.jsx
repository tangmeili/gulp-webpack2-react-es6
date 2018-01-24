import {
  Route, Redirect
} from 'react-router-dom';

import List from './list.component'
import MaterialList from './material_list.component'
import MaterialDetail from './material_detail.component'
import DetailForm from './detail.component'


class Activity extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match, operate} = this.props
    debugger
    return (
      <div>
        <Route exact path={`${match.url}`} render={() => {
          if(match.url.indexOf('material') > -1) {
            return <Redirect to={`${match.url}/index`}/>
          }
          return <Redirect to={`${match.url}/list`}/>
        }}/>
        <Route exact path={`${match.url}/list`} component={(props) => <List operate={operate} {...props}/> }/>
        <Route exact path={`${match.url}/index`} component={(props) => <MaterialList {...props}/> }/>
        <Route exact path={`${match.url}/index/edit/:id`} component={(props) => <MaterialDetail {...props}/> }/>
        <Route path={`${match.url}/list/add`} component={(props) => <DetailForm operate={operate} {...props}/> }/>
        <Route path={`${match.url}/list/edit/:id`}
               component={(props) => <DetailForm operate={operate} {...props}/> }/>
      </div>
    )
  }
}

export default Activity
import {
  Route, Link, Redirect
} from 'react-router-dom';
import {Breadcrumb, Icon} from 'antd';

import List from './list.component'
import DetailForm from './detail.component'

class Live extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match, location, operate} = this.props
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Link to={`${match.url}`}>
              <Icon type="user"/>
              <span>直播列表</span>
            </Link>
          </Breadcrumb.Item>
          {location.pathname.indexOf('add') > 0 &&
          <Breadcrumb.Item>
            新增直播
          </Breadcrumb.Item>}
          {location.pathname.indexOf('edit') > 0 &&
          <Breadcrumb.Item>
            直播详情
          </Breadcrumb.Item>}
        </Breadcrumb>
        <div className="content">
          <Route exact path={`${match.url}`} render={() => {
            return <Redirect to={`${match.url}/list`}/>
          }}/>
          <Route exact path={`${match.url}/list`} component={(props) => <List operate={operate} {...props}/> }/>
          <Route path={`${match.url}/list/add`} component={(props) => <DetailForm operate={operate} {...props}/> }/>
          <Route path={`${match.url}/list/edit/:id`}
                 component={(props) => <DetailForm operate={operate} {...props}/> }/>
        </div>
      </div>
    )
  }
}

export default Live
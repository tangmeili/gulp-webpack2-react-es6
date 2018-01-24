import {
  Route, Link, Redirect
} from 'react-router-dom';
import {Breadcrumb, Icon} from 'antd';

import List from './list.component'
import DetailForm from './detail.component'

class User extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match, location} = this.props
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Link to={`${match.url}`}>
              <Icon type="user"/>
              <span>用户列表</span>
            </Link>
          </Breadcrumb.Item>
          {location.pathname.indexOf('edit') > 0 &&
          <Breadcrumb.Item>
            用户详情
          </Breadcrumb.Item>}
        </Breadcrumb>
        <div className="content">
          <Route exact path={`${match.url}`} render={() => {
            return <Redirect to={`${match.url}/index`}/>
          }}/>
          <Route exact path={`${match.url}/index`} component={(props) => <List {...props}/> }/>
          <Route path={`${match.url}/index/edit/:id`}
                 component={(props) => <DetailForm {...props}/> }/>
        </div>
      </div>
    )
  }

}

export default User
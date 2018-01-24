/**
 * Created by Administrator on 2017/8/9.
 */
import {Link} from 'react-router-dom'
import {Menu, Dropdown, Icon} from 'antd';

import AppService from '../common/utils/app.service'
import Utils from '../common/utils/utils'

const logout = () => {
  AppService.postRequest('login/admin/logout').then((response) => {
    if (response.errorCode == 0) {
      location.href = './login.html'
    } else {
      Utils.dialog.error(response.msg)
    }
  })
}
const menu = (
  <Menu>
    <Menu.Item key="0">
      <Link to={'/myCenter/updatePwd'}><Icon type="setting"/>修改密码</Link>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="1">
      <a onClick={logout}><Icon type="logout"/>退出登录</a>
    </Menu.Item>
  </Menu>
);


class _Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loginName: '管理员'
    }
  }

  render() {
    return (
      <div style={{float: "right"}}>
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link">
            <Icon type="user"/>{this.props.loginName} <Icon type="down"/>
          </a>
        </Dropdown>
      </div>
    )
  }
}
export default _Header
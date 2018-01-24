/**
 * Created by Administrator on 2017/9/11.
 */

import '../common/utils/lib'
import 'react-quill/dist/quill.snow.css';
import {Route, HashRouter, NavLink, Redirect, Switch} from 'react-router-dom';
import {Provider} from 'react-redux'
import {Menu, Icon, Layout} from 'antd';
const SubMenu = Menu.SubMenu;
const {Header, Content, Sider} = Layout
import '../css/common.less'

import AppService from '../common/utils/app.service'
import Utils from '../common/utils/utils'

import store from '../common/redux/store'
import _Header from '../component/header.component'
import ScrollToTop from '../component/scrollToTop.component'
import Live from '../component/live/index.component'
import Vod from '../component/vod/index.component'
import Recommend from '../component/recommend/index.component'
import Moment from '../component/moment/index.component'
import Activity from '../component/activity/index.component'
import Comment from '../component/comment/index.component'
import Statistics from '../component/statistics/index.component'
import Admin from '../component/admin/index.component'
import Setting from '../component/settings/index.component'
import User from '../component/user/index.component'
import Feedback from '../component/feedback/index.component'
import Mycenter from '../component/myCenter/index.component'
import NoAuthority from '../component/error/no_ authority.component'
import NotFound from '../component/error/not_found.component'

const navs = [
  {
    key: 'live',
    name: '直播管理',
    icon: 'video-camera',
    children: [
      {
        key: 'live_publish',
        name: '发布'
      },
      {
        key: 'live_audit',
        name: '审核'
      },
      {
        key: 'live_push',
        name: '上架'
      },
    ]
  },
  {
    key: 'vod',
    name: '点播',
    icon: 'play-circle-o',
    children: [
      {
        key: 'vod_category',
        name: '分类管理'
      },
      {
        key: 'vod_publish',
        name: '发布'
      },
      {
        key: 'vod_audit',
        name: '审核'
      },
      {
        key: 'vod_push',
        name: '上架'
      },
    ]
  },
  {
    key: 'recommend',
    name: '推荐管理',
    icon: 'like',
    children: [
      {
        key: 'recommend_video',
        name: '视频推荐'
      },
      {
        key: 'recommend_key',
        name: '搜索关键词'
      },
    ]
  },
  {
    key: 'moment',
    name: '短视频管理',
    icon: 'eye-o',
    children: [
      {
        key: 'moment_attention',
        name: '特别关注'
      },
      {
        key: 'moment_audit',
        name: '审核'
      },
    ]
  },
  {
    key: 'activity',
    name: '活动管理',
    icon: 'rocket',
    children: [
      {
        key: 'activity_publish',
        name: '发布'
      },
      {
        key: 'activity_audit',
        name: '审核'
      },
      {
        key: 'activity_push',
        name: '上架'
      },
      {
        key: 'activity_material',
        name: '素材管理'
      },
    ]
  },
  {
    key: 'comment',
    name: '评论管理',
    icon: 'message',
    children: [
      {
        key: 'comment_comment',
        name: '评论管理'
      },
      {
        key: 'comment_report',
        name: '举报管理'
      },
      {
        key: 'comment_sensitive',
        name: '敏感词'
      },
      {
        key: 'comment_forbid',
        name: '禁言管理'
      },
    ]
  },
  {
    key: 'statistics',
    name: '数据统计',
    icon: 'area-chart',
    children: [
      {
        key: 'statistics_key',
        name: '搜索关键词'
      },
      {
        key: 'statistics_setting',
        name: '统计设置'
      },
      {
        key: 'statistics_live',
        name: '直播统计'
      },
      {
        key: 'statistics_vod',
        name: '点播统计'
      },
      {
        key: 'statistics_moment',
        name: '短视频'
      },
    ]
  },
  {
    key: 'admin',
    name: '管理员',
    icon: 'user',
    children: [
      {
        key: 'admin_role',
        name: '角色管理'
      },
      {
        key: 'admin_list',
        name: '管理员'
      },
    ]
  },
  {
    key: 'settings_info',
    name: '基础设置',
    icon: 'setting',
    children: []
  },
  {
    key: 'user_list',
    name: '小程序用户',
    icon: 'team',
    children: []
  },
  {
    key: 'feedback_list',
    name: '用户反馈',
    icon: 'folder',
    children: []
  }]

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultSelectedKeys: 'live_publish',
      defaultOpenKeys: 'live',
      loginName: '',
      permission: []
    }
  }

  componentWillMount() {
    debugger
    let _this = this
    AppService.getRequest('admin/mycenter/getLoginUser').then(response => {
      debugger
      if (response.data) {
        _this.setState({
          loginName: response.data.userName,
          permission: response.data.permission
        })
      }
    })
    if (window.location.hash == '#/' || window.location.hash == '') {
      return
    }
    let path = window.location.hash.substring(1).split('/')
    this.setState({
      defaultSelectedKeys: path[1] + '_' + path[2],
      defaultOpenKeys: path[1],
    })
  }

  getMenuItem = () => {
    let _this = this
    return navs.map(record => {
      if (record.children.length == 0 && this.state.permission.indexOf(record.key) > -1) {
        return ( <Menu.Item key={record.key}>
          <NavLink to={this.getLinkUrl(record.key)}> <Icon type={record.icon}/><span
            className="nav-text">{record.name}</span></NavLink>
        </Menu.Item>)
      } else if (record.children.length != 0) {
        function hasPermission(item) {
          return _this.state.permission.indexOf(item.key) > -1
        }

        if (record.children.some(hasPermission)) {
          return (
            <SubMenu key={record.key} title={<span><Icon type={record.icon}/>{record.name}</span>}>
              {
                record.children.map(item => {
                  if (_this.state.permission.indexOf(item.key) > -1) {
                    return (
                      <Menu.Item key={item.key}>
                        <NavLink to={this.getLinkUrl(item.key)}> <span className="nav-text">{item.name}</span></NavLink>
                      </Menu.Item>
                    )
                  }
                })
              }
            </SubMenu>
          )
        }
      }
    })
  }

  getLinkUrl = (data) => {
    return `/${data.split('_').join('/')}`
  }

  authority = (permission, component) => {
    if (this.state.permission.indexOf(permission) > -1) {
      return component
    } else {
      return <NoAuthority/>
    }
  }

  render() {
    let _this = this
    return (
      <Provider store={store}>
        <HashRouter>
          <Layout>
            <Sider
              trigger={null}
              collapsible
              collapsed={false}
            >
              <div className="logo">无限极后台管理</div>
              <Menu theme="dark" mode="inline" defaultSelectedKeys={[this.state.defaultSelectedKeys]}
                    defaultOpenKeys={[this.state.defaultOpenKeys]}>
                {this.getMenuItem()}
              </Menu>
            </Sider>
            <Layout>
              <Header>
                <_Header loginName={this.state.loginName}></_Header>
              </Header>
              <Content style={{margin: '0px 16px', position: 'relative'}}>
               <ScrollToTop>
                  <Switch>
                    <Route exact={true} path='/' render={() => {
                      let url = ''
                      if (_this.state.permission.length) {
                        navs.some(record => {
                          if (record.children.length) {
                            return record.children.some(item => {
                              if (_this.state.permission.indexOf(item.key) > -1) {
                                url = _this.getLinkUrl(item.key)
                                return true
                              }
                            })
                          } else {
                            if (_this.state.permission.indexOf(record.key) > -1) {
                              url = _this.getLinkUrl(record.key)
                              return true
                            }
                          }
                        })
                        return <Redirect to={url}/>
                      } else {
                        return <NoAuthority/>
                      }
                    }}/>
                    <Route path='/live/publish' render={(props) => {
                      return _this.authority('live_publish', <Live operate="publish" {...props}/>)
                    }}/>
                    <Route path='/live/audit' render={(props) => {
                      return _this.authority('live_audit', <Live operate="audit" {...props}/>)
                    }}/>
                    <Route path='/live/push' render={(props) => {
                      return _this.authority('live_push', <Live operate="push" {...props}/>)
                    }}/>
                    <Route path='/vod/category' render={(props) => {
                      return _this.authority('vod_category', <Vod {...props}/>)
                    }}/>
                    <Route path='/vod/publish' render={(props) => {
                      return _this.authority('vod_publish', <Vod operate="publish" {...props}/>)
                    }}/>
                    <Route path='/vod/audit' render={(props) => {
                      return _this.authority('vod_audit', <Vod operate="audit" {...props}/>)
                    }}/>
                    <Route path='/vod/push' render={(props) => {
                      return _this.authority('vod_push', <Vod operate="push" {...props}/>)
                    }}/>
                    <Route path='/recommend/key' render={(props) => {
                      return _this.authority('recommend_key', <Recommend {...props}/>)
                    }}/>
                    <Route path='/recommend/video' render={(props) => {
                      return _this.authority('recommend_video', <Recommend {...props}/>)
                    }}/>
                    <Route path='/moment/attention' render={(props) => {
                      return _this.authority('moment_attention', <Moment {...props}/>)
                    }}/>
                    <Route path='/moment/audit' render={(props) => {
                      return _this.authority('moment_audit', <Moment {...props}/>)
                    }}/>
                    <Route path='/activity/publish' render={(props) => {
                      return _this.authority('activity_publish', <Activity operate="publish" {...props}/>)
                    }}/>
                    <Route path='/activity/audit' render={(props) => {
                      return _this.authority('activity_audit', <Activity operate="audit" {...props}/>)
                    }}/>
                    <Route path='/activity/push' render={(props) => {
                      return _this.authority('activity_push', <Activity operate="push" {...props}/>)
                    }}/>
                    <Route path='/activity/material' render={(props) => {
                      return _this.authority('activity_material', <Activity operate="push" {...props}/>)
                    }}/>
                    <Route path='/comment/comment' render={(props) => {
                      return _this.authority('live_publish', <Comment {...props}/>)
                    }}/>
                    <Route path='/comment/sensitive' render={(props) => {
                      return _this.authority('comment_sensitive', <Comment {...props}/>)
                    }}/>
                    <Route path='/comment/report' render={(props) => {
                      return _this.authority('comment_report', <Comment {...props}/>)
                    }}/>
                    <Route path='/comment/forbid' render={(props) => {
                      return _this.authority('comment_forbid', <Comment {...props}/>)
                    }}/>
                    <Route path='/statistics/key' render={(props) => {
                      return _this.authority('statistics_key', <Statistics {...props}/>)
                    }}/>
                    <Route path='/statistics/setting' render={(props) => {
                      return _this.authority('statistics_setting', <Statistics {...props}/>)
                    }}/>
                    <Route path='/statistics/live' render={(props) => {
                      return _this.authority('statistics_live', <Statistics {...props}/>)
                    }}/>
                    <Route path='/statistics/vod' render={(props) => {
                      return _this.authority('statistics_vod', <Statistics {...props}/>)
                    }}/>
                    <Route path='/statistics/moment' render={(props) => {
                      return _this.authority('statistics_moment', <Statistics {...props}/>)
                    }}/>
                    <Route path='/admin/role' render={(props) => {
                      return _this.authority('admin_role', <Admin  {...props}/>)
                    }}/>
                    <Route path='/admin/list' render={(props) => {
                      return _this.authority('admin_list', <Admin  {...props}/>)
                    }}/>
                    <Route path='/settings/info' render={(props) => {
                      return _this.authority('settings_info', <Setting  {...props}/>)
                    }}/>
                    <Route path='/user/list' render={(props) => {
                      return _this.authority('user_list', <User  {...props}/>)
                    }}/>
                    <Route path='/feedback/list' render={(props) => {
                      return _this.authority('feedback_list', <Feedback  {...props}/>)
                    }}/>
                    <Route path='/myCenter/updatePwd' render={(props) => {
                      return  <Mycenter {...props}/>
                    }}/>
                    <Route render={(props) => <NotFound/>}/>
                  </Switch>
               </ScrollToTop>
              </Content>
            </Layout>
          </Layout>
        </HashRouter>
      </Provider>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('container'))

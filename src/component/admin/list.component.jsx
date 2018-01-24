/**
 * Created by Administrator on 2017/8/10.
 */
import {Link} from 'react-router-dom';
import {Select, Button, Input, Popconfirm, Form, Row, Col, Table, Breadcrumb, Icon} from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
const {connect} = ReactRedux
import * as Actions from './action'

import * as CONSTANTS from '../../common/utils/constants'
import {USER_STATUS, USER_TYPE} from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

class App extends React.Component {
  state = {
    list: [],
    pagination: {},
    loading: false,
    toAuditLoading: false,
    limit: 10,
    fileters: {}
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getList();
  }

  // 删除
  onDelete = (id, index) => {
    Actions.deleteAdmin(id).then(result => {
      if (result.errorCode == 0) {
        Utils.dialog.success('删除成功')
        let list = this.state.list
        list.splice(index, 1)
        this.setState({list})
      } else {
        Utils.dialog.error(result.msg)
      }
    })
  }

  handleUpdate = (id, index) => {

  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        fileters: values
      })
      this.getList({...values})
    });
  }
  handleTableChange = (pagination, filters, sorter) => {
    const pager = {...this.state.pagination};
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.getList({
      limit: this.state.limit ? this.state.limit : 10,
      page: pagination.current,
      ...this.state.fileters
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...this.state.fileters, ...params}
    this.setState({loading: true});
    let {dispatch} = this.props
    Actions.getAdminList(params, dispatch).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.current = result.data.page;
      pagination.total = result.data.totalCount;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        loading: false,
        list: result.data.rows,
        pagination,
      });
    });
  }

  // 启用
  handleEnable = (id, index) => {
    Actions.enableAdmin(id).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('启用成功')
        let list = this.state.list
        list[index].status = 'ENABLED'
        this.setState({list})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  // 禁用
  handleDisable = (id, index) => {
    Actions.disableAdmin(id).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('禁用成功')
        let list = this.state.list
        list[index].status = 'DISABLED'
        this.setState({list})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {match} = this.props
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    };
    const colLayout = {
      xs: {span: 24},
      sm: {span: 6},
    };
    const columns = [
      {
        title: "登录账号/手机号",
        dataIndex: "loginPhone",
        key: "loginPhone"
      },
      {
        title: "昵称",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        render: (time) => {
          return Utils.formatDate(time, 'YYYY-MM-DD')
        }
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status ",
        render: (text) => {
          return CONSTANTS.USER_STATUS[text]
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id ",
        render: (id, record, index) => {
          let url = `${match.url}/edit/${id}`
          if(record.superAdmin) {
            return ''
          }
          return (
            <div>
              {CONSTANTS.USER_STATUS[record.status] == '禁用' ?
                <Popconfirm placement="left" title={'确定启用该管理员？'} onConfirm={() => this.handleEnable(id, index)}
                            okText="确定" cancelText="取消">
                  <Button icon='delete'>启用</Button>
                </Popconfirm> :
                <Popconfirm placement="left" title={'确定禁用该管理员？'} onConfirm={() => this.handleDisable(id, index)}
                            okText="确定" cancelText="取消">
                  <Button icon='delete'>禁用</Button>
                </Popconfirm>
              }
              <Popconfirm placement="left" title={'确定删除该管理员？'} onConfirm={() => this.onDelete(id, index)}
                          okText="确定" cancelText="取消">
                <Button icon='delete'>删除</Button>
              </Popconfirm>
              <Link to={url}><Button icon="edit">编辑</Button></Link>
              <Link to={`${url}/password`}><Button icon="edit">修改密码</Button></Link>
            </div>
          )
        }
      }
    ]
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Link to={`${match.url}`}>
              <Icon type="user"/>
              <span>管理员列表</span>
            </Link>
          </Breadcrumb.Item>
          {location.pathname.indexOf('add') > 0 &&
          <Breadcrumb.Item>新增管理员</Breadcrumb.Item>
          }
          {location.pathname.indexOf('edit') > 0 &&
          <Breadcrumb.Item>编辑管理员</Breadcrumb.Item>
          }
        </Breadcrumb>
        <div className="content">
          <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row
              gutter={40}>
              <Col {...colLayout} key='1'>
                <FormItem {...formItemLayout} label='昵称'>
                  {getFieldDecorator('userName')(<Input />)}
                </FormItem>
              </Col>
              <Col {...colLayout} key='2'>
                <FormItem {...formItemLayout} label='登录账号'>
                  {getFieldDecorator('loginPhone')(<Input />)}
                </FormItem>
              </Col>
              <Col {...colLayout} key='3'>
                <FormItem {...formItemLayout} label='状态'>
                  {getFieldDecorator('status', {
                    initialValue: ' '
                  })(
                    <Select style={{width: 120}}>
                      <Option value=" ">全部</Option>
                      <Option value='DISABLED'>{USER_STATUS['DISABLED']}</Option>
                      <Option value='ENABLED'>{USER_STATUS['ENABLED']}</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...colLayout} >
                <Button type="primary" className='searchBtn' htmlType="submit">查询</Button>
              </Col>
            </Row>
          </Form>
          <Link to={`${match.url}/add`}><Button type="primary" style={{margin: "0px 0px 12px"}}>新增管理员</Button></Link>
          <Table columns={columns}
                 rowKey='id'
                 dataSource={this.state.list}
                 pagination={this.state.pagination}
                 loading={this.state.loading}
                 onChange={this.handleTableChange}
          />
        </div>
      </div>
    )
  }
}

const List = connect()(Form.create()(App))
export default List



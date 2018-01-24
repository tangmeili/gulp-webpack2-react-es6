/**
 * Created by Administrator on 2017/8/10.
 */
import {Select, Button, Input, Popconfirm, Form, Modal, Table, Breadcrumb, Icon, TreeSelect} from 'antd';
const FormItem = Form.Item;
const {connect} = ReactRedux
import * as Actions from './action'

import * as CONSTANTS from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

class App extends React.Component {
  state = {
    list: [],
    pagination: {},
    loading: false,
    toAuditLoading: false,
    BoxVisible: false,
    limit: 10,
    detail: {},
    treeData: [],
    selectIndex: 0
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getList();
    this.getTreeData()
  }

  getTreeData() {
    Actions.getPermissionList().then(response => {
      if(response.errorCode == 0) {
        let treeData = []
        response.data.map(record => {
          let {permission, list} = record
          let obj = {
            label: permission.name,
            value: permission.code,
            key: permission.id,
            children: []
          }
          list.map(item => {
            obj.children.push({
              label: item.name,
              value: item.code,
              key: item.id,
            })
          })
          treeData.push(obj)
        })
        this.setState({treeData})
      }
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = {...this.state.pagination};
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.getList({
      limit: this.state.limit ? this.state.limit : 10,
      page: pagination.current
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    let {dispatch} = this.props
    Actions.getRoleList(params).then((result) => {
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

  // 删除
  onDelete = (id, index) => {
    Actions.deleteRole(id).then(result => {
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
  handleAddBtnClick = () => {
    this.setState({
      BoxVisible: true,
      detail: {}
    })
  }

  handleEditClick = (id, index) => {
    Actions.getRole(id).then(response => {
      if(response.errorCode == 0) {
        this.setState({
          BoxVisible: true,
          detail: response.data,
          selectIndex: index
        })
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if(values.permission) {
          values.permission = values.permission.join(',')
        }

        if(this.state.detail.id) {
          values.id = this.state.detail.id
          Actions.editRole(values).then(response => {
            this.setState({BoxVisible: false})
            if (response.errorCode == 0) {
              let list = this.state.list
              list[this.state.selectIndex] = response.data
              this.setState({list})
              Utils.dialog.success('编辑成功')
            } else {
              Utils.dialog.error(response.msg)
            }
          })
        } else {
          Actions.addRole(values).then(response => {
            this.setState({BoxVisible: false})
            if (response.errorCode == 0) {
              let list = [response.data, ...this.state.list]
              this.setState({list})
              Utils.dialog.success('添加成功')
            } else {
              Utils.dialog.error(response.msg)
            }
          })
        }
      }
    });
  }

  handleCancel = () => {
    this.setState({
      BoxVisible: false
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {detail} = this.state
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    };
    const columns = [
      {
        title: "角色名称",
        dataIndex: "name",
        key: "name"
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
        title: "操作",
        dataIndex: "id",
        key: "id ",
        render: (id, record, index) => {
          return (
            <div>
              <Popconfirm placement="left" title={'确定删除该角色？'} onConfirm={() => this.onDelete(id, index)}
                          okText="确定" cancelText="取消">
                <Button icon='delete'>删除</Button>
              </Popconfirm>
              <Button icon="edit" onClick={this.handleEditClick.bind(this, id, index)}>编辑</Button>
            </div>
          )
        }
      }
    ]
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Icon type="user"/>
            <span>角色列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Button type="primary" style={{margin: "0px 0px 12px"}}
                  onClick={this.handleAddBtnClick.bind(this)}>新增角色</Button>
          <Table columns={columns}
                 rowKey='id'
                 dataSource={this.state.list}
                 pagination={this.state.pagination}
                 loading={this.state.loading}
                 onChange={this.handleTableChange}
          />
          <Modal title={detail.id ? '编辑角色' : '添加角色'}
                 visible={this.state.BoxVisible}
                 style={{ top: 20 }}
                 okText="提交"
                 cancelText="取消"
                 onOk={this.handleSubmit.bind(this)}
                 onCancel={this.handleCancel.bind(this)}
          >
            <Form layout="vertical">
              <FormItem label='角色名称'>
                {getFieldDecorator('name', {
                  rules: [{
                    required: true, message: '角色名称不能为空!',
                  }],
                  initialValue: detail.name
                })(
                  <Input/>
                )}
              </FormItem>
              <FormItem label='权限分配'>
                {getFieldDecorator('permission', {
                  initialValue: detail.permission
                })(
                  <TreeSelect
                    dropdownStyle={{ maxHeight: 600, overflow: 'auto' }}
                    treeData={this.state.treeData}
                    multiple
                    treeCheckable
                    showCheckedStrategy = {TreeSelect.SHOW_ALL}
                    allowClear
                  />
                )}
              </FormItem>
            </Form>
          </Modal>
        </div>
      </div>
    )
  }
}

const RoleList = connect()(Form.create()(App))
export default RoleList



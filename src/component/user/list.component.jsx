/**
 * Created by Administrator on 2017/8/10.
 */
import {Link} from 'react-router-dom';
import {Select, Button, Input, Popconfirm, Form, Row, Col, Table} from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;


import * as Actions from './action'
import {USER_STATUS, USER_TYPE} from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

class List extends React.Component {
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
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    Actions.getUserList({...params}).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.current = result.data.page;
      pagination.total = result.data.totalCount;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        loading: false,
        pagination,
        list: result.data.rows
      });
    });
  }

  // 启用
  handleEnable = (id, index) => {
    Actions.enableUser(id).then(response => {
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
    Actions.disableUser(id).then(response => {
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

  handleAttention = (id, index) => {
    Actions.attentionUser(id).then(response => {
      if(response.errorCode == 0) {
        Utils.dialog.success('特别关注成功')
        let list = this.state.list
        list[index].specialAttention = true
        this.setState({list})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  removeAttention = (id, index) => {
    Actions.removeAttention(id).then(response => {
      if(response.errorCode == 0) {
        Utils.dialog.success('取消关注成功')
        let list = this.state.list
        list[index].specialAttention = false
        this.setState({list})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }


  render() {
    let {match} = this.props
    const {getFieldDecorator} = this.props.form;
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
        title: "用户名",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "工卡号",
        dataIndex: "cardNumber",
        key: "cardNumber"
      },
      {
        title: "手机号",
        dataIndex: "loginPhone",
        key: "loginPhone"
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        render: (text) => {
          return USER_TYPE[text]
        }
      },
      {
        title: "职级",
        dataIndex: "rankName",
        key: "rankName"
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status ",
        render: (text) => {
          return USER_STATUS[text]
        }
      },
      {
        title: "是否特别关注",
        dataIndex: "specialAttention",
        key: "specialAttention ",
        render: (text) => {
          return text ? '是' : '否'
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id ",
        render: (id, record, index) => {
          let url = `${match.url}/edit/${id}`
          return (
            <div>
              {USER_STATUS[record.status] == '禁用' ?
                <Popconfirm placement="left" title={'确定启用该用户？'} onConfirm={() => this.handleEnable(id, index)}
                            okText="确定" cancelText="取消">
                  <Button icon='delete'>启用</Button>
                </Popconfirm> :
                <Popconfirm placement="left" title={'确定禁用该用户？'} onConfirm={() => this.handleDisable(id, index)}
                            okText="确定" cancelText="取消">
                  <Button icon='delete'>禁用</Button>
                </Popconfirm>
              }
              {record.specialAttention ?
                <Popconfirm placement="left" title={'确定取消特别关注该用户？'} onConfirm={() => this.removeAttention(id, index)}
                            okText="确定" cancelText="取消">
                  <Button icon='heart-o'>取消特别关注</Button>
                </Popconfirm> :
                <Popconfirm placement="left" title={'确定特别关注该用户？'} onConfirm={() => this.handleAttention(id, index)}
                            okText="确定" cancelText="取消">
                  <Button icon='heart'>特别关注</Button>
                </Popconfirm>}
              <Link to={url}><Button icon="eye-o">查看详情</Button></Link>
            </div>
          )
        }
      }
    ]
    return (
      <div>
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.handleSearch}
        >
          <Row gutter={40}>
            <Col {...colLayout} key='1'>
              <FormItem {...formItemLayout} label='用户名'>
                {getFieldDecorator('userName')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col {...colLayout} key='2'>
              <FormItem {...formItemLayout} label='工卡号'>
                {getFieldDecorator('cardNumber')(
                  <Input />
                )}
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
                    <Option value='CANCELLED'>{USER_STATUS['CANCELLED']}</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col {...colLayout} className='searchBtn'>
              <Button type="primary" htmlType="submit">查询</Button>
            </Col>
          </Row>
        </Form>
        <Table columns={columns}
               rowKey='id'
               dataSource={this.state.list}
               pagination={this.state.pagination}
               loading={this.state.loading}
               onChange={this.handleTableChange}
        />
      </div>
    )
  }
}

const LiveList = Form.create()(List)
export default LiveList



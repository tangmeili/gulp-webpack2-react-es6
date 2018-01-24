/**
 * Created by Administrator on 2017/8/10.
 */
import {Link} from 'react-router-dom';
import moment from 'moment';
import {
  Select,
  Button,
  Modal,
  Popconfirm,
  Form,
  Row,
  Col,
  Table,
  Menu,
  Dropdown,
  Breadcrumb,
  Icon,
  DatePicker,
  InputNumber,
  Input
} from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
const {connect} = ReactRedux

import Utils from '../../common/utils/utils'
import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'
@connect((state) => {
  return {
    list: state.activity.list
  }
})
class App extends React.Component {
  state = {
    list: [],
    pagination: {},
    loading: false,
    toAuditLoading: false,
    limit: 10,
    filter: {
      activityStatusEnum: '',
      name: ''
    },
    shameBoxVisible: false,
    selectedId: '',
    status: ''
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let status = ''
    if (this.props.operate == 'publish') {
    } else if (this.props.operate == 'audit') {
      status = `${CONSTANTS.TO_AUDIT},${CONSTANTS.REFUSE}`
    } else if (this.props.operate == 'push') {
      status = `${CONSTANTS.OFF_SHELVE},${CONSTANTS.ON_SHELVE}`
    }
    this.setState({activityStatusEnum: status})
    this.getList({activityStatusEnum: status})
  }

  // 删除某个专栏
  onDelete = (index, id) => {
    Actions.deleteActivity(index, id, this.props.dispatch).then(result => {
      if (result.errorCode == 0) {
        Utils.dialog.success('删除成功')
      } else {
        Utils.dialog.error(result.msg)
      }
    })
  }

  // 提交审核
  toAudit = (id, record) => {
    let formdata = new FormData();
    let values = {id: id, name: record.name}
    Object.keys(values).forEach((key) => {
      formdata.append(key,values[key]);
    })
    Actions.auditActivity(formdata, this.props.dispatch).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('提交成功')
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        filter: values
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
      ...this.state.filter
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...this.state.filter, ...params}
    this.setState({loading: true});
    let {dispatch} = this.props
    Actions.getActivityList(params, dispatch).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.total = result.data.totalCount;
      pagination.current = result.data.page;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        loading: false,
        pagination,
      })
    });
  }

  // 下架
  handleOffShelve = (id) => {
    Actions.updateActivity({
      id: id,
      status: CONSTANTS.OFF_SHELVE
    }, this.props.dispatch).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('下架成功')
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  // 点击上架按钮
  handleOnshelveButtonClick = (id, record) => {
    this.setState({
      auditBoxVisible: true,
      selectedId: id,
      openResultTime: record.openResultTime
    })
  }

  // 下架时间
  handleOffShelveTime = (date) => {
    this.setState({
      offShelveTime: date
    })
  }


  // 单独修改下架时间按钮
  handleEditOffShelveTimeButtonClick = (id, startTime, endTime) => {
    this.setState({
      onShelveTime: startTime,
      offShelveTime: endTime,
      timeBoxVisible: true,
      selectedId: id,
    })
  }
  // 单独修改素材审核结果公布时间
  handleEditOpenResultTimeButtonClick = (id, openResultTime) => {
    this.setState({
      openResultTime: openResultTime,
      timeBoxVisible1: true,
      selectedId: id,
    })
  }

  // 确认修改上下架时间
  handleEditOffShelveTime = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      Actions.updateVirtualPopulation({
        id: this.state.selectedId,
        startTime: values.startTime ? values.startTime.valueOf() : '',
        endTime: values.endTime ? values.endTime.valueOf() : '',
      }, this.props.dispatch).then(response => {
        this.setState({
          timeBoxVisible: false,
        });
        if (response.errorCode == 0) {
          Utils.dialog.success('修改成功')
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    })
  }

  // 确认修改素材审核结果公布时间
  handleEditOpenResultTime = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      Actions.updateVirtualPopulation({
        id: this.state.selectedId,
        openResultTime: values.openResultTime ? values.openResultTime.valueOf() : '',
      }, this.props.dispatch).then(response => {
        this.setState({
          timeBoxVisible1: false,
        });
        if (response.errorCode == 0) {
          Utils.dialog.success('修改成功')
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    })
  }


  handleUvShamonChange = (value) => {
    this.setState({
      uvSham: value
    })
  }

  // 点击修改虚拟观看人数按钮
  edituvSham = (id, num) => {
    this.setState({
      shameBoxVisible: true,
      selectedId: id,
      uvSham: num,
    })
  }

  // 确定修改虚拟观看人数
  handleOk = () => {
    Actions.updateVirtualPopulation({
      id: this.state.selectedId,
      uvSham: this.state.uvSham
    }, this.props.dispatch).then(response => {
      this.setState({
        shameBoxVisible: false,
      });
      if (response.errorCode == 0) {
        Utils.dialog.success('修改成功')
      } else {
        Utils.dialog.error(response.msg)
      }
    })

  }

  // 确定操作   上架
  handleAudited = (status) => {
    this.setState({
      confirmLoading: true,
    });
    let params = {
      id: this.state.selectedId,
      status: CONSTANTS.ON_SHELVE,
      // endTime: this.state.offShelveTime ? this.state.offShelveTime.valueOf() : ''
    }
    let flag = true
    this.props.form.validateFields((err, values) => {
      if (!err || !err.openResultTime1) {
        params.endTime = values.offShelveTime ? values.offShelveTime.valueOf() : ''
        params.openResultTime = values.openResultTime1.valueOf()
      } else if (err.openResultTime1) {
        flag = false
      }
    });
    if (flag) {
      Actions.updateActivity(params, this.props.dispatch).then(response => {
        this.setState({
          confirmLoading: false,
          auditBoxVisible: false
        });
        if (response.errorCode == 0) {
          Utils.dialog.success('上架成功')
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    }
  }
    // 关闭弹出框
    handleRefused = () => {
      this.setState({
        confirmLoading: false,
        auditBoxVisible: false,
        timeBoxVisible: false,
        timeBoxVisible1: false,
        shameBoxVisible: false,
      });
    }

    getOperate = (text, record, index) => {
      let {match} = this.props, url = `${match.url}/edit/${text}`
      if (this.props.operate == 'publish') {
        return ( <div>
          {CONSTANTS.AUDIT_STATUS_TO_CN[record.status] !== '上架' && <span>
          <Link to={url}><Button icon="edit">编辑</Button></Link>
          <Popconfirm placement="left" title={'确定删除该活动？'} onConfirm={() => this.onDelete(index, text)}
                      okText="确定" cancelText="取消">
            <Button icon='delete'>删除</Button>
          </Popconfirm>
        </span>}
          {CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '草稿' &&
          <Popconfirm placement="left" title={'确定提交审核？一旦审核通过，将不能修改和删除该活动'}
                      onConfirm={this.toAudit.bind(this, text, record)}
                      okText="确定" cancelText="取消">
            <Button icon='export'>提交审核</Button>
          </Popconfirm>
          }
          {CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '上架' &&
          <Link to={url}><Button icon="eye-o">查看详情</Button></Link>}
        </div>)
      } else if (this.props.operate == 'audit') {
        return (<div>
          {CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '待审核' ?
            <Link to={url}><Button icon='export'>审核</Button></Link> :
            <Link to={url}><Button icon="eye-o">查看详情</Button></Link>}
        </div>)
      }
      if (this.props.operate == 'push') {
        let menu = (
          <Menu>
            <Menu.Item>
              <a href="javascript:;"
                 onClick={this.handleEditOpenResultTimeButtonClick.bind(this, record.id, record.openResultTime)}>修改素材审核结果公布时间</a>
            </Menu.Item>
            <Menu.Item>
              <a href="javascript:;"
                 onClick={this.handleEditOffShelveTimeButtonClick.bind(this, record.id, record.startTime ? record.startTime : record.onShelveTime, record.endTime ? record.endTime : record.offShelveTime)}>修改上下架时间</a>
            </Menu.Item>
            <Menu.Item>
              <a href="javascript:;" onClick={this.edituvSham.bind(this, text, record.pvSham)}>修改虚拟参与人数</a>
            </Menu.Item>
          </Menu>
        );
        return (
          <span>
          <Link to={url}><Button icon="eye-o">查看详情</Button></Link>
            {
              CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '下架' ?
                <Button icon="upload" onClick={this.handleOnshelveButtonClick.bind(this, text, record)}>上架</Button> :
                <Popconfirm placement="left" title={'确定下架该活动？'}
                            onConfirm={this.handleOffShelve.bind(this, text)}
                            okText="确定" cancelText="取消">
                  <Button icon="download">下架</Button>
                </Popconfirm>
            }
            <Dropdown overlay={menu}>
            <Button>更多操作 <Icon type="down"/></Button>
          </Dropdown>
        </span>)
      }
    }

    getSelectFilter = () => {
      if (this.props.operate == 'publish') {
        return ( <Select style={{width: '150px'}}>
          <Option value=' '>全部</Option>
          <Option value={CONSTANTS.DRAFT}>草稿</Option>
          <Option value={CONSTANTS.TO_AUDIT}>待审核</Option>
          <Option value={CONSTANTS.REFUSE}>审核未通过</Option>
          <Option value={CONSTANTS.ON_SHELVE}>上架</Option>
          <Option value={CONSTANTS.OFF_SHELVE}>下架</Option>
        </Select>)
      } else if (this.props.operate == 'audit') {
        return (
          <Select style={{width: '150px'}}>
            <Option value={`${CONSTANTS.TO_AUDIT},${CONSTANTS.REFUSE}`}>全部</Option>
            <Option value={CONSTANTS.TO_AUDIT}>待审核</Option>
            <Option value={CONSTANTS.REFUSE}>审核未通过</Option>
          </Select>
        )
      } else if (this.props.operate == 'push') {
        return ( <Select style={{width: '150px'}}>
          <Option value={`${CONSTANTS.ON_SHELVE},${CONSTANTS.OFF_SHELVE}`}>全部</Option>
          <Option value={CONSTANTS.ON_SHELVE}>上架</Option>
          <Option value={CONSTANTS.OFF_SHELVE}>下架</Option>
        </Select>)
      }
    }

    render() {
      const {getFieldDecorator} = this.props.form;
      const formItemLayout = {
        labelCol: {span: 8},
        wrapperCol: {span: 16},
      };
      const colLayout = {
        xs: {span: 24},
        sm: {span: 8},
      };
      const columns = [
        {
          title: "活动名称",
          dataIndex: "name",
          key: "name"
        },
        {
          title: "参与人数",
          dataIndex: "uv",
          key: "uv"
        },
        {
          title: "虚拟参与人数",
          dataIndex: "uvSham",
          key: "uvSham"
        },
        {
          title: "参与权限",
          dataIndex: "permission",
          key: "permission",
          render: (text) => {
            return CONSTANTS.PERMISSION[text]
          }
        },
        {
          title: "审核状态",
          dataIndex: "status",
          key: "status ",
          render: (text) => {
            return CONSTANTS.AUDIT_STATUS_TO_CN[text]
          }
        }
        ,
        {
          title: "操作",
          dataIndex: "id",
          key: "id ",
          render: (text, record, index) => {
            return this.getOperate(text, record, index)
          }
        }
      ]
      if (this.props.operate == 'push') {
        columns.splice(4, 0, {
          title: "上架时间",
          dataIndex: "onShelveTime",
          key: "onShelveTime",
          render: (text, record) => {
            return Utils.formatDate(text ? text : record.startTime, 'yyyy-mm-dd hh:ii')
          }
        }, {
          title: "下架时间",
          dataIndex: "offShelveTime",
          key: "offShelveTime",
          render: (text, record) => {
            return Utils.formatDate(text ? text : record.endTime, 'yyyy-mm-dd hh:ii')
          }
        })
      }
      return (
        <div id="wrap">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item>
              <Icon type="user"/>
              <span>活动列表</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="content">
            <Form
              className="ant-advanced-search-form"
              onSubmit={this.handleSearch}
            >
              <Row gutter={40}>
                <Col {...colLayout} key='1'>
                  <FormItem {...formItemLayout} label='活动名称'>
                    {getFieldDecorator('name')(
                      <Input/>
                    )}
                  </FormItem>
                </Col>
                <Col {...colLayout} key='2'>
                  <FormItem {...formItemLayout} label='状态'>
                    {getFieldDecorator('activityStatusEnum', {
                      initialValue: this.props.operate == 'publish' ? ' ' : this.props.operate == 'audit' ? `${CONSTANTS.TO_AUDIT},${CONSTANTS.REFUSE}` : `${CONSTANTS.ON_SHELVE},${CONSTANTS.OFF_SHELVE}`
                    })(
                      this.getSelectFilter()
                    )}
                  </FormItem>
                </Col>
                <Col {...colLayout} >
                  <Button type="primary" className='searchBtn' htmlType="submit">查询</Button>
                </Col>
              </Row>
            </Form>
            {
              this.props.operate == 'publish' &&
              <Button type="primary" style={{margin: "0px 0px 12px"}}><Link
                to={`${this.props.match.url}/add`}>新增活动</Link></Button>
            }
            <Table columns={columns}
                   rowKey='id'
                   dataSource={this.props.list}
                   pagination={this.state.pagination}
                   loading={this.state.loading}
                   onChange={this.handleTableChange}
            />
            < Modal title="上架"
                    visible={this.state.auditBoxVisible}
                    wrapClassName="vertical-center-modal"
                    okText="确定上架"
                    cancelText="取消"
                    onOk={this.handleAudited.bind(this, CONSTANTS.ON_SHELVE)}
                    onCancel={this.handleRefused.bind(this)}
            >
              <Form layout="vertical">
                <FormItem label='设置下架时间'>
                  {getFieldDecorator('offShelveTime')(
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={function (current) {
                        return current && current.valueOf() < Date.now();
                      }}
                      showTime
                      // onChange={this.handleOffShelveTime.bind(this)}
                    />
                  )}
                </FormItem>
                <FormItem label='设置素材审核结果公布时间'>
                  {getFieldDecorator('openResultTime1', {
                    rules: [{
                      required: true, message: '请规定素材审核结果公布时间!',
                    }],
                    initialValue: !this.state.openResultTime ? null : moment(Utils.formatDate(this.state.openResultTime, "YYYY-MM-DD hh:ii"), "YYYY-MM-DD HH:mm")
                  })(
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={function (current) {
                        return current && current.valueOf() < Date.now();
                      }}
                      showTime
                      // onChange={this.handleOffShelveTime.bind(this)}
                    />
                  )}
                </FormItem>
              </Form>
            </Modal>
            < Modal title="修改上下架时间"
                    visible={this.state.timeBoxVisible}
                    wrapClassName="vertical-center-modal"
                    okText="确定"
                    cancelText="取消"
                    onOk={this.handleEditOffShelveTime.bind(this)}
                    onCancel={this.handleRefused.bind(this)}
            >
              <Form layout="vertical">
                <FormItem label='上架时间'>
                  {getFieldDecorator('startTime', {
                    initialValue: !this.state.onShelveTime ? null : moment(Utils.formatDate(this.state.onShelveTime, "YYYY-MM-DD hh:ii"), "YYYY-MM-DD HH:mm")
                  })(
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={function (current) {
                        return current && current.valueOf() < Date.now();
                      }}
                      showTime
                      // onChange={this.handleOffShelveTime.bind(this)}
                    />
                  )}
                </FormItem>
                <FormItem label='下架时间'>
                  {getFieldDecorator('endTime', {
                    initialValue: !this.state.offShelveTime ? null : moment(Utils.formatDate(this.state.offShelveTime, "YYYY-MM-DD hh:ii"), "YYYY-MM-DD HH:mm")
                  })(
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={function (current) {
                        return current && current.valueOf() < Date.now();
                      }}
                      showTime
                      // onChange={this.handleOffShelveTime.bind(this)}
                    />
                  )}
                </FormItem>
              </Form>
            </Modal>
            <Modal title="修改素材审核结果公布时间"
                   visible={this.state.timeBoxVisible1}
                   wrapClassName="vertical-center-modal"
                   okText="确定"
                   cancelText="取消"
                   onOk={this.handleEditOpenResultTime.bind(this)}
                   onCancel={this.handleRefused.bind(this)}
            >
              <Form layout="vertical">
                <FormItem label='素材审核结果公布时间'>
                  {getFieldDecorator('openResultTime', {
                    initialValue: !this.state.openResultTime ? null : moment(Utils.formatDate(this.state.openResultTime, "YYYY-MM-DD hh:ii"), "YYYY-MM-DD HH:mm")
                  })(
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={function (current) {
                        return current && current.valueOf() < Date.now();
                      }}
                      showTime
                      // onChange={this.handleOffShelveTime.bind(this)}
                    />
                  )}
                </FormItem>
              </Form>
            </Modal>
            <Modal title="修改虚拟参与人数"
                   visible={this.state.shameBoxVisible}
                   wrapClassName="vertical-center-modal"
                   okText="确定"
                   cancelText="取消"
                   onOk={this.handleOk.bind(this)}
                   onCancel={this.handleRefused.bind(this)}
            >
              <InputNumber size="large" defaultValue={this.state.uvSham}
                           onChange={this.handleUvShamonChange.bind(this)}/>
            </Modal>
          </div>
        </div>
      )
    }
  }
  const List = Form.create()(App)
  export default List



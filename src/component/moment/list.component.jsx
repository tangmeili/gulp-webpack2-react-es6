/**
 * Created by Administrator on 2017/8/10.
 */
import {Link} from 'react-router-dom';
import {Select, Button, Modal, InputNumber, Form, Row, Col, Table, Icon, Breadcrumb, Tooltip, Switch} from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
const {connect} = ReactRedux

import Utils from '../../common/utils/utils'
import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'

class App extends React.Component {
  state = {
    list: [],
    pagination: {},
    loading: false,
    toAuditLoading: false,
    limit: 10,
    fileters: {
      status: CONSTANTS.TO_AUDIT
    },
    shameBoxVisible: false,
    selectedId: '',
    pvSham: 0,
    id: '',
    tips:''
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getList({
      status: CONSTANTS.TO_AUDIT
    });
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        fileters: values
      })
      this.getList({...this.state.fileters, ...values})
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
    Actions.getMomentList(params, dispatch).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.current = result.data.page;
      pagination.total = result.data.totalCount;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        loading: false,
        pagination,
      })
    });
  }

  // 点击修改虚拟观看人数按钮
  editpvSham = (id, num) => {
    this.setState({
      shameBoxVisible: true,
      selectedId: id,
      pvSham: num,
    })
  }
  handlepvShamonChange = (value) => {
    this.setState({
      pvSham: value
    })
  }

  settingButtonClick = () => {
    Actions.getTips().then((result) => {
      let data = result.data.rows
      this.setState({
        id: data[2].id,
        tips: data[2].tips == '1' ? true : false,
        editBoxVisible: true
      })
    });
  }

  handleOk = () => {
    Actions.editMoment(this.state.selectedId, {
      pvSham: this.state.pvSham
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

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Actions.updateTips({
          id: this.state.id,
          tips: values.tips ? '1' : '0'
        }).then(response => {
          this.setState({editBoxVisible: false})
          if (response.errorCode == 0) {
            Utils.dialog.success('修改成功')
          } else {
            Utils.dialog.error(response.msg)
          }
        })
      }
    })
  }

  handleCancel = (e) => {
    this.setState({
      shameBoxVisible: false,
      editBoxVisible: false
    });
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
      sm: {span: 8},
    };
    const columns = [
      {
        title: "创建人",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "创建人所属职级",
        dataIndex: "rankName",
        key: "rankName"
      },
      {
        title: "观看次数",
        dataIndex: "pv",
        key: "pv"
      },
      {
        title: "虚拟观看次数",
        dataIndex: "pvSham",
        key: "pvSham"
      },
      {
        title: "观看权限",
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
          let url = `${match.url}/edit/${text}`
          return (
            <div>
              { CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '待审核' ?
                <Link to={url}><Button icon='export'>审核</Button></Link> :
                <Link to={url}><Button icon="eye-o">查看详情</Button></Link>
              }
              <Button icon="edit" onClick={this.editpvSham.bind(this, text, record.pvSham)}>修改虚拟观看人数</Button>
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
              <span>短视频列表</span>
            </Link>
          </Breadcrumb.Item>
          {location.pathname.indexOf('edit') > 0 &&
          <Breadcrumb.Item>
            短视频详情
          </Breadcrumb.Item>}
        </Breadcrumb>
        <div className="content">
          <Button type="primary" icon="setting" onClick={this.settingButtonClick.bind(this)}
                  style={{marginRight: '8px', marginBottom: '12px'}}>设置</Button>
          <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={40}>
              <Col {...colLayout} key='2'>
                <FormItem {...formItemLayout} label='审核状态'>
                  {getFieldDecorator('status', {
                    initialValue: CONSTANTS.TO_AUDIT
                  })(
                    <Select>
                      <Option value=" ">全部</Option>

                      <Option value={CONSTANTS.TO_AUDIT}>待审核</Option>
                      <Option value={CONSTANTS.AUDITED}>审核通过</Option>
                      <Option value={CONSTANTS.REFUSE}>审核未通过</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...colLayout} >
                <Button type="primary" htmlType="submit">查询</Button>
              </Col>
            </Row>
          </Form>
          {
            this.props.operate == 'publish' &&
            <Link to="/list/add"><Button type="primary" style={{margin: "0px 0px 12px"}}>新增短视频</Button></Link>
          }
          <Table columns={columns}
                 rowKey='id'
                 dataSource={this.props.list}
                 pagination={this.state.pagination}
                 loading={this.state.loading}
                 onChange={this.handleTableChange}
          />
          <Modal title="修改虚拟观看人数"
                 visible={this.state.shameBoxVisible}
                 wrapClassName="vertical-center-modal"
                 okText="确定"
                 cancelText="取消"
                 onOk={this.handleOk.bind(this)}
                 onCancel={this.handleCancel.bind(this)}
          >
            <InputNumber size="large" defaultValue={this.state.pvSham} onChange={this.handlepvShamonChange.bind(this)}/>
          </Modal>
          <Modal title="设置"
                 visible={this.state.editBoxVisible}
                 wrapClassName="vertical-center-modal"
                 okText="确定"
                 cancelText="取消"
                 onOk={this.handleSubmit.bind(this)}
                 onCancel={this.handleCancel.bind(this)}
                 width={500}
          >
            <Form>
              <FormItem
                {...formItemLayout}
                label={(
                  <span>
              开启审核&nbsp;
                    <Tooltip title="当开启审核后，每个用户发布的短视频都必须通过审核才能显示。">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
                )}>
                {getFieldDecorator('tips', {
                  initialValue: this.state.tips
                })(
                  <Switch checkedChildren={'开'} unCheckedChildren={'关'} defaultChecked={this.state.tips}/>
                )}
              </FormItem>
            </Form>
          </Modal>
        </div>
      </div>
    )
  }
}

const List = connect((state) => {
  return {
    list: state.moment.list
  }
})(Form.create()(App))
export default List



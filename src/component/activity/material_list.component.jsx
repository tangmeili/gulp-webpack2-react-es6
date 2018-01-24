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
import ActivityChoose from './activity_choose.component'

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
    status: '',
    activity: {}
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let status = ''
    this.props.dispatch({
      type: 'FILTER_ACTIVITY',
      newActivity: {}
    })
    this.getList()
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
    Actions.auditActivity({id: id, name: record.name}, this.props.dispatch).then(response => {
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
        filter: values,
        id: this.props.activity.id
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
      id: this.props.activity.id,
      ...this.state.filter
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...this.state.filter, ...params}
    this.setState({loading: true});
    let {dispatch} = this.props
    Actions.getMaterialList(params, dispatch).then((result) => {
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

  handleCancel = () => {
    this.setState({
      activityListBoxvisible: false,
      editBoxVisible: false
    })
  }

  handleOk = () => {
    this.setState({
      activityListBoxvisible: false,
    })
  }

  handleChooseBtnClick = () => {
    this.setState({
      activityListBoxvisible: true
    })
  }

  chooseForstand = (id, status) => {
    let _this = this
    Actions.updateMaterial({
      momentsId: id,
      status: status
    }, _this.props.dispatch).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('成功')
        let detail = response.data
        _this.setState({detail})
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
      sm: {span: 8},
    };
    const columns = [
      {
        title: "所属活动名称",
        dataIndex: "activity.name",
        key: "activity.name"
      },
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
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          switch (status) {
            case CONSTANTS.TO_AUDIT :
              return '未处理'
              break;
            case CONSTANTS.AUDITED :
              return '精选素材'
              break;
            case CONSTANTS.REFUSE :
              return '普通素材'
              break;
          }
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id ",
        render: (text, record, index) => {
          let url = `${match.url}/edit/${text}`
          return (
            <div>
              <Link to={url}><Button icon="eye-o">查看详情</Button></Link>
              {
                record.status == CONSTANTS.TO_AUDIT &&
                <span>
                   <Popconfirm placement="left" title={'确定将该素材选为精选素材？ 成功后会在小程序端显示'}
                               onConfirm={this.chooseForstand.bind(this, record.id, CONSTANTS.AUDITED)}
                               okText="确定" cancelText="取消">
                     <Button icon="star-o">选为精选素材</Button>
                    </Popconfirm>
                   <Popconfirm placement="left" title={'确定将该素材选为普通素材？ 成功后不会在小程序端显示'}
                               onConfirm={this.chooseForstand.bind(this, record.id, CONSTANTS.REFUSE)}
                               okText="确定" cancelText="取消">
                      <Button icon="star-o">选为普通素材</Button>
                    </Popconfirm>
                  </span>
              }
              {
                record.status == CONSTANTS.AUDITED &&
                <Popconfirm placement="left" title={'确定将该素材选为普通素材？ 成功后不会在小程序端显示'}
                            onConfirm={this.chooseForstand.bind(this, record.id, CONSTANTS.REFUSE)}
                            okText="确定" cancelText="取消">
                  <Button icon="star-o">选为普通素材</Button>
                </Popconfirm>
              }
              {
                record.status == CONSTANTS.REFUSE &&
                <Popconfirm placement="left" title={'确定将该素材选为精选素材？ 成功后会在小程序端显示'}
                            onConfirm={this.chooseForstand.bind(this, record.id, CONSTANTS.AUDITED)}
                            okText="确定" cancelText="取消">
                  <Button icon="star-o">选为精选素材</Button>
                </Popconfirm>
              }
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
            <span>活动素材列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Button type="primary" icon="select" style={{marginRight: '8px', marginBottom: '12px'}}
                  onClick={this.handleChooseBtnClick.bind(this)}>选择活动</Button>
          <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={40}>
              <Col {...colLayout} key='2'>
                <FormItem {...formItemLayout} label='状态'>
                  {getFieldDecorator('momentsStatusEnum', {
                    initialValue: ' '
                  })(
                    <Select style={{width: '150px'}}>
                      <Option value=' '>全部</Option>
                      <Option value={CONSTANTS.TO_AUDIT}>未处理</Option>
                      <Option value={CONSTANTS.AUDITED}>精选素材</Option>
                      <Option value={CONSTANTS.REFUSE}>普通素材</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...colLayout} >
                <Button className='searchBtn' type="primary" htmlType="submit">查询</Button>
              </Col>
            </Row>
          </Form>
          {this.props.activity.id && <div style={{marginBottom: 12}}>
            当前所选活动>>> <span style={{color: '#108ee9'}}>{this.props.activity.name}</span>
          </div>}
          <Table columns={columns}
                 rowKey='id'
                 dataSource={this.props.list}
                 pagination={this.state.pagination}
                 loading={this.state.loading}
                 onChange={this.handleTableChange}
          />
          <ActivityChoose videoListBoxvisible={this.state.activityListBoxvisible}
                          handleCancle={this.handleCancel.bind(this)}
                          handleOk={this.handleOk.bind(this)} getList={this.getList.bind(this)}/>
        </div>
      </div>
    )
  }
}

const MaterialList = connect((state) => {
  return {
    activity: state.activity.newActivity,
    list: state.activity.material_list
  }
})(Form.create()(App))
export default MaterialList



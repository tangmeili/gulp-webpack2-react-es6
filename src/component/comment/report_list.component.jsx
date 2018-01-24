import {Button, Select, Popconfirm, Form, Row, Col, Table, Icon, Breadcrumb} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const {connect} = ReactRedux

import Utils from '../../common/utils/utils'
import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'
import VideoChoose from './video_choose.component'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      limit: 10,
      pagination: {},
      loading: false,
      videoListBoxvisible: false,
      video: '',
      type: '',
      status: ''
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'FILTER_VIDEO',
      newVideo: {}
    })
    this.getList()
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        status: values.status
      })
      this.getList({
        type: this.props.type,
        videoId: this.props.video.id,
        ...values
      })
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
      type: this.props.type,
      videoId: this.props.video.id,
      status: this.state.status
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    Actions.getReportList(params).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.current = result.data.page;
      pagination.total = result.data.totalCount;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        list: result.data.rows,
        loading: false,
        pagination,
      })
    });
  }

  handleChooseBtnClick = () => {
    this.setState({
      videoListBoxvisible: true
    })
  }

  onDelete = (id, index) => {
    Actions.deleteReport(id).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('删除成功')
        let list = this.state.list
        list.splice(index, 1)
        this.setState({list})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  handleAudit = (id, index, status, record) => {
    Actions.updataReport(id, status).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success(status == 'SILENT' ? '禁言成功' : '审核成功')
        let list = this.state.list
        if (status == 'SILENT') {
          list.map(item => {
            if (item.userId == record.userId) {
              item.silent = true
            }
            return item
          })
        } else {
          list[index].status = response.data.status
        }
        this.setState({list})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  handleOk = () => {
    this.setState({
      videoListBoxvisible: false,
    })
  }

  handleCancel = () => {
    this.setState({
      videoListBoxvisible: false,
    })
  }

  render() {
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    };
    const colLayout = {
      xs: {span: 24},
      sm: {span: 8},
    };
    const {getFieldDecorator} = this.props.form;
    const columns = [
      {
        title: "被举报人",
        dataIndex: "tipOffUserName",
        key: "tipOffUserName"
      },
      {
        title: "被举报内容",
        dataIndex: "tipOffComment",
        key: "tipOffComment",
        render: (text) => {
          return text ? text.substring(0, 20) : text
        }
      },
      {
        title: "举报人",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "举报原因",
        dataIndex: "content",
        key: "content",
        render: (text) => {
          return text ? text.substring(0, 20) : text
        }
      },
      {
        title: "举报时间",
        dataIndex: "createTime",
        key: "createTime",
        render: (time) => {
          return Utils.formatDate(time, 'YYYY-MM-DD hh:ii')
        }
      },
      {
        title: "是否禁言",
        dataIndex: "silent",
        key: "silent",
        render: (silent) => {
          return silent ? '已禁言' : '未禁言'
        }
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          return CONSTANTS.AUDIT_STATUS_TO_CN[status]
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id",
        render: (id, record, index) => {
          return (<div>
            {record.status == CONSTANTS.TO_AUDIT && <span>
               <Popconfirm placement="left" title={'确定审核通过？'}
                           onConfirm={this.handleAudit.bind(this, id, index, 'PASS')}
                           okText="确定" cancelText="取消">
              <Button icon='check-square-o'>审核通过</Button>
            </Popconfirm>
               <Popconfirm placement="left" title={'确定审核不通过？'}
                           onConfirm={this.handleAudit.bind(this, id, index, 'NOT_PASS')}
                           okText="确定" cancelText="取消">
              <Button icon='close-square-o'>审核不通过</Button>
            </Popconfirm>
            </span>}
            {!record.silent &&
            <Popconfirm placement="left" title={'确定禁言该用户？'} onConfirm={this.handleAudit.bind(this, id, index, 'SILENT',record)}
                        okText="确定" cancelText="取消">
              <Button icon='close-square-o'>禁言</Button>
            </Popconfirm>}
          </div>)
        }
      },
    ]
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Icon type="user"/>
            <span>举报列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Button type="primary" icon="select" style={{marginRight: '8px', marginBottom: '12px'}}
                  onClick={this.handleChooseBtnClick.bind(this)}>选择点播/短视频</Button>
          <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={40}>
              <Col {...colLayout} key='1'>
                <FormItem {...formItemLayout} label='状态'>
                  {getFieldDecorator('status', {
                    initialValue: ' '
                  })(
                    <Select>
                      <Option value=" ">全部</Option>
                      <Option value={CONSTANTS.TO_AUDIT}>待审核</Option>
                      <Option value={CONSTANTS.REFUSE}>审核未通过</Option>
                      <Option value={CONSTANTS.AUDITED}>审核通过</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...colLayout} >
                <Button type="primary" htmlType="submit" className='searchBtn'>查询</Button>
              </Col>
            </Row>
          </Form>
          {this.props.video.id && <div style={{marginBottom: 12}}>
            当前所选视频>>> <span style={{color: '#108ee9'}}>{this.props.video.title}</span>
          </div>}
          <Table columns={columns}
                 rowKey='id'
                 expandedRowRender={record => {
                   return (
                     <div>
                       <p><span style={{color: '#108ee9', fontSize: 15}}>被举报内容：</span>{record.tipOffComment}</p>
                       <p><span style={{color: '#108ee9', fontSize: 15}}>举报原因：</span>{record.content}</p>
                     </div>
                   )
                 }}
                 dataSource={this.state.list}
                 pagination={this.state.pagination}
                 loading={this.state.loading}
                 onChange={this.handleTableChange}
          />
        </div>
        <VideoChoose videoListBoxvisible={this.state.videoListBoxvisible} handleCancle={this.handleCancel.bind(this)}
                     handleOk={this.handleOk.bind(this)} getList={this.getList.bind(this)}
                     chooseType="report"
        />
      </div>
    )
  }
}

const ReportList = connect((state) => {
  return {
    video: state.comment.newVideo,
    type: state.comment.newVideo.type
  }
})(Form.create()(App))
export default ReportList
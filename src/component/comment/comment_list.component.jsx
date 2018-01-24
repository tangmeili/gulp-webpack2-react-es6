import {
  Button,
  Select,
  Checkbox,
  Form,
  Row,
  Col,
  Table,
  Icon,
  Breadcrumb,
  Popconfirm,
  Switch,
  InputNumber,
  Modal,
  Tooltip
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const {connect} = ReactRedux

import Utils from '../../common/utils/utils'
import * as CONSTANTS from '../../common/utils/constants'
import * as Actions from './action'
import VideoChoose from './video_choose.component'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      limit: 10,
      pagination: {},
      loading: false,
      BoxVisible: false,
      editBoxVisible: false,
      videoListBoxvisible: false,
      video: '',
      type: '',
      isHide: false,
      status: '',
      id1: '',
      id2: '',
      tips1: 0,
      tips2: 0
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'FILTER_VIDEO',
      newVideo: {}
    })
    this.getList({})
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        isHide: values.isHide,
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
      isHide: this.state.isHide,
      status: this.state.status
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...params, isHide: !params.isHide ? false : params.isHide,}
    this.setState({loading: true});
    Actions.getCommentList(params).then((result) => {
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

  handleSettingBtnClick = () => {
    Actions.getTips().then((result) => {
      let data = result.data.rows
      this.setState({
        id1: data[3].id,
        tips1: data[3].tips == '1' ? true : false,
        id2: data[4].id,
        tips2: data[4].tips,
        editBoxVisible: true
      })
    });
  }

  handleAudit = (id, index, status, record) => {
    Actions.updataComment(id, status).then(response => {
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

  handleVisible = (id, index) => {
    Actions.visibleComment(id).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('设置成功')
        let list = this.state.list
        list[index] = response.data
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

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Actions.updateTips({
          id: this.state.id1,
          tips: values.tips1 ? 1 : 0
        }).then(response => {
          if (response.errorCode == 0) {
            Actions.updateTips({
              id: this.state.id2,
              tips: values.tips2
            }).then(result => {
              this.setState({editBoxVisible: false})
              if(result.errorCode == 0) {
                Utils.dialog.success('修改成功')
              }  else {
                Utils.dialog.error(response.msg)
              }
            })
          } else {
            Utils.dialog.error(response.msg)
          }
        })
      }
    })
  }

  handleCancel = () => {
    this.setState({
      videoListBoxvisible: false,
      editBoxVisible: false
    })
  }

  render() {
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 6},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
      }
    };
    const colLayout = {
      xs: {span: 24},
      sm: {span: 8},
    };
    const {getFieldDecorator} = this.props.form;
    const columns = [
      {
        title: "用户名",
        dataIndex: "userName",
        key: "userName",
      },
      {
        title: "评论内容",
        dataIndex: "content",
        key: "content",
        width: '',
        render: (text) => {
          return text ? text.substring(0, 20) : text
        }
      },
      {
        title: "点赞数",
        dataIndex: "praise",
        key: "praise"
      },
      {
        title: "评论人数",
        dataIndex: "commentCount",
        key: "commentCount"
      },
      {
        title: "被举报次数",
        dataIndex: "tipOffCount",
        key: "tipOffCount"
      },
      {
        title: "评论时间",
        dataIndex: "createTime",
        key: "createTime",
        render: (time) => {
          return Utils.formatDate(time, 'YYYY-MM-DD hh:ii')
        }
      },
      {
        title: "是否可见",
        dataIndex: "isHide",
        key: "isHide",
        render: (isHide) => {
          return isHide ? '否' : '是'
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
            <Popconfirm placement="left" title={'确定禁言该用户？'}
                        onConfirm={this.handleAudit.bind(this, id, index, 'SILENT', record)}
                        okText="确定" cancelText="取消">
              <Button icon='close-square-o'>禁言</Button>
            </Popconfirm>}
            {record.isHide &&
            <Popconfirm placement="left" title={'确定显示该评论？'} onConfirm={() => this.handleVisible(id, index)}
                        okText="确定" cancelText="取消">
              <Button icon='eye-o'>显示该评论</Button>
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
            <span>评论列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Button type="primary" icon="select" style={{marginRight: '8px', marginBottom: '12px'}}
                  onClick={this.handleChooseBtnClick.bind(this)}>选择点播/短视频</Button>
          <Button type="primary" icon="setting" style={{marginRight: '8px', marginBottom: '12px'}}
                  onClick={this.handleSettingBtnClick.bind(this)}>设置</Button>
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
              <Col {...colLayout} key='2'>
                <FormItem {...formItemLayout} label=''>
                  {getFieldDecorator('isHide', {

                  })(
                    <Checkbox defaultChecked={false}>被自动隐藏的评论</Checkbox>
                  )}
                </FormItem>
              </Col>
              <Col {...colLayout} >
                <Button type="primary" htmlType="submit">查询</Button>
              </Col>
            </Row>
          </Form>
          {this.props.video.id && <div style={{marginBottom: 12}}>
            当前所选视频>>> <span style={{color: '#108ee9'}}>{this.props.video.title}</span>
          </div>}
          <Table columns={columns}
                 rowKey='id'
                 expandedRowRender={record => {
                   return (<p><span style={{color: '#108ee9', fontSize: 15}}>评论内容：</span>{record.content}</p>)
                 }}
                 dataSource={this.state.list}
                 pagination={this.state.pagination}
                 loading={this.state.loading}
                 onChange={this.handleTableChange}
          />
        </div>
        <VideoChoose videoListBoxvisible={this.state.videoListBoxvisible} handleCancle={this.handleCancel.bind(this)}
                     handleOk={this.handleOk.bind(this)} getList={this.getList.bind(this)}
                     chooseType="comment"
        />
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
              开启自动隐藏&nbsp;
                  <Tooltip title="当开启自动隐藏后，如果用户的评论被举报次数超过您规定的举报次数，该条用户评论会自动隐藏。">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
              )}>
              {getFieldDecorator('tips1', {
                initialValue: this.state.tips1
              })(
                <Switch checkedChildren={'开'} unCheckedChildren={'关'} defaultChecked={this.state.tips1}/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={(
                <span>
              被举报次数&nbsp;
                  <Tooltip title="规定评论被举报次数上限，超过该次数评论就会自动隐藏，只有开启自动隐藏才生效！">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
              )}>
              {getFieldDecorator('tips2', {
                initialValue: this.state.tips2
              })(
                <InputNumber min={0}/>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

const CommentList = connect((state) => {
  return {
    video: state.comment.newVideo,
    type: state.comment.newVideo.type
  }
})(Form.create()(App))
export default CommentList
/**
 * Created by Administrator on 2017/8/10.
 */
import {Link} from 'react-router-dom';
import {Select, Button, Popconfirm, Form, Row, Col, Table, InputNumber, Modal, Dropdown,Menu, Switch,Progress, Tooltip,Icon  } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
const {connect} = ReactRedux
import {Player} from 'video-react';
import "video-react/dist/video-react.css";

import Utils from '../../common/utils/utils'
import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'

var getSignature = function (callback) {
  Actions.getSignature().then(response => {
    if (response.errorCode == 0) {
      callback(response.data)
    } else {
      Utils.dialog.error(response.msg)
    }
  })
};

class App extends React.Component {
  state = {
    list: [],
    pagination: {},
    loading: false,
    toAuditLoading: false,
    limit: 10,
    liveStatusEnum: '',
    shameBoxVisible: false,
    playbackBoxVisible: false,
    videoUrl: '',
    loadingFlag: false,  //上传视频的等待标志
    videoStatus: '',   // 上传视频成功状态
    visibleModal: false, // 视频播放弹出框显示标志
    selectedId: '',
    pvSham: 0,
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
    this.setState({liveStatusEnum: status})
    this.getList({liveStatusEnum: status})
  }

  // 删除某个专栏
  onDelete = (index, id) => {
    Actions.deleteLive(index, id, this.props.dispatch).then(result => {
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
    let values = {
      id: id,
      title: record.title,
      channelPasswd: record.channelPasswd
    }
    Object.keys(values).forEach((key) => {
      formdata.append(key,values[key]);
    })
    Actions.auditLive(formdata, this.props.dispatch).then(response => {
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
      // values.status = values.status
      this.setState({
        liveStatusEnum: values.liveStatusEnum
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
      liveStatusEnum: this.state.liveStatusEnum
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    let {dispatch} = this.props
    Actions.getLiveList(params, dispatch).then((result) => {
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

  //  uploadVideo uploadVideoStart 处理视频上传
  uploadVideo = () => {
    var event = document.createEvent("MouseEvents"),
      ele = document.getElementById('videoFile');
    event.initEvent("click", true, true);
    event.stopPropagation();        //注意冒泡
    ele.dispatchEvent(event);
  }
  uploadVideoStart = (e) => {
    e.persist();
    let _this = this
    _this.setState({
      progress: 0,
      loadingFlag: true,
      fileName: ''
    })
    _this.props.form.setFieldsValue({
      fileId: '',
    });
    Actions.uploadVideo({
      writetoken: '457f9ebf-8d9b-427f-a47f-b599569a9a23',
      Filedata: e.target.files[0],
      cataid: '1514188544174',
    }, {
      withCredentials: false,
      headers: {
        'content-type': 'multipart/form-data',
      },
      onUploadProgress: function (progressEvent) {
// 使用本地 progress 事件做任何你想要做的
        _this.setState({
          progress: Math.floor((progressEvent.loaded / progressEvent.total).toFixed(2) * 100)
        })
      },
    }).then(response => {
      if(response.error == 0) {
        let result = response.data[0], url = result.mp4_2 ? result.mp4_2 : result.mp4_1
        _this.setState({
          loadingFlag: false,
          videoStatus: 'success',
          coverUrl: result.first_image,
          fileName: url,
          videoUrl: url,
        })
        e.target.value = ''
        _this.props.form.setFieldsValue({
          fileId: result.vid,
        });
      } else {
        Utils.dialog('上传出错啦')
        _this.setState({
          loadingFlag: false,
          videoStatus: 'fail',
          coverUrl: '',
          fileName:'',
          videoUrl: '',
          tempVidelUrl: ''
        })
        e.target.value = ''
        _this.props.form.setFieldsValue({
          fileId: '',
        });
      }
    })
    return false
  }

  // 弹出视频播放框
  setModal1Visible = (visibleModal) => {
    this.setState({visibleModal})
  }

  // 上下架
  handleOffShelve = (id, status) => {
    let {dispatch} = this.props
    Actions.updateLive({
      id: id,
      status: status
    }, dispatch).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('操作成功')
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  // 点击回放设置按钮
  handlePlaybackBtnCLick = (id, record) => {
    this.setState({
      isPlayBack: record.isPlayBack,
      selectedId: id,
      videoUrl: record.videoUrl,
      fileId: record.fileId,
      videoStatus: record.videoUrl ? 'success' : '',
      playbackBoxVisible: true
    })
  }

  // 点击修改虚拟观看人数按钮
  editpvSham = (id, num) => {
    this.setState({
      shameBoxVisible: true,
      selectedId: id,
      pvSham: num,
    })
  }

  handlePvShamonChange = (value) => {
    this.setState({
      pvSham: value
    })
  }
  handleOk = () => {
    Actions.updateVirtualPopulation({
      id: this.state.selectedId,
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
  // 提交修改回放
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Actions.editPlayback({
          id: this.state.selectedId,
          isPlayBack: values.isPlayBack,
          fileId: values.fileId,
          videoUrl: this.state.videoUrl,
        },this.props.dispatch).then(response => {
          this.setState({playbackBoxVisible: false})
          if (response.errorCode == 0) {
            Utils.dialog.success('修改成功')
          } else {
            Utils.dialog.error(response.msg)
          }
        })
      }
    });
  }
  handleCancel = (e) => {
    this.setState({
      shameBoxVisible: false,
      playbackBoxVisible: false
    });
  }

  getOperate = (text, record, index) => {
    let {match} = this.props, url = `${match.url}/edit/${text}`
    if (this.props.operate == 'publish') {
      return ( <div>
        {CONSTANTS.AUDIT_STATUS_TO_CN[record.status] !== '上架' && <span>
          <Link to={url}><Button icon="edit">编辑</Button></Link>
          <Popconfirm placement="left" title={'确定删除该直播？'} onConfirm={() => this.onDelete(index, text)}
                      okText="确定" cancelText="取消">
            <Button icon='delete'>删除</Button>
          </Popconfirm>
        </span>}
        {CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '草稿' &&
        <Popconfirm placement="left" title={'确定提交审核？一旦审核通过，将不能修改和删除该直播'}
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
               onClick={this.handlePlaybackBtnCLick.bind(this,text, record)}>回放设置</a>
          </Menu.Item>
          <Menu.Item>
            <a href="javascript:;" onClick={this.editpvSham.bind(this, text, record.pvSham)}>修改虚拟观看次数</a>
          </Menu.Item>
        </Menu>
      );
      return (
        <span>
          <Link to={url}><Button icon="eye-o">查看详情</Button></Link>
          {
            CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '下架' ?
              <Popconfirm placement="left" title={'确定上架该直播？'}
                          onConfirm={this.handleOffShelve.bind(this, text, CONSTANTS.ON_SHELVE)}
                          okText="确定" cancelText="取消">
                <Button icon='upload'>上架</Button>
              </Popconfirm> :
              <Popconfirm placement="left" title={'确定下架该直播？'}
                          onConfirm={this.handleOffShelve.bind(this, text, CONSTANTS.OFF_SHELVE)}
                          okText="确定" cancelText="取消">
                <Button icon='download'>下架</Button>
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
        title: "直播主题",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "创建人",
        dataIndex: "createUser.userName",
        key: "createUser.userName"
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
        render: (text) => {
          return CONSTANTS.AUDIT_STATUS_TO_CN[text]
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id",
        render: (text, record, index) => {
          return this.getOperate(text, record, index)
        }
      }
    ]
    if (this.props.operate == 'push') {
      columns.splice(5, 0, {
        title: "上架时间",
        dataIndex: "onShelveTime",
        key: "onShelveTime",
        render: (text) => {
          return Utils.formatDate(text, 'yyyy-mm-dd hh:ii')
        }
      })
    }
    return (
      <div>
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.handleSearch}
        >
          <Row gutter={40}>
            <Col {...colLayout} key='2'>
              <FormItem {...formItemLayout} label='状态'>
                {getFieldDecorator('liveStatusEnum', {
                  initialValue: this.props.operate == 'publish' ? ' ' : this.props.operate == 'audit' ? `${CONSTANTS.TO_AUDIT},${CONSTANTS.REFUSE}` : `${CONSTANTS.ON_SHELVE},${CONSTANTS.OFF_SHELVE}`
                })(
                  this.getSelectFilter()
                )}
              </FormItem>
            </Col>
            <Col {...colLayout} >
              <Button className='searchBtn' type="primary" htmlType="submit">查询</Button>
            </Col>
          </Row>
        </Form>
        {
          this.props.operate == 'publish' &&
          <Button type="primary" style={{margin: "0px 0px 12px"}}><Link
            to={`${this.props.match.url}/add`}>新增直播</Link></Button>
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
          <InputNumber size="large" defaultValue={this.state.pvSham} onChange={this.handlePvShamonChange.bind(this)}/>
        </Modal>
        <Modal title="回放设置"
               visible={this.state.playbackBoxVisible}
               wrapClassName="vertical-center-modal"
               okText="确定"
               cancelText="取消"
               onOk={this.handleSubmit.bind(this)}
               onCancel={this.handleCancel.bind(this)}
               width={600}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label='开启回放'>
              {getFieldDecorator('isPlayBack', {
                initialValue: this.state.isPlayBack
              })(
                <Switch checkedChildren={'开'} unCheckedChildren={'关'} defaultChecked={this.state.isPlayBack}/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={(
                <span>
              上传回看视频&nbsp;
                  <Tooltip title="只有开启回放才有效">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
              )}>
              {getFieldDecorator('fileId', {
                initialValue: this.state.fileId
              })(
                <div style={{marginBottom: '10px'}}>
                  <input type="file" accept="video/*" id='videoFile' onChange={this.uploadVideoStart.bind(this)}
                         style={{display: 'none'}}/>
                  <Button icon="upload" onClick={this.uploadVideo.bind(this)}>上传文件</Button>
                </div>
              )}
              { this.state.loadingFlag ? <Progress
                percent={this.state.progress}/> : this.state.videoStatus == '' ? null : this.state.videoStatus == 'success' ?
                <div>
                  <span className="ant-form-text" style={{color: 'orangered'}}>视频转码需要时间，如遇不能播放的情况，请耐心等候！</span>
                  <div>
                    <video src={this.state.videoUrl} controls="controls" width={300}>
                      your browser does not support the video tag
                    </video>
                  </div>
                </div> : <Alert message="视频上传失败" type="error"/> }
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }

}

const List = connect((state) => {
  return {
    list: state.live.list
  }
})(Form.create()(App))
export default List



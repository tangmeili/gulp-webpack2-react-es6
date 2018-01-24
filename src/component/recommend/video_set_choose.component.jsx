import {Modal, Form, Table, Button, Tabs, Input, Upload, Icon, Popconfirm, Select, Pagination, Col} from 'antd';
const Search = Input.Search;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const {connect} = ReactRedux
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

var _form = ''

class VideoSetChoose extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      videoList: [],
      videoSelectedTotal: 0,
      videoSetTotal: 0,
      videoListTotal: 0,
      loading: false,
      limit: 6,
      selectedRowKeys: [],
      selectedVideoRowKeys: [],
      selectedRows: [],
      selectedVideoRows: [],
      videoSetListBoxvisible: false,
      disabledKeys: [],
      disabledVideoKeys: [],
      activeKey: 'list',
      detail: {},
      selectedVideoList: [],
      type: 'LIVE',
      video_list_content: '',
      selectLimit: Number,
      AddOrEditVideoSet: undefined,
      AddVideo: false,
      videoSetName: '',
      videoName: '',
    }
  }

  componentDidMount() {
    this.getList();
  }

  componentWillReceiveProps(props) {
    this.setState({
      videoSetListBoxvisible: props.videoSetListBoxvisible,
      disabledKeys: props.selectedIdsAndType,
      selectLimit: props.limit
    })
  }

  handleVideoSetTableChange = (page, pageSize) => {
    this.getList({
      limit: this.state.limit,
      page: page,
      title: this.state.videoSetName
    });
  }

  handleVideoSetListSearch = (value) => {
    this.setState({
      videoSetName: value
    })
    this.getList({title: value})
  }

  getList = (params) => {
    params = {limit: this.state.limit, page: 1, ...params}
    this.setState({loading: true});
    Actions.getVideoSetList(params).then((response) => {
      if (response.errorCode == 0) {
        this.setState({
          loading: false,
          videoSetTotal: response.data.totalCount,
          list: response.data.rows
        })
      } else {
        Utils.dialog.error((response.msg))
      }
    })
  }

  handleVideoListTableChange = (page, pageSize) => {
    this.getVideoList(this.state.type, {
      limit: this.state.limit,
      page: page,
    });
  }

  getVideoList = (type, params, callBack) => {
    params = {
      limit: this.state.limit,
      page: 1,
      liveStatusEnum: CONSTANTS.ON_SHELVE,
      vodStatusEnum: CONSTANTS.ON_SHELVE, ...params
    }
    this.setState({loading: true});
    Actions.getVideoList(type, params).then((response) => {
      if (response.errorCode == 0) {
        this.setState({
          videoListTotal: response.data.totalCount,
          videoList: response.data.rows
        })
        callBack && callBack()
      } else {
        Utils.dialog.error((response.msg))
      }
    })
  }

  normFile = (e) => {
    let fileList = e.fileList.filter((file) => {
      if (file.response) {
        if (file.response.errorCode === 0) {
          file.url = file.response.data
          return true;
        }
      }
      return true;
    }).slice(-1);
    return fileList[0].url;
  }

  // 直播、点播筛选条件变化
  handleTypeChange = (value) => {
    this.setState({
      type: value
    })
    this.getVideoList(value, {title: this.state.videoName, name: this.state.videoName})
  }

  handleVideoListSearch = (value) => {
    this.setState({
      videoName: value,
      videoTitle: value
    })
    this.getVideoList(this.state.type, {title: value, name: value})
  }

  addVideoClick = () => {
    let _this = this, detail = Object.assign({}, this.state.detail, _form.getFieldsValue())
    this.getVideoList('LIVE', {}, function () {
      _this.setState({
        detail,
        type: 'LIVE',
        AddVideo: true,
        activeKey: 'choose'
      })
    })
  }

  editPaneClick = (id) => {
    Actions.getVideoSet(id).then(response => {
      if (response.errorCode == 0) {
        this.setState({
          detail: response.data,
          AddOrEditVideoSet: 'edit',
          activeKey: 'detail',
          selectedVideoList: response.data.data,
          disabledVideoKeys: response.data.data.map(record => {
            return record.videoId
          })
        })
      }
    })
  }

  addPaneClick = () => {
    this.setState({
      AddOrEditVideoSet: 'add',
      activeKey: 'detail',
      detail: {},
      selectedVideoList: [],
      disabledVideoKeys: []
    })
  }

  // 删除视频集
  onDeleteVideoSet = (id, index) => {
    let _this = this
    Actions.deleteVideoSet(id).then(response => {
      if (response.errorCode == 0) {
        let list = _this.state.list
        list.splice(index, 1)
        _this.setState({list})
        Utils.dialog.success('删除成功')
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  // 删除视频集里面的视频
  onDeleteVideo = (videoId, index) => {
    let {selectedVideoList, disabledVideoKeys} = this.state
    disabledVideoKeys = disabledVideoKeys.filter(record => {
      return record !== videoId
    })
    selectedVideoList.splice(index, 1)
    let detail = Object.assign({}, this.state.detail, _form.getFieldsValue())
    this.setState({selectedVideoList, disabledVideoKeys, detail})
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({selectedRowKeys, selectedRows})
  }

  onSelectVideoChange = (selectedRowKeys, selectedRows) => {
    debugger
    this.setState({selectedVideoRowKeys: selectedRowKeys, selectedVideoRows: selectedRows})
  }

  handleOk = () => {
    let {dispatch} = this.props, {selectedRows} = this.state
    selectedRows.map(record => {
      record.type = 'VIDEOLIST'
      record.videoId = record.id
      return record
    })
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
    dispatch({
      type: 'ADD_RECOMMEND_VIDEO',
      newVideos: selectedRows.slice(0, this.state.selectLimit)
    })
  }

  // 选择了视频以后确定
  handleSelectVideoOk = () => {
    debugger
    let {selectedVideoList, disabledVideoKeys} = this.state,
      detail = Object.assign({}, this.state.detail, _form.getFieldsValue())
    selectedVideoList = selectedVideoList.concat(this.state.selectedVideoRows.map(record => {
      disabledVideoKeys.push(record.id)
      record.type = this.state.type
      record.description = record.simpleDescription
      record.videoId = record.id
      return record
    }))
    // disabledVideoKeys = disabledVideoKeys.concat(this.state.selectedVideoRowKeys)

    this.setState({selectedVideoList, disabledVideoKeys, detail})
    this.onEdit('choose', 'remove')
  }

  handleCancel = () => {
    let {dispatch} = this.props
    dispatch({
      type: 'ADD_RECOMMEND_VIDEO',
      newVideos: []
    })
  }

  beforeUpload(file) {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      Utils.dialog.error('图片大小不能超过2MB!');
    }
    return isLt2M;
  }

  shandleChange = (prop, {file, fileList}) => {

    if (file.response && file.response.errorCode === 0) {
      let detail = Object.assign({}, this.state.detail, _form.getFieldsValue())
      detail[prop] = file.response.data
      this.setState({detail})
    } else if (file.response && file.response.errorCode !== 0) {
      Utils.dialog.error(file.response.msg)
    }
  }

  // 添加或编辑表单提交
  handleSubmit = (form, e) => {
    let _this = this
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let jsonStr = _this.state.selectedVideoList.map(record => {
          let newObject = {}
          newObject.videoId = record.videoId
          newObject.type = record.type
          return newObject
        })

        values.jsonStr = JSON.stringify(jsonStr)
        if (_this.state.detail.id == undefined) {
          Actions.addVideoSet(values).then(response => {
            if (response.errorCode == 0) {
              Utils.dialog.success('添加成功', () => {
                let list = [response.data, ..._this.state.list]
                _this.setState({list})
                _this.onEdit('detail', 'remove')
              })
            } else {
              Utils.dialog.error(response.msg)
            }
          })
        } else {
          values.id = _this.state.detail.id
          Actions.editVideoSet(values).then(response => {
            if (response.errorCode == 0) {
              Utils.dialog.success('编辑成功', () => {
                let list = _this.state.list.map(record => {
                  if (record.id == response.data.id) {
                    return response.data
                  }
                  return record
                })

                _this.setState({list})
              })
            } else {
              Utils.dialog.error(response.msg)
            }
          })
        }
      }
    });

  }

  onChange = (activeKey) => {
    this.setState({activeKey});
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }

  remove = (targetKey) => {
    if (targetKey == 'detail') {
      this.setState({
        AddOrEditVideoSet: undefined,
        activeKey: 'list'
      })
    } else if (targetKey == 'choose') {
      this.setState({
        AddVideo: false,
        activeKey: this.state.AddOrEditVideoSet ? 'detail' : 'list'
      })
    }
  }

  // 拖动视频列表
  SortableItem = SortableElement(({record, indexs}) => {
    let type = ''
    switch (record.type) {
      case 'VOD' :
        type = '点播'
        break;
      case 'LIVE':
        type = '直播'
        break;
      case 'VIDEOLIST':
        type = '视频集'
        break;
      case 'ACTIVITY' :
        type = '活动'
        break;
      default:
        type = ''
    }
    return (
      <tr className="ant-table-row  ant-table-row-level-0">
        <td className="">
            <span className="ant-table-row-indent indent-level-0"
                  style={{paddingLeft: '0px'}}>

            </span>
          <img width="80px" src={record.coverImageHorizontal} alt=""/>
        </td>
        <td className="">{type}</td>
        <td className="">{record.title ? record.title : record.name}</td>
        <td className="">{record.simpleDescription}</td>
        <td className="">
          <Popconfirm placement="left"
                      title={record.type == 'VIDEOLIST' ? '确定剔除该视频集？' : record.type == 'ACTIVITY' ? '确定剔除该活动？' : '确定剔除该条视频？'}
                      onConfirm={() => this.onDeleteVideo(indexs)}
                      okText="确定" cancelText="取消">
            <button type="button" className="ant-btn">删 除</button>
          </Popconfirm>
        </td>
      </tr>
    )
  })

  SortableList = SortableContainer(({items}) => {
    let SortableItem = this.SortableItem
    return (
      <tbody className="ant-table-tbody">
      {
        items.map((record, index) => {
          return <SortableItem key={record.type + record.id} index={index} record={record} indexs={index}/>
        })
      }
      </tbody>
    );
  });

  onSortEnd = ({oldIndex, newIndex, collection}) => {
    var list = arrayMove(this.state.selectedVideoList, oldIndex, newIndex)
    this.setState({
      selectedVideoList: list
    })
    // let moveId = this.props.list[oldIndex].id, targetId = this.props.list[newIndex].id
    // Actions.swapRecommend(this.props.dispatch, {moveId, targetId},oldIndex, newIndex, arrayMove)
  }

  render() {
    let SortableList = this.SortableList
    const {detail} = this.state
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 6},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };
    const uploadProps = {
      className: "avatar-uploader",
      action: Actions.uploadImgUrl,
      showUploadList: false,
      withCredentials: true,
      beforeUpload: this.beforeUpload.bind(this),
      onChange: this.shandleChange.bind(this),
      name: 'upfile',
      accept: "image/*",
      data: {
        withStatus: true
      },
      headers: {
        'X-Requested-With': null,
      },
      onProgress: null,
    }
    const props1 = {
      action: Actions.uploadImgUrl,
      showUploadList: false,
      withCredentials: true,
      beforeUpload: this.beforeUpload.bind(this),
      onChange: this.shandleChange.bind(this, 'coverImageHorizontal'),
      name: 'upfile',
      accept: "image/*",
      data: {
        withStatus: true
      },
      headers: {
        'X-Requested-With': null,
      },
      onProgress: null,
      // disabled: !this.state.formValible

    }
    const props2 = {
      action: Actions.uploadImgUrl,
      showUploadList: false,
      withCredentials: true,
      beforeUpload: this.beforeUpload.bind(this),
      onChange: this.shandleChange.bind(this, 'coverImageVertical'),
      name: 'upfile',
      accept: "image/*",
      data: {
        withStatus: true
      },
      headers: {
        'X-Requested-With': null,
      },
      onProgress: null,
      // disabled: !this.state.formValible
    }
    const videoSetcolumns = [
      {
        title: "封面图",
        dataIndex: "coverImageHorizontal",
        key: "coverImageHorizontal",
        render: (url) => {
          return <img width="80px" src={url} alt=""/>
        }
      },
      {
        title: "主题",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "简介",
        dataIndex: "description",
        key: "description"
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id",
        render: (id, record, index) => {
          return (<div>
            <Button icon='edit' onClick={this.editPaneClick.bind(this, id,
              <Detail_content/>, 'detail', '编辑视频集', 'edit')}>编辑</Button>
            <Popconfirm placement="left" title='确定删除该视频集？'
                        onConfirm={() => this.onDeleteVideoSet(id, index)}
                        okText="确定" cancelText="取消">
              <Button icon='delete'>删除</Button>
            </Popconfirm>
          </div>)
        }
      }
    ]
    const videoColumns = [
      {
        title: "封面图",
        dataIndex: "coverImageHorizontal",
        key: "coverImageHorizontal",
        render: (url) => {
          return <div style={{width: '80px', overflow: 'hidden'}}>
            <img style={{height: "100%"}} src={url} alt=""/>
          </div>
        }
      },
      {
        title: "视频类型",
        dataIndex: "type",
        key: "type",
        render: (text) => {
          switch (text) {
            case 'VOD' :
              return '点播'
              break;
            case 'LIVE':
              return '直播'
              break;
            default:
              return ''
          }
        }
      },
      {
        title: "主题",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "简介",
        dataIndex: "simpleDescription",
        key: "simpleDescription"
      },
      {
        title: "操作",
        dataIndex: "videoId",
        key: "videoId",
        render: (id, record, index) => {
          return (<div>
            <Popconfirm placement="left" title='确定踢除该视频？'
                        onConfirm={() => this.onDeleteVideo(id, index)}
                        okText="确定" cancelText="取消">
              <Button icon='delete'>删除</Button>
            </Popconfirm>
          </div>)
        }
      }
    ]
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
      getCheckboxProps: record => (
        {
          disabled: this.state.disabledKeys.some((item) => {
            return item.id == record.id && item.type == 'VIDEOLIST'
          })     // Column configuration not to be checked
        }
      )
    };
    const videoChooseColumns = [
      {
        title: "封面图",
        dataIndex: "coverImageHorizontal",
        key: "coverImageHorizontal",
        render: (url) => {
          return <img width='40px' src={url} alt=""/>
        }
      },
      {
        title: "主题",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "简介",
        dataIndex: "simpleDescription",
        key: "simpleDescription"
      }
    ]
    const v_rowSelection = {
      // selectedRowKeys: this.state.selectedVideoRowKeys,
      onChange: this.onSelectVideoChange.bind(this),
      // getCheckboxProps: record => (
      //   {
      //     disabled: this.state.disabledVideoKeys.indexOf(record.id) > -1,    // Column configuration not to be checked
      //   }
      // )
    };
    const video_list_content = (
      <div>
        <Select defaultValue="LIVE" style={{width: 120, marginBottom: 10}}
                onChange={this.handleTypeChange.bind(this)}>
          <Option value="LIVE">直播</Option>
          <Option value="VOD">点播</Option>
        </Select>
        <Search
          placeholder="直播/点播主题"
          style={{width: 200, display: 'inlineBlock', marginLeft: 16, verticalAlign: 'top'}}
          onSearch={value => this.handleVideoListSearch(value)}
        />
        <Table rowSelection={v_rowSelection}
               columns={videoChooseColumns}
               dataSource={this.state.videoList}
               rowKey='id'
               pagination={false}
        />
        <Pagination
          total={this.state.videoListTotal}
          pageSize={this.state.limit}
          defaultCurrent={1}
          onChange={this.handleVideoListTableChange}
          style={{
            textAlign: 'right',
            marginTop: '16px'
          }}
        />
        <div className="footer">
          <Button size="large" onClick={this.handleSelectVideoOk.bind(this)} type="primary"
                  style={{marginLeft: 8}}>确定</Button>
        </div>
      </div>
    )
    const Detail_content = Form.create()(
      (props) => {
        const {form} = props;
        const {getFieldDecorator} = form;
        _form = form
        return (
          <Form onSubmit={this.handleSubmit.bind(this, form)}>
            <FormItem
              {...formItemLayout}
              label="视频集主题"
              hasFeedback
            >
              {getFieldDecorator('title', {
                rules: [{
                  required: true, message: '请填写视频集主题!',
                }],
                initialValue: detail.title
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="视频集简介"
              hasFeedback
            >
              {getFieldDecorator('description', {
                rules: [{
                  required: true, message: '请填写视频集简介!',
                }],
                initialValue: detail.description
              })(
                <Input/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="封面图"
              hasFeedback
            >
              <Col span="12">
                <FormItem
                  hasFeedback
                >
                  {getFieldDecorator('coverImageHorizontal', {
                    rules: [{
                      required: true, message: '请上传一张横排封面图',
                    }],
                    getValueFromEvent: this.normFile.bind(this),
                    initialValue: detail.coverImageHorizontal
                  })(
                    <Upload className="avatar-uploader horizon"
                            {...props1}
                    >
                      {
                        detail.coverImageHorizontal ?
                          <img src={ detail.coverImageHorizontal} alt="" className="avatar horizon"/> :
                          <Icon type="plus" className="avatar-uploader-trigger horizon"/>
                      }
                    </Upload>
                  )}
                  <div className="tip">横排封面图，比例：1000 * 600像素</div>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem
                  hasFeedback
                >
                  {getFieldDecorator('coverImageVertical', {
                    rules: [{
                      required: true, message: '请上传一张竖排封面图',
                    }],
                    getValueFromEvent: this.normFile.bind(this),
                    initialValue: detail.coverImageVertical
                  })(
                    <Upload className="avatar-uploader vertical"
                            {...props2}
                    >
                      {
                        detail.coverImageVertical ?
                          <img src={ detail.coverImageVertical} alt="" className="avatar vertical"/> :
                          <Icon type="plus" className="avatar-uploader-trigger vertical"/>
                      }
                    </Upload>
                  )}
                  <div className="tip">竖排封面图，比例：1000 * 1500像素</div>
                </FormItem>
              </Col>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="视频列表"
              hasFeedback
            >
              {getFieldDecorator('jsonStr')(
                <div>
                  <Button onClick={this.addVideoClick.bind(this, '', 'videoList', '视频列表', 'choose')}>添加视频</Button>
                </div>
              )
              }
              <div className="ant-table-wrapper" style={{marginTop: '10px'}}>
                <div className="ant-spin-nested-loading">
                  <div className="ant-spin-container">
                    <div className="ant-table ant-table-large ant-table-scroll-position-left">
                      <div className="ant-table-content">
                        <div className="ant-table-body">
                          <table className="">
                            <thead className="ant-table-thead">
                            <tr>
                              <th className=""><span>封面图</span></th>
                              <th className=""><span>视频类型</span></th>
                              <th className=""><span>主题</span></th>
                              <th className=""><span>简介</span></th>
                              <th className=""><span>操作</span></th>
                            </tr>
                            </thead>
                            <SortableList items={this.state.selectedVideoList} onSortEnd={this.onSortEnd} axis={"y"}/>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*<Table columns={videoColumns}*/}
              {/*rowKey='id'*/}
              {/*dataSource={this.state.selectedVideoList}*/}
              {/*style={{marginTop: '10px'}}*/}
              {/*pagination={false}*/}
              {/*/>*/}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">提交</Button>
            </FormItem>
          </Form>
        );
      }
    );
    const list_content = (<div>
      <Button type="primary" style={{margin: "0px 0px 12px"}}
              onClick={this.addPaneClick.bind(this, <Detail_content/>, 'detail', '新增视频集', 'add')}>新增视频集</Button>
      <Search
        placeholder="视频集主题"
        style={{width: 200, display: 'inlineBlock', marginLeft: 16, verticalAlign: 'top'}}
        onSearch={value => this.handleVideoSetListSearch(value)}
      />
      <Table rowSelection={rowSelection}
             columns={videoSetcolumns}
             dataSource={this.state.list}
             rowKey='id'
             pagination={false}
        // onChange={this.handleTableChange1}
      />
      <Pagination
        total={this.state.videoSetTotal}
        pageSize={this.state.limit}
        defaultCurrent={1}
        onChange={this.handleVideoSetTableChange}
        style={{
          textAlign: 'right',
          marginTop: '16px'
        }}
      />
      <div className="footer">
        <Button size="large" onClick={this.handleCancel.bind(this)}>取消</Button>
        <Button size="large" onClick={this.handleOk.bind(this)} type="primary" style={{marginLeft: 8}}>确定</Button>
      </div>
    </div>)
    const panes = [
      {title: '视频集列表', content: list_content, key: 'list', closable: false},
    ]
    this.state.AddOrEditVideoSet && panes.push({
      title: this.state.AddOrEditVideoSet == 'add' ? '新增视频集' : '编辑视频集',
      content: <Detail_content/>,
      key: 'detail',
      closable: true
    })
    this.state.AddVideo && panes.push({title: '添加视频', content: video_list_content, key: 'choose', closable: true})
    return (
      <Modal title="添加视频集" visible={this.state.videoSetListBoxvisible}
             footer={[]}
             width={1000}
             onCancel={this.handleCancel.bind(this)}
      >
        <Tabs
          hideAdd
          onChange={this.onChange.bind(this)}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={this.onEdit.bind(this)}
        >
          {panes.map(pane => <TabPane tab={pane.title} key={pane.key}
                                      closable={pane.closable}>{pane.content}</TabPane>)}
        </Tabs>
      </Modal>
    )
  }
}

export default connect()(VideoSetChoose)
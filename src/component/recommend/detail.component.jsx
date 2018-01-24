const {connect} = ReactRedux
import {Link} from 'react-router-dom';
import {Form, Input, Icon, Upload, Button, Table, Breadcrumb, Popconfirm} from 'antd';
const FormItem = Form.Item;
import {SketchPicker} from 'react-color';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';


import * as Actions from './action'
import Utils from '../../common/utils/utils'
import VideoChoose from './video_choose.component'
import VideoSetChoose from './video_set_choose.component'

const models = [
  {
    id: 1,
    imgs: [{id: '1-1'}],
    typeSetting: 'horizontal-one'
  },
  {
    id: 2,
    imgs: [{id: '2-1'}, {id: '2-2'}],
    typeSetting: 'horizontal-two'
  },
  {
    id: 22,
    imgs: [{id: '3-1'}, {id: '3-2'}],
    typeSetting: 'vertical'
  },
  {
    id: 3,
    imgs: [{id: '4-1'}, {id: '4-2'}, {id: '4-3'}],
    typeSetting: 'vertical'
  },
  {
    id: 4,
    imgs: [{id: '5-1'}, {id: '5-2'}, {id: '5-3'}, {id: '5-4'}],
    typeSetting: 'horizontal-four'
  }]


class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      submitButtonLoading: false, // 提交按钮
      detail: {
        backgroundColor: 'rgba(255,255,255,100)'
      },
      chooseToggle: false,
      limit: 1,
      selectedNum: 0,
      videoListBoxvisible: false,
      videoSetListBoxvisible: false
    }
  }

  componentDidMount() {
    let _this = this, {dispatch, match} = this.props, id = match.params.id
    if (id !== undefined) {
      Actions.getRecommend(id, dispatch).then(response => {
        if (response.errorCode === 0) {
          dispatch({
            type: 'VIDEO_LIST',
            videoList: response.data.data,
          })
          let selectModalIndex = response.data.data.length
          if (response.data.data.length == 2) {
            if (response.data.typeSetting == 'VERTICAL') {
              selectModalIndex = 2
            } else {
              selectModalIndex = 1
            }
          } else if (response.data.data.length == 1) {
            selectModalIndex = 0
          }
          _this.setState({
            chooseToggle: true,
            selectedNum: response.data.data.length,
            limit: response.data.data.length,
            selectModalIndex: selectModalIndex,
            detail: response.data
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    } else {
      dispatch({
        type: 'VIDEO_LIST',
        videoList: [],
      })
    }
  }

  // 剔除视频或视频集
  onDeleteVideo = (index) => {
    let {dispatch} = this.props, selectedNum = this.state.selectedNum - 1
    this.setState({selectedNum})
    dispatch({
      type: 'DELETE_RECOMMEND_VIDEO',
      index: index
    })
  }

  beforeUpload(file) {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      Utils.dialog.error('图片大小不能超过2MB!');
    }
    return isLt2M;
  }

  shandleChange = ({file, fileList}) => {
    if (file.response && file.response.errorCode === 0) {
      let detail = this.state.detail
      detail.coverImageHorizontal = file.response.data
      this.setState({detail})
    } else if (file.response && file.response.errorCode !== 0) {
      Utils.dialog.error(file.response.msg)
    }
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


  handleSubmit = (e) => {
    e.preventDefault()
    let {dispatch, match, history} = this.props, _this = this
    let arr = _this.props.videoList.slice(0, this.state.limit).map(record => {
      return {
        videoId: record.videoId,
        type: record.type
      }
    })
    _this.props.form.setFieldsValue({
      jsonStr: JSON.stringify(arr)
    })
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.backgroundColor = _this.state.detail.backgroundColor
        if (this.state.limit != this.state.selectedNum) {
          Utils.dialog.error('请上传一定数目的视频或视频集')
          return
        }
        _this.setState({
          submitButtonLoading: true,
        })
        if (match.params.id == undefined) {
          Actions.addRecommend(values, dispatch).then(response => {
            _this.setState({
              submitButtonLoading: false
            })
            if (response.errorCode == 0) {
              Utils.dialog.success('提交成功', () => {
                history.push('/recommend/video/list')
              })
            } else {
              Utils.dialog.error(response.msg)
            }
          })
        } else if (match.params.id !== undefined) {
          values.id = match.params.id
          Actions.editRecommend(values.id, values, dispatch).then(response => {
            _this.setState({
              submitButtonLoading: false
            })
            if (response.errorCode == 0) {
              Utils.dialog.success('提交成功', () => {
                history.push('/recommend/video/list')
              })
            } else {
              Utils.dialog.error(response.msg)
            }
          })

        }
      }
    });
  }

  // 模板选择变化
  modalOnChange = (index, modal) => {
    this.setState({
      chooseToggle: true,
      selectModalIndex: index,
      limit: modal.imgs.length
    })
    let typeSetting = ' '
    if (modal.imgs.length == 2) {
      if (modal.typeSetting == 'vertical') {
        typeSetting = 'VERTICAL'
      } else {
        typeSetting = 'HORIZONTAL'
      }
    }
    this.props.form.setFieldsValue({
      typeSetting: typeSetting
    })
  }

  handleAddVideoClick = () => {
    this.setState({
      videoListBoxvisible: true
    })
  }

  handleAddVideoSetClick = () => {
    this.setState({
      videoSetListBoxvisible: true
    })
  }

  componentWillReceiveProps(props) {
    this.setState({
      videoListBoxvisible: false,
      videoSetListBoxvisible: false,
      selectedNum: props.videoList.length
    })
  }

  handleColorChangeComplete = (color) => {
    let {detail} = this.state
    detail.backgroundColor = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`
    this.setState({detail});
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
            <Button icon='delete'>删除</Button>
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
    var list = arrayMove(this.props.videoList, oldIndex, newIndex)
    this.props.dispatch({
      type: 'SWAP_RECOMMEND_VIDEO',
      newVideos: list
    })
    // let moveId = this.props.list[oldIndex].id, targetId = this.props.list[newIndex].id
    // Actions.swapRecommend(this.props.dispatch, {moveId, targetId},oldIndex, newIndex, arrayMove)
  }


  render() {
    let SortableList = this.SortableList
    const {getFieldDecorator} = this.props.form;
    const {detail, description} = this.state
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
    const props = {
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
    const videoColumns = [
      {
        title: "封面图",
        dataIndex: "coverImageHorizontal",
        key: "coverImageHorizontal",
        render: (url) => {
          return <img width="80px" src={url} alt=""/>
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
            case 'VIDEOLIST':
              return '视频集'
              break;
            case 'ACTIVITY' :
              return '活动'
              break;
            default:
              return ''
          }
        }
      },
      {
        title: "主题",
        dataIndex: "title",
        key: "title",
        render: (title, record) => {
          if (title) {
            return title
          } else {
            return record.name
          }
        }
      },
      {
        title: "简介",
        dataIndex: "simpleDescription",
        key: "simpleDescription"
      },
      {
        title: '操作',
        dataIndex: "id",
        key: "id",
        render: (id, record, index) => {
          return (<Popconfirm placement="left"
                              title={record.type == 'VIDEOLIST' ? '确定剔除该视频集？' : record.type == 'ACTIVITY' ? '确定剔除该活动？' : '确定剔除该条视频？'}
                              onConfirm={() => this.onDeleteVideo(index)}
                              okText="确定" cancelText="取消">
            <Button icon='delete'>删除</Button>
          </Popconfirm>)
        }
      }
    ]

    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Link to={'/recommend/video/list'}>
              <Icon type="user"/>
              <span>视频推荐列表</span>
            </Link>
          </Breadcrumb.Item>
          {detail.id ? <Breadcrumb.Item>
            编辑推荐
          </Breadcrumb.Item> :
            <Breadcrumb.Item>
              新增推荐
            </Breadcrumb.Item>}
        </Breadcrumb>
        <div className="content">
          <Form onSubmit={this.handleSubmit} className="recommendForm">
            <FormItem
              {...formItemLayout}
              label="推荐主题"
              hasFeedback
            >
              {getFieldDecorator('title', {
                rules: [{
                  required: true, message: '请填写推荐主题!',
                }],
                initialValue: detail.title
              })(
                <Input/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="主封面图"
              hasFeedback
            >
              {getFieldDecorator('coverImage', {
                rules: [{
                  required: true, message: '请上传一张主封面图',
                }],
                getValueFromEvent: this.normFile.bind(this),
                initialValue: detail.coverImageHorizontal
              })(
                <Upload
                  {...props}
                  className="avatar-uploader horizon"
                >
                  {
                    detail.coverImageHorizontal ?
                      <img src={ detail.coverImageHorizontal} alt="" className="avatar horizon"/> :
                      <Icon type="plus" className="avatar-uploader-trigger horizon"/>
                  }
                </Upload>
              )}
              <span className="ant-form-text">建议尺寸：1000 * 600像素</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="背景颜色"
              hasFeedback
            >
              <SketchPicker
                color={ detail.backgroundColor ? detail.backgroundColor : {
                  r: 255,
                  g: 255,
                  b: 255,
                  a: 100,
                } }

                onChangeComplete={ this.handleColorChangeComplete.bind(this) }
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="推荐模板"
            >
              {getFieldDecorator('typeSetting', {
                rules: [{
                  required: true, message: '请先选择一个模板',
                }],
                initialValue: detail.typeSetting
              })(
                <div>
                  { models.map((model, index) => {
                    let selected = this.state.selectModalIndex == index ? 'selected' : ''
                    return (
                      <div className={"col" + ' ' + selected} key={model.id}
                           onClick={this.modalOnChange.bind(this, index, model)}>
                        {
                          this.state.selectModalIndex == index && <Icon type="check-circle" className='checked-icon'/>
                        }
                        <div className={model.typeSetting + ' ' + 'main-content'}>
                          <h1>xxx标题</h1>
                          <div className="flex-box">
                            {model.imgs.map((item) => {
                              return (   <div key={item.id}>
                                <div className="img-box">
                                  视频或视频集封面图
                                </div>
                                <p>视频或视频集主题</p>
                                <p>视频或视频集简介</p>
                              </div>)
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                  }
                </div>
              )}
            </FormItem>
            {this.state.chooseToggle && <FormItem
              {...formItemLayout}
              label="视频列表"
              hasFeedback
            >
              {getFieldDecorator('jsonStr', {
                rules: [{
                  required: true, message: '请添加视频或视频集',
                }],
                initialValue: detail.data
              })(
                <div>
                  <Button onClick={this.handleAddVideoClick.bind(this)}>添加视频</Button>
                  <Button style={{margin: '0 10px'}}
                          onClick={this.handleAddVideoSetClick.bind(this)}>添加视频集</Button>
                  <span className="ant-form-text "> 已选 <span className="color-orange">{this.state.selectedNum}/{this.state.limit}</span> 个视频</span>
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
                            <SortableList items={this.props.videoList} onSortEnd={this.onSortEnd} axis={"y"}/>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*<Table columns={videoColumns}*/}
                     {/*rowKey={record => record.type + record.id }*/}
                     {/*dataSource={this.props.videoList}*/}
                     {/*style={{marginTop: '10px'}}*/}
              {/*/>*/}
            </FormItem>
              }
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">提交</Button>
            </FormItem>
            <VideoChoose videoListBoxvisible={this.state.videoListBoxvisible} limit={this.state.limit - this.state.selectedNum}
                         selectedIdsAndType={this.props.videoList.map(record => {
                           return {
                             id: record.videoId,
                             type: record.type
                           }
                         })}/>
            <VideoSetChoose videoSetListBoxvisible={this.state.videoSetListBoxvisible} limit={this.state.limit - this.state.selectedNum}
                            selectedIdsAndType={this.props.videoList.map(record => {
                              return {
                                id: record.videoId,
                                type: record.type
                              }
                            })}/>
          </Form>
        </div>
      </div>
    );
  }
}

const DetailForm = connect((state) => {
  return {
    videoList: state.recommend.videoList,
  }
})(Form.create()(Detail))
export default DetailForm
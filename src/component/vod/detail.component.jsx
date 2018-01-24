const {connect} = ReactRedux
import {Link} from 'react-router-dom';
import {Form, Input, Radio, Breadcrumb, Icon, Upload, Checkbox, Button, Alert, Modal, DatePicker, TreeSelect, Progress, Col} from 'antd';
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

import ReactQuill, {Quill, Mixin, Toolbar} from 'react-quill'

const modules = {
  toolbar: {
    container: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
      [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
      // [{ 'direction': 'rtl' }],                         // text direction

      [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
      [{'header': [1, 2, 3, 4, 5, 6]}],

      [{'color': []}, {'background': []}],          // dropdown with defaults from theme
      [{'font': []}],
      [{'align': []}],
      ['link'],
      ['video'],
      ['clean']
    ]
  }
}
var getSignature = function (callback) {
  Actions.getSignature().then(response => {
    if (response.errorCode == 0) {
      callback(response.data)
    } else {
      Utils.dialog.error(response.msg)
    }
  })
};

import * as Actions from './action'
import Utils from '../../common/utils/utils'
import * as CONSTANTS from '../../common/utils/constants'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      is_not_add: false, // 添加模式、编辑模式的判断
      formValible: true, // 审核结果决定编辑模式下表单是否可编辑
      detail: {createUser: {}, auditUser: {}},
      description: '',
      auditRemark: '',
      isRemark: false,
      offShelveTime: '',
      loadingFlag: false,  //上传视频的等待标志
      videoStatus: '',   // 上传视频成功状态
      coverUrl: '',
      visibleModal: false, // 视频播放弹出框显示标志
      videoUrl: '',
      vodcategorys: [],
      market: []
    }
  }

  componentDidMount() {
    let _this = this, {dispatch, match} = this.props, id = match.params.id
    Actions.getVodCate({
      type: 'VOD'
    }).then(response => {
      if (response.errorCode == 0) {
        _this.setState({
          vodcategorys: response.data.map(record => {
            record.label = record.name
            record.id = record.id.toString()
            if (record.pid == 0) {
              record.pid = null
            } else {
              record.pid = record.pid.toString()
            }

            record.value = record.id
            return record
          })
        })
      }
    })
    Actions.getMarkets().then(response => {
      if (response.errorCode == 0) {
        response.data.rows.map(record => {
            record.label = record.name
            record.value = record.code
            return record
          }
        )
        _this.setState({
          market: response.data.rows
        })
      }
    })
    if (id !== undefined) {
      this.setState({
        is_not_add: true
      })
      Actions.getVod(id, dispatch).then(response => {
        if (response.errorCode === 0) {
          let vod = response.data
          vod.designatedMarket && (vod.designatedMarket = _this.marketArray(vod.designatedMarket))
          vod.categoryId = vod.categorySecondId ? vod.categorySecondId.toString() : vod.categoryFirstId.toString()
          _this.setState({
            formValible: (_this.props.operate == 'publish' && CONSTANTS.ON_SHELVE !== vod.status ? true : false),
            detail: response.data,
            videoUrl: vod.videoUrl,
            videoStatus: vod.fileId ? 'success' : '',
            marketChoosed: vod.permission == 'DESIGNATED_MARKET' ? true : false,
            description: vod.description
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    }
  }

  // 市场转换
  marketArray(designatedMarket) {
    return [1, 2, 4, 8].filter((value) => {
      return (designatedMarket & value) == value
    })
  }

  // 上传图片之前
  beforeUpload(file) {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      Utils.dialog.error('图片大小不能超过2MB!');
    }
    return isLt2M;
  }

  // 图片改变
  shandleChange = (prop,{file, fileList}) => {
    debugger
    if (file.response && file.response.errorCode === 0) {
      let detail = this.state.detail
      detail[prop] = file.response.data
      this.setState({detail})
    } else if (file.response && file.response.errorCode !== 0) {
      Utils.dialog.error(file.response.msg)
    }
  }
  // 上传图片时，转换返回的数据
  normFile = (e) => {
    debugger
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
  // 审核状态改变
  auditStatusTransform = (status) => {
    if (status == CONSTANTS.DRAFT) {
      return <Alert message="草稿" type="info"/>
    }
    if (status == CONSTANTS.TO_AUDIT) {
      return <Alert message="待审核" type="info"/>
    }
    if (status == CONSTANTS.AUDITED) {
      return <Alert message="审核通过" type="success"/>
    }
    if (status == CONSTANTS.REFUSE) {
      return <Alert message="审核未通过" type="error"/>
    }
    if (status == CONSTANTS.ON_SHELVE) {
      return <Alert message="上架中" type="info"/>
    }
    if (status == CONSTANTS.OFF_SHELVE) {
      return <Alert message="已下架" type="info"/>
    }
  }
  // 富文本编辑器内容改变
  handleEditorChange = (value) => {
    this.setState({
      description: value
    })
  }
  // 表单提交
  handleSubmit = (type, e) => {
    let condition = 'save', event = ''
    if (type == 'to_audit') {
      condition = 'to_audit'
      event = e
    } else {
      event = type
    }
    event.preventDefault()
    let flag;
    if (condition == 'save') {
      flag = true
    } else {
      flag = false
    }
    let {dispatch, match, history} = this.props, _this = this
    let description = this.refs.editor.state.value == '<p><br></p>' ? '' : this.refs.editor.state.value;
    this.props.form.setFieldsValue({description})
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        _this.setState({
          submitButtonClick: !flag,
          submitButtonLoading: !flag,
          saveButtonClick: flag,
          saveButtonLoading: flag
        })
        if (values.designatedMarket) {
          let all = 0
          values.designatedMarket = values.designatedMarket.map((val) => {
            all += val
          })
          values.designatedMarket = all
        }
        values.categoryId = Math.floor(values.categoryId)
        values.coverImage = values.coverImage ? values.coverImage : _this.state.coverUrl
        values.videoUrl = this.state.videoUrl
        if (match.params.id !== undefined){
          values.id = match.params.id
        }
        if(values.permission == 'WHITELIST') {
          values.upfile = _this.state.upfile
        }
        let formdata = new FormData();
        Object.keys(values).forEach((key) => {
          formdata.append(key,values[key]);
        })
        if (match.params.id == undefined && _this.state.fileName) {
          if (flag) {
            Actions.addVod(formdata, dispatch).then(response => {
              _this.setState({
                saveButtonClick: !flag,
                saveButtonLoading: !flag
              })
              if (response.errorCode == 0) {
                Utils.dialog.success('保存成功', () => {
                  history.push(`/vod/${this.props.operate}/list`)
                })
              } else {
                Utils.dialog.error(response.msg)
              }
            })
          } else {
            Actions.auditVod(formdata, dispatch).then(response => {
              _this.setState({
                submitButtonClick: flag,
                submitButtonLoading: flag
              })
              if (response.errorCode == 0) {
                Utils.dialog.success('提交成功', () => {
                  history.push(`/vod/${this.props.operate}/list`)
                })
              } else {
                Utils.dialog.error(response.msg)
              }
            })
          }

        } else if (match.params.id !== undefined) {
          if (flag) {
            Actions.editVod(formdata, dispatch).then(response => {
              _this.setState({
                saveButtonClick: !flag,
                saveButtonLoading: !flag
              })
              if (response.errorCode == 0) {
                Utils.dialog.success('编辑成功')
                let detail = _this.state.detail
                _this.setState({detail: Object.assign({}, detail, response.data)})
              } else {
                Utils.dialog.error(response.msg)
              }
            })
          } else {
            Actions.auditVod(formdata, dispatch).then(response => {
              _this.setState({
                saveButtonClick: flag,
                saveButtonClick: flag
              })
              if (response.errorCode == 0) {
                Utils.dialog.success('提交成功', () => {
                  history.push(`/vod/${this.props.operate}/list`)
                })
              } else {
                Utils.dialog.error(response.msg)
              }
            })
          }
        }
      }
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
              tempVidelUrl: result.default_video

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
  // 审核框是否弹出
  showModal = () => {
    this.setState({
      auditBoxVisible: true,
    });
  }
  // 确定操作   上架  审核
  handleAudited = (status) => {
    this.setState({
      confirmLoading: true,
    });
    let params = {
      id: this.props.match.params.id,
      status: status,
      planOffShelveTime: status == CONSTANTS.ON_SHELVE && this.state.offShelveTime ? this.state.offShelveTime : ''
    }
    let tip = status == CONSTANTS.ON_SHELVE ? '上架成功' : '审核成功'
    Actions.updateVod(params, this.props.dispatch).then(response => {
      this.setState({
        confirmLoading: false,
        auditBoxVisible: false
      });
      if (response.errorCode == 0) {
        Utils.dialog.success(tip, () => {
          this.props.history.push(`/vod/${this.props.operate}/list`)
        })
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }
  // 关闭弹出框，或者审核未通过
  handleRefused = (type) => {
    this.setState({
      cancleLoading: false,
      confirmLoading: false,
      auditBoxVisible: false,
    });
    if (type !== 'handle') {
      return
    } else {
      let params = {
        id: this.props.match.params.id,
        status: CONSTANTS.REFUSE,
        auditRemark: this.state.auditRemark

      }
      Actions.updateVod(params, this.props.dispatch).then(response => {
        this.setState({
          confirmLoading: false,
          auditBoxVisible: false
        });
        if (response.errorCode == 0) {
          Utils.dialog.success('审核成功', () => {
            this.props.history.push(`/vod/${this.props.operate}/list`)
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    }
  }

  // 下架
  showOffShelveConfirm = () => {
    let _this = this
    confirm({
      title: '确定下架该点播？',
      content: '',
      wrapClassName: "vertical-center-modal",
      onOk() {
        Actions.updateVod({
          id: _this.state.detail.id,
          status: CONSTANTS.OFF_SHELVE
        }, _this.props.dispatch).then(response => {
          if (response.errorCode == 0) {
            Utils.dialog.success('下架成功')
            // let detail  = response.data
            // _this.setState({detail})
          }
        })
      }
    });
  }

  // 下架时间
  handleOffShelveTime = (date) => {
    this.setState({
      offShelveTime: date.valueOf()
    })
  }

  // 根据操作以及点播状态获取底部不同的操作按钮
  getSubmitOperate = () => {
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
    let {operate, match} = this.props, detail = this.state.detail
    if (operate == 'audit') {
      if (detail.status == CONSTANTS.TO_AUDIT) {
        return (<FormItem {...tailFormItemLayout}>
          <Button type="primary" onClick={this.showModal}>审核</Button>
          <Modal title="审核结果"
                 visible={this.state.auditBoxVisible}
                 wrapClassName="vertical-center-modal"
                 footer={[
                   <Button key="back" size="large" disabled={this.state.confirmLoading || !this.state.isRemark}
                           loading={this.state.cancleLoading}
                           onClick={this.handleRefused.bind(this, 'handle')}>未通过审核</Button>,
                   <Button key="submit" type="primary" size="large" disabled={this.state.cancleLoading}
                           loading={this.state.confirmLoading}
                           onClick={this.handleAudited.bind(this, CONSTANTS.OFF_SHELVE)}>
                     通过审核
                   </Button>,
                 ]}
                 onOk={this.handleAudited.bind(this)}
                 onCancel={this.handleRefused.bind(this)}
          >
            <Input type="textarea" ref="remark" rows={4} placeholder="请在此填写未通过审核的理由，审核通过可以忽略"
                   onChange={this.collectRemark.bind(this)}/>
          </Modal>
        </FormItem>)
      } else {
        return
      }
    } else if (operate == 'push') {
      return (
        <FormItem {...tailFormItemLayout}>
          {detail.status == CONSTANTS.ON_SHELVE ?
            <Button type="primary" onClick={this.showOffShelveConfirm.bind(this)}>下架</Button> :
            <div>
              <Button type="primary" onClick={this.showModal}>上架</Button>
              < Modal title="上架"
                      visible={this.state.auditBoxVisible}
                      wrapClassName="vertical-center-modal"
                      okText="确定上架"
                      cancelText="取消"
                      onOk={this.handleAudited.bind(this, CONSTANTS.ON_SHELVE)}
                      onCancel={this.handleRefused.bind(this)}
              >
                设置下架时间（可不设）<DatePicker
                format="YYYY-MM-DD HH:mm"
                disabledDate={function (current) {
                  return current && current.valueOf() < Date.now();
                }}
                showTime
                onChange={this.handleOffShelveTime.bind(this)}
              />
              </Modal>
            </div>
          }
        </FormItem>
      )
    } else {
      // 添加
      if (!match.params.id) {
        return (<FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" size="large" disabled={this.state.submitButtonClick}
                  loading={this.state.saveButtonLoading}>{this.state.saveButtonLoading ? '正在保存...' : '保存'}</Button>
          <Button type="primary" size="large" disabled={this.state.saveButtonClick}
                  onClick={this.handleSubmit.bind(this, 'to_audit')}
                  loading={this.state.submitButtonLoading}
                  style={{'marginLeft': '10px'}}>{this.state.submitButtonLoading ? '正在提交...' : '提交审核'}</Button>
        </FormItem>)
      } else { // 编辑   只有草稿状态才能提交审核， 当为上架状态时就不能保存
        return (<FormItem {...tailFormItemLayout}>
          {detail.status !== CONSTANTS.ON_SHELVE &&
          <Button type="primary" htmlType="submit" size="large" disabled={this.state.submitButtonClick}
                  loading={this.state.saveButtonLoading}>{this.state.saveButtonLoading ? '正在保存...' : '保存'}</Button>
          }
          {detail.status == CONSTANTS.DRAFT &&
          <Button type="primary" size="large" disabled={this.state.saveButtonClick}
                  onClick={this.handleSubmit.bind(this, 'to_audit')}
                  loading={this.state.submitButtonLoading}
                  style={{'marginLeft': '10px'}}>{this.state.submitButtonLoading ? '正在提交...' : '提交审核'}</Button>}
        </FormItem>)
      }
    }
  }

  //  审核未通过理由
  collectRemark = (e) => {
    this.setState({
      auditRemark: e.target.value,
      isRemark: e.target.value ? true : false
    })
  }

  // 观看权限选择变化
  onPermissionChange = (e) => {
    let detail = this.state.detail
    detail.permission = e.target.value
    this.setState({detail})
  }

  //下载文件
  downloadExcel = (url, params) => {
    var form = document.createElement("form");
    document.body.appendChild(form);
    if(params) {
      Object.keys(params).forEach((key) => {
        var input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = params[key]
        form.appendChild(input)
      })
    }
    form.action = url;
    form.method = "get";
    form.submit().remove();
  }

  //  uploadVideo uploadVideoStart 处理文件上传
  uploadExcel = () => {
    var event = document.createEvent("MouseEvents"),
      ele = document.getElementById('excelFile');
    event.initEvent("click", true, true);
    event.stopPropagation();        //注意冒泡
    ele.dispatchEvent(event);
  }
  uploadExcelStart = (e) => {
    e.persist();
    let _this = this
    _this.setState({
      isUpfile: true,
      isNewExport: true,
      upfile: e.target.files[0]
    })
    _this.props.form.setFieldsValue({
      upfile: e.target.files[0],
    });
    return false
  }


  render() {
    const {getFieldDecorator} = this.props.form;
    const {detail, description, market} = this.state
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
      disabled: !this.state.formValible
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
      disabled: !this.state.formValible
    }

    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Link to={`/vod/${this.props.operate}/list`}>
              <Icon type="user"/>
              <span>点播列表</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {this.state.is_not_add ? '点播详情' : '新增点播'}
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Form onSubmit={this.handleSubmit}>
            {
              this.state.is_not_add &&
              <FormItem
                {...formItemLayout}
                label="审核状态"
                hasFeedback
              >
                {this.auditStatusTransform(detail.status)}
              </FormItem>
            }
            {
              CONSTANTS.REFUSE == detail.status &&
              <FormItem
                {...formItemLayout}
                label="未通过理由"
                hasFeedback
              >
                <div>{detail.auditRemark}</div>
              </FormItem>
            }
            {
              this.state.is_not_add &&
              <div>
                <FormItem
                  {...formItemLayout}
                  label="创建人"
                >
                  <span style={{'display': 'inline-block', "width": '200px'}}>{detail.createUser.userName}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>审核人:</label>
                  <span style={{
                    'display': 'inline-block',
                    "width": '200px'
                  }}>{detail.auditUser ? detail.auditUser.userName : ''}</span>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="创建时间"
                  hasFeedback
                >
            <span style={{
              'display': 'inline-block',
              "width": '200px'
            }}>{Utils.formatDate(detail.uploadTime, "yyyy-mm-dd hh:ii")}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>审核时间:</label>
                  {Utils.formatDate(detail.auditTime, "yyyy-mm-dd hh:ii")}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="上架时间"
                  hasFeedback
                >
            <span style={{
              'display': 'inline-block',
              "width": '200px'
            }}>{Utils.formatDate(detail.onShelveTime ? detail.onShelveTime : detail.planOnShelveTime, "yyyy-mm-dd hh:ii")}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>下架时间:</label>
                  {Utils.formatDate(detail.offShelveTime ? detail.offShelveTime : detail.planOffShelveTime, "yyyy-mm-dd hh:ii")}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="观看次数"
                >
                  <span style={{'display': 'inline-block', "width": '200px'}}>{detail.pv}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>虚拟观看次数:</label>
                  <span style={{'display': 'inline-block', "width": '200px'}}>{detail.pvSham}</span>
                </FormItem>
              </div>
            }
            <FormItem
              {...formItemLayout}
              label="点播分类"
              hasFeedback
            >
              {getFieldDecorator('categoryId', {
                rules: [{
                  required: true, message: '请选择点播分类!',
                }],
                initialValue: detail.categoryId
              })(
                <TreeSelect
                  dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                  treeData={this.state.vodcategorys}
                  treeDataSimpleMode={{'id': 'id', 'pId': 'pid', rootPId: null}}
                  treeNodeFilterProp='label'
                  placeholder="请选择一种分类"

                  allowClear
                  showSearch
                  disabled={!this.state.formValible}
                />
              )}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label="点播主题"
              hasFeedback
            >
              {getFieldDecorator('title',
                {
                  rules: [{
                    required: true, message: '请填写点播主题!',
                  }],
                  initialValue: detail.title
                }
              )
              (
                <Input disabled={!this.state.formValible}/>
              )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="观看权限"
              hasFeedback
            >
              {getFieldDecorator('permission', {
                rules: [{
                  required: true, message: '请选择观看权限',
                }],
                initialValue: detail.permission
              })(
                <RadioGroup disabled={!this.state.formValible} onChange={this.onPermissionChange.bind(this)}>
                  <Radio value='PUBLIC'>{CONSTANTS.PERMISSION.PUBLIC}</Radio>
                  <Radio value='BINDED'>{CONSTANTS.PERMISSION.BINDED}</Radio>
                  <Radio value='DESIGNATED_MARKET'>{CONSTANTS.PERMISSION.DESIGNATED_MARKET}</Radio>
                  <Radio value='WHITELIST'>{CONSTANTS.PERMISSION.WHITELIST}</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {detail.permission == 'DESIGNATED_MARKET' && <div>
              <FormItem
                {...formItemLayout}
                label="选择市场"
                colon={false}
                hasFeedback
              >
                {getFieldDecorator('designatedMarket', {
                  rules: [{
                    required: true, message: '请选择市场',
                  }],
                  initialValue: detail.designatedMarket
                })(
                  <CheckboxGroup options={market} disabled={!this.state.formValible}/>
                )}
              </FormItem>
            </div>}
            {detail.permission == 'WHITELIST' && <div>
              <FormItem
                {...formItemLayout}
                label="上传白名单"
                colon={false}
                hasFeedback
              >
                {getFieldDecorator('upfile', {
                  rules: [{
                    required: true, message: '上传白名单',
                  }],
                  initialValue: detail.upfile
                })(
                  <span style={{marginBottom: '10px', marginRight: '12px'}}>
                <input type="file" accept=".csv,.xls,.xlsx" id='excelFile' onChange={this.uploadExcelStart.bind(this)}
                       style={{display: 'none'}}/>
                <Button icon="upload" onClick={this.uploadExcel.bind(this)}
                        disabled={!this.state.formValible}>导入白名单的excle文件</Button>
              </span>
                )}
                {this.state.isUpfile && <span className="ant-form-text color-orange">导入成功！</span>}
                <span className="ant-form-text"><a href="javascript:;" onClick={this.downloadExcel.bind(this,'http://987-dev.oss-cn-shenzhen.aliyuncs.com/vl/img/30743ce5c3b14151bc1604a7c6dd4c8a.xls')}>下载白名单模板</a></span>
                {
                  this.state.is_not_add && !this.state.isNewExport && <div>
                    <Button icon="download" type="primary" onClick={this.downloadExcel.bind(this,Actions.exportExcelUrl, {
                      id: detail.id
                    })}>下载已上传的白名单</Button>
                  </div>
                }
              </FormItem>
            </div>}
            <FormItem
              {...formItemLayout}
              label="上传视频"
              hasFeedback
            >
              {getFieldDecorator('fileId', {
                rules: [{
                  required: true, message: '请上传视频文件',
                }],
                initialValue: detail.fileId
              })(
                <div style={{marginBottom: '10px'}}>
                  <input type="file" accept="video/*" id='videoFile' onChange={this.uploadVideoStart.bind(this)}
                         style={{display: 'none'}}/>
                  <Button icon="upload" onClick={this.uploadVideo.bind(this)}
                          disabled={!this.state.formValible}>上传文件</Button>
                </div>
              )}
              { this.state.loadingFlag ? <Progress
                percent={this.state.progress}/> : this.state.videoStatus == '' ? null : this.state.videoStatus == 'success' ?
                <div>
                  <Button icon="play-circle-o" type="primary" onClick={() => this.setModal1Visible(true)}>点击播放</Button>
                  <span className="ant-form-text" style={{marginLeft: 10,color: 'orangered'}}>视频转码需要时间，如遇不能播放的情况，请耐心等候！</span>
                  <Modal
                    visible={this.state.visibleModal}
                    title="视频"
                    footer={[]}
                    onCancel={() => this.setModal1Visible(false)}
                  >
                    <video src={this.state.videoUrl} poster={this.state.coverUrl} controls="controls" width={500}>
                      your browser does not support the video tag
                    </video>
                  </Modal>
                </div> : <Alert message="视频上传失败" type="error"/> }
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
                    <Upload className = "avatar-uploader horizon"
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
                    <Upload className = "avatar-uploader vertical"
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
              label="简介"
              hasFeedback
            >
              {getFieldDecorator('simpleDescription', {
                rules: [{
                  required: true, message: '请填写20字以内点播简介!',
                }],
                initialValue: detail.simpleDescription
              })(
                <Input maxLength="20" disabled={!this.state.formValible} placeholder="请填写20字以内的点播简介"/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="点播详情"
              hasFeedback
            >
              {getFieldDecorator('description', {
                rules: [{
                  required: true, message: '请输入点播详情',
                }],
              })(
                <div>
                  <ReactQuill
                    value={description}
                    theme="snow"
                    onChange={this.handleEditorChange.bind(this)}
                    modules={modules}
                    ref="editor"
                    readOnly={!this.state.formValible}
                  />
                </div>
              )}
            </FormItem>
            {this.getSubmitOperate()}
          </Form>
        </div>
      </div>
    );
  }
}
const DetailForm = connect()(Form.create()(Detail))
export default DetailForm
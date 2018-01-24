const {connect} = ReactRedux
import {Link} from 'react-router-dom';
import {Form, Input, Icon, Breadcrumb, Checkbox, Button, Alert, Modal} from 'antd';
import {Player} from 'video-react';
import "video-react/dist/video-react.css";
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

import * as Actions from './action'
import Utils from '../../common/utils/utils'
import * as CONSTANTS from '../../common/utils/constants'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: {content: []},
      description: '',
      auditRemark: '',
      isRemark: false,
      offShelveTime: '',
      marketChoosed: false,
      market: [],
      auditBoxVisible: false
    }
  }

  componentDidMount() {
    let _this = this, {match} = this.props, id = match.params.id
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
      this.setState({
        is_not_add: true
      })
      Actions.getMoment(id).then(response => {
        if (response.errorCode === 0) {
          response.data.designatedMarket = _this.marketArray(response.data.designatedMarket)
          if (response.data.type == 'IMAGE') {
            response.data.content = response.data.content ? response.data.content.split(',') : []
          }
          _this.setState({
            detail: response.data,
            marketChoosed: response.data.permission == 'DESIGNATED_MARKET' ? true : false,
            description: response.data.description
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      })
  }

  marketArray(designatedMarket) {
    return [1, 2, 4, 8].filter((value) => {
      return (designatedMarket & value) == value
    })
  }

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
  }

  showModal = () => {
    this.setState({
      auditBoxVisible: true,
    });
  }
  handleAudited = () => {
    this.setState({
      confirmLoading: true,
    });
    let params = {
      id: this.props.match.params.id,
      status: CONSTANTS.AUDITED
    }
    Actions.updateMoment(params, this.props.dispatch).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('审核成功', () => {
          this.setState({
            confirmLoading: false,
            auditBoxVisible: false
          });
          this.props.history.push('/moment/audit/list')
        })
      }
    })
  }
  handleRefused = () => {
    this.setState({
      cancleLoading: false,
      confirmLoading: false,
      auditBoxVisible: false,
    });
    let params = {
      id: this.props.match.params.id,
      status: CONSTANTS.REFUSE,
      auditRemark: this.state.auditRemark
    }
    Actions.updateMoment(params, this.props.dispatch).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('审核成功', () => {
          this.setState({
            confirmLoading: false,
            auditBoxVisible: false
          });
          this.props.history.push('/moment/audit/list')
        })
      }
    })
  }

  //  审核未通过理由
  collectRemark = (e) => {
    this.setState({
      auditRemark: e.target.value,
      isRemark: e.target.value ? true : false
    })
  }

  // 下载视频
  downloadVideo = (url) => {
    var form = document.createElement("form");
    document.body.appendChild(form);
    form.action = url;
    form.method = "get";
    form.submit().remove();
  }


  render() {
    const {detail, market} = this.state
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
    return (
    <div id="wrap">
      <Breadcrumb className="breadcrumb">
        <Breadcrumb.Item>
          <Link to={`/moment/audit/list`}>
            <Icon type="user"/>
            <span>短视频列表</span>
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          短视频详情
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className="content">
        <Form>
          <FormItem
            {...formItemLayout}
            label="审核状态"
            hasFeedback
          >
            {this.auditStatusTransform(detail.status)}
          </FormItem>
          { CONSTANTS.REFUSE == detail.status &&
          <FormItem
            {...formItemLayout}
            label="未通过理由"
            hasFeedback
          >
            <div>{detail.auditRemark}</div>
          </FormItem>
          }
          <FormItem
            {...formItemLayout}
            label="上传人头像"
            hasFeedback
          >
            <div>
              <img src={ detail.userHeaderImage} alt="" style={
                {
                  width: '80px',
                  height: '80px',
                  borderRadius: '100%'
                }
              }/>
            </div>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上传人"
            hasFeedback
          >
            <span style={{
              'display': 'inline-block',
              "width": '200px'
            }}>{detail.userName}</span>
            <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>审核人:</label>
            {detail.auditUserName}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上传人所属市场"
            hasFeedback
          >
          <span style={{
            'display': 'inline-block',
            "width": '200px'
          }}>{detail.marketName}</span>
            <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>上传人所属职级:</label>
            {detail.rankName}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上传时间"
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
            label="观看次数"
          >
            <span style={{'display': 'inline-block', "width": '200px'}}>{detail.pv}</span>
            <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>虚拟观看次数:</label>
            <span style={{'display': 'inline-block', "width": '200px'}}>{detail.pvSham}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="观看权限"
            hasFeedback
          >
            {CONSTANTS.PERMISSION[detail.permission]}
          </FormItem>
          {this.state.marketChoosed && <div>
            <FormItem
              {...formItemLayout}
              label="允许观看市场"
              colon={false}
              hasFeedback
            >
              <CheckboxGroup options={market} value={detail.designatedMarket}/>
            </FormItem>
          </div>}
          <FormItem
            {...formItemLayout}
            label="封面图"
            hasFeedback
          >
            <div className="avatar-uploader">
              <img src={ detail.coverImage} alt="" className="avatar"/>
            </div>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上传内容"
            hasFeedback
          >
            <div>
              <div>{detail.description}</div>
              {detail.type == 'VIDEO' ? <div style={{width: '350px'}}>
                <video src={detail.videoUrl}  controls="controls" width={350}>
                  your browser does not support the video tag
                </video>
                {/*<Player autoPlay>*/}
                  {/*<source src={detail.videoUrl}/>*/}
                {/*</Player>*/}
                {/*<Button icon="download" onClick={this.downloadVideo.bind(this,detail.videoUrl)}>下载该视频</Button>*/}
              </div> : <div className="ant-upload-list ant-upload-list-picture-card">
                {detail.content.map(url => {
                  return (<div className="ant-upload-list-item">
                    <div className="ant-upload-list-item-info">
                    <span>
                      <a className="ant-upload-list-item-thumbnail"><img src={url}></img></a>
                    </span>
                    </div>
                  </div>)
                })}
              </div>
              }
            </div>
          </FormItem>
          {detail.status == CONSTANTS.TO_AUDIT &&  <FormItem {...tailFormItemLayout}>
            <Button type="primary" onClick={this.showModal}>审核</Button>
            <Modal title="审核结果"
                   visible={this.state.auditBoxVisible}
                   wrapClassName="vertical-center-modal"
                   footer={[
                     <Button key="back" size="large" disabled={this.state.confirmLoading || !this.state.isRemark}
                             loading={this.state.cancleLoading}
                             onClick={this.handleRefused.bind(this)}>未通过审核</Button>,
                     <Button key="submit" type="primary" size="large" disabled={this.state.cancleLoading}
                             loading={this.state.confirmLoading}
                             onClick={this.handleAudited.bind(this)}>
                       通过审核
                     </Button>,
                   ]}
                   onOk={this.handleAudited.bind(this)}
                   onCancel={this.handleRefused.bind(this)}
            >
              <Input type="textarea" ref="remark" rows={4} placeholder="请在此填写未通过审核的理由，审核通过可以忽略"
                     onChange={this.collectRemark.bind(this)}/>
            </Modal>
          </FormItem>}
        </Form>
      </div>
    </div>
    );
  }
}

const DetailForm = connect()(Form.create()(Detail))
export default DetailForm
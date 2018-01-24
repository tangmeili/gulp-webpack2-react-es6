const {connect} = ReactRedux
import {Link} from 'react-router-dom';
import {Form, Input, Icon, Breadcrumb, Checkbox, Button, Col, Modal} from 'antd';
import {Player} from 'video-react';
import "video-react/dist/video-react.css";
const CheckboxGroup = Checkbox.Group;
const confirm = Modal.confirm;
const FormItem = Form.Item;

import * as Actions from './action'
import Utils from '../../common/utils/utils'
import * as CONSTANTS from '../../common/utils/constants'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: {
        content: [],
        activity: {}
      },
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
    Actions.getMaterial(id).then(response => {
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


  // 选为活动视频
  chooseForstand = (status) => {
    let _this = this
    let title = status == CONSTANTS.REFUSE ? '确定将该素材选为普通素材' : '确定将该素材选为精选素材'
    confirm({
      title: title,
      content: '只有精选素材才会在小程序端展示',
      wrapClassName: "vertical-center-modal",
      onOk() {
        Actions.updateMaterial({
          momentsId: _this.state.detail.id,
          status: status
        }).then(response => {
          if (response.errorCode == 0) {
            Utils.dialog.success('成功')
            let detail = response.data
            detail.activity = _this.state.detail.activity
            _this.setState({detail})
          }
        })
      }
    });
  }

  render() {
    debugger
    let {detail, market} = this.state
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
            <Link to={`/activity/material/index`}>
              <Icon type="user"/>
              <span>活动素材列表</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            素材详情
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Form>
            <FormItem
              {...formItemLayout}
              label="所属活动"
              hasFeedback
            >
              {detail.activity.name}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="状态"
              hasFeedback
            >
              {detail.status == CONSTANTS.TO_AUDIT ? '未处理' : detail.status == CONSTANTS.AUDITED ? '精选素材' : '普通素材'}
            </FormItem>
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
              <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>上传时间:</label>
              {Utils.formatDate(detail.uploadTime, "yyyy-mm-dd hh:ii")}
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
              label="观看次数"
            >
              <span style={{'display': 'inline-block', "width": '200px'}}>{detail.pv}</span>
              <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>虚拟观看次数:</label>
              <span style={{'display': 'inline-block', "width": '200px'}}>{detail.pvSham}</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="封面图"
              hasFeedback
            >
              <Col span="12">
                <div className="avatar-uploader horizon">
                  <img src={ detail.activity.coverImageHorizontal} alt="" className="avatar horizon"/>
                </div>
              </Col>
              <Col span="12">
                <div className="avatar-uploader vertical">
                  <img src={ detail.activity.coverImageVertical} alt="" className="avatar vertical"/>
                </div>
              </Col>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="上传内容"
              hasFeedback
            >
              <div>
                <div>{detail.description}</div>
                {detail.type == 'VIDEO' ? <div style={{width: '350px'}}>
                  <video src={detail.videoUrl} controls="controls" width={350}>
                    your browser does not support the video tag
                  </video>
                </div> : <div className="ant-upload-list ant-upload-list-picture-card">
                  {detail.content.map((url,index)=> {
                    return (<div className="ant-upload-list-item" key={index}>
                      <div style={{height: '100%', position: 'relative'}}>
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
            <FormItem {...tailFormItemLayout}>
              {
                detail.status == CONSTANTS.TO_AUDIT &&
                <div>
                  <Button type="primary" style={{marginRight: '12px'}}
                          onClick={this.chooseForstand.bind(this, CONSTANTS.AUDITED)}>选为精选素材</Button>
                  <Button type="primary" onClick={this.chooseForstand.bind(this, CONSTANTS.REFUSE)}>选为普通素材</Button>
                </div>
              }
              {
                detail.status == CONSTANTS.AUDITED &&
                <div>
                  <Button type="primary" onClick={this.chooseForstand.bind(this, CONSTANTS.REFUSE)}>选为普通素材</Button>
                </div>
              }
              {
                detail.status == CONSTANTS.REFUSE &&
                <div>
                  <Button type="primary" onClick={this.chooseForstand.bind(this, CONSTANTS.AUDITED)}>选为精选素材</Button>
                </div>
              }
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

const MaterialDetail = connect()(Form.create()(Detail))
export default MaterialDetail
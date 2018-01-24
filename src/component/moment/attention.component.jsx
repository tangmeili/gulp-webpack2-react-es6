import {Tabs, Table, Input, Form, Button, Modal, Row, Col, Select, InputNumber, Checkbox, Alert,} from 'antd'
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
import {Player} from 'video-react';
import "video-react/dist/video-react.css";


import * as Actions from './action'
import Utils from '../../common/utils/utils'
import * as CONSTANTS from '../../common/utils/constants'

class Attention extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userList: [],
      auditList: [],
      userDetail: false,
      auditDetail: false,
      activeKey: 'user_list',
      pagination1: {},
      pagination2: {},
      fileters1: {},
      fileters2: {},
      userId: '',
      user_detail: {},
      audit_detail: {content: []},
      shameBoxVisible: false,
      selectedId: '',
      uvSham: 0,
      market: []
    }
  }

  componentDidMount() {
    this.getAttentionUserList()
    this.getAttentionAuditList()
    this.getMarkets()
  }

  getMarkets() {
    Actions.getMarkets().then(response => {
      if (response.errorCode == 0) {
        response.data.rows.map(record => {
            record.label = record.name
            record.value = record.code
            return record
          }
        )
        this.setState({
          market: response.data.rows
        })
      }
    })
  }

  marketArray(designatedMarket) {
    return [1, 2, 4, 8].filter((value) => {
      return (designatedMarket & value) == value
    })
  }

  handleCheckAuditDetail(id) {
    this.setState({
      auditDetail: true,
      activeKey: 'audit_detail'
    })
    Actions.getMoment(id).then(response => {
      if (response.errorCode === 0) {
        response.data.designatedMarket = this.marketArray(response.data.designatedMarket)
        if (response.data.type == 'IMAGE') {
          response.data.content = response.data.content ? response.data.content.split(',') : []
        }
        this.setState({
          audit_detail: response.data,
          marketChoosed: response.data.permission == 'DESIGNATED_MARKET' ? true : false,
          description: response.data.description
        })
      } else {
        Utils.dialog.error(response.msg)
      }
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
      id: this.state.audit_detail.id,
      status: CONSTANTS.AUDITED
    }
    Actions.updateMoment(params).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('审核成功', () => {
          let auditList = this.state.auditList.map(record => {
              if (record.id == response.data.id) {
                return response.data
              }
              return record
            }
          )
          this.setState({
            confirmLoading: false,
            auditBoxVisible: false,
            audit_detail: response.data,
            auditList,
            activeKey: 'audit_list'
          });
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
      id: this.state.audit_detail.id,
      status: CONSTANTS.REFUSE,
      auditRemark: this.state.auditRemark
    }
    Actions.updateMoment(params).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('审核成功', () => {
          let auditList = this.state.auditList.map(record => {
              if (record.id == response.data.id) {
                return response.data
              }
              return record
            }
          )
          this.setState({
            confirmLoading: false,
            auditBoxVisible: false,
            audit_detail: response.data,
            auditList,
            activeKey: 'audit_list'
          });
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

  getAttentionUserList(params) {
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    Actions.getAttentionUserList({...params}).then((result) => {
      const pagination1 = {...this.state.pagination1};
      pagination1.current = result.data.page;
      pagination1.total = result.data.totalCount;
      this.setState({
        loading: false,
        pagination1,
        userList: result.data.rows
      });
    });
  }

  handleUserListSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        fileters1: values
      })
      this.getAttentionUserList({...values})
    });
  }
  handleUserTableChange = (pagination) => {
    const pager1 = {...this.state.pagination1};
    pager1.current = pagination.current;
    this.setState({
      pagination1: pager1,
    });
    this.getAttentionUserList({
      limit: this.state.limit ? this.state.limit : 10,
      page: pagination.current,
      ...this.state.fileters1
    });
  }

  getAttentionAuditList(params) {
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    Actions.getAttentionAuditList({...params}).then((result) => {
      const pagination2 = {...this.state.pagination2};
      pagination2.current = result.data.page;
      pagination2.total = result.data.totalCount;
      this.setState({
        loading: false,
        pagination2,
        auditList: result.data.rows
      });
    });
  }

  handleAuditListSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        fileters2: values
      })
      this.getAttentionAuditList({ userId: this.state.userId,...values})
    });
  }
  handleAuditTableChange = (pagination) => {
    const pager2 = {...this.state.pagination2};
    pager2.current = pagination.current;
    this.setState({
      pagination2: pager2,
    });
    this.getAttentionAuditList({
      limit: this.state.limit ? this.state.limit : 10,
      page: pagination.current,
      userId: this.state.userId,
      ...this.state.fileters2
    });
  }

  // 点击修改虚拟观看人数按钮
  edituvSham = (id, num) => {
    this.setState({
      shameBoxVisible: true,
      selectedId: id,
      uvSham: num,
    })
  }
  handleUvShamonChange = (value) => {
    this.setState({
      uvSham: value
    })
  }
  handleOk = () => {
    Actions.editMoment(this.state.selectedId, {
      uvSham: this.state.uvSham
    }).then(response => {
      this.setState({
        shameBoxVisible: false,
      });
      if (response.errorCode == 0) {
        Utils.dialog.success('修改成功')
        let auditList = this.state.auditList.map((record) => {
          if (record.id == response.data.id) {
            return response.data
          }
          return record
        })
        this.setState({auditList})
      } else {
        Utils.dialog.error(response.msg)
      }
    })

  }
  handleCancel = (e) => {
    this.setState({
      shameBoxVisible: false,
    });
  }

  onChange = (activeKey) => {
    this.setState({activeKey});
  }

  handleCheckUserAuditList = (id) => {
    this.setState({
      activeKey: 'audit_list',
      userId: id
    })
    this.getAttentionAuditList({userId: id})
  }

  handleCheckUserDetail = (id) => {
    this.setState({
      userDetail: true,
      activeKey: 'user_detail'
    })
    Actions.getAttentionUser(id).then(response => {
      if (response.errorCode == 0) {
        this.setState({
          user_detail: response.data
        })
      }
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {user_detail, audit_detail, market} = this.state
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    const colLayout = {
      xs: {span: 24},
      sm: {span: 8},
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
    const userColumns = [
      {
        title: "用户名",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "工卡号",
        dataIndex: "cardNumber",
        key: "cardNumber"
      },
      {
        title: "手机号",
        dataIndex: "loginPhone",
        key: "loginPhone"
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        render: (text) => {
          return CONSTANTS.USER_TYPE[text]
        }
      },
      {
        title: "所属市场",
        dataIndex: "marketName",
        key: "marketName"
      },
      {
        title: "职级",
        dataIndex: "rankName",
        key: "rankName"
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status ",
        render: (text) => {
          return CONSTANTS.USER_STATUS[text]
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id ",
        render: (id, record, index) => {
          return (
            <div>
              <Button icon="eye-o" onClick={this.handleCheckUserDetail.bind(this, id)}>查看详情</Button>
              <Button icon="eye-o" onClick={this.handleCheckUserAuditList.bind(this, id)}>查看用户的审核列表</Button>
            </div>
          )
        }
      }
    ]
    const audtiColumns = [
      {
        title: "创建人",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "创建人职级",
        dataIndex: "rankName",
        key: "rankName"
      },
      {
        title: "观看人数",
        dataIndex: "uv",
        key: "uv"
      },
      {
        title: "虚拟观看人数",
        dataIndex: "uvSham",
        key: "uvSham"
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
        render: (id, record, index) => {
          return (
            <div>
              { CONSTANTS.AUDIT_STATUS_TO_CN[record.status] == '待审核' ?
                <Button icon='export' onClick={this.handleCheckAuditDetail.bind(this, id)}>审核</Button> :
                <Button icon="eye-o" onClick={this.handleCheckAuditDetail.bind(this, id)}>查看详情</Button>
              }
              <Button icon="edit" onClick={this.edituvSham.bind(this, id, record.uvSham)}>修改虚拟观看人数</Button>
            </div>

          )
        }
      }
    ]
    return (
      <div id="wrap">
        <div className="content">
          <Tabs
            activeKey={this.state.activeKey}
            onChange={this.onChange}>
            <TabPane tab="特别关注用户列表" key="user_list">
              <Form
                className="ant-advanced-search-form"
                onSubmit={this.handleUserListSearch}
              >
                <Row gutter={40}>
                  <Col {...colLayout} key='1'>
                    <FormItem {...formItemLayout} label='用户名'>
                      {getFieldDecorator('userName')(
                        <Input />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...colLayout} key='2'>
                    <FormItem {...formItemLayout} label='工卡号'>
                      {getFieldDecorator('cardNumber')(
                        <Input />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...colLayout} className='searchBtn'>
                    <Button type="primary" htmlType="submit">查询</Button>
                  </Col>
                </Row>
              </Form>
              <Table columns={userColumns}
                     rowKey='id'
                     dataSource={this.state.userList}
                     pagination={this.state.pagination1}
                     loading={this.state.loading}
                     onChange={this.handleUserTableChange}
              />
            </TabPane>
            <TabPane tab="审核列表" key="audit_list">
              <Form
                className="ant-advanced-search-form"
                onSubmit={this.handleAuditListSearch}
              >
                <Row gutter={40}>
                  <Col {...colLayout} key='2'>
                    <FormItem {...formItemLayout} label='审核状态'>
                      {getFieldDecorator('status', {
                        initialValue: ' '
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
              <Table columns={audtiColumns}
                     rowKey='id'
                     dataSource={this.state.auditList}
                     pagination={this.state.pagination2}
                     loading={this.state.loading}
                     onChange={this.handleAuditTableChange}
              />
            </TabPane>
            {this.state.userDetail && <TabPane tab="用户详情" key="user_detail">
              <Form>
                <FormItem
                  {...formItemLayout}
                  label="昵称"
                >
                  <Input value={user_detail.userName} disabled style={{width: 160}}/>
                  <label className="label">性别:</label>
                  <Input value={CONSTANTS.SEX[user_detail.gender]} disabled style={{width: 160}}/>
                  <label className="label">身份:</label>
                  <Input value={CONSTANTS.USER_TYPE[user_detail.type]} disabled style={{width: 160}}/>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="职级"
                >
                  <Input value={user_detail.rankName} disabled style={{width: 160}}/>
                  <label className="label" htmlFor="">所属市场:</label>
                  <Input value={user_detail.marketName} disabled style={{width: 160}}/>
                  <label className="label">特别关注:</label>
                  <Input value={user_detail.specialAttention ? '是' : '否'} disabled style={{width: 160}}/>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="状态"
                >
                  <Input value={CONSTANTS.USER_STATUS[user_detail.status]} disabled style={{width: 160}}/>
                  <label className="label">是否禁言:</label>
                  <Input value={user_detail.isSilent ? '是' : '否'} disabled style={{width: 160}}/>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="卡号"
                >
                  <Input value={user_detail.cardNumber} disabled style={{width: 160}}/>
                  <label className="label">手机号码:</label>
                  <Input value={user_detail.loginPhone} disabled style={{width: 160}}/>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="个性签名"
                >
                  <Input value={user_detail.signature} disabled/>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="头像"
                  hasFeedback
                >
                  <img src={user_detail.headerImg} alt="" className="avatar"/>
                </FormItem>
              </Form>
            </TabPane>}
            {this.state.auditDetail && <TabPane tab="审核详情" key="audit_detail">
              <Form>
                <FormItem
                  {...formItemLayout}
                  label="审核状态"
                  hasFeedback
                >
                  {this.auditStatusTransform(audit_detail.status)}
                </FormItem>
                { CONSTANTS.REFUSE == audit_detail.status &&
                <FormItem
                  {...formItemLayout}
                  label="未通过理由"
                  hasFeedback
                >
                  <div>{audit_detail.auditRemark}</div>
                </FormItem>
                }
                <FormItem
                  {...formItemLayout}
                  label="上传人头像"
                  hasFeedback
                >
                  <div>
                    <img src={ audit_detail.userHeaderImage} alt="" style={
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
                  }}>{audit_detail.userName}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>审核人:</label>
                  {audit_detail.auditUserName}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="上传人所属市场"
                  hasFeedback
                >
                  <span style={{
                    'display': 'inline-block',
                    "width": '200px'
                  }}>{audit_detail.marketName}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>上传人所属职级:</label>
                  {audit_detail.rankName}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="上传时间"
                  hasFeedback
                >
                  <span style={{
                    'display': 'inline-block',
                    "width": '200px'
                  }}>{Utils.formatDate(audit_detail.uploadTime, "yyyy-mm-dd hh:ii")}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>审核时间:</label>
                  {Utils.formatDate(audit_detail.auditTime, "yyyy-mm-dd hh:ii")}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="观看人数"
                >
                  <span style={{'display': 'inline-block', "width": '200px'}}>{audit_detail.uv}</span>
                  <label htmlFor="" style={{"marginRight": "8px", "color": "rgba(0, 0, 0, 0.85)"}}>虚拟观看人数:</label>
                  <span style={{'display': 'inline-block', "width": '200px'}}>{audit_detail.uvSham}</span>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="观看权限"
                  hasFeedback
                >
                  {CONSTANTS.PERMISSION[audit_detail.permission]}
                </FormItem>
                {this.state.marketChoosed && <div>
                  <FormItem
                    {...formItemLayout}
                    label="允许观看市场"
                    colon={false}
                    hasFeedback
                  >
                    <CheckboxGroup options={market} value={audit_detail.designatedMarket}/>
                  </FormItem>
                </div>}
                <FormItem
                  {...formItemLayout}
                  label="封面图"
                  hasFeedback
                >
                  <div className="avatar-uploader">
                    <img src={ audit_detail.coverImage} alt="" className="avatar"/>
                  </div>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="上传内容"
                  hasFeedback
                >
                  <div>
                    <div>{audit_detail.description}</div>
                    {audit_detail.type == 'VIDEO' ? <div style={{width: '350px'}}>
                      <video src={audit_detail.videoUrl} controls="controls" width={350}>
                        your browser does not support the video tag
                      </video>
                      {/*<Player autoPlay>*/}
                        {/*<source src={audit_detail.videoUrl}/>*/}
                      {/*</Player>*/}
                    </div> : <div className="ant-upload-list ant-upload-list-picture-card">
                      {audit_detail.content.map(url => {
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
                {audit_detail.status == CONSTANTS.TO_AUDIT && <FormItem {...tailFormItemLayout}>
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
            </TabPane>}
          </Tabs>
        </div>
        <Modal title="修改虚拟观看人数"
               visible={this.state.shameBoxVisible}
               wrapClassName="vertical-center-modal"
               okText="确定"
               cancelText="取消"
               onOk={this.handleOk.bind(this)}
               onCancel={this.handleCancel.bind(this)}
        >
          <InputNumber size="large" defaultValue={this.state.uvSham} onChange={this.handleUvShamonChange.bind(this)}/>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(Attention)
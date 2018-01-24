const {connect} = ReactRedux
import {Link} from 'react-router-dom';
import {Form, Input, Icon, Breadcrumb, Button, Alert, Select } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;

import * as Actions from './action'
import Utils from '../../common/utils/utils'
import {USER_STATUS} from '../../common/utils/constants'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      is_not_add: false, // 添加模式、编辑模式的判断
      detail: {},
      confirmDirty: false,
      buttonLoading: false,
      roleCode: [],
      roleList: []
    }
  }

  componentDidMount() {
    let _this = this, {dispatch, match} = this.props, id = match.params.id
    Actions.getRoleList({limit: 10, page: 1}).then(response => {
      if(response.errorCode == 0) {
        this.setState({
          roleList: response.data.rows
        })
      } else {
        Utils.dialog.error(response.msg)
      }
    })
    if (id !== undefined) {
      this.setState({
        is_not_add: true
      })
      Actions.getAdmin(id).then(response => {
        if (response.errorCode === 0) {
          let roleCode = []
          response.data.role.map(record => {
            roleCode.push(record.code)
          })
          _this.setState({
            detail: response.data,
            roleCode
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    }
  }


  handleSubmit = (e) => {
    e.preventDefault()
    let {match, history} = this.props, _this = this
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        _this.setState({
          buttonLoading: true
        })
        if(values.permission) {
          values.permission = values.permission.join(',')
        }
        if(values.password) {
          values.password = Utils.sha256_digest(values.password)
        }
        delete values.confirm
        if (match.params.id == undefined) {
          Actions.addAdmin(values).then(response => {
            _this.setState({
              buttonLoading: false
            })
            if (response.errorCode == 0) {
              Utils.dialog.success('添加成功', () => {
                history.push('/admin/list/index')
              })
            } else {
              Utils.dialog.error(response.msg)
            }
          })
        } else if (match.params.id !== undefined) {
          values.id = match.params.id
          Actions.editAdmin(values).then(response => {
            _this.setState({
              buttonLoading: false
            })
            if (response.errorCode == 0) {
              Utils.dialog.success('修改成功', () => {
                  if (match.params.type == 'password') {
                    history.push('/admin/list/index')
                  }
                }
              )

            } else {
              Utils.dialog.error(response.msg)
            }
          })
        }
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({confirmDirty: this.state.confirmDirty || !!value});
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码输入不一致!');
    } else {
      callback();
    }
  }

  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], {force: true});
    }
    callback();
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {detail, is_not_add, roleCode, roleList} = this.state
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
    if (this.props.match.params.type == 'password') {
      return (
        <div id="wrap">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item>
              <Link to='/admin/list/index'>
                <Icon type="user"/>
                <span>管理员列表</span>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>修改密码</Breadcrumb.Item>
          </Breadcrumb>
          <div className="content">
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <div>
                <FormItem
                  {...formItemLayout}
                  label="新登录密码"
                  hasFeedback
                >
                  {getFieldDecorator('password', {
                    rules: [{
                      required: true, message: '请填写登录密码!',
                    }, {
                      validator: this.checkConfirm.bind(this),
                    }],
                    initialValue: detail.password
                  })(
                    <Input type="password"/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="确认密码"
                  hasFeedback
                >
                  {getFieldDecorator('confirm', {
                    rules: [{
                      required: true, message: '请确认密码',
                    }, {
                      validator: this.checkPassword.bind(this),
                    }],
                    initialValue: detail.password
                  })(
                    <Input type="password" onBlur={this.handleConfirmBlur.bind(this)}/>
                  )}
                </FormItem>
              </div>
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" size="large"
                        loading={this.state.buttonLoading}>{this.state.buttonLoading ? '正在提交...' : '提交'}</Button>
              </FormItem>
            </Form>
          </div>
        </div>
      )
    } else {
      return (
        <div id="wrap">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item>
              <Link to='/admin/list/index'>
                <Icon type="user"/>
                <span>管理员列表</span>
              </Link>
            </Breadcrumb.Item>
            {is_not_add ?
              <Breadcrumb.Item>编辑管理员</Breadcrumb.Item> : <Breadcrumb.Item>新增管理员</Breadcrumb.Item>
            }
          </Breadcrumb>
          <div className="content">
            <Form onSubmit={this.handleSubmit.bind(this)}>
              {is_not_add &&
              <FormItem
                {...formItemLayout}
                label="状态"
                hasFeedback
              >
                <Alert message={USER_STATUS[detail.status]} type="info"/>
              </FormItem>
              }
              <FormItem
                {...formItemLayout}
                label="登录账号"
                hasFeedback
              >
                {is_not_add ? detail.loginPhone : getFieldDecorator('loginPhone', {
                  rules: [{
                    required: true, message: '请填写登录账号!',
                    min: 5, message: '登录账号的长度为5~16',
                    max: 16, message: '登录账号的长度为5~16'
                  }],
                  initialValue: detail.loginPhone
                })(
                  <Input/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="昵称"
                hasFeedback
              >
                {getFieldDecorator('userName', {
                  rules: [{
                    required: true, message: '请填写昵称!',
                  }],
                  initialValue: detail.userName
                })(
                  <Input/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="管理员身份"
                hasFeedback
              >
                {getFieldDecorator('roleCode', {
                  initialValue: roleCode.length ? roleCode : undefined
                })(
                  <Select multiple>
                    {roleList.map(record => {
                      return (
                        <Option key={record.code}>{record.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              {!is_not_add && <div>
                <FormItem
                  {...formItemLayout}
                  label="登录密码"
                  hasFeedback
                >
                  {getFieldDecorator('password', {
                    rules: [{
                      required: true, message: '请填写登录密码!',
                    }, {
                      validator: this.checkConfirm.bind(this),
                    }],
                    initialValue: detail.password
                  })(
                    <Input type="password"/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="确认密码"
                  hasFeedback
                >
                  {getFieldDecorator('confirm', {
                    rules: [{
                      required: true, message: '请确认密码',
                    }, {
                      validator: this.checkPassword.bind(this),
                    }],
                    initialValue: detail.password
                  })(
                    <Input type="password" onBlur={this.handleConfirmBlur.bind(this)}/>
                  )}
                </FormItem>
              </div>
              }
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" size="large"
                        loading={this.state.buttonLoading}>{this.state.buttonLoading ? '正在提交...' : '提交'}</Button>
              </FormItem>
            </Form>
          </div>
        </div>
      );
    }
  }
}

const DetailForm = connect()(Form.create()(Detail))
export default DetailForm
/**
 * Created by Administrator on 2017/8/7.
 */

import '../common/utils/lib'
import {Form, Input, Row ,Col, Icon, Button, Alert} from 'antd';
const FormItem = Form.Item;
import Utils from '../common/utils/utils'
import AppService from '../common/utils/app.service'

import '../css/common.less'
import '../css/login.less'

const CodeUrl = AppService.codeUrl

class loginForm extends React.Component {
  state = {
    codeShow: false,
    codeImg: '',
    tips: ''
  }

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    // AppService.postRequest('login/portal/verify_login').then(response => {
    //   if(response.data) {
    //     var url = sessionStorage.getItem('gotoBeforeUrl');
    //     if(url == null){
    //       url = './index.html'
    //     }
    //     location.href = url
    //   }
    // })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    let _this = this
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.password = Utils.sha256_digest(values.password)
        AppService.postRequest('login/admin/login',values).then(result =>{
          if(result.errorCode == 0) {
            var url = sessionStorage.getItem('gotoBeforeUrl');
            if(url == null){
              url = './index.html'
            }
            location.href = url
          } else if(result.errorCode == 11) {
            _this.setState({
              codeShow: true,
              codeImg: CodeUrl  + Math.random()
            })
          } else {
            _this.setState({
              tips: result.msg,
              codeImg: CodeUrl  + Math.random()
            })
          }
        })
      }
    });

  }
  changeImg = () => {
    this.setState({
      codeImg: CodeUrl  + Math.random()
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div className="width1004 login_c">
        <div className="indexcontent">
          <div className="login_content">
            <div className="l_title">无限极账号</div>
            {this.state.tips && <Alert message={this.state.tips} type="error" style={{marginBottom: 12}}/>}
            <Form onSubmit={this.handleSubmit} className="login-form">
              <FormItem>
                {getFieldDecorator('loginName', {
                  rules: [{required: true, message: '请输入账号'}],
                })(
                  <Input prefix={<Icon type="user" style={{fontSize: 13}}/>} placeholder="账号"/>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{required: true, message: '请输入密码'}],
                })(
                  <Input prefix={<Icon type="lock" style={{fontSize: 13}}/>} type="password" placeholder="密码"/>
                )}
              </FormItem>
              {this.state.codeShow && <FormItem>
                <Row gutter={8}>
                  <Col span={12}>
                    {getFieldDecorator('verificationCode', {
                      rules: [{required: true, message: '请输入验证码'}],
                    })(
                      <Input size="large"/>
                    )}
                  </Col>
                  <Col span={12}>
                    <img src={this.state.codeImg} className="codeimg" onClick={this.changeImg}/>
                  </Col>
                </Row>
              </FormItem>}
              <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  登录
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}
const App = Form.create()(loginForm)
ReactDOM.render(<App/>, document.getElementById('container'))



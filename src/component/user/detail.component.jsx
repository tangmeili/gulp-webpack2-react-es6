import {Form, Input, Radio, Checkbox} from 'antd';
const FormItem = Form.Item;

import * as Actions from './action'
import Utils from '../../common/utils/utils'
import {USER_STATUS, USER_TYPE, SEX} from '../../common/utils/constants'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: {},
    }
  }

  componentDidMount() {
    let _this = this, {dispatch, match} = this.props, id = match.params.id
    Actions.getUser(id).then(response => {
      if (response.errorCode == 0) {
        _this.setState({
          detail: response.data
        })
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  render() {
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
    return (
      <Form>
        <FormItem
          {...formItemLayout}
          label="昵称"
        >
          <Input value={detail.userName} disabled style={{width: 160}}/>
          <label className="label">性别:</label>
          <Input value={SEX[detail.gender]} disabled style={{width: 160}}/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="身份"
        >
          <Input value={USER_TYPE[detail.type]} disabled  style={{width: 160}}/>
          <label className="label">特别关注:</label>
          <Input value={detail.specialAttention ? '是' : '否'} disabled style={{width: 160}}/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="职级"
        >
          <Input value={detail.rankName} disabled style={{width: 160}}/>
          <label className="label" htmlFor="">所属市场:</label>
          <Input value={detail.marketName} disabled style={{width: 160}}/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="状态"
        >
          <Input value={USER_STATUS[detail.status]} disabled style={{width: 160}}/>
          <label className="label">是否禁言:</label>
          <Input value={detail.isSilent ? '是' : '否'} disabled style={{width: 160}}/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="卡号"
        >
          <Input value={detail.cardNumber} disabled style={{width: 160}}/>
          <label className="label">手机号码:</label>
          <Input value={detail.loginPhone} disabled style={{width: 160}}/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="个性签名"
        >
          <Input value={detail.signature} disabled/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="头像"
          hasFeedback
        >
          <img src={detail.headerImg} alt="" className="avatar"/>
        </FormItem>
      </Form>
    );
  }
}

const DetailForm = Form.create()(Detail)
export default DetailForm
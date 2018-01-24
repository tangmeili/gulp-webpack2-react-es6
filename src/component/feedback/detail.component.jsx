import {Form, Input, Modal, Button} from 'antd';
const FormItem = Form.Item;

import * as Actions from './action'
import Utils from '../../common/utils/utils'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: {},
      buttonLoading: false,
      boxVisible: false
    }
  }

  componentDidMount() {
    let _this = this, {dispatch, match} = this.props, id = match.params.id
    Actions.getFeedback(id).then(response => {
      if (response.errorCode == 0) {
        _this.setState({
          detail: response.data
        })
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  handleBtnClick = () => {
    this.setState({
      boxVisible: true
    })
  }

  handleCancel = () => {
    this.setState({
      boxVisible: false
    })
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let detail = this.state.detail
        values.id = detail.id
        Actions.replyFeedback(values).then(response => {
          this.setState({boxVisible: false})
          if (response.errorCode == 0) {
            detail.replyContent = response.data.replyContent
            detail.replyTime = response.data.replyTime
            this.setState({detail})
            Utils.dialog.success('修改成功')
          } else {
            Utils.dialog.error(response.msg)
          }
        })
      }
    });
  }

  render() {
    const {detail} = this.state
    const {getFieldDecorator} = this.props.form
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
      <Form>
        <FormItem
          {...formItemLayout}
          label="用户名称"
        >
          <Input value={detail.userName} disabled style={{width: 160}}/>
          <label className="label">是否回复:</label>
          <Input value={detail.replyContent ? '是' : '否'} disabled style={{width: 160}}/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="反馈时间"
        >
          <Input value={Utils.formatDate(detail.createTime, 'YYYY-MM-DD hh:ii')} disabled style={{width: 160}}/>
          <label className="label">回复时间:</label>
          <Input value={Utils.formatDate(detail.replyTime, 'YYYY-MM-DD hh:ii')} disabled style={{width: 160}}/>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="反馈内容"
        >
          <Input type="textarea" rows={4} value={detail.content} disabled/>
        </FormItem>
        {detail.replyContent && <FormItem
          {...formItemLayout}
          label="回复内容"
        >
          <Input type="textarea" rows={4} value={detail.replyContent} disabled/>
        </FormItem>}

        {!detail.replyContent && <FormItem {...tailFormItemLayout}>
          <Button type="primary" size="large" loading={this.state.buttonLoading}
                  onClick={this.handleBtnClick.bind(this)}>{this.state.buttonLoading ? '正在提交...' : '回复'}</Button>
        </FormItem>}
        <Modal title="回复"
               visible={this.state.boxVisible}
               wrapClassName="vertical-center-modal"
               okText="确定"
               cancelText="取消"
               onOk={this.handleSubmit.bind(this)}
               onCancel={this.handleCancel.bind(this)}
               width={500}
        >
          <Form layout="vertical">
            <FormItem label='回复内容'>
              {getFieldDecorator('replyContent', {
                rules: [{
                  required: true, message: '回复内容不能为空!',
                }],
              })(
                <Input type="textarea" rows={4}/>
              )}
            </FormItem>
          </Form>
        </Modal>
      </Form>
    );
  }
}

const DetailForm = Form.create()(Detail)
export default DetailForm
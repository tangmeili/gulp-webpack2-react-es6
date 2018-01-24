import {Tooltip, Icon, InputNumber, Button} from 'antd'
import * as Actions from './action'
import Utils from '../../common/utils/utils'

class Setting extends React.Component {
  constructor() {
    super()
    this.state = {
      val: 0
    }
  }

  componentDidMount() {
    Actions.getIntervalSize().then(response => {
      if (response.errorCode == 0) {
        this.setState({
          val: Number(response.data.tips)
        })
      }
    })
  }

  onChange(value) {
    this.setState({
      val: value
    })
  }

  submit() {
    Actions.updateIntervalSize({
      id: 1005,
      tips: this.state.val
    }).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('修改成功')
      }
    })
  }

  render() {
    return (
      <div id="wrap">
        <div className="content">
          <div style={{width: '300px', margin: '0 auto'}}>
            <span style={{marginRight: 10}}>统计区间次数 <Tooltip title="全局设置数据统计的区间最大次数">
            <Icon type="question-circle-o"/>
          </Tooltip>：</span>
            <InputNumber min={1} onChange={this.onChange.bind(this)} value={this.state.val}/>
            <div style={{marginLeft: '134px', marginTop: '12px'}}>
              <Button type="primary" onClick={this.submit.bind(this)}>确定</Button>
            </div>
          </div>

        </div>
      </div>
    )
  }
}

export default Setting
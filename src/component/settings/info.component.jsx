import {Tabs, Table, Input, Button, Modal, Radio} from 'antd'
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;

import * as Actions from './action'
import Utils from '../../common/utils/utils'

class Info extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      tabPosition: 'top',
      marketList: [],
      rankList: [],
      EditMarketBoxVisible : false,
      MarketTitle: '',
      EditRankBoxVisible: false,
      RankTitle: '',
      selectedId: '',
      showVideoList : '1'
    }
  }

  componentDidMount(){
    this.getMarketList()
    this.getRanketList()
    this.getShowVideoList()
  }

  getMarketList = (params) => {
    params = {limit: 10, page: 1, ...params}
    Actions.getMarketList(params).then((result) => {
      this.setState({
        marketList: result.data.rows,
      })
    });
  }

  getRanketList = (params) => {
    params = {limit: 10, page: 1, ...params}
    Actions.getRankList(params).then((result) => {
      this.setState({
        rankList: result.data.rows,
      })
    });
  }

  getShowVideoList = () => {
    Actions.getShowVideoList('1006').then(response => {
      if(response.errorCode == 0) {
        this.setState({
          showVideoList: response.data.tips
        })
      }
    })
  }

  handleEditMarketClick = (id, title) => {
    this.setState({
      EditMarketBoxVisible : true,
      MarketTitle: title,
      selectedId: id
    })
  }

  handleEditRankClick = (id, title) => {
    this.setState({
      EditRankBoxVisible : true,
      RankTitle: title,
      selectedId: id
    })
  }

  handleMaketTitleChange = (e) => {
    this.setState({
      MarketTitle: e.target.value
    })
  }

  handleRankTitleChange = (e) => {
    this.setState({
      RankTitle: e.target.value
    })
  }

  handleEditMarketTitle = () => {
    Actions.updateMarket({
      id: this.state.selectedId,
      name: this.state.MarketTitle
    }).then(response => {
      this.setState({
        EditMarketBoxVisible: false,
      })
      if(response.errorCode == 0) {
        Utils.dialog.success('修改成功')
        let marketList = this.state.marketList.map(record => {
          if(record.id == response.data.id) {
            return response.data
          }
          return record
        })
        this.setState({marketList})
      } else {
        Utils.dialog.error(response.msg)
      }

    })
  }

  handleEditRankTitle = () => {
    Actions.updateRank({
      id: this.state.selectedId,
      name: this.state.RankTitle
    }).then(response => {
      this.setState({
        EditRankBoxVisible: false,
      })
      if(response.errorCode == 0) {
        Utils.dialog.success('修改成功')
        let rankList =  this.state.rankList.map(record => {
          if(record.id == response.data.id) {
            return response.data
          }
          return record
        })
        this.setState({rankList})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  handleCancel = () => {
    this.setState({
      EditMarketBoxVisible: false,
      EditRankBoxVisible: false
    })
  }

  onChange = (e) => {
    Actions.updateTips({
      id: '1006',
      tips: e.target.value
    }).then(response => {
      if(response.errorCode == 0) {
        Utils.dialog.success('修改成功')
        this.setState({
          showVideoList: e.target.value
        })
      } else {
        Utils.dialog.error(data.msg)
      }
    })
  }

  render() {
    const marketColumns = [
      {
        title: "市场名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id",
        render: (id,record, index) => {
          return (
            <Button onClick={this.handleEditMarketClick.bind(this, id, record.name)}>修改市场名称</Button>
          )
        }
      },
    ]
    const rankColumns = [
      {
        title: "职级名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id",
        render: (id,record, index) => {
          return (
            <Button onClick={this.handleEditRankClick.bind(this, id, record.name)}>修改职级名称</Button>
          )
        }
      },
    ]
    return (
      <div>
      <Tabs tabPosition={this.state.tabPosition}>
        <TabPane tab="市场设置" key="market">
          <Table columns={marketColumns}
                 rowKey='id'
                 dataSource={this.state.marketList}
                 pagination={false}
          />
        </TabPane>
        <TabPane tab="职级设置" key="rank">
          <Table columns={rankColumns}
                 rowKey='id'
                 dataSource={this.state.rankList}
                 pagination={false}
          />
        </TabPane>
        <TabPane tab="首页显示设置" key="home">
          <div style={{padding: 20}}>
            <span style={{marginRight: 10}}>首页显示页面：</span>
            <RadioGroup onChange={this.onChange} value={this.state.showVideoList}>
              <Radio value='1'>视频页面</Radio>
              <Radio value='0'>资讯页面</Radio>
            </RadioGroup>
          </div>
        </TabPane>
      </Tabs>
        <Modal title="修改市场名称" visible={this.state.EditMarketBoxVisible}
               onOk={this.handleEditMarketTitle.bind(this)} onCancel={this.handleCancel.bind(this)}
        >
          <Input value={this.state.MarketTitle} onChange={this.handleMaketTitleChange.bind(this)} style={{width: '50%'}}/>
        </Modal>
        <Modal title="修改职级名称" visible={this.state.EditRankBoxVisible}
               onOk={this.handleEditRankTitle.bind(this)} onCancel={this.handleCancel.bind(this)}
        >
          <Input value={this.state.RankTitle} onChange={this.handleRankTitleChange.bind(this)} style={{width: '50%'}}/>
        </Modal>
      </div>
    )
  }
}

export default Info
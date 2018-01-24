import echarts from 'echarts'
import {Collapse, Table, Button} from 'antd';
const Panel = Collapse.Panel;

import * as Actions from './action'
import Utils from '../../common/utils/utils'
import * as CONSTANTS from '../../common/utils/constants'

class VodEcharts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      pagination: {},
      loading: false,
      pvChart: undefined,
      commentChart: undefined,
      broadcastChart: undefined,
      pvChartOption: {
        title: {
          text: '播放次数统计',
          textStyle: {
            fontSize: 18,
            color: '#000'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['视频数量'],
          textStyle: {
            fontSize: 15,
            color: '#000'
          }
        },
        toolbox: {
          show: true,
          feature: {
            magicType: {show: true, type: ['line', 'bar']},
          }
        },
        xAxis: [
          {
            type: 'category',
            name: '播放次数/次',
            nameTextStyle: {
              color: '#000'
            },
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '直播视频数量/个',
            nameTextStyle: {
              color: '#000',
              height: 60,
              lineHeight: 60
            },
          }
        ],
        series: [
          {
            name: '视频数量',
            type: 'bar',
            data: []
          }
        ]
      },
      commentChartOption: {
        title: {
          text: '评论次数统计',
          textStyle: {
            fontSize: 18,
            color: '#000'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['视频数量'],
          textStyle: {
            fontSize: 15,
            color: '#000'
          }
        },
        toolbox: {
          show: true,
          feature: {
            magicType: {show: true, type: ['line', 'bar']},
          }
        },
        xAxis: [
          {
            type: 'category',
            name: '评论次数/次',
            nameTextStyle: {
              color: '#000'
            },
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '直播视频数量/个',
            nameTextStyle: {
              color: '#000',
              height: 60,
              lineHeight: 60
            },
          }
        ],
        series: [
          {
            name: '视频数量',
            type: 'bar',
            data: []
          }
        ]
      },
      broadcastChartOption: {
        title: {
          text: '完播率统计',
          textStyle: {
            fontSize: 18,
            color: '#000'
          }
        },
        tooltip: {
          trigger: 'axis',
          // formatter: function (params) {
          //   debugger
          //   return params[2].name + '<br />' + params[2].value;
          // }
        },
        legend: {
          data: ['观看人数'],
          textStyle: {
            fontSize: 15,
            color: '#000'
          }
        },
        toolbox: {
          show: true,
          feature: {
            magicType: {show: true, type: ['line', 'bar']},
          }
        },
        xAxis: [
          {
            type: 'category',
            name: '观看时长\n/百分比',
            nameTextStyle: {
              color: '#000'
            },
            axisTick: {
              alignWithLabel: true
            },
            data: ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%',]
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '观看人数/人',
            nameTextStyle: {
              color: '#000',
              height: 60,
              lineHeight: 60
            },
          }
        ],
        series: [
          {
            name: '观看人数',
            type: 'bar',
            data: []
          }
        ]
      },
    }
  }

  componentWillMount() {
    Actions.getVodStatistics({
      page: 1,
      limit: -1,
      type: 'PV'
    }).then(response => {
      if (response.errorCode == 0) {
        let pvChartOption = this.state.pvChartOption
        pvChartOption.xAxis[0].data = response.data.xAxis
        pvChartOption.series[0].data = response.data.yLine
        this.setState({
          pvChart: echarts.init(this.refs.playTimes),
          pvChartOption
        })
        this.state.pvChart.setOption(this.state.pvChartOption)
      } else {
        Utils.dialog.error(response.msg)
      }
    })
    this.getList()
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = {...this.state.pagination};
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.getList({
      limit: this.state.limit ? this.state.limit : 10,
      page: pagination.current,
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, type: 'BROADCAST', ...params}
    this.setState({loading: true});
    Actions.getVodList(params).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.total = result.data.totalCount;
      pagination.current = result.data.page;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        loading: false,
        pagination,
        list: result.data.rows
      })
    });
  }

  handleChange = (key) => {
    let _this = this
    if (key.indexOf('2') > -1 && !this.state.commentChart) {
      Actions.getVodStatistics({
        page: 1,
        limit: -1,
        type: 'COMMENTCOUNT'
      }).then(response => {
        if (response.errorCode == 0) {
          let commentChartOption = this.state.commentChartOption
          commentChartOption.xAxis[0].data = response.data.xAxis
          commentChartOption.series[0].data = response.data.yLine
          this.setState({
            commentChart: echarts.init(this.refs.commentTimes),
            commentChartOption
          })
          this.state.commentChart.setOption(this.state.commentChartOption)
        } else {
          Utils.dialog.error(response.msg)
        }
      })
    }
    if (key.indexOf('3') > -1 && !this.state.broadcastChart) {
      setTimeout(function () {
        _this.setState({
          broadcastChart: echarts.init(_this.refs.broadcastTimes)
        })
        _this.state.broadcastChart.setOption(_this.state.broadcastChartOption)
      }, 100)
    }
  }

  onRowClick = (record, index) => {
    Actions.getVod(record.id).then(response => {
        if (response.errorCode == 0) {
          // let broadcastChartOption = this.state.broadcastChartOption
          // broadcastChartOption.series[0].data = Object.values(response.data.vodBroadcast).slice(2)
          // this.setState({broadcastChartOption})
          let data = response.data.vodBroadcast
          this.state.broadcastChart.setOption({
            series: [{
              data: [data.tenPercent, data.twentyPercent, data.thirtyPercent, data.forthPercent, data.fiftyPercent, data.sixtyPercent, data.seventyPercent, data.eightyPercent, data.ninetyPercent, data.oneHundredPercent]
            }]
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      }
    )
  }

  render() {
    const columns = [
      {
        title: "点播主题",
        dataIndex: "title",
        key: "title"
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
        title: "观看次数",
        dataIndex: "pv",
        key: "pv"
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (text) => {
          return CONSTANTS.AUDIT_STATUS_TO_CN[text]
        }
      },
      // {
      //   title: "操作",
      //   dataIndex: "id",
      //   key: "id",
      //   render: (text, record, index) => {
      //     return (<Button icon='eye'>查看</Button>)
      //   }
      // }
    ]
    return (
      <div id="wrap">
        <div className="content">
          <Collapse bordered={false} defaultActiveKey={['1']} onChange={this.handleChange.bind(this)}>
            <Panel header="播放次数统计" key="1">
              <div ref='playTimes' className="echartsBox"></div>
            </Panel>
            <Panel header="评论次数统计" key="2">
              <div ref="commentTimes" className="echartsBox"></div>
            </Panel>
            <Panel header="完播率统计" key="3">
              <div className="flex-box">
                <div className="left_table">
                  <Table columns={columns}
                         rowKey='id'
                         dataSource={this.state.list}
                         pagination={this.state.pagination}
                         loading={this.state.loading}
                         onChange={this.handleTableChange}
                         onRowClick={this.onRowClick}
                  />
                </div>
                <div className="right_echart">
                  <div ref="broadcastTimes" className="echartsBox" style={{width: '100%'}}>

                  </div>
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    )
  }
}

export default VodEcharts
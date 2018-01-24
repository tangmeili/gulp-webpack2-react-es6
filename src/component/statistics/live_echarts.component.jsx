import echarts from 'echarts'

import * as Actions from './action'
import Utils from '../../common/utils/utils'

class LiveEcharts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pvChart: undefined,
      commentChart: undefined,
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
      // commentChartOption: {
      //   title: {
      //     text: '评论次数统计',
      //     textStyle: {
      //       fontSize: 18,
      //       color: '#000'
      //     }
      //   },
      //   tooltip: {
      //     trigger: 'axis'
      //   },
      //   legend: {
      //     data: ['视频数量'],
      //     textStyle: {
      //       fontSize: 15,
      //       color: '#000'
      //     }
      //   },
      //   toolbox: {
      //     show: true,
      //     feature: {
      //       magicType: {show: true, type: ['line', 'bar']},
      //     }
      //   },
      //   xAxis: [
      //     {
      //       type: 'category',
      //       name: '评论次数/次',
      //       nameTextStyle: {
      //         color: '#000'
      //       },
      //       data: []
      //     }
      //   ],
      //   yAxis: [
      //     {
      //       type: 'value',
      //       name: '直播视频数量/个',
      //       nameTextStyle: {
      //         color: '#000',
      //         height: 60,
      //         lineHeight: 60
      //       },
      //     }
      //   ],
      //   series: [
      //     {
      //       name: '视频数量',
      //       type: 'bar',
      //       data: []
      //     }
      //   ]
      // },
    }
  }

  componentWillMount() {
    Actions.getLiveStatistics('PV').then(response => {
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
    // Actions.getLiveStatistics('COMMENTCOUNT').then(response => {
    //   if (response.errorCode == 0) {
    //     let commentChartOption = this.state.commentChartOption
    //     commentChartOption.xAxis[0].data = response.data.xAxis
    //     commentChartOption.series[0].data = response.data.yLine
    //     this.setState({
    //       commentChart: echarts.init(this.refs.commentTimes),
    //       commentChartOption
    //     })
    //     this.state.commentChart.setOption(this.state.commentChartOption)
    //   } else {
    //     Utils.dialog.error(response.msg)
    //   }
    // })
  }

  render() {
    return (
      <div id="wrap">
        <div className="content">
          <div ref='playTimes' className="echartsBox">

          </div>
          {/*<div style={*/}
            {/*{*/}
              {/*width: '80%',*/}
              {/*margin: '0 auto',*/}
              {/*fontSize: '13px',*/}
              {/*fontWeight: 600*/}
            {/*}*/}
          {/*}>温馨提示：评论次数统计将会在每天的凌晨两点更新*/}
          {/*</div>*/}
          {/*<div ref="commentTimes" className="echartsBox">*/}
          {/*</div>*/}
        </div>
      </div>
    )
  }
}

export default LiveEcharts
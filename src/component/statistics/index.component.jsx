import {
  Route, Redirect
} from 'react-router-dom';


import KeyList from './key_list.component'
import LiveEcharts from './live_echarts.component'
import MomentEcharts from './moment_echarts.component'
import VodEcharts from './vod_echarts.component'
import Setting from './setting.component'

class Statistics extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match} = this.props
    return (
      <div>
        <Route exact path={`${match.url}`} render={() => {
          return <Redirect to={`${match.url}/index`}/>
        }}/>
        <Route exact path={`/statistics/key/index`} component={(props) => <KeyList {...props}/> }/>
        <Route exact path={`/statistics/setting/index`} component={(props) => <Setting {...props}/> }/>
        <Route exact path={`/statistics/live/index`} component={(props) => <LiveEcharts {...props}/> }/>
        <Route exact path={`/statistics/vod/index`} component={(props) => <VodEcharts {...props}/> }/>
        <Route exact path={`/statistics/moment/index`} component={(props) => <MomentEcharts {...props}/> }/>
        {/*<Route exact path={`/comment/comment/list`} component={(props) => <CommentList {...props}/> }/>*/}
        {/*<Route exact path={`/comment/report/list`} component={(props) => <ReportList {...props}/> }/>*/}
        {/*<Route exact path={`/comment/forbid/list`} component={(props) => <ForbidList {...props}/> }/>*/}
        {/*<Route exact path={`/comment/forbid/list/edit/:id`} component={(props) => <DetailForm {...props}/> }/>*/}
      </div>
    )
  }

}

export default Statistics
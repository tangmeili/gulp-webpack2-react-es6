import {
  Route, Redirect
} from 'react-router-dom';

import SensitiveList from './sensitive_list.component'
import ReportList from './report_list.component'
import CommentList from './comment_list.component'
import ForbidList from './forbid_list.component'
import DetailForm from './forbid_user_detail.component'


class Comment extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {match} = this.props
    return (
      <div>
        <Route exact path={`${match.url}`} render={() => {
          return <Redirect to={`${match.url}/list`}/>
        }}/>
        <Route exact path={`/comment/sensitive/list`} component={(props) => <SensitiveList {...props}/> }/>
        <Route exact path={`/comment/comment/list`} component={(props) => <CommentList {...props}/> }/>
        <Route exact path={`/comment/report/list`} component={(props) => <ReportList {...props}/> }/>
        <Route exact path={`/comment/forbid/list`} component={(props) => <ForbidList {...props}/> }/>
        <Route exact path={`/comment/forbid/list/edit/:id`} component={(props) => <DetailForm {...props}/> }/>
      </div>
    )
  }

}

export default Comment
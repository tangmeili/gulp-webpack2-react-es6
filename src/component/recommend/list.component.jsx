/**
 * Created by Administrator on 2017/8/10.
 */

import {Link} from 'react-router-dom';
import {Button, Form, Breadcrumb, Icon, Popconfirm} from 'antd';
const {connect} = ReactRedux
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import * as Actions from './action'
import Utils from '../../common/utils/utils'


class App extends React.Component {
  state = {
    list: [],
    toAuditLoading: false,
    limit: 10,
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getList();
  }

  // 删除某个推荐
  handleDelete = (id, index) => {
    let {dispatch} = this.props
    Actions.deleteRecommend(id, index, dispatch).then(result => {
      if (result.errorCode == 0) {
        Utils.dialog.success('删除成功')
      } else {
        Utils.dialog.error(result.msg)
      }
    })
  }

  getList = (params) => {
    params = {...params}
    this.setState({loading: true});
    let {dispatch} = this.props
    Actions.getRecommendList(dispatch)
  }
  onMouseEnterHandle = (index) => {
    this.setState({
      selectIndex: index
    })
  }
  onMouseLeaveHandle = (index) => {
    this.setState({
      selectIndex: -1
    })
  }

  SortableItem = SortableElement(({record, indexs}) => {
    let className = '', show = this.state.selectIndex == indexs ? 'show' : '', imgType = ''
    switch (record.data.length) {
      case 1:
        className = 'horizontal-one';
        imgType = 'coverImageHorizontal'
        break;
      case 2:
        className = record.typeSetting == 'HORIZONTAL' ? 'horizontal-two' : 'vertical';
        imgType = record.typeSetting == 'HORIZONTAL' ? 'coverImageHorizontal' : 'coverImageVertical'
        break;
      case 3:
        className = 'vertical';
        imgType = 'coverImageVertical'
        break;
      case 4:
        className = 'horizontal-four'
        imgType = 'coverImageHorizontal'
        break
    }
    ;
    return (
      <div key={record.id.toString()} className="col"
           onMouseEnter={ this.onMouseEnterHandle.bind(this, indexs)}
           onMouseLeave={this.onMouseLeaveHandle.bind(this, indexs)}>
        <div className={"absolute" + ' ' + show }>
                      <span>
                        <Link to={`${this.props.match.url}/edit/${record.id}`}><Icon type="edit" style={{
                          color: '#fff',
                          fontSize: '20px',
                          margin: '0 10px'
                        }}/></Link>
                         <Popconfirm placement="left" title={'确定删除该推荐？'}
                                     onConfirm={() => this.handleDelete(record.id, indexs)}
                                     okText="确定" cancelText="取消">
                            <Icon type="delete" style={{color: '#fff', fontSize: '20px', cursor: 'pointer'}}/>
                          </Popconfirm>
                      </span>
        </div>
        <div className={className + ' ' + 'main-content'}>

          <h1>{record.title}</h1>
          <div className="flex-box">
            {
              record.data.map((video) => {
                return (<div key={video.id.toString()}>
                  <div className="img-box">
                    <img src={video[imgType]} alt=""/>
                  </div>
                  <p>{video.title}</p>
                  <p>{video.simpleDescription}</p>
                </div>)
              })
            }
          </div>
        </div>
      </div>
    )
  })

  SortableList = SortableContainer(({items}) => {
    let SortableItem = this.SortableItem
    return (
      <div className="list-box">
        {
          items.map((record, index) => {
            return <SortableItem key={record.id} index={index} record={record} indexs={index}/>
          })
        }
      </div>
    );
  });


  onSortEnd = ({oldIndex, newIndex, collection}) => {
    let moveId = this.props.list[oldIndex].id, targetId = this.props.list[newIndex].id
    Actions.swapRecommend(this.props.dispatch, {moveId, targetId},oldIndex, newIndex, arrayMove)
  }


  render() {
    let SortableList = this.SortableList
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Icon type="user"/>
            <span>视频推荐列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Link to={`${this.props.match.url}/add`}><Button type="primary" style={{margin: "0px 0px 12px"}}>新增推荐</Button></Link>
          <SortableList items={this.props.list} onSortEnd={this.onSortEnd} axis={"xy"}/>
        </div>
      </div>
    )
  }
}

const List = connect((state) => {
  return {
    list: state.recommend.list
  }
})(Form.create()(App))
export default List



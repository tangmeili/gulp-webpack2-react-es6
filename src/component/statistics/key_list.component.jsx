import {Select, Form, Table, Icon, Breadcrumb} from 'antd';

import * as Actions from './action'

class KeyList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      limit: 10,
      pagination: {},
      loading: false,
    }
  }

  componentDidMount() {
    this.getList()
  }

  getList = (params) => {
    this.setState({loading: true});
    Actions.getKeyList().then((result) => {
      this.setState({
        list: result.data.rows,
        loading: false,
      })
    });
  }

  handleAddBtnClick = () => {

  }

  render() {
    const columns = [
      {
        title: "关键词",
        dataIndex: "word",
        key: "word",
      },
      {
        title: "搜索次数",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "来源",
        dataIndex: "isDisplay",
        key: "isDisplay",
        render: (isDisplay) => {
          return isDisplay ? '手动添加' : '热门搜索'
        }
      },
    ]
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Icon type="user"/>
            <span>搜索关键词列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Table columns={columns}
                 rowKey='id'
                 dataSource={this.state.list}
                 loading={this.state.loading}
          />
        </div>
      </div>
    )
  }
}

export default KeyList
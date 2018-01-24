import {Modal, Select, Table, Pagination, Input} from 'antd';
const Option = Select.Option;
const Search = Input.Search;
const {connect} = ReactRedux

import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

class VideoChoose extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
      limit: 6,
      total: 0,
      selectedRowKeys: [],
      selectedRows: [],
      videoListBoxvisible: false,
      disabledKeys: [],
      type: 'LIVE',
      title: '',
      name: '',
      selectLimit: Number
    }
  }

  componentDidMount() {
    this.getList('LIVE');
  }

  componentWillReceiveProps(props) {
    debugger
    this.setState({
      videoListBoxvisible: props.videoListBoxvisible,
      disabledKeys: props.selectedIdsAndType,
      selectLimit: props.limit
    })
  }

  handleTableChange = (page, pageSize) => {
    this.getList(this.state.type, {
      limit: this.state.limit,
      page: page,
      title: this.state.title,
      name: this.state.name
    });
  }

  getList = (type, params) => {
    params = {
      limit: this.state.limit,
      page: 1,
      liveStatusEnum: CONSTANTS.ON_SHELVE,
      vodStatusEnum: CONSTANTS.ON_SHELVE,
      activityStatusEnum: CONSTANTS.ON_SHELVE,
      ...params
    }
    this.setState({loading: true});
    Actions.getVideoList(type, params).then((response) => {
      if (response.errorCode == 0) {
        this.setState({
          loading: false,
          total: response.data.totalCount,
          list: response.data.rows
        })
      } else {
        Utils.dialog.error((response.msg))
      }
    })
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    debugger
    this.setState({selectedRowKeys, selectedRows})
  }

  handleOk = () => {
    debugger
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
    let {dispatch} = this.props, {selectedRows} = this.state
    selectedRows.map(record => {
      record.type = this.state.type
      record.videoId = record.id
      return record
    })
    dispatch({
      type: 'ADD_RECOMMEND_VIDEO',
      newVideos: selectedRows.slice(0, this.state.selectLimit)
    })
  }

  handleCancel = () => {
    let {dispatch} = this.props
    dispatch({
      type: 'ADD_RECOMMEND_VIDEO',
      newVideos: []
    })
  }

  // 直播、点播筛选条件变化
  handleTypeChange = (type, title) => {
    debugger
    type = type == null ? this.state.type : type
    title = title == null ? this.state.title : title
    name = title == null ? this.state.name : title
    this.setState({
      type,
      title,
      name
    })
    this.getList(type, {title: title, name: name})
  }

  render() {
    const {selectedRowKeys, list} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
      getCheckboxProps: record => (
        {
          disabled: this.state.disabledKeys.some((item) => {
            return item.id == record.id && item.type == this.state.type
          })     // Column configuration not to be checked
        }
      )
    };
    const columns = [
      {
        title: "封面图",
        dataIndex: "coverImageHorizontal",
        key: "coverImageHorizontal",
        render: (url) => {
          return <img width="80px" src={url} alt=""/>
        }
      },
      {
        title: "主题",
        dataIndex: "title",
        key: "title",
        render: (title, record) => {
          if (title) {
            return title
          } else {
            return record.name
          }
        }
      },
      {
        title: "简介",
        dataIndex: "simpleDescription",
        key: "simpleDescription"
      }
    ]
    return (
      <Modal title="添加视频" visible={this.state.videoListBoxvisible}
             onOk={this.handleOk.bind(this)} onCancel={this.handleCancel}
             width={1000}
      >
        <Select defaultValue="LIVE" style={{width: 120, marginBottom: 10}}
                onChange={value => this.handleTypeChange(value, null)}>
          <Option value="LIVE">直播</Option>
          <Option value="VOD">点播</Option>
          <Option value="ACTIVITY">活动</Option>
        </Select>
        <Search
          placeholder="直播/点播/活动/主题"
          style={{width: 200, display: 'inlineBlock', marginLeft: 16, verticalAlign: 'top'}}
          onSearch={value => this.handleTypeChange(null, value)}
        />
        <Table rowSelection={rowSelection}
               columns={columns}
               dataSource={list}
               rowKey='id'
               pagination={false}
        />
        <Pagination
          total={this.state.total}
          pageSize={this.state.limit}
          defaultCurrent={1}
          onChange={this.handleTableChange}
          style={{
            textAlign: 'right',
            marginTop: '16px'
          }}
        />
      </Modal>
    )
  }
}

export default connect()(VideoChoose)
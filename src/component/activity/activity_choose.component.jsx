import {Modal, Select, Table, Pagination, Input} from 'antd';
const Option = Select.Option;
const Search = Input.Search;
const {connect} = ReactRedux

import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

class ActivityChoose extends React.Component {
  state = {
    list: [],
    loading: false,
    limit: 6,
    total: 0,
    selectedRowKeys: [],
    selectedRows: [],
    videoListBoxvisible: false,
    name: '',
    activityStatusEnum: CONSTANTS.ON_SHELVE
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getList();
  }

  handleTableChange = (page, pageSize) => {
    this.getList(this.state.type, {
      limit: this.state.limit,
      page: page,
      name: this.state.name,
      activityStatusEnum: this.state.activityStatusEnum
    });
  }

  getList = (params) => {
    debugger
    params = {
      limit: this.state.limit,
      page: 1,
      activityStatusEnum: CONSTANTS.ON_SHELVE,
      ...params
    }
    this.setState({loading: true});
    Actions.getActivityList(params, this.props.dispatch).then((response) => {
      debugger
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
    this.setState({selectedRowKeys, selectedRows})
  }

  // 直播、点播筛选条件变化
  handleTypeChange = (activityStatusEnum, name) => {
    activityStatusEnum = activityStatusEnum == null ? this.state.activityStatusEnum : activityStatusEnum
    name = name == null ? this.state.name : name
    this.setState({
      activityStatusEnum,
      name
    })
    this.getList({activityStatusEnum: activityStatusEnum, name: name})
  }

  handleOk = (callBack, getList) => {
    let {dispatch} = this.props, {selectedRows} = this.state
    selectedRows[0] && getList({
      id: selectedRows[0].id
    })
    dispatch({
      type: 'FILTER_ACTIVITY',
      newActivity: selectedRows[0] ? selectedRows[0] : {}
    })
    callBack()
  }

  render() {
    debugger
    const {selectedRowKeys, list} = this.state;
    const {videoListBoxvisible, handleCancle, handleOk, getList} = this.props
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this)
    };
    const columns = [
      {
        title: "封面图",
        dataIndex: "coverImage",
        key: "coverImage",
        render: (url) => {
          return <img width="80px" src={url} alt=""/>
        }
      },
      {
        title: "活动主题",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "简介",
        dataIndex: "simpleDescription",
        key: "simpleDescription",
        render: (text, record) => {
          return text ? text : record.description
        }
      }
    ]
    return (
      <Modal title="选择活动" visible={videoListBoxvisible}
             onOk={this.handleOk.bind(this, handleOk, getList)} onCancel={handleCancle}
             width={1000}
      >
        <Select defaultValue={CONSTANTS.ON_SHELVE} style={{width: 120, marginBottom: 10}} onChange={value => this.handleTypeChange(value, null)}>
          <Option value={CONSTANTS.ON_SHELVE}>上架</Option>
          <Option value={CONSTANTS.OFF_SHELVE}>下架</Option>
        </Select>
        <Search
          placeholder="活动主题"
          style={{width: 200, display: 'inlineBlock', verticalAlign: 'top', marginLeft: 16 }}
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


export default connect()(ActivityChoose)
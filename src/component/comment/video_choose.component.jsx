import {Modal, Select, Table, Pagination, Input } from 'antd';
const Option = Select.Option;
const Search = Input.Search;
const {connect} = ReactRedux

import * as Actions from './action'
import * as CONSTANTS from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

class VideoChoose extends React.Component {
  state = {
    list: [],
    loading: false,
    limit: 6,
    total: 0,
    selectedRowKeys: [],
    selectedRows: [],
    videoListBoxvisible: false,
    type: 'LIVE',
    title: ''
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getList('VOD')
    // if(this.props.chooseType == 'comment') {
    //   this.getList('VOD')
    // } else {
    //   this.getList('LIVE');
    // }

  }

  handleTableChange = (page, pageSize) => {
    this.getList(this.state.type, {
      limit: this.state.limit,
      page: page,
      title: this.state.title
    });
  }

  // 直播、点播筛选条件变化
  handleTypeChange = (type, title) => {
    type = type == null ? this.state.type : type
    title = title == null ? this.state.title : title.trim()
    this.setState({
      type,
      title
    })
    this.getList(type, {title: title, description: title})
  }

  getList = (type, params) => {
    params = {
      limit: this.state.limit,
      page: 1,
      liveStatusEnum: CONSTANTS.ON_SHELVE,
      vodStatusEnum: CONSTANTS.ON_SHELVE,
      status: CONSTANTS.AUDITED,
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
    this.setState({selectedRowKeys, selectedRows})
  }

  handleOk = (callBack,getList) => {
    let {dispatch} = this.props, {selectedRows} = this.state
    selectedRows.map(record => {
      record.type = this.state.type
      return record
    })
    selectedRows[0] && getList({
      type: selectedRows[0].type,
      videoId: selectedRows[0].id
    })
    dispatch({
      type: 'FILTER_VIDEO',
      newVideo: selectedRows[0] ? selectedRows[0] : {}
    })
    callBack()

  }

  render() {
    const {selectedRowKeys, list,type} = this.state;
    const {videoListBoxvisible, handleCancle, handleOk,getList, chooseType} = this.props
    console.log(chooseType)
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this)
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
        key: "title"
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
    const columns_moment = [
      {
        title: "封面图",
        dataIndex: "coverImage",
        key: "coverImage",
        render: (url) => {
          return <img width="80px" src={url} alt=""/>
        }
      },
      {
        title: "上传人",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "上传内容",
        dataIndex: "description",
        key: "description",
        // render: (type, record) => {
        //   return type == 'IMAGE' ? '图片' : '视频'
        // }
      }
    ]
    return (
      <Modal title="选择视频" visible={videoListBoxvisible}
             onOk={this.handleOk.bind(this,handleOk,getList)} onCancel={handleCancle}
             width={1000}
      >
        <Select defaultValue='VOD' style={{width: 120, marginBottom: 10}} onChange={value => this.handleTypeChange(value, null)}>
          <Option value="VOD">点播</Option>
          <Option value="MOMENTS">短视频</Option>
        </Select>
        {/*{*/}
          {/*chooseType == 'report' ?  <Select defaultValue='LIVE' style={{width: 120, marginBottom: 10}} onChange={value => this.handleTypeChange(value, null)}>*/}
            {/*<Option value="LIVE">直播</Option>*/}
            {/*<Option value="VOD">点播</Option>*/}
            {/*<Option value="MOMENTS">短视频</Option>*/}
          {/*</Select> :  <Select defaultValue='VOD' style={{width: 120, marginBottom: 10}} onChange={value => this.handleTypeChange(value, null)}>*/}
            {/*<Option value="VOD">点播</Option>*/}
            {/*<Option value="MOMENTS">短视频</Option>*/}
          {/*</Select>*/}
        {/*}*/}
          <Search
            placeholder="点播/短视频主题"
            style={{ width: 200, display: 'inlineBlock', marginLeft: 16 ,verticalAlign: 'top'}}
            onSearch={value => this.handleTypeChange(null,value)}
          />
        <Table rowSelection={rowSelection}
               columns={ type == 'MOMENTS' ? columns_moment : columns}
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
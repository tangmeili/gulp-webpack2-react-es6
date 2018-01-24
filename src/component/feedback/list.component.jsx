/**
 * Created by Administrator on 2017/8/10.
 */
import {Link} from 'react-router-dom';
import {Select, Button, Input, Popconfirm, Form, Row, Col, Table} from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;


import * as Actions from './action'
import {USER_STATUS, USER_TYPE} from '../../common/utils/constants'
import Utils from '../../common/utils/utils'

class List extends React.Component {
  state = {
    list: [],
    pagination: {},
    loading: false,
    toAuditLoading: false,
    limit: 10,
    fileters: {}
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getList();
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        fileters: values
      })
      this.getList({...values})
    });
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
      ...this.state.fileters
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    Actions.getFeedbackList({...params}).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.current = result.data.page;
      pagination.total = result.data.totalCount;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        loading: false,
        pagination,
        list: result.data.rows
      });
    });
  }

  // 启用
  handleEnable = (id, index) => {
    Actions.enableUser(id).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('启用成功')
        let list = this.state.list
        list[index].status = 'ENABLED'
        this.setState({list})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  render() {
    let {match} = this.props
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    };
    const colLayout = {
      xs: {span: 24},
      sm: {span: 6},
    };
    const columns = [
      {
        title: "用户名",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "反馈内容",
        dataIndex: "content",
        key: "content",
        render: (content) => {
          return content.substring(0, 30)
        }
      },
      {
        title: "反馈时间",
        dataIndex: "createTime",
        key: "createTime",
        render: (time) => {
          return Utils.formatDate(time, 'YYYY-MM-DD hh:ii')
        }
      },
      {
        title: "是否回复",
        dataIndex: "replyContent",
        key: "replyContent",
        render: (replyContent) => {
          return replyContent ? '是' : '否'
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id ",
        render: (id, record) => {
          let url = `${match.url}/edit/${id}`
          return (
            <div>
              {record.replyContent ? <Link to={url}><Button icon="eye-o">查看详情</Button></Link> :
                <Link to={url}><Button icon="edit">回复</Button></Link>
              }
            </div>
          )
        }
      }
    ]
    return (
      <div>
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.handleSearch}
        >
          <Row gutter={40}>
            <Col {...colLayout} key='3'>
              <FormItem {...formItemLayout} label='是否回复'>
                {getFieldDecorator('isReply', {
                  initialValue: ' '
                })(
                  <Select style={{width: 120}}>
                    <Option value=" ">全部</Option>
                    <Option value='true'>是</Option>
                    <Option value='false'>否</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col {...colLayout} className='searchBtn'>
              <Button type="primary" htmlType="submit">查询</Button>
            </Col>
          </Row>
        </Form>
        <Table columns={columns}
               rowKey='id'
               dataSource={this.state.list}
               pagination={this.state.pagination}
               loading={this.state.loading}
               onChange={this.handleTableChange}
        />
      </div>
    )
  }
}

const LiveList = Form.create()(List)
export default LiveList



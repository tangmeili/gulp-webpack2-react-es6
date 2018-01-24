/**
 * Created by Administrator on 2017/8/10.
 */
import {Link} from 'react-router-dom';
import {Button, Input, Popconfirm, Form, Row, Col, Table, Breadcrumb, Icon} from 'antd';
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
    Actions.getSilentUserList({...params}).then((result) => {
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

  handleCancleForbid = (id, index) => {
    Actions.cancleForbid(id).then(response => {
      if (response.errorCode == 0) {
        Utils.dialog.success('解除成功')
        let list = this.state.list
        list.splice(index, 1)
        // list[index].status = 'ENABLED'
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
        title: "工卡号",
        dataIndex: "cardNumber",
        key: "cardNumber"
      },
      {
        title: "手机号",
        dataIndex: "loginPhone",
        key: "loginPhone"
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        render: (text) => {
          return USER_TYPE[text]
        }
      },
      {
        title: "所属市场",
        dataIndex: "marketName",
        key: "marketName"
      },
      {
        title: "职级",
        dataIndex: "rankName",
        key: "rankName"
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status ",
        render: (text) => {
          return USER_STATUS[text]
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id ",
        render: (id, record, index) => {
          let url = `${match.url}/edit/${id}`
          return (
            <div>
              {record.isSilent && <Popconfirm placement="left" title={'确定对该用户取消禁言？'} onConfirm={() => this.handleCancleForbid(id, index)}
                                              okText="确定" cancelText="取消">
                <Button icon='delete'>取消禁言</Button>
              </Popconfirm>}
              <Link to={url}><Button icon="eye-o">查看详情</Button></Link>
            </div>
          )
        }
      }
    ]
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Icon type="user"/>
            <span>禁言用户列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={40}>
              <Col {...colLayout} key='1'>
                <FormItem {...formItemLayout} label='用户名'>
                  {getFieldDecorator('userName')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col {...colLayout} key='2'>
                <FormItem {...formItemLayout} label='工卡号'>
                  {getFieldDecorator('cardNumber')(
                    <Input />
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
      </div>
    )
  }

}

const ForbidList = Form.create()(List)
export default ForbidList



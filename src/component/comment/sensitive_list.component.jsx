import {Button, Input, Popconfirm, Form, Row, Col, Table, Alert, Modal, Icon, Breadcrumb} from 'antd';
const FormItem = Form.Item;

import Utils from '../../common/utils/utils'
import * as Actions from './action'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      limit: 10,
      pagination: {},
      word: '',
      text: '',
      loading: false,
      BoxVisible: false,
      editBoxVisible: false,
      tips: '',
      id: '',
    }
  }

  componentDidMount() {
    this.getList()
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        word: values.word
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
      word: this.state.word
    });
  }
  getList = (params) => {
    params = {limit: 10, page: 1, ...params}
    this.setState({loading: true});
    Actions.getSensitiveList(params).then((result) => {
      const pagination = {...this.state.pagination};
      pagination.total = result.data.totalCount;
      pagination.current = result.data.page;
      pagination.showTotal = (total) => {return `总共 ${total} 条`}
      this.setState({
        list: result.data.rows,
        loading: false,
        pagination,
      })
    });
  }
  addButtonClick = () => {
    this.setState({
      text: '',
      BoxVisible: true
    })
  }

  settingButtonClick = () => {
    Actions.getTips().then((result) => {
      let data = result.data.rows
      this.setState({
        id: data[0].id,
        tips: data[0].tips,
        editBoxVisible: true
      })
    });
  }

  // 收集敏感词
  collectText = (e) => {
    this.setState({
      text: e.target.value
    })
  }

  handleCancel = () => {
    this.setState({
      BoxVisible: false,
      editBoxVisible: false
    })
  }

  handleOk = () => {
    let _this = this
    if (this.state.text == '') {
      Utils.dialog.error('请填写敏感词')
      return
    }
    Actions.addSensitives({
      text: this.state.text
    }).then(response => {
      _this.setState({
        BoxVisible: false
      })
      if (response.errorCode == 0) {
        Utils.dialog.success('添加成功')
        let list = [...response.data, ..._this.state.list]
        _this.setState({list})
      }
    })
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Actions.updateTips({
          id: this.state.id,
          tips: values.tips
        }).then(response => {
          this.setState({editBoxVisible: false})
          if (response.errorCode == 0) {
            Utils.dialog.success('修改成功')
          } else {
            Utils.dialog.error(response.msg)
          }
        })
      }
    });
  }

  onDelete = (id, index) => {
    Actions.deleteSensitive(id).then(response => {
      if (response.errorCode == 0) {
        let list = this.state.list
        list.splice(index, 1)
        this.setState({list})
      }
    })
  }

  render() {
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    };
    const colLayout = {
      xs: {span: 24},
      sm: {span: 8},
    };
    const {getFieldDecorator} = this.props.form;
    const columns = [
      {
        title: "敏感词",
        dataIndex: "word",
        key: "word"
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        render: (time) => {
          return Utils.formatDate(time, 'YYYY-MM-DD')
        }
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "id",
        render: (id, record, index) => {
          return (<Popconfirm placement="left" title={'确定删除该敏感词？'} onConfirm={() => this.onDelete(id, index)}
                              okText="确定" cancelText="取消">
            <Button icon='delete'>删除</Button>
          </Popconfirm>)
        }
      },
    ]
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Icon type="user"/>
            <span>敏感词列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <div>
            <Form
              className="ant-advanced-search-form"
              onSubmit={this.handleSearch}
            >
              <Row gutter={40}>
                <Col {...colLayout} key='2'>
                  <FormItem {...formItemLayout} label='敏感词'>
                    {getFieldDecorator('word', {
                      initialValue: ' '
                    })(
                      <Input/>
                    )}
                  </FormItem>
                </Col>
                <Col {...colLayout} >
                  <Button type="primary" className='searchBtn' htmlType="submit">查询</Button>
                </Col>
              </Row>
            </Form>
            <Button type="primary" style={{margin: "0px 8px 12px 0"}}
                    onClick={this.addButtonClick.bind(this)}>新增敏感词</Button>
            <Button type="primary" icon="setting" onClick={this.settingButtonClick.bind(this)}
                    style={{marginRight: '8px', marginBottom: '12px'}}>设置</Button>
            <Table columns={columns}
                   rowKey='id'
                   dataSource={this.state.list}
                   pagination={this.state.pagination}
                   loading={this.state.loading}
                   onChange={this.handleTableChange}
            />
            <Modal title="添加敏感词"
                   visible={this.state.BoxVisible}
                   wrapClassName="vertical-center-modal"
                   okText="确定"
                   cancelText="取消"
                   onOk={this.handleOk.bind(this)}
                   onCancel={this.handleCancel.bind(this)}
                   width={500}
            >
              <Alert message="提示：如果添加多个敏感词，请以逗号或者换行来隔开" type="warning" style={{marginBottom: '16px'}}/>
              <Input type="textarea" autosize={{minRows: 10, maxRows: 10}} onChange={this.collectText.bind(this)}
                     value={this.state.text}/>
            </Modal>
            <Modal title="设置敏感词提示语"
                   visible={this.state.editBoxVisible}
                   wrapClassName="vertical-center-modal"
                   okText="修改"
                   cancelText="取消"
                   onOk={this.handleSubmit.bind(this)}
                   onCancel={this.handleCancel.bind(this)}
                   width={500}
            >
              <Form layout="vertical">
                <FormItem label='敏感词提示语'>
                  {getFieldDecorator('tips', {
                    rules: [{
                      required: true, message: '提示语不能为空!',
                      max: 10, message: '不能超过10个字!'
                    }],
                    initialValue: this.state.tips
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Form>
            </Modal>
          </div>
        </div>
      </div>
    )
  }
}

const SensitiveList = Form.create()(App)
export default SensitiveList
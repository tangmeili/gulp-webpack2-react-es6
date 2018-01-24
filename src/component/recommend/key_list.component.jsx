import {Button, Form, Table, Icon, Breadcrumb, Popconfirm, InputNumber, Modal, Input} from 'antd';
const FormItem = Form.Item;

import Utils from '../../common/utils/utils'
import * as Actions from './action'

class KeyList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      limit: 10,
      pagination: {},
      loading: false,
      id: '',
      tips: '',
      editBoxVisible: false,
      addBoxVisible: false,
      sortBoxVisible: false,
      sort: 1
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
    this.setState({addBoxVisible: true})
  }

  handleCancel = () => {
    this.setState({
      addBoxVisible: false,
      editBoxVisible: false,
      sortBoxVisible: false
    })
  }

  handleAddSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err || (err && !err.word)) {
        Actions.addKey(values).then(response => {
          this.setState({
            addBoxVisible: false
          })
          if (response.errorCode == 0) {
            Utils.dialog.success('添加成功')
            this.getList()
          } else {
            Utils.dialog.error(response.msg)
          }
        })
      }
    });
  }

  settingButtonClick = () => {
    Actions.getTips().then((result) => {
      let data = result.data.rows
      this.setState({
        id: data[1].id,
        tips: Number(data[1].tips),
        editBoxVisible: true
      })
    });
  }

  handleEditBtnClick = (id, record) => {
    this.setState({
      sortBoxVisible : true,
      id: id,
      sort: record.sort
    })
  }

  handleEditSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err || (err && !err.tips)) {
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

  handleEditSortSubmit = ()=> {
    let _this = this
    this.props.form.validateFields((err, values) => {
      if (!err || (err && !err.sorts)) {
        Actions.updateKey({
          id: this.state.id,
          sort: values.sorts
        }).then(response => {
          this.setState({sortBoxVisible: false})
          if (response.errorCode == 0) {
            Utils.dialog.success('修改成功')
            let list =_this.state.list.map(record => {
              if(record.id == _this.state.id) {
                record.sort =  values.sorts
              }
              return record
            })
            _this.setState({list})
          } else {
            Utils.dialog.error(response.msg)
          }
        })
      }
    });
  }


  handleDelete = (id, index) => {
    Actions.deleteKey(id).then(response => {
        if (response.errorCode == 0) {
          Utils.dialog.success('删除成功')
          let list = this.state.list
          list.splice(index, 1)
          this.setState({list})
        } else {
          Utils.dialog.error(response.msg)
        }
      }
    )
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const columns = [
      {
        title: "序号",
        dataIndex: "sort",
        key: "sort",
      },
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
        title: "操作",
        dataIndex: "id",
        key: "id",
        render: (id, record, index) => {
          return (<div>
            {record.isDisplay && <div>
              <Button icon='edit' onClick={this.handleEditBtnClick.bind(this, id, record)}>更改排序</Button>
              <Popconfirm placement="left" title={'确定删除该关键词？'}
              onConfirm={this.handleDelete.bind(this, id, index)}
              okText="确定" cancelText="取消">
              <Button icon='delete'>删除</Button>
              </Popconfirm>
            </div>}

          </div>)
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
          <Button type="primary" style={{marginRight: '8px', marginBottom: '12px'}}
                  onClick={this.handleAddBtnClick.bind(this)}>添加搜索关键词</Button>
          <Button type="primary" icon="setting" onClick={this.settingButtonClick.bind(this)}
                  style={{marginRight: '8px', marginBottom: '12px'}}>设置</Button>
          <Table columns={columns}
                 rowKey='id'
                 dataSource={this.state.list}
                 loading={this.state.loading}
                 pagination={{pageSize: 1000}}
          />
          <Modal title="添加搜索关键词"
                 visible={this.state.addBoxVisible}
                 wrapClassName="vertical-center-modal"
                 okText="确定"
                 cancelText="取消"
                 onOk={this.handleAddSubmit.bind(this)}
                 onCancel={this.handleCancel.bind(this)}
                 width={500}
          >
            <Form layout="vertical">
              <FormItem label='关键词'>
                {getFieldDecorator('word', {
                  rules: [{
                    required: true, message: '关键词不能为空!',
                  }],
                })(
                  <Input/>
                )}
              </FormItem>
              <FormItem label='序号'>
                {getFieldDecorator('sort', {
                  rules: [{
                    type: 'number', message: '必须为数字',
                  }],
                })(
                  <InputNumber size="large"/>
                )}
              </FormItem>
            </Form>
          </Modal>
          <Modal title="设置关键字搜索显示个数"
                 visible={this.state.editBoxVisible}
                 wrapClassName="vertical-center-modal"
                 okText="修改"
                 cancelText="取消"
                 onOk={this.handleEditSubmit.bind(this)}
                 onCancel={this.handleCancel.bind(this)}
                 width={500}
          >
            <Form layout="vertical">
              <FormItem label='关键字搜索显示个数'>
                {getFieldDecorator('tips', {
                  rules: [
                    {
                      type: 'number', message: '必须为数字',
                    }
                  ],
                  initialValue: this.state.tips
                })(
                  <InputNumber size="large" min={1}/>
                )}
              </FormItem>
            </Form>
          </Modal>
          <Modal title="更改排序"
                 visible={this.state.sortBoxVisible}
                 wrapClassName="vertical-center-modal"
                 okText="修改"
                 cancelText="取消"
                 onOk={this.handleEditSortSubmit.bind(this)}
                 onCancel={this.handleCancel.bind(this)}
                 width={500}
          >
            <Form layout="vertical">
              <FormItem label='序列号'>
                {getFieldDecorator('sorts', {
                  rules: [
                    {
                      type: 'number', message: '必须为数字',
                    }
                  ],
                  initialValue: this.state.sort
                })(
                  <InputNumber size="large" min={1}/>
                )}
              </FormItem>
            </Form>
          </Modal>
        </div>
      </div>
    )
  }
}

export default Form.create()(KeyList)
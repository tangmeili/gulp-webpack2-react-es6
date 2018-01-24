const {connect} = ReactRedux
import {Link} from 'react-router-dom';
import {Form, Input, Icon, Breadcrumb, Button, Table} from 'antd';
const FormItem = Form.Item;

import * as Actions from './action'
import Utils from '../../common/utils/utils'
import * as CONSTANTS from '../../common/utils/constants'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list1: [],
      list2: [],
      pagination1: {},
      pagination2: {},
      loading1: false,
      loading2: false,
      detail: {},
      confirmDirty: false,
      buttonLoading: false,
      btnLoading: false
    }
  }

  componentDidMount() {
    let _this = this, {match} = this.props, id = match.params.id
    if (id !== undefined) {
      this.setState({
        is_not_add: true
      })
      Actions.getUser(id).then(response => {
        if (response.errorCode === 0) {
          _this.setState({
            detail: response.data,
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      })
      _this.getList2({
        id: id
      })
    }
  }

  handleTableChange2 = (pagination) => {
    const pager2 = {...this.state.pagination2};
    pager2.current = pagination.current;
    this.setState({
      pagination2: pager,
    });
    this.getList1({
      limit: this.state.limit ? this.state.limit : 10,
      page: pagination.current,
      id: this.state.detail.id
    });
  }
  getList2 = (params) => {
    params = {limit: 10, page: 1, type: 'NOT_PASS', ...params}
    this.setState({loading2: true});
    Actions.getSilentUserCommentList(params).then((result) => {
      const pagination2 = {...this.state.pagination2};
      pagination2.current = result.data.page;
      pagination2.total = result.data.totalCount;
      this.setState({
        list2: result.data.rows,
        loading2: false,
        pagination2,
      })
    });
  }

  handleCancleForbid = (id) => {
    this.setState({
      btnLoading: true
    })
    Actions.cancleForbid(id).then(response => {
      this.setState({
        btnLoading: false
      })
      if (response.errorCode == 0) {
        Utils.dialog.success('解除成功')
        this.setState({detail: response.data})
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  render() {
    const {detail} = this.state
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 6},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };
    const columns2 = [
      {
        title: "评论内容",
        dataIndex: "content",
        key: "content",
        width: '',
        render: (text) => {
          return text ? text.substring(0, 20) : text
        }
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          return CONSTANTS.AUDIT_STATUS_TO_CN[status]
        }
      },
      {
        title: "被举报次数",
        dataIndex: "tipOffCount",
        key: "tipOffCount"
      },
      {
        title: "评论时间",
        dataIndex: "createTime",
        key: "createTime",
        render: (time) => {
          return Utils.formatDate(time, 'YYYY-MM-DD hh:ii')
        }
      },
    ]
    return (
      <div id="wrap">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Link to='/comment/forbid/list'>
              <Icon type="user"/>
              <span>禁言用户列表</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>禁言用户详情</Breadcrumb.Item>
        </Breadcrumb>
        <div className="content">
          <Form>
            <FormItem
              {...formItemLayout}
              label="昵称"
            >
              <Input value={detail.userName} disabled style={{width: 160}}/>
              <label className="label">性别:</label>
              <Input value={CONSTANTS.SEX[detail.gender]} disabled style={{width: 160}}/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="身份"
            >
              <Input value={CONSTANTS.USER_TYPE[detail.type]} disabled style={{width: 160}}/>
              <label className="label">特别关注:</label>
              <Input value={detail.specialAttention ? '是' : '否'} disabled style={{width: 160}}/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="职级"
            >
              <Input value={detail.rankName} disabled style={{width: 160}}/>
              <label className="label" htmlFor="">所属市场:</label>
              <Input value={detail.marketName} disabled style={{width: 160}}/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="状态"
            >
              <Input value={CONSTANTS.USER_STATUS[detail.status]} disabled style={{width: 160}}/>
              <label className="label">是否禁言:</label>
              <Input value={detail.isSilent ? '是' : '否'} disabled style={{width: 160}}/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="卡号"
            >
              <Input value={detail.cardNumber} disabled style={{width: 160}}/>
              <label className="label">手机号码:</label>
              <Input value={detail.loginPhone} disabled style={{width: 160}}/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="个性签名"
            >
              <Input value={detail.signature} disabled/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="头像"
              hasFeedback
            >
              <img src={detail.headerImg} alt="" className="avatar"/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="审核未通过记录"
            >
              <Table columns={columns2}
                     rowKey='id'
                     expandedRowRender={record => {
                       return (<p><span style={{color: '#108ee9', fontSize: 15}}>评论内容：</span>{record.content}</p>)
                     }}
                     dataSource={this.state.list2}
                     pagination={this.state.pagination2}
                     loading={this.state.loading2}
                     onChange={this.handleTableChange2}
              />
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              {detail.isSilent &&
              <Button type="primary"
                      loading={this.state.btnLoading}
                      onClick={this.handleCancleForbid.bind(this, detail.id)}>取消禁言</Button>
              }
            </FormItem>
          </Form>
        </div>
      </div>

    );
  }
}

const DetailForm = connect()(Form.create()(Detail))
export default DetailForm
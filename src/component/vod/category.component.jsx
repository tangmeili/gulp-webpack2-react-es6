import {Tree, Input, Icon, Button, Modal, Popconfirm, Form, TreeSelect, Tooltip} from 'antd';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
const FormItem = Form.Item;

import * as Actions from './action'
import Utils from '../../common/utils/utils'

class VodCategory extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      treeData: [],
      title: '',
      data: [],
      EditBoxVisible: false,
      selectedId: '',
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
    }
  }

  componentDidMount() {
    Actions.getVodCate({
      type: 'VOD'
    }).then(response => {
      if (response.errorCode == 0) {
        let expandedKeys = []
        response.data.map(record => {
          expandedKeys.push(record.id.toString())
        })
        let data = response.data.map(record => {
            record.label = record.name
            record.value = record.id.toString()
            return record
          })
        this.setState({
          treeData: this.trasformData(data),
          expandedKeys
        })
      }
    })
  }

  trasformData = (data) => {
    let newArray = []
    data.map((item, index) => {
      if (!item.pid) {
        item.children = []
        item.key = item.id.toString()
        newArray.push(item)
        data.map((record, index) => {
          if (item.id != record.id && item.id == record.pid) {
            record.key = record.id.toString()
            record.mark = true
            item.children.push(record)
          }
        })
      } else if (!item.mark) {
        newArray.push(item)
      }
    })
    return newArray
  }

  handleDelete = (id) => {
    Actions.deleteVodCate(id).then(response => {
      if (response.errorCode == 0) {
        let newTreeData = this.state.treeData.filter((item) => {
          if (item.children && item.children.length) {
            item.children = item.children.filter((child) => {
              return child.id != id
            })
          }
          return item.id != id
        })
        let data = this.state.data.filter((item) => {
          return item.id != id && !item.pid
        })
        this.setState({
          data,
          treeData: newTreeData
        })
      }
    })
  }

  handleEdit = (node) => {
    this.setState({
      EditBoxVisible: true,
      selectedId: node.props.eventKey,
      title: node.refs.selectHandle.innerText
    })
  }

  handleTitleChange = (e) => {
    this.setState({
      title: e.target.value
    })
  }

  handleEditTitle = (id) => {
    Actions.editVodCate(this.state.selectedId, {
      name: this.state.title
    }).then(response => {
      this.setState({
        EditBoxVisible: false
      })
      if (response.errorCode == 0) {
        let newTreeData = this.state.treeData, data = response.data, datas  = this.state.data
        newTreeData.map((item) => {
          if (!data.pid && item.id == data.id) {
            item.label = data.name
            item.name = data.name
          } else if (data.pid && data.pid == item.id) {
            item.children.map((child) => {
              if (child.id == data.id) {
                child.label = data.name
                child.name = data.name
              }
            })
          }
          return item
        })
        datas.map((item) => {
          if (!item.pid && item.id == data.id) {
            item.label = data.name
            item.name = data.name
          }
          return item
        })
        this.setState({
          treeData: newTreeData,
          data: datas
        })
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }

  handleCancel = ()=> {
    this.setState({
      EditBoxVisible: false,
      addBoxVisible: false
    })
  }

  onMouseEnter = (info) => {
    if (this.cmContainer) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      let el = info.event.target, oldSpan = document.getElementById('newSpan')
      if (el.contains && el.contains(oldSpan)) {
        el.removeChild(oldSpan)
      }
    }
    this.cmContainer = document.createElement('span');
    this.cmContainer.id = 'newSpan'
    this.insertAfter(this.cmContainer, info.event.target)
    this.toolTip = (
      <span className="operator-wrap">
        <Icon type="edit" title='编辑' className="operate-icon" onClick={this.handleEdit.bind(this, info.node)}/>
         <Popconfirm title="确定删除该分类?" onConfirm={this.handleDelete.bind(this, info.node.props.eventKey)} okText="确定"
                     cancelText="取消">
           <Icon type="delete" title="删除" className="operate-icon"/>
         </Popconfirm>

      </span>
    );
    ReactDOM.render(this.toolTip, this.cmContainer);
  }

  // newElement是要追加的元素 targetElement 是指定元素的位置
  insertAfter = (newElement, targetElement) => {
    let parent = targetElement
    // 如果目标元素是<span class='ant-tree-title'>title</span>的话就加到该元素的父元素
    if (targetElement.getAttribute("class") == 'ant-tree-title') {
      parent = targetElement.parentNode
    }
    parent.appendChild(newElement, targetElement);
  };

  // 搜索
  onSearch = (value) => {
    const gData = this.state.treeData
    const expandedKeys = []
     this.state.treeData.map((item) => {
      if (item.name.indexOf(value) > -1) {
        expandedKeys.push(item.key)
        //return this.getParentKey(item.key, gData);
      }
       if(item.children && item.children.length) {
         item.children.map((record) => {
           if(record.name.indexOf(value) >-1) {
             expandedKeys.push(record.key)
           }
         })
       }
      //return null;
    })
       //.filter((item, i, self) => item && self.indexOf(item) == i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key == key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  // 点击添加分类
  handleAddButtonClick = () => {
    Actions.getVodCate({
      type: 'VOD'
    }).then(response => {
      if (response.errorCode == 0) {
        let data = response.data.map(record => {
          record.label = record.name
          record.id = record.id.toString()
          record.pid = record.pid.toString()
          record.value = record.id
          return record
        }).filter(record => {
          return record.pid == 0
        })
        this.setState({
          data,
          addBoxVisible: true
        })
      }
    })

  }

  saveFormRef = (form) => {
    this.form = form;
  }

  // 提交添加的分类
  handleCreate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      if(values.pid) {
        values.pid = Math.floor(values.pid)
      } else {
        delete values.pid
      }
      values.type = 'VOD'
      Actions.addVodCate(values).then(response => {
        if(response.errorCode == 0) {
          Actions.getVodCate({
            type: 'VOD'
          }).then(response => {
            if (response.errorCode == 0) {
              let expandedKeys = []
              response.data.map(record => {
                expandedKeys.push(record.id.toString())
              })
              let data = response.data.map(record => {
                record.label = record.name
                record.value = record.id.toString()
                return record
              })
              this.setState({
                treeData: this.trasformData(data),
                expandedKeys
              })
            }
          })
        } else {
          Utils.dialog.error(response.msg)
        }
      })
      form.resetFields();
      this.setState({ addBoxVisible: false });
    });
  }

  // 拖动排序
  onDrop = (info) => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    Actions.swapCate({
      moveId: dragKey,
      targetId: dropKey
    }).then(response => {
      if(response.errorCode == 0) {
        // const dragNodesKeys = info.dragNodesKeys;
        const loop = (data, key, callback) => {
          data.forEach((item, index, arr) => {
            if (item.key === key) {
              return callback(item, index, arr);
            }
            if (item.children) {
              return loop(item.children, key, callback);
            }
          });
        };
        const data = [...this.state.treeData];
        let dragObj;
        if (info.dropToGap) {
          let ar;
          let i;
          let targetSort;
          loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
          });
          loop(data, dropKey, (item, index, arr) => {
            ar = arr;
            i = index;
            targetSort = item.sort
          });
          if(targetSort > dragObj.sort) {
            ar.splice(i+1, 0, dragObj);
          } else {
            ar.splice(i, 0, dragObj);
          }

        }
        this.setState({
          treeData: data,
        });
      } else {
        Utils.dialog.error(response.msg)
      }
    })
  }
  render() {
    debugger
    let {searchValue} = this.state
    const loop = (record) => record.map((item) => {
      const index = item.label.search(searchValue);
      const beforeStr = item.label.substr(0, index);
      const afterStr = item.label.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.label}</span>;
      if (item.children && item.children.length) {
        return <TreeNode key={item.key} title={title}>{loop(item.children)}</TreeNode>;
      }
      return <TreeNode key={item.key} title={title}/>;


      if (item.children && item.children.length) {
        return <TreeNode key={item.id} title={item.name}>{loop(item.children)}</TreeNode>;
      }
      return <TreeNode key={item.id} title={item.name}/>;
    })

    const CollectionCreateForm = Form.create()(
      (props) => {
        const { addBoxVisible, onCancel, onCreate, form, data } = props;
        const { getFieldDecorator } = form;
        return (
          <Modal
            visible={addBoxVisible}
            title="添加分类"
            okText="提交"
            cacleText="取消"
            onCancel={onCancel}
            onOk={onCreate}
          >
            <Form layout="vertical">
              <FormItem label="分类名称">
                {getFieldDecorator('name', {
                  rules: [{required: true, message: '请输入分类名称!'}],
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem label="分类">
                {getFieldDecorator('pid')(
                  <TreeSelect
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={this.state.data}
                    treeDataSimpleMode={false}
                    treeNodeFilterProp='label'
                    placeholder="请选择一种分类"
                    allowClear
                    showSearch
                  />
                )}
              </FormItem>
            </Form>
          </Modal>
        );
      }
    );

    return (
      <div id="wrap">
        <div className="content" style={{marginTop: '44px'}}>
          <Button type="primary" onClick={this.handleAddButtonClick.bind(this)}>添加分类</Button>
          <Tooltip title="同一级别下面的分类可进行拖动排序哦">
            <Icon type="question-circle-o" style={{marginLeft: '10px'}}/>
          </Tooltip>
          <Search style={{width: 300, marginLeft: '50px'}} placeholder="可输入分类名搜索" onSearch={this.onSearch.bind(this)}/>
          <Tree
            className="draggable-tree"
            defaultExpandAll = {true}
            onExpand={this.onExpand}
            expandedKeys={this.state.expandedKeys}
            autoExpandParent={this.state.autoExpandParent}
            draggable
            onDrop={this.onDrop}
            onMouseEnter={this.onMouseEnter}
          >
            {loop(this.state.treeData)}
          </Tree>
          <Modal title="修改分类名称" visible={this.state.EditBoxVisible}
                 onOk={this.handleEditTitle.bind(this)} onCancel={this.handleCancel.bind(this)}
          >
            <Input value={this.state.title} onChange={this.handleTitleChange.bind(this)}/>
          </Modal>
          <CollectionCreateForm
            ref={this.saveFormRef}
            addBoxVisible={this.state.addBoxVisible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
        </div>
      </div>
    )
  }
}

export default VodCategory
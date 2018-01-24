/**
 * Created by Administrator on 2017/8/28.
 */

const {combineReducers} = Redux
// 直播
function live(state = {
  list: [],
  detail: {},
  newRecord: {},
  recommend_list: []
}, action = null) {
  switch (action.type) {
    case  'LIVE_LIST':
      return Object.assign({}, state, {list: action.list})
      break;
    case 'LIVE_DETAIL':
      return Object.assign({}, state, {detail: action.detail})
    case 'ADD_LIVE':
      return Object.assign({}, state, {list: [action.newLive, ...state.list]})
      break;
    case 'DELETE_LIVE':
      let newArray = state.list.slice();
      newArray.splice(action.index, 1);
      return Object.assign({}, state, {list: newArray})
      break;
    case 'EDIT_LIVE':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newLive.id) {
            action.newLive.createUser = record.createUser
            action.newLive.auditUser = record.auditUser
            return action.newLive
          }
          return record
        })
      })
      break;
    case 'AUDIT_LIVE':
      if (action.id) {
        return Object.assign({}, state, {
          list: state.list.map((record) => {
            if (record.id == action.id) {
              record.status = action.newLive.status
            }
            return record
          })
        })
      } else {
        return Object.assign({}, state, {list: [{live: action.newLive}, ...state.list]})
      }
      break;
    case 'UPDATE_LIVE':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newLive.id) {
            action.newLive.createUser = record.createUser
            action.newLive.auditUser = record.auditUser
            return action.newLive
          }
          return record
        })
      })
      break;
    case  'LIVE_RECOMMEND_LIST':
      if (action.status && action.status != ' ') {
        return Object.assign({}, state, {
          recommend_list: action.list.filter((record) => {
            return record.status == action.status
          })
        })
      }
      return Object.assign({}, state, {recommend_list: action.list})
      break;
    case 'ADD_LIVE_RECOMMEND':
      return Object.assign({}, state, {recommend_list: [action.newCourse, ...state.recommend_list]})
      break;
    case 'DELETE_LIVE_RECOMMEND':
      let newArray1 = state.recommend_list.slice();
      newArray1.splice(action.index, 1);
      return Object.assign({}, state, {recommend_list: newArray1})
      break;
    case 'EDIT_LIVE_RECOMMEND':
      return Object.assign({}, state, {
        list: state.recommend_list.map((record) => {
          if (record.id == action.newCourse.id) {
            return action.newCourse
          }
          return record
        })
      })
      break;
    default :
      return state
  }
}
// 点播
function vod(state = {
  list: [],
  detail: {},
  newRecord: {},
  recommend_list: []
}, action = null) {
  switch (action.type) {
    case  'VOD_LIST':
      return Object.assign({}, state, {list: action.list})
      break;
    case 'ADD_VOD':
      return Object.assign({}, state, {list: [{vod: action.newVod}, ...state.list]})
      break;
    case 'DELETE_VOD':
      let newArray = state.list.slice();
      newArray.splice(action.index, 1);
      return Object.assign({}, state, {list: newArray})
      break;
    case 'EDIT_VOD':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newVod.id) {
            action.newVod.createUser = record.createUser
            action.newVod.auditUser = record.auditUser
            return action.newVod
          }
          return record
        })
      })
      break;
    case 'AUDIT_VOD':
      if (action.id) {
        return Object.assign({}, state, {
          list: state.list.map((record) => {
            if (record.id == action.id) {
              record.status = action.newVod.status
            }
            return record
          })
        })
      } else {
        return Object.assign({}, state, {list: [{vod: action.newVod}, ...state.list]})
      }
      break;
    case 'UPDATE_VOD':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newVod.id) {
            action.newVod.createUser = record.createUser
            action.newVod.auditUser = record.auditUser
            return action.newVod
          }
          return record
        })
      })
      break;
    case  'VOD_RECOMMEND_LIST':
      if (action.status && action.status != ' ') {
        return Object.assign({}, state, {
          recommend_list: action.list.filter((record) => {
            return record.status == action.status
          })
        })
      }
      return Object.assign({}, state, {recommend_list: action.list})
      break;
    case 'ADD_VOD_RECOMMEND':
      return Object.assign({}, state, {recommend_list: [action.newCourse, ...state.recommend_list]})
      break;
    case 'DELETE_VOD_RECOMMEND':
      let newArray1 = state.recommend_list.slice();
      newArray1.splice(action.index, 1);
      return Object.assign({}, state, {recommend_list: newArray1})
      break;
    case 'EDIT_VOD_RECOMMEND':
      return Object.assign({}, state, {
        list: state.recommend_list.map((record) => {
          if (record.id == action.newCourse.id) {
            return action.newCourse
          }
          return record
        })
      })
      break;
    default :
      return state
  }
}
// 活动
function activity(state = {
  list: [],
  material_list: [],
  detail: {},
  newActivity: {}
}, action = null) {
  switch (action.type) {
    case  'ACTIVITY_LIST':
      return Object.assign({}, state, {list: action.list})
      break;
    case 'ADD_ACTIVITY':
      return Object.assign({}, state, {list: [action.newActivity, ...state.list]})
      break;
    case 'DELETE_ACTIVITY':
      let newArray = state.list.slice();
      newArray.splice(action.index, 1);
      return Object.assign({}, state, {list: newArray})
      break;
    case 'EDIT_ACTIVITY':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newActivity.id) {
            action.newActivity.createUser = record.createUser
            action.newActivity.auditUser = record.auditUser
            return action.newActivity
          }
          return record
        })
      })
      break;
    case 'AUDIT_ACTIVITY':
      if (action.id) {
        return Object.assign({}, state, {
          list: state.list.map((record) => {
            if (record.id == action.id) {
              record.status = action.newActivity.status
            }
            return record
          })
        })
      } else {
        return Object.assign({}, state, {list: [action.newActivity, ...state.list]})
      }
      break;
    case 'UPDATE_ACTIVITY':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newActivity.id) {
            action.newActivity.createUser = record.createUser
            action.newActivity.auditUser = record.auditUser
            return action.newActivity
          }
          return record
        })
      })
    break
    case 'FILTER_ACTIVITY' :
      return Object.assign({}, state, {newActivity: action.newActivity})
      break;
    case 'MATERIAL_LIST' :
      return Object.assign({}, state, {material_list: action.list})
      break;
    case 'UPDATE_MATERIAL':
      return Object.assign({}, state, {
        material_list: state.material_list.map((record) => {
          if (record.id == action.newMaterial.id) {
            record.status = action.newMaterial.status
          }
          return record
        })
      })
    break
    default :
      return state
  }
}
// 管理员
function admin(state = {
  list: [],
  detail: {},
  newRecord: {}
}, action = null) {
  switch (action.type) {
    case  'ADMIN_LIST':
      return Object.assign({}, state, {list: action.list})
      break;
    case 'ADD_ADMIN':
      return Object.assign({}, state, {list: [action.newCourse, ...state.list]})
      break;
    case 'DELETE_ADMIN':
      let newArray = state.list.slice();
      newArray.splice(action.index, 1);
      return Object.assign({}, state, {list: newArray})
      break;
    case 'EDIT_ADMIN':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newCourse.id) {
            return action.newCourse
          }
          return record
        })
      })
      break;
    default :
      return state
  }
}

//短视频
function moment(state = {
  list: [],
  detail: {},
  newRecord: {}
}, action = null) {
  switch (action.type) {
    case  'MOMENT_LIST':
      return Object.assign({}, state, {list: action.list})
      break;
    case 'UPDATE_MOMENT' :
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newMoment.id) {
            return action.newMoment
          }
          return record
        })
      })
      break;
    case 'EDIT_MOMENT':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newMoment.id) {
            record.pvSham = action.newMoment.pvSham
            return record
          }
          return record
        })
      })
      break;
    default :
      return state
  }
}

// 评论
function comment(state = {
  newVideo: {}
}, action = null) {
  switch (action.type) {
    case  'FILTER_VIDEO':
      return Object.assign({}, state, {newVideo: action.newVideo})
      break;
    default :
      return state
  }
}

// 推荐列表
function recommend(state = {
  list: [],
  detail: {},
  newRecord: {},
  videoList: [],
  videoSetList: []
}, action = null) {
  switch (action.type) {
    case 'RECOMMEND_LIST' :
      return Object.assign({}, state, {list: action.list})
      break;
    case 'VIDEO_LIST' :
      return Object.assign({}, state, {videoList: action.videoList})
      break;
    case 'EDIT_RECOMMEND':
      return Object.assign({}, state, {
        list: state.list.map((record) => {
          if (record.id == action.newRecommend.id) {
            action.newRecommend.data = record.data
            return action.newRecommend
          }
          return record
        })
      })
      break;
    case 'ADD_RECOMMEND':
      return Object.assign({}, state, {list: [...action.newRecommend, ...state.list]})
      break;
    case 'DELETE_RECOMMEND':
      let newArray = state.list.slice();
      newArray.splice(action.index, 1);
      return Object.assign({}, state, {list: newArray})
      break;
    case 'SWAP_RECOMMEND':
      return Object.assign({}, state, {list: action.arrayMove(state.list, action.oldIndex, action.newIndex)})
      break;
    case 'DELETE_RECOMMEND_VIDEO':
      let newArray1 = state.videoList.slice();
      newArray1.splice(action.index, 1);
      return Object.assign({}, state, {videoList: newArray1})
      break;
    case 'ADD_RECOMMEND_VIDEO':
      return Object.assign({}, state, {videoList: [...state.videoList, ...action.newVideos]})
      break;
    case 'SWAP_RECOMMEND_VIDEO' :
      return Object.assign({}, state, {videoList: action.newVideos})
      break;
    default :
      return state
  }
}

const reducer = combineReducers({
  live,
  vod,
  recommend,
  activity,
  admin,
  moment,
  comment
})
export default reducer
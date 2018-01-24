import AppService from '../../common/utils/app.service'

export const uploadImgUrl = AppService.uploadImgUrl

export function getRecommendList(dispatch) {
  return AppService.getRequest('admin/recommends/getRecommend').then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'RECOMMEND_LIST',
        list: response.data,
      })
    }
    return response
  })
}

export function getRecommend(id, dispatch) {
  return AppService.getRequest(`admin/recommends/${id}`)
}

export function editRecommend(id, params, dispatch) {
  debugger
  return AppService.putRequest(`admin/recommends/${id}`, {...params}).then(response => {
    if(response.errorCode == 0) {
      dispatch({
        type: 'EDIT_RECOMMEND',
        newRecommend: response.data
      })
    }
    return response
  })
}

export function addRecommend(params, dispatch) {
  return AppService.postRequest('admin/recommends', {...params}).then(response => {
    if(response.errorCode == 0){
      dispatch({
        type: 'ADD_RECOMMEND',
        newRecommend: response.data
      })
    }
    return response
  })
}

export function deleteRecommend(id, index, dispatch) {
  return AppService.deleteRequest(`admin/recommends/${id}`).then(response => {
    if(response.errorCode == 0) {
      dispatch({
        type: 'DELETE_RECOMMEND',
        index: index
      })
    }
    return response
  })
}

export function swapRecommend(dispatch, params, oldIndex, newIndex, arrayMove) {
  debugger
  return AppService.putRequest('admin/recommends/swap', params).then(response => {
    if(response.errorCode == 0) {
      dispatch({
        type: 'SWAP_RECOMMEND',
        oldIndex,
        newIndex,
        arrayMove
      })
    }
    return response
  })
}
// 获取点播、直播视频列表
export function getVideoList(type, params) {
  let url = ''
  if (type == 'LIVE') {
    url = 'admin/lives'
  } else if (type == 'VOD') {
    url = 'admin/vods'
  } else if (type == 'ACTIVITY') {
    url = 'admin/activitys'
  }
  return AppService.getRequest(url, {...params})
}
// 获取视频集列表
export function getVideoSetList(params) {
  return AppService.getRequest('admin/videolists', {...params})
}

// 获取视频集详情
export function getVideoSet(id) {
  return AppService.getRequest(`admin/videolists/${id}`)
}

//  添加视频集
export function addVideoSet(params) {
  return AppService.postRequest('admin/videolists', {...params})
}

// 编辑视频集
export function editVideoSet(params) {
  return AppService.putRequest(`admin/videolists/${params.id}`, {...params})
}

export function deleteVideoSet(id) {
  return AppService.deleteRequest(`admin/videolists/${id}`)
}

const PRE_URL = 'admin/keywords'

export function getKeyList(type, params) {
  return AppService.getRequest(`${PRE_URL}/getSortList`)
}

export function addKey(params) {
  return AppService.postRequest(PRE_URL, params)
}

export function deleteKey(id) {
  return AppService.deleteRequest(`${PRE_URL}/${id}`)
}

export function updateKey(params) {
  return AppService.putRequest(`${PRE_URL}/${params.id}`, params)
}

export function getTips() {
  return AppService.getRequest('admin/tipss', {
    page: 1,
    limit: -1
  })
}

export function updateTips(params) {
  return AppService.putRequest(`admin/tipss/${params.id}`, params)
}

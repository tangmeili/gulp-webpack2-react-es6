/**
 * Created by Administrator on 2017/8/28.
 */

import AppService from '../../common/utils/app.service'

export const exportExcelUrl = AppService.api + 'admin/activitys/export'

const PRE_URL = 'admin/activitys'

export const uploadImgUrl = AppService.uploadImgUrl

export function verifyLogin() {
  return  AppService.postRequest('login/portal/verify_login')
}

export function getActivityList(params, dispatch) {
  return AppService.getRequest(PRE_URL, {...params}).then(response => {
    debugger
    if (response.errorCode == 0) {
      dispatch({
        type: 'ACTIVITY_LIST',
        list: response.data.rows
      })
    }
    return response
  })
}
export function getMoment(id) {
  return AppService.getRequest(`admin/momentses/${id}`)
}

export function getActivity(id, dispatch) {
  return AppService.getRequest(`${PRE_URL}/${id}`)
}

export function addActivity(Vod,dispatch) {
  return AppService.postFormRequest(`${PRE_URL}/save`, Vod).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'ADD_ACTIVITY',
        newActivity: response.data,
      })
    }
    return response
  })
}

export function auditActivity(params, dispatch) {
    return AppService.postFormRequest(`${PRE_URL}/submit`, params).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'AUDIT_ACTIVITY',
        newActivity: response.data,
        id: params.get('id') ? params.get('id') : null
      })
    }
    return response
  })
}
// 管理员审核
export function updateActivity(params, dispatch) {
  return AppService.putRequest(`${PRE_URL}/${params.id}/${params.status}`, {...params}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'UPDATE_ACTIVITY',
        newActivity: response.data
      })
    }
    return response
  })
}

export function editActivity(Vod, dispatch) {
  return AppService.postFormRequest(`admin/activitys/${Vod.get('id')}`,Vod).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'EDIT_ACTIVITY',
        newActivity: response.data,
      })
    }
    return response
  })
}

export function updateVirtualPopulation(Vod, dispatch) {
  return AppService.putRequest('admin/activitys/updateVirtualPopulation', {...Vod}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'EDIT_ACTIVITY',
        newActivity: response.data,
      })
    }
    return response
  })
}

export function deleteActivity(index, id, dispatch) {
  return AppService.deleteRequest(`${PRE_URL}/${id}`).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'DELETE_ACTIVITY',
        index: index
      })
    }
    return response
  })
}

// 上传视频
export function getSignature() {
  return AppService.getRequest('admin/getSignature')
}

// 获取市场
export function getMarkets() {
  return AppService.getRequest('admin/markets/', {page: 1, limit: -1})
}

export function getMaterialList(params, dispatch) {
  return AppService.getRequest('admin/activitys/getAvtivityVideo', params).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'MATERIAL_LIST',
        list: response.data.rows,
      })
    }
    return response
  })
}

export function getMaterial(id) {
  return AppService.getRequest('admin/activitys/getMoments', {
    momentsId: id
  })
}

export function updateMaterial(params, dispatch) {
  debugger
  return AppService.putRequest(`admin/activitys/changeMomentsStatus`, {...params}).then(response => {
    if (response.errorCode == 0 && dispatch) {
      dispatch({
        type: 'UPDATE_MATERIAL',
        newMaterial: response.data
      })
    }
    return response
  })
}
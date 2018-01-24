/**
 * Created by Administrator on 2017/8/28.
 */
import AppService from '../../common/utils/app.service'

export const uploadImgUrl = AppService.uploadImgUrl

export const exportExcelUrl = AppService.api + 'admin/lives/export'

export function getLiveList(params, dispatch) {
  return AppService.getRequest('admin/lives/', {...params}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'LIVE_LIST',
        list: response.data.rows
      })
    }
    return response
  })
}

export function getLive(id, dispatch) {
  return AppService.getRequest(`admin/lives/${id}`)
}

export function addLive(Live,dispatch) {
  return AppService.postFormRequest('admin/lives/save', Live).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'ADD_LIVE',
        newLive: response.data,
      })
    }
    return response
  })
}

export function auditLive(params, dispatch) {
  return AppService.postFormRequest('admin/lives/submit', params).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'AUDIT_LIVE',
        newLive: response.data,
        id: params.get('id') ? params.get('id') : null
      })
    }
    return response
  })
}
// 管理员审核
export function updateLive(params, dispatch) {
  return AppService.putRequest(`admin/lives/${params.id}/${params.status}`, {...params}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'UPDATE_LIVE',
        newLive: response.data
      })
    }
    return response
  })
}

export function editLive(live, dispatch) {
  debugger
  return AppService.postFormRequest(`admin/lives/${live.get('id')}`, live).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'EDIT_LIVE',
        newLive: response.data,
      })
    }
    return response
  })
}

export function updateVirtualPopulation(params,dispatch) {
  return AppService.putRequest('admin/lives/updateVirtualPopulation', params).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'EDIT_LIVE',
        newLive: response.data,
      })
    }
    return response
  })
}

// 修改回放
export function editPlayback(params,dispatch) {
  return AppService.patchRequest(`admin/lives/${params.id}`, params).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'EDIT_LIVE',
        newLive: response.data,
      })
    }
    return response
  })
}

export function deleteLive(index, id, dispatch) {
  debugger
  return AppService.deleteRequest(`admin/lives/${id}`).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'DELETE_LIVE',
        index: index
      })
    }
    return response
  })
}

// 获取市场
export function getMarkets() {
  return AppService.getRequest('admin/markets/', {page: 1, limit: -1})
}

// 上传视频
export function getSignature() {
  return AppService.getRequest('admin/getSignature')
}

export function uploadVideo(params,config) {
  let formdata = new FormData();
  formdata.append('Filedata',params.Filedata);
  formdata.append('cataid',params.cataid);
  formdata.append('writetoken',params.writetoken);
  // formdata.append('luping',1);
  formdata.append('JSONRPC',JSON.stringify({
    "title": "标题", "tag":"标签","desc":"描述"
  }));
  return AppService.postFormRequest('//v.polyv.net/uc/services/rest?method=uploadfile',formdata , config ? config: null)
}




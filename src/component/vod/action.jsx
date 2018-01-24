/**
 * Created by Administrator on 2017/8/28.
 */

import AppService from '../../common/utils/app.service'

export const uploadImgUrl = AppService.uploadImgUrl

export const exportExcelUrl = AppService.api + 'admin/vods/export'

export function verifyLogin() {
  return  AppService.postRequest('login/portal/verify_login')
}

// 获取点播分类
export function getVodCate(params, dispatch) {
  return AppService.getRequest('admin/vodcategorys', {...params})
}

export function getVodList(params, dispatch) {
  return AppService.getRequest('admin/vods', {...params}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'VOD_LIST',
        list: response.data.rows
      })
    }
    return response
  })
}

export function getVod(id, dispatch) {
  return AppService.getRequest(`admin/vods/${id}`)
}

export function addVod(Vod,dispatch) {
  return AppService.postFormRequest('admin/vods/save', Vod).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'ADD_VOD',
        newVod: response.data,
      })
    }
    return response
  })
}

export function auditVod(params, dispatch) {
  return AppService.postFormRequest('admin/vods/submit', params).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'AUDIT_VOD',
        newVod: response.data,
        id: params.get('id') ? params.get('id') : null
      })
    }
    return response
  })
}
// 管理员审核
export function updateVod(params, dispatch) {
  return AppService.putRequest(`admin/vods/${params.id}/${params.status}`, {...params}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'UPDATE_VOD',
        newVod: response.data
      })
    }
    return response
  })
}

export function editVod(Vod, dispatch) {
  return AppService.postFormRequest(`admin/vods/${Vod.get('id')}`, Vod).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'EDIT_VOD',
        newVod: response.data,
      })
    }
    return response
  })
}

export function updateVirtualPopulation(params,dispatch) {
  return AppService.putRequest('admin/vods/updateVirtualPopulation', params).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'EDIT_VOD',
        newVod: response.data,
      })
    }
    return response
  })
}

export function deleteVod(index, id, dispatch) {
  return AppService.deleteRequest(`admin/vods/${id}`).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'DELETE_VOD',
        index: index
      })
    }
    return response
  })
}

// 修改点播分类
export function editVodCate(id, params) {
  return AppService.putRequest(`admin/vodcategorys/${id}`, {...params})
}
export function deleteVodCate(id) {
  return AppService.deleteRequest(`admin/vodcategorys/${id}`)
}
export function addVodCate(params) {
  return AppService.postRequest('admin/vodcategorys', {...params})
}

export function swapCate(params) {
  return AppService.putRequest(`admin/vodcategorys/swap`,params)
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

// 获取市场
export function getMarkets() {
  return AppService.getRequest('admin/markets/', {page: 1, limit: -1})
}

/**
 * Created by Administrator on 2017/8/28.
 */
import AppService from '../../common/utils/app.service'

const PRE_URL = 'admin/momentses'

export function getMomentList(params, dispatch) {
  return AppService.getRequest(PRE_URL, {...params}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'MOMENT_LIST',
        list: response.data.rows,
      })
    }
    return response
  })
}

export function getAttentionAuditList(params) {
  return AppService.getRequest(`${PRE_URL}/attentionList`,params)
}

export function getMoment(id) {
  return AppService.getRequest(`${PRE_URL}/${id}`)
}

// 审核
export function updateMoment(params, dispatch) {
  debugger
  return AppService.putRequest(`${PRE_URL}/${params.id}/${params.status}`, {...params}).then(response => {
    if (response.errorCode == 0 && dispatch) {
      dispatch({
        type: 'UPDATE_MOMENT',
        newMoment: response.data
      })
    }
    return response
  })
}
// 修改虚拟观看人数
export function editMoment(id, moment, dispatch) {
  return AppService.putRequest(`${PRE_URL}/${id}`, {...moment}).then(response => {
    if (response.errorCode == 0 && dispatch) {
      dispatch({
        type: 'EDIT_MOMENT',
        newMoment: response.data,
      })
    }
    return response
  })
}

// 获取市场
export function getMarkets() {
  return AppService.getRequest('admin/markets/', {page: 1, limit: -1})
}

export function getAttentionUserList(params) {
  return AppService.getRequest('admin/momentses/getAttentionUser', params)
}

export function getAttentionUser(id) {
  return AppService.getRequest(`admin/user/${id}`)
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




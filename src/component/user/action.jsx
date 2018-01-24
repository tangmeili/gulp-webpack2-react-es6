/**
 * Created by Administrator on 2017/8/28.
 */
import AppService from '../../common/utils/app.service'

const PRE_URL = 'admin/user'

export function getUserList(params) {
  return AppService.getRequest(PRE_URL, {...params})
}

export function getUser(id) {
  return AppService.getRequest(`${PRE_URL}/${id}`)
}

export function enableUser(id) {
  return AppService.putRequest(`${PRE_URL}/enable/${id}`)
}

export function disableUser(id) {
  return AppService.putRequest(`${PRE_URL}/disable/${id}`)
}

export function attentionUser(id) {
  return AppService.putRequest(`${PRE_URL}/addToAttention/${id}`)
}

export function removeAttention(id) {
  return AppService.putRequest(`${PRE_URL}/deleteFromAttention/${id}`)
}




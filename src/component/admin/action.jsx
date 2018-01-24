/**
 * Created by Administrator on 2017/8/28.
 */
import AppService from '../../common/utils/app.service'

const URL_PRE = 'admin/adminusers'
const ROLE = 'admin/roles'

export function getAdminList(params, dispatch) {
  return AppService.getRequest(URL_PRE, {...params}).then(response => {
    if (response.errorCode == 0) {
      dispatch({
        type: 'ADMIN_LIST',
        list: response.data.rows,
      })
    }
    return response
  })
}

export function getAdmin(id) {
  return AppService.getRequest(`${URL_PRE}/${id}`)
}
export function addAdmin(params) {
  return AppService.postRequest(URL_PRE, params)
}
export function editAdmin(params) {
  return AppService.putRequest(`${URL_PRE}/${params.id}`, params)
}
export function deleteAdmin(id) {
  return AppService.deleteRequest(`${URL_PRE}/${id}`)
}

export function enableAdmin(id) {
  return AppService.putRequest(`${URL_PRE}/enable/${id}`)
}

export function disableAdmin(id) {
  return AppService.putRequest(`${URL_PRE}/disable/${id}`)
}

export function getRoleList(params) {
  return AppService.getRequest(ROLE, params)
}

export function getRole(id) {
  return AppService.getRequest(`${ROLE}/${id}`)
}

export function deleteRole(id) {
  return AppService.deleteRequest(`${ROLE}/${id}`)
}

export function addRole(params) {
  return AppService.postRequest(ROLE, params)
}

export function editRole(params) {
  return AppService.putRequest(`${ROLE}/${params.id}`, params)
}

export function getPermissionList() {
  return AppService.getRequest('admin/permissions')
}


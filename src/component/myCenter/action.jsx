import AppService from '../../common/utils/app.service'

export function updatePwd(params) {
  return AppService.postRequest('admin/mycenter/updatePwd', params)
}
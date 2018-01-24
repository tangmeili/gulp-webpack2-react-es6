import AppService from '../../common/utils/app.service'

// 获取点播、直播视频列表
export function getVideoList(type, params) {
  let url = ''
  if (type == 'LIVE') {
    url = 'admin/lives'
  } else if (type == 'VOD') {
    url = 'admin/vods'
  } if(type == 'MOMENTS')  {
    url = 'admin/momentses'
  }
  return AppService.getRequest(url, {...params})
}

export function getSensitiveList(params, dispatch) {
  return AppService.getRequest('admin/sensitivewords', {...params})
}

export function addSensitives(params) {
  return AppService.postRequest('admin/sensitivewords', {...params})
}

export function deleteSensitive(id) {
  return AppService.deleteRequest(`admin/sensitivewords/${id}`)
}

export function getReportList(params, dispatch) {
  return AppService.getRequest('admin/tipoffs', {...params})
}

export function deleteReport(id) {
  return AppService.deleteRequest(`admin/tipoffs/${id}`)
}

export function updataReport(id, status) {
  return AppService.putRequest(`admin/tipoffs/${id}/${status}`)
}

export function getCommentList(params, dispatch) {
  return AppService.getRequest('admin/comments', {...params})
}

export function deleteComment(id) {
  return AppService.deleteRequest(`admin/comments/${id}`)
}

export function updataComment(id, status) {
  return AppService.putRequest(`admin/comments/${id}/${status}`)
}

export function visibleComment(id) {
  return AppService.putRequest(`admin/comments/${id}`)
}

export function getSilentUserList(params) {
  return AppService.getRequest('admin/comments/getSilentUser', {...params})
}

export function getUser(id) {
  return AppService.getRequest(`admin/user/${id}`)
}

export function getSilentUserCommentList(params) {
  return AppService.getRequest(`admin/comments/getComment/${params.id}`, params)
}

export function cancleForbid(id) {
  return AppService.putRequest(`admin/comments/deleteFromSilent/${id}`)
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

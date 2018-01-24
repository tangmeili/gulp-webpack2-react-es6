import AppService from '../../common/utils/app.service'

// const PRE_URL = 'admin/keywords'

export function getKeyList(type, params) {
  return AppService.getRequest('admin/statistics/key')
}

export function getLiveStatistics(type) {
  return AppService.getRequest('admin/statistics/live', {
    type
  })
}

export function getMomentStatistics(type) {
  return AppService.getRequest('admin/statistics/moments', {
    type
  })
}

export function getVodStatistics(params) {
  return AppService.getRequest('admin/statistics/vod', params)
}

export function getVodList(params) {
  return AppService.getRequest('admin/statistics/vod', params)
}

export function getVod(id) {
  return AppService.getRequest(`admin/statistics/vod/${id}`)
}

export function getIntervalSize() {
  return AppService.getRequest(`admin/tipss/1005`, {
    id: 1005
  })
}

export function updateIntervalSize(params) {
  return AppService.putRequest(`admin/tipss/${params.id}`, params)
}


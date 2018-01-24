import AppSerivce from '../../common/utils/app.service'

export function getMarketList(params) {
  return AppSerivce.getRequest('admin/markets', params)
}

export function getRankList(params) {
  return AppSerivce.getRequest('admin/ranks', params)
}

export function getTips() {
  return AppSerivce.getRequest('admin/tipss', {
    page: 1,
    limit: -1
  })
}

export function updateRank(params) {
  return AppSerivce.putRequest(`admin/ranks/${params.id}`, params)
}

export function updateMarket(params) {
  return AppSerivce.putRequest(`admin/markets/${params.id}`, params)
}

export function updateTips(params) {
  return AppSerivce.putRequest(`admin/tipss/${params.id}`, params)
}

export function getShowVideoList(id) {
  return AppSerivce.getRequest(`admin/tipss/${id}`)
}
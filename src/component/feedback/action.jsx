/**
 * Created by Administrator on 2017/8/28.
 */
import AppService from '../../common/utils/app.service'

const PRE_URL = 'admin/feedbacks'

export function getFeedbackList(params) {
  return AppService.getRequest(PRE_URL, {...params})
}

export function getFeedback(id) {
  return AppService.getRequest(`${PRE_URL}/${id}`)
}

export function replyFeedback(params) {
  return AppService.patchRequest(`${PRE_URL}/${params.id}`, params)
}




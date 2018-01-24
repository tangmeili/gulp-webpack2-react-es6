/**
 * Created by Administrator on 2017/9/1.
 */

// 审核状态
export const DRAFT = 'DRAFT'
export const TO_AUDIT = 'UNAUDITED'
export const AUDITED = 'AUDIT_PASS'
export const REFUSE = 'AUDIT_NOT_PASS'
export const ON_SHELVE = 'ON_SHELVE'
export const OFF_SHELVE = 'OFF_SHELVE'
// 审核状态转换成中文
export const AUDIT_STATUS_TO_CN = {
  'DRAFT': '草稿',
  'UNAUDITED': '待审核',
  'AUDIT_PASS': '审核通过',
  'AUDIT_NOT_PASS': '审核未通过',
  'ON_SHELVE': '上架',
  'OFF_SHELVE': '下架'
}

//  短视频 活动视频
export const  IS_ACTIVE_MOMENT = {
  'true': '活动视频',
  'false': '非活动视频'
}

// 视频观看权限
export  const PERMISSION = {
  'PUBLIC': '公开',
  'BINDED': '需绑定卡号',
  'SAME_MARKET': '同市场',
  'DESIGNATED_MARKET': '指定市场',
  'ONLY_MYSELF': '只允许自己',
  'WHITELIST': '白名单'
}

// 用户状态
export const USER_STATUS = {
  'DISABLED': '禁用',
  'ENABLED': '启用',
  'CANCELLED': '销户'
}

// 用户类型

export  const USER_TYPE = {
  'SALESMAN': '业务员',
  'STAFF': '员工'
}

export  const SEX = {
  'MAN': '男',
  'WOMAN': '女',
  'UNKNOWN': '未知'
}

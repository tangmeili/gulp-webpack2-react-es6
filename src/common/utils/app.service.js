/**
 * Created by Administrator on 2017/8/10.
 */

import axios from 'axios'
import Qs from 'qs'
import queryString from 'query-string';
import { notification, message } from 'antd';

var localConfig = {
  isMock : false,
  isDev: true,
  apiHost: "https://dev.xsili.net:443/test/api/infinitus-video-wxapp/v1/",
}
var testConfig = {
  isMock : false,
  apiHost: "https://dev.xsili.net:443/test/api/infinitus-video-wxapp/v1/",
}
var publishConfig = {
  isMock : false,
  apiHost: "https://infinitusvideo.infinitus.com.cn:443/infinitus-video-wxapp/v1/",
}

var API = {
  config: localConfig
}

console.log('_test_',__test__)
console.log('__dist__',__dist__)
if(__DEV__) {
  API.config = localConfig;
} else if(__test__) {
  API.config = testConfig;
} else if(__dist__) {
  API.config = publishConfig;
}


var instance = axios.create({
  baseURL: API.config.isMock ? 'http://localhost:3001/infinitus-video-admin/' : API.config.apiHost,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

});
// 全局登录拦截拦截
instance.interceptors.response.use(
  response => {
    if (response.data.errorCode == 2) {
      if( location.href.indexOf('login.html') > 0) {
        return response.data
      }
      sessionStorage.setItem('gotoBeforeUrl', location.href);
      location.href = './login.html'
      return
    }
    sessionStorage.removeItem('gotoBeforeUrl')
    if(response.data.errorCode == 1) {
      message.error(response.data.msg);
      return Promise.reject(response.data.msg);
    } else {
      return response.data
    }
  },error => {
    notification['error']({
      message: '网络请求失败，请重试',
      description: '',
      key: 'response_error',
      duration: 2
    })
    return Promise.reject(error);
  });

const AppService = {
  getRequest: (url, data) => {
    return instance.get(url,data ?　{params: data}: {})
  },
  postRequest: (url,data,config) => {
    if(data) {
      url = url + '?' + queryString.stringify(data)
    }
    // data = data ?  queryString.stringify(data) : null
    return instance.post(url, data,config ? config : {})
  },
  postFormRequest: (url,data,config) => {
    return instance.post(url, data, config ? config : {
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
  },
  putRequest: (url, data) => {
    if(data) {
      url = url + '?' + queryString.stringify(data)
    }
    // data = data ? queryString.stringify(data) : null
    return instance.put(url)
  },
  putFormRequest: (url,data,config) => {
    return instance.put(url, data, config ? config : {
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
  },
  deleteRequest: (url, data) => {
    return instance.delete(url, data ? {params: data} : {})
  },
  patchRequest: (url, data) => {
    if(data) {
      url = url + '?' + queryString.stringify(data)
    }
    return instance.patch(url,data)
  }
}

AppService.uploadImgUrl = API.config.apiHost + 'base/upload/upload_image'
AppService.codeUrl = API.config.apiHost + 'base/verification_code/get_image?'
AppService.api = API.config.apiHost

export default AppService
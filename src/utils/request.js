import axios from 'axios'
axios.interceptors.response.use(function (response) {
    return response.data
}, function (error) {
    return Promise.reject(error)
})
export default ({ method = 'get', url, data, params }) => {
    return axios({
        baseURL: 'http://localhost:8080',
        method: method,
        // 请求地址
        url: url,
        // post请求参数
        data: data,
        // get请求参数
        params: params
    })
}
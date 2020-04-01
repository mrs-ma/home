import request from './request.js'
export const BASE_IMG_URL = 'http://localhost:8080'
export const getCurrentCity = () => {
    return new Promise((resolve, reject) => {
        const city = window.localStorage.getItem('current_city')
        if (city) {
            // 获取缓存数据,并终止后续代码执行
           return resolve(JSON.parse(city))
        }
        const geolocation = new window.BMap.Geolocation();
        geolocation.getCurrentPosition(async function (r) {
            if (this.getStatus() === window.BMAP_STATUS_SUCCESS) {
                // 定位成功
                // 根据定位获取的城市名称查询城市的详细信息
                const res = await request({
                    url: 'area/info',
                    params: {
                        name: r.address.city.substr(0, 2)
                    }
                })
                // 把定位得到的数据进行缓存
                window.localStorage.setItem('current_city', JSON.stringify(res.body))
                // 返回定位的数据
                resolve(res.body)
            } else {
                // 定位失败
                console.log('fail')
                reject('定位失败')
            }
        })
    })
}
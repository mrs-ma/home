import React from 'react'
import './index.scss'
import { NavBar, Icon, Toast } from 'antd-mobile'
import { getCurrentCity, BASE_IMG_URL } from '../../utils/config.js'
import request from '../../utils/request.js'
class MapTest extends React.Component {
    state = {
        houseData: [],
        // 小区房源列表
        areaList: [],
        // 控制列表展示或者隐藏
        isShow: false
    }
    initMap = async () => {
        // 获取当前城市信息
        const city = await getCurrentCity()
        // 根据城市名称获取城市的经纬度
        const geo = new window.BMap.Geocoder()
        // getPoint参数：（1、城市名称；2、回调函数；3、国家名称）
        geo.getPoint(city.label, (data) => {
            // 获取城市经纬度数据
            let info = {
                lng: data && data.lng,
                lat: data && data.lat
            }
            // 1、创建地图实例对象
            const map = new window.BMap.Map("mymap")
            // 2、创建地图中心点坐标
            const point = new window.BMap.Point(info.lng, info.lat)
            // 3、设置地图的中心点坐标和缩放级别 
            map.centerAndZoom(point, 11)
            map.addEventListener('movestart', () => {
                // 地图移动时需要隐藏房源列表
                this.setState({
                    isShow: false
                })
            })
            // 批量绘制一级覆盖物
            this.drawFirstLevelOverlay(map)
        }, '中国')
    }
    drawSingleOverlay = (map, overlayData, type) => {
        const point = new window.BMap.Point(overlayData.coord.longitude, overlayData.coord.latitude)
        // 添加地图覆盖物
        let opts = {
            // 表示覆盖物绘制的坐标
            position: point,
            // 覆盖物中心点的偏移量
            offset: new window.BMap.Size(-30, -30)
        }
        // 如下的覆盖物内容由百度地图解析，而不是React解析
        let labelContent = `
      <div class='map-overlay'>
        <div>${overlayData.label}</div>
        <div>${overlayData.count}套</div>
      </div>
    `
        if (type === 'third') {
            // 调整三级覆盖物的样式
            labelContent = `
          <div class='map-overlay-area'>
            <span>${overlayData.label}</span>
            <span>${overlayData.count}套</span>
          </div>
        `
        }
        let label = new window.BMap.Label(labelContent, opts);
        label.addEventListener('click', (e) => {
            if (type === 'first') {
                // 绘制二级覆盖物
                this.drawSecondLevelOverlay(map, overlayData)
            } else if (type === 'second') {
                // 绘制三级覆盖物
                this.drawThirdLevelOverlay(map, overlayData)
            } else if (type === 'third') {
                // 点击三级覆盖物，应该加载小区房源列表并展示
                this.showHouseList(overlayData.value)
                const { clientX, clientY } = e.changedTouches[0]
                // 获取地图中心点坐标
                const x0 = window.innerWidth / 2
                const y0 = (window.innerHeight - 330) / 2
                // 地图移动的距离（必须使用中心点坐标-点击位置的坐标）
                const x = x0 - clientX
                const y = y0 - clientY
                // 调用地图的API实现地图的移动
                map.panBy(x, y)
            }
        })
        // 设置label本身的样式
        label.setStyle({
            border: '0',
            background: 'rgba(0,0,0,0)'
        })
        // 把地图覆盖物添加到地图中
        map.addOverlay(label)
    }
    // 批量绘制一级覆盖物
    drawFirstLevelOverlay = (map) => {
        const { houseData } = this.state
        houseData.forEach(item => {
            // 绘制单个覆盖物
            this.drawSingleOverlay(map, item, 'first')
        })
    }
    loadFirstLevelData = async () => {
        Toast.loading('正在加载...', 0)
        // 获取当前城市数据
        const city = await getCurrentCity()
        const res = await request({
            url: 'area/map',
            params: {
                id: city.value
            }
        })
        this.setState({
            houseData: res.body
        })
        Toast.hide()
    }
    async componentDidMount() {
        // 获取一级覆盖物数据(加载完成数据后才去初始化地图)
        await this.loadFirstLevelData()
        // 初始化地图
        this.initMap()

        // 按照如下的写法也可以
        // this.loadFirstLevelData().then(() => {
        //   this.initMap()
        // })
    }
    // 绘制二级覆盖物 
    drawSecondLevelOverlay = async (map, overlayData) => {
        Toast.loading('正在加载...', 0)
        // 一级覆盖物点击时，
        // 1、需要清空原有覆盖物，
        setTimeout(() => {
            // 防止出现警告
            map.clearOverlays()
        }, 0)
        // 2、根据点击的一级覆盖物，获取对应二级覆盖物的数据
        const res = await request({
            url: 'area/map',
            params: {
                id: overlayData.value
            }
        })
        // 3、重新绘制二级覆盖物（放大地图）
        const point = new window.BMap.Point(overlayData.coord.longitude, overlayData.coord.latitude)
        map.centerAndZoom(point, 13)
        res.body.forEach(item => {
            // 绘制单个二级覆盖物
            this.drawSingleOverlay(map, item, 'second')
        })
        Toast.hide()
    }
    // 绘制三级覆盖物
    drawThirdLevelOverlay = async (map, overlayData) => {
        Toast.loading('正在加载...', 0)
        // 1、清空二级覆盖物
        setTimeout(() => {
            map.clearOverlays()
        }, 0)
        // 2、放大地图
        const point = new window.BMap.Point(overlayData.coord.longitude, overlayData.coord.latitude)
        map.centerAndZoom(point, 15)
        // 3、调用接口获取三级覆盖物数据
        const res = await request({
            url: 'area/map',
            params: {
                id: overlayData.value
            }
        })
        // 4、批量绘制
        res.body.forEach(item => {
            // 绘制三级覆盖物
            this.drawSingleOverlay(map, item, 'third')
        })
        Toast.hide()
    }
    // 展示房源列表
    showHouseList = async (id) => {
        const res = await request({
            url: 'houses',
            params: {
                cityId: id
            }
        })
        this.setState({
            areaList: res.body.list,
            // 加载完数据显示房源列表
            isShow: true
        })
    }
    renderAreaList = () => {
        const { areaList } = this.state
        const listTag = areaList.map(item => (
            <div key={item.houseCode} className='house'>
                <div className='img-wrap'>
                    <img className='img' src={BASE_IMG_URL + item.houseImg} alt="" />
                </div>
                <div className='content'>
                    <h3 className='title'>{item.title}</h3>
                    <div className='desc'>{item.desc}</div>
                    <div>
                        {item.tags && item.tags.map((item, index) => {
                            // tagCls类名所有需要从1-3进行变化
                            let i = (index + 1) % 3 === 0 ? 3 : (index + 1) % 3
                            let tagCls = 'tag' + i
                            return (
                                <span key={index} className={['tag', tagCls].join(' ')}>
                                    {item}
                                </span>
                            )
                        })}
                    </div>
                    <div className='price'>
                        <span className='price-num'>{item.price}</span> 元/月
                </div>
                </div>
            </div>
        ))
        return (
            <div className={['house-list', this.state.isShow ? 'show' : ''].join(' ')}>
                <div className='title-wrap'>
                    <h1 className='list-title'>房屋列表</h1>
                    <a className='title-more' href="/house/list">
                        更多房源
              </a>
                </div>
                <div className='house-items'>
                    {listTag}
                </div>
            </div>
        )
    }
    render() {
        return (
            <div style={{ height: '100%' }}>
                {/*导航栏*/}
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() => {
                        // 左侧点击事件,跳回到主页面
                        this.props.history.push('/home')
                    }}
                >城市选择</NavBar>
                {/*地图区域*/}
                <div id='mymap'></div>
                {/*房源列表的模板*/}
                {this.renderAreaList()}
            </div>
        )
    }
}
export default MapTest
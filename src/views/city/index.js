import React from 'react'
import { NavBar, Icon, Toast } from 'antd-mobile'
import request from '../../utils/request.js'
import { getCurrentCity } from '../../utils/config.js'
import { List, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import './index.scss'
class City extends React.Component {
    state = {
        cityInfo: {},
        currentIndex: 0
    }
    listRef = React.createRef()
    loadData = async () => {
        Toast.loading('正在加载...', 0)
        // 获取城市列表的原始数据
        const res = await request({ url: 'area/city', params: { level: 1 } })
        // 把原始城市列表数据进行分组
        const cityInfo = this.formatCityList(res.body)
        const hotCity = await request({ url: 'area/hot' })
        cityInfo.cityObj['hot'] = hotCity.body
        cityInfo.cityIndex.unshift('hot')
        const city = await getCurrentCity()
        cityInfo.cityObj['#'] = [city]
        cityInfo.cityIndex.unshift('#')

        // 把分好组的城市列表数据更新到状态
        this.setState({
            cityInfo: cityInfo
        }, () => {
            this.listRef.current.measureAllRows()
            // 隐藏提示   
            Toast.hide()
        })
    }
    formatCityList = (cityList) => {
        let cityObj = {}
        cityList.forEach(item => {
            // 判断cityObj中是否已经包含特定字符，
            // 如果不包含，添加一个新的字符并且初始化一个数组
            // 如果包含，项目对应数组中添加一项数据
            // 1、获取城市的首字符
            let firstLetter = item.short.substr(0, 1)
            if (cityObj.hasOwnProperty(firstLetter)) {
                // 已经存在该属性
                cityObj[firstLetter].push(item)
            } else {
                // 不存在该属性，向对象中添加一个属性
                cityObj[firstLetter] = [item]
            }
        })
        let letters = Object.keys(cityObj).sort()
        return {
            cityObj: cityObj,
            cityIndex: letters
        }
    }
    componentDidMount() {
        this.loadData()
    }
    // renderCityList = () => {
    //     const { cityObj, cityIndex } = this.state.cityInfo
    //     let tags = []
    // // 由于数据是异步更新的，所有必须进行存在性判断
    // cityIndex && cityIndex.forEach((letter, index) => {
    //   // 把分组的字符添加到数组
    //   tags.push(<div key={index}>{letter}</div>)
    //   let cityList = cityObj[letter]
    //   cityList.forEach((city, i) => {
    //     // 把分组下的每一个城市名称添加到数组
    //     tags.push(<div key={index + '-' + i}>{city.label}</div>)
    //   })
    // })
    // return (
    //     <div>
    //       {tags}
    //     </div>
    //   )
    // }
    calcRowHeight = ({ index }) => {
        // 动态计算每一行列表的高度
        const { cityObj, cityIndex } = this.state.cityInfo
        // 获取当前标题字符
        const letter = cityIndex[index]
        // 获取当前行列表数据
        const list = cityObj[letter]
        // 计算公式：标题的高度 + 每一个城市的高度 * 当前行城市的数量
        return 36 + 50 * list.length
    }
    onRowsRendered = ({ startIndex }) => {
        // startIndex表示列表可视区行内容开始索引
        if (this.state.currentIndex !== startIndex) {
            this.setState({
                currentIndex: startIndex
            })
        }
    }
    rowRenderer = ({ key, style, index }) => {
        // 负责渲染每一行数据
        // key表示每一行信息的唯一标识
        // style表示每一行模板的样式
        // index表示每一条数据的索引
        const { cityObj, cityIndex } = this.state.cityInfo
        // 获取每一行标题的字符
        const letter = cityIndex[index]
        // 获取城市列表数据
        const list = cityObj[letter]
        // 动态生成城市列表
        const cityTags = list.map((item, index) => (
            <div className="name"
                onClick={() => {
                    // 仅仅允许选择一线城市
                    let firstCity = cityObj.hot
                    let flag = firstCity.some(city => {
                        return city.label === item.label
                    })
                    if (flag) {
                        // 一线城市,缓存当前选中的城市，再跳回到主页
                        window.localStorage.setItem('current_city', JSON.stringify(item))
                        // 跳回到主页
                        this.props.history.push('/home')
                    } else {
                        // 非一线城市,提示一下
                        Toast.info('只允许选择一线城市', 1)
                    }
                }}
                key={item.value + index} >
                {item.label}
            </div>
        ))
        return (
            <div key={key} style={style} className="city">
                <div className="title">{letter}</div>
                {cityTags}
            </div>
        )
    }

    renderCityList = () => {
        // 基于长列表组件进行城市列表的渲染
        return (
            <AutoSizer>
                {({ width, height }) => {
                    // AutoSizer用于获取Lint组件父容器的宽度和高度
                    // 判断状态数据是否存在,只有数据存在了，才可以计算行高
                    const { cityIndex } = this.state.cityInfo
                    return cityIndex && <List
                        ref={this.listRef}
                        scrollToAlignment='start'
                        width={width}
                        height={height - 45}
                        rowCount={cityIndex.length}
                        onRowsRendered={this.onRowsRendered}
                        rowHeight={this.calcRowHeight}
                        rowRenderer={this.rowRenderer}
                    />
                }}
            </AutoSizer>
        )
    }
    renderRightIndex = () => {
        // 渲染右侧索引
        const { cityIndex } = this.state.cityInfo
        const { currentIndex } = this.state
        const indexTags = cityIndex && cityIndex.map((item, index) => (
            <li
                onClick={() => {
                    // 点击右侧索引控制左侧列表的滚动
                    // current表示List组件的实例对象
                    this.listRef.current.scrollToRow(index)
                }}
                key={index}
                className="city-index-item">
                <span className={currentIndex === index ? 'index-active' : ''}>
                    {item === 'hot' ? '热' : item.toUpperCase()}
                </span>
            </li>
        ))
        return (
            <ul className="city-index">
                {indexTags}
            </ul>
        )
    }
    render() {
        return (
            <div style={{ height: '100%' }}>
                {/*顶部导航*/}
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() => {
                        // 左侧点击事件
                        // 跳回到主页面
                        this.props.history.push('/home')
                        // this.props.history.goBack()
                        // this.props.history.go(-1)
                    }}
                >城市选择</NavBar>
                {/*城市列表*/}
                {this.renderCityList()}
                {/*右侧索引*/}
                {this.renderRightIndex()}
            </div>
        )
    }
}
export default City
/*
  找房模块
*/
import React from 'react'
import { Flex } from 'antd-mobile'
import { getCurrentCity } from '../../utils/config.js'
import request from '../../utils/request.js'
import './index.scss'
import Filter from './components/Filter/index.js'

class Find extends React.Component {
  state = {
    cityName: '',
     // 房源列表总数
     count: 0,
     // 房源列表数据
     houseList: [],
     // 请求参数
     filter: {}
  }
  loadData = async () => {
    const { filter } = this.state
    const city = await getCurrentCity()
    const res = await request({
      url: 'houses',
      params: {
        ...filter,
        cityId: city.value,
        start: 1,
        end: 10
      }
    })
    this.setState({
      count: res.body.count,
      houseList: res.body.list
    })
  }
  onFilter = (filter) => {
    this.setState({
      filter: filter
    }, () => {
      this.loadData()
    })
  }
  componentDidMount() {
    getCurrentCity().then(res => {
      this.setState({
        cityName: res.label
      })
    })
  }
  render() {
    return (
      <div>
        {/*导航栏*/}
        <Flex className='header'>
          <i onClick={() => {
            // 点击时，跳转到主页
            this.props.history.push('/home/index')
          }} className="iconfont icon-back" />
          <Flex className='search-box searchHeader'>
            {/* 左侧白色区域 */}
            <Flex className="search">
              {/* 位置 */}
              <div className="location" onClick={() => {
                // 点击城市名称，去切换城市
                this.props.history.push('/city')
              }}>
                <span className="name">{this.state.cityName}</span>
                <i className="iconfont icon-arrow" />
              </div>
              {/* 搜索表单 */}
              <div className="form" >
                <i className="iconfont icon-seach" />
                <span className="text">请输入小区或地址</span>
              </div>
            </Flex>
            {/* 右侧地图图标 */}
            <i className="iconfont icon-map" />
          </Flex>
        </Flex>
        {/*筛选条件*/}
        <Filter onFilter={this.onFilter}/>
      </div>
    )
  }
}

export default Find

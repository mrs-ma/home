/*
  主页
*/
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import './index.css'
import Index from '../index/index.js'
import Find from '../find/index.js'
import Info from '../info/index.js'
import My from '../my/index.js'
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 'redTab',
            hidden: false,
            fullScreen: false,
        };
    }
    componentDidUpdate (prevProps) {
        // prevProps表示原来的数据
        // this.props表示最新的数据
        // console.log(prevProps)
        // console.log(this.props)
        let oldPath = prevProps.location.pathname
        let newPath = this.props.location.pathname
        // 这里的判断必须添加，否则会报错
        if (oldPath !== newPath) {
          // 路径发生了变化，手动更新当前路径
          // console.log(newPath)
          let p = newPath.substr(newPath.lastIndexOf('/') + 1)
          this.setState({
            selectedTab: p
          })
        }
      }
    renderMenuItems = () => {
        const menuData = [{
            key: 'index',
            title: '首页',
            icon: 'icon-ind'
        }, {
            key: 'find',
            title: '找房',
            icon: 'icon-findHouse'
        }, {
            key: 'info',
            title: '资讯',
            icon: 'icon-myinfo'
        }, {
            key: 'my',
            title: '我的',
            icon: 'icon-my'
        }]
        return menuData.map((item) => (
            <TabBar.Item
                title={item.title}
                key={item.key}
                icon={<i className={`iconfont ${item.icon}`}></i>}
                selectedIcon={<i className={`iconfont ${item.icon}`}></i>}
                selected={this.state.selectedTab === item.key}
                onPress={() => {
                    // 控制菜单的点击切换
                    this.setState({
                        selectedTab: item.key,
                    });
                    // 通过编程式导航方式控制路由跳转
                    this.props.history.push('/home/' + item.key)
                }}
            />
        ))
    }
    render() {
        return (
            <div className='home-menu'>
                <Switch>
                    <Redirect exact from='/home' to='/home/index' />
                    <Route path='/home/index' component={Index} />
                    <Route path='/home/find' component={Find} />
                    <Route path='/home/info' component={Info} />
                    <Route path='/home/my' component={My} />
                </Switch>
                <TabBar
                    noRenderContent={true}
                    unselectedTintColor="#949494"
                    tintColor="#33A3F4"
                    barTintColor="white">
                    {this.renderMenuItems()}
                </TabBar>
            </div>
        )
    }
}

export default Home

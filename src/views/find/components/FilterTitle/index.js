import React from 'react'

import { Flex } from 'antd-mobile'

import styles from './index.module.css'

// 条件筛选栏标题数组：
const titleList = [
  { title: '区域', type: 'area' },
  { title: '方式', type: 'mode' },
  { title: '租金', type: 'price' },
  { title: '筛选', type: 'more' }
]

export default function FilterTitle(props) {
  const { menuStatus, changeStatus } = props
  const menuTag = titleList.map(item => {
    let flag = menuStatus[item.type]
    return (
      <Flex.Item key={item.type}>
        {/* 选中类名： selected */}
        <span
          onClick={() => {
            // 点击菜单控制对应菜单高亮（子组件控制父组件的状态）
            changeStatus(item.type)
          }}
          className={[styles.dropdown, flag ? styles.selected : ''].join(' ')}>
          <span>{item.title}</span>
          <i className="iconfont icon-arrow" />
        </span>
      </Flex.Item>
    )
  })
  return (
    <Flex align="center" className={styles.root}>
      {menuTag}
    </Flex>
  )

}

import React, { Component } from 'react'

import FilterFooter from '../../../../components/FilterFooter'

import styles from './index.module.css'

export default class FilterMore extends Component {
  state = {
    // 选中的标签值
    selectedValues: this.props.defaultValue? this.props.defaultValue: []
  }
  toggleSelect = (value) => {
    // 控制标签值的选中：判断selectedValues中是否包含当前值，如果有就删除，否则就添加
    const newSelectedValues = [...this.state.selectedValues]
    if (newSelectedValues.includes(value)) {
      // 已经存在，删除
      let index = newSelectedValues.findIndex(item => item === value)
      newSelectedValues.splice(index, 1)
    } else {
      // 不存在，添加
      newSelectedValues.push(value)
    }
    this.setState({
      selectedValues: newSelectedValues
    })
  }
  // 渲染标签
  renderFilters(list) {
    const { selectedValues } = this.state
    // 高亮类名： styles.tagActive
    return list.map(item => (
      <span
        onClick={this.toggleSelect.bind(this, item.value)}
        key={item.value}
        className={[styles.tag, selectedValues.includes(item.value) ? styles.tagActive : ''].join(' ')}>
        {item.label}
      </span>
    ))
  }

  render() {
    const {
      onCancel,
      onSave,
      openType,
      data: { roomType, oriented, floor, characteristic }
    } = this.props
    return (
      <div className={styles.root}>
        {/* 遮罩层 */}
        <div className={styles.mask} />

        {/* 条件内容 */}
        <div className={styles.tags}>
          <dl className={styles.dl}>
            <dt className={styles.dt}>户型</dt>
            <dd className={styles.dd}>{this.renderFilters(roomType)}</dd>

            <dt className={styles.dt}>朝向</dt>
            <dd className={styles.dd}>{this.renderFilters(oriented)}</dd>

            <dt className={styles.dt}>楼层</dt>
            <dd className={styles.dd}>{this.renderFilters(floor)}</dd>

            <dt className={styles.dt}>房屋亮点</dt>
            <dd className={styles.dd}>{this.renderFilters(characteristic)}</dd>
          </dl>
        </div>

        {/* 底部按钮 */}
        <FilterFooter className={styles.footer}
          onCancel={() => {
            // 清空选中的标签
            this.setState({
              selectedValues: []
            })
            // 触发父组件的方法
            onCancel()
          }}
          onSave={() => {
            onSave(openType, this.state.selectedValues)
          }}
        />
      </div>
    )
  }
}

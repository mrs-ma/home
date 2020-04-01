import React, { Component } from 'react'

import { PickerView } from 'antd-mobile'

import FilterFooter from '../../../../components/FilterFooter'

export default class FilterPicker extends Component {
  state = {
    condition: this.props.defaultValue? this.props.defaultValue: null
  }
  
  
  
  handleCondition = (value) => {
    // 动态更新选中的值
    this.setState({
      condition: value
    })
  }
  render() {
    const { data, cols, openType } = this.props
    return (
      <>
        {/* 选择器组件： */}
        <PickerView
          data={data}
          onChange={this.handleCondition}
          value={this.state.condition}
          cols={cols} />

        {/* 底部按钮 */}
        <FilterFooter 
         onSave={() => {
            this.props.onSave(openType, this.state.condition)
            console.log(this.state.condition);
        }}
          onCancel={this.props.onCancel} />
      </>
    )
  }
}

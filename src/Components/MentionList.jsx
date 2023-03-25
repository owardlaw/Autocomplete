import React, {
  forwardRef, useEffect, useImperativeHandle,
  useState,
} from 'react'
import './MentionList.scss'

export default forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = index => {
    const item = props.items[index]
    
    if (item) {
      props.command({ id: item })
    } else {
      props.command({ id: props.query }) // add new item
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
    console.log(props.items.length);
  }

  useEffect(() => setSelectedIndex(0), [props.items])


  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="items">
      {props.items.length
        ? props.items.map((item, index) => (
          <button
            className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
        : <button className="item" onClick={() => selectItem(props.items.length+1)}
        > Add New </button>
      }
    </div>
  )
})

import { useState, useEffect, useRef } from 'react'
import Hammer from 'hammerjs'
import Fmover from 'finger-mover'
import simulationScrollY from 'simulation-scroll-y'
import simulationScrollX from 'simulation-scroll-x'
function App() {
  const refs = useRef({
    scroll: 0,      // 当前滚动位置
    lastScroll: 0,  // 上一次滚动位置
    deltaY: 0,      // 拖拽的偏移量
    appHeight: 0    // app的高度
  })
  const list = [
    [0, 0],
    [400, 0]
  ]
  const [item, setItem] = useState([
    {
      id: 1,
      x: 0,
      w: 240,
      h: 175
    },
    {
      id: 2,
      x: 400,
      w: 240,
      h: 340
    }
  ])
  const [state, setState] = useState<any>({
    showBag: false,   // 是否显示背包
    canScroll: true,  // 是否可以滚动
  })
  const [showItem, setShowItem] = useState([])
  // 滚动事件
  function pageScroll(e: any) {
    refs.current.deltaY = e.deltaY
    if (e.type == 'panstart') {
      refs.current.lastScroll = refs.current.scroll
    }
    if (e.type == 'panend') {
      let showItems = [] as any
      item.forEach(item => {
        const wide = refs.current.appHeight / 2 + item.h / 2
        if (refs.current.scroll > (item.x - wide - 500) && refs.current.scroll < (item.x + wide + 500)) {
          showItems.push(item)
        }
      })
      setShowItem(showItems)
    }
  }
  // 点击事件
  function pageTap(e: any) {
    console.log(e)
  }
  let hammer = useRef<any>()    //滚动
  let tapHammer = useRef<any>() //点击
  useEffect(() => {
    const App = document.querySelector('.App') as HTMLElement
    refs.current.appHeight = App.offsetHeight
    hammer.current = new Hammer(App)
    hammer.current.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL })
    tapHammer.current = new Hammer(App)
    tapHammer.current.on('tap press', (e: any) => pageTap(e))
    requestRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(requestRef.current)
  }, [])
  useEffect(() => {
    console.log(state.canScroll)
    if (!state.canScroll) {
      hammer.current.off('panleft panright panup pandown panstart panend')
    } else {
      hammer.current.on('panleft panright panup pandown panstart panend', (e: any) => pageScroll(e))
    }
  }, [state.canScroll])
  useEffect(() => {
    let fm = new Fmover({
      el: '.bag-tag-list',
      plugins: [
        simulationScrollX({
          scrollBar: false
        })
      ]
    })
  }, [])
  const requestRef = useRef(0)
  // 动画
  function render() {
    const scrollDOM = document.querySelectorAll('.scroll') as NodeListOf<HTMLElement>
    const scrollLength = document.querySelector('.scroll-length') as HTMLElement
    // 滚动缓动
    refs.current.scroll = refs.current.scroll + ((refs.current.lastScroll - refs.current.deltaY) - refs.current.scroll) * 0.1
    // 滚动距离
    scrollLength.innerHTML = refs.current.scroll < 28 && refs.current.scroll > -28 ? '起点' : `${refs.current.scroll > 0 ? '向下' : '向上'}${parseInt((Math.abs(refs.current.scroll) / 28).toString())}厘米`
    // 滚动物体
    scrollDOM.forEach((item, index) => item.style.transform = `translate3D(0, ${-refs.current.scroll + list[index][0]}px, 0)`)
    // 滚动背景
    document.body.style.backgroundPositionY = `${-refs.current.scroll}px`
    requestRef.current = requestAnimationFrame(render)
  }
  return (
    <div className="App">
      {/* 标题栏 */}
      <div className={`header ${state.showBag ? 'hide-header' : ''}`}>
        <p className="scroll-length"></p>
      </div>
      <div className={`header ${!state.showBag ? 'hide-header' : ''}`}>
        <p>我的背包</p>
      </div>
      {/* 底部菜单 */}
      <div className={`home-btns ${state.showBag ? 'hide-btns' : ''}`}>
        <div onClick={() => setState({...state, showBag: true, canScroll: false})} className="btn btn-bag">
          <img src="./img/bag.svg" alt="" />
          <p>背包</p>
        </div>
        <div className="btn btn-rocket">
          <img src="./img/rocket.svg" alt="" />
          <p>火箭</p>
          <div className="btn-menu">
            
          </div>
        </div>
      </div>
      <div className={`home-btns ${!state.showBag ? 'hide-btns' : ''}`}>
        <div className="btn btn-create">
          <img src="./img/create.svg" alt="" />
          <p>创作</p>
        </div>
        <div onClick={() => setState({...state, showBag: false, canScroll: true})} className="btn btn-back">
          <img src="./img/back.svg" alt="" />
          <p>返回</p>
        </div>
      </div>
      {
        showItem.map(item => (
          <p>当前显示：{item['id']}</p>
        ))
      }
      <p className="text"></p>
      <img className="scroll logo" src="./img/logo.png" alt="" />
      <div className="scroll">
        <div className="card">
          <div className="content">
            <img src="./img/pic.jpg" alt="" />
          </div>
        </div>
      </div>
      {/* 背包 */}
      <div className={`bag ${!state.showBag ? 'hide-bag' : ''}`}>
        <div className="bag-tag">
          <ul className="bag-tag-list">
            <li onClick={() => console.log(state.canScroll)} className="bag-tag-item bag-choose-tag">#常用</li>
            <li className="bag-tag-item">#文字</li>
            <li className="bag-tag-item">#贴纸</li>
            <li className="bag-tag-item">#图片</li>
            <li className="bag-tag-item">#音乐</li>
            <li className="bag-tag-item">#分享</li>
          </ul>
        </div>
        <div className="bag-context bag-text">
          <div contentEditable className="bag-text-textarea"></div>
        </div>
      </div>
    </div>
  )
}

export default App
// 当前值 + ((历史值 - 变化值) - 当前) * 0.2
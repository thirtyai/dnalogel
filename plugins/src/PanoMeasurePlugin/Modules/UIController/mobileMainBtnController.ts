import { UIControllerParams } from '.'
import type MeasureController from '../../Controller'
import { mainIconStyle, mainItemStyle } from './style'

export class MobileMainBtnController {
  private container: Element
  private measureController: MeasureController
  private mainElement: ReturnType<MobileMainBtnController['getMainElement']>
  private _params: UIControllerParams

  private _btnTexts = {
    start: '开始',
    end: '结束',
  }

  public constructor(measureController: MeasureController, container: Element, params: UIControllerParams) {
    this._params = params

    this._btnTexts = {
      start: this._params.startButtonText ?? this._btnTexts.start,
      end: this._params.endButtonText ?? this._btnTexts.end,
    }

    this.measureController = measureController
    this.container = container
    this.mainElement = this.getMainElement()

    Object.assign(this.mainElement.mainIcon.style, mainIconStyle)
    Object.assign(this.mainElement.mainItem.style, mainItemStyle)
    this.change2Add()

    this.mainElement.mainItem.addEventListener('click', this.onClick)
  }

  public dispose() {
    this.mainElement.mainItem.removeEventListener('click', this.onClick)
  }

  private getMainElement() {
    const mainTextDom = this.container.querySelector<HTMLSpanElement>('.fpm__main-text')
    const mainItem = this.container.querySelector<HTMLButtonElement>('.fpm__main')
    const mainIcon = this.container.querySelector<HTMLElement>('.fpm__main-icon')
    if (!mainItem || !mainTextDom || !mainIcon) throw new Error('cannot find dom')

    return { mainTextDom, mainItem, mainIcon }
  }

  private change2Add() {
    const { mainIcon, mainTextDom } = this.mainElement
    if (mainIcon.className.includes('fpm__main__start')) {
      mainTextDom.innerText = this._btnTexts.start
      return
    }
    if (mainIcon.className.includes('fpm__main__end')) {
      mainIcon.style.transform = `scale(0.8)`
      if (mainTextDom.className.includes('fpm__main-text__show')) {
        mainTextDom.classList.replace('fpm__main-text__show', 'fpm__main-text__hide')
      } else {
        mainTextDom.classList.add('fpm__main-text__hide')
      }
      setTimeout(() => {
        mainIcon.classList.replace('fpm__main__end', 'fpm__main__start')
        mainIcon.style.transform = 'scale(1)'
        mainTextDom.innerText = this._btnTexts.start
        mainTextDom.classList.replace('fpm__main-text__hide', 'fpm__main-text__show')
      }, 200)
    }
  }

  private change2Done() {
    const { mainTextDom, mainIcon } = this.mainElement
    if (mainTextDom.innerText === this._btnTexts.end) return
    if (mainIcon.className.includes('fpm__main__end')) return
    if (mainIcon.className.includes('fpm__main__start')) {
      mainIcon.style.transform = `scale(0.8)`
      if (mainTextDom.className.includes('fpm__main-text__show')) {
        mainTextDom.classList.replace('fpm__main-text__show', 'fpm__main-text__hide')
      } else {
        mainTextDom.classList.add('fpm__main-text__hide')
      }
      setTimeout(() => {
        mainIcon.classList.replace('fpm__main__start', 'fpm__main__end')
        mainIcon.style.transform = 'scale(1)'
        mainTextDom.innerText = this._btnTexts.end
        mainTextDom.classList.replace('fpm__main-text__hide', 'fpm__main-text__show')
      }, 200)
    }
  }

  private onClick = () => {
    if (this.mainElement.mainTextDom.innerText === (this._params.startButtonText ?? '开始')) {
      this.measureController.hook.emit('willChangeState', 'watching', 'editing')
      this.change2Done()
    } else {
      this.measureController.hook.emit('willChangeState', 'editing', 'watching')
      this.change2Add()
    }
  }
}

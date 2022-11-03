import type { Five } from '@realsee/five'
import type { ValueOf } from 'type-fest'
import type { TagId } from '../typings/tag'
import type { PanoIndex, WorkCode, TagCache, State, EventMap } from '../typings'
import * as BasePlugin from '../../base/BasePlugin'

export abstract class TagCacheController extends BasePlugin.Controller<State, EventMap> {
  private tagCacheByPanoIndex: Record<`${WorkCode}-${PanoIndex}`, Map<TagId, TagCache>> = {}

  protected constructor(five: Five) {
    super(five)
  }

  protected getCaches({ panoIndex }: { panoIndex?: number }): Map<TagId, TagCache>
  protected getCaches({ panoIndex, id }: { panoIndex?: number; id: TagId }): TagCache
  protected getCaches({ panoIndex, id, key }: { panoIndex?: number; id: TagId; key: keyof TagCache }): ValueOf<TagCache> | undefined
  /**
   * @description: 获取缓存
   */
  protected getCaches({ panoIndex, id, key }: { panoIndex?: number; id?: TagId; key?: keyof TagCache }) {
    const { five } = this
    const fivePanoIndex = five.panoIndex ?? panoIndex
    if (fivePanoIndex === undefined) throw new Error(`TagCacheController getCache(): fivePanoIndex is ${fivePanoIndex}`)
    const cacheKey = `${five.work?.workCode ?? five.model.uuid}-${fivePanoIndex}` as `${WorkCode}-${PanoIndex}`
    let caches = this.tagCacheByPanoIndex[cacheKey]
    if (!caches) {
      caches = new Map<TagId, TagCache>()
      this.tagCacheByPanoIndex[cacheKey] = caches
    }
    if (id === undefined) return caches
    if (key === undefined) {
      const cache = caches.get(id)
      if (cache) return cache
      else {
        caches.set(id, {})
        return caches.get(id)
      }
    }
    return caches.get(id)?.[key]
  }

  protected clearCache() {
    this.tagCacheByPanoIndex = {}
  }
}

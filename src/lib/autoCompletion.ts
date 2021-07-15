// 自动补全组件名称

import { AdComponent, ComponentAttrValue, ComponentAttr } from './components'
const AduiIcon = require('adui-icon').default

interface ComponentHasIconProps {
  [key: string]: any;
  'ad-avatar': string[];
  'ad-button': string[];
  'ad-cell': string[];
  'ad-floating-button': string[];
  'ad-grid-item': string[];
  'ad-input': string[];
  'ad-message': string[];
  'ad-picture': string[];
  'ad-sheet': string[];
  'ad-steps-item': string[];
  'ad-tab-bar-item': string[];
  'ad-tag': string[];
  'ad-toast': string[];
  'ad-upload-image': string[];
}

const componentHasIconProps: ComponentHasIconProps = {
  'ad-avatar': ['placeholderIcon'],
  'ad-button': ['leftIcon', 'rightIcon'],
  'ad-cell': ['leftIcon', 'errorIcon', 'rightIcon'],
  'ad-floating-button': ['icon'],
  'ad-grid-item': ['icon'],
  'ad-input': ['icon', 'errorIcon'],
  'ad-message': ['leftIconDefault', 'leftIcon', 'rightIcon'],
  'ad-picture': ['placeholder', 'failedIcon'],
  'ad-sheet': ['titleIcon'],
  'ad-steps-item': ['icon'],
  'ad-tab-bar-item': ['icon'],
  'ad-tag': ['leftIcon', 'rightIcon'],
  'ad-toast': ['icon'],
  'ad-upload-image': ['icon'],
}

function createComponentFilter(
  existsTagAttrs: { [key: string]: string | boolean },
  event?: boolean
) {
  return (attr: ComponentAttr) => {
    let isEvent = false
    return (
      existsTagAttrs[attr.name] == null &&
      (event == null || (event ? isEvent : !isEvent))
    )
  }
}

function list(title: string, items?: string[]) {
  if (!items || !items.length) return []
  if (items.length === 1) return [field(title, items[0])]
  return [field(title, items.map((it) => `\n* ${it}`).join(''))]
}

function field(title: string, value: string) {
  return `**${title}:** ${value}`
}

function link(name: string, url: string) {
  return `[${name}](${url})`
}

function formatAttrValue(av: { value: string; desc?: string; since?: string }) {
  let rows = [av.value]
  if (av.desc) rows.push(`**${av.desc}**`)
  if (rows.length > 1) rows[0] += ':'
  return rows.join(' ')
}

function getComponentAttrMarkdown(a: ComponentAttr) {
  let rows = a.description ? [a.description] : [a.name]
  if (a.type)
    rows.push(field('类型', Array.isArray(a.type) ? a.type.join(',') : a.type))
  if (a.enum) rows.push(...list('可选值', a.enum.map(formatAttrValue)))

  return rows.join('\n\n')
}

function mapComponentAttr(attr: ComponentAttr) {
  return { attr, markdown: getComponentAttrMarkdown(attr) }
}

const getComponent = (tagName: string, components: Array<AdComponent>) => {
  const comp = components.find((component) => component.name === tagName)
  return comp
}

const getComponentMarkdown = (component: AdComponent) => {
  let rows = component.description ? [component.description] : [component.name]
  if (component.tutorial) rows.push(link('官方文档', component.tutorial))
  return rows.join('\n\n')
}

const getComponentAttrValueMarkdown = (v: ComponentAttrValue) => {
  let rows = v.description || v.value
  return rows
}

const mapComponent = (component: AdComponent) => {
  return { component, markdown: getComponentMarkdown(component) }
}

const getAvailableAttrsFromComponent = (
  comp: AdComponent,
  tagAttrs: { [key: string]: string | boolean }
): ComponentAttr[] => {
  let attrs = comp.attrs || []
  let results = attrs.filter((a) => tagAttrs[a.name] == null) // 先取出没有写的属性
  return results
}

const getAvailableAttrs = (
  tagName: string,
  tagAttrs: { [key: string]: string | boolean },
  components: Array<AdComponent>
) => {
  let comp = getComponent(tagName, components)
  return comp ? getAvailableAttrsFromComponent(comp, tagAttrs) : []
}

export interface TagItem {
  component: AdComponent
  markdown: string
}

// 自动补全支持的 tag
export const autoCompleteTagName = (
  components: Array<AdComponent>
): Array<TagItem> => {
  const tags: Array<TagItem> = components.map(mapComponent)
  return tags
}

export const autoCompleteTagAttr = (
  tagName: string,
  tagAttrs: { [key: string]: string | boolean },
  components: Array<AdComponent>
) => {
  const attrs = getAvailableAttrs(tagName, tagAttrs, components)
  // 属性不能是已经存在的，也不能是事件
  let filter = createComponentFilter(tagAttrs, false)
  return {
    natives: attrs.filter(filter).map(mapComponentAttr),
  }
}

// 自动补全指定的属性的值
export const autoCompleteTagAttrValue = (
  tagName: string,
  tagAttrName: string,
  components: Array<AdComponent>
) => {
  const comp = getComponent(tagName, components)
  console.log('paki tagname', tagName, tagAttrName)
  if (!comp || !comp.attrs) return []
  let attr = comp.attrs.find((a) => a.name === tagAttrName)
  if (!attr) return []
  let values = []
  if (
    tagAttrName === 'icon' ||
    (Object.keys(componentHasIconProps).includes(tagName) &&
      componentHasIconProps[tagName].includes(tagAttrName))
  ) {
    console.log(AduiIcon.svgData)
    const icons = Object.keys(AduiIcon.svgData)
    console.log('paki ad-icon', icons)
    values = icons.map((item) => {
      return { value: item }
    })
  } else {
    values = attr.enum ? attr.enum : []
  }

  return values.map((v) => {
    return {
      value: v.value,
      markdown: getComponentAttrValueMarkdown(v),
    }
  })
}

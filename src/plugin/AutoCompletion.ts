import {
  Position,
  TextDocument,
  Range,
  SnippetString,
  MarkdownString,
  CompletionItem,
  CompletionItemKind,
} from 'vscode'
import {
  autoCompleteTagAttr,
  autoCompleteTagAttrValue,
  autoCompleteTagName,
  TagItem,
} from '../lib/autoCompletion'
// import components from '../lib/components'
const components = require('../lib/vscodeData.json')
import { getWxmlTag } from '../lib/getTagAtPosition'
import { getLastChar, getCloseTag } from '../lib/helper'
console.log('paki ----------', components)

export default class AutoCompletion {
  constructor() {}

  get attrQuote() {
    return '"'
  }

  private setDefault(index: number, defaultValue: any) {
    if (!this.isDefaultValueValid(defaultValue)) return '${' + index + '}'
    if (
      typeof defaultValue === 'boolean' ||
      defaultValue === 'true' ||
      defaultValue === 'false'
    ) {
      return `{{\${${index}|true,false|}}}`
    } else {
      return `\${${index}:${String(defaultValue).replace(/['"]/g, '')}}`
    }
  }

  private isDefaultValueValid(defaultValue: any) {
    return defaultValue !== undefined && defaultValue !== ''
  }

  // 渲染组件名
  renderTag(tag: TagItem, sortText: string) {
    const { component, markdown } = tag
    const tagItem = new CompletionItem(
      component.name,
      CompletionItemKind.Module
    )
    const { attrQuote } = this
    const allAttrs = component.attrs || []
    const attrsFiltered = allAttrs
      .filter((item) => item.required)
      .map(
        (item, index) =>
          ` ${item.name}=${attrQuote}${this.setDefault(
            index + 1,
            item.defaultValue
          )}${attrQuote}`
      )
    let extraSpace = ''
    // 如果自动补全中没有属性，并且此组件有额外属性，则触发自动属性补全
    if (!attrsFiltered.length && allAttrs.length) {
      tagItem.command = autoSuggestCommand()
      extraSpace = ' '
    }
    console.log('attrsFiltered', attrsFiltered)
    const attrsNumber = attrsFiltered.length + 1
    const snippet = `${component.name}${attrsFiltered.join(
      ''
    )}${extraSpace}\${${attrsNumber}}>\${${attrsNumber + 1}}</${
      component.name
    }>\${0}`
    tagItem.insertText = new SnippetString(snippet)
    tagItem.documentation = new MarkdownString(markdown)
    tagItem.sortText = sortText
    return tagItem
  }

  renderTagAttr(tagAttr: any, sortText: string, kind?: CompletionItemKind) {
    let a = tagAttr.attr
    let item = new CompletionItem(
      a.name,
      kind === undefined ? CompletionItemKind.Field : kind
    )
    let defaultValue = a.defaultValue
    if (!this.isDefaultValueValid(defaultValue)) {
      defaultValue = a.enum && a.enum[0].value
    }

    let { attrQuote } = this

    if (a.boolean) {
      item.insertText = new SnippetString(
        defaultValue === 'false' ? `${a.name}=false` : a.name
      )
    } else {
      let value = a.addBrace ? '{{${1}}}' : this.setDefault(1, defaultValue)

      // 是否有可选值，如果有可选值则触发命令的自动补全
      let values = a.enum
        ? a.enum
        : a.subAttrs
        ? a.subAttrs.map((sa: any) => ({ value: sa.equal }))
        : []
      if (values.length) {
        value = '${1}'
        item.command = autoSuggestCommand()
      }

      item.insertText = new SnippetString(
        `${a.name}=${attrQuote}${value}${attrQuote}$0`
      )
    }

    item.documentation = new MarkdownString(tagAttr.markdown)
    item.sortText = sortText

    if (a.name === 'class') item.command = autoSuggestCommand()

    return item
  }

  // 样式名自动补全
  // autoCompleteClassNames(doc: TextDocument, existsClassNames: string[]) {
  //   let items: CompletionItem[] = []
  //   let stylefiles = getClass(doc, this.config)
  //   let root = getRoot(doc)

  //   stylefiles.forEach((stylefile, sfi) => {
  //     stylefile.styles.forEach(sty => {
  //       if (!existsClassNames.includes(sty.name)) {
  //         existsClassNames.push(sty.name)
  //         let i = new CompletionItem(sty.name)
  //         i.kind = CompletionItemKind.Variable
  //         i.detail = root ? path.relative(root, stylefile.file) : path.basename(stylefile.file)
  //         i.sortText = 'style' + sfi
  //         i.documentation = new MarkdownString(sty.doc)
  //         items.push(i)
  //       }
  //     })
  //   })

  //   return items
  // }

  // 组件名称自动补全
  createComponentSnippetItems(
    document: TextDocument,
    position: Position,
    prefix?: string
  ) {
    const componentInfos = autoCompleteTagName(components)
    console.log('componentInfos', componentInfos)
    const filter = (key: string) =>
      key && (!prefix || prefix.split('').every((c) => key.includes(c)))
    const filterComponent = (t: TagItem) => filter(t.component.name)
    const tags = componentInfos
      .filter(filterComponent)
      .map((tag) => this.renderTag(tag, 'c'))
    if (prefix) {
      tags.forEach((tag) => {
        tag.range = new Range(
          new Position(position.line, position.character - prefix.length),
          position
        )
      })
    }
    console.log('paki 99999', tags)
    return tags
  }

  // 组件属性自动补全
  createComponentAttributeSnippetItems(
    document: TextDocument,
    position: Position
  ) {
    const tag = getWxmlTag(document, position)
    if (!tag) return []
    if (tag.isOnTagName)
      return this.createComponentSnippetItems(document, position, tag.name)
    console.log('createComponentAttributeSnippetItems')
    if (tag.isOnAttrValue && tag.attrName) {
      const attrValue = tag.attrs[tag.attrName]
      if (tag.attrName === 'class' || /^[\w\d-]+-class/.test(tag.attrName)) {
        return []
      } else if (typeof attrValue === 'string') {
        if (attrValue.trim() === '') {
          const values = autoCompleteTagAttrValue(
            tag.name,
            tag.attrName,
            components
          )
          if (!values.length) return []
          let range = document.getWordRangeAtPosition(position, /['"]\s*['"]/)
          if (range) {
            range = new Range(
              new Position(range.start.line, range.start.character + 1),
              new Position(range.end.line, range.end.character - 1)
            )
          }
          return values.map((v) => {
            let it = new CompletionItem(v.value, CompletionItemKind.Value)
            it.documentation = new MarkdownString(v.markdown)
            it.range = range
            return it
          })
        }
      }

      return []
    } else {
      let res = autoCompleteTagAttr(tag.name, tag.attrs, components)
      let { natives } = res
      return [...natives.map((a) => this.renderTagAttr(a, 'a'))]
    }
    return []
  }

  // 闭合标签
  createCloseTagCompletionItem(document: TextDocument, position: Position) {
    const text = document.getText(new Range(new Position(0, 0), position))
    if (text.length < 2 || text.substr(text.length - 2) !== '</') {
      return []
    }
    const closeTag = getCloseTag(text)
    if (closeTag) {
      const completionItem = new CompletionItem(closeTag)
      completionItem.kind = CompletionItemKind.Property
      completionItem.insertText = closeTag

      const nextPos = new Position(position.line, position.character + 1)
      if (getLastChar(document, nextPos) === '>') {
        completionItem.range = new Range(position, nextPos)
        completionItem.label = closeTag.substr(0, closeTag.length - 1)
      }
      return [completionItem]
    }

    return []
  }
}

function autoSuggestCommand() {
  return {
    command: 'editor.action.triggerSuggest',
    title: 'triggerSuggest',
  }
}

import { TextDocument, Position, Range, window, workspace } from 'vscode'

// 获取当前最后一个字符
export function getLastChar(document: TextDocument, position: Position) {
  return document.getText(
    new Range(new Position(position.line, position.character - 1), position)
  )
}

export function getCloseTag(text: string, excludedTags: string[] = []): string {
  // 过滤变量/和值中`<``>`
  text = text.replace(/"[^"]*"|'[^']*'|\{\{[^\}]*?\}\}/g, '')
  // const regex = /<(\/?[\w\d-]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?>/g
  const regex = /<(\/?[\w\d-]+)[^<>]*\s?>/g // 简化正则提高性能

  let result = null
  const stack = []
  // tslint:disable-next-line: no-conditional-assignment
  while ((result = regex.exec(text))) {
    if (!result[1] || result[0].endsWith('/>')) {
      // 自闭标签
      continue
    }
    const isStartTag = result[1].substr(0, 1) !== '/'
    const tag = isStartTag ? result[1] : result[1].substr(1)
    if (!excludedTags.includes(tag.toLowerCase())) {
      if (isStartTag) {
        stack.push(tag)
      } else if (stack.length > 0) {
        const lastTag = stack[stack.length - 1]
        if (lastTag === tag) {
          stack.pop()
        }
      }
    }
  }
  if (stack.length > 0) {
    const closeTag = stack[stack.length - 1]
    if (text.substr(text.length - 2) === '</') {
      return closeTag + '>'
    }
    if (text.substr(text.length - 1) === '<') {
      return '/' + closeTag + '>'
    }
    return '</' + closeTag + '>'
  } else {
    return ''
  }
}

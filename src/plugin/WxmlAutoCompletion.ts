import {
  Position,
  CompletionItemProvider,
  TextDocument,
  CompletionItem,
  CompletionContext,
  CancellationToken,
} from 'vscode'
import { getLastChar } from '../lib/helper'
import AutoCompletion from './AutoCompletion'

class WxmlAutoCompletion
  extends AutoCompletion
  implements CompletionItemProvider
{
  provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
    context: CompletionContext
  ): CompletionItem[] {
    if (token.isCancellationRequested) {
      return []
    }

    const char = context.triggerCharacter || getLastChar(document, position)

    switch (char) {
      case '<':
        return this.createComponentSnippetItems(document, position)
      case '\n': // 换行
      /// @ts-ignore
      case ' ': // 空格
        // 如果后面紧跟字母数字或_不触发自动提示
        // (常用于手动调整缩进位置)
        if (
          /[\w\d\$_]/.test(
            getLastChar(
              document,
              new Position(position.line, position.character + 1)
            )
          )
        ) {
          return []
        }
      case '"':
      case "'":
        return this.createComponentAttributeSnippetItems(document, position)
      case ':': // 绑定变量 （也可以是原生小程序的控制语句或事件，如 wx:for, bind:tap）
      case '@': // 绑定事件
      case '-': // v-if
      case '.': // 变量或事件的修饰符
        return []
      case '/': // 闭合标签
        return this.createCloseTagCompletionItem(document, position)
      default:
        if (char >= 'a' && char <= 'z') {
          // 输入属性时自动提示
          return this.createComponentAttributeSnippetItems(document, position)
        }
        return [] as any
    }
  }
}

export default WxmlAutoCompletion

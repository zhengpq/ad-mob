 export interface ComponentAttr {
  name: string
  type: Array<string> | string
  description?: string
  defaultValue?: string
  required?: boolean
  enum?: any[]
}

export interface ComponentAttrEnum {
  value: string
  description?: string
}

export interface ComponentAttrValue {
  value: string
  description?: string
}
export interface AdComponent {
  name: string
  tips?: Array<string>
  description?: string
  tutorial?: string
  attrs: Array<ComponentAttr>
}

export interface TagItem {
  component: AdComponent
  markdown: string
}

const components: Array<AdComponent> = [
  {
    name: 'ad-avatar',
    description: '头像组件',
    tutorial: 'http://ad-mob.woa.com/src-components-action-sheet-action-sheet',
    attrs: [
      {
        name: 'src',
        type: ['string', 'function'],
        description: '头像链接',
        defaultValue: '',
      },
      {
        name: 'bind:onChange',
        type: 'function',
        description: '之变化的回调',
        defaultValue: '',
      },
      {
        name: 'size',
        type: 'string',
        description: '尺寸',
        defaultValue: 'medium',
        enum: [
          {
            value: 'small',
            description: '小尺寸，18px * 18px'
          },
          {
            value: 'medium',
            description: '中尺寸，24px * 24px'
          },
          {
            value: 'large',
            description: '大尺寸，36px * 36px'
          },
        ]
      },
    ],
  },
]

export default components;

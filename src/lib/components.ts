 export interface ComponentAttr {
  name: string
  type: Array<string> | string
  desc?: string
  defaultValue?: string
  required?: boolean
  enum?: any[]
}

export interface ComponentAttrEnum {
  value: string
  desc?: string
}

export interface ComponentAttrValue {
  value: string
  desc?: string
}
export interface AdComponent {
  name: string
  tips?: Array<string>
  desc?: string
  attrs: Array<ComponentAttr>
}

export interface TagItem {
  component: AdComponent
  markdown: string
}

const components: Array<AdComponent> = [
  {
    name: 'ad-avatar',
    desc: '头像组件',
    attrs: [
      {
        name: 'src',
        type: 'string',
        desc: '头像链接',
        defaultValue: '',
      },
      {
        name: 'bind:onChange',
        type: 'function',
        desc: '之变化的回调',
        defaultValue: '',
      },
      {
        name: 'size',
        type: 'string',
        desc: '尺寸',
        defaultValue: 'medium',
        enum: [
          {
            value: 'small',
            desc: '小尺寸，18px * 18px'
          },
          {
            value: 'medium',
            desc: '中尺寸，24px * 24px'
          },
          {
            value: 'large',
            desc: '大尺寸，36px * 36px'
          },
        ]
      },
    ],
  },
]

export default components;

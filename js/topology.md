# topoloy

[git地址](https://github.com/byai/topology#readme)

## 前言

前段时间重构了下面这样一个页面（产品页面不方便截图）：

![](https://user-gold-cdn.xitu.io/2019/6/28/16b9d26bb30cd830?w=545&h=311&f=png&s=8720)

类似于拓扑图的配置，原来是使用[go.js](https://gojs.net/latest/index.html)实现的，类似的库还有[antv g6](https://antv.alipay.com/zh-cn/g6/3.x/index.html)。重构主要是为了提高代码质量，降低维护成本，产品上需要更强的定制化能力（对付产品经理的变态需求），所以经过一番研究之后，最后决定放弃使用现成的库。原因如下：

1. 维护成本高：类似的库（antv/g6, go.js）都是基于canvas实现,也都大同小异的定义了一套组件，有一定的学习成本，同时基于这样的库写出来的代码都相对复杂；
2. 灵活性差：因为是canvas实现，元素一般需要指定尺寸，所以在一些需要元素大小自适应的地方并没有DOM元素好实现；
3. 定制化能力差。只能使用库里定义的api和事件，遇到一些比较极端的需求时无能为力。

当然，以上两个库还是相当强大的，不过基于这些原因，自己基于（DOM + SVG）撸一个拓扑图配置的工具库[topology-byfe](https://www.npmjs.com/package/topology-byfe)

## demo演示
### 源代码
```typescript
import React from 'react';
import { Topology, topologyWrapper, TemplateWrapper } from 'topology-byfe';
import { ITopologyNode, ITopologyData, IWrapperOptions } from 'topology-byfe/lib/declare';
import './index.less';

interface FlowState {
    data: ITopologyData;
}
class Flow extends React.Component<{}, FlowState> {
    state: FlowState = {
        data: { lines: [], nodes: [] },
    };

    generatorNodeData = (isBig: boolean) => ({
        id: `${Date.now()}`,
        name: isBig ? '宽节点' : '窄节点',
        content: isBig ? '这是一个宽节点' : '这是一个窄节点',
        branches: isBig ? ['锚点1', '锚点2', '锚点3'] : ['锚点1'],
    });

    handleSelect = (data: ITopologyData) => {
        console.log(data);
    }

    renderTreeNode = (data: ITopologyNode, { anchorDecorator }: IWrapperOptions) => {
        const {
            name = '',
            content = '',
            branches = [],
        } = data;
        return (
            <div className="topology-node">
                <div className="node-header">{name}</div>
                <p className="node-content">{content}</p>
                {branches.length > 0 && (
                    <div className="flow-node-branches-wrapper">
                        {branches.map(
                            (item: string, index: number) => anchorDecorator({
                                anchorId: `${index}`,
                            })(<div className="flow-node-branch">{item}</div>),
                        )}
                    </div>
                )}
            </div>
        );
    };

    onChange = (data: ITopologyData, type: string) => {
        this.setState({ data });
        console.log('change type:', type);
    };

    render() {
        const { data } = this.state;
        return (
            <div className="topology">
                <div className="topology-templates">
                    <TemplateWrapper generator={() => this.generatorNodeData(true)}>
                        <div className="topology-templates-item">宽节点</div>
                    </TemplateWrapper>
                    <TemplateWrapper generator={() => this.generatorNodeData(false)}>
                        <div className="topology-templates-item">窄节点</div>
                    </TemplateWrapper>
                </div>
                <div style={{ width: '100%', height: 800 }}>
                    <Topology
                        data={data}
                        autoLayout
                        onChange={this.onChange}
                        onSelect={this.handleSelect}
                        renderTreeNode={this.renderTreeNode}
                    />
                </div>
            </div>
        );
    }
}

export default topologyWrapper(Flow);

```

### 效果图

![](https://user-gold-cdn.xitu.io/2019/6/28/16b9e154bbfc45a6?w=800&h=563&f=gif&s=1756597)

可以看到，包里只提供了极少的api，文档几分钟就能看完，之所以少，是因为库只负责将节点放到正确的位置，连上线就好了，其他的“概不负责”，修改样式可以在你的div上加个class，添加事件就再上个onXXX，想做啥做啥。

## 为什么选择DOM + SVG？

最主要的原因就是为了“简单”！对于拓扑图这样
的场景，画一个简单的节点，用DOM实现只需要简单的几行代码，用canvas的话就要写一大堆了，别人来看估计就是“一大坨”了。同时相对于需要先学习一套组件，然后用那些“奇奇怪怪”的api去写交互和样式，直接上手就开始撸自己最熟悉的div + css岂不是很开心？对于开发而言，调试DOM能够看到每一个元素的细节，而canvas就无能为力了。

## 如何使用

核心部分代码：
```tsx
 <Topology
    data={data}
    autoLayout
    onChange={this.onChange}
    onSelect={this.handleSelect}
    renderTreeNode={this.renderTreeNode}
 />
```

### data

```typescript
data = {
    nodes: [
        { id: '1', position: { x: 0, y: 0 } },
        { id: '2', position: { x: 100, y: 100 } }
    ],
    lines: [
        { start: '1-0', end: '2' }
    ]
}
```

#### data.nodes

data包含两个属性：nodes和lines，nodes记录节点信息，每个node含有id和position属性，id是必选的，position记录了节点的位置，如果不包含position，点击自动布局，将会自动生成。

#### data.lines

lines记录节点与节点间的关系，start记录起点信息，格式为：'起点id-锚点id'，end记录终点信息，格式为：'终点id'。

### autoLayout

上面的效果图可以看到右下角第二个图标点击自动布局功能，为了方便排版，自动布局会根据树结构计算节点的位置。当初始数据没有position字段时，如果autoLayout为true，组件会自动触发布局功能，相当于点击了自动布局按钮。

### onChange

组件使用类似input或者select，当有新增节点或者连线发生时，触发onChange,onChange带有两个参数，newData和changeType, 整个过程完全受控，你可以在onChange中做一些校验，决定数据是否更新。

### onSelect

当选择节点或者线段时触发，参数selectData格式同data。

### renderTreeNode

renderTreeNode接收两个参数：nodeData, decorators，返回节点的DOM。

```tsx
renderTreeNode = (data: ITopologyNode, { anchorDecorator }) => {
        // name、content、branches都是自定义的字段，通过模板节点生成，详见TemplateWrapper
        const {
            name = '',
            content = '',
            branches = [],
        } = data;
        return (
            <div className="topology-node">
                <div className="node-header">{name}</div>
                <p className="node-content">{content}</p>
                {branches.length > 0 && (
                    <div className="flow-node-branches-wrapper">
                        {branches.map(
                            (item: string, index: number) => anchorDecorator({
                                anchorId: `${index}`,
                            })(<div className="flow-node-branch">{item}</div>),
                        )}
                    </div>
                )}
            </div>
        );
    };
```

#### 锚点，decorators.anchorDecorator

```tsx
anchorDecorator({ anchorId: `${index}` })(
    <div className="flow-node-branch">
        {item}
    </div>
)
```
anchorDecorator是一个装饰器函数，接受一个options，目前只包含一个anchorId属性，即锚点id，如果不传的话，内部会自动生成一个自增id。可以看到，锚点长什么样，放到哪儿完全由你自己决定。

### templateWrapper

```tsx
<div className="topology-templates">
        <TemplateWrapper generator={() => this.generatorNodeData(true)}>
            <div className="topology-templates-item">宽节点</div>
        </TemplateWrapper>
        <TemplateWrapper generator={() => this.generatorNodeData(false)}>
            <div className="topology-templates-item">窄节点</div>
        </TemplateWrapper>
</div>
```

通过templateWrapper包装生成一个模板节点，接收一个generator函数，当添加节点时，会调用这个函数，生成节点的初始数据，里面包含什么值由你决定，但必须包含一个唯一的id值。


### topologyWrapper

```tsx
export default topologyWrapper(Flow);
```
包含拖拽部分的最上层组件必须要用topologyWrapper包一下，这是因为使用了react-dnd需要设置backend，这里只是做了一个简单的导出，方便使用:

```tsx
export const topologyWrapper = DragDropContext(HTML5BackEnd);
```

## 总结

从需求出发来看，需要拥有更好的定制化能力和灵活性，从重构的角度来看，需要让代码更简单明了。go.js功能十分强大，但对于拓扑图这种相对较简单的场景而言，并不需要那么多复杂的能力，反而可能出现上面说的问题，所有canvas的实现应该都会有类似的问题。所以充分利用DOM的能力，在能实现需求的情况下，本库或许是更好的选择。

## 最后

项目只实现了简单的功能，存在不足欢迎大佬们提issue,pr。



## TODO

- [ ] 支持缩放
- [ ] 性能优化


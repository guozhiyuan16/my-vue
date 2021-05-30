export function patch(oldVnode,vnode){ // oldVnode 是一个真实的元素
    if(!oldVnode){
        return createElm(vnode); // 根据虚拟节点创建元素
    }
    const isRealElement = oldVnode.nodeType;
    if(isRealElement){
        // 初次渲染
        const oldElm = oldVnode; // id="app"
        const parentElm = oldElm.parentNode;// body
        let el = createElm(vnode); // 根据虚拟节点创建真实的节点
        parentElm.insertBefore(el,oldElm.nextSibling); // 将创建的节点插到原有的节点的下一个
        parentElm.removeChild(oldElm);// 删除原有的节点

        return el // vm.$el
    }else{
        // diff算法
    }
}

function createComponent(vnode){
    let i = vnode.data;
    if((i = i.hook) && (i = i.init)){
        i(vnode);// 调用组件的 init 初始化方法
    }
    if(vnode.componentInstance){ // 如果虚拟节点上有组件的实例说明当前这个vnode是组件
        return true;
    }
    return false;
}

function createElm(vnode){
    let { tag, children, key, data, text, vm  } = vnode;

    if(typeof tag === 'string'){ // 两种可能 可能是一个组件
        // 可能是组件，如果是组件 就直接根据组件创建出组件的真实节点
        if(createComponent(vnode)){
            // 如果返回true 说明这个虚拟节点是组件

            // 如果是组件， 就讲组件渲染后的真实元素给我

            return vnode.componentInstance.$el;
        }

        vnode.el = document.createElement(tag); // 用vue的指令时 可以通过vnode拿到真实的dom
        updatePropertise(vnode);
        children.forEach(child=>{
            vnode.el.appendChild(createElm(child))
        })
    }else{
        vnode.el = document.createTextNode(text)
    }

    return vnode.el;
}


function updatePropertise(vnode){
    let newProps = vnode.data || {}; // 属性
    let el = vnode.el;

    for(let key in newProps){
        if(key == 'style'){
            for(let styleName in newProps.style){
                el.style[styleName] = newProps.style[styleName]
            }
        }else if(key === 'class'){
            el.className = newProps.class;
        }else{
            el.setAttribute(key,newProps[key])
        }
    }
}
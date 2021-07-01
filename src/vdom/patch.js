export function patch(oldVnode,vnode){ // oldVnode 是一个真实的元素
    // 1.组件oldVnode是 null (调用了$mount没传参)
    if(!oldVnode){ // 没有olaVode 直接创建 (组件)
        return createElm(vnode); // 根据虚拟节点创建元素
    }

    const isRealElement = oldVnode.nodeType;
    // 2. 初次渲染 oldVnode是一个真实dom
    if(isRealElement){
        const oldElm = oldVnode; // id="app"
        const parentElm = oldElm.parentNode;// body
        let el = createElm(vnode); // 根据虚拟节点创建真实的节点
        parentElm.insertBefore(el,oldElm.nextSibling); // 将创建的节点插到原有的节点的下一个
        parentElm.removeChild(oldElm);// 删除原有的节点

        return el // vm.$el
    }else{
        // 3.diff算法 两个虚拟节点的比对
        // 1）如果两个虚拟节点的标签不一致 那就直接替换
        console.log(oldVnode,vnode)
        if(oldVnode.tag !== vnode.tag){
            return oldVnode.el.parentNode.replaceChild(createElm(vnode),oldVnode.el);   
        }
        // 2) 标签一样但是是两个文本元素 { tag:undefined,text}
        if(!oldVnode.tag){ // 标签相同而且是文本
            if(oldVnode.text !== vnode.text){
               return oldVnode.el.textContent = vnode.text; 
            }
        }
        // 3) 元素相同 复用老节点，并且更新属性
        let el = vnode.el = oldVnode.el; // 复用的是真实节点
        updatePropertise(vnode,oldVnode.data); // 老的属性和新的虚拟节点比对

        // 4) 更新儿子   
        let oldChildren = oldVnode.children || [];
        let newChildren = vnode.children || [];

       
        if(oldVnode.length > 0 && newChildren.length > 0){
            //  A. 老的有儿子新的也有儿子 dom-diff
            updateChildren(el,oldChildren,newChildren)
        }else if(oldChildren.length > 0){
            //  B. 老的有儿子 新的没儿子 => 删除老的儿子
            el.innerHTML = '';
        }else if(newChildren.length > 0){
            //  C. 新的有儿子 老的没儿子 => 在老的节点上增加儿子即可 

            newChildren.forEach(child=>el.appendChild(createElm(child)))
        }
    }
}

// 更新子节点
function updateChildren(parent,oldChildren,newChildren){
    let oldStartIndex = 0; // 老的头索引
    let oldEndIndex = oldChildren.length -1; // 老的尾索引
    let oldStartVnode = oldChildren[0]; // 老的开始节点
    let oldEndVnode = oldChildren[oldEndIndex]; // 老的结束节点

    let newStartIndex = 0; // 新的头索引
    let newEndIndex = newChildren.length -1; // 新的尾索引
    let newStartVnode = newChildren[0]; // 新的开始节点
    let newEndVnode = newChildren[newEndIndex]; // 新的结束节点

}

function updatePropertise(vnode,oldProps = {}){
    let newProps = vnode.data || {}; // 属性
    let el = vnode.el; // 当前的真实元素

    // 1.老的属性 新的没有 删除属性
    for(let key in oldProps){
        if(!newProps[key]){
            el.removeAttribute(key);
        }
    }

    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};
    for(let key in oldStyle){ // 判断样式新老先比对
        if(!newStyle[key]){
            el.style[key] = '';
        }
    }

    // 2. 新的属性老的没有,直接用新的覆盖，不考虑有没有
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

// 根据虚拟节点床架一个虚拟节点对应的真实节点
function createComponent(vnode){
    let i = vnode.data;
    if((i = i.hook) && (i = i.init)){
        i(vnode);// 调用组件的 init 初始化方法
    }
    if(vnode.componentInstance){ // 如果虚拟节点上有组件的实例,说明当前这个vnode是组件
        return true;
    }
    return false;
}

// 根据虚拟节点创建一个真实的元素
export function createElm(vnode){
    let { tag, children, key, data, text, vm  } = vnode;

    if(typeof tag === 'string'){ // 两种可能 可能是一个组件
        // 可能是组件，如果是组件 就直接根据组件创建出组件对应的真实节点
        if(createComponent(vnode)){
            // 如果返回true 说明这个虚拟节点是组件

            // 如果是组件， 就将组件渲染后的真实元素给我

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
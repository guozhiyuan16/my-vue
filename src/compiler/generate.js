

{/* <div id="app" a=1 b=2>
    <span style="color: red;">{{ name }}<a>hello</a></span>
</div> */}

/** 
    _c(
        'div',{id:'app',a:1,b:2},
        _c(
            'span',{style:{color:'red'}}
            ,_s(_v(name)),
            _c(a,{},_v('hello'))
            )
    )
*/

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function genProps(attrs){
    let str = '';
    for(let i = 0 ; i < attrs.length;i++){
        let attr = attrs[i];
        if(attr.name === 'style'){ // 样式需要特殊处理 （两个中括号）
            let obj = {};
            attr.value.split(';').forEach(item=>{
                let [key,value] = item.split(':');
                obj[key] = value;
            })
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}

function gen(node){ // 区分元素还是文本
    if(node.type == 1){
        return generate(node)
    }else{
        // 文本节点   _c 来处理
        // {{}} 普通文本    {{aa}} aa {{aa}} 混合文本
        let text = node.text;
        // 带有 {{}}
        if(defaultTagRE.test(text)){ // {{ name }} aa {{age}} bb===> _v(_s(name)+'aa' + _s(age) + 'bb') 
            let tokens = [];
            let match ;
            let index ;
            let lastIndex = defaultTagRE.lastIndex = 0 ; // 每次匹配记得重置为0 
            while(match = defaultTagRE.exec(text)){
                index = match.index;
                if(index > lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex,index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length;
            }
            if(lastIndex < text.length){ // 最后一段记得放进去
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }else{
            return `_v(${JSON.stringify(text)})`
        }

    }
}

function genChildren(el){
    const children = el.children;
    if(children){
        return children.map(child=>gen(child)).join(',')
    }
    return false
}

// 遍历树 将树拼接成字符串
export function generate(el){ 

    let children = genChildren(el)

    let code = `_c("${el.tag}",${
        el.attrs.length? genProps(el.attrs):'undefined'
    }${
        children? ','+ children : ''
    })`

    return code;
}
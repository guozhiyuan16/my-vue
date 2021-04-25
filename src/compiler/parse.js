const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
// ?:匹配不捕获
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // </my:xx>
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
//                aa  = " xxx "   | ' xxx '  |   xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的    aaa="aaa"  a='aaa'   a=aaa
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >    >   <div></div>  <br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

// compileToFunctions(`<div id="app" a='1' b = 2>
//     <div a=1 b=2>
//         <span>{{ name }}</span>
//     </div>
// </div>`)


export function parseHtml(html){
    // 这种ast语法树结构是自己定义的
    function createASTElement(tag,attrs){ // vue3支持多个根元素(外层加了空元素) vue2中值有一个
        return {
            tag,
            type:1,
            children:[],
            attrs,
            parent:null
        }
    }
    let root = null;
    let currentParent;
    let stack = [];

    // 通过这三个方法解析成ast 树
    function start(tagName,attrs){
        let element = createASTElement(tagName,attrs);
        console.log(element)
        if(!root){ // 根元素
            root = element
        }
        currentParent = element;   // div div span
        stack.push(element);
    }

    function end(tagName){
        let element = stack.pop();
        currentParent = stack[stack.length - 1];
        if(currentParent){
            element.parent = currentParent;
            currentParent.children.push(element);
        }
    }

    function chars(text){
        text = text.replace(/\s/g,'');
        if(text){
            currentParent.children.push({
                type:3,
                text
            })
        }
    }

    function advance(n){
        html =  html.substring(n)
    }

    function parseStartTag(){
        let start = html.match(startTagOpen);
        if(start){
            const match = {
                tagName : start[1],
                attrs : []
            }

            advance(start[0].length); // 删除开始标签

            // 如果直接闭合了标签 说明没有属性
            let end, attr;
            // 循环剩余的html 找到相关的 属性放到 attrs 中 , 直到找到结束标签
            // 属性有可能有多个
            // 只要不是结束标签 并且 一直能属性匹配成功就一直匹配
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5]})
                // 匹配玩去掉已经匹配的那部分
                advance(attr[0].length)
            }

            // > 删除匹配到的结束标签
            if(end){
                advance(end[0].length);
                return match
            }
        }
        
    }

    while (html){ // 只要html不为空字符串就一直解析
        let textEnd = html.indexOf('<');
        if(textEnd == 0 ){ // 肯定是标签
            const startTagMatch = parseStartTag();
            if ( startTagMatch ){
                start( startTagMatch.tagName,startTagMatch.attrs )
                continue;
            }

            const endTagMatch = html. match(endTag);
            if(endTagMatch){
                advance(endTagMatch[0].length);
                end(endTagMatch[1])
                continue;
            }
        }
        let text;
        if(textEnd > 0){ // 是处理文本
            text = html.substring(0,textEnd); 
        }
        if(text){
            advance(text.length);
            chars(text);
        }
    }

    return root;
}
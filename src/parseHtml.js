const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
// ?:匹配不捕获
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // </my:xx>
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
//                aa  = " xxx "   | ' xxx '  |   xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的    aaa="aaa"  a='aaa'   a=aaa
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >    >   <div></div>  <br/>

// compileToFunctions(`<div id="app" a='1' b = 2>
//     <div a=1 b=2>
//         <span>{{ name }}</span>
//     </div>
// </div>`)


// 本质就是循环匹配html，匹配一段删除一段
function parseHtml(html) {

    let root = null;
    let currentParent;
    let stack = [];

    function createASTElement(tag,attrs){
        return {
            tag,
            type:1,
            children:[],
            attrs,
            parent:null
        }
    }

    function start(tagName,attrs) {
        let element = createASTElement(tagName,attrs);
        if(!root){ // 首次根节点肯定没有
            root = element;
        }
        currentParent = element;
        stack.push(element);
    }

    function end(tagName){
        let element = stack.pop();
        currentParent = stack[stack.length -1 ];
        if(currentParent){
            element.parent = currentParent;
            currentParent.children.push(element);
        }
    }

    function chars(text) {
        text = text.replace(/\s/g,'');
        if(text){
            currentParent.children.push({
                type:3,
                text
            })
        }
    }

    function  advance(n) {
        console.log(html)
        html = html.substring(n);
    }
    
    function parseStartTag() {
        let start = html.match(startTagOpen);
        if(start){ // 匹配到了
            const match = {
                tagName: start[1],
                attrs:[]
            }

            advance(start[0].length); 
            let end,attr;
            // 没有匹配到技术标签 并且 匹配到了元素标签才继续匹配
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5]})
                advance(attr[0].length); // 删除掉匹配的部分
            }

            // 删除匹配到的结束标签
            if(end){
                advance(end[0].length);
                return match;
            }
        }
    }

    while(html){
        let textEnd = html.indexOf('<');
        if(textEnd == 0 ){ // 标签
            let startTagMatch = parseStartTag();
            if (startTagMatch){
                start( startTagMatch.tagName , startTagMatch.attrs) ; // 添加父子关系
                continue;
            }
            let endTagMatch = html.match(startTagClose);
            if(endTagMatch){
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }

        }
        let text;
        if(textEnd>0){ // 文本或者空白占位符
            text = html.substring(0,textEnd);
        }
        if(text){
            advance(text.length);
            chars(text);
        }
    }

    return root;
}

parseHtml(
    `<div id="app" a=1 b=2 style="color: red;">
        <span style="color: red;">{{ name }} hh {{ age }} pp<a>hello</a></span>
    </div>`
)

// {
//     attrs: [{
//             name: "id",
//             value: "app"
//         },
//         {
//             name: "a",
//             value: "1"
//         }
//     ],
//     children: [{
//         attrs:[
//             {
//                 name:"style",value:{color:'red'}
//             }
//         ]
//         children:[
//             {
//                 type:3,
//                 text:"{{name}}hh{{age}}pp"
//             }
//         ],
//         tag: "span",
//         type: 1,
//     }],
//     parent: null,
//     tag: "div",
//     type: 1
// }
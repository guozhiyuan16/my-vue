
import { parseHtml } from './parse';
import { generate } from './generate'

export function compileToFunctions(template){
    // 生成 ast 语法树
    let ast =  parseHtml(template);
    
    // ast 生成 虚拟dom
    let code = generate(ast);
    
    // 生成render 函数
    let render = `with(this){return ${code}}`
    
    let fn = new Function(render); // 把一个字符串变成一个函数
    
    return fn
}
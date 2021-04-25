
import { parseHtml } from './parse';

export function compileToFunctions(template){
    let ast =  parseHtml(template);

    console.log(ast)
    
}
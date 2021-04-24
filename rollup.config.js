import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-server'
export default {
    input:"./src/index.js",
    output:{
        format:'umd', // 支持amd commonjs window.Vue
        file:"./dist/vue.js",
        name:"Vue",
        sourcemap:true
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        }),
        serve({
            open:true,
            port:3000,
            contentBase:'',
            openPage:'/index.html'
        })
    ]
}
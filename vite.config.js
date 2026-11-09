const {defineConfig}=require('vite');
const fs=require('node:fs/promises');
const path=require('node:path');
module.exports=defineConfig(({command})=>({
  publicDir:command==='serve'?'public':false,
  plugins:[{
    name:'curated-exhibition-assets',
    apply:'build',
    async closeBundle(){
      const root=__dirname;
      for(const relative of ['fonts','flor.svg','cappie/cappie-radiance.glb','cappie/cover.png','cappie/portrait.webp','emotions']){
        const target=path.resolve(root,'dist',relative);
        if(!target.startsWith(path.resolve(root,'dist')+path.sep))throw new Error('Invalid asset destination');
        await fs.mkdir(path.dirname(target),{recursive:true});
        await fs.cp(path.resolve(root,'public',relative),target,{recursive:true});
      }
    }
  }],
  build:{rolldownOptions:{input:Object.fromEntries(['index','coleccion','felicidad','miedo','tristeza','enojo','asco','metodologia','fuentes'].map(name=>[name,path.resolve(__dirname,name+'.html')])),output:{codeSplitting:{groups:[{name:'three',test:/node_modules[\\/]three/}]}}}}
}));

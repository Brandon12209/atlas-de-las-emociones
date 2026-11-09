const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'./tests',workers:1,reporter:[['list'],['json',{outputFile:'evidence/test-results.json'}]],use:{channel:'chrome',headless:true,viewport:{width:1440,height:1000},launchOptions:{args:['--enable-webgl','--ignore-gpu-blocklist']}}});

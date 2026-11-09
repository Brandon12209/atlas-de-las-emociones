const {spawnSync}=require('node:child_process');
const result=spawnSync(process.execPath,[require.resolve('@playwright/test/cli'),'test'],{stdio:'inherit',env:{...process.env,ATLAS_TEST_URL:'http://127.0.0.1:4173'}});
process.exitCode=result.status??1;

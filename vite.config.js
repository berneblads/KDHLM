import { defineConfig, loadEnv } from 'vite';
import { Readable } from 'node:stream';
import { createContactHandler } from './server/contact.js';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateArticlePages } from './scripts/generate-articles.js';
import { seoPages } from './scripts/seo-pages.js';
import { prepareArticleImages } from './scripts/prepare-article-images.js';
await prepareArticleImages();
const articleFiles=await generateArticlePages();

// Explicit local adapters for the public directory and media feeds.
function directoryMiddleware(server) {
  const localEnv=loadEnv(server.config.mode,server.config.envDir,'');
  const contact=createContactHandler({env:{RESEND_API_KEY:process.env.RESEND_API_KEY||localEnv.RESEND_API_KEY,CONTACT_FROM_EMAIL:process.env.CONTACT_FROM_EMAIL||localEnv.CONTACT_FROM_EMAIL}});
  server.middlewares.use('/api/contact',async(req,res,next)=>{
    if(req.url.split('?')[0]!=='/' && req.url.split('?')[0]!=='')return next();
    try{
      const headers=new Headers();
      for(const [name,value] of Object.entries(req.headers))if(value!==undefined)headers.set(name,Array.isArray(value)?value.join(','):value);
      headers.set('x-vercel-forwarded-for',req.socket.remoteAddress||'local');
      const request=new Request(`http://${req.headers.host}/api/contact`,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});
      const response=await contact(request);res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text());
    }catch{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end('{"ok":false,"code":"unavailable"}');}
  });
  server.middlewares.use('/api/representatives',async(req,res,next)=>{
    if(req.url.split('?')[0]!=='/' && req.url.split('?')[0]!=='')return next();
    if(req.method!=='GET'){res.statusCode=405;res.end();return;}
    try{const {GET}=await import('./api/representatives.js');const response=await GET();res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text());}
    catch{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end('{"available":false}');}
  });
  server.middlewares.use('/api/media',async(req,res,next)=>{
    if(req.url.split('?')[0]!=='/' && req.url.split('?')[0]!=='')return next();
    if(req.method!=='GET'){res.statusCode=405;res.end();return;}
    try{const {GET}=await import('./api/media.js');const response=await GET();res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text());}
    catch{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end('{"available":false,"articles":[]}');}
  });
}

export default defineConfig({
  appType:'mpa',
  plugins:[seoPages(),{name:'public-kd-directory',configureServer:directoryMiddleware,configurePreviewServer:directoryMiddleware},{name:'static-articles',async handleHotUpdate(ctx){if(['content.js','debate-articles.js'].some(name=>resolve(ctx.file)===fileURLToPath(new URL('./'+name,import.meta.url)))){await generateArticlePages();ctx.server.ws.send({type:'full-reload'});}}}],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: { input: {...Object.fromEntries(readdirSync(fileURLToPath(new URL('.',import.meta.url))).filter(name=>name.endsWith('.html')).map(name=>[name.replace('.html',''),fileURLToPath(new URL(name,import.meta.url))])),...Object.fromEntries(articleFiles.map((file,i)=>['article-'+i,file]))} },
  },
});

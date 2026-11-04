// IndexNow notifications only for public URLs that have just been deployed.
// The key file is public by design: it proves control over the site hostname.
import { readFileSync } from 'node:fs';
const host = 'looxmediagrab.com';
const origin = 'https://' + host;
const key = 'fe2ea00c0096d8a5a46cb4189608111a';
const keyUrl = origin + '/' + key + '.txt';
const sitemap = readFileSync('sitemap.xml', 'utf8');
const publicUrls = [...sitemap.matchAll(/<loc>(https:\/\/looxmediagrab\.com\/[^<]*)<\/loc>/g)].map(m => m[1]);
if (!publicUrls.length) throw Error('No public sitemap URLs to submit');
const api = 'https://api.github.com/repos/' + process.env.GITHUB_REPOSITORY + '/commits/' + process.env.DEPLOY_SHA;
const all = process.env.FORCE_ALL === 'true';
let urls = [];
if (all) {
  urls = publicUrls;
} else {
  const resp = await fetch(api, {headers: {Authorization:'Bearer ' + process.env.GITHUB_TOKEN, Accept:'application/vnd.github+json', 'User-Agent':'loox-indexnow'}});
  if (!resp.ok) throw Error('Could not inspect published commit: HTTP '+resp.status);
  const commit = await resp.json();
  const changed = (commit.files || []).map(f=>f.filename);
  // Initial install: after the key is published, notify about the sitemap once.
  if (changed.includes(key + '.txt')) {
    urls = publicUrls;
  } else {
    const paths = changed.filter(p => !p.includes('/') && p.endsWith('.html') && p !== '404.html' && p !== 'admin.html');
    urls = paths.map(p => origin + (p === 'index.html' ? '/' : '/' + p));
  }
}
urls = [...new Set(urls)].filter(u=>new URL(u).hostname === host);
if (!urls.length) {
  console.log('No public HTML pages changed; skipping IndexNow');
  process.exit(0);
}
// Never submit until GitHub Pages has published the verification file.
let verified = false;
for (let attempt=0;attempt<18;attempt++) {
  try {
    const r=await fetch(keyUrl,{cache:'no-store'});
    if (r.ok && (await r.text()).trim() === key) {verified=true;break;}
  } catch {}
  await new Promise(resolve=>setTimeout(resolve,10000));
}
if (!verified) throw Error('Public IndexNow key file not available at '+keyUrl);
const payload={host,key,keyLocation:keyUrl,urlList:urls};
const response=await fetch('https://api.indexnow.org/indexnow',{
  method:'POST', headers:{'Content-Type':'application/json; charset=utf-8'}, body:JSON.stringify(payload), signal:AbortSignal.timeout(30000)
});
const details=(await response.text()).slice(0,400);
console.log('Submitted '+urls.length+' changed URL(s) to IndexNow. HTTP '+response.status+' '+details);
if (![200,202].includes(response.status)) throw Error('IndexNow rejected request with HTTP '+response.status);

(function(){
const API='https://loox-backend-4rkg.vercel.app';
const form=document.querySelector('[data-download-form],[data-search-form],[data-identify-form]');if(!form)return;
const output=document.querySelector('[data-results]'),status=document.querySelector('[data-status]'),button=form.querySelector('button[type=submit]');
const safe=(v)=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:null}catch{return null}};
const text=(tag,value,classes)=>{const el=document.createElement(tag);if(classes)el.className=classes;el.textContent=String(value||'');return el};
function setState(message,loading){status.textContent=message||'';button.disabled=!!loading;button.setAttribute('aria-busy',String(!!loading))}
async function request(path,payload){const response=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json().catch(()=>({}));if(!response.ok||data.success===false)throw new Error(data.error||'Could not complete your request.');return data}
function link(label,url){const a=text('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function youtubePicker(data){
 const entries=Array.isArray(data.media)?data.media:[];
 const heights=[144,240,360,480,720,1080,1440,2160,4320];
 const byHeight=new Map();
 const parseHeight=m=>{const direct=Number(m.height||m.resolution_height);if(Number.isFinite(direct)&&direct>0)return direct;const q=String(m.quality||m.resolution||m.format_note||'');const match=q.match(/(?:^|\\D)(144|240|360|480|720|1080|1440|2160|4320)p?(?:\\D|$)/i);return match?Number(match[1]):null};
 for(const m of entries){
  const u=safe(m.url||m.download_url||m.downloadUrl||m.video_url);if(!u)continue;
  const type=String(m.type||m.vcodec||'').toLowerCase();
  const ext=String(m.ext||'').toLowerCase();
  if(type==='audio'||type==='audio_only'||type==='none'||m.vcodec==='none'||m.has_video===false||ext==='m4a'||ext==='mp3'||ext==='aac'||ext==='opus')continue;
  const height=parseHeight(m);if(!height||!heights.includes(height))continue;
  const isHls=ext==='m3u8'||/\\.m3u8(?:\\?|$)/i.test(u);
  const score=(isHls?0:10)+(ext==='mp4'?4:0)+(m.acodec&&m.acodec!=='none'?2:0);
  if(!byHeight.has(height)||score>byHeight.get(height).score)byHeight.set(height,{url:u,ext,isHls,score,m});
 }
 if(!byHeight.size)return false;
 const card=document.createElement('article');card.className='loox-quality-card';
 card.appendChild(text('h3','Choose video quality'));
 card.appendChild(text('p','Only resolutions returned for this video are shown. Some high-quality formats may be video-only.','loox-muted'));
 const controls=document.createElement('div');controls.className='loox-quality-controls';
 const select=document.createElement('select');select.className='loox-quality-select';select.setAttribute('aria-label','Available video resolution');
 const label=h=>h===1440?'2K':h===2160?'4K':h===4320?'8K':h+'p';
 [...byHeight.keys()].sort((a,b)=>b-a).forEach(h=>{const o=document.createElement('option');o.value=String(h);o.textContent=label(h)+(byHeight.get(h).ext?' · '+byHeight.get(h).ext.toUpperCase():'');select.appendChild(o)});
 const a=link('Download selected quality',byHeight.get(Number(select.value)).url);a.className='loox-quality-download';a.setAttribute('download','');
 const note=text('p','','loox-quality-note');
 function refresh(){const v=byHeight.get(Number(select.value));a.href=v.url;note.textContent=v.isHls?'Streaming playlist: requires an HLS-capable player.':(v.m.acodec==='none'||v.m.has_audio===false?'Video-only format: audio may need to be merged separately.':'Availability and audio depend on the source.')}
 select.addEventListener('change',refresh);refresh();
 controls.append(select,a);card.append(controls,note);output.appendChild(card);
 return true;
}
function mediaList(data){const entries=Array.isArray(data.media)?data.media:[];const fallback=data.downloadUrl||data.url;const candidates=entries.length?entries:[{url:fallback}];const seen=new Set();let count=0;
for(const m of candidates){const u=safe(m.url||m.download_url||m.downloadUrl||m.video_url);if(!u||seen.has(u))continue;seen.add(u);count++;const a=document.createElement('article');const ext=String(m.ext||'').toLowerCase();const isHls=ext==='m3u8'||/\.m3u8(?:\?|$)/i.test(u);const type=String(m.type||'').toLowerCase();const info=[m.quality||m.height&&(m.height+'p'),ext||(/\.mp4(?:\?|$)/i.test(u)?'MP4':isHls?'HLS':''),type].filter(Boolean).join(' • ');a.appendChild(text('p',info||'Available media file','loox-muted'));
a.appendChild(link(isHls?'Open HLS playlist':'Open or save media',u));
if(isHls)a.appendChild(text('p','This is a streaming playlist, not a ready-to-download MP4. Use an HLS-capable player with appropriate permissions.','loox-muted'));
output.appendChild(a)}
if(!count)output.appendChild(text('p','No accessible media file was returned. Please try a different public link.','loox-muted'));
}
form.addEventListener('submit',async e=>{e.preventDefault();output.replaceChildren();setState('Processing your request…',true);try{
if(form.matches('[data-download-form]')){const url=form.querySelector('input').value.trim();if(!safe(url))throw new Error('Please enter a valid HTTPS media URL.');const data=await request('/api/download',{url,platform:form.dataset.platform,quality:'1080'});if(data.thumbnail&&safe(data.thumbnail)){const img=document.createElement('img');img.src=data.thumbnail;img.loading='lazy';img.alt='Media preview';output.appendChild(img)}if(data.title)output.appendChild(text('h3',data.title));if(form.dataset.platform==='youtube'){if(!youtubePicker(data))mediaList(data)}else mediaList(data);setState('Results ready. Choose a returned media link.',false)}
else if(form.matches('[data-search-form]')){const query=form.querySelector('input').value.trim(),filter=form.querySelector('select').value;const data=await request('/api/youtube-search',{query,filter});for(const r of data.results||[]){const u=safe(r.url);if(!u)continue;const a=document.createElement('article');if(safe(r.thumbnail)){const img=document.createElement('img');img.src=r.thumbnail;img.alt='Video thumbnail';img.loading='lazy';a.appendChild(img)}const h=text('h3',r.title);a.appendChild(h);a.appendChild(text('p',[r.author,r.kind].filter(Boolean).join(' • '),'loox-muted'));a.appendChild(link('Open on YouTube',u));output.appendChild(a)}setState(output.children.length?'Search complete.':'No results found for that query.',false)}
else{const url=form.querySelector('input').value.trim();if(!safe(url))throw new Error('Enter a direct HTTPS URL to a public audio or video file.');const data=await request('/api/song-identify',{url});if(safe(data.coverart)){const img=document.createElement('img');img.src=data.coverart;img.alt='Album artwork';output.appendChild(img)}output.appendChild(text('h3',data.title||'No confirmed title'));for(const k of ['artist','album','label'])if(data[k])output.appendChild(text('p',k[0].toUpperCase()+k.slice(1)+': '+data[k],'loox-muted'));setState(data.title||data.artist?'Possible song match found.':'The service returned no confirmed match.',false)}
}catch(err){setState(err.message||'Request failed. Please try again.',false)}finally{button.disabled=false;button.setAttribute('aria-busy','false')}});
})();
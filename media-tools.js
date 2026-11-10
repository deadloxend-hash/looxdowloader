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
 const parseHeight=m=>{const direct=Number(m.height||m.resolution_height);if(Number.isFinite(direct)&&direct>0)return direct;const q=String(m.quality||m.resolution||m.format_note||'');const match=q.match(/(?:^|\D)(144|240|360|480|720|1080|1440|2160|4320)p?(?:\D|$)/i);return match?Number(match[1]):null};
 for(const m of entries){
  const u=safe(m.download_url||m.downloadUrl||m.url||m.video_url);if(!u)continue;
  const type=String(m.type||m.vcodec||'').toLowerCase();
  const ext=String(m.ext||'').toLowerCase();
  if(type==='audio'||type==='audio_only'||type==='none'||m.vcodec==='none'||m.has_video===false||ext==='m4a'||ext==='mp3'||ext==='aac'||ext==='opus')continue;
  const height=parseHeight(m);if(!height||!heights.includes(height))continue;
  const isHls=ext==='m3u8'||/\\.m3u8(?:\\?|$)/i.test(u);
  const score=(isHls?0:10)+(ext==='mp4'?4:0)+(m.has_audio===true?20:0)+(m.has_audio===false?-10:0);
  if(!byHeight.has(height)||score>byHeight.get(height).score)byHeight.set(height,{url:u,ext,isHls,score,m});
 }
 if(!byHeight.size)return false;
 const card=document.createElement('article');card.className='loox-quality-card';
 card.appendChild(text('h3','Choose video quality'));
 card.appendChild(text('p','Only available resolutions are shown. Downloads use a secure temporary link; some high-quality formats may be video-only.','loox-muted'));
 const controls=document.createElement('div');controls.className='loox-quality-controls';
 const select=document.createElement('select');select.className='loox-quality-select';select.setAttribute('aria-label','Available video resolution');
 const label=h=>h===1440?'2K':h===2160?'4K':h===4320?'8K':h+'p';
 [...byHeight.keys()].sort((a,b)=>b-a).forEach(h=>{const o=document.createElement('option');o.value=String(h);o.textContent=label(h)+(byHeight.get(h).ext?' · '+byHeight.get(h).ext.toUpperCase():'')+(byHeight.get(h).m.has_audio===false?' · Video only':'');select.appendChild(o)});
 const a=link('Download selected quality',byHeight.get(Number(select.value)).url);a.className='loox-quality-download';a.setAttribute('download','');
 const note=text('p','','loox-quality-note');
 function refresh(){const v=byHeight.get(Number(select.value));a.href=v.url;note.textContent=v.isHls?'Streaming playlist: requires an HLS-capable player.':(v.m.has_audio===false?'Video-only stream. No sound; may not play in your phone\'s default player. Use a compatible player or separately merge audio and video.':v.m.has_audio===true?'Contains audio and video according to provider metadata; download availability is not guaranteed.':'Audio and phone playback compatibility have not been verified by the provider.')}
 const playable=[...byHeight.keys()].filter(h=>byHeight.get(h).m.has_audio===true).sort((a,b)=>b-a);if(playable.length)select.value=String(playable[0]);
 select.addEventListener('change',refresh);refresh();
 controls.append(select,a);card.append(controls,note);output.appendChild(card);
 return true;
}
function mediaList(data){
 const entries=Array.isArray(data.media)?data.media:[];
 const fallback=data.downloadUrl||data.url;
 const candidates=entries.length?entries:[{url:fallback}];
 const seen=new Set(),items=[];
 for(const m of candidates){
  const url=safe(m.url||m.download_url||m.downloadUrl||m.video_url);
  if(!url||seen.has(url))continue;seen.add(url);
  const ext=String(m.ext||'').toLowerCase();
  const type=String(m.type||'').toLowerCase();
  const audio=type.includes('audio')||m.vcodec==='none'||m.has_video===false||['m4a','mp3','aac','opus','ogg','wav'].includes(ext);
  const image=type.includes('image')||['jpg','jpeg','png','webp','gif'].includes(ext);
  const h=Number(m.height||m.resolution_height)||Number((String(m.quality||m.resolution||'').match(/(?:^|\D)(144|240|360|480|720|1080|1440|2160|4320)p?(?:\D|$)/)||[])[1])||0;
  const hls=ext==='m3u8'||/\\.m3u8(?:\\?|$)/i.test(url);
  const label=h?(h===1440?'2K':h===2160?'4K':h===4320?'8K':h+'p'):String(m.quality||m.resolution||m.format_note||'').trim();
  const bitrate=Number(m.abr||m.tbr)||0;
  const category=image?'image':audio?'audio':'video';
  const quality=label||((audio&&bitrate)?Math.round(bitrate)+' kb/s':ext?ext.toUpperCase():'Available file');
  const key=category+'|'+quality.toLowerCase()+'|'+ext;
  const score=(hls?0:10)+(ext==='mp4'?4:0)+(m.acodec&&m.acodec!=='none'?2:0);
  const existing=items.findIndex(x=>x.key===key);
  const item={url,ext,hls,category,quality,score,m,key};
  if(existing<0)items.push(item);else if(score>items[existing].score)items[existing]=item;
 }
 if(!items.length){output.appendChild(text('p','No accessible media file was returned. Please try a different public link.','loox-muted'));return}
 const card=document.createElement('article');card.className='loox-quality-card';
 card.appendChild(text('h3','Choose available media'));
 card.appendChild(text('p','Select a format returned by the source. Only available options are listed.','loox-muted'));
 const controls=document.createElement('div');controls.className='loox-quality-controls';
 const select=document.createElement('select');select.className='loox-quality-select';select.setAttribute('aria-label','Available media quality and format');
 const groupNames={video:'Video',audio:'Audio',image:'Image'};
 for(const category of ['video','audio','image']){
  const subset=items.filter(x=>x.category===category).sort((a,b)=>(Number(b.m.height)||0)-(Number(a.m.height)||0));
  if(!subset.length)continue;
  const group=document.createElement('optgroup');group.label=groupNames[category];
  for(const item of subset){const option=document.createElement('option');option.value=String(items.indexOf(item));option.textContent=item.quality+(item.ext?' · '+item.ext.toUpperCase():'');group.appendChild(option)}
  select.appendChild(group);
 }
 const a=link('Open or save selected media',items[Number(select.value)].url);a.className='loox-quality-download';
 const note=text('p','','loox-quality-note');
 function refresh(){
  const item=items[Number(select.value)];if(!item)return;
  a.href=item.url;
  a.textContent=item.hls?'Open selected playlist':'Open or save selected media';
  note.textContent=item.hls?'This is a streaming playlist, not a ready-to-download file.':(item.m.acodec==='none'||item.m.has_audio===false?'This video may not contain audio.':'The file and quality depend on the source. Save only content you have permission to use.');
 }
 select.addEventListener('change',refresh);refresh();controls.append(select,a);card.append(controls,note);output.appendChild(card);
}
form.addEventListener('submit',async e=>{e.preventDefault();output.replaceChildren();setState('Processing your request…',true);try{
if(form.matches('[data-download-form]')){const url=form.querySelector('input').value.trim();if(!safe(url))throw new Error('Please enter a valid HTTPS media URL.');const data=await request('/api/download',{url,platform:form.dataset.platform,quality:'1080'});if(data.thumbnail&&safe(data.thumbnail)){const img=document.createElement('img');img.src=data.thumbnail;img.loading='lazy';img.alt='Media preview';output.appendChild(img)}if(data.title)output.appendChild(text('h3',data.title));if(form.dataset.platform==='youtube'){if(!youtubePicker(data))mediaList(data)}else mediaList(data);setState(form.dataset.platform==='youtube'?'Formats found. Some are video-only or may fail to play; links expire after 10 minutes.':'Results ready. Choose a returned media link.',false)}
else if(form.matches('[data-search-form]')){const query=form.querySelector('input').value.trim(),filter=form.querySelector('select').value;const data=await request('/api/youtube-search',{query,filter});for(const r of data.results||[]){const u=safe(r.url);if(!u)continue;const a=document.createElement('article');if(safe(r.thumbnail)){const img=document.createElement('img');img.src=r.thumbnail;img.alt='Video thumbnail';img.loading='lazy';a.appendChild(img)}const h=text('h3',r.title);a.appendChild(h);a.appendChild(text('p',[r.author,r.kind].filter(Boolean).join(' • '),'loox-muted'));a.appendChild(link('Open on YouTube',u));output.appendChild(a)}setState(output.children.length?'Search complete.':'No results found for that query.',false)}
else{const url=form.querySelector('input').value.trim();if(!safe(url))throw new Error('Enter a direct HTTPS URL to a public audio or video file.');const data=await request('/api/song-identify',{url});if(safe(data.coverart)){const img=document.createElement('img');img.src=data.coverart;img.alt='Album artwork';output.appendChild(img)}output.appendChild(text('h3',data.title||'No confirmed title'));for(const k of ['artist','album','label'])if(data[k])output.appendChild(text('p',k[0].toUpperCase()+k.slice(1)+': '+data[k],'loox-muted'));setState(data.title||data.artist?'Possible song match found.':'The service returned no confirmed match.',false)}
}catch(err){setState(err.message||'Request failed. Please try again.',false)}finally{button.disabled=false;button.setAttribute('aria-busy','false')}});
})();
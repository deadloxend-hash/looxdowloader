/* LOOX Media Grab single shared compact sidebar and custom language picker. */
(function () {
  'use strict';
  const sidebar=document.getElementById('looxSiteSidebar');
  if(!sidebar)return;
  const current=window.location.pathname.split('/').pop()||'index.html';
  const groups=[
    {key:'downloaders',label:'Downloaders',icon:'fa-solid fa-download',links:[
      ['instagram-reels-downloader.html','Instagram','fa-brands fa-instagram'],
      ['facebook-video-downloader.html','Facebook','fa-brands fa-facebook'],
      ['tiktok-video-downloader.html','TikTok','fa-brands fa-tiktok'],
      ['pinterest-downloader.html','Pinterest','fa-brands fa-pinterest'],
      ['twitter-video-downloader.html','X (Twitter)','fa-brands fa-x-twitter'],
      ['youtube-video-downloader.html','YouTube','fa-brands fa-youtube'],
      ['likee-video-downloader.html','Likee','fa-solid fa-heart'],
      ['rutube-video-downloader.html','RuTube','fa-solid fa-play']]},
    {key:'discover',label:'Discover',icon:'fa-solid fa-compass',links:[
      ['youtube-search.html','YouTube Search','fa-solid fa-magnifying-glass'],
      ['shazam-song-finder.html','Song Identifier','fa-solid fa-music']]},
    {key:'guides',label:'Guides & Help',icon:'fa-solid fa-book-open',links:[
      ['guides.html','Download Guides','fa-solid fa-book-open','guidespage'],
      ['help.html','Help Center','fa-solid fa-circle-question','help'],
      ['faq.html','FAQ','fa-solid fa-comments','faq'],
      ['troubleshooting.html','Troubleshooting','fa-solid fa-wrench'],
      ['media-formats.html','Media Formats','fa-solid fa-file-video'],
      ['contact.html','Contact','fa-regular fa-envelope','contact']]},
    {key:'legal',label:'About & Legal',icon:'fa-solid fa-shield-halved',links:[
      ['about.html','About Us','fa-solid fa-circle-info','about'],
      ['privacy-policy.html','Privacy Policy','fa-solid fa-user-shield','privacy'],
      ['terms-of-use.html','Terms of Use','fa-solid fa-file-contract','terms'],
      ['copyright-dmca.html','Copyright & DMCA','fa-solid fa-scale-balanced','copyright'],
      ['security.html','Security','fa-solid fa-lock','security'],
      ['sitemap.html','Site Map','fa-solid fa-sitemap','sitemap']]}
  ];
  const langList=[
    ['en','🇬🇧','English'],['ur','🇵🇰','اردو'],['ar','🇸🇦','العربية'],
    ['es','🇪🇸','Español'],['fr','🇫🇷','Français'],['de','🇩🇪','Deutsch'],
    ['hi','🇮🇳','हिन्दी'],['pt','🇧🇷','Português'],['tr','🇹🇷','Türkçe'],
    ['id','🇮🇩','Bahasa Indonesia']
  ];
  const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const activeGroup=groups.find(g=>g.links.some(item=>item[0]===current))?.key||'downloaders';
  const menuLink=(link)=>'<a class="loox-nav-item'+(current===link[0]?' is-current':'')+'" href="/'+link[0]+'"'+(current===link[0]?' aria-current="page"':'')+'><i class="'+link[2]+'" aria-hidden="true"></i><span'+(link[3]?' data-i18n="'+link[3]+'"':'')+'>'+esc(link[1])+'</span></a>';
  sidebar.innerHTML='<div class="loox-sidebar-top"><span class="loox-sidebar-caption">LOOX MEDIA GRAB</span><button type="button" class="loox-sidebar-close" data-sidebar-close aria-label="Close menu"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>'
    +'<div class="loox-sidebar-scroll"><a class="loox-nav-item'+(current==='index.html'?' is-current':'')+'" href="/"><i class="fa-solid fa-house" aria-hidden="true"></i><span data-i18n="home">All Downloaders</span></a>'
    +groups.map(g=>'<details class="loox-nav-section" data-nav-section="'+g.key+'" name="loox-sidebar-sections"'+(activeGroup===g.key?' open':'')+'><summary aria-label="Toggle '+g.label+'"><i class="'+g.icon+'" aria-hidden="true"></i><span data-i18n="'+g.key+'">'+g.label+'</span><i class="fa-solid fa-chevron-down loox-nav-chevron" aria-hidden="true"></i></summary><div class="loox-nav-section-body">'+g.links.map(menuLink).join('')+'</div></details>').join('')
    +'<div class="loox-sidebar-tools"><a class="loox-nav-item'+(current==='settings.html'?' is-current':'')+'" href="/settings.html"'+(current==='settings.html'?' aria-current="page"':'')+'><i class="fa-solid fa-gear" aria-hidden="true"></i><span data-i18n="settings">Settings</span></a>'
    +'<button class="loox-language-button" type="button" data-language-toggle aria-controls="looxLanguageDialog" aria-expanded="false"><i class="fa-solid fa-globe" aria-hidden="true"></i><span data-i18n="language">Language</span><small data-current-language>English</small><i class="fa-solid fa-chevron-down loox-language-chevron" aria-hidden="true"></i></button></div>'
    +'<p class="loox-sidebar-fineprint">Only save media you have permission to use. Independent service, not affiliated with these platforms.</p></div>';
  sidebar.classList.add('loox-nav-ready');
  sidebar.querySelector('[data-sidebar-close]')?.addEventListener('click',()=>{document.body.classList.remove('loox-sidebar-open');document.querySelectorAll('[data-sidebar-toggle]').forEach(b=>b.setAttribute('aria-expanded','false'))});
  sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('loox-sidebar-open')));
  const sections=Array.from(sidebar.querySelectorAll('.loox-nav-section'));
  sections.forEach(section=>section.addEventListener('toggle',()=>{if(section.open)sections.forEach(other=>{if(other!==section)other.open=false})}));
  const overlay=document.createElement('div');
  overlay.className='loox-lang-overlay';
  overlay.id='looxLanguageDialog';
  overlay.setAttribute('role','presentation');
  overlay.hidden=true;
  overlay.innerHTML='<section class="loox-lang-card" role="dialog" aria-modal="true" aria-labelledby="looxLanguageTitle"><div class="loox-lang-header"><div><h2 id="looxLanguageTitle"><i class="fa-solid fa-globe" aria-hidden="true"></i> Choose language</h2><p>Select your preferred navigation language</p></div><button class="loox-lang-close" type="button" data-lang-close aria-label="Close language selector"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>'
    +'<div class="loox-lang-list" role="group" aria-label="Available languages">'+langList.map(l=>'<button class="loox-language-choice loox-lang-option" type="button" data-language="'+l[0]+'" aria-pressed="false"><span class="loox-lang-flag" aria-hidden="true">'+l[1]+'</span><span class="loox-lang-name" dir="auto">'+esc(l[2])+'</span><span class="loox-lang-radio" aria-hidden="true"></span></button>').join('')+'</div>'
    +'<p class="loox-lang-note">Navigation labels change instantly. Full article translations are not yet available.</p></section>';
  document.body.appendChild(overlay);
  const settingsSelect=document.getElementById('looxLangSelect');
  if(settingsSelect){
    const trigger=document.createElement('button');
    trigger.type='button';trigger.className='loox-settings-lang-trigger';trigger.setAttribute('data-language-toggle','');trigger.setAttribute('aria-controls','looxLanguageDialog');trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML='<i class="fa-solid fa-globe" aria-hidden="true"></i><span data-current-language>English</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
    settingsSelect.replaceWith(trigger);
    const label=document.querySelector('label[for="looxLangSelect"]');if(label)label.removeAttribute('for');
  }
  const names=Object.fromEntries(langList.map(l=>[l[0],l[2]]));
  let activeTrigger=null;
  function locale(){try{return localStorage.getItem('loox-language')||'en'}catch{return'en'}}
  function remember(v){try{localStorage.setItem('loox-language',v)}catch{}}
  function sync(){
    const currentLocale=locale(),name=names[currentLocale]||'English';
    document.querySelectorAll('[data-current-language]').forEach(el=>{el.textContent=name});
    overlay.querySelectorAll('.loox-lang-option').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.language===currentLocale)));
  }
  function open(button){
    activeTrigger=button;overlay.hidden=false;document.querySelectorAll('[data-language-toggle]').forEach(b=>b.setAttribute('aria-expanded','true'));
    sync();
    (overlay.querySelector('.loox-lang-option[aria-pressed=true]')||overlay.querySelector('.loox-lang-option'))?.focus();
  }
  function close(){
    if(overlay.hidden)return;
    overlay.hidden=true;
    document.querySelectorAll('[data-language-toggle]').forEach(b=>b.setAttribute('aria-expanded','false'));
    if(activeTrigger?.isConnected)activeTrigger.focus();
  }
  document.querySelectorAll('[data-language-toggle]').forEach(button=>button.addEventListener('click',()=>overlay.hidden?open(button):close()));
  overlay.querySelector('[data-lang-close]')?.addEventListener('click',close);
  overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)close()});
  overlay.querySelectorAll('.loox-lang-option').forEach(btn=>btn.addEventListener('click',()=>{
    remember(btn.dataset.language);sync();close();
    // Allow the existing shared localization script to translate labels.
    document.dispatchEvent(new CustomEvent('loox-language-changed',{detail:{lang:btn.dataset.language}}));
  }));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden){e.stopImmediatePropagation();close()}});
  sync();
})();

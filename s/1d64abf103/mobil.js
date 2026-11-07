/* Mobil içindekiler düğmesi: dar ekranda nav.toc'u aç/kapat */
(function(){var t=document.querySelector('nav.toc');if(!t)return;var mq=window.matchMedia('(max-width:900px)');var b=document.createElement('button');b.type='button';b.className='toc-btn';b.textContent='İçindekiler';b.setAttribute('aria-expanded','false');
function setup(){if(mq.matches){if(!b.parentNode)t.parentNode.insertBefore(b,t);t.classList.remove('open');}else{if(b.parentNode)b.parentNode.removeChild(b);t.classList.remove('open');}}
b.addEventListener('click',function(){var o=t.classList.toggle('open');b.classList.toggle('on',o);b.setAttribute('aria-expanded',o?'true':'false');});
t.addEventListener('click',function(e){if(e.target.closest('a')&&mq.matches){t.classList.remove('open');b.classList.remove('on');}});
setup();mq.addEventListener?mq.addEventListener('change',setup):mq.addListener(setup);})();

const btn=document.querySelector('[data-menu]'),nav=document.querySelector('[data-nav]');
if(btn&&nav)btn.addEventListener('click',()=>nav.classList.toggle('open'));

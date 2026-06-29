/* ==========================================================================
   BSM LIGHTING INNOVATION — MAIN INTERACTION LAYER
   GSAP + ScrollTrigger + Lenis + SplitType + Swiper + Custom UI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- 0. ACTIVE NAV DETECTION ---------------- */
  (function setActiveNav(){
    let path = window.location.pathname.split('/').pop();
    if(path === '') path = 'index.html';
    document.querySelectorAll('nav.main-nav > ul > li').forEach(li=>{
      const a = li.querySelector('a');
      if(!a) return;
      const href = a.getAttribute('href');
      if(href === path){ li.classList.add('active'); }
    });
  })();

  /* ---------------- 1. PRELOADER ---------------- */
  const loader = document.getElementById('loader');
  if (loader){
    const bar = loader.querySelector('.loader-bar i');
    const pct = loader.querySelector('.loader-pct');
    let p = 0;
    const iv = setInterval(()=>{
      p += Math.random()*18;
      if(p>=100){p=100; clearInterval(iv);
        setTimeout(()=>{
          loader.classList.add('hide');
          document.body.classList.add('is-loaded');
          initPageAnimations();
        }, 350);
      }
      if(bar) bar.style.width = p+'%';
      if(pct) pct.textContent = Math.floor(p)+'%';
    }, 140);
  } else {
    document.body.classList.add('is-loaded');
    initPageAnimations();
  }

  /* ---------------- 2. LENIS SMOOTH SCROLL ---------------- */
  let lenis;
  if (window.Lenis){
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.1 });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && gsap.ticker){
      gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
      gsap.ticker.lagSmoothing(0);
    }
    lenis.on('scroll', ()=>{ if(window.ScrollTrigger) ScrollTrigger.update(); });
  }
  window.__lenis = lenis;

  /* ---------------- 3. CUSTOM CURSOR ---------------- */
  if (window.matchMedia('(min-width:992px)').matches){
    const dot = document.createElement('div'); dot.className='cursor-dot';
    const ring = document.createElement('div'); ring.className='cursor-ring';
    document.body.append(dot, ring);
    let mx=0,my=0, rx=0, ry=0;
    window.addEventListener('mousemove', e=>{
      mx=e.clientX; my=e.clientY;
      dot.style.left=mx+'px'; dot.style.top=my+'px';
    });
    (function loop(){
      rx += (mx-rx)*0.15; ry += (my-ry)*0.15;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,.cat-card,.product-card,.magnetic').forEach(el=>{
      el.addEventListener('mouseenter', ()=>ring.classList.add('active'));
      el.addEventListener('mouseleave', ()=>ring.classList.remove('active'));
    });
  }

  /* ---------------- 4. MAGNETIC BUTTONS ---------------- */
  document.querySelectorAll('.magnetic, .btn-primary, .btn-outline, .hero-arrow').forEach(btn=>{
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      btn.style.transform = `translate(${x*0.18}px, ${y*0.35}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform=''; });
  });

  /* ---------------- 5. RIPPLE EFFECT ---------------- */
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', function(e){
      const circle = document.createElement('span');
      circle.className='ripple';
      const r = this.getBoundingClientRect();
      circle.style.left = (e.clientX-r.left)+'px';
      circle.style.top = (e.clientY-r.top)+'px';
      this.appendChild(circle);
      setTimeout(()=>circle.remove(), 650);
    });
  });

  /* ---------------- 6. HEADER SCROLL STATE ---------------- */
  const header = document.querySelector('.site-header');
  function headerState(){
    if(!header) return;
    if(window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  headerState();
  window.addEventListener('scroll', headerState);
  if(lenis) lenis.on('scroll', headerState);

  /* ---------------- 7. MOBILE MENU ---------------- */
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.main-nav');
  if (burger && nav){
    burger.addEventListener('click', ()=> nav.classList.toggle('open'));
    nav.querySelectorAll('li').forEach(li=>{
      const link = li.querySelector('a');
      if (li.querySelector('.mega') && window.matchMedia('(max-width:1199px)').matches){
        link.addEventListener('click', (e)=>{
          e.preventDefault();
          li.classList.toggle('mega-open');
        });
      }
    });
  }

  /* ---------------- 8. BACK TO TOP ---------------- */
  const btt = document.createElement('div');
  btt.className='back-to-top'; btt.innerHTML='<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(btt);
  window.addEventListener('scroll', ()=> btt.classList.toggle('show', window.scrollY>500));
  btt.addEventListener('click', ()=> lenis ? lenis.scrollTo(0) : window.scrollTo({top:0,behavior:'smooth'}));

  /* ---------------- 9. ANIMATED COUNTERS ---------------- */
  function animateCounters(){
    document.querySelectorAll('[data-count]').forEach(el=>{
      const target = parseInt(el.getAttribute('data-count'),10);
      const obs = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting && !el.classList.contains('counted')){
            el.classList.add('counted');
            let cur=0; const step = Math.max(target/60,1);
            const t = setInterval(()=>{
              cur += step;
              if(cur>=target){cur=target; clearInterval(t);}
              el.textContent = Math.floor(cur)+ (el.getAttribute('data-suffix')||'');
            },20);
            obs.disconnect();
          }
        });
      }, {threshold:.4});
      obs.observe(el);
    });
  }
  animateCounters();

  /* ---------------- 10. FAQ ACCORDION ---------------- */
  document.querySelectorAll('.faq-item').forEach(item=>{
    const ans = item.querySelector('.faq-ans');
    item.querySelector('.faq-q').addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i=>{
        i.classList.remove('open'); i.querySelector('.faq-ans').style.maxHeight=null;
      });
      if(!isOpen){ item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight+'px'; }
    });
  });

  /* ---------------- 11. TABS (product detail) ---------------- */
  document.querySelectorAll('.tabs-nav').forEach(nav=>{
    const buttons = nav.querySelectorAll('button');
    buttons.forEach((b,i)=>{
      b.addEventListener('click', ()=>{
        buttons.forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        const panels = nav.parentElement.querySelectorAll('.tab-panel');
        panels.forEach(p=>p.classList.remove('active'));
        panels[i] && panels[i].classList.add('active');
      });
    });
  });

  /* ---------------- 12. PRODUCT GALLERY THUMBS ---------------- */
  document.querySelectorAll('.pd-thumbs').forEach(wrap=>{
    const main = document.querySelector('.pd-gallery-main img');
    wrap.querySelectorAll('.thumb').forEach(t=>{
      t.addEventListener('click', ()=>{
        wrap.querySelectorAll('.thumb').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        if(main) main.src = t.querySelector('img').src;
      });
    });
  });

  /* ---------------- 13. HERO SWIPER ---------------- */
  if (window.Swiper && document.querySelector('.hero-swiper')){
    const heroSwiper = new Swiper('.hero-swiper', {
      loop:true,
      speed:1000,
      effect:'fade',
      fadeEffect:{crossFade:true},
      autoplay:{ delay:6000, disableOnInteraction:false },
      keyboard:{enabled:true},
      navigation:{ nextEl:'.hero-next', prevEl:'.hero-prev' },
      on:{
        slideChangeTransitionStart(){
          document.querySelectorAll('.hero-pagination .bullet').forEach((b,i)=>{
            b.classList.toggle('active', i===this.realIndex);
          });
          animateHeroText(this.slides[this.activeIndex]);
        }
      }
    });
    document.querySelectorAll('.hero-pagination .bullet').forEach((b,i)=>{
      b.addEventListener('click', ()=> heroSwiper.slideToLoop(i));
    });
    const heroEl = document.querySelector('.hero-slider');
    heroEl.addEventListener('mouseenter', ()=> heroSwiper.autoplay.stop());
    heroEl.addEventListener('mouseleave', ()=> heroSwiper.autoplay.start());
    animateHeroText(document.querySelector('.hero-swiper .swiper-slide-active'));
  }

  function animateHeroText(slide){
    if(!slide || !window.gsap) return;
    const content = slide.querySelector('.hero-content');
    if(!content) return;
    gsap.fromTo(content.querySelectorAll('.hero-eyebrow, h1, p, .hero-actions'),
      {y:40, opacity:0},
      {y:0, opacity:1, duration:1, ease:'power3.out', stagger:0.12, delay:0.2});
  }

  /* ---------------- 14. TESTIMONIAL / NEWS SWIPERS ---------------- */
  if (window.Swiper && document.querySelector('.testi-swiper')){
    new Swiper('.testi-swiper', {
      loop:true, spaceBetween:26,
      slidesPerView:1,
      autoplay:{delay:4500},
      breakpoints:{768:{slidesPerView:2}, 1100:{slidesPerView:3}}
    });
  }

  /* ---------------- 15. GSAP SCROLLTRIGGER REVEALS ---------------- */
  function initPageAnimations(){
    if (!window.gsap) return;
    gsap.registerPlugin(window.ScrollTrigger);

    // generic reveal
    gsap.utils.toArray('[data-reveal]').forEach((el)=>{
      gsap.to(el, {
        opacity:1, y:0, duration:1, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 88%' }
      });
    });

    // stagger groups
    gsap.utils.toArray('[data-stagger]').forEach(group=>{
      const items = group.children;
      gsap.fromTo(items, {y:50, opacity:0}, {
        y:0, opacity:1, duration:.9, ease:'power3.out', stagger:0.12,
        scrollTrigger:{ trigger: group, start:'top 85%' }
      });
    });

    // parallax images
    gsap.utils.toArray('[data-parallax]').forEach(img=>{
      gsap.to(img, {
        y: -60, ease:'none',
        scrollTrigger:{ trigger: img.parentElement, start:'top bottom', end:'bottom top', scrub:true }
      });
    });

    // split text heading reveal
    if (window.SplitType){
      document.querySelectorAll('.split-text').forEach(el=>{
        const split = new SplitType(el, {types:'lines,words'});
        gsap.from(split.words, {
          yPercent:120, opacity:0, duration:.9, ease:'power3.out', stagger:0.02,
          scrollTrigger:{ trigger: el, start:'top 90%' }
        });
      });
    }

    // floating shapes idle motion
    gsap.utils.toArray('.float-shape, .hero-float-card').forEach((el,i)=>{
      gsap.to(el, {y: i%2===0? 18:-18, duration:3+i, repeat:-1, yoyo:true, ease:'sine.inOut'});
    });
  }

  /* ---------------- 16. CARD TILT EFFECT ---------------- */
  document.querySelectorAll('.product-card, .cat-card, .team-card .tphoto').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - .5;
      const y = (e.clientY - r.top)/r.height - .5;
      card.style.transform = `rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform=''; });
  });

});




/*==============================
        STICKY HEADER
==============================*/

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        header.classList.add("sticky");

    } else {

        header.classList.remove("sticky");

    }

});

/*==============================
        MOBILE MENU
==============================*/

const menuToggle = document.querySelector(".menu-toggle");

if(menuToggle){

    menuToggle.addEventListener("click", () =>{

        menuToggle.classList.toggle("active");

    });

}

/*==============================
    hero slider 
==============================*/

const heroSwiper = new Swiper(".heroSwiper",{

    loop:true,

    speed:1200,

    effect:"fade",

    fadeEffect:{
        crossFade:true
    },

    autoplay:{
        delay:5000,
        disableOnInteraction:false
    },

    pagination:{
        el:".swiper-pagination",
        clickable:true
    },

    navigation:{
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev"
    }

});
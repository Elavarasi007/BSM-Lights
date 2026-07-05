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


const selectFancy = document.querySelector(".select-fancy");

if (selectFancy) {

    selectFancy.addEventListener("change", function () {

        const value = this.value;

        console.log(value);

    });

}

const gridBtn = document.querySelector(".view-toggle button:first-child");
const listBtn = document.querySelector(".view-toggle button:last-child");
const productGrid = document.querySelector(".product-grid");

if (gridBtn && listBtn && productGrid) {

    gridBtn.onclick = () => {

        productGrid.classList.remove("list-view");
        productGrid.classList.add("grid-view");

        gridBtn.classList.add("active");
        listBtn.classList.remove("active");

    };

    listBtn.onclick = () => {

        productGrid.classList.remove("grid-view");
        productGrid.classList.add("list-view");

        listBtn.classList.add("active");
        gridBtn.classList.remove("active");

    };

}

/* ==========================================
   PRODUCT CATEGORY FILTER
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Left Sidebar Categories மட்டும்
    const categoryLinks = document.querySelectorAll(".cat-list a[data-category]");

    const productCards = document.querySelectorAll(".product-card");

    if (!categoryLinks.length || !productCards.length) return;

    categoryLinks.forEach(link => {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            const category = this.dataset.category;

            categoryLinks.forEach(item => item.classList.remove("active"));

            this.classList.add("active");

            productCards.forEach(card => {

                const cardCategory = card.dataset.category;

                if (category === "all" || cardCategory === category) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";

                }

            });

        });

    });

});

/* =====================================================
   PRODUCT DETAIL DATABASE
===================================================== */

const PRODUCT_DATA = {

    1: {
        id: 1,
        category: "Beam Lights",
        badge: "New Arrival",
        title: "BSM Beam 380",
        subtitle: "380W Beam Moving Head Light",
        price: "₹72,000",
        image: "assets/images/products/1.webp",
        power: "380W",
        effect: "18 Prism",
        beam: "2.0°",
        description: "The BSM Beam 380 is a professional 380W moving head beam light designed for concerts, stages, clubs and rental applications."
    },

    2: {
        id: 2,
        category: "Wash Lights",
        badge: "Popular",
        title: "BSM Wash 1940",
        subtitle: "19 × 40W RGBW Zoom Wash",
        price: "₹68,000",
        image: "assets/images/products/2.webp",
        power: "760W",
        effect: "RGBW Zoom",
        beam: "6° - 60°",
        description: "Professional RGBW Zoom Wash moving head with smooth dimming and wide zoom range."
    },

    3: {
        id: 3,
        category: "LED PAR",
        badge: "Best Seller",
        title: "BSM LED PAR 1815",
        subtitle: "18 × 15W RGBWA+UV",
        price: "₹18,500",
        image: "assets/images/products/3.webp",
        power: "270W",
        effect: "RGBWA+UV",
        beam: "25°",
        description: "High performance LED PAR suitable for stage, wedding and event lighting."
    },

    4: {
        id: 4,
        category: "Laser Systems",
        badge: "Professional",
        title: "BSM Laser RGB 3W",
        subtitle: "RGB Animation Laser",
        price: "₹95,000",
        image: "assets/images/products/4.webp",
        power: "3W",
        effect: "ILDA + DMX",
        beam: "RGB",
        description: "Professional RGB laser system for concerts, clubs and laser shows."
    },

    5: {
        id: 5,
        category: "Strobe Lights",
        badge: "Hot",
        title: "BSM Strobe 1500",
        subtitle: "1500W LED Strobe",
        price: "₹25,000",
        image: "assets/images/products/5.webp",
        power: "1500W",
        effect: "Variable Strobe",
        beam: "120°",
        description: "Powerful LED strobe light for concerts and stage productions."
    },

    6: {
        id: 6,
        category: "Controllers",
        badge: "Smart",
        title: "BSM Controller 1024",
        subtitle: "Professional DMX Controller",
        price: "₹42,000",
        image: "assets/images/products/6.webp",
        power: "100W",
        effect: "1024 Channels",
        beam: "--",
        description: "Professional DMX lighting controller with touch display."
    },

    7: {
        id: 7,
        category: "DMX Solutions",
        badge: "Popular",
        title: "BSM DMX Splitter 8",
        subtitle: "8 Port DMX Splitter",
        price: "₹6,500",
        image: "assets/images/products/7.webp",
        power: "50W",
        effect: "8 Output",
        beam: "--",
        description: "Optically isolated professional DMX splitter."
    },

    8: {
        id: 8,
        category: "Pro Audio",
        badge: "Pro Audio",
        title: "BSM Line Array LA-210",
        subtitle: "800W RMS Line Array",
        price: "₹85,000",
        image: "assets/images/products/8.webp",
        power: "800W",
        effect: "Passive",
        beam: "--",
        description: "Professional line array speaker system."
    },

    9: {
        id: 9,
        category: "Hybrid Moving Head",
        badge: "New",
        title: "BSM Hybrid 420",
        subtitle: "420W Hybrid Moving Head",
        price: "₹1,18,000",
        image: "assets/images/products/9.webp",
        power: "420W",
        effect: "Beam / Spot / Wash",
        beam: "2°",
        description: "Professional hybrid moving head fixture."
    },

    10: {
        id: 10,
        category: "Follow Spot",
        badge: "Professional",
        title: "BSM Follow Spot 1200",
        subtitle: "1200W Follow Spot",
        price: "₹58,500",
        image: "assets/images/products/10.webp",
        power: "1200W",
        effect: "Manual Zoom",
        beam: "10°",
        description: "Professional follow spot light."
    },

    11: {
        id: 11,
        category: "Blinder Lights",
        badge: "Sale",
        title: "BSM COB Blinder",
        subtitle: "2 × 100W COB",
        price: "₹19,500",
        image: "assets/images/products/11.webp",
        power: "200W",
        effect: "Warm White",
        beam: "120°",
        description: "Professional COB audience blinder."
    },

    12: {
        id: 12,
        category: "Moving Head",
        badge: "Premium",
        title: "BSM Moving Head 600",
        subtitle: "600W CMY Moving Head",
        price: "₹1,42,000",
        image: "assets/images/products/12.webp",
        power: "600W",
        effect: "CMY Mixing",
        beam: "2°",
        description: "Professional 600W moving head fixture."
    }

};
/* =====================================================
   PRODUCT DETAIL LOADER
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Product Detail Page-ல் இல்லையென்றால் exit
    if (!document.getElementById("productTitle")) return;

    // URL-ல இருந்து id எடு
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id") || "1";

    const product = PRODUCT_DATA[productId];

    if (!product) return;

    // Breadcrumb
    document.getElementById("breadcrumbCategory").textContent = product.category;
    document.getElementById("breadcrumbProduct").textContent = product.title;

    // Main Content
    document.getElementById("productBadge").textContent = product.badge;
    document.getElementById("productTitle").textContent = product.title;
    document.getElementById("productSubtitle").textContent = product.subtitle;
    document.getElementById("productDescription").textContent = product.description;

    // Image
    document.getElementById("mainImage").src = product.image;
    document.getElementById("mainImage").alt = product.title;

    // Thumbnails
    document.querySelectorAll(".thumbImage").forEach(img => {
        img.src = product.image;
        img.alt = product.title;
    });

    // Price
    document.getElementById("productPrice").innerHTML =
        `${product.price}
        <small style="font-size:13px;color:var(--text-soft);font-weight:400">
            / Unit
        </small>`;

    // Specs
    document.getElementById("specPower").textContent = product.power;
    document.getElementById("specEffect").textContent = product.effect;
    document.getElementById("specBeam").textContent = product.beam;

    // Technical Specification Table
    const model = document.getElementById("specModel");
    if (model) model.textContent = product.title;

    const light = document.getElementById("specLightSource");
    if (light) light.textContent = product.subtitle;

});
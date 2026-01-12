const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
cv.width = 5000; cv.height = 2000;
let scale = 0.25, pX = 0, pY = 0, isD = false, sX, sY, pixels = {};

// ফায়ার ইফেক্ট
const fCv = document.getElementById('fireCanvas'); const fCtx = fCv.getContext('2d');
fCv.width = window.innerWidth; fCv.height = 120;
let pt = [];
class Fire { constructor(x,y,u){this.x=x;this.y=y;this.s=Math.random()*5+2;this.sy=Math.random()*2+1;this.c=u?`hsl(${Math.random()*20+15},100%,50%)`:'#ff4500';this.l=1;} update(){this.y-=this.sy;this.l-=0.02;} draw(){fCtx.globalAlpha=this.l;fCtx.fillStyle=this.c;fCtx.beginPath();fCtx.arc(this.x,this.y,this.s,0,Math.PI*2);fCtx.fill();} }
function animF(){ fCtx.clearRect(0,0,fCv.width,120); for(let i=0;i<2;i++)pt.push(new Fire(fCv.width/2+(Math.random()*400-200),110,true)); pt.forEach((p,i)=>{p.update();p.draw();if(p.l<=0)pt.splice(i,1);}); requestAnimationFrame(animF); } animF();
window.onmousemove=(e)=>{if(e.pageY<200)for(let i=0;i<2;i++)pt.push(new Fire(e.pageX,e.pageY-50,false));};

// ম্যাপ রেন্ডার
function update() { document.getElementById('canvas-mover').style.transform = `translate(${pX}px,${pY}px) scale(${scale})`; }
function render() {
    ctx.clearRect(0, 0, 5000, 2000);
    // নীল গ্রিড
    ctx.strokeStyle = "rgba(0, 0, 255, 0.2)";
    for(let x=0;x<=5000;x+=10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,2000);ctx.stroke();}
    for(let y=0;y<=2000;y+=10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(5000,y);ctx.stroke();}
    
    // লোগো আঁকা
    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if(p.imageUrl) {
            const img = new Image(); img.src = p.imageUrl;
            img.onload = () => { ctx.drawImage(img, p.x, p.y, 100, 100); }; // ডিফল্ট ১০০x১০০ সাইজ
        }
    });
}

db.ref('pixels').on('value', s => { 
    pixels = s.val() || {}; render(); 
    let sl=0; Object.keys(pixels).forEach(k=>sl+=parseInt(pixels[k].pixelCount||0));
    document.getElementById('pixel-count-display').innerText=sl.toLocaleString();
});

const vp = document.getElementById('pixel-viewport');
vp.onwheel = (e) => { e.preventDefault(); scale = Math.min(Math.max(0.1, scale*(e.deltaY>0?0.9:1.1)), 5); update(); };
vp.onmousedown = (e) => { isD = true; sX = e.clientX-pX; sY = e.clientY-pY; };
window.onmouseup = () => isD = false;
window.onmousemove = (e) => { if(isD){ pX = e.clientX-sX; pY = e.clientY-sY; update(); } };

// ক্লিকে ওয়েবসাইট ওপেন
vp.onclick = (e) => {
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pX) / scale;
    const my = (e.clientY - rect.top - pY) / scale;
    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if(mx>=p.x && mx<=p.x+100 && my>=p.y && my<=p.y+100) if(p.websiteUrl) window.open(p.websiteUrl, '_blank');
    });
};

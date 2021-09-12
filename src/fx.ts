// @ts-nocheck

// https://github.com/KilledByAPixel/ZzFX
// https://killedbyapixel.github.io/ZzFX/

export const zzfx=(p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0)=>{let
    M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0
    ,J=0,f=0,x,h;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+
    r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1)
    ,-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1:
    -1)*M.abs(f)**D*p*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/
    2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin(a)
    +1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);p=zzfxX.createBuffer(1,h,R);p.
    getChannelData(0).set(k);b=zzfxX.createBufferSource();b.buffer=p;b.connect(zzfxX.destination
    );b.start();return b};zzfxX=new (window.AudioContext||webkitAudioContext);

export const DESTROYCONE = [,,33,.1,.02,.2,4,2.02,-36,5.9,,,.12,,,,,,.09];
export const DESTROYPLANT = [2.47,,1626,,.01,0,1,2.21,-19,,,,.04,,,.3,.11,.68,.04,.09];
export const PLANTFLOWER = [1.05,,1629,.03,.23,.01,1,2.79,23,6,,,.23,,-2.6,,,.25,.01];
export const PLANTVINE = [2.01,,179,.14,.25,.01,1,1.48,,,,,,.3,,,.16,.11,.21,.1];
    
export const playEffect = (effect: any[]): void => {
    zzfx(...effect);
}

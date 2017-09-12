module ExprAE.Drawing {
    export class CTex {

        static MAXMIPMAPS = 16;

        width: number;
        height: number;
        shift: number;
        x0: number;
        y0: number;
        w: number;
        h: number;
        texid: number;
        b: Uint32Array[] = [];
        cubemaptex_side: number;
            
        peekshift: number;
        peekmask: number;
        peekbuf: Uint32Array;

        Load(bf: Uint8Array, width: number, height: number): number
        {
            var wsk: Uint32Array;
            var pwsk: Uint32Array;
            
            //znajdz rozmiary tekstury
            var sw: number=1,lw=0;
            while ((sw<width)&&(lw<CTex.MAXMIPMAPS))
            {
                sw<<=1;
                lw++;
            }
            
            var sh: number=1,lh=0;
            while ((sh<height)&&(lh<CTex.MAXMIPMAPS))
            {
                sh<<=1;
                lh++;
            }
            
            var s: number;
            if (sw>sh)
            {
                s=sw;
                this.shift=lw;
            }
            else
            {
                s=sh;
                this.shift=lh;
            }
            
            //todo memcheck
            
            //alokuj pamiec dla bufora i mipmap
            var j: number=s;
            for (var i=0; i<=this.shift; i++)
            {
                this.b[i]=new Uint32Array(j*j);
                j>>=1;
            }

            this.x0=0;
            this.y0=0;
            
            //skaluj bufor
            if ((width!=s)||(height!=s))
            {
                wsk=this.b[0];
                var wskl=0;
                var dx: number=width/s;
                var dy: number=height/s;
                var x: number;
                var y: number=0;
        
                var r: number,g: number,b: number;
                for (var j: number=0; j<s-1; j++)
                {
                    x=0;
                    for (var i: number=0; i<s-1; i++)
                    {
                        var d=(((x | 0)+(y | 0)*width)) << 2;
                        var x1: number=x-Math.floor(x),y1=y-Math.floor(y);
                        var b1: number=bf[d];
                        var b2: number=bf[d+4];
                        var b3: number=bf[d+width*4+4];
                        var b4: number=bf[d+width*4];
                        var g1: number=bf[d+1];
                        var g2: number=bf[d+4+1];
                        var g3: number=bf[d+width*4+4+1];
                        var g4: number=bf[d+width*4+1];
                        var r1: number=bf[d+2];
                        var r2: number=bf[d+4+2];
                        var r3: number=bf[d+width*4+4+2];
                        var r4: number=bf[d+width*4+2];
                        r=((r1*(1-x1)+r2*x1)*(1-y1)+(r3*x1+r4*(1-x1))*y1) | 0;
                        g=((g1*(1-x1)+g2*x1)*(1-y1)+(g3*x1+g4*(1-x1))*y1) | 0;
                        b=((b1*(1-x1)+b2*x1)*(1-y1)+(b3*x1+b4*(1-x1))*y1) | 0;
                        wsk[wskl]=D.RGB32(r,g,b);
                        wskl++;
                        x+=dx;
                    }
                    let ind=(((x | 0)+(y | 0)*width)) << 2;
                    wsk[wskl]=D.RGB32(bf[ind+2],bf[ind+1], bf[ind]);
                    wskl++;
                    y+=dy;
                }
                x=0;
                for (var i: number=0; i<s; i++)
                {
                    let ind=(((x | 0)+(y | 0)*width)) << 2;
                    wsk[wskl]=D.RGB32(bf[ind+2],bf[ind+1], bf[ind]);
                    wskl++;
                    x+=dx;
                }
                this.SetParameters(this.x0,this.y0,1,dy/dx);
            }
            else
            {
                this.b[0] = bf;
                this.SetParameters(this.x0,this.y0,1,1);
            }
                       
            this.width=height=s;
            /*
            //odwroc wzgledem osi y
            if (((this.cubemaptex_side>0)&&(this.cubemaptex_side<=6))&&
            (!((this.cubemaptex_side>=3)&&(this.cubemaptex_side<=4))))
            {
                bf=(int*: unsigned)CSys.AllocMem(this.width*sizeof(int: unsigned));
                for (var j: number=0; j<this.height; j++)
                {
                    wsk=this.b[] = []+j*this.width;
                    memcpy(bf,wsk,this.width*sizeof(int));
                    pwsk=bf+this.width-1;
                    for (var i: number=0; i<this.width; i++)
                    {
                        *wsk=*pwsk;
                        wsk++;
                        pwsk--;
                    }
                }
                CSys.FreeMem(bf);
            }
            
            //obroc wzgledem osi x
            if ((this.cubemaptex_side>=3)&&(this.cubemaptex_side<=4))
            {
                wsk=this.b[] = [];
                bf=(int*: unsigned)CSys.AllocMem(this.width*height*sizeof(int: unsigned));
                memcpy(bf,wsk,this.width*height*sizeof(int: unsigned));
                for (var j: number=0; j<this.height; j++)
                {
                    memcpy(wsk+j*this.width,bf+(this.height-j-1)*this.width,width*sizeof(int: unsigned));
                }
                CSys.FreeMem(bf);
            }
            */
            
            //buduj mipmapy
            this.BuildMipMaps(this.b,width,this.shift);
            
        /*#ifdef CG
            if (this.cubemaptex_side==0)
            {
                //tworz mape normalnych traktujac teksture jako mape wysokosci
                if (this.nmapheight==0) this.nmapheight=10.f;
                BuildNormalMap(this.nmapheight);
            }
        #endif*/
            
        /*#ifdef OPENGL
            this.texbinded=0;
        #endif*/
            return 1;
        }

        IsLoaded(): boolean { return this.b[0]!=null; }

        GetU(x: number): number { return (x - this.x0) * this.w; }
        GetV(y: number): number { return (y - this.y0) * this.h; }
        GetSize(lev: number): number { return this.width >> lev; }
        GetMaxLev(): number { return this.shift; }
        SetPeekLev(lev: number): void { this.peekbuf = this.b[lev]; this.peekshift = (this.shift - lev); this.peekmask = (1 << (this.shift - lev)) - 1; }
        Peek(u: number, v: number): number
        {
            return this.peekbuf[((u & this.peekmask) + ((v & this.peekmask) << this.peekshift))];
        }

        private SetParameters(a: number, b: number, c: number, d: number) {
            this.x0 = a; 
            this.y0 = b; 
            this.w = 1 / c; 
            this.h = 1 / d;
        }
        
        private BuildMipMaps(tbuf: Uint32Array[], twidth: number, tshift: number): void
        {
            var wsk: Uint32Array,pwsk: Uint32Array;
            var wskl: number, pwskl: number;
            var j: number;
            j=twidth>>1;
            for (var i: number=1; i<=tshift; i++)
            {
                wsk=tbuf[i];
                wskl=0;
                for (var y: number=0; y<j; y++)
                {
                    pwsk = tbuf[i-1];
                    pwskl = (j<<2)*y;
                    for (var x: number=0; x<j; x++)
                    {
                        var c1: number=pwsk[pwskl];
                        var c2: number=pwsk[pwskl+1];
                        var c3: number=pwsk[pwskl+(j<<1)];
                        var c4: number=pwsk[pwskl+(j<<1)+1];
                        var sr: number=(((c1>>16)&255)+((c2>>16)&255)+((c3>>16)&255)+((c4>>16)&255))/4;
                        var sg: number=(((c1>>8)&255)+((c2>>8)&255)+((c3>>8)&255)+((c4>>8)&255))/4;
                        var sb: number=(((c1)&255)+((c2)&255)+((c3)&255)+((c4)&255))/4;
                        var sa: number=(((c1>>24)&255)+((c2>>24)&255)+((c3>>24)&255)+((c4>>24)&255))/4;
                        wsk[wskl]=(sa<<24)+(sr<<16)+(sg<<8)+sb;
                        wskl++;
                        pwskl+=2;
                    }
                }
                j>>=1;
            }
        }
    }
}
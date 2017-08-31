module ExprAE.Console {
    import keys=ExprAE.System.Keys;
    import keyMap=ExprAE.System.KeyMap;

    export class CLibWin extends Drawing.CWin {
        static CWCHARHEIGHT = 8;

        private tbuf: string;
        private ebuf: string;
        private x10:number;
        private y10:number;
        private x20:number;
        private y20:number;
        private w0:number;
        private h0:number;
        private npos:number;
        private pos:number;
        private lpos:number;
        private lines:number;
        static Num2Char: string[]=new Array("ABC","DEF","GHI","JKL","MNO","PQRS","TUV","WXYZ","_");
        retbuf: string;

        constructor(w: number,h: number,b: Uint32Array,
            private x1: number,
            private y1: number,
            private x2: number,
            private y2: number,
            private lib: Expressions.CLib)
		{
            super(w,h,b);

            this.lines=(y2-y1)/CLibWin.CWCHARHEIGHT; 
            this.pos=this.npos=this.lpos=0; 
            this.ebuf="";
            this.x10=x1; 
            this.y10=y1; 
            this.x20=x2; 
            this.y20=y2;
			this.w0=w;
			this.h0=h;
			this.retbuf="";
        }
        
        Change(b: Uint32Array, w?: number, h?: number) {
            var dw = w / this.w0, dh = h / this.h0;
            this.width=w;
            this.height=h;
            this.x1=this.x10*dw;
            this.x2=(this.x20*dw);
            this.y1=(this.y10*dh);
            this.y2=(this.y20*dh);
            this.buf=b;
            this.lines=(this.y2-this.y1)/CLibWin.CWCHARHEIGHT; 
            this.pos/*=npos*/=this.lpos=0;
            this.Set(this.ebuf);
        }

        KeyFunc(k:number)
        {
            if (k==keys.K_DOWN)
            {
                this.pos++;
            }
            else
            if (k==keys.K_UP)
            {
                this.pos--;
            }
            else
            if (k==keys.K_ENTER)
            {
                var pom: string;
                if (this.tbuf.length==0) return;
                pom=this.tbuf;
                var k=0,j=0;
                for (var i = 0; i < this.pos; i++) 
                {
                    while (pom[j]!='\n') j++;
                    k=j+1;
                    j++;
                }
                while (pom[j]!='\n') j++;
                pom=pom.slice(0,j);
                //pom[j]=0;
                this.retbuf=pom.slice(k);
                //strcpy(retbuf,pom+k);
                var n:Expressions.NAME;
                n = this.lib.find(this.retbuf);
                if ((n.parattr&0x80000000)==0)
                {
                    this.retbuf += "(";
                    k=(n.parattr&0xff)-1;

                    for (var i=0; i<k; i++) 
                    {
                        if (this.lib.getPar(n.partypes,i)==Expressions.CLib.VAL_STR) this.retbuf+='""';
                        this.retbuf+=",";
                    }
                    if (this.lib.getPar(n.partypes,i)==Expressions.CLib.VAL_STR) this.retbuf+='""';
                    this.retbuf += ")";
                }
            }
            else
            {
                var c=0;
                if ((k>keys.K_1)&&(k<=keys.K_0))  //***
                {
                    this.ebuf+= CLibWin.Num2Char[k-keys.K_1-1];
                    this.ebuf += "|";
                }
                else
                {
                    for (var i=0; i<keyMap.data.length; i++)
                    {
                        if (keyMap.data[i][0]==(k&255))
                        {
                            c=keyMap.data[i][2];
                            break;
                        }
                    }
                    var l=this.ebuf.length;
                    if ((c==8)||(c==127)) 
                    {
                        l-=2;
                        while((this.ebuf[l]!='|')&&(l>=0)) l--;
                        this.ebuf=this.ebuf.slice(0,l+1);
                    }
                    else
                    if (this.lib.index(String.fromCharCode(c))!=-1)
                    {
                        this.ebuf=this.ebuf.slice(0,l)+c+'|';
                        /*ebuf[l]=c;
                        ebuf[l+1]='|';
                        ebuf[l+2]=0;*/
                    }
                }
                this.Set(this.ebuf);
            }
            if (this.pos < 0) this.pos = this.npos - 1;
            if (this.pos>=this.npos) this.pos=0;
            if (this.pos-this.lpos>=this.lines)
            {
                this.lpos=this.pos-this.lines+1;
            }
            if (this.pos-this.lpos<0)
            {
                this.lpos=this.pos;
            }
        }

        Set(t:string)
        {
            this.pos=this.lpos=0;
            var pbuf:string="";
            var ptxt:string="";
            
            var _t:string;
            _t=t;
            var res = this.lib.NListFromTxt(_t, '|');   //todo
            this.npos = res.w;
            this.tbuf = res.ret;
            var i=0,m=0,j=0;
            while (i<pbuf.length)
            {
                if (pbuf[i]=='|') m=1;
                if (m==0)
                {
                    ptxt+=pbuf[i];
                    j++;
                }
                else
                if (m==1)
                {
                    m=0;
                    j=0;
                    this.tbuf+= ptxt;
                    this.tbuf += "\n";
                }
                i++;
            }
        }
        
        private static pcposx:number;
        private static pcposy:number;
        Draw()
        {
            var cpos = this.pos - this.lpos;
            var pom: string;
            pom = this.tbuf;
            var j=0,k=0;
            var x = this.x1, y = this.y1;
            
            var cposx: number,cposy: number;
            cposx=System.CSys.getMouseX();
            cposy=System.CSys.getMouseY();
            if ((cposx!=CLibWin.pcposx)||(cposy!=CLibWin.pcposy))
            {
                var d=0;
                if (cposy < this.y1) d = -1;
                if (cposy > this.y2 - CLibWin.CWCHARHEIGHT) d = 1;
                if (d) this.pos += d;
                else
                    this.pos = (cposy - this.y1) / CLibWin.CWCHARHEIGHT + this.lpos;
                CLibWin.pcposx=cposx;
                CLibWin.pcposy=cposy;
                if (this.pos < 0) this.pos = 0;
                if (this.pos>=this.npos) this.pos=this.npos-1;
                if (this.pos-this.lpos>=this.lines)
                {
                    this.lpos=this.pos-this.lines+1;
                }
                if (this.pos-this.lpos<0)
                {
                    this.lpos=this.pos;
                }
            }
            this.Bar(this.x1, this.y1, this.x2, this.y2, System.CSys.Color[System.CSys.CPattern]);
            this.Bar(this.x1,this.y1+cpos*CLibWin.CWCHARHEIGHT,this.x2,this.y1+(cpos+1)*CLibWin.CWCHARHEIGHT,System.CSys.Color[System.CSys.CFavour]);
            for (var i = 0; i < this.lpos; i++) 
            {
                while (pom[j]!='\n') j++;
                k=j+1;
                j++;
            }
            var cnpos = (this.npos > this.lines) ? this.lines : this.npos;
            var pomlines=pom.split("\n");
            for (var i=0; i<cnpos; i++)
            {
                this.DrawText(x,y,System.CSys.Color[System.CSys.CHelp],pomlines[i]);
                k=j+1;
                y+=CLibWin.CWCHARHEIGHT;
            }
        }

        Clear() {
            this.ebuf = "";
        }
    }
}
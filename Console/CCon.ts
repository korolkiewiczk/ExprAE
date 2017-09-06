/// <reference path="../Drawing/CWin.ts" />
/// <reference path="../System/CSys.ts" />
/// <reference path="../System/Keys.ts" />

module ExprAE.Console {

    import keys = ExprAE.System.Keys;
    import keyMap = ExprAE.System.KeyMap;
    import csys = ExprAE.System.CSys;

    export class CCon extends Drawing.CWin {
        static BUFLEN = 256;
        static LINES = 256;
        static EDIT = 128;
        static CURSORINTERVAL = 500;
        static MAXEXECFILES = 8;


        private lines: string[] = [];
        private edit: string[] = [];
        private prompt: string = null;
        private wskl: number = 0;
        private wsklv: number = 0;
        private wske: number = 0;
        private wskh: number = 0;
        private colshf: number = 0;
        private ecursor: number = 0;
        private elen: number = 0;
        private estart: number = 0;
        private echo: number = 0;

        //FILE *fexecstack[MAXEXECFILES];
        private fexecsl: number = -1;

        private libwinon: number = 0;

        constructor(protected width: number,
            protected height: number,
            protected buf: Uint32Array,
            private reffunc: Expressions.POINTER,
            private libwin: CLibWin) {
            super(width, height, buf);
            //todo
            this.edit[0] = "";
        }

        Edit(c: string) {
            var w = this.wske % CCon.EDIT;

            if (!this.edit[w])
                this.edit[w] = "";

            if ((c.charCodeAt(0) == keyMap.BACKSPACE) && (this.elen > 0) && (this.ecursor > 0)) //bspace
            {
                //if (this.ecursor != this.elen) {
                //for (var i = this.ecursor - 1; i < this.elen; i++) this.edit[w][i] = this.edit[w][i + 1];
                this.edit[w] = this.edit[w].slice(0, this.ecursor - 1) + this.edit[w].slice(this.ecursor, this.elen);
                //}
                this.elen--;
                this.ecursor--;
            }
            else
                if ((c.charCodeAt(0) == keyMap.DELETE) && (this.elen > 0) && (this.ecursor != this.elen))    //del
                {
                    //for (var i=ecursor; i<elen; i++) edit[w][i]=edit[w][i+1];
                    this.edit[w] = this.edit[w].slice(0, this.ecursor) + this.edit[w].slice(this.ecursor + 1, this.elen);
                    this.elen--;
                }
                else
                    if (c == '\n') this.Enter();
                    else
                        if ((c.charCodeAt(0) != keyMap.DELETE) && (c.charCodeAt(0) != keyMap.BACKSPACE) && (this.elen < CCon.BUFLEN - 1) && (c.charCodeAt(0) >= 32)) {
                            if (this.ecursor == this.elen) {
                                this.edit[w] = this.edit[w] + c;
                                this.ecursor++;
                            }
                            else {
                                //for (var i=elen-1; i>=ecursor; i--) edit[w][i+1]=edit[w][i];
                                this.edit[w] = this.edit[w].slice(0, this.ecursor) + c + this.edit[w].slice(this.ecursor, this.elen);
                                this.ecursor++;
                            }
                            this.elen++;
                        }
        }

        Enter() {
            var edited = this.edit[this.wske % CCon.EDIT]
            if (!edited) return;
            //currentcon=this;
            var bf = this.reffunc.fptr(this.reffunc.th, edited)+"";

            if (!bf) {
                this.lines[this.wskl % CCon.LINES], this.edit[this.wske % CCon.EDIT]
            }
            else {
                var l = 0, l2 = 0;
                var sl = bf.length;
                var bufl: string;
                while (l < sl) {
                    while (l < bf.length && (bf[l] != '\n')) l++;
                    this.lines[this.wskl % CCon.LINES] = bf.slice(0, l);
                    //memcpy(bufl,bf+l2,l);
                    //bufl[l-l2]=0;
                    //strcpy(lines[wskl%LINES],bufl);
                    l2 = ++l;
                    this.wskl++;
                }
                this.wskl--;
            }
            this.
                //csys.Log_Printf(edit[wske%EDIT]);
                wskl++;
            if (this.wske > 0) {
                if (this.edit[this.wske % CCon.EDIT] === this.edit[(this.wske - 1) % CCon.EDIT]) this.wske--;
            }
            this.wske++;
            this.edit[this.wske % CCon.EDIT] = "";
            this.ecursor = this.elen = 0;
            this.wskh = this.wske;
            this.wsklv = this.wskl;
            this.estart = 0;
            this.colshf = 0;
        }

        KeyFunc(k: keys) {
            var shift = k & keys.SHIFT;

            //todo remove depend.
            if (csys.MouseKeyPressed(keys.M_LEFT)) k |= keys.K_ENTER;
            if (csys.MouseKeyPressed(keys.M_RIGHT)) k |= keys.K_ESCAPE;
            k &= keys.REGULAR;
            if (k == keys.K_TAB) {
                this.libwinon = 1 - this.libwinon;
                if (this.libwinon) {
                    this.libwin.Clear();
                    this.libwin.Set("");
                }
            }
            else
                if (k == keys.K_ESCAPE) {
                    if (this.libwinon) this.libwinon = 0;
                    else {
                        this.edit[this.wske % CCon.EDIT] = "";
                        this.ecursor = this.elen = 0;
                        this.wskh = this.wske;
                        this.estart = 0;
                    }
                }
                else
                    if (k == keys.K_LEFT) {
                        if (shift) { if (this.colshf > 0) this.colshf--; }
                        else
                            if (this.ecursor > 0) this.ecursor--;
                    }
                    else
                        if (k == keys.K_RIGHT) {
                            if (shift) this.colshf++;
                            else
                                if (this.ecursor < this.elen) this.ecursor++;
                        }
                        else
                            if (this.libwinon) {
                                this.libwin.KeyFunc(k);
                                var i=0;
                                if (this.libwin.retbuf.length>0)
                                {
                                    while (i<this.libwin.retbuf.length)
                                    {
                                        this.Edit(this.libwin.retbuf[i++]);
                                    }
                                    this.libwin.retbuf="";
                                }
                            }
                            else
                                if (k == keys.K_HOME) this.ecursor = 0;
                                else
                                    if (k == keys.K_END) this.ecursor = this.elen;
                                    else
                                        if (k == keys.K_UP) {
                                            if (this.wskh > 0)
                                                this.edit[this.wske % CCon.EDIT] = this.edit[(--this.wskh) % CCon.EDIT];
                                            this.ecursor = this.elen = this.edit[this.wske % CCon.EDIT].length;
                                            this.estart = 0;
                                        }
                                        else
                                            if (k == keys.K_DOWN) {
                                                if (this.wskh < this.wske - 1)
                                                    this.edit[this.wske % CCon.EDIT] = this.edit[(++this.wskh) % CCon.EDIT];
                                                else
                                                    if (this.wskh < this.wske) {
                                                        this.edit[this.wske % CCon.EDIT] = "";
                                                        this.wskh++;
                                                    }
                                                this.ecursor = this.elen = this.edit[this.wske % CCon.EDIT].length;
                                                this.estart = 0;
                                            }
                                            else
                                                if (k == keys.K_PAGE_UP) {
                                                    if (this.wsklv > 0)
                                                        this.wsklv--;
                                                }
                                                else
                                                    if (k == keys.K_PAGE_DOWN) {
                                                        if (this.wsklv < this.wskl)
                                                            this.wsklv++;
                                                    }
                                                    else
                                                        if ((k == keys.K_ENTER) && (shift)) {
                                                            //var *t;
                                                            //t=csys.GetClipboardText();
                                                            //if (t)
                                                            //while (*t) Edit(*(t++));
                                                        }
                                                        else {

                                                            var c = '\0';
                                                            for (var i = 0; i < keyMap.KEYMAPLEN; i++) {
                                                                if (keyMap.data[i * 3] == k.valueOf()) {
                                                                    c = keyMap.data[i * 3 + (shift ? 1 : 0) + 1];
                                                                    break;
                                                                }
                                                            }
                                                            if (c == '\n') this.Enter();
                                                            else
                                                                if (c.charCodeAt(0) != 0)
                                                                    this.Edit(c);
                                                        }
            if ((this.ecursor - this.estart) < 0) this.estart = this.ecursor;
            var ewidth = (this.width - this.fontwidth) / this.fontwidth - (this.prompt ? this.prompt.length : 0);
            if (this.ecursor - this.estart >= ewidth) this.estart = this.ecursor - ewidth + 1;
        }

        Process() {
            /*if (fexecsl!=-1)
            {
                var bf[BUFLEN];
                fgets(bf,BUFLEN,fexecstack[fexecsl]);
                var l=strlen(bf);
                while ((l>=0)&&(bf[--l]<=32));
                bf[l+1]=0;
                l=0;
                while ((bf[l]<=32)&&(bf[l]!=0)) l++;
                var i=0;
                while (bf[l]!=0) bf[i++]=bf[l++];
                bf[i]=0;
                if (feof(fexecstack[fexecsl])) {fclose(fexecstack[fexecsl]); fexecsl--;}
                if (((bf[0]!='/')||(bf[1]!='/'))&&(bf[0]!=0))
                {
                    if (echo==1)
                    {
                        strcpy(edit[wske%EDIT],bf);
                        Enter();
                    }
                    else
                    {
                        reffunc(bf);
                    }
                }
            }*/

            this.Clear();
            this.HLine(0, this.height - this.fontheight - 4, this.width - 1, csys.Color[csys.CFaded]);
            var plen = 1;
            if (this.prompt) {
                plen += this.prompt.length * this.fontwidth;
            }
            var ewidth = (this.width - this.fontwidth) / this.fontwidth - (this.prompt ? this.prompt.length : 0);
            /*var pom = this.estart + ewidth; //for this.edit[this.wske % CCon.EDIT]
            var cpom=pom;
            *pom=0;*/
            this.DrawTextHighlighted(-this.estart * this.fontwidth + plen, this.height - this.fontheight - 2, csys.Color[csys.CHighlighted], 255, this.edit[this.wske % CCon.EDIT]);
            //*pom=cpom;

            if ((csys.GetTime() * 1000) % (CCon.CURSORINTERVAL * 2) < CCon.CURSORINTERVAL)
                this.DrawText((this.ecursor - this.estart) * this.fontwidth + plen, this.height - this.fontheight - 1, csys.Color[csys.CHighlighted], "_");

            if (this.prompt) {
                this.Bar(0, this.height - this.fontheight - 2, plen - 1, this.height - 1, csys.Color[csys.CPattern]);
                this.DrawText(1, this.height - this.fontheight - 2, this.FadeColor(/*CGraph::Color[csys.DColor]*/D.RGB32(255, 255, 255), 128), this.prompt);
            }

            var y = this.height - 2 * this.fontheight - 4;
            var l: number, i: number;
            i = this.wsklv - 1;
            l = y / this.fontheight + 1;
            if (l > CCon.LINES) l = CCon.LINES;
            if (l > this.wsklv) l = this.wsklv;
            while (l--) {
                if (this.colshf > 0) {
                    this.DrawTextHighlighted(1 - (this.colshf - 1) * this.fontwidth, y, csys.Color[csys.CNormal], 220, this.lines[i % CCon.LINES]);
                }
                else
                    this.DrawTextHighlighted(1, y, csys.Color[csys.CNormal], 220, this.lines[i % CCon.LINES]);
                i--;
                y -= this.fontheight;
            }
            if (this.colshf > 0) {
                y = this.height - 2 * this.fontheight - 4;
                while (y >= 0) {
                    this.Bar(0, y, this.fontwidth, y + this.fontheight - 1, csys.Color[csys.CPattern]);
                    this.DrawText(1, y, csys.Color[csys.CNormal], "<");
                    y -= this.fontheight;
                }
            }
            if (this.libwinon) this.libwin.Draw();
        }

        Put(s: string) {
            var l = 0, l2 = 0;
            var sl = s.length;
            var bufl: string;
            while (l < sl) {
                while (l < sl && (s[l] != '\n')) l++;
                this.lines[this.wskl % CCon.LINES] = s.slice(l2, l);
                l2 = ++l;
                this.wskl++;
            }
            this.wsklv = this.wskl;
        }
    }
}
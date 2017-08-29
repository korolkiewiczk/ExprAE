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
        private prompt: string = "";
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

        private libwinon: number;

        constructor(protected width: number,
            protected height: number,
            protected buf: Uint32Array,
            private reffunc: Expressions.ICallback,
            private libwin: CLibWin) {
            super(width, height, buf);
            //todo
        }

        Edit(c: string) {
            var w = this.wske % CCon.EDIT;

            if (!this.edit[w])
                this.edit[w] = "";

            if ((c.charCodeAt(0) == 8) && (this.elen > 0) && (this.ecursor > 0)) //bspace
            {
                //if (this.ecursor != this.elen) {
                //for (var i = this.ecursor - 1; i < this.elen; i++) this.edit[w][i] = this.edit[w][i + 1];
                this.edit[w] = this.edit[w].slice(0, this.ecursor - 1) + this.edit[w].slice(this.ecursor, this.elen - 1);
                //}
                this.elen--;
                this.ecursor--;
            }
            else
                if ((c.charCodeAt(0) == 127) && (this.elen > 0) && (this.ecursor != this.elen))    //del
                {
                    //for (var i=ecursor; i<elen; i++) edit[w][i]=edit[w][i+1];
                    this.edit[w] = this.edit[w].slice(0, this.ecursor) + this.edit[w].slice(this.ecursor + 1, this.elen - 1);
                    this.elen--;
                }
                else
                    if (c == '\n') this.Enter();
                    else
                        if ((c.charCodeAt(0) != 127) && (c.charCodeAt(0) != 8) && (this.elen < CCon.BUFLEN - 1) && (c.charCodeAt(0) >= 32)) {
                            if (this.ecursor == this.elen) {
                                this.edit[w] = this.edit[w] + c;
                                this.ecursor++;
                            }
                            else {
                                //for (var i=elen-1; i>=ecursor; i--) edit[w][i+1]=edit[w][i];
                                this.edit[w] = this.edit[w].slice(0, this.ecursor - 1) + c + this.edit[w].slice(this.ecursor);
                                this.ecursor++;
                            }
                            this.elen++;
                        }
        }

        Enter() {
            var edited = this.edit[this.wske % CCon.EDIT]
            if (!edited) return;
            //currentcon=this;
            var bf = this.reffunc(edited) as string;

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
                //CSys::Log_Printf(edit[wske%EDIT]);
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
            var shift = (k >> 8) > 0;

            //todo remove depend.
            if (csys.MouseKeyPressed(keys.M_LEFT)) k |= keys.K_ENTER;
            if (csys.MouseKeyPressed(keys.M_RIGHT)) k |= keys.K_ESCAPE;
            k &= 255;
            if (k == keys.K_TAB) {
                this.libwinon = 1 - this.libwinon;
                if (this.libwinon) {
                    //libwin->Clear();
                    //libwin->Set("");
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
                                /*libwin->KeyFunc(k);
                                var i=0;
                                if (libwin->retbuf[0]!=0)
                                {
                                    while (libwin->retbuf[i]!=0)
                                    {
                                        Edit(libwin->retbuf[i++]);
                                    }
                                    libwin->retbuf[0]=0;
                                }*/
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
                                                            //char *t;
                                                            //t=CSys::GetClipboardText();
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
            var ewidth = (this.width - this.fontwidth) / this.fontwidth - this.prompt.length;
            if (this.ecursor - this.estart >= ewidth) this.estart = this.ecursor - ewidth + 1;
        }
    }
}
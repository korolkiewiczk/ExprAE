/// <reference path="../Drawing/CWin.ts" />

module ExprAE.Console {
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
                this.edit[w]="";

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
                                this.edit[w] = this.edit[w].slice(0, this.ecursor) + c + this.edit[w].slice(this.ecursor + 1);
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
    }
}
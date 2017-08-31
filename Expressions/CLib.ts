module ExprAE.Expressions {
    export class CLib {
        static MAXNAMELEN: number = 64;
        static VAL_FLOAT: number = 0;
        static VAL_INT: number = 2;
        static VAL_STR: number = 3;
        static VAL_PTR: number = 3;
        static VAR: number = 0xffffffff;
        static MAXTXTLEN: number = 1024;
        static TAG_EXTRACODE: number = 0x10000;

        private root: ND;

        constructor(elist: ELEMENT[] = null) {
            this.root = new ND();
            if (elist)
                this.addList(elist);
        }

        addElement(e: ELEMENT): void {
            var i: number, j: number;
            var itab: number[] = this.toIndexTab(e.name);

            var nd: ND;
            nd = this.root;
            for (i = 0; i < itab.length; i++) {
                j = itab[i];
                if (nd.l[j] == null) {
                    nd.l[j] = new ND();
                }
                nd = nd.l[j];
            }
            if (nd.n == null)
                nd.n = new NAME(e.th, e.fptr);

            i = e.parcount;
            if (i == CLib.VAR)
            //jesli zmienna
            {
                nd.n.parattr = ((e.rtype & 255) << 8) | 0x80000000;
                nd.n.partypes = 0;
            }
            else {
                if (i > 15) i = 15;
                nd.n.parattr = (i & 255) | ((e.rtype & 255) << 8);
                nd.n.partypes = 0;
                for (j = 0; j < i; j++) {
                    nd.n.partypes |= ((e.partypes >> (j << 1)) & 3) << (j << 1);
                }
            }
            nd.n.tag = e.tag;
        }

        delElement(name: string): void {
            var i: number, j: number
            var itab: number[] = this.toIndexTab(name);

            var nd: ND;
            nd = this.root;
            for (i = 0; i < itab.length; i++) {
                j = itab[i];
                if (nd.l[j] == null) return;
                nd = nd.l[j];
            }
            if (nd.n) {
                nd.n = null;
            }
        }

        addList(elist: ELEMENT[]): void {
            for (var i = 0; i < elist.length; i++) {
                this.addElement(elist[i]);
            }
        }

        find(name: string): NAME {
            var i: number, j: number
            var itab: number[] = this.toIndexTab(name);

            var nd: ND;
            nd = this.root;
            for (i = 0; i < itab.length; i++) {
                j = itab[i];
                if (nd.l[j] == null) return null;
                nd = nd.l[j];
            }
            return nd.n;
        }

        NListFromTxt(_t:string, schar: string): NListFromTxtResult
        {
            var w=0;
            var t: number[]=[];
            var postab: number[]=[];
            var i=0,k=0,j=0;
            var pomt: number[]=[];
            var pomt2: number[]=[];
            var tl=0;
            var ret: string[]=[];
            ret[0]='\0';
            postab[0]=0;
            
            while(i<_t.length)
            {
                if(_t[i]==schar) postab[++k]=i+1; 
                else t[i] = this.index(_t[i]);
                if (t[i]==-1) return new NListFromTxtResult(w,ret.join(""));
                i++;
            }

            _t=_t.toUpperCase();

            postab[++k]=-1;
            
            var stack: number[][]=[];
            var nstack: ND[]=[];
            var sl=0;
            var n: ND;
        
            stack[0]=[];
            stack[0][0]=0;
            stack[0][1]=0;
            stack[0][2]=-1;
            nstack[0] = this.root;
            while (sl>=0)
            {
                if (!stack[sl])
                    stack[sl]=[];

                tl=stack[sl][2];
                if (tl>=0)
                {
                    pomt[tl]=stack[sl][0];
                }
                j=stack[sl][1];
                n=nstack[sl];
                sl--;
                if (postab[j+1]!=-1)
                {
                    for (i=postab[j]; i<postab[j+1]-1; i++)
                    {
                        if (n.l[t[i]])
                        {
                            sl++;
                            if (!stack[sl])
                                stack[sl]=[];

                            stack[sl][0]=_t[i].charCodeAt(0);
                            stack[sl][1]=j+1;
                            stack[sl][2]=tl+1;
                            nstack[sl]=n.l[t[i]];
                        }
                    }
                }
                else
                {
                    for (i=0; i<n.l.length; i++)
                    {
                        if (n.l[i])
                        {
                            sl++;
                            if (!stack[sl])
                                stack[sl]=[];

                            stack[sl][0] = this.unindex(i).charCodeAt(0);
                            stack[sl][1]=j;
                            stack[sl][2]=tl+1;
                            nstack[sl]=n.l[i];
                        }
                    }
                    if (n.n)
                    {
                        pomt[tl+1]=schar.charCodeAt(0);
                        pomt[tl+2]=0;
                        pomt2=pomt2.concat(pomt);
                        w++;
                    }
                }
            }
            i=0;
            var j2=pomt2.length;
            while (pomt2[i]!=0)
            {
                k=i;
                while ((pomt2[k]!=0)&&(pomt2[k]!=schar.charCodeAt(0))) k++;
                var d=k-i;
                for (j=0; j<d; j++) ret[j2-d+j]=String.fromCharCode(pomt2[j+i]);
                ret[j2]=schar;
                j2-=d+1;
                i=k+1;
            }
            return new NListFromTxtResult(w, ret.join(""));
        }        

        getPar(p: number, n: number): number {
            return (((p) >> ((n) << 1)) & 3);
        }

        private toIndexTab(str: string): number[] {
            var sl = str.length;
            if (sl > CLib.MAXNAMELEN) sl = CLib.MAXNAMELEN;
            var itab: number[] = [];
            for (var i = 0; i < sl; i++) {
                itab[i] = this.index(str[i]);
                if (itab[i] == -1) return;
            }
            return itab;
        }

        public index(c: string): number {
            if ((c >= 'A') && (c <= 'Z')) return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
            if ((c >= 'a') && (c <= 'z')) return c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
            if ((c >= '0') && (c <= '9')) return c.charCodeAt(0) - '0'.charCodeAt(0);
            if (c == '_') return 'Z'.charCodeAt(0) - 'A'.charCodeAt(0) + 11;
            return -1;
        }

        private unindex(i: number): string {
            if ((i >= 10) && (i <= 10 + 'Z'.charCodeAt(0) - 'A'.charCodeAt(0)))
                return String.fromCharCode('A'.charCodeAt(0) + i - 10);

            if ((i >= 0) && (i <= 9))
                return String.fromCharCode(i + '0'.charCodeAt(0));

            if (i == 'Z'.charCodeAt(0) - 'A'.charCodeAt(0) + 11)
                return '_';

            return '\0';
        }
    }

    export class NAME {
        constructor(
            public th: any, //"this" for variables
            public fptr: ICallback,   //func or var
            public parattr: number = 0,
            public partypes: number = 0,
            public tag: number = 0) {

        }
    }

    export class ND {
        constructor() {
            this.l = [];
            this.n = null;
        }
        public l: ND[];
        public n: NAME;
    }

    export class ELEMENT {
        constructor(
            public name: string,
            public fptr: ICallback,
            public rtype: number,
            public parcount: number,
            public partypes: number,
            public tag: number,
            public th: any = null) {
        }
    }

    export class POINTER {
        constructor(
            public th: any,
            public fptr: ICallback
        ) {
            
        }
    }

    export class NListFromTxtResult {
        constructor(
            public w: number,
            public ret: string) {

            }
    }
}
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

        //todo NListFromTxt(char *_t,char *ret,char schar)

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

        private index(c: string): number {
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
}
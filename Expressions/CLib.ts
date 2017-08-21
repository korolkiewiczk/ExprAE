module ExprAE.Expressions {
    export class CLib {
        MAXNAMELEN: number = 64;
        VAL_FLOAT: number = 0;
        VAL_INT: number = 2;
        VAL_STR: number = 3;
        VAL_PTR: number = 3;
        VAR: number = 0xffffffff;
        MAXTXTLEN: number = 1024;

        private root: ND;

        constructor() {
            this.root = new ND();
        }

        addElement(e: ELEMENT): void {
            var i: number, j: number, sl = e.name.length;
            if (sl > this.MAXNAMELEN) sl = this.MAXNAMELEN;
            var itab: number[]=[];
            for (i = 0; i < sl; i++) {
                itab[i] = this.index(e.name[i]);
                if (itab[i] == -1) return;
            }
            var nd: ND;
            nd = this.root;
            for (i = 0; i < sl; i++) {
                j = itab[i];
                if (nd.l[j] == null) {
                    nd.l[j] = new ND();
                }
                nd = nd.l[j];
            }
            if (nd.n == null)
                nd.n = new NAME(e.fptr);

            i = e.parcount;
            if (i == this.VAR)
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
            public fptr: ICallback,
            public parattr: number = 0,
            public partypes: number = 0,
            public tag: number = 0) {

        }
    }

    export class ND {
        constructor() {
            this.l=[];
            this.n=null;
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
            public tag: number) {

        }
    }
}
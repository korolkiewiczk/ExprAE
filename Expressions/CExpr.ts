module ExprAE.Expressions {
    export class CExpr {
        ONPSTACKBUFLEN = 16;
        NUMOFOP = 19;
        ONP_NUM = 0;
        ONP_NAME = 1;
        ONP_NAMEREF = 2;
        ONP_INUM = 3;
        EXPR_SET_BUFLEN = 512;
        MAXONPBUFLEN = this.EXPR_SET_BUFLEN;
        CHAR_NUM = 0;
        CHAR_LETTER = 1;
        CHAR_LBRACKET = 2;
        CHAR_RBRACKET = 3;
        CHAR_COMMA = 4;
        CHAR_QUOT = 5;
        CHAR_LSBRACKET = 6;
        CHAR_RSBRACKET = 7;
        CHAR_OTHER = 8;
        CHAR_HEXNUM = 9;
        CHAR_REF = 10;
        STRDATALEN = 256;
        RETSTRLEN = 64;
        MAXSTRINGS = 16;

        exprstr: string[];
        strdata: string[];
        retstr: string[];
        hashtab: number[];
        strcount: number;

        onp: number[][];
        onpl: number;
        onpstack: number[][];
        onpsl: number;
        tag: number;

        set(expr: string): ErrorCodes {

            
            if (Checker.nullEmpty(expr)) {
                return ErrorCodes.NullStr;
            }

            expr = this.removeSpaces(expr);
            if (!expr) {
                return ErrorCodes.SyntaxError;
            }

            var bf: string[];
            var exprbuf: string[];
            var stack: number[][];
            var sl: number = -1;
            var pom: number = 0;
            var pctype: number = -1;
            var ctype: number = -1;
            var stype: number = 0;
            var funcstack: number[][];
            var funcsl: number = -1;

            const freq: number = 0;
            const npar: number = 1;
            const parl: number = 2;
            const partype: number = 3;
            const bracketv: number = 4;

            var stron: number = 0;
            var strl: number = 0;
            var strl0: number = 0;
            var strbson: number = 0;
            var strchar: string = '\0';

            var vstart: number = 2;  //okresla czy piewszy znak po nawiasie ( lub poczatek

            var vcount: number = 0; //licznik ilosci wartosci na stosie
            var bcount: number = 0; //licznik nawiasow
            var sbcount: number = 0; //licznik nawiasow kwadratowych
            var sref: number = 0;    //czy stosowac referencje
            var i: number;
            var c: string;
            this.strcount = 0;
            this.exprstr[0] = '\0';

            var isextracode: number = 0; //dla trybu do_code
            var exprPos = 0;

            i = 0;
            this.onpl = 0;

            while (true) {
                var c = expr[exprPos++];

                if (stron) {
                    if (!strbson && c == '\\') {
                        strbson = 1;
                    }
                    else
                        if (c == strchar && !strbson) {
                            this.strdata[strl++] = '\0';
                            if (stron == 2) {
                                this.onp[this.onpl][0] = this.ONP_NUM;
                                this.onp[this.onpl][1] = this.strlen(this.strdata, strl0);
                                //*(float*)((int)onp+onpl*8+4)=(float)strlen((char*)(strl0+(int)strdata));
                                this.onpl++;
                            }
                            else {
                                if (this.strcount == this.MAXSTRINGS) return ErrorCodes.BufOverflow;
                                this.onp[this.onpl][0] = this.ONP_INUM;
                                this.onp[this.onpl++][1] = strl0;
                                this.hashtab[this.strcount++] = this.str2hash(this.strdata, strl0);
                            }
                            stron = 0;
                            i = 0;
                            strl0 = strl;
                        }
                        else {
                            if (strbson == 1) {
                                if (c == 'n') c = '\n';
                                else
                                    if (c == 't') c = '\t';
                                    else
                                        if (c == '0') {
                                            i = 0;
                                            while (1) {
                                                c = expr[exprPos++];
                                                var ct = this.chartype(c);
                                                if (ct != this.CHAR_NUM) break;
                                                bf[i++] = c;
                                            }
                                            exprPos -= 2;
                                            bf[i] = '\0';
                                            c = String.fromCharCode(this.atoi(bf));
                                        }
                            }
                            this.strdata[strl++] = c;
                            if (strl >= this.STRDATALEN - 1) return ErrorCodes.BufOverflow;
                            if (c == '\0') c = '\1';
                            strbson = 0;
                        }
                }
                else {
                    ctype = this.chartype(c);
                    if (funcsl >= 0) {
                        if ((funcstack[funcsl][freq] == -1) && (pctype != this.CHAR_LBRACKET)) return ErrorCodes.SyntaxError;
                        if ((funcstack[funcsl][freq] == 2) && (pctype != this.CHAR_RBRACKET)) return ErrorCodes.TooManyParams;
                    }
                    if (sref == 1) {
                        if (pctype == this.CHAR_LETTER) sref = 2;
                        else return ErrorCodes.SyntaxError;
                    }
                    if ((ctype != pctype) && (!((pctype == this.CHAR_LETTER) && (ctype == this.CHAR_NUM)))
                        && (!((pctype == this.CHAR_HEXNUM) && (ctype == this.CHAR_NUM)))
                        && (!((stype == this.CHAR_HEXNUM) && (ctype == this.CHAR_LETTER))) ||
                        ((pctype == this.CHAR_LBRACKET) && (ctype == this.CHAR_LBRACKET)) ||
                        ((pctype == this.CHAR_RBRACKET) && (ctype == this.CHAR_RBRACKET)) ||
                        ((pctype == this.CHAR_LSBRACKET) && (ctype == this.CHAR_LSBRACKET)) ||
                        ((pctype == this.CHAR_RSBRACKET) && (ctype == this.CHAR_RSBRACKET)) ||
                        ((pctype == this.CHAR_QUOT) && (ctype == this.CHAR_QUOT))) {
                        if (i > 0) {
                            bf[i] = '\0';
                            switch (stype) {
                                case this.CHAR_NUM:
                                    pom = this.atof(bf);
                                    break;
                                case this.CHAR_LETTER:
                                    /*NAME * n;
                                    n = library ->Find(bf);
                                    if (n == 0) CExpr_SetErr(UndefinedName)
                                    if ((n ->parattr & 0x80000000) == 0) {
                                        if (sref) CExpr_SetErr(SyntaxError)
                                        stack[++sl][0] = (unsigned int)n;
                                        stack[sl][1] = 10000;
                                        funcstack[++funcsl][freq] = -1; //wymus uzycie nawiasu
                                        funcstack[funcsl][npar] = n ->parattr & 255;
                                        vcount -= funcstack[funcsl][npar] - 1;
                                        funcstack[funcsl][partype] = n ->partypes;
                                        funcstack[funcsl][parl] = 0;
                                        funcstack[funcsl][bracketv] = bcount;
                                        for (unsigned int j= 0; j < n ->parattr & 255; j++)
                                        {
                                            if (GET_PAR(n ->partypes, j) == VAL_STR) isextracode = 1;
                                        }
                                        if (n ->tag & (TAG_EXTRACODE)) isextracode = 1;
                                    }
                                    else {
                                        vcount++;
                                        if (sref) {
                                            onp[onpl][0] = ONP_NAMEREF;
                                            sref = 0;
                                        }
                                        else
                                            onp[onpl][0] = ONP_NAME;
                                        onp[onpl++][1] = (unsigned int)n;
                                    }*/
                                    break;
                                case this.CHAR_HEXNUM:
                                    pom = this.htoi(bf);
                                    break;
                                case this.CHAR_OTHER:
                                    var oi: number;
                                    oi = this.opindex(bf);
                                    if (oi == -1) return ErrorCodes.UnreconOp;
                                    /*if ((vstart == 1) && (oi == 1)) {
                                        n = library ->Find("CHS");
                                        if (n == 0) CExpr_SetErr(UndefinedName)
                                        stack[++sl][0] = (unsigned int)n;
                                        stack[sl][1] = 10000;
                                    }
                                    else {
                                        n = library ->Find(CExpr_operands[oi].fname);
                                        if (n == 0) CExpr_SetErr(UndefinedName)
                                        vcount -= 1;

                                        //zdejmij operandy o wyzszym/rownym priorytecie
                                        while ((sl >= 0) && (stack[sl][1] >= CExpr_operands[oi].p)) {
                                            onp[onpl][0] = ONP_NAME;
                                            onp[onpl++][1] = stack[sl--][0];
                                            if (onpl >= MAXONPBUFLEN) CExpr_SetErr(BufOverflow)
                                        }
                                        stack[++sl][0] = (unsigned int)n;
                                        stack[sl][1] = CExpr_operands[oi].p;
                                    }*/
                                    break;
                                case this.CHAR_LSBRACKET:
                                    sbcount++;
                                    if (this.onpl >= 1) {
                                        //OLD if (onp[onpl-1][0]==ONP_NAME) onp[onpl-1][0]=ONP_NAMEADDR;
                                    } else return ErrorCodes.SyntaxError;
                                case this.CHAR_LBRACKET:
                                    if (funcsl >= 0) {
                                        if (funcstack[funcsl][npar] > 0)
                                            funcstack[funcsl][freq] = 1;
                                        else
                                            funcstack[funcsl][freq] = 2;
                                    }
                                    vstart = 2;
                                    stack[++sl][1] = 0;
                                    bcount++;
                                    break;
                                case this.CHAR_RBRACKET:
                                case this.CHAR_RSBRACKET:
                                    bcount--;
                                    if (bcount < 0) return ErrorCodes.SyntaxError;
                                    //zdejmij ze stosu wszystkie wartosci az do namiasu (
                                    while ((sl >= 0) && (stack[sl][1] > 0)) {
                                        this.onp[this.onpl][0] = this.ONP_NAME;
                                        this.onp[this.onpl++][1] = stack[sl--][0];
                                        if (this.onpl >= this.MAXONPBUFLEN) return ErrorCodes.BufOverflow;
                                    }
                                    sl--;
                                    if (funcsl >= 0)
                                        if (funcstack[funcsl][bracketv] == bcount) {
                                            if ((funcstack[funcsl][freq] != 2) && (funcstack[funcsl][parl] != funcstack[funcsl][npar] - 1))
                                                return ErrorCodes.TooFewParams;
                                            this.onp[this.onpl][0] = this.ONP_NAME;
                                            this.onp[this.onpl++][1] = stack[sl--][0];
                                            if (this.onpl >= this.MAXONPBUFLEN) return ErrorCodes.BufOverflow;
                                            funcsl--;
                                        }
                                    if (stype == this.CHAR_RSBRACKET) {
                                        if (sbcount <= 0) return ErrorCodes.SyntaxError;
                                        sbcount--;
                                        /*n = library ->Find("PTR");
                                        if (n == 0) CExpr_SetErr(UndefinedName)
                                        onp[onpl][0] = ONP_NAME;
                                        onp[onpl++][1] = (int)n;*/
                                        vcount--;
                                    }
                                    else
                                        if (ctype == this.CHAR_LSBRACKET) return ErrorCodes.SyntaxError;
                                    break;
                                case this.CHAR_COMMA:
                                    if (funcsl == -1) return ErrorCodes.SyntaxError;
                                    while ((sl >= 0) && (stack[sl][1] > 0)) {
                                        this.onp[this.onpl][0] = this.ONP_NAME;
                                        this.onp[this.onpl++][1] = stack[sl--][0];
                                        if (this.onpl >= this.MAXONPBUFLEN) return ErrorCodes.BufOverflow;
                                    }
                                    sl--;
                                    vstart = 2;
                                    stack[++sl][1] = 0;
                                    funcstack[funcsl][parl]++;
                                    if (funcstack[funcsl][parl] >= funcstack[funcsl][npar])
                                        return ErrorCodes.TooManyParams;
                                    break;
                                case this.CHAR_QUOT:
                                    if (funcsl == -1) return ErrorCodes.SyntaxError;
                                    vcount++;
                                    /*if (GET_PAR(funcstack[funcsl][partype], funcstack[funcsl][parl]) != VAL_STR)
                                        stron = 2;
                                    else
                                        stron = 1;
                                    strchar =*(expr - 1);*/
                                    strbson = 0;
                                    continue;
                                case this.CHAR_REF:
                                    if (ctype != this.CHAR_LETTER) return ErrorCodes.SyntaxError;
                                    sref = 1;
                                    break;
                            }

                            if ((stype == this.CHAR_NUM) || (stype == this.CHAR_HEXNUM)) {
                                vcount++;
                                this.onp[this.onpl][0] = this.ONP_NUM;
                                this.onp[this.onpl][1]=pom;
                                //*(float *)((int)onp+ onpl * 8 + 4)=pom;
                                this.onpl++;
                            }
                            if (
                                ((stype == this.CHAR_NUM) || (stype == this.CHAR_HEXNUM)) &&
                                ((ctype == this.CHAR_LETTER) || (ctype == this.CHAR_HEXNUM) || (ctype == this.CHAR_LBRACKET)) ||
                                ((stype == this.CHAR_RBRACKET) && (ctype == this.CHAR_LBRACKET))
                            ) {
                                var oi: number;
                                oi = this.opindex(["*"]);
                                if (oi == -1) return ErrorCodes.UnreconOp;
                                /*NAME * n;
                                n = library ->Find(CExpr_operands[oi].fname);
                                if (n == 0) CExpr_SetErr(UndefinedName)
                                vcount -= 1;

                                //zdejmij operandy o wyzszym/rownym priorytecie
                                while ((sl >= 0) && (stack[sl][1] >= CExpr_operands[oi].p)) {
                                    onp[onpl][0] = ONP_NAME;
                                    onp[onpl++][1] = stack[sl--][0];
                                    if (onpl >= MAXONPBUFLEN) CExpr_SetErr(BufOverflow)
                                }
                                stack[++sl][0] = (unsigned int)n;
                                stack[sl][1] = CExpr_operands[oi].p;*/
                            }
                        }

                        i = 0;
                        stype = ctype;
                    }

                    bf[i++] = c;
                    if (i == this.EXPR_SET_BUFLEN) return ErrorCodes.BufOverflow;
                    pctype = ctype;
                    if (vstart == 2) vstart = 1;
                    else
                        vstart = 0;
                }
                if (this.onpl >= this.MAXONPBUFLEN) return ErrorCodes.BufOverflow;
                if (c == '\0') break;
                exprPos++;
            }

            if (funcsl>=0)
            if (funcstack[funcsl][freq]!=0) return ErrorCodes.SyntaxError;
            if ((bcount>0)||(sbcount>0)) return ErrorCodes.SyntaxError;
            if (vcount!=1) return ErrorCodes.SyntaxError;
            while (sl>=0)
            {
                this.onp[this.onpl][0]=this.ONP_NAME;
                this.onp[this.onpl++][1]=stack[sl--][0];
                if (this.onpl>=this.MAXONPBUFLEN) return ErrorCodes.BufOverflow;
            }

            this.exprstr = exprbuf;

            return ErrorCodes.NoErr;
        }

        private atoi(arr: string[], start: number = 0): number {
            return parseInt(this.getStrAt(arr,start), 10);
        }

        private htoi(arr: string[], start: number = 0): number {
            return parseInt(this.getStrAt(arr,start), 16);
        }

        private atof(arr: string[], start: number = 0): number {
            return parseFloat(this.getStrAt(arr,start));
        }

        private getStrAt(arr: string[], start: number=0): string {
            var str = arr.join("");
            var index = str.indexOf('\0', start);
            if (index == -1) index = str.length;
            str = str.slice(start, index);
            return str;
        }

        private strlen(arr: string[], start: number = 0): number {
            var str = arr.join("");
            var index = str.indexOf('\0', start);
            if (index == -1) index = str.length;
            return index - start;
        }

        private str2hash(s: string[], start: number = 0): number {
            const SHIFT = 7;
            const P = 524287;
            var n: number = this.strlen(s, start);
            var i: number, hs: number;
            hs = s[start].charCodeAt(0) - 33;
            for (i = start + 1; i < n; i++)
                hs = ((hs << SHIFT) + s[i].charCodeAt(0) - 33) % P;
            return hs;
        }

        private chartype(c: string) {
            if ((c >= '0') && (c <= '9') || (c == '.')) return this.CHAR_NUM;
            if (((c >= 'A') && (c <= 'Z')) || ((c >= 'a') && (c <= 'z')) || (c == '_')) return this.CHAR_LETTER;
            if (c == '(') return this.CHAR_LBRACKET;
            if (c == ')') return this.CHAR_RBRACKET;
            if (c == ',') return this.CHAR_COMMA;
            if ((c == '"') || (c == '\'')) return this.CHAR_QUOT;
            if (c == '[') return this.CHAR_LSBRACKET;
            if (c == ']') return this.CHAR_RSBRACKET;
            if (c == '$') return this.CHAR_HEXNUM;
            if (c == '@') return this.CHAR_REF;
            if (c == '\0') return -1;
            return this.CHAR_OTHER;
        }

        private opindex(s: string[]): number {
            for (var i=0; i<this.NUMOFOP; i++)
            {
                var j=0;
                while ((this.CExpr_operands[i].opname[j]==s[j])&&(s[j]!='\0')) j++;
                if (s[j]=='\0') return i;
            }
            return -1;
        }

        private removeSpaces(expr: string): string {
            var isString = false;
            var isBackSlash = false;
            var stringChar: string;
            var resultBuf: string[] = [];

            for (var i = 0; i < expr.length; i++) {
                var c = expr[i];
                if (isString) {
                    if (!isBackSlash && (c == '\\')) isBackSlash = true;
                    else {
                        if ((c == stringChar) && !isBackSlash) isString = false;
                        isBackSlash = false;
                    }
                } else {
                    if ((c == '"') || (c == '\'')) {
                        isString = true;
                        stringChar = c;
                    }
                }

                if ((c != ' ') || isString)
                    resultBuf[i] = c;
            }

            if (isString) {
                return null;
            }

            return resultBuf.join('');
        }


        //operators
        CExpr_operands: OP[] = new Array(
            new OP("+","ADD",this.CExpr_op_add,100),
            new OP("-","SUB",this.CExpr_op_sub,100),
            new OP("*","MUL",this.CExpr_op_mul,200),
            new OP("/","DIV",this.CExpr_op_div,200)
        );

        CExpr_op_add(a:number,b:number):number
        {
            return a+b;
        }
        
        CExpr_op_sub(a:number,b:number):number
        {
            return a-b;
        }
        
        CExpr_op_mul(a:number,b:number):number
        {
            return a*b;
        }
        
        CExpr_op_div(a:number,b:number):number
        {
            return a/b;
        }
    }
}
module ExprAE.Expressions {
    export class Expression {
        set(expr: string): ErrorCodes {
            if (Checker.nullEmpty(expr)) {
                return ErrorCodes.NullStr;
            }
        }

        private removeSpaces(expr: string): string {
            var stron = false;
            var strbson = false;
            var strchar: any;
            var exprbuf: any[] = [];
            for (var i = 0; i < expr.length; i++) {
                var c = expr[i];
                if (stron) {
                    if (!strbson && (c == '\\')) strbson = true;
                    else {
                        if ((c == strchar) && !strbson) stron = false;
                        strbson = false;
                    }
                } else {
                    if ((c == '"') || (c == '\'')) {
                        stron = true;
                        strchar = c;
                    }
                }

                if ((c != ' ') || stron)
                    exprbuf[i++] = c;
            }
            return exprbuf.join('');
        }
    }
}
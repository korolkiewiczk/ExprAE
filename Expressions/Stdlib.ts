module ExprAE.Expressions {
    export class Stdlib {

        private static expr_sin(a: number): number {
            return Math.sin(a);
        }

        private static expr_cos(a: number): number {
            return Math.cos(a);
        }

        private static expr_tan(a: number): number {
            return Math.tan(a);
        }

        private static expr_ctan(a: number): number {
            return 1 / Math.tan(a);
        }

        private static expr_asin(a: number): number {
            return Math.asin(a);
        }

        private static expr_acos(a: number): number {
            return Math.acos(a);
        }

        private static expr_atan(a: number): number {
            return Math.atan(a);
        }

        private static expr_actan(a: number): number {
            return Math.atan(1 / a);
        }

        //f. wykladniczo-logarytmiczne

        private static expr_sinh(a: number): number {
            var y = Math.exp(a);
            return (y - 1 / y) / 2;
        }

        private static expr_cosh(a: number): number {
            var y = Math.exp(a);
            return (y + 1 / y) / 2;
        }

        private static expr_tanh(a: number): number {
            var a = Math.exp(+a), b = Math.exp(-a);
            return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (a + b);
        }

        private static expr_ctanh(a: number): number {
            return 1 / Stdlib.expr_tanh(a);
        }

        private static expr_asinh(a: number): number {
            if (a === -Infinity) {
                return a;
            } else {
                return Math.log(a + Math.sqrt(a * a + 1));
            }
        }

        private static expr_acosh(a: number): number {
            return Math.log(a + Math.sqrt(a * a - 1));
        }

        private static expr_atanh(a: number): number {
            return Math.log((1 + a) / (1 - a)) / 2;
        }

        private static expr_actanh(a: number): number {
            return Stdlib.expr_atanh(1 / a);
        }

        private static expr_exp(a: number): number {
            return Math.exp(a);
        }

        private static expr_log(a: number): number {
            return Math.log(a) / Math.log(10);
        }

        private static expr_ln(a: number): number {
            return Math.log(a);
        }

        private static expr_logb(a: number, b: number): number {
            return Math.log(a) / Math.log(b);
        }

        //f. wielomianowe

        private static expr_sqrt(a: number): number {
            return Math.sqrt(a);
        }

        private static expr_abs(a: number): number {
            return Math.abs(a);
        }

        private static expr_floor(a: number): number {
            return Math.floor(a);
        }

        private static expr_ceil(a: number): number {
            return Math.ceil(a);
        }

        private static expr_frac(a: number): number {
            return a - Math.floor(a);
        }

        private static expr_round(a: number): number {
            return Math.round(a);
        }

        private static expr_min(a: number, b: number): number {
            return (a > b) ? b : a;
        }

        private static expr_max(a: number, b: number): number {
            return (a > b) ? a : b;
        }

        private static expr_dist(a: number, b: number): number {
            return Math.sqrt(a * a + b * b);
        }

        //string functions

        private static expr_toupper(a: string): string {
            return a.toUpperCase();
        }

        private static expr_concat(a: string,b: string): string {
            return a+b;
        }

        private expr_setxy(fx: number,fy: number): number
        {
            this.expr_x=fx;
            this.expr_y=fy;
            return 1;
        }
        
        //ustaw x=fx i y=fy dla f. parametrycznej wd. funkcji biegunowej r=f(a)
        private expr_setxypol(f: number): number
        {
            this.expr_x=Math.cos(this.expr_t)*f;
            this.expr_y=Math.sin(this.expr_t)*f;
            return 1;
        }

        //todo other functions

        expr_e: number = Math.E;
        private __expr_e(...args: any[]): number {
            if (args.length == 1)
                return this.expr_e = args[0];
            else
                return this.expr_e;
        }

        expr_pi: number = Math.PI;
        private __expr_pi(...args: any[]): number {
            if (args.length == 1)
                return this.expr_pi = args[0];
            else
                return this.expr_pi;
        }

        expr_x: number = 0;
        private __expr_x(...args: any[]): number {
            if (args.length == 1)
                return this.expr_x = args[0];
            else
                return this.expr_x;
        }

        expr_y: number = 0;
        private __expr_y(...args: any[]): number {
            if (args.length == 1)
                return this.expr_y = args[0];
            else
                return this.expr_y;
        }

        expr_t: number = 0;
        private __expr_t(...args: any[]): number {
            if (args.length == 1)
                return this.expr_t = args[0];
            else
                return this.expr_t;
        }

        expr_k: number = 0;
        private __expr_k(...args: any[]): number {
            if (args.length == 1)
                return this.expr_k = args[0];
            else
                return this.expr_k;
        }

        expr_time: number = 0;
        private __expr_time(...args: any[]): number {
            if (args.length == 1)
                return this.expr_time = args[0];
            else
                return this.expr_time;
        }

        expr_str: string = "";
        private __expr_str(...args: any[]): string {
            if (args.length == 1)
                return this.expr_str = args[0];
            else
                return this.expr_str;
        }

        init(lib:CLib): CLib {
            lib.addList(this.expr_estdlib);
            return lib;
        }

        private expr_estdlib: ELEMENT[] = new Array(
            new ELEMENT("SIN", Stdlib.expr_sin, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("COS", Stdlib.expr_cos, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("TAN", Stdlib.expr_tan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("CTAN", Stdlib.expr_ctan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ASIN", Stdlib.expr_asin, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACOS", Stdlib.expr_acos, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ATAN", Stdlib.expr_atan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACTAN", Stdlib.expr_actan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("SINH", Stdlib.expr_sinh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("COSH", Stdlib.expr_cosh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("TANH", Stdlib.expr_tanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("CTANH", Stdlib.expr_ctanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ASINH", Stdlib.expr_asinh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACOSH", Stdlib.expr_acosh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ATANH", Stdlib.expr_atanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACTANH", Stdlib.expr_actanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("EXP", Stdlib.expr_exp, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("LN", Stdlib.expr_ln, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("LOG", Stdlib.expr_log, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("LOGB", Stdlib.expr_logb, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            new ELEMENT("SQRT", Stdlib.expr_sqrt, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ABS", Stdlib.expr_abs, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("FLOOR", Stdlib.expr_floor, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("CEIL", Stdlib.expr_ceil, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("FRAC", Stdlib.expr_frac, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ROUND", Stdlib.expr_round, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("MIN", Stdlib.expr_min, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            new ELEMENT("MAX", Stdlib.expr_max, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            new ELEMENT("DIST", Stdlib.expr_dist, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            new ELEMENT("TOUPPER", Stdlib.expr_toupper, CLib.VAL_STR, 1, CLib.VAL_STR, 0),
            new ELEMENT("CONCAT", Stdlib.expr_concat, CLib.VAL_STR, 2, CLib.VAL_STR + CLib.VAL_STR * 4, 0),
            /*new ELEMENT("RND", Stdlib.expr_rnd,CLib.VAL_FLOAT,0,0,0),
            new ELEMENT("SRND", Stdlib.expr_srnd,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("GAMMA", Stdlib.expr_gamma,CLib.VAL_FLOAT,1,CLib.VAL_FLOAT,0),
            new ELEMENT("IFV", Stdlib.expr_ifv,CLib.VAL_FLOAT,3,CLib.VAL_FLOAT+CLib.VAL_FLOAT*4+CLib.VAL_FLOAT*16),
            new ELEMENT("TABLE", Stdlib.expr_table,CLib.VAL_FLOAT,4,CLib.VAL_STR+CLib.VAL_FLOAT*4+CLib.VAL_FLOAT*16+CLib.VAL_INT*64,0),
            new ELEMENT("PRINT", Stdlib.expr_conprint,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("BPRINT", Stdlib.expr_conprint_i_base,CLib.VAL_INT,2,CLib.VAL_INT|CLib.VAL_INT*4,0),
            new ELEMENT("STRIB", Stdlib.expr_i_base,CLib.VAL_INT,2,CLib.VAL_STR|CLib.VAL_INT*4,0),
            new ELEMENT("CLS", Stdlib.expr_cls,CLib.VAL_INT,0,0,0),
            new ELEMENT("ECHO", Stdlib.expr_echo,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("EXEC", Stdlib.expr_exec,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("SUM", Stdlib.expr_sum,CLib.VAL_FLOAT,3,CLib.VAL_STR+CLib.VAL_INT*4+CLib.VAL_INT*16,0),
            new ELEMENT("DIFF", Stdlib.expr_diff,CLib.VAL_FLOAT,1,CLib.VAL_STR,0),
            new ELEMENT("INTEGRAL", Stdlib.expr_integral,CLib.VAL_FLOAT,3,CLib.VAL_STR,0),
            new ELEMENT("COLOR", Stdlib.expr_setcolor,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("MODE", Stdlib.expr_setmode,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("VIDMODE", Stdlib.expr_setvidmode,CLib.VAL_INT,2,CLib.VAL_INT+CLib.VAL_INT*4,0),
            new ELEMENT("SOUNDMODE", Stdlib.expr_setsoundmode,CLib.VAL_INT,3,CLib.VAL_INT+CLib.VAL_INT*4+CLib.VAL_INT*16,0),
            new ELEMENT("SYSINFO", Stdlib.expr_sysinfo,CLib.VAL_INT,0,0,0),
            new ELEMENT("SHELL", Stdlib.expr_shell,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("FILE", Stdlib.expr_file,CLib.VAL_FLOAT,2,CLib.VAL_STR+CLib.VAL_INT*4,0),
            new ELEMENT("VARGET", Stdlib.expr_varget,CLib.VAL_FLOAT,2,CLib.VAL_STR|CLib.VAL_INT*4,0),
            new ELEMENT("VARSET", Stdlib.expr_varset,CLib.VAL_FLOAT,3,CLib.VAL_STR|CLib.VAL_STR*4|CLib.VAL_INT*16,0),
            new ELEMENT("VARSETF", Stdlib.expr_varsetf,CLib.VAL_FLOAT,3,CLib.VAL_STR|CLib.VAL_INT*16,0),
            new ELEMENT("LOADLIB", Stdlib.expr_loadlib,CLib.VAL_INT,1,CLib.VAL_STR,0),*/
            new ELEMENT("PAR", this.expr_setxy,CLib.VAL_FLOAT,2,0,0, this),
            new ELEMENT("POL", this.expr_setxypol,CLib.VAL_FLOAT,1,0,0, this),
            new ELEMENT("X", this.__expr_x, CLib.VAL_FLOAT, CLib.VAR, 0, 0, this),
            new ELEMENT("Y", this.__expr_y, CLib.VAL_FLOAT, CLib.VAR, 0, 0, this),
            new ELEMENT("T", this.__expr_t, CLib.VAL_FLOAT, CLib.VAR, 0, 0, this),
            new ELEMENT("K", this.__expr_k, CLib.VAL_FLOAT, CLib.VAR, 0, 0, this),
            new ELEMENT("PI", this.__expr_pi, CLib.VAL_FLOAT, CLib.VAR, 0, 0, this),
            new ELEMENT("E", this.__expr_e, CLib.VAL_FLOAT, CLib.VAR, 0, 0, this),
            new ELEMENT("TIME", this.__expr_time, CLib.VAL_FLOAT, CLib.VAR, 0, 0, this),
            new ELEMENT("STR", this.__expr_str, CLib.VAL_STR, CLib.VAR, 0, 0, this)
        );
    }
}
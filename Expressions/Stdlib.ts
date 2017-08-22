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

        //todo other functions


        // _expr_y: number;
        // _expr_t: number;
        // _expr_k: number;
        // _expr_time: number;

        private static _expr_e: number = Math.E;
        static expr_e(...args: number[]): number {
            if (args.length == 1)
                Stdlib._expr_e = args[0];
            else
                return Stdlib._expr_e;
        }

        private static _expr_pi: number = Math.PI;
        static expr_pi(...args: number[]): number {
            if (args.length == 1)
                Stdlib._expr_pi = args[0];
            else
                return Stdlib._expr_pi;
        }

        private static _expr_x: number;
        static expr_x(...args: number[]): number {
            if (args.length == 1)
                Stdlib._expr_x = args[0];
            else
                return Stdlib._expr_x;
        }

        private static _expr_y: number;
        static expr_y(...args: number[]): number {
            if (args.length == 1)
                Stdlib._expr_y = args[0];
            else
                return Stdlib._expr_y;
        }

        private static _expr_t: number;
        static expr_t(...args: number[]): number {
            if (args.length == 1)
                Stdlib._expr_t = args[0];
            else
                return Stdlib._expr_t;
        }

        private static _expr_k: number;
        static expr_k(...args: number[]): number {
            if (args.length == 1)
                Stdlib._expr_k = args[0];
            else
                return Stdlib._expr_k;
        }

        private static _expr_time: number;
        static expr_time(...args: number[]): number {
            if (args.length == 1)
                Stdlib._expr_time = args[0];
            else
                return Stdlib._expr_time;
        }


        static expr_estdlib: ELEMENT[] = new Array(
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
            /*new ELEMENT("RND",Stdlib.expr_rnd,CLib.VAL_FLOAT,0,0,0),
            new ELEMENT("SRND",Stdlib.expr_srnd,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("GAMMA",Stdlib.expr_gamma,CLib.VAL_FLOAT,1,CLib.VAL_FLOAT,0),
            new ELEMENT("IFV",Stdlib.expr_ifv,CLib.VAL_FLOAT,3,CLib.VAL_FLOAT+CLib.VAL_FLOAT*4+CLib.VAL_FLOAT*16),
            new ELEMENT("TABLE",Stdlib.expr_table,CLib.VAL_FLOAT,4,CLib.VAL_STR+CLib.VAL_FLOAT*4+CLib.VAL_FLOAT*16+CLib.VAL_INT*64,0),
            new ELEMENT("PRINT",Stdlib.expr_conprint,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("BPRINT",Stdlib.expr_conprint_i_base,CLib.VAL_INT,2,CLib.VAL_INT|CLib.VAL_INT*4,0),
            new ELEMENT("STRIB",Stdlib.expr_i_base,CLib.VAL_INT,2,CLib.VAL_STR|CLib.VAL_INT*4,0),
            new ELEMENT("CLS",Stdlib.expr_cls,CLib.VAL_INT,0,0,0),
            new ELEMENT("ECHO",Stdlib.expr_echo,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("EXEC",Stdlib.expr_exec,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("SUM",Stdlib.expr_sum,CLib.VAL_FLOAT,3,CLib.VAL_STR+CLib.VAL_INT*4+CLib.VAL_INT*16,0),
            new ELEMENT("DIFF",Stdlib.expr_diff,CLib.VAL_FLOAT,1,CLib.VAL_STR,0),
            new ELEMENT("INTEGRAL",Stdlib.expr_integral,CLib.VAL_FLOAT,3,CLib.VAL_STR,0),
            new ELEMENT("COLOR",Stdlib.expr_setcolor,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("MODE",Stdlib.expr_setmode,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("VIDMODE",Stdlib.expr_setvidmode,CLib.VAL_INT,2,CLib.VAL_INT+CLib.VAL_INT*4,0),
            new ELEMENT("SOUNDMODE",Stdlib.expr_setsoundmode,CLib.VAL_INT,3,CLib.VAL_INT+CLib.VAL_INT*4+CLib.VAL_INT*16,0),
            new ELEMENT("SYSINFO",Stdlib.expr_sysinfo,CLib.VAL_INT,0,0,0),
            new ELEMENT("SHELL",Stdlib.expr_shell,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("FILE",Stdlib.expr_file,CLib.VAL_FLOAT,2,CLib.VAL_STR+CLib.VAL_INT*4,0),
            new ELEMENT("VARGET",Stdlib.expr_varget,CLib.VAL_FLOAT,2,CLib.VAL_STR|CLib.VAL_INT*4,0),
            new ELEMENT("VARSET",Stdlib.expr_varset,CLib.VAL_FLOAT,3,CLib.VAL_STR|CLib.VAL_STR*4|CLib.VAL_INT*16,0),
            new ELEMENT("VARSETF",Stdlib.expr_varsetf,CLib.VAL_FLOAT,3,CLib.VAL_STR|CLib.VAL_INT*16,0),
            new ELEMENT("LOADLIB",Stdlib.expr_loadlib,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("PAR",Stdlib.expr_setxy,CLib.VAL_FLOAT,2,0,0),
            new ELEMENT("POL",Stdlib.expr_setxypol,CLib.VAL_FLOAT,1,0,0),*/
            new ELEMENT("X", Stdlib.expr_x, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("Y", Stdlib.expr_y, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("T", Stdlib.expr_t, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("K", Stdlib.expr_k, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("PI", Stdlib.expr_pi, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("E", Stdlib.expr_e, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("TIME", Stdlib.expr_time, CLib.VAL_FLOAT, CLib.VAR, 0, 0)
        );
    }
}
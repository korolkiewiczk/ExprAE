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

        expr_e: number = Math.E;
        static __expr_e(...args: any[]): number {
            if (args.length == 2)
                (args[0] as Stdlib).expr_e = args[1];
            else
                return (args[0] as Stdlib).expr_e;
        }

        expr_pi: number = Math.PI;
        static __expr_pi(...args: any[]): number {
            if (args.length == 2)
                (args[0] as Stdlib).expr_pi = args[1];
            else
                return (args[0] as Stdlib).expr_pi;
        }

        expr_x: number;
        static __expr_x(...args: any[]): number {
            if (args.length == 2)
                (args[0] as Stdlib).expr_x = args[1];
            else
                return (args[0] as Stdlib).expr_x;
        }

        expr_y: number;
        static __expr_y(...args: any[]): number {
            if (args.length == 2)
                (args[0] as Stdlib).expr_y = args[1];
            else
                return (args[0] as Stdlib).expr_y;
        }

        expr_t: number;
        static __expr_t(...args: any[]): number {
            if (args.length == 2)
                (args[0] as Stdlib).expr_t = args[1];
            else
                return (args[0] as Stdlib).expr_t;
        }

        expr_k: number;
        static __expr_k(...args: any[]): number {
            if (args.length == 2)
                (args[0] as Stdlib).expr_k = args[1];
            else
                return (args[0] as Stdlib).expr_k;
        }

        expr_time: number;
        static __expr_time(...args: any[]): number {
            if (args.length == 2)
                (args[0] as Stdlib).expr_time = args[1];
            else
                return (args[0] as Stdlib).expr_time;
        }


        expr_estdlib: ELEMENT[] = new Array(
            new ELEMENT("SIN", this, Stdlib.expr_sin, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("COS", this, Stdlib.expr_cos, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("TAN", this, Stdlib.expr_tan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("CTAN", this, Stdlib.expr_ctan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ASIN", this, Stdlib.expr_asin, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACOS", this, Stdlib.expr_acos, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ATAN", this, Stdlib.expr_atan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACTAN", this, Stdlib.expr_actan, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("SINH", this, Stdlib.expr_sinh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("COSH", this, Stdlib.expr_cosh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("TANH", this, Stdlib.expr_tanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("CTANH", this, Stdlib.expr_ctanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ASINH", this, Stdlib.expr_asinh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACOSH", this, Stdlib.expr_acosh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ATANH", this, Stdlib.expr_atanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ACTANH", this, Stdlib.expr_actanh, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("EXP", this, Stdlib.expr_exp, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("LN", this, Stdlib.expr_ln, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("LOG", this, Stdlib.expr_log, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("LOGB", this, Stdlib.expr_logb, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            new ELEMENT("SQRT", this, Stdlib.expr_sqrt, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ABS", this, Stdlib.expr_abs, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("FLOOR", this, Stdlib.expr_floor, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("CEIL", this, Stdlib.expr_ceil, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("FRAC", this, Stdlib.expr_frac, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("ROUND", this, Stdlib.expr_round, CLib.VAL_FLOAT, 1, CLib.VAL_FLOAT, 0),
            new ELEMENT("MIN", this, Stdlib.expr_min, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            new ELEMENT("MAX", this, Stdlib.expr_max, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            new ELEMENT("DIST", this, Stdlib.expr_dist, CLib.VAL_FLOAT, 2, CLib.VAL_FLOAT + CLib.VAL_FLOAT * 4, 0),
            /*new ELEMENT("RND", this, Stdlib.expr_rnd,CLib.VAL_FLOAT,0,0,0),
            new ELEMENT("SRND", this, Stdlib.expr_srnd,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("GAMMA", this, Stdlib.expr_gamma,CLib.VAL_FLOAT,1,CLib.VAL_FLOAT,0),
            new ELEMENT("IFV", this, Stdlib.expr_ifv,CLib.VAL_FLOAT,3,CLib.VAL_FLOAT+CLib.VAL_FLOAT*4+CLib.VAL_FLOAT*16),
            new ELEMENT("TABLE", this, Stdlib.expr_table,CLib.VAL_FLOAT,4,CLib.VAL_STR+CLib.VAL_FLOAT*4+CLib.VAL_FLOAT*16+CLib.VAL_INT*64,0),
            new ELEMENT("PRINT", this, Stdlib.expr_conprint,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("BPRINT", this, Stdlib.expr_conprint_i_base,CLib.VAL_INT,2,CLib.VAL_INT|CLib.VAL_INT*4,0),
            new ELEMENT("STRIB", this, Stdlib.expr_i_base,CLib.VAL_INT,2,CLib.VAL_STR|CLib.VAL_INT*4,0),
            new ELEMENT("CLS", this, Stdlib.expr_cls,CLib.VAL_INT,0,0,0),
            new ELEMENT("ECHO", this, Stdlib.expr_echo,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("EXEC", this, Stdlib.expr_exec,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("SUM", this, Stdlib.expr_sum,CLib.VAL_FLOAT,3,CLib.VAL_STR+CLib.VAL_INT*4+CLib.VAL_INT*16,0),
            new ELEMENT("DIFF", this, Stdlib.expr_diff,CLib.VAL_FLOAT,1,CLib.VAL_STR,0),
            new ELEMENT("INTEGRAL", this, Stdlib.expr_integral,CLib.VAL_FLOAT,3,CLib.VAL_STR,0),
            new ELEMENT("COLOR", this, Stdlib.expr_setcolor,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("MODE", this, Stdlib.expr_setmode,CLib.VAL_INT,1,CLib.VAL_INT,0),
            new ELEMENT("VIDMODE", this, Stdlib.expr_setvidmode,CLib.VAL_INT,2,CLib.VAL_INT+CLib.VAL_INT*4,0),
            new ELEMENT("SOUNDMODE", this, Stdlib.expr_setsoundmode,CLib.VAL_INT,3,CLib.VAL_INT+CLib.VAL_INT*4+CLib.VAL_INT*16,0),
            new ELEMENT("SYSINFO", this, Stdlib.expr_sysinfo,CLib.VAL_INT,0,0,0),
            new ELEMENT("SHELL", this, Stdlib.expr_shell,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("FILE", this, Stdlib.expr_file,CLib.VAL_FLOAT,2,CLib.VAL_STR+CLib.VAL_INT*4,0),
            new ELEMENT("VARGET", this, Stdlib.expr_varget,CLib.VAL_FLOAT,2,CLib.VAL_STR|CLib.VAL_INT*4,0),
            new ELEMENT("VARSET", this, Stdlib.expr_varset,CLib.VAL_FLOAT,3,CLib.VAL_STR|CLib.VAL_STR*4|CLib.VAL_INT*16,0),
            new ELEMENT("VARSETF", this, Stdlib.expr_varsetf,CLib.VAL_FLOAT,3,CLib.VAL_STR|CLib.VAL_INT*16,0),
            new ELEMENT("LOADLIB", this, Stdlib.expr_loadlib,CLib.VAL_INT,1,CLib.VAL_STR,0),
            new ELEMENT("PAR", this, Stdlib.expr_setxy,CLib.VAL_FLOAT,2,0,0),
            new ELEMENT("POL", this, Stdlib.expr_setxypol,CLib.VAL_FLOAT,1,0,0),*/
            new ELEMENT("X", this, Stdlib.__expr_x, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("Y", this, Stdlib.__expr_y, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("T", this, Stdlib.__expr_t, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("K", this, Stdlib.__expr_k, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("PI", this, Stdlib.__expr_pi, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("E", this, Stdlib.__expr_e, CLib.VAL_FLOAT, CLib.VAR, 0, 0),
            new ELEMENT("TIME", this, Stdlib.__expr_time, CLib.VAL_FLOAT, CLib.VAR, 0, 0)
        );
    }
}
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Expressions/CExpr.ts" />
/// <reference path="../../Expressions/ErrorCodes.ts" />
/// <reference path="../../Expressions/CLib.ts" />
/// <reference path="../../Expressions/Stdlib.ts" />
import Stdlib = ExprAE.Expressions.Stdlib;

module ExprAE.Tests {
    describe("CExpr", () => {

        describe("set", () => {
            it("should set valid onp structure", () => {
                var expression = new Expressions.CExpr(new Expressions.CLib());
                var result = expression.set("10+20*30/40");
                var onp = expression["onp"].length;
                expect(result).toBe(Expressions.ErrorCodes.NoErr);
                expect(onp).toBe(7);    //7 tokens
            });
        });

        //***do TESTS***
        describe("do (with simple operators and numerics)", () => {
            it("should return valid expression result", () => {
                var expression = new Expressions.CExpr(new Expressions.CLib());
                expect(expression.set("10+20*30/40")).toBe(Expressions.ErrorCodes.NoErr);
                var result1 = expression.do();
                expect(expression.set("1.5*(2.5-3/2)")).toBe(Expressions.ErrorCodes.NoErr);
                var result2 = expression.do();
                expect(expression.set("-(-1+(1-1.01)*(1+1.01))")).toBe(Expressions.ErrorCodes.NoErr);
                var result3 = expression.do();
                expect(expression.set("(1/2+5/2)*(2/3)-6/3*2")).toBe(Expressions.ErrorCodes.NoErr);
                var result4 = expression.do();

                expect(result1).toBe(25);
                expect(result2).toBe(1.5);
                expect(result3).toBe(1.0201);
                expect(result4).toBe(-2);
            });
        });

        describe("do with simple variables, functions and numerics", () => {
            it("should return valid expression result", () => {
                var stdlib = new Stdlib();
                var expression = new Expressions.CExpr(stdlib.init(new Expressions.CLib()));

                stdlib.expr_x = 0;
                expect(expression.set("sin(x)+cos(pi)")).toBe(Expressions.ErrorCodes.NoErr);
                var result1 = expression.do();

                stdlib.expr_x = Math.PI;
                stdlib.expr_y = 2 * Math.PI;
                expect(expression.set("sin(x)/cos(y)+sqrt(abs(-4))")).toBe(Expressions.ErrorCodes.NoErr);
                var result2 = expression.do();

                stdlib.expr_x = 2;
                expect(expression.set("4x*(Log(100)-PI+pi)")).toBe(Expressions.ErrorCodes.NoErr);
                var result3 = expression.do();

                expect(result1).toBe(-1);
                expect(result2).toBe(2);
                expect(result3).toBe(16);
            });
        });

        describe("do with strings", () => {
            it("should return valid expression result", () => {
                var stdlib = new Stdlib();
                var expression = new Expressions.CExpr(stdlib.init(new Expressions.CLib()));

                expect(expression.set('toupper("abc")')).toBe(Expressions.ErrorCodes.NoErr);
                var result1=expression.do();

                expect(expression.set('concat(concat("cde", toupper("abc")), "XyZ")')).toBe(Expressions.ErrorCodes.NoErr);
                var result2=expression.do();

                stdlib.expr_str="test";
                expect(expression.set('concat(concat("cde", toupper(STR)), "XyZ")')).toBe(Expressions.ErrorCodes.NoErr);
                var result3=expression.do();

                expect(result1).toBe("ABC");
                expect(result2).toBe("cdeABCXyZ");
                expect(result3).toBe("cdeTESTXyZ");
            });
        });

        describe("do with setting variable", () => {
            it("should return valid expression result", () => {
                var stdlib = new Stdlib();
                var expression = new Expressions.CExpr(stdlib.init(new Expressions.CLib()));

                expect(expression.set('@x:=2')).toBe(Expressions.ErrorCodes.NoErr);
                var result1=expression.do();
                expect(result1).toBe(2);
                expect(stdlib.expr_x).toBe(2);


                stdlib.expr_x=10;
                stdlib.expr_y=10;
                expect(expression.set('@y:=(x+y)*(x-0.5y)')).toBe(Expressions.ErrorCodes.NoErr);
                var result2=expression.do();
                expect(result2).toBe(100);
                expect(stdlib.expr_y).toBe(100);
                

                expect(expression.set('@x:="abc"')).toBe(Expressions.ErrorCodes.SyntaxError);

                /*expect(expression.set('@str:="abc"')).toBe(Expressions.ErrorCodes.NoErr);
                var result3=expression.do() as string;
                expect(result3).toBe("abc");
                expect(stdlib.expr_str).toBe("abc");*/  //todo string support


                stdlib.expr_x=10;
                expect(expression.set('@x')).toBe(Expressions.ErrorCodes.NoErr);
                var result4=expression.do() as Expressions.POINTER;
                expect(result4.th).toBe(stdlib);
                expect(result4.fptr(result4.th)).toBe(10);
            });
        });

        describe("do with invalid expressions", () => {
            it("should return valid expression result", () => {
                var stdlib = new Stdlib();
                var expression = new Expressions.CExpr(stdlib.init(new Expressions.CLib()));

                expect(expression.set('@x=2')).toBe(Expressions.ErrorCodes.UnreconOp);
                expect(expression.do()).toBe(null);
            });
        });

        describe("do with dangerous expressions", () => {
            it("should return valid expression result", () => {
                var stdlib = new Stdlib();
                var expression = new Expressions.CExpr(stdlib.init(new Expressions.CLib()));

                stdlib.expr_x=10;
                expect(expression.set('set(x,2)')).toBe(Expressions.ErrorCodes.NoErr);
                expect(expression.do()).toBe(0);
                expect(stdlib.expr_x).toBe(10);
            });
        });
        //***do TESTS***


        describe("removeSpaces", () => {
            it("should return expression without spaces", () => {
                var expression = new Expressions.CExpr();
                var result = expression["removeSpaces"]("x  + y =  2");
                expect(result).toBe("x+y=2");
            });
            it("should return expression without spaces more complex", () => {
                var expression = new ExprAE.Expressions.CExpr()
                var result = expression["removeSpaces"]("x  + y *(x-2)+Func(\"a  b   c\") =  2 ");
                expect(result).toBe("x+y*(x-2)+Func(\"a  b   c\")=2");
            })
        });

        describe("atoi", () => {
            it("should return valid converted value", () => {
                var expression = new Expressions.CExpr();
                var result1 = expression["atoi"]("100".split(""));
                var result2 = expression["atoi"]("876".split(""));
                var result3 = expression["atoi"]("1\0002\0005\0006".split(""), 4);
                var result4 = expression["atoi"]("200\00001".split(""));
                expect(result1).toBe(100);
                expect(result2).toBe(876);
                expect(result3).toBe(5);
                expect(result4).toBe(200);
            });
        });

        describe("atof", () => {
            it("should return valid converted value", () => {
                var expression = new Expressions.CExpr();
                var result1 = expression["atof"]("10.2".split(""));
                var result2 = expression["atof"]("876".split(""));
                var result3 = expression["atof"]("1\0002\0005.5\0006".split(""), 4);
                var result4 = expression["atof"]("200.1234343\00001".split(""));
                expect(result1).toBe(10.2);
                expect(result2).toBe(876);
                expect(result3).toBe(5.5);
                expect(result4).toBe(200.1234343);
            });
        });

        describe("htoi", () => {
            it("should return valid converted value", () => {
                var expression = new Expressions.CExpr();
                var result1 = expression["htoi"]("10".split(""));
                var result2 = expression["htoi"]("2F".split(""));
                expect(result1).toBe(16);
                expect(result2).toBe(16 * 2 + 15);
            });
        });

        describe("strlen", () => {
            it("should return valid string length", () => {
                var expression = new Expressions.CExpr();
                var result1 = expression["strlen"]("100".split(""));
                var result2 = expression["strlen"]("876abc".split(""), 1);
                var result3 = expression["strlen"]("1\0002\0005\0006".split(""), 4);
                var result4 = expression["strlen"]("200\00001".split(""), 4);
                expect(result1).toBe(3);
                expect(result2).toBe(5);
                expect(result3).toBe(1);
                expect(result4).toBe(2);
            });
        });

        describe("str2hash", () => {
            it("should return valid hash", () => {
                var expression = new Expressions.CExpr();
                var result1 = expression["str2hash"]("testString".split(""));
                var result2 = expression["str2hash"]("1234 345345".split(""));
                var result3 = expression["str2hash"]("xx - (*#(*$#0".split(""));
                var result4 = expression["str2hash"]("1111111111111".split(""));
                expect(result1).toBe(489508);
                expect(result2).toBe(85024);
                expect(result3).toBe(475760);
                expect(result4).toBe(441722);
            });
        });

        describe("chartype", () => {
            it("should return valid character type", () => {
                var expression = new Expressions.CExpr();
                var result1 = expression["chartype"]("5");
                var result2 = expression["chartype"]("A");
                var result3 = expression["chartype"]("(");
                var result4 = expression["chartype"]('"');
                expect(result1).toBe(expression["CHAR_NUM"]);
                expect(result2).toBe(expression["CHAR_LETTER"]);
                expect(result3).toBe(expression["CHAR_LBRACKET"]);
                expect(result4).toBe(expression["CHAR_QUOT"]);
            });
        });
    });
}
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Expressions/Expression.ts" />
module ExprAE.Tests {
    describe("Expression", () => {
        describe("removeSpaces", () => {
            it("should return expression without spaces", () => {
                var expression = new ExprAE.Expressions.Expression()
                var result = expression["removeSpaces"]("x  + y =  2");
                expect(result).toBe("x+y=2");
            });
            it("should return expression without spaces more complex", () => {
                var expression = new ExprAE.Expressions.Expression()
                var result = expression["removeSpaces"]("x  + y *(x-2)+Func(\"a  b   c\") =  2 ");
                expect(result).toBe("x+y*(x-2)+Func(\"a  b   c\")=2");
            })
        });

        describe("atoi", () => {
            it("should return valid converted value", () => {
                var expression = new ExprAE.Expressions.Expression()
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
                var expression = new ExprAE.Expressions.Expression()
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

        describe("strlen", () => {
            it("should return valid string length", () => {
                var expression = new ExprAE.Expressions.Expression()
                var result1 = expression["strlen"]("100".split(""));
                var result2 = expression["strlen"]("876abc".split(""), 1);
                var result3 = expression["strlen"]("1\0002\0005\0006".split(""), 4);
                var result4 = expression["strlen"]("200\00001".split(""),4);
                expect(result1).toBe(3);
                expect(result2).toBe(5);
                expect(result3).toBe(1);
                expect(result4).toBe(2);
            });
        });

        describe("str2hash", () => {
            it("should return valid hash", () => {
                var expression = new ExprAE.Expressions.Expression()
                var result1 = expression["str2hash"]("testString".split(""));
                var result2 = expression["str2hash"]("1234 345345".split(""));
                var result3 = expression["str2hash"]("xx - (*#(*$#0".split(""));
                var result4 = expression["str2hash"]("1111111111111".split(""));
                expect(result1).toBe(489508);
                expect(result2).toBe(85024);
                expect(result3).toBe(475760);
                expect(result4).toBe(441722);
            });
        })
    });
}
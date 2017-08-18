/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Expressions/Expression.ts" />
module ExprAE.Tests {
    describe("Expression", () => {
        describe("removeSpaces", () => {
            it("should return expression wothout spaces", () => {
                var expression = new ExprAE.Expressions.Expression()
                var result = expression["removeSpaces"]("x  + y =  2");
                expect(result).toBe("x+y=2");
            })
        });
    });
}
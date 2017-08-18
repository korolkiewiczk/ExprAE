module ExprAE.Expressions {
    export enum ErrorCodes {
        NoErr = 0,
        NullStr = 1,
        UndefinedName = 2,
        SyntaxError = 3,
        BufOverflow = 4,
        TooManyParams = 5,
        TooFewParams = 6,
        UnreconOp = 7
    }
}
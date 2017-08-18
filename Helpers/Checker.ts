module ExprAE {
    export class Checker {
        static nullEmpty(val: string): boolean {
            return (!val || 0 === val.length);
        }
    }
}
module ExprAE.Drawing {
    export abstract class CWin {
        abstract KeyFunc(k: System.Keys): void;
        abstract Process(): void;
        abstract Change(w: number,h: number,b: number[]): void;
        abstract Change(b: number[]): void;
        abstract ChangeActiveState(state: number): void;
    }
}
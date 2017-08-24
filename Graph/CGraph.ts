module ExprAE.Graph {
    export class CGraph extends Drawing.CWin {
        KeyFunc(k: System.Keys): void {
            throw new Error("Method not implemented.");
        }
        Process(): void {
            throw new Error("Method not implemented.");
        }
        Change(w: number, h: number, b: number[]): void;
        Change(b: number[]): void;
        Change(w: any, h?: any, b?: any) {
            throw new Error("Method not implemented.");
        }
        ChangeActiveState(state: number): void {
            throw new Error("Method not implemented.");
        }

    }
}
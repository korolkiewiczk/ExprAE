/// <reference path="../Drawing/CWin.ts" />
module ExprAE.Graph {
    export class CGraph extends Drawing.CWin {

        posy=0;

        constructor(width: number,
            height: number,
            buf: Uint32Array) {
            super(width, height, buf);
        }

        KeyFunc(k: System.Keys): void {

        }
        Process(): void {
            for(var i=0; i<100; i++) {
                D.SetBuf32(this.buf, this.width, i, 10+this.posy, D.RGB32(0, 0, 0));
                D.SetBuf32(this.buf, this.width, i, 20+this.posy, D.RGB32(255, 0, 0));
                D.SetBuf32(this.buf, this.width, i, 30+this.posy, D.RGB32(0, 255, 0));
                D.SetBuf32(this.buf, this.width, i, 40+this.posy, D.RGB32(0, 0, 255));
            }

            this.posy=(this.posy+10)%this.height;
        }

        Change(w: number, h: number, b: Uint32Array): void;
        Change(b: Uint32Array): void;
        Change(w: any, h?: any, b?: any) {
            this.buf=b;
        }
        ChangeActiveState(state: number): void {
        }

    }
}
/// <reference path="../Drawing/CWin.ts" />

module ExprAE.Graph {

    import keys = ExprAE.System.Keys;
    import sys = ExprAE.System.CSys;

    export class CGraph extends Drawing.CWin {

        posx = 0;
        posy = 0;

        constructor(width: number,
            height: number,
            buf: Uint32Array) {
            super(width, height, buf);
        }

        KeyFunc(k: keys): void {
            if (k == keys.K_UP)
                this.posy -= 10;
            if (k == keys.K_DOWN)
                this.posy += 10;
            if (k == keys.K_RIGHT)
                this.posx += 10;
            if (k == keys.K_LEFT)
                this.posx -= 10;
            if (k == keys.K_PAGE_UP)
                this.posy -= 25;
            if (k == keys.K_PAGE_DOWN)
                this.posy += 25;
        }

        Process(): void {
            this.Clear();
            var mk = sys.MouseKey();
            if (mk) {
                this.posx = sys.getMouseX();
                this.posy = sys.getMouseY();
            }

            for (var i = 0; i < 100; i++) {
                /*D.SetBuf32(this.buf, this.width, i + this.posx, this.posy, D.RGB32(255, 255, 255));
                D.SetBuf32(this.buf, this.width, i + this.posx, 10 + this.posy, D.RGB32(255, 0, 0));
                D.SetBuf32(this.buf, this.width, i + this.posx, 20 + this.posy, D.RGB32(0, 255, 0));
                D.SetBuf32(this.buf, this.width, i + this.posx, 30 + this.posy, D.RGB32(0, 0, 255));*/

                this.Line(this.posx-50, this.posy-50, this.posx + 100, this.posy + (50 - i * 2), D.RGB32(255, 255, 255));
            }

            this.HLine(100, 100, 200, D.RGB32(255, 255, 255));
            this.VLine(100, 100, 200, D.RGB32(255, 255, 255));

            this.Bar(230,230,270,250, D.RGB32(255,0,0));

            this.fontheight=8;
            this.DrawText(500,300,D.RGB32(255,0,0),"A");
            this.DrawText(10, 10, D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");
            this.fontheight=16;
            this.DrawText(10, 30, D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");

            this.DrawText3X5(10, 50, D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");

            this.posy = (this.posy + 1) % this.height;
        }

        ChangeActiveState(state: number): void {
        }

    }
}
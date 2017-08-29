/// <reference path="BiosFont.ts" />
module ExprAE.Drawing {
    export class CWin {

        static FIXED_SHIFT = 10;
        static TEXT_FADE1 = 192;
        static TEXT_FADE2 = 255;
        static TEXT_FADEL = 30;

        protected fontwidth = 8;
        protected fontheight = 8;

        constructor(protected width: number,
            protected height: number,
            protected buf: Uint32Array) {
        }

        GetBuf(): Uint32Array {
            return this.buf;
        }
        KeyFunc(k: System.Keys): void { }
        Process(): void { }
        Change(b: Uint32Array, w?: number, h?: number): void {
            if (w)
                this.width = w;
            if (h)
                this.height = h;
            this.buf = b;
        }

        ChangeActiveState(state: number): void { }

        ChangeFontSize(w: number, h: number) {
            this.fontwidth = w;
            this.fontheight = h;
        }

        PutPixel(x: number, y: number, c: number) {
            if ((x < 0) || (y < 0) || (x >= this.width) || (y >= this.height)) return;
            D.SetBuf32(this.buf, this.width, x, y, c);
        }

        Line(x1: number, y1: number, x2: number, y2: number, col: number) {
            //przytnij linie
            if ((((x1 < 0) && (x2 < 0)) || ((y1 < 0) && (y2 < 0))) ||
                (((x1 >= this.width) && (x2 >= this.width)) || ((y1 >= this.height) && (y2 >= this.height)))) return;

            if (x1 == x2) {
                this.VLine(x1, y1, y2, col);
                return;
            }
            else
                if (y1 == y2) {
                    this.HLine(x1, y1, x2, col);
                    return;
                }

            if ((x1 < 0) || (x2 < 0) || (y1 < 0) || (y2 < 0) ||
                (x1 >= this.width) || (x2 >= this.width) || (y1 >= this.height) || (y2 >= this.height)) {
                var a: number, b: number;
                a = ((y2 - y1) << CWin.FIXED_SHIFT) / (x1 - x2);
                b = -(y1 << CWin.FIXED_SHIFT) - a * x1;
                var left: number, right: number, top: number, bottom: number;
                left = b >> CWin.FIXED_SHIFT;
                right = (a * (this.width - 1) + b) >> CWin.FIXED_SHIFT;
                if (a == 0) a = 1;
                top = (-b / a);
                bottom = ((-((this.height - 1) << CWin.FIXED_SHIFT) - b) / a);
                var ok = 0;

                if ((left <= 0) && (left >= -this.height + 1)) {
                    if (x1 < 0) {
                        x1 = 0;
                        y1 = -left;
                    }
                    else
                        if (x2 < 0) {
                            x2 = 0;
                            y2 = -left;
                        }
                    ok = 1;
                }
                if ((right <= 0) && (right >= -this.height + 1)) {
                    if (x1 >= this.width) {
                        x1 = this.width - 1;
                        y1 = -right;
                    }
                    else
                        if (x2 >= this.width) {
                            x2 = this.width - 1;
                            y2 = -right;
                        }
                    ok = 1;
                }
                if ((top >= 0) && (top < this.width)) {
                    if (y1 < 0) {
                        x1 = top;
                        y1 = 0;
                    }
                    else
                        if (y2 < 0) {
                            x2 = top;
                            y2 = 0;
                        }
                    ok = 1;
                }
                if ((bottom >= 0) && (bottom < this.width)) {
                    if (y1 >= this.height) {
                        x1 = bottom;
                        y1 = this.height - 1;
                    }
                    else
                        if (y2 >= this.height) {
                            x2 = bottom;
                            y2 = this.height - 1;
                        }
                    ok = 1;
                }
                if (ok == 0) return;
                if ((x1 < 0) || (x2 < 0) || (y1 < 0) || (y2 < 0) ||
                    (x1 >= this.width) || (x2 >= this.width) || (y1 >= this.height) || (y2 >= this.height)) return;
            }

            var sx = x2 - x1, sy = y2 - y1;
            var dx1: number, dy1: number, dx2: number, dy2: number;
            if (sx > 0) dx1 = 1; else if (sx < 0) dx1 = -1; else dx1 = 0;
            if (sy > 0) dy1 = 1; else if (sy < 0) dy1 = -1; else dy1 = 0;
            a = Math.abs(sx);
            b = Math.abs(sy);
            if (a > b) {
                dx2 = dx1; dy2 = 0;
            }
            else {
                dx2 = 0; dy2 = dy1;
                var pom = a; a = b; b = pom;
            }
            var s = a / 2;
            var dwsk1 = dx1 + dy1 * this.width, dwsk2 = dx2 + dy2 * this.width;
            var wsk = (y1 * this.width + x1);

            for (var i = 0; i <= a; i++) {
                this.buf[wsk] = col;
                s += b;
                if (s >= a) {
                    s -= a;
                    wsk += dwsk1;
                }
                else {
                    wsk += dwsk2;
                }
            }
        }

        HLine(x1: number, y: number, x2: number, col: number) {
            if ((y < 0) || (y >= this.height)) return;
            if (x1 > x2) { var pom = x1; x1 = x2; x2 = pom; }
            if (x1 < 0) x1 = 0;
            if (x2 >= this.width) x2 = this.width - 1;
            if (x2 - x1 + 1 <= 0) return;
            var pos0 = x1 + y * this.width;
            this.buf.fill(col, pos0, pos0 + x2 - x1 + 1);
        }

        VLine(x: number, y1: number, y2: number, col: number) {
            if ((x < 0) || (x >= this.width)) return;
            if (y1 > y2) { var pom = y1; y1 = y2; y2 = pom; }
            if (y1 < 0) y1 = 0;
            if (y2 >= this.height) y2 = this.height - 1;
            var i = y2 - y1 + 1;
            if (i <= 0) return;
            var bf = (x + y1 * this.width);
            while (i--) {
                this.buf[bf] = col;
                bf += this.width;
            }
        }

        Bar(x1: number, y1: number, x2: number, y2: number, col: number) {
            if (y1 > y2) { var pom = y1; y1 = y2; y2 = pom; }
            if (y1 < 0) y1 = 0;
            if (y2 >= this.height) y2 = this.height - 1;
            if (x1 > x2) { var pom = x1; x1 = x2; x2 = pom; }
            if (x1 < 0) x1 = 0;
            if (x2 >= this.width) x2 = this.width - 1;
            if (x2 - x1 + 1 <= 0) return;
            var i = y2 - y1 + 1;
            if (i <= 0) return;
            var d = x2 - x1 + 1;
            var b = x1 + y1 * this.width;
            while (i--) {
                this.buf.fill(col, b, b + d);
                b += this.width;
            }
        }

        DrawChar8X8(x: number, y: number, pal: number[], c: number) {
            if (y <= -8) return;
            if (y >= this.height) return;
            if (x <= -8) return;
            if (x >= this.width) return;
            var w = 8, h = 8, sw = 0, sh = 0;
            if (x < 0) { sw = -x; x = 0; }
            if (x > this.width - 8) w -= x - (this.width - 8);
            if (y < 0) { sh = -y; y = 0; }
            if (y > this.height - 8) h -= y - (this.height - 8);
            var d = w - sw;
            var wsk = y * this.width + x;
            for (var j = sh; j < h; j++) {
                var line = BiosFont.data[c * 8 + j];
                for (var i = sw; i < w; i++) {
                    if (((line >> (7 - i)) & 0x1) == 1) this.buf[wsk] = pal[j * 8 + i];
                    wsk++;
                }
                wsk += this.width - d;
            }
        }

        DrawChar8X16(x: number, y: number, pal: number[], c: number) {
            if (y <= -16) return;
            if (y >= this.height) return;
            if (x <= -8) return;
            if (x >= this.width) return;
            var w = 8, h = 16, sw = 0, sh = 0;
            if (x < 0) { sw = -x; x = 0; }
            if (x > this.width - 8) w -= x - (this.width - 8);
            if (y < 0) { sh = -y; y = 0; }
            if (y > this.height - 16) h -= y - (this.height - 16);
            var d = w - sw;
            var wsk = y * this.width + x;
            for (var j = sh; j < h; j++) {
                var line = BiosFont8x16.data[c * 16 + j];
                for (var i = sw; i < w; i++) {
                    if (((line >> (7 - i)) & 0x1) == 1) this.buf[wsk] = pal[j * 8 + i];
                    wsk++;
                }
                wsk += this.width - d;
            }
        }

        DrawText(x: number, y: number, color: number, s: string) {
            var pal: number[] = [];
            var ch: number;
            if (this.fontheight < 16) ch = 8; else ch = 16;
            var d = ((CWin.TEXT_FADE2 - CWin.TEXT_FADE1) << CWin.FIXED_SHIFT) / ch;
            var d2 = (CWin.TEXT_FADEL << CWin.FIXED_SHIFT) / ch;
            var f = CWin.TEXT_FADE1 << CWin.FIXED_SHIFT;
            for (var j = 0; j < ch; j++) {
                var cf = f;
                for (var i = 0; i < 8; i++) {
                    pal[j * 8 + i] = this.FadeColor(color, cf >> CWin.FIXED_SHIFT);
                    cf += d2;
                    if (cf > (255 << CWin.FIXED_SHIFT)) cf = (255 << CWin.FIXED_SHIFT);
                }
                f += d;
            }
            for (var i = 0; i < s.length; i++) {
                if (this.fontheight < 16)
                    this.DrawChar8X8(x, y, pal, s.charCodeAt(i));
                else
                    this.DrawChar8X16(x, y, pal, s.charCodeAt(i));
                x += this.fontwidth;
            }
        }

        DrawTextHighlighted(x: number, y: number, color: number, fade: number, s: string) {
            this.DrawText(x,y,color,s);
        }

        DrawText3X5(x: number, y: number, color: number, s: string) {
            if (y + 5 > this.height) return;
            if (y < 0) return;
            var cont = 0;
            var wsk = y * this.width + x;
            for (var k = 0; k < s.length; k++) {
                if (x >= this.width - 4) return;
                if (x < 0) { x += 4; wsk += 4; continue; }
                var c = s.charCodeAt(k);
                if ((c <= ' '.charCodeAt(0)) || (c > '}'.charCodeAt(0))) { x += 4; wsk += 4; continue; }
                if ((c == '&'.charCodeAt(0)) || (c == '|'.charCodeAt(0))) { cont = 1 - cont; if (cont == 0) { continue; } }
                else cont = 0;
                if ((c >= 'a'.charCodeAt(0)) && (c <= 'z'.charCodeAt(0))) c -= 'a'.charCodeAt(0) - 'A'.charCodeAt(0);
                if ((c >= '{'.charCodeAt(0)) && (c <= '}'.charCodeAt(0))) c -= 'z'.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
                c -= ' '.charCodeAt(0) + 1;
                for (var j = 0; j < 5; j++) {
                    for (var i = 0; i < 3; i++) {
                        if (Font3x5.data[c * 3 * 5 + j * 3 + i] == 1) this.buf[wsk] = color;
                        wsk++;
                    }
                    wsk += this.width - 3;
                }
                wsk -= this.width * 5 - 4;
                x += 4;
            }
        }

        FadeColor(c: number, fade: number) {
            return (((((c >> 16) & 255) * fade) << 8) & 0xff0000) | ((((c >> 8) & 255) * fade) & 0xff00) |
                ((((c & 255) * fade) >> 8) & 0xff) | 0xff000000;
        }

        Clear() {
            this.buf.fill(D.RGB32(0, 0, 0), 0, this.buf.length);
        }
    }
}
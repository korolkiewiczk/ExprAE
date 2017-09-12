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
        Change(buf: Uint32Array, width?: number, height?: number): void {
            if (width)
                this.width = width;
            if (height)
                this.height = height;
            this.buf = buf;
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
            var wsk = (y1 | 0) * this.width + (x1 | 0);

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
            var pos0 = (x1 | 0) + (y | 0) * this.width;
            this.buf.fill(col, pos0, pos0 + (x2 | 0) - (x1 | 0) + 1);
        }

        VLine(x: number, y1: number, y2: number, col: number) {
            if ((x < 0) || (x >= this.width)) return;
            if (y1 > y2) { var pom = y1; y1 = y2; y2 = pom; }
            if (y1 < 0) y1 = 0;
            if (y2 >= this.height) y2 = this.height - 1;
            var i = (y2 | 0) - (y1 | 0) + 1;
            if (i <= 0) return;
            var bf = (x | 0) + (y1 | 0) * this.width;
            while (i-- > 0) {
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
            var i = (y2 | 0) - (y1 | 0) + 1;
            if (i <= 0) return;
            var d = (x2 | 0) - (x1 | 0) + 1;
            var b = (x1 | 0) + (y1 | 0) * this.width;
            while (i-- > 0) {
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
            var d = (w - sw) | 0;
            var wsk = (y | 0) * this.width + (x | 0);
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
            var wsk = (y | 0) * this.width + (x | 0);
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
            if (!s) return;
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
            if (!s) return;
            var pal: number[][] = [];
            var ch: number;
            if (this.fontheight < 16) ch = 8; else ch = 16;
            for (var k = 0; k <= System.CSys.Color.length; k++) {
                pal[k] = [];
                var d = (CWin.TEXT_FADE2 - CWin.TEXT_FADE1) / ch;
                var d2 = CWin.TEXT_FADEL / ch;
                var f = CWin.TEXT_FADE1;
                var col: number;
                if (k < System.CSys.Color.length)
                    col = this.FadeColor(System.CSys.Color[k], fade);
                else
                    col = this.FadeColor(color, fade);
                for (var j = 0; j < ch; j++) {
                    var cf = f;
                    for (var i = 0; i < 8; i++) {
                        pal[k][j * 8 + i] = this.FadeColor(col, cf);
                        cf += d2;
                        if (cf > 255) cf = 255;
                    }
                    f += d;
                }
            }
            var palno = System.CSys.Color.length;
            var fcol = 0;
            var num = 0;
            var txt = 0;
            var bsl = 0;
            for (var i = 0; i < s.length; i++) {
                var c = s[i];
                if (fcol == 0) {
                    if (c == '\\') bsl = 1 - bsl;
                    else
                        if ((c == '"') || (c == '\'')) {
                            if (bsl == 0)
                                txt = 1 - txt;
                            bsl = 0;
                            palno = System.CSys.CTxt;
                        }
                        else
                            if (txt == 0) {
                                if (c == '$') num = 1;
                                else
                                    if ((c >= '0') && (c <= '9')) palno = System.CSys.CNum;
                                    else
                                        if (((c >= 'A') && (c <= 'Z')) || ((c >= 'a') && (c <= 'z'))) palno = System.CSys.Color.length;
                                        else {
                                            palno = System.CSys.COp;
                                            num = 0;
                                        }
                                if (num) palno = System.CSys.CNum;
                            }
                            else bsl = 0;
                }
                if (c.charCodeAt(0) <= System.CSys.Color.length) {
                    palno = c.charCodeAt(0) - 1;
                    fcol = 1;
                    continue;
                }
                if (this.fontheight < 16)
                    this.DrawChar8X8(x, y, pal[palno], s.charCodeAt(i));
                else
                    this.DrawChar8X16(x, y, pal[palno], s.charCodeAt(i));
                x += this.fontwidth;
            }
        }

        DrawText3X5(x: number, y: number, color: number, s: string) {
            if (y + 5 > this.height) return;
            if (y < 0) return;
            var cont = 0;
            x = (x | 0);
            var wsk = (y | 0) * this.width + x;
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

        //rysowanie cieniowanego trojkata z 32-bitowym buforem z
        GTriangle_z(xa: number, ya: number, xb: number, yb: number, xc: number, yc: number, ca: number, cb: number, cc: number, pal: Uint32Array, z: number, zbuf: Uint32Array) {
            var left: number = 0, top = 0, right = this.width - 1, bottom = this.height - 1;
            if (((xa < left) && (xb < left) && (xc < left)) || ((ya < top) && (yb < top) && (yc < top)) ||
                ((xa > right) && (xb > right) && (xc > right)) || ((ya > bottom) && (yb > bottom) && (yc > bottom)))
                return;

            //y1<=y2<=y3
            var x1: number;
            var y1: number;
            var x2: number;
            var y2: number;
            var x3: number;
            var y3: number;
            var c1: number;
            var c2: number;
            var c3: number;
            //c1=c2=c3=ca;

            var part: number = 0; //czesc rysowania,obie: domyslnie
            var disp1: number = 0, disp2 = 0; //przesuniecie y
            var _y1: number;
            var _y2: number;
            var _y3: number;     //przyciete y1,y2,y3


            //sortuj wedlug rosnacych wsp. y
            if (ya <= yb) {
                if (yb <= yc) {
                    x1 = xa; y1 = ya; x2 = xb; y2 = yb; x3 = xc; y3 = yc;
                    c1 = ca; c2 = cb; c3 = cc;
                } //ya<=yb<=yc
                else
                    if (ya <= yc) {
                        x1 = xa; y1 = ya; x2 = xc; y2 = yc; x3 = xb; y3 = yb;
                        c1 = ca; c2 = cc; c3 = cb;
                    } //ya<=yc<yb
                    else {
                        x1 = xc; y1 = yc; x2 = xa; y2 = ya; x3 = xb; y3 = yb;
                        c1 = cc; c2 = ca; c3 = cb;
                    } //yc<ya<=yb
            }
            else
            //yb<ya
            {
                if (ya <= yc) {
                    x1 = xb; y1 = yb; x2 = xa; y2 = ya; x3 = xc; y3 = yc;
                    c1 = cb; c2 = ca; c3 = cc;
                } //yb<ya<=yc
                else
                    if (yb <= yc) {
                        x1 = xb; y1 = yb; x2 = xc; y2 = yc; x3 = xa; y3 = ya;
                        c1 = cb; c2 = cc; c3 = ca;
                    } //yb<=yc<ya
                    else {
                        x1 = xc; y1 = yc; x2 = xb; y2 = yb; x3 = xa; y3 = ya;
                        c1 = cc; c2 = cb; c3 = ca;
                    } //yc<yb<ya
            }

            if (y1 == y2) {
                if (x1 > x2) {
                    var pom: number = x2;
                    x2 = x1;
                    x1 = pom;
                    pom = c2;
                    c2 = c1;
                    c1 = pom;
                }
                part = 2;
            }

            if (y2 == y3) {
                if (x2 > x3) {
                    var pom: number = x3;
                    x3 = x2;
                    x2 = pom;
                    pom = c3;
                    c3 = c2;
                    c2 = pom;
                }
                part |= 1;
            }

            if (part == 3) return; //zerowa wysokosc (y1==y2==y3)

            if ((y1 < top) && (y2 >= top)) {
                disp1 = top - y1;
                _y1 = top;
                _y2 = y2;
            }
            else
                if ((y1 < top) && (y2 < top)) {
                    part = 2;
                    disp1 = top - y1;
                    disp2 = top - y2;
                    _y1 = top;
                    _y2 = top;
                }
                else {
                    _y1 = y1;
                    _y2 = y2;
                }

            //dol
            if ((y1 <= bottom) && (y2 > bottom)) {
                part = 1;
                _y2 = bottom;
                _y3 = y3;
            }
            else
                if ((y1 <= bottom) && (y2 <= bottom) && (y3 > bottom)) {
                    _y3 = bottom;
                }
                else {
                    _y3 = y3;
                }

            //rysowanie
            var i: number;
            var y: number;
            var d12: number;
            var d13: number;
            var d23: number;
            var xA: number;
            var xB: number;
            var dc12: number;
            var dc13: number;
            var dc23: number;
            var cA: number;
            var cB: number;
            var wsk: number;
            var zwsk: number;

            if (part != 2) {
                //1 czesc - od y1 do y2

                d12 = ((x2 - x1)) / (y2 - y1);
                d13 = ((x3 - x1)) / (y3 - y1);
                dc12 = ((c2 - c1)) / (y2 - y1);
                dc13 = ((c3 - c1)) / (y3 - y1);
                if (d12 > d13) {
                    var pom: number = d12;
                    d12 = d13;
                    d13 = pom;
                    pom = dc12;
                    dc12 = dc13;
                    dc13 = pom;
                }
                xA = (x1) + disp1 * d12;
                xB = (x1) + disp1 * d13;
                cA = (c1) + disp1 * dc12;
                cB = (c1) + disp1 * dc13;
                y = _y1;
                while (y <= _y2) {
                    var _xA: number = (xA);
                    var _xB: number = (xB);
                    var disp: number;
                    if (!(_xA > right || _xB < left)) {
                        disp = 0;
                        if (_xA < left) { disp = left - _xA; _xA = left; }
                        if (_xB > right) _xB = right;
                        i = _xB - _xA + 1;
                        wsk = (_xA | 0) + (y | 0) * this.width;
                        zwsk = (_xA | 0) + (y | 0) * this.width;

                        var dc: number = ((cB - cA)) / (xB - xA + (1));
                        var c: number = cA + disp * dc;

                        while (i-- > 0) {
                            if (z < zbuf[zwsk]) {
                                this.buf[wsk] = pal[(c | 0)];
                                zbuf[zwsk] = z;
                            }
                            wsk++;
                            zwsk++;
                            c += dc;
                        }
                    }
                    xA += d12;
                    xB += d13;
                    cA += dc12;
                    cB += dc13;
                    y++;
                }

                if (part == 1) return;
            }
            //2 czesc od y2 do y3

            d23 = ((x3 - x2)) / (y3 - y2);
            d13 = ((x3 - x1)) / (y3 - y1);
            dc23 = ((c3 - c2)) / (y3 - y2);
            dc13 = ((c3 - c1)) / (y3 - y1);
            xA = (x2) + disp2 * d23;
            xB = (x1) + (_y2 - y1) * d13;
            cA = (c2) + disp2 * dc23;
            cB = (c1) + (_y2 - y1) * dc13;
            if (xA > xB) {
                var pom: number = d23;
                d23 = d13;
                d13 = pom;
                pom = xB;
                xB = xA;
                xA = pom;
                pom = dc23;
                dc23 = dc13;
                dc13 = pom;
                pom = cB;
                cB = cA;
                cA = pom;
            }
            y = _y2;
            while (y <= _y3) {
                if (xB < xA) xB = xA;
                var _xA: number = (xA);
                var _xB: number = (xB);
                var disp: number;
                if (!(_xA > right || _xB < left)) {
                    disp = 0;
                    if (_xA < left) { disp = left - _xA; _xA = left; }
                    if (_xB > right) _xB = right;
                    i = _xB - _xA + 1;
                    wsk = (_xA | 0) + (y | 0) * this.width;
                    zwsk = (_xA | 0) + (y | 0) * this.width;

                    var dc: number = ((cB - cA)) / (xB - xA + (1));
                    var c: number = cA + disp * dc;

                    while (i-- > 0) {
                        if (z < zbuf[zwsk]) {
                            this.buf[wsk] = pal[(c | 0)];
                            zbuf[zwsk] = z;
                        }
                        wsk++;
                        zwsk++;
                        c += dc;
                    }
                }
                xA += d23;
                xB += d13;
                cA += dc23;
                cB += dc13;
                y++;
            }
        }

        //rysowanie teksturowanego trojkata z 32-bitowym buforem z
        TTriangle_z(xa: number, ya: number, xb: number, yb: number, xc: number, yc: number, fua: number,
            fva: number, fub: number, fvb: number, fuc: number, fvc: number, tex: CTex, ca: number, cb: number, cc: number, z: number, zbuf: number[]) {
            var left: number = 0, top = 0, right = this.width - 1, bottom = this.height - 1;
            if (((xa < left) && (xb < left) && (xc < left)) || ((ya < top) && (yb < top) && (yc < top)) ||
                ((xa > right) && (xb > right) && (xc > right)) || ((ya > bottom) && (yb > bottom) && (yc > bottom)))
                return;

            //y1<=y2<=y3
            var x1: number;
            var y1: number;
            var x2: number;
            var y2: number;
            var x3: number;
            var y3: number;
            var c1: number;
            var c2: number;
            var c3: number;
            //c1=c2=c3=ca;
            var fu1: number;
            var fv1: number;
            var fu2: number;
            var fv2: number;
            var fu3: number;
            var fv3: number;

            var part: number = 0; //czesc rysowania,obie: domyslnie
            var disp1: number = 0, disp2 = 0; //przesuniecie y
            var _y1: number;
            var _y2: number;
            var _y3: number;     //przyciete y1,y2,y3

            //sortuj wedlug rosnacych wsp. y
            if (ya <= yb) {
                if (yb <= yc) {
                    x1 = xa; y1 = ya; x2 = xb; y2 = yb; x3 = xc; y3 = yc;
                    c1 = ca; c2 = cb; c3 = cc;
                    fu1 = fua; fv1 = fva; fu2 = fub; fv2 = fvb; fu3 = fuc; fv3 = fvc;
                } //ya<=yb<=yc
                else
                    if (ya <= yc) {
                        x1 = xa; y1 = ya; x2 = xc; y2 = yc; x3 = xb; y3 = yb;
                        c1 = ca; c2 = cc; c3 = cb;
                        fu1 = fua; fv1 = fva; fu2 = fuc; fv2 = fvc; fu3 = fub; fv3 = fvb;
                    } //ya<=yc<yb
                    else {
                        x1 = xc; y1 = yc; x2 = xa; y2 = ya; x3 = xb; y3 = yb;
                        c1 = cc; c2 = ca; c3 = cb;
                        fu1 = fuc; fv1 = fvc; fu2 = fua; fv2 = fva; fu3 = fub; fv3 = fvb;
                    } //yc<ya<=yb
            }
            else
            //yb<ya
            {
                if (ya <= yc) {
                    x1 = xb; y1 = yb; x2 = xa; y2 = ya; x3 = xc; y3 = yc;
                    c1 = cb; c2 = ca; c3 = cc;
                    fu1 = fub; fv1 = fvb; fu2 = fua; fv2 = fva; fu3 = fuc; fv3 = fvc;
                } //yb<ya<=yc
                else
                    if (yb <= yc) {
                        x1 = xb; y1 = yb; x2 = xc; y2 = yc; x3 = xa; y3 = ya;
                        c1 = cb; c2 = cc; c3 = ca;
                        fu1 = fub; fv1 = fvb; fu2 = fuc; fv2 = fvc; fu3 = fua; fv3 = fva;
                    } //yb<=yc<ya
                    else {
                        x1 = xc; y1 = yc; x2 = xb; y2 = yb; x3 = xa; y3 = ya;
                        c1 = cc; c2 = cb; c3 = ca;
                        fu1 = fuc; fv1 = fvc; fu2 = fub; fv2 = fvb; fu3 = fua; fv3 = fva;
                    } //yc<yb<ya
            }

            if (y1 == y2) {
                if (x1 > x2) {
                    var pom: number = x2;
                    x2 = x1;
                    x1 = pom;
                    pom = c2;
                    c2 = c1;
                    c1 = pom;
                    var fpom: number;
                    fpom = fu2;
                    fu2 = fu1;
                    fu1 = fpom;
                    fpom = fv2;
                    fv2 = fv1;
                    fv1 = fpom;
                }
                part = 2;
            }

            if (y2 == y3) {
                if (x2 > x3) {
                    var pom: number = x3;
                    x3 = x2;
                    x2 = pom;
                    pom = c3;
                    c3 = c2;
                    c2 = pom;
                    var fpom: number;
                    fpom = fu3;
                    fu3 = fu2;
                    fu2 = fpom;
                    fpom = fv3;
                    fv3 = fv2;
                    fv2 = fpom;
                }
                part |= 1;
            }

            if (part == 3) return; //zerowa wysokosc (y1==y2==y3)

            if ((y1 < top) && (y2 >= top)) {
                disp1 = top - y1;
                _y1 = top;
                _y2 = y2;
            }
            else
                if ((y1 < top) && (y2 < top)) {
                    part = 2;
                    disp1 = top - y1;
                    disp2 = top - y2;
                    _y1 = top;
                    _y2 = top;
                }
                else {
                    _y1 = y1;
                    _y2 = y2;
                }

            //dol
            if ((y1 <= bottom) && (y2 > bottom)) {
                part = 1;
                _y2 = bottom;
                _y3 = y3;
            }
            else
                if ((y1 <= bottom) && (y2 <= bottom) && (y3 > bottom)) {
                    _y3 = bottom;
                }
                else {
                    _y3 = y3;
                }

            //rysowanie
            var i: number;
            var y: number;
            var d12: number;
            var d13: number;
            var d23: number;
            var xA: number;
            var xB: number;
            var dc12: number;
            var dc13: number;
            var dc23: number;
            var cA: number;
            var cB: number;
            var du12: number;
            var dv12: number;
            var du13: number;
            var dv13: number;
            var du23: number;
            var dv23: number;
            var uA: number;
            var vA: number;
            var uB: number;
            var vB: number;
            var wsk: number
            var zwsk: number;

            //okresl poziom mipmapy
            var lev: number = 0;
            var fduy: number = Math.abs((fu3 - fu1) * tex.GetSize(0) / (y3 - y1));
            var fdvy: number = Math.abs((fv3 - fv1) * tex.GetSize(0) / (y3 - y1));
            var fdux: number;
            var fdvx: number;
            if ((xa <= xb) && (xb <= xc)) //xa<xb<xc
            {
                fdux = Math.abs((fuc - fua) * tex.GetSize(0) / (xc - xa));
                fdvx = Math.abs((fvc - fva) * tex.GetSize(0) / (xc - xa));
            }
            else
                if ((xa <= xc) && (xc <= xb)) //xa<=xc<=xb
                {
                    fdux = Math.abs((fub - fua) * tex.GetSize(0) / (xb - xa));
                    fdvx = Math.abs((fvb - fva) * tex.GetSize(0) / (xb - xa));
                }
                else
                    if ((xb <= xa) && (xa <= xc)) //xb<=xa<=xc
                    {
                        fdux = Math.abs((fuc - fub) * tex.GetSize(0) / (xc - xb));
                        fdvx = Math.abs((fvc - fvb) * tex.GetSize(0) / (xc - xb));
                    }
                    else
                        if ((xb <= xc) && (xc <= xa)) //xb<=xc<=xa
                        {
                            fdux = Math.abs((fua - fub) * tex.GetSize(0) / (xa - xb));
                            fdvx = Math.abs((fva - fvb) * tex.GetSize(0) / (xa - xb));
                        }
                        else
                            if ((xc <= xa) && (xa <= xb)) //xc<=xa<=xb
                            {
                                fdux = Math.abs((fub - fuc) * tex.GetSize(0) / (xb - xc));
                                fdvx = Math.abs((fvb - fvc) * tex.GetSize(0) / (xb - xc));
                            }
                            else
                                if ((xc <= xb) && (xb <= xa)) //xc<=xb<=xa
                                {
                                    fdux = Math.abs((fua - fuc) * tex.GetSize(0) / (xa - xc));
                                    fdvx = Math.abs((fva - fvc) * tex.GetSize(0) / (xa - xc));
                                }

            var fdy: number = (fduy > fdvy) ? fduy : fdvy;
            var fdx: number = (fdux > fdvx) ? fdux : fdvx;
            var fd: number = (fdy > fdx) ? fdy : fdx;
            if (fd > 1) {
                var l: number = 0;
                while ((fd > 1) && (l < tex.GetMaxLev())) {
                    fd *= 0.5;
                    l++;
                }
                lev = l;
            }
            tex.SetPeekLev(lev);

            if (part != 2) {
                //1 czesc - od y1 do y2

                d12 = ((x2 - x1)) / (y2 - y1);
                d13 = ((x3 - x1)) / (y3 - y1);
                dc12 = ((c2 - c1)) / (y2 - y1);
                dc13 = ((c3 - c1)) / (y3 - y1);
                du12 = Math.floor((fu2 - fu1) * tex.GetSize(lev)) / (y2 - y1);
                dv12 = Math.floor((fv2 - fv1) * tex.GetSize(lev)) / (y2 - y1);
                du13 = Math.floor((fu3 - fu1) * tex.GetSize(lev)) / (y3 - y1);
                dv13 = Math.floor((fv3 - fv1) * tex.GetSize(lev)) / (y3 - y1);
                if (d12 > d13) {
                    var pom: number = d12;
                    d12 = d13;
                    d13 = pom;
                    pom = dc12;
                    dc12 = dc13;
                    dc13 = pom;
                    pom = du12;
                    du12 = du13;
                    du13 = pom;
                    pom = dv12;
                    dv12 = dv13;
                    dv13 = pom;
                }
                xA = (x1) + disp1 * d12;
                xB = (x1) + disp1 * d13;
                cA = (c1) + disp1 * dc12;
                cB = (c1) + disp1 * dc13;
                uA = ((Math.floor(fu1 * tex.GetSize(lev)))) + disp1 * du12;
                vA = ((Math.floor(fv1 * tex.GetSize(lev)))) + disp1 * dv12;
                uB = ((Math.floor(fu1 * tex.GetSize(lev)))) + disp1 * du13;
                vB = ((Math.floor(fv1 * tex.GetSize(lev)))) + disp1 * dv13;
                y = _y1;
                while (y <= _y2) {
                    var _xA: number = (xA);
                    var _xB: number = (xB);
                    var disp: number;
                    if (!(_xA > right || _xB < left)) {
                        disp = 0;
                        if (_xA < left) { disp = left - _xA; _xA = left; }
                        if (_xB > right) _xB = right;
                        i = _xB - _xA + 1;
                        wsk = (_xA | 0) + (y | 0) * this.width;
                        zwsk = (_xA | 0) + (y | 0) * this.width;

                        var du: number = ((uB - uA)) / (xB - xA + (1));
                        var dv: number = ((vB - vA)) / (xB - xA + (1));
                        var u: number = uA + disp * du;
                        var v: number = vA + disp * dv;
                        var dc: number = ((cB - cA)) / (xB - xA + (1));
                        var c: number = cA + disp * dc;

                        while (i--) {
                            if (z < zbuf[zwsk]) {
                                this.buf[wsk] = this.FadeColor(tex.Peek(u, v), c);
                                zbuf[zwsk] = z;
                            }
                            wsk++;
                            zwsk++;
                            u += du;
                            v += dv;
                            c += dc;
                        }
                    }
                    xA += d12;
                    xB += d13;
                    cA += dc12;
                    cB += dc13;
                    uA += du12;
                    vA += dv12;
                    uB += du13;
                    vB += dv13;
                    y++;
                }

                if (part == 1) return;
            }
            //2 czesc od y2 do y3

            d23 = ((x3 - x2)) / (y3 - y2);
            d13 = ((x3 - x1)) / (y3 - y1);
            dc23 = ((c3 - c2)) / (y3 - y2);
            dc13 = ((c3 - c1)) / (y3 - y1);
            du23 = Math.floor((fu3 - fu2) * tex.GetSize(lev)) / (y3 - y2);
            dv23 = Math.floor((fv3 - fv2) * tex.GetSize(lev)) / (y3 - y2);
            du13 = Math.floor((fu3 - fu1) * tex.GetSize(lev)) / (y3 - y1);
            dv13 = Math.floor((fv3 - fv1) * tex.GetSize(lev)) / (y3 - y1);
            xA = (x2) + disp2 * d23;
            xB = (x1) + (_y2 - y1) * d13;
            cA = (c2) + disp2 * dc23;
            cB = (c1) + (_y2 - y1) * dc13;
            uA = ((Math.floor(fu2 * tex.GetSize(lev)))) + disp2 * du23;
            vA = ((Math.floor(fv2 * tex.GetSize(lev)))) + disp2 * dv23;
            uB = ((Math.floor(fu1 * tex.GetSize(lev)))) + (_y2 - y1) * du13;
            vB = ((Math.floor(fv1 * tex.GetSize(lev)))) + (_y2 - y1) * dv13;
            if (xA > xB) {
                var pom: number = d23;
                d23 = d13;
                d13 = pom;
                pom = xB;
                xB = xA;
                xA = pom;
                pom = dc23;
                dc23 = dc13;
                dc13 = pom;
                pom = cB;
                cB = cA;
                cA = pom;
                pom = du23;
                du23 = du13;
                du13 = pom;
                pom = dv23;
                dv23 = dv13;
                dv13 = pom;
                pom = uB;
                uB = uA;
                uA = pom;
                pom = vB;
                vB = vA;
                vA = pom;
            }
            y = _y2;
            while (y <= _y3) {
                if (xB < xA) xB = xA;
                var _xA: number = (xA);
                var _xB: number = (xB);
                var disp: number;
                if (!(_xA > right || _xB < left)) {
                    disp = 0;
                    if (_xA < left) { disp = left - _xA; _xA = left; }
                    if (_xB > right) _xB = right;
                    i = _xB - _xA + 1;
                    wsk = (_xA | 0) + (y | 0) * this.width;
                    zwsk = (_xA | 0) + (y | 0) * this.width;

                    var du: number = ((uB - uA)) / (xB - xA + (1));
                    var dv: number = ((vB - vA)) / (xB - xA + (1));
                    var u: number = uA + disp * du;
                    var v: number = vA + disp * dv;
                    var dc: number = ((cB - cA)) / (xB - xA + (1));
                    var c: number = cA + disp * dc;
                    while (i--) {
                        if (z < zbuf[zwsk]) {
                            this.buf[wsk] = this.FadeColor(tex.Peek(u, v), c);
                            zbuf[zwsk] = z;
                        }
                        wsk++;
                        zwsk++;
                        u += du;
                        v += dv;
                        c += dc;
                    }
                }
                xA += d23;
                xB += d13;
                cA += dc23;
                cB += dc13;
                uA += du23;
                vA += dv23;
                uB += du13;
                vB += dv13;
                y++;
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
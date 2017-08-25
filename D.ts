module ExprAE {
    export class D {
        static RGB32(r = 0, g = 0, b = 0,a = 255): number {
            return (a & 255) << 24 | (b & 255) << 16 | (g & 255) << 8 | r & 255;
        }

        static SetBuf32(buf: Uint32Array, pitch = 0, x = 0, y = 0, c = 0) {
            buf[y * pitch + x] = c;
        }
    }
}
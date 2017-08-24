module ExprAE.System {
    export class Keys {
        static K_UP = 72
        static K_DOWN = 80
        static K_LEFT = 75
        static K_RIGHT = 77
        static K_BKSPACE = 14
        static K_DEL = 83
        static K_HOME = 71
        static K_END = 79
        static K_LSHF = 42
        static K_CTRL = 29
        static K_PGUP = 73
        static K_PGDOWN = 81
        static K_TAB = 15
        static K_ESC = 1
        static K_ENTER = 28
        static K_SPACE = 57
        static K_F1 = 59
        static K_F2 = 60
        static K_F3 = 61
        static K_F4 = 62
        static K_F5 = 63
        static K_F6 = 64
        static K_F7 = 65
        static K_F8 = 66
        static K_F9 = 67
        static K_F10 = 68
        static K_Q = 16
        static K_W = 17
        static K_E = 18
        static K_R = 19
        static K_T = 20
        static K_Y = 21
        static K_U = 22
        static K_I = 23
        static K_O = 24
        static K_P = 25
        static K_A = 30
        static K_S = 31
        static K_D = 32
        static K_F = 33
        static K_G = 34
        static K_H = 35
        static K_J = 36
        static K_K = 37
        static K_L = 38
        static K_Z = 44
        static K_X = 45
        static K_C = 46
        static K_V = 47
        static K_B = 48
        static K_N = 49
        static K_M = 50
        static K_0 = 11
        static K_1 = 2
        static K_MINUS = 12
        static K_EQU = 13
        static K_LSBRACKET = 26
        static K_RSBRACKET = 27
        static K_SEMICOLON = 39
        static K_APOSTROPHE = 40
        static K_SLASH = 53
        static K_BACKSLASH = 43
        static K_TILDE = 41
        static K_EXT0 = 112
        static K_EXT1 = 113
        static K_EXT2 = 114
        static K_EXT3 = 115
        static K_EXT4 = 116
        static K_EXT5 = 117
        static K_EXT6 = 118
        static K_EXT7 = 119
        static K_EXT8 = 120

        private static convertTab: any = {
            K_ESC: 27,
        };

        static Get(keyNum: number): number {
            return Keys.convertTab[keyNum];
        }
    }
}
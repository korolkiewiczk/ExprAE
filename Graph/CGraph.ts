/// <reference path="../Drawing/CWin.ts" />

module ExprAE.Graph {
    
    import keys = ExprAE.System.Keys;
    import csys = ExprAE.System.CSys;
    import cexpr = ExprAE.Expressions.CExpr;

    export class CGraph extends Drawing.CWin {

        static DEFAULT_JWIDTH = 10;
        static POSDELTA = 4;
        static SCALEDELTA = 1.1;
        static MAXFUNCCOUNT = 8;
        static MAXDRAWINGTIME = 0.02;
        static DLINES = 16;
        static MINADELTA = 40;
        static DEFAULTVANLGE = 90*Math.PI/180;
        static DEFAULTR = 40;
        static DEFAULTD = 0.5;
        static MINPROJECTZ = 0.1;
        static DMUL = 0.50132;
        static ZBUFMUL = 64;
        //static GRAPHTAB_SIZE(a) = ((a)*(a)+(2*a));
        static CUBEMAPTEXID = 64;

        static Color: number[] = new Array(
        
            D.RGB32(255,255,255),
            D.RGB32(255,0,0),
            D.RGB32(0,255,0),
            D.RGB32(0,0,255),
            D.RGB32(255,255,0),
            D.RGB32(255,0,255),
            D.RGB32(0,255,255),
            D.RGB32(255,128,0)
        );

        private Palette: number[][] = [];

        private s: number[] = [];
        private cj: number[] = [];
        private cp: number[] = [];
        private j: number[] = [];
        private p: number[] = [];
        
        private reqredraw: number;
        
        private repmode: number;
        private titles: number;
        private axison: number;
        private gridon: number;
        private geps: number; //dokladnosc wynikow w postaci 10^(-geps)
        private fitscr: number; //czy ma dopasowac wykresy do ekranu
        
        private fps: number;        //liczba klatek na sekunde
        private timer: number;      //miernik czasu rysowania
        private frames: number;     //ilosc wygenerowanych klatek
        private timer0: number;     //czas poczatkowy dla liczenia sredniej liczby fps
        private fpsmode: number;    //tryb pokazywania liczby fps'ow
        
        private cursorx: number;
        private cursory: number;
        
        /*zmienne dla funkcji parametrycznej okreslajace przedzial
        zmiennosci zmiennej t (od t1 do t2 ze zmiana dt)*/
        private t1: number;
        private t2: number;
        private nt: number;
        
        //dane dla 3D
        private vangle: number;       //kat widocznosci
        private A: number[] = []; //katy, np. a[AxisZ] oznacza katy obrotu wokol osi OZ
        private R: number;    //promien widocznowsci
        private D: number;    //odleglosci miedzy punktami siatki
        private N: number;      //2*R/D
        
        private width_div_2: number;
        private height_div_2: number;
        private sinax: number;
        private cosax: number;
        private sinay: number;
        private cosay: number;
        private sinaz: number;
        private cosaz: number; //obliczone wczesniej sinusy i cosinusy
        
        private lightdist: number; //odleglosc dla ktorej nie widac juz obiektu
        
        private changepos3dmode: number;           //szybkosc zmainy pozycji w trybie 3d
                                                                                                                                    //0-rowne D, 1-1/256*R
        
        //wlacz lub wylacz zmiane natezenia koloru w zaleznosci od odleglosci
        //jezeli wyl to natezenie zalezy dla kazdego polozenia od lightdist(255-najjasniejsze)
        private holdlight: number;
        
        //jesli wlaczone to modyfikowany jest wektor swiatla
        private modlvec: number;
        
        //punkt kamery
        private xs: number;
        private ys: number;
        private zs: number;
        //punkt kamery zatrzymany
        private hxs: number;
        private hys: number;   //srodek punktu rysowania
        private cx1: number;
        private cy1: number;
        private cx2: number;
        private cy2: number;
        
        //TABLICE DANYCH WYKRESU
        private valtab: number[] = []; //tablica z obliczonymi wartosciami funkcji, przydzielana dynamicznie
        private projecttab: IPOINT[] = []; //tablica przetworzonych-rzutowanych wierzcholkow
        private colortab: number[] = []; //bufor koloru dla rysowania trojkatow
        private normaltab: VEC[] = []; //tablica wektorow normalnych
        private texcoordtab: VEC2[] = []; //tablica wspolzednych tekstury
        
        private zbuf: number[] = [];     //bufor glebi dla softa
        
        //status wykonywanych operacji 0-projectbuf,2-normaltab,4-colortab,6-rysowanie.
        //nieparzyste-w trakcie
        private dstate: number;
        
        private hold: number;        //czy wstrzymac obliczanie valtab-w tym trybie rysowana jest tylko 1 funkcja
        
        //sposoby rysowania w 3D
        private dmethod: number;
        
        //czy oswietlenie
        lighting: number;
        
        //czy oswietlenie rozne dla przedniej i tylnej powierzchni
        twosidelighting: number;
        
        //wektor oswietlenia
        light_vec: number[] = [];

        //listy wyrazen i nazw
        private dexprlist: Expressions.CExpr[] = [];
        private dfuncstruct: FUNCSTRUCT[] = [];
        private dstack: number[] = [];
        private dstackl: number;
        
        //tekstrury dla wykresow
        tex: Drawing.CTex[] = [];
        envmap: Drawing.CTex[] = [];
    
        //wartosci obliczone w celu przyspieszenia obliczen
        private _255_lightdist: number;
        //wyrazenie dla funckcji circlefunc
        private circfunc_expr: Expressions.CExpr;
        private circfunc_dir: number;
        private circfunc_palwsk: number;
        private circfunc_disty: number;
        private circfunc_D2: number; //D*D
        private circfunc_D4: number; //D*D*D*D
        private circfunc_1_2_D: number; //D/2
        private circfunc_constcol: number;
        private circfunc_tex: Drawing.CTex;

        private gms: GAMEMODESTRUCT;
        private gamemodeon: number;
        private physicsmodel: number;

        DMode: number;
        GraphState: number;

        updatepos(): void
        {
            this.cj[Axis.X]=this.j[Axis.X]-this.p[Axis.X]/2/this.s[Axis.X];
            this.cj[Axis.Y]=this.j[Axis.Y]-this.p[Axis.Y]/2/this.s[Axis.Y];
            this.cj[Axis.Z]=this.j[Axis.Z]-this.p[Axis.Z]/2/this.s[Axis.Z];
            this.cp[Axis.X]=this.p[Axis.X]/2-this.s[Axis.X]*this.j[Axis.X];
            this.cp[Axis.Y]=this.p[Axis.Y]/2-this.s[Axis.Y]*this.j[Axis.Y];
            this.cp[Axis.Z]=this.p[Axis.Z]/2-this.s[Axis.Z]*this.j[Axis.Z];
        }
            
        defaults(): void
        {
            this.j[Axis.X]=0;
            this.j[Axis.Y]=0;
            this.j[Axis.Z]=0;
            this.s[Axis.X]=this.p[Axis.X]/CGraph.DEFAULT_JWIDTH;
            if (this.fitscr)
            this.s[Axis.Y]=this.p[Axis.Y]/CGraph.DEFAULT_JWIDTH;
            else
            this.s[Axis.Y]=this.p[Axis.Y]/CGraph.DEFAULT_JWIDTH*this.width/this.height;
            this.s[Axis.Z]=this.p[Axis.Z]/CGraph.DEFAULT_JWIDTH;
            this.A[Axis.X]=0;
            this.A[Axis.Y]=0; //nie uzywane
            this.A[Axis.Z]=0;
            this.t1=-5;
            this.t2 = 5;
            this.nt=1000;
            this.light_vec[0]=0;
            this.light_vec[1]=1;
            this.light_vec[2]=0;
            this.R=CGraph.DEFAULTR;
            this.modlvec=0;
            this.hold=0;
            this.twosidelighting=0;
            this.gamemodeon=0;
            this.gms.player_vel=new VEC();
            this.gms.player_accv=new VEC2();
            this.D=CGraph.DEFAULTD;
            var cx: number;
            var cy: number;
            csys.cursorPos(cx,cy);
            this.cursorx=cx;
            this.cursory=cy;
            this.updatepos();
        }

        genpalettes(): void
        {
            for (var i=0; i<CGraph.MAXFUNCCOUNT; i++) {
                this.Palette[i] = [];
                for (var j = 0; j < 256; j++) this.Palette[i][j] = this.FadeColor(CGraph.Color[i], j);
            }
        }

        FP(j: number, axis: number) {
            return this.s[axis]*j+this.cp[axis];
        }

        FJ(p: number, axis: number) {
            return p/this.s[axis]+this.cj[axis];
        }
        
        axisdelta(axis: number): number
        {
            var d: number;
            var ptab =new Array(1,2,5);
            var m: number;
            var p: number=0;
            var sc=0;
            if (axis == Axis.X) sc = this.width;
            else
                if (axis == Axis.Y) sc = this.height;
            
            d=sc/(this.FJ(sc,axis)-this.FJ(0,axis));
            if (d<CGraph.MINADELTA)
            {
                m=1;
                do
                {
                    p++;
                    if (p>2) {p=0; m*=10;}
                }
                while (d*(ptab[p]*m)<CGraph.MINADELTA);
                return ptab[p]*m;
            }
            if (d>=CGraph.MINADELTA)
            {
                var pm: number;
                var pp: number;
                m=0.1;
                p=2;
                pp=0;
                pm=1;
                while (d*(ptab[p]*m)>=CGraph.MINADELTA)
                {
                    pp=p;
                    pm=m;
                    p--;
                    if (p<0) {p=2; m/=10;}
                }
                return ptab[pp]*pm;
            }
            return 0;
        }

        Is3DMode(): boolean {
            return this.DMode==DrawMode.K3DF2;
        }

        handlemouse(): void
        {
            var cx: number;
            var cy: number;
            csys.cursorPos(cx,cy);
            if ((cx!=this.cursorx)||(cy!=this.cursory))
            {
                if (this.Is3DMode())
                {
                    this.A[Axis.Z]+=(this.cursorx-cx)/100;
                    this.A[Axis.X]+=(this.cursory-cy)/100;
                    csys.cursorPosSet(this.width_div_2, this.height_div_2);
                    cx = this.width_div_2;
                    cy=this.height_div_2;
                }
                this.cursorx=cx;
                this.cursory=cy;
                if (this.reqredraw<1)
                this.reqredraw=1;
                //if (DMode==DrawMode.K2DF1) expr_y=this.FJ(height-this.cursory,Axis.Y);
            }
        }

        ChangePos3D(d: number,anglex: number,anglez: number): void
        {
            if (this.gamemodeon)
            {
                d/=Math.abs(d);
                this.gms.player_accv.u=d*-Math.sin(anglez)*this.gms.player_acc;
                this.gms.player_accv.v=d*Math.cos(anglez)*this.gms.player_acc;
                this.gms.moveplayer|=1;
            }
            else
            {
                this.j[Axis.X]-=d*Math.sin(anglez)*Math.cos(anglex);
                this.j[Axis.Y]+=d*Math.cos(anglez)*Math.cos(anglex);
                this.j[Axis.Z]+=d*Math.sin(anglex);
            }
            this.updatepos();
        }
        
        ChangeScale(d: number,axis: number): void
        {
            this.s[axis]*=d;
            this.updatepos();
        }
        
        SetExpr(name: string, expr: cexpr,color: number,num: number): void
        {
            if (num>=CGraph.MAXFUNCCOUNT)
            {
                this.dexprlist[num%(CGraph.MAXFUNCCOUNT+2)]=expr;
            }
            else
            {
                this.dexprlist[num%CGraph.MAXFUNCCOUNT]=expr;
                this.dfuncstruct[num%CGraph.MAXFUNCCOUNT].color=color%CGraph.Color.length;
                this.dfuncstruct[num%CGraph.MAXFUNCCOUNT].status=1;
            }
        }
        
        DelExpr(num: number): void
        {
            this.dfuncstruct[num%CGraph.MAXFUNCCOUNT].status=0;
            this.NextExpr();
        }
        
        NextExpr(): void
        {
            var k=csys.DColor+1;
            for (var i: number=0; i<CGraph.MAXFUNCCOUNT; i++) 
            if (this.dfuncstruct[(k+i)%CGraph.MAXFUNCCOUNT].status!=0) 
            {
                csys.DColor=(k+i)%CGraph.MAXFUNCCOUNT;
                return;
            }
            csys.DColor=0;
        }
    }

    export class FUNCSTRUCT
    {
        color: number;
        status: number; //0-brak, 1-do rysowania, 2-rysowana
    }
    
    //struktura przechowuje wsp. rzutowanego wiercholka
    export class IPOINT
    {
        x: number;
        y: number;
    }
    
    //przechowuje wektor
    export class VEC
    {
        a: number;
        b: number;
        c: number;
    }
    
    export class VEC2
    {
        u: number;
        v: number;
    }
    
    export class GAMEMODESTRUCT
    {
        grav: number;
        friction: number;
        
        player_height: number;
        player_maxvel: number;
        player_acc: number;
        player_jumpvel: number;
        player_mass: number;
        
        player_vel: VEC;
        player_accv: VEC2;
        
        moveplayer: number;
        
        time: number;
    }

    enum DS
    {
        PROJECT  =0,
        NORMAL   =2,
        COL      =4,
        TEX      =6,
        DRAW     =8
    }
    
    enum DrawMode
    {
        K2DF1,  //uk�ad kartezjanski w 2D, funkcja jedno-argumentowa y=f(x)
        K2DF2,  //uk�ad kartezjanski w 2D, funkcja dwu-argumentowa z=f(x,y)
        K3DF2,  //uk�ad kartezjanski w 3D, funkcja dwu-argumentowa z=f(x,y)
        K2DXY,  //uk�ad kartezjanski w 2D, funkcja parametryczna x=x(t), y=y(t)
        MMAX
    };
    
    enum DrawMethod
    {
        MLINES,
        MFILL,
        MTEX,
        DMMAX
    }
    
    enum Axis
    {
        X,
        Y,
        Z
    }    
}
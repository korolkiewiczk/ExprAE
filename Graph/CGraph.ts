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
        
        private zbuf: Uint32Array;     //bufor glebi dla softa
        
        //status wykonywanych operacji 0-projectbuf,2-normaltab,4-colortab,6-rysowanie.
        //nieparzyste-w trakcie
        private dstate: number;
        
        private hold: number;        //czy wstrzymac obliczanie valtab-w tym trybie rysowana jest tylko 1 funkcja
        
        //sposoby rysowania w 3D
        private dmethod: DrawMethod;
        
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
            this.gms.player_accv=new VEC2(0,0);
            this.D=CGraph.DEFAULTD;
            this.cursorx=csys.getMouseX();
            this.cursory=csys.getMouseY();
            this.updatepos();
        }

        project(x: number,y: number,z: number): VEC2
        {
            if (z<CGraph.MINPROJECTZ) return VEC2.empty();
            var xp = Math.round(x * this.p[Axis.Z] / z) + this.width_div_2;
            var yp=-Math.round(y*this.p[Axis.Z]/z)+this.height_div_2;

            return new VEC2(xp,yp);
        }
        
        sqcircorners(x: number,y: number): VEC2[]
        {
            var x1=Math.floor((x-this.R)/this.D)*this.D;
            var y1=Math.ceil((y+this.R)/this.D)*this.D;
            var x2=Math.ceil((x+this.R)/this.D)*this.D;
            var y2=Math.floor((y-this.R)/this.D)*this.D;

            return new Array(new VEC2(x1,y1), new VEC2(x2,y2));
        }
        
        dotproduct(a: VEC,b: VEC): number
        {
            return a.a*b.a+a.b*b.b+a.c*b.c;
        }

        allocbuffers(): void
        {
           //todo
           this.zbuf=new Uint32Array(this.width*this.height);
        }

        begindrawfunc(): void
        {
            //expr_time=csys.GetTime(); todo
            csys.PresentWait=0;
            this.GraphState = (GraphStateEnum.FillMode * (this.dmethod != DrawMethod.MLINE? 1:0)) |
                (GraphStateEnum.EnableTexture*(this.dmethod==DrawMethod.MTEX?1:0))|
                (GraphStateEnum.EnableLight*(this.lighting>0? 1:0))|
                (GraphStateEnum.Enable3DMode*(this.DMode==DrawMode.K3DF2? 1:0))
        /*#ifdef OPENGL
                |(EnableOpenGL*(gl_used>0))
        #endif*/
            ;
            if (this.DMode == DrawMode.K3DF2)
            {
                //obliczenie sinusow i cosinusow
                this.sinax=Math.sin(this.A[Axis.X]);
                this.cosax=Math.cos(this.A[Axis.X]);
                this.sinay=Math.sin(this.A[Axis.Y]);
                this.cosay = Math.cos(this.A[Axis.Y]);
                this.sinaz=Math.sin(this.A[Axis.Z]);
                this.cosaz=Math.cos(this.A[Axis.Z]);
                if (this.modlvec==1)
                {
                    if (this.light_vec[3]==0)
                    {
                        //ustaw wektor swiatla zgodnie z kierunkiem kamery 
                        this.light_vec[1]=-this.sinax;
                        this.light_vec[2]=this.cosax;
                        this.light_vec[0]=this.light_vec[2]*this.sinaz;
                        this.light_vec[2]=this.light_vec[2]*this.cosaz;
                    }
                    else
                    if (this.light_vec[3]==1)
                    {
                        //ustaw wektor swiatla na pozycji kamery
                        this.light_vec[0]=this.j[Axis.X];
                        this.light_vec[1]=this.j[Axis.Z];
                        this.light_vec[2]=-this.j[Axis.Y];
                    }
                }
                csys.PresentWait=1;
                this.xs=this.j[Axis.X];
                this.ys=this.j[Axis.Y];
                this.zs=this.j[Axis.Z];
        /*#ifdef OPENGL
                if (gl_used)
                {
                    glClearColor(GLCOLOR(csys.Color[csys.CPattern]),1);
                    glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT);
                    glLoadIdentity();
                    glRotatef(-this.A[Axis.X]*(180.0/Math.PI),1,0,0);
                    glRotatef(-this.A[Axis.Z]*(180.0/Math.PI),0,1,0);
                    drawenv();
                    if (this.light_vec[3]==0)
                    glLightfv(GL_LIGHT0,GL_POSITION,(*: GLnumber)&this.light_vec);
                    glTranslatef(-this.j[Axis.X],-this.j[Axis.Z],j[Axis.Y]);
                    if (this.light_vec[3]==1)
                    glLightfv(GL_LIGHT0,GL_POSITION,(*: GLnumber)&this.light_vec);
        /*#ifdef CG
                    if (useshaders==1)
                    {
                        bindcgprogram(1);
                    }
                    else
                    if (useshaders==0)
                    {
                        bindcgprogram(0);
                    }
        #endif
                }
                else
        #endif*/
                if (this.dmethod!=DrawMethod.MLINE)
                {
                    //memset(this.zbuf,0xff,this.width*this.height*4);
                    this.zbuf.fill(0xffffffff);
                }
                if (this.hold==0)
                {
                    this.hxs=this.j[Axis.X];
                    this.hys=this.j[Axis.Y];
                    //this.cx1,cy1,this.cx2,cy2
                    var vec=this.sqcircorners(this.hxs,this.hys);
                    this.cx1=vec[0].u;
                    this.cy1=vec[0].v;
                    this.cx2=vec[1].u;
                    this.cy2=vec[1].v;
                }
                this.allocbuffers();
                csys.PresentWait=1;
            }
            if (this.repmode) csys.PresentWait=1;
        /*#ifdef OPENGL
            if ((!gl_used)||(!this.Is3DMode())) Clear();
            //if (!gl_used) drawenv();
        #else
            Clear();
        #endif*/
            if (this.axison&&(!this.Is3DMode())) this.drawaxis();
            /*cexpr.MultiExec=cexpr.MultiExec_Begin;
            this.dexprlist[CGraph.MAXFUNCCOUNT].Do();
            cexpr.MultiExec=cexpr.MultiExec_Multi;*/
        }
        
        enddrawfunc(): void
        {
            //if (cexpr.MultiExec==cexpr.MultiExec_Once) return;
            if (this.DMode == DrawMode.K3DF2)
            {
        /*#ifdef CG
                if (useshaders==1)
                {
                    bindcgprogram(0);
                }
        #endif*/
                if (this.lighting) this.drawsun();
            }
            
            /*cexpr.MultiExec=cexpr.MultiExec_End;
            this.dexprlist[CGraph.MAXFUNCCOUNT+1].Do();*/
            
            if (this.DMode == DrawMode.K3DF2)
            {
        /*#ifdef OPENGL
                if (gl_used)
                {
                    COpenGL.Present(buf);
                }
        #endif*/
            }
            this.drawinfo();
            if (this.fpsmode==0)
            {
                //if (csys.GetTime()-expr_time>0)   //todo
                //this.fps=1/(csys.GetTime()-expr_time);
            }
            else
            {
                this.fps=this.frames/(csys.GetTime()-this.timer0);
            }
            this.frames++;
            csys.PresentWait=0;
            //cexpr.MultiExec=cexpr.MultiExec_Once;
        }

        drawsun(): void {
            //todo only opengl
        }

        drawaxis(): void
        {
            var bf: string;
            var i: number;
            //rysuj osie
            this.HLine(0,this.height-this.FP(0,Axis.Y),this.width-1,csys.Color[csys.CFaded]);
            this.VLine(this.FP(0,Axis.X),0,this.height-1,csys.Color[csys.CFaded]);
            //pisz wartosci - os x
            var d=this.axisdelta(Axis.X);
            var x1: number;
            var x2: number;
            if (d!=0)
            {
                x1=(this.FJ(0,Axis.X)/d)*d;
                x2=this.FJ(this.width,Axis.X);
            }
            else
            {
                x1=((1/d)*(this.FJ(0,Axis.X)))/(1/d);
                x2=this.FJ(this.width,Axis.X);
            }
            var x: number;
            var y=this.height-this.FP(0,Axis.Y);
            while (x1<=x2)
            {
                if (x1!=0)
                {
                    x=this.FP(x1,Axis.X);
                    if ((x>=0)&&(y>=0)&&(x<this.width)&&(y<this.height))
                    this.PutPixel(x,y,csys.Color[csys.CNum]);
                    if (this.gridon) this.VLine(x, 0, this.height, csys.Color[csys.CFaded]);
                    //sprnumberf(bf0,"%%0.%df",this.geps);
                    //sprnumberf(bf,bf0,x1);
                    bf=x1.toPrecision(this.geps);
                    //i=csys.DiscardZeros(bf);  //ref bf
                    this.DrawText3X5(x-i*2-1,y+2,csys.Color[csys.CNum],bf);
                }
                x1+=d;
            }
            //pisz wartosci - os y
            d=this.axisdelta(Axis.Y);
            var y1: number;
            var y2: number;
            if (d!=0)
            {
                y1=(this.FJ(0,Axis.Y)/d)*d;
                y2=this.FJ(this.height,Axis.Y);
            }
            else
            {
                y1=((1/d)*(this.FJ(0,Axis.Y)))/(1/d);
                y2=this.FJ(this.height,Axis.Y);
            }
            x=this.FP(0,Axis.X);
            while (y1<=y2)
            {
                if (y1!=0)
                {
                    y=this.height-this.FP(y1,Axis.Y);
                    if ((x>=0)&&(y>=0)&&(x<this.width)&&(y<this.height))
                    this.PutPixel(x,y,csys.Color[csys.CNum]);
                    if (this.gridon) this.HLine(0, y, this.width, csys.Color[csys.CFaded]);
                    //sprnumberf(bf0,"%%0.%df",this.geps);
                    //sprnumberf(bf,bf0,y1);
                    bf=y1.toPrecision(this.geps);
                    //i=csys.DiscardZeros(bf);
                    this.DrawText3X5(x+2,y-2,csys.Color[csys.CNum],bf);
                }
                y1+=d;
            }
        }

        drawinfo(): void
        {
            var bf: string;
            var i: number;
            var k: number;
            
            if ((this.titles)&&(this.dfuncstruct[csys.DColor].status!=0))
            {
                //lista funkcji
                i=0;
                for (k=0; k<CGraph.MAXFUNCCOUNT; k++)
                {
                    if (this.dfuncstruct[k].status==0) continue;
                    var c: number;
                    if (csys.DColor==this.dfuncstruct[k].color) c=CGraph.Color[this.dfuncstruct[k].color];
                    else c=this.Palette[this.dfuncstruct[k].color][128];
                    this.DrawText3X5(0,i,c,this.dexprlist[k].getExprStr());
                    i+=5;
                }
                
                //liczba klatek na sek.
                //sprnumberf(bf0,"%%0.%df",this.geps);
                //sprnumberf(bf,bf0,this.fps);
                bf=this.fps.toPrecision(this.geps);
                this.DrawText3X5(this.width-bf.length*4-1,0,csys.Color[csys.CHighlighted],bf);
            
                //pozycja kursora
                var x1=this.FJ(this.cursorx,Axis.X);
                var y1 = this.FJ(this.height - this.cursory, Axis.Y);
                if (!this.Is3DMode())
                {
                    //sprnumberf(bf0,"X=%%0.%df Y=%%0.%df",this.geps,geps);
                    //sprnumberf(bf,bf0,x1,y1);
                    bf="X="+x1.toPrecision(this.geps)+" Y="+y1.toPrecision(this.geps);
                    this.DrawText3X5(this.width - bf.length * 4 - 1, this.height - 5, csys.Color[csys.CHighlighted], bf);
                }
                else
                {
        /*#ifdef OPENGL
                    if (gl_used)
                        this.DrawText(width-7*fontwidth-1,height-fontheight-6,csys.Color[csys.CHelp],"OPENGL");
                    else
        #endif*/
                    this.DrawText(this.width - 8 * this.fontwidth - 1, this.height - this.fontheight - 6, csys.Color[csys.CHelp], "SOFTWARE");
                    this.DrawText3X5(this.width - 8 * this.fontwidth + 1, this.height - 6, csys.Color[csys.CFaded], "R E N D E R E R");
                }
                /*this.HLine(this.cursorx-1,this.cursory,this.cursorx+1,csys.Color[csys.CNormal]);
                this.VLine(this.cursorx,this.cursory-1,this.cursory+1,csys.Color[csys.CNormal]);*/
            
                //wartosci funkcji dla danej pozycji kursora
                if (this.DMode == DrawMode.K2DF1)
                {
                    //expr_x=x1; todo
                    //sprnumberf(bf0,"F(%%0.%df)=%%0.%df",this.geps,geps);
                    bf="F("+x1.toPrecision(this.geps)+")="+this.dexprlist[csys.DColor].do().toPrecision(this.geps);
                    //sprnumberf(bf,bf0,x1,this.dexprlist[csys.DColor].Do());
                }
                else
                    if (this.DMode == DrawMode.K2DXY)
                {
                    //sprnumberf(bf0,"this.t1=%%0.%df t2=%%0.%df n=%%d",this.geps,geps);
                    //sprnumberf(bf,bf0,this.t1,t2,this.nt);
                    bf="t1="+this.t1.toPrecision(this.geps)+" t2="+this.t2.toPrecision(this.geps)+" n="+this.nt.toPrecision(this.geps);
                }
                else
                        if (this.DMode == DrawMode.K2DF2)
                {
                    //expr_x=x1;    //todo
                    //expr_y=y1;
                    //sprnumberf(bf0,"F(%%0.%df,%%0.%df)=%%0.%df",this.geps,geps,this.geps);
                    bf="F("+x1.toPrecision(this.geps)+","+y1.toPrecision(this.geps)+")="+this.dexprlist[csys.DColor].do().toPrecision(this.geps);
                    //sprnumberf(bf,bf0,x1,y1,this.dexprlist[csys.DColor].Do());
                }
                else
                            if (this.DMode == DrawMode.K3DF2)
                {
                    //sprnumberf(bf0,"X=%%0.%df Y=%%0.%df Z=%%0.%df this.D=%%0.%df this.R=%%0.%df V=%%d M=%%dk",
                    //this.geps,geps,this.geps,geps,this.geps);
                    //sprnumberf(bf,bf0,j[Axis.X],j[Axis.Y],j[Axis.Z],this.D,R,this.N*N,csys.MemAvail()/1024);
                    bf="X="+this.j[Axis.X].toPrecision(this.geps)+" Y="+this.j[Axis.Y].toPrecision(this.geps)+
                    " Z="+this.j[Axis.Z].toPrecision(this.geps)+" D="+this.D.toPrecision(this.geps)+
                    " R="+this.R.toPrecision(this.geps)+" V="+(this.N*this.N).toPrecision(this.geps);    //without M
                }
                this.DrawText3X5(0, this.height - 5, CGraph.Color[csys.DColor], bf);
            }
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
            cx = csys.getMouseX();
            cy = csys.getMouseY();
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
        constructor(
        public u: number,
        public v: number) {}

        static empty(): VEC2 {
            return new VEC2(-1000000000,-1000000000);
        }
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
        MLINE,
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

    enum GraphStateEnum
    {
     FillMode=1,
     EnableTexture=2,
     EnableLight=4,
     Enable3DMode=8,
     EnableOpenGL=16
    }
}

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

        KeyFunc(k: number): void
        {
            if (k!=256+keys.K_SHIFT)
            if (this.reqredraw<=1)
            this.reqredraw=1;
            var m=1,s=1,dir=1;
            if (k>>8!=0) {m=4; s=1.2; dir=-1;}
            k&=0xff;
            
            var changepos3ddelta=m;
            if (this.changepos3dmode==0) changepos3ddelta*=this.D;
            else changepos3ddelta*=this.R*(1/256);
            if (k==keys.K_LEFT)
            {
                this.ChangePos(-CGraph.POSDELTA*m,Axis.X);
            }
            else
            if (k==keys.K_RIGHT)
            {
                this.ChangePos(CGraph.POSDELTA*m,Axis.X);
            }
            else
            if (k==keys.K_UP)
            {
                this.ChangePos(CGraph.POSDELTA*m,Axis.Y);
            }
            else
            if (k==keys.K_DOWN)
            {
                this.ChangePos(-CGraph.POSDELTA*m,Axis.Y);
            }
            else
            if (k==keys.K_HOME) 
            {
                this.defaults();
        /*#ifdef OPENGL
                gl_defaults();
        #endif*/
            }
            else
            if (k==keys.K_PAGE_UP)
            {
                if (!this.Is3DMode())
                {
                    this.ChangeScale(CGraph.SCALEDELTA*s,Axis.X);
                    this.ChangeScale(CGraph.SCALEDELTA*s,Axis.Y);
                }
                else
                this.ChangePos(CGraph.POSDELTA*m,Axis.Z);
            }
            else
            if (k==keys.K_PAGE_DOWN)
            {
                if (!this.Is3DMode())
                {
                    this.ChangeScale(1/CGraph.SCALEDELTA/s,Axis.X);
                    this.ChangeScale(1/CGraph.SCALEDELTA/s,Axis.Y);
                }
                else
                this.ChangePos(-CGraph.POSDELTA*m,Axis.Z);
            }
            else
            if (k==keys.K_DELETE)
            {
                this.DelExpr(csys.DColor);
                this.reqredraw=2;
            }
            else
            if ((k==keys.K_TAB)&&(this.hold==0)) this.NextExpr();
            else
            if (k==keys.K_MINUS)
            {
                this.nt-=m*50;
                if (this.nt<50) this.nt=50;
            }
            else
            if (k==keys.K_EQUAL)
            {
                this.nt+=m*50;
            }
            else
            if (k==keys.K_OPEN_BRACKET)
            {
                this.t1-=Math.pow(10,-this.geps+2)*m;
            }
            else
            if (k==keys.K_CLOSE_BRACKET)
            {
                this.t1+=Math.pow(10,-this.geps+2)*m;
            }
            else
            if (k==keys.K_SEMICOLON)
            {
                this.t2-=Math.pow(10,-this.geps+2)*m;
            }
            else
            if (k==keys.K_AMPERSAND)    //todo oryginally apostrophe
            {
                this.t2 += Math.pow(10, -this.geps + 2) * m;
            }
        /*#ifdef CG
            if (k==keys.K_TILDE)
            {
                if (dir<0)
                {
                    if (useshaders>=0)
                    useshaders=1-useshaders;
                }
                else
                {
                    cgs.currentprogram++;
                    if (cgs.currentprogram>=CGPROGRAM_MAX) cgs.currentprogram=0;
                }
            }
            else
            if (k==keys.K_EXT0)
            {
                cgs.currentprogram=CGPROGRAM_DEFAULT;
            }
            else
            if (k==keys.K_EXT1)
            {
                cgs.currentprogram=CGPROGRAM_BM;
            }
            else
            if (k==keys.K_EXT2)
            {
                cgs.currentprogram=CGPROGRAM_ENV;
            }
            else
            if (k==keys.K_EXT3)
            {
                cgs.currentprogram=CGPROGRAM_BMENV;
            }
            else
            if (k==keys.K_EXT4)
            {
                cgs.effect=CGEFFECT_DEFAULT;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT5)
            {
                cgs.effect=CGEFFECT_NEGATIVE;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT6)
            {
                cgs.effect=CGEFFECT_SEPIA;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT7)
            {
                cgs.effect=CGEFFECT_8COLORS;
                loadcgprograms();
            }
            else
            if (k==keys.K_EXT8)
            {
                cgs.effect=CGEFFECT_16COLORS;
                loadcgprograms();
            }
        #endif*/
            else
            if (k==keys.K_Q)
            {
                this.geps+=dir;
                if (this.geps<0) this.geps=0;
                else
                if (this.geps>6) this.geps=6;
            }
            else
            if (k==keys.K_E)
            {
                //todo envmap
                /*if (envmapon>=0)
                envmapon=1-envmapon;*/
            }
            if (k==keys.K_R)
            {
                if (this.gamemodeon==0)
                this.repmode=1-this.repmode;
            }
            else
            if (k==keys.K_Z)
            {
                this.titles=1-this.titles;
            }
            else
            if (k==keys.K_C)
            {
                this.gridon = 1 - this.gridon;
            }
            else
            if (k==keys.K_G)
            {
                this.twosidelighting=1-this.twosidelighting;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
            }
            else
            if ((k==keys.K_H)&&(this.Is3DMode()))
            {
                if (this.hold) this.hold = 0; else this.hold = -1;
            }
            else
            if (k==keys.K_J)
            {
                this.modlvec=1-this.modlvec;
            }
            else
            if (k==keys.K_K)
            {
                this.holdlight=1-this.holdlight;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_L)
            {
                if (dir==1)
                this.lightdist*=CGraph.SCALEDELTA;
                else
                this.lightdist/=CGraph.SCALEDELTA;
                if (this.lightdist<this.D) this.lightdist=this.D;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_X)
            {
                this.axison=1-this.axison;
            }
            else
            if ((k==keys.K_N)&&(this.hold==0)&&(this.Is3DMode()))
            {
                if (dir==1)
                this.D/=2;
                else
                this.D*=2;
                if (this.R<4*this.D) this.D/=2;
                if (this.D<CGraph.DEFAULTD/256) this.D=CGraph.DEFAULTD/256;
                this.reqredraw=2;
            }
            else
            if ((k==keys.K_M)&&(this.hold==0)&&(this.Is3DMode()))
            {
                this.R+=this.D*dir;
                if (this.R<4*this.D) this.R=4*this.D;
                this.reqredraw=2;
            }
            else
            if (k==keys.K_V)
            {
                this.vangle+=dir*(Math.PI/180.0);
                if (this.vangle<(Math.PI/180.0)*5) this.vangle=(Math.PI/180.0)*5;
                if (this.vangle>(Math.PI/180.0)*170) this.vangle=(Math.PI/180.0)*170;
                this.setzdist();
                this.reqredraw=2;
        /*#ifdef OPENGL
                gl_update();
        #endif*/  
            }
            else
            if (k==keys.K_B)
            {
                var prm: number;
                if (this.gamemodeon) 
                {
                    this.gamemodeon=0;
                    this.repmode=prm;
                }
                else
                {
                    this.gamemodeon=1;
                    this.gms.time=csys.GetTime();
                    prm=this.repmode;
                    this.repmode=1;
                }
            }
            else
            if (k==keys.K_SLASH)
            {
                //todo
                /*if (this.physicsmodel==PMODEL_SIMPLE) this.physicsmodel=PMODEL_ACCURATE;
                else
                this.physicsmodel=PMODEL_SIMPLE;*/
            }
            else
            if (k==keys.K_BACK_SLASH)
            {
                this.fpsmode=1-this.fpsmode;
                if (this.fpsmode==1)
                {
                    this.frames=0;
                    this.timer0=csys.GetTime();
                }
            }
            else
            if (k==keys.K_SPACE)
            {
                if (this.gamemodeon) this.gms.moveplayer|=2;
            }
            else
            if ((k==keys.K_0)&&(this.dfuncstruct[csys.DColor].status!=0))
            {
                //todo
                /*var ey=expr_y;
                expr_y=this.FJ(this.height-this.cursory,Axis.Y);
                this.cursorx=this.FP(Findx0(&this.dexprlist[csys.DColor],this.FJ(this.cursorx,Axis.X),this.FJ(this.width,Axis.X)
                ,1/this.s[Axis.X],0.5*Math.pow(10,-this.geps)),Axis.X);
                csys.CursorPosSet(this.cursorx,this.cursory);
                expr_y=ey;*/
            }
            else
            if (k==keys.K_W)
            {
                this.ChangePos3D(changepos3ddelta,this.A[Axis.X],this.A[Axis.Z]);
            }
            else
            if (k==keys.K_S)
            {
                this.ChangePos3D(-changepos3ddelta,this.A[Axis.X],this.A[Axis.Z]);
            }
            else
            if (k==keys.K_A)
            {
                this.ChangePos3D(changepos3ddelta,0,this.A[Axis.Z]+Math.PI/2);
            }
            else
            if (k==keys.K_D)
            {
                this.ChangePos3D(changepos3ddelta,0,this.A[Axis.Z]-Math.PI/2);
            }
            else
            if (k==keys.K_F)
            {
                this.fitscr=1-this.fitscr;
                if (this.fitscr)
                this.s[Axis.Y]/=this.width/this.height;
                else
                this.s[Axis.Y]*=this.width/this.height;
                this.updatepos();
            }
            else
            if (k==keys.K_T)
            {
                if (this.dmethod==DrawMethod.MTEX)
                this.dmethod=DrawMethod.MFILL; else this.dmethod=DrawMethod.MTEX;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
                this.reqredraw=2;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_U)
            {
                if (this.dmethod>DrawMethod.MLINE)
                this.dmethod=DrawMethod.MLINE; else this.dmethod=DrawMethod.MFILL;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
                this.reqredraw=2;
                if (this.hold) this.hold = -1;
            }
            else
            if (k==keys.K_I)
            {
                this.lighting=1-this.lighting;
        /*#ifdef OPENGL
                gl_update();
        #endif*/
                this.reqredraw=2;
                if (this.hold) this.hold = -1;
            }
            if (k==keys.K_P)
            {
                this.changepos3dmode=1-this.changepos3dmode;
            }
        //sterowanie opengl 
        /*#ifdef OPENGL
            else
            if (k==keys.K_O)
            {
                gl_used=1-gl_used;
                if (gl_used)
                gl_update();
                this.reqredraw=2;
                if (this.hold) hold=-1;
            }
            else
            if (k==keys.K_Y)
            {
                gl_cull=1-gl_cull;
                gl_update();
                this.reqredraw=2;
            }
        #endif*/ 
            
            //tryby
            //todo
            //for (var i: number=keys.K_1; i<DrawMode.MMAX+keys.K_1; i++) if (k==i) csys.SetDMode(i-keys.K_1);
            
            //mysz
            var mk=csys.MouseKey();
            if (mk)
            {
                if (this.Is3DMode())
                    this.ChangePos3D(changepos3ddelta / 2 * ((mk == 2) ? -1 : 1), this.A[Axis.X], this.A[Axis.Z]);
                else
                {
                    this.ChangePos(CGraph.POSDELTA * m * (2 * (mk == 1 ? 1 : 0) - 1) * (this.cursorx - this.width_div_2) / 100, Axis.X);
                    this.ChangePos(CGraph.POSDELTA*m*(2*(mk==1?1:0)-1)*(-this.cursory+this.height_div_2)/100,Axis.Y);
                }
            }
        
        /*#ifdef MENU 
            //obsluz menu
            setmenustate();
        #endif*/
        }

        updatepos(): void
        {
            this.cj[Axis.X]=this.j[Axis.X]-this.p[Axis.X]/2/this.s[Axis.X];
            this.cj[Axis.Y]=this.j[Axis.Y]-this.p[Axis.Y]/2/this.s[Axis.Y];
            this.cj[Axis.Z]=this.j[Axis.Z]-this.p[Axis.Z]/2/this.s[Axis.Z];
            this.cp[Axis.X]=this.p[Axis.X]/2-this.s[Axis.X]*this.j[Axis.X];
            this.cp[Axis.Y]=this.p[Axis.Y]/2-this.s[Axis.Y]*this.j[Axis.Y];
            this.cp[Axis.Z]=this.p[Axis.Z]/2-this.s[Axis.Z]*this.j[Axis.Z];
        }

        setzdist(): void { this.p[Axis.Z] = this.width_div_2 / Math.tan(this.vangle / 2); }
            
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

        ChangeActiveState(state: number): void
        {
            if (state == 0) this.enddrawfunc();
            else
            this.reqredraw=3;
        /*#ifdef MENU
            setmenuactivestate(state);
        #endif*/
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

        ChangePos(d: number,axis: number): void
        {
            this.j[axis]+=d/this.s[axis];
            this.updatepos();
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

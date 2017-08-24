module ExprAE {
    export class Main {
        main(): void {
            System.CSys.Init();
            var library=new Expressions.CLib();
            var stdlib=new Expressions.Stdlib();
            stdlib.init(library);

            var expr=new Expressions.CExpr(library);

            /*libwin=new CLibWin(CSys::ScrWidth,CSys::ScrHeight,buf,
                20,20,CSys::ScrWidth-20,CSys::ScrHeight*2/3,library);

            con=new CCon(CSys::ScrWidth,CSys::ScrHeight,buf,comp,libwin);*/
            var graph=new Graph.CGraph(System.CSys.ScrWidth, System.CSys.ScrHeight, System.CSys.getBuf());
            /*sound=new CSound(CSys::ScrWidth,CSys::ScrHeight,buf);
            CGraph::currentgraph=graph;
            CSound::currentsound=sound;
            CCon::currentcon=con;
            CSys::SetDMode(CGraph::K2DF1);
            help=new CHelp(CSys::ScrWidth,CSys::ScrHeight,buf,"readme.txt");
            UserFunc_Init(library);

            CSys::SetWindow(con,CSys::Win_Con);*/
            System.CSys.SetWindow(graph, System.Windows.Win_Graph);
            /*CSys::SetWindow(help,CSys::Win_Help);
            CSys::SetWindow(sound,CSys::Win_Sound);
            CSys::SetWindow(libwin,CSys::Win_Winlib);*/
            //CSys::SetActiveWin(CSys::Win_Con);
            System.CSys.SetActiveWindow(System.Windows.Win_Graph);
            System.CSys.Run();
        }
    }
}
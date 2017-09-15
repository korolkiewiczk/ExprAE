module ExprAE.Libraries {
    export class Images {

        private images: ImageData[] = [];

        constructor(
            private graph: Graph.CGraph
        ) {

        }

        init(lib: Expressions.CLib): Expressions.CLib {
            lib.addList(this.funclist);
            return lib;
        }

        private loadImageBase(done: ICallback, numberOfImage: number = 0): string {
            var th = this;
            const fileUpload = "fileUpload";
            var existing = document.getElementById(fileUpload)
            if (existing) {
                if (numberOfImage==-1) {
                    existing.remove();
                    return "Selector closed";
                }
                return "Selector is opened. Set argument to -1 for closing it.";
            }
            if (numberOfImage<0) {
                return "Argument must be positive";
            }
            var input = document.createElement('input');
            input.id = fileUpload;
            input.type = "file";
            document.getElementsByTagName('body')[0].appendChild(input);

            input.onchange = function (ev: any) {
                var f = ev.target.files[0];
                var fr = new FileReader();

                fr.onload = function (ev2: any) {
                    var image = new Image();
                    image.onload = function () {
                        var t: HTMLImageElement = this as HTMLImageElement;
                        var w = t.width;
                        var h = t.width;

                        var canvas = document.createElement("canvas");
                        canvas.width = w;
                        canvas.height = h;

                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(t, 0, 0);
                        var data: ImageData = ctx.getImageData(0, 0, w, h);
                        
                        done(data);

                        var toRemove = document.getElementById(fileUpload)
                        if (toRemove) {
                            toRemove.remove();
                        }

                        th.images[numberOfImage] = data;
                    }
                    image.src = ev2.target.result;
                };

                fr.readAsDataURL(f);
            }

            return "Select texture";
        }

        private loadImageTex(numberOfFunc: number): string {
            var th=this;
            return this.loadImageBase((data: ImageData) => {
                var tex = new Drawing.CTex();
                
                tex.Load(new Uint8Array(data.data.buffer), data.width, data.height);
                th.graph.loadTex(numberOfFunc, tex);
            }, numberOfFunc);
        }

        private loadImage(numberOfImage: number): string {
            return this.loadImageBase((data: ImageData) => {}, numberOfImage);
        }

        private peek(numberOfImage: number, x: number, y: number): number {
            var img=this.images[numberOfImage];
            if (x<0 || y<0 || x>=img.width || y>=img.height) return 0;
            var pos=((x|0)+(y|0)*img.width) << 2;
            return (img.data[pos]+img.data[pos+1]+img.data[pos+2])*0.001302083;
        }

        private funclist: Expressions.ELEMENT[] = new Array(
            new Expressions.ELEMENT("TEX_LOAD", this.loadImageTex, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0, this),
            new Expressions.ELEMENT("IMG_LOAD", this.loadImage, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0, this),
            new Expressions.ELEMENT("IMG_PEEK", this.peek, Expressions.CLib.VAL_FLOAT, 3, 0, 0, this));
    }
}

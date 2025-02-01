class TileTemplate{
    constructor(type,textures=["textures\\empty.png"],collidable=false){
        this.type=type;
        this.textures=[];
        textures.forEach(texture => {
            var x = new Image();
            x.src=texture;
            x.width = 20;
            x.height = 20;
            this.textures.push(x);
        });
        this.collidable=collidable;
    }

}
const tiletemplates = {
    "000":new TileTemplate("000"),
    "001":new TileTemplate("001"),
    "002":new TileTemplate("002",textures=["textures\\tiles\\platform.png"],collidable=true),
    "003":new TileTemplate("003",textures=["textures\\tiles\\very_detailed_texture.png"],collidable=true),


}
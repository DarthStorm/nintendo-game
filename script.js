//vars
let canvas;
let ctx;
let lvl = loadlevelstring();
let logvar = [];
//l joy & r joy hv different buttons
const left_joystick = {
    x_axis:1,
    y_axis:0,//negate res
    up:15,
    down:14,
    left:12,
    right:13,
    special:17,
    sign:8,
    sl:18,
    sr:19,
    side:4,
    zside:6
    
};
const right_joystick = {
    x_axis:3,//negate res
    y_axis:2,
    up:2,
    down:1,
    left:0,
    right:3,
    special:16,
    sign:9,
    sl:20,
    sr:21,
    side:5,
    zside:7
};

//load assets for now
const bg = new Image();
bg.src = "textures\\bg\\bg1.png";


let gamescreens = [];

//utils but not really
function getScreen(num) {      
    switch (num) {
        case 1:
            return [
                {
                    x:0,
                    y:0,
                    width:canvas.width,
                    height:canvas.height
                }
            ];
        case 2:
            return [
                {
                    x:0,
                    y:0,
                    width:canvas.width/2,
                    height:canvas.height
                },
                {
                    x:canvas.width/2,
                    y:0,
                    width:canvas.width/2,
                    height:canvas.height
                }
            ];
        case 3:
            return [
                {
                    x:0,
                    y:0,
                    width:canvas.width/2,
                    height:canvas.height/2
                },
                {
                    x:canvas.width/2,
                    y:0,
                    width:canvas.width/2,
                    height:canvas.height/2
                },
                {
                    x:0,
                    y:canvas.height/2,
                    width:canvas.width,
                    height:canvas.height/2
                }
            ];
        case 4:
            return [
                {
                    x:0,
                    y:0,
                    width:canvas.width/2,
                    height:canvas.height/2
                },
                {
                    x:canvas.width/2,
                    y:0,
                    width:canvas.width/2,
                    height:canvas.height/2
                },
                {
                    x:canvas.width/2,
                    y:0,
                    width:canvas.width/2,
                    height:canvas.height/2
                },
                {
                    x:canvas.width/2,
                    y:canvas.height/2,
                    width:canvas.width/2,
                    height:canvas.height/2
                }
            ];
        default:
            return [
                {
                    x:0,
                    y:0,
                    width:canvas.width,
                    height:canvas.height
                }
            ];
    }
}

function isTouching(obj1,obj2,must_be_collidable=false){
    if (((obj1 instanceof Tile && !tiletemplates[obj1.type].collidable) || (obj2 instanceof Tile && !tiletemplates[obj2.type].collidable)) && must_be_collidable){
        return false;
    }
    if (obj1.x + obj1.width <= obj2.x || obj1.x >= obj2.x + obj2.width ){
        return false;
    } else if (obj1.y + obj1.height <= obj2.y ||  obj1.y >= obj2.y + obj2.height){
        return false;
    } else{
        return true;
    }
}

function loadlevelstring() {
    let lvl = [];
    levelstr.split("\n").forEach(row => {//break down into row of ["001001001001", ...... , "001001002002"]
        lvl.push(row.match(/.{1,3}/g) ?? []);
        /*
        [
            [001,001,001],
            [001,001,001],
            [001,002,001],
        ]
        add players later
        */
    });
    return lvl;
}



window.onload = function(){
    if(!!navigator.getGamepads){
        console.log("Program initialized, Gamepad API available.");
    }else{
        console.log("Program initialized, Gamepad API not available.");

    }

    try {
        !!new Blob;
    } catch (e) {
        console.log("Error loading Blob");

    }

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    //until i implement 4p, 2p is tmp fixed
    gamescreens.push(new GameScreen(getScreen(2)[0],left_joystick));
    gamescreens.push(new GameScreen(getScreen(2)[1],right_joystick));

    let x = setInterval(loop,30);
}

class Player{
    constructor(x,y,name = "Player",width=20,height=20,joystick_type=left_joystick){
        this.spawnx = x; 
        this.spawny = y;
        this.name = name;
        this.width = width;
        this.height = height;
        this.dir = 1;//-1=left, 0=none,1=right

        this.init = true;
        this.joystick_type = joystick_type;
        this.godmode = false;
        this.respawn();
    }

    respawn(){
        this.x = this.spawnx;
        this.y = this.spawny;
        this.dir = 1;
        this.xv = 0;
        this.yv = 0;

        this.airtime = 0;
        this.jumpcount = 2;
        this.jumptimer = 0;
        this.uptimer = 0;
        this.color = [202,19,81];
    }
    
    handleVariables(screen,gamepad){
        // transforms input into values, like velocity and stuff, doesnt actually move the player
        
        if (gamepad == null) {
            return;
        }
        let input = this.joystick_type;
        if (!this.init){
            if (gamepad.buttons[input.sl].pressed && gamepad.buttons[input.sr].pressed){
                this.init = true;
            }
            return
        }
        if (this.godmode){
            this.color = [255,255,255];
            this.xv += (gamepad.axes[input.x_axis] * (this.joystick_type == left_joystick?1:-1)) * 2;
            this.xv *= 0.85;
            this.yv += (gamepad.axes[input.y_axis] * (this.joystick_type == left_joystick?-1:1)) * 2
            this.yv *= 0.85;
        } else {
            if (gamepad.buttons[input.sl].pressed && gamepad.buttons[input.sr].pressed){
                this.respawn();
                return;
            }

            this.color = [202,19,81];

            this.xv += (gamepad.axes[input.x_axis] * (this.joystick_type == left_joystick?1:-1)) * 2;
            this.xv *= 0.85;
            
            this.yv += 1
            this.airtime += 1
            this.jumptimer -= 1
            if (this.airtime < 3){
                this.jumpcount = 0
            }

            if (gamepad.buttons[input.up].pressed) {
                this.uptimer += 1
            } else {
                this.uptimer = 0
            }

            // if (gamepad.buttons[input.up].pressed && this.jumpcount < 3){
            //     this.yv = -15
            //     this.jumpcount += 1
            // }

            if (this.uptimer == 1){
                //start to parse jump
                if (this.jumptimer <= 0 && this.jumpcount < 3){
                    this.jumptimer = 10;
                    this.jumpcount += 1
                    this.yv = -15
                }
                //this.yv = -15;
            } 
        }
           
    }
    draw(screen){
        if(!this.init){
            screen.playerinit.push(this.name);
            return;
        }
        screen.ctx.fillStyle = "#" 
        + (this.color[0] > 255?255:this.color[0]).toString(16) 
        + (this.color[1] > 255?255:this.color[1]).toString(16) 
        + (this.color[2] > 255?255:this.color[2]).toString(16);
        screen.ctx.fillRect(this.x-screen.camx,this.y-screen.camy,this.width,this.height);
        

        screen.ctx.font = "13px F Float Drink, monospace";
        screen.ctx.fillStyle = "#FFFFFF";
        let msg = this.name;
        let w = screen.ctx.measureText(msg).width;
        screen.ctx.fillText(msg,(this.x - screen.camx - w/4),(this.y - screen.camy - this.height -3));

    }

    collideAndMove(screen){
        
        if (this.godmode){

        } else {
            let steps = Math.ceil(Math.abs(this.xv)+Math.abs(this.yv))
            let lastval = 0;
            for (let i = 0; i < steps; i++) {
                lastval = this.x;
                this.x += this.xv / steps;
                for (let i = 0; i < screen.touchingPlayerTiles.length; i++) {
                    if (isTouching(this,screen.touchingPlayerTiles[i],true)) {
                        this.x = lastval;
                        this.xv = 0;
                        this.touchingX = true;
                        break;
                    }
                }
                lastval = this.y;
                this.y += this.yv / steps;
                for (let i = 0; i < screen.touchingPlayerTiles.length; i++) {
                    if (isTouching(this,screen.touchingPlayerTiles[i],true)) {
                        if (lastval - this.y < 0){this.airtime = 0;}
                        this.y = lastval;
                        this.yv = 0;
                        this.hanging = false;
                        break;
                    }
                }
            }
        }
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        if (this.init) {
            screen.camx = this.x + this.width/2 - screen.dimensions.width/2;
            screen.camy = this.y + this.height/2 - screen.dimensions.height/2;
        }
    }
}

class Tile{
    constructor(x,y,type,width,height){
        this.x = x*width;
        this.y = y*height;
        this.tgx = x;
        this.tgy = y;
        this.type = type;
        this.width = width;
        this.height = height;
    }

    loopTile(dir,dist){
        if (dir == "x") {
            this.x += dist * screen.tile_size;
            this.tgx += dist;

        } else if (dir == "y") {
            this.y += dist * screen.tile_size;
            this.tgy += dist;
        }
        try {
            this.type = lvl[this.tgy][this.tgx] ?? "001";
        } catch (error) {
            this.type = "001";
        }

    }
    tick(screen){
        // if (this.x - screen.camx < -screen.dimensions.width/2-screen.tile_size || this.x - screen.camx > screen.dimensions.width*1.5 + screen.tile_size) {
        //     this.loopTile("x",this.x < screen.camx?screen.tiles_count_x:-screen.tiles_count_x);
        // }
        // if (this.y - screen.camy < -screen.dimensions.height/2-screen.tile_size || this.y - screen.camy > screen.dimensions.height*1.5 + screen.tile_size) {
        //     this.loopTile("y",this.y < screen.camy?screen.tiles_count_y:-screen.tiles_count_y);
        // }
        
        // this.tgx = Math.floor((this.x + screen.camx)/screen.tile_size)
        // this.tgy = Math.floor((this.y + screen.camy)/screen.tile_size)

        try {
            this.type = lvl[this.tgy][this.tgx] ?? "001";
        } catch (error) {
            logvar.push(this.tgx,this.tgy,this.type)
            this.type = "001";
        }


        // SCREW OPTIMATIONS WE DONT NEED THEM

        
        if (this.x-screen.camx < -screen.player.x-2*screen.tile_size || this.x-screen.camx > screen.player.x + screen.player.width + 2*screen.tile_size){return;}
        if (this.y-screen.camy < -screen.player.y-2*screen.tile_size || this.y-screen.camy > screen.player.x + screen.player.height + 2*screen.tile_size){return;}

        screen.touchingPlayerTiles.push(this)
    }

    draw(){
        //drawing in screen
    }
}

class GameScreen{
    /*Class for a screen, does all the drawing for that part and draws it onto the main canvas*/
    constructor(dimensions,joystick_type){
        this.dimensions = dimensions;
        this.joystick_type = joystick_type;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;
        this.ctx = this.canvas.getContext("2d");
        
        this.tile_size = 64;
        //screw optimisation
        this.tiles_count_x = lvl.length;
        this.tiles_count_y = lvl[0].length;

        this.tiles = [];
        for (let y = 0; y < this.tiles_count_y; y++) {
            for (let x = 0; x < this.tiles_count_x; x++) {
                try {
                    this.tiles.push(new Tile(x, y,lvl[y][x]??"001",this.tile_size,this.tile_size));
                } catch (e) {
                    this.tiles.push(new Tile(x, y,"001",this.tile_size,this.tile_size));
                }
            }
        }

        this.touchingPlayerTiles = [];

        this.player = new Player(528,812);

        this.camx = 0;
        this.camy = -480;

    }

    tick(){
        this.touchingPlayerTiles = [];
        this.player.handleVariables(this,navigator.getGamepads()[0])
        this.tiles.forEach(tile => {
            if (tile.x-this.camx < -this.tile_size ||tile.x-this.camx > (this.dimensions.width+this.tile_size)){return;}
            if (tile.y-this.camy < -this.tile_size ||tile.y-this.camy > (this.dimensions.height+this.tile_size)){return;}
            tile.tick(this);
        });
        //update tiles collidinh b4 update player
        this.player.collideAndMove(this)
    }

    draw(){
        this.ctx.drawImage(bg,0,0,this.dimensions.width,this.dimensions.height)

        //tiles first
        this.tiles.forEach(tile => {
            tile.draw();//dummy
            this.drawTile(tile);
            //this.ctx.fillText("Tile",tile.x,tile.y)
        });
        
        this.player.draw(this)

        //to get it onto main
        ctx.drawImage(this.canvas,this.dimensions.x,this.dimensions.y);
    }

    drawTile(tile){
        if (tile.x-this.camx < -this.tile_size ||tile.x-this.camx > (this.dimensions.width+this.tile_size)){return;}
        if (tile.y-this.camy < -this.tile_size ||tile.y-this.camy > (this.dimensions.height+this.tile_size)){return;}
        this.ctx.drawImage(tiletemplates[tile.type].textures[0],tile.x-this.camx,tile.y-this.camy,tile.width,tile.height);
        
    }
}


function loop() {
    gamescreens.forEach(gs => {
        gs.tick();
    });
    gamescreens.forEach(gs => {
        gs.draw();
    });
}

document.addEventListener("keydown", function(e){
    gamescreens.forEach(gs => {
        if (e.key == " ") {
            gs.player.x += 1;
        } else {
            gs.player.x -= 1;
        }    
        console.log(gs.camx,gs.tile_size,gs.camx%gs.tile_size);
    })
})
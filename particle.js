class Particle{
    constructor(x,y,textures,change_texture_interval,xv=0,yv=0,expire=null){
        this.x = x;
        this.y = y;
        this.xv = xv;
        this.yv = yv;
        this.textures = [];
        textures.forEach(texture => {
            let x = new Image()
            x.src = texture;
            this.textures.push(x);
        });
        this.change_texture_interval = change_texture_interval;
        this.timer = 0;
        this.expire = expire;//num or undefined
        this.texture = 0;
        particles.push(this);
        
    }
    tick(){
        this.timer += 1
        this.x += this.xv;
        this.y += this.yv;
        
        if(this.timer % this.change_texture_interval == 0){
            this.texture += 1
        }
        if (this.expire != null) {
            if (this.timer > this.expire){
                particles.pop(this)
            }
        }
    }
    draw(){
        try {
            ctx.drawImage(this.textures[this.texture], this.x-CAMX, this.y-CAMY);
        } catch (error) {
            particles.pop(this)
        }
    }
};
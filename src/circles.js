function circleAnim() {
    let obj = {
        res: 5,
        a: 0.5,
        b: 0.1,
        n_circ_min: 7,
        n_circ: 10,
        off_r: 1400,
        off_b_r: 400,
        inv_r: 10,
        inner_rs: [],
        cent: [400,400,400],
        first_t: 0,
        prev_t: 0,
        enabled: false,

        transCirc(x,y,r) {
            let xo=x+this.x_off, yo=y+this.y_off;
            let d = this.inv_r*this.inv_r/(xo*xo + yo*yo - r*r); //xoxo yoyo
            let new_r = Math.sqrt(xo*xo*d*d+yo*yo*d*d-this.inv_r*this.inv_r*d);
            return [xo*d, yo*d, new_r];
        },
        
        drawCirc(x,y,r,blk=false) {
            let coord = this.transCirc(x,y,r);

            this.ctx.beginPath();
            this.ctx.arc(this.cent[0] + this.cent[2]*(coord[0]-this.bounds[0])/this.bounds[2], this.cent[0] + this.cent[2]*(coord[1]-this.bounds[1])/this.bounds[2], this.cent[2]*coord[2]/this.bounds[2], 0, 2*Math.PI);
            this.ctx.closePath();

            if (blk) {
                this.ctx.strokeStyle = "white";
                this.ctx.fillStyle = "rgba(0,0,0,0.4)";
                this.ctx.fill();
            } else {
                this.ctx.strokeStyle = "black";
                this.ctx.fillStyle = "rgba(240,240,240,0.3)";
                this.ctx.fill();
            }

            this.ctx.stroke();
        },

        step(timestamp) {
            // this.ctx.fillStyle = "rgba(240,240,240,0.05)";
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let t_div = (timestamp-this.first_t)/1000;

            this.x_off = this.off_b_r*Math.cos(this.b*t_div)+this.off_r*Math.cos(this.a*t_div)-this.cent[0];
            this.y_off = this.off_b_r*Math.sin(this.b*t_div)+this.off_r*Math.sin(this.a*t_div)-this.cent[1];
            this.bounds = this.transCirc(...this.cent);

            for (let k=this.n_circ_min; k<this.n_circ; k++) {
                for (let i=0; i<k; i++) {
                    let phase = k*t_div/10 + (Math.PI*2*i)/k;
                    this.drawCirc(this.cent[0]+(this.cent[2]-this.inner_rs[k])*Math.cos(phase), this.cent[1]+(this.cent[2]-this.inner_rs[k])*Math.sin(phase), this.inner_rs[k]);
                }

                this.drawCirc(this.cent[0], this.cent[1], this.cent[2]-2*this.inner_rs[k], true);
            }

            this.prev_t = timestamp;
            if (this.enabled) window.requestAnimationFrame(this.step.bind(this));
        },
        enable() {
            this.enabled=true;
            this.first_t = this.prev_t;
            window.requestAnimationFrame(this.step.bind(this));
        },
        disable() {
            this.enabled=false;
        }
    };

    for (let k=obj.n_circ_min; k<obj.n_circ; k++) {
        let side_len = obj.cent[2]*Math.sin(Math.PI/k);
        obj.inner_rs[k] = obj.cent[2]*side_len/(obj.cent[2]+side_len);
    }

    window.addEventListener("load", () => {
        obj.canvas = document.getElementById("circles");
        obj.ctx = obj.canvas.getContext('2d');

        // obj.ctx.fillStyle = "rgba(240,240,240,0.1)";
        obj.ctx.lineWidth=1;
    });

    return obj;
}

export {circleAnim};
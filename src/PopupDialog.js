export class Dialog {
    constructor(character_name, dialog) {
        this.character_name = character_name;
        this.dialog = dialog;
    }
}
export class PopupDialog {
    constructor (scene, text_chains, on_close_closure) {
        this.on_close_closure = on_close_closure;
        this.text_chains = text_chains;
        this.chain_idx = 0;
        // super('PopupDialog');

        const canvas_width = scene.game.config.width;
        const canvas_height = scene.game.config.height;
        this.offset_y = (canvas_height*3)/4;
        this.img = scene.add.image(0, this.offset_y, 'popup_dialog')
            .setAlpha(0)
            .setOrigin(0)
            .setScale(1)
            .setDepth(999)
            .setInteractive({ useHandCursor: true });
        
        this.img.on('pointerdown', () => {
            this.next_text();
        });

        this.set_character_name(scene, 0);
        
        this.dialog = scene.add.text(
            16,
            this.offset_y+16*3,
            '',
            this.font(16)
        ).setOrigin(0)
         .setAlpha(0)
         .setDepth(1000);
         
        this.click_to_continue = scene.add.text(
            canvas_width-16,
            canvas_height-16,
            'click to continue...',
            this.font(16)
        ).setOrigin(1)
         .setAlpha(0)
         .setDepth(1000);
            
        this.start_time = false;
        this.should_start = false;
        this.opened=false;
        this.char_rate = 30;
        this.text_idx = 0;
        this.delay_start_time = false;
        this.delay = 0;
        this.should_display = false;
        this.transition_time = 500;
        this.request_close = false;
        this.closed = false;
    }

    set_character_name(scene, alpha=1) {
        if(this.character_name_text) {
            this.character_name_text.setText(this.text_chains[this.chain_idx].character_name)
        } else{
            this.character_name_text = scene.add.text(
                16,
                this.offset_y+16,
                this.text_chains[this.chain_idx].character_name,
                this.font(16)
            ).setOrigin(0)
             .setAlpha(alpha)
             .setDepth(1000);
        }
    }

    next_text() {
        if(this.chain_idx < this.text_chains.length) {
            var dialog_len = this.text_chains[this.chain_idx].dialog.length;

            if(this.text_idx < dialog_len-1) {
                this.update_dialog(dialog_len-1);
            } else {
                this.start_time = false;
                this.chain_idx += 1;
                this.text_idx = 0;
                if(this.chain_idx == this.text_chains.length) {
                    this.request_close = true;
                }
            }
        }
        
    }

    update_dialog(idx) {
        var dialog_len = this.text_chains[this.chain_idx].dialog.length;
        if(dialog_len+1>idx) {
            if(idx>this.text_idx) {
                this.text_idx = idx;
            }
        }
        this.dialog.setText(this.text_chains[this.chain_idx].dialog.substring(0,this.text_idx));
    }


    font(font_size) {
        return {
            fontFamily: 'serif',
            fontSize: font_size,
            color: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 0,
            align: 'center'
        };
    }

    display(delay=0) {
        this.should_display = true;
        this.delay = delay;
    }

    play() {
        this.should_start = true;        
    }

    open_dialog(scene) {
        this.set_alpha(scene, 1);
        this.opened = true;
    }

    close_dialog(scene) {
        this.set_alpha(scene, 0);
        this.opened = false;
        this.request_close = false;
        this.should_display = false;
        this.delay_start_time =false;
        this.should_start = false;
        this.closed = true;
    }

    set_alpha(scene, alpha) {
        scene.tweens.add({
            targets: [
                this.img,
                this.character_name_text,
                this.dialog,
                this.click_to_continue
            ],
            duration: this.transition_time,
            alpha: alpha
        });
    }

    update(scene, time) {
        if(this.request_close) {
            this.close_dialog(scene);
            this.delay_start_time = time;
        }
        if(this.closed) {
            var dt = time - this.delay_start_time;
            if(dt>this.transition_time) {
                this.on_close_closure(scene);
            }
        }
        if(this.should_display && !this.delay_start_time) {
            this.delay_start_time = time;
        }
        
        if(this.delay_start_time) {
            var dt = time - this.delay_start_time;
            if(dt>this.delay && !this.opened) {
                this.open_dialog(scene);
            }
            if(dt > this.delay + this.transition_time) {
                this.play();
            }
        }
        if(this.should_start) {
            if(!this.start_time) {
                this.start_time = time;
            }
            var dt = time-this.start_time;
            var idx = Math.floor(dt/this.char_rate);
            this.set_character_name(scene);
            this.update_dialog(idx);
        }
    }
}
export default PopupDialog;

import { Scene } from "phaser";

export default class Menu extends Scene{
    preload(){
        this.load.image('bg', '/bg.jpg')
        this.load.image('pizza', '/pizza.png')
    }

    create(){
        this.add.image(0, 0, 'bg').setOrigin(0, 0)
        this.add.image((this.game.config.width / 2) - 140 , (this.game.config.height / 2) - 29 , 'pizza').setScale(0.1)
        this.add.text((this.game.config.width / 2) - 140 , this.game.config.height / 2 , 'WELCOME TO THE ALIEN PITZZER')
        this.add.text((this.game.config.width / 2) - 120 , (this.game.config.height / 2) + 40 , "PRESS 'SPACE' TO CONTINUE")
    
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game')
        });
    }
}
import { Math, Scene } from "phaser";

export default class Game extends Scene {
    constructor() {
        super('Game');
        this.keys = null;
        this.ship = null;
        this.shipSpeed = 4;
        this.bullets = null;
        this.bulSpeed = 500;
        this.canShot = true;
        this.enemy = null;
        this.bosses = null;
        this.bossDefeated = false;
        this.bossesD = {
            '1000': { name: 'Crazy Alien (Driver)', health: 1100, image: 'boss' }
        }
        this.score = 0;
        this.scoreText = null;
        this.rejected = 0;
        this.rejectText = null;
        this.potionSpawned = true;
        this.isOver = false;
        this.centerX = null;
        this.centerY = null;
        this.hp = 3;
        this.hearts = [];
        this.bossEffect = true;
    }

    preload() {

        // Background
        this.load.image('bg', '/bg.jpg')

        // Player Ship Image
        this.load.image('ship', '/spaceship.png');

        // Enemy Ship Image
        this.load.image('enemyShip', '/enemyship.png');

        // Bosses Images
        this.load.image('boss', '/bosses/boss.png')

        // Bullets Image
        this.load.image('bullet', '/spacebullet.png');

        // Potion Images
        this.load.image('speed', '/posions/speed.png')
        this.load.image('health', '/posions/health.png')
        this.load.image('bullSpeed', '/posions/bulSpeed.png')

        // Heart Image
        this.load.image('heart', '/heart.png')

        // Sprite Sheet Images
        this.load.image('ani1', '/animation/Explosion/Explosion_1.png');
        this.load.image('ani2', '/animation/Explosion/Explosion_2.png');
        this.load.image('ani3', '/animation/Explosion/Explosion_3.png');
        this.load.image('ani4', '/animation/Explosion/Explosion_4.png');
        this.load.image('ani5', '/animation/Explosion/Explosion_5.png');
        this.load.image('ani6', '/animation/Explosion/Explosion_6.png');
        this.load.image('ani7', '/animation/Explosion/Explosion_7.png');
        this.load.image('ani8', '/animation/Explosion/Explosion_8.png');
        this.load.image('ani9', '/animation/Explosion/Explosion_9.png');
        this.load.image('ani10', '/animation/Explosion/Explosion_10.png');

        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
    }

    create() {

        // Background
        this.add.image(0, 0, 'bg').setOrigin(0, 0)

        // Keys On Keyboard
        this.keys = this.input.keyboard.createCursorKeys();

        // Texts
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px' });
        this.rejectText = this.add.text(this.game.config.width - 300, 16, 'Rejecteds: 0', { fontSize: '32px' });

        // Hearts
        for (let i = 0; i < this.hp; i++) {
            this.hearts.push(this.add.image(30 + (i * 40), 70, 'heart').setScale(0.0700))
        }

        // Player Ship
        this.ship = this.physics.add.image(this.centerX, this.centerY, 'ship').setScale(0.4);
        this.ship.setCollideWorldBounds(true);
        this.bullets = this.physics.add.group();

        // Enemy Ship
        this.enemy = this.physics.add.group();

        // Bosses
        this.bosses = this.physics.add.group();
        this.bossBulet = this.physics.add.group();
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.bossShooting()
            }
        })

        // Potion
        this.posion = this.physics.add.group()

        // Spawning Enemy
        this.time.addEvent({
            delay: 1000, loop: true, callback: () => {
                if (this.bossEffect) {
                    let enemy = this.physics.add.image(Math.Between(0, this.sys.game.config.width), 0, 'enemyShip').setScale(0.110);
                    this.enemy.add(enemy);
                }
            }
        })

        // Explosion anims
        this.anims.create({
            key: 'expo',
            frames: [
                { key: 'ani1' },
                { key: 'ani1' },
                { key: 'ani2' },
                { key: 'ani3' },
                { key: 'ani4' },
                { key: 'ani5' },
                { key: 'ani6' },
                { key: 'ani7' },
                { key: 'ani8' },
                { key: 'ani9' },
                { key: 'ani10' }
            ],
            frameRate: 20,
            repeat: 0
        })

    }

    update() {

        // Game over
        this.gameOver()

        // Shooting
        this.shooting()

        // Enemy Logic
        this.enemyLogic()

        // Bosse Spawnes
        this.bossSpawn(1000 , '1000')

        // Collides
        this.physics.collide(this.bullets, this.enemy, (bullet, enemy) => {

            // Play Explosion 
            this.playAnimation('expo', enemy.x, enemy.y, 'ani1');

            bullet.destroy();
            enemy.destroy();

            this.score += 20;
            this.scoreText.setText('Score: ' + this.score);
        })

        this.physics.collide(this.bullets, this.bosses, (bullet, boss) => {
            bullet.destroy();

            boss.health -= 20;

            let healthPercent = boss.health / this.bossesD['1000'].health;

            this.bossHealthBar.clear();
            this.bossHealthBar.fillStyle(0x00ff00, 1);
            this.bossHealthBar.fillRect(100, 570, window.Math.max(600 * healthPercent, 0), 20);

            if (boss.health <= 0) {
                this.bossEffect = true;
                this.bossDefeated = true;
                this.bossName.destroy();
                boss.destroy();
                this.bossHealthBar.clear();
                this.bossHealthBarBG.clear();
            }
        });

        this.physics.collide(this.ship, this.bosses, (ship, boss) => {

            this.hp--;
            let pushBackX = (ship.x - boss.x) * 2;
            let pushBackY = (ship.y - boss.y) * 2;

            ship.setVelocity(pushBackX, pushBackY);

            this.time.delayedCall(500, () => {
                if (ship.active) {
                    ship.setVelocity(0);
                }
            })

            if (this.hearts.length > 0) {
                let lastHeart = this.hearts.pop();
                lastHeart.destroy();
            }

            if (this.hp <= 0) {
                this.playAnimation('expo', ship.x, ship.y, 'ani1');
                ship.destroy();
                this.add.text(180, 250, 'Game Over! \n press "SPACE" to continue', { fontSize: 30 });
                this.isOver = true
            }
        })

        this.physics.collide(this.ship, this.bossBulet, (ship, bullet) => {
            bullet.destroy();
            this.hp--;
            if (this.hearts.length > 0) {
                let lastHeart = this.hearts.pop();
                lastHeart.destroy();
            }

            if (this.hp <= 0) {
                this.playAnimation('expo', ship.x, ship.y, 'ani1');
                ship.destroy();
                this.add.text(180, 250, 'Game Over! \n press "SPACE" to continue', { fontSize: 30 });
                this.isOver = true
            }

        })

        this.physics.collide(this.ship, this.enemy, (ship, enemy) => {
            this.damage(ship, enemy)
            this.playAnimation('expo', enemy.x, enemy.y, 'ani1');
        })

        // Potions
        if (this.score > 0 && this.score % 60 == 0 && this.potionSpawned) {
            this.posionSpawn();
            this.potionSpawned = false
        } else if (this.score % 60 !== 0) {
            this.potionSpawned = true;
        }

        this.posion.getChildren().forEach(potion => {
            potion.setVelocityY(50)
        })

        // Moving
        this.moving(this.keys.left.isDown, this.ship, 'left', this.shipSpeed);
        this.moving(this.keys.right.isDown, this.ship, 'right', this.shipSpeed);
        this.moving(this.keys.up.isDown, this.ship, 'top', this.shipSpeed);
        this.moving(this.keys.down.isDown, this.ship, 'bottom', this.shipSpeed);

    }

    moving(key, object, dir, shipSpeed) {
        if (key) {
            if (dir === 'top') {
                object.y -= shipSpeed;
            } else if (dir === 'bottom') {
                object.y += shipSpeed;
            } else if (dir === 'left') {
                object.x -= shipSpeed;
            } else if (dir === 'right') {
                object.x += shipSpeed;
            }
        }
    }

    shooting() {
        if (this.keys.space.isDown && this.canShot) {
            let bullet = this.physics.add.image(this.ship.x, this.ship.y, 'bullet').setSize(1, 1).setScale(0.0500)
            this.bullets.add(bullet);
            this.canShot = false;

            this.time.delayedCall(this.bulSpeed, () => {
                this.canShot = true;
            })
        }

        this.bullets.getChildren().forEach(bullet => {
            bullet.setVelocityY(-500);
            if (bullet.y < 0) bullet.destroy();
        })
    }

    bossSpawn(nededScore , selectBoss) {
        if (this.score >= nededScore && !this.bossDefeated && this.bosses.getLength() === 0) {

            this.bossEffect = false;
            let selectedBoss = this.bossesD[selectBoss];

            this.bossHealthBarBG = this.add.graphics();
            this.bossHealthBarBG.fillStyle(0xff0000, 1);
            this.bossHealthBarBG.fillRect(100, 570, 600, 20);

            this.bossHealthBar = this.add.graphics();
            this.bossHealthBar.fillStyle(0x00ff00, 1);
            this.bossHealthBar.fillRect(100, 570, 600, 20);

            let boss = this.physics.add.image(this.game.config.width / 2, 0, selectedBoss.image).setScale(0.6).setSize(755, 100);
            boss.health = selectedBoss.health;
            if (!this.bossDefeated) {
                this.bossName = this.add.text((this.game.config.width / 2) - 300, 550, selectedBoss.name)
            }

            this.bosses.add(boss)
            boss.setCollideWorldBounds(true);
            boss.setBounce(1);
            boss.setVelocityY(50);
            boss.setImmovable(true);
            boss.body.allowGravity = false;
            this.time.delayedCall(3200, () => {
                boss.setVelocityY(0)
                boss.setVelocityX(35)
            })
        }
    }

    bossShooting() {
        let boss = this.bosses.getChildren()[0];

        if (boss) {
            let bulletXPositions = [boss.x - 110, boss.x, boss.x + 110];

            bulletXPositions.forEach(xPos => {
                let bullet = this.physics.add.image(xPos, boss.y + 100, 'bullet').setSize(1, 1).setScale(0.0500);
                this.bossBulet.add(bullet);
                bullet.setVelocityY(500);
            });
        }
    }

    enemyLogic() {
        this.enemy.getChildren().forEach(partOfEnemy => {
            if (partOfEnemy.active) {
                partOfEnemy.setVelocityY(80);
                if (partOfEnemy.y > this.game.config.height) {
                    partOfEnemy.destroy();
                    if (this.bossEffect) {
                        this.score -= 20;
                        this.rejected += 1;
                        this.rejectText.setText('Rejecteds: ' + this.rejected);
                        this.scoreText.setText('Score: ' + this.score);
                    }
                }
            }
        })
    }


    playAnimation(name, x, y, fristFrame) {
        let expo = this.add.sprite(x, y, fristFrame);
        expo.play(name).setScale(0.2);
        expo.on('animationcomplete', () => {
            expo.destroy();
        })
    }

    posionSpawn() {
        let potionsTypes = ['speed', 'health', 'bullSpeed'];
        let randomPotion = potionsTypes[Math.Between(0, potionsTypes.length - 1)]

        let posion = this.physics.add.image(Math.Between(0, this.game.config.width), 0, randomPotion).setScale(1.1);

        this.posion.add(posion)

        posion.potionT = randomPotion

        this.physics.add.overlap(this.ship, posion, this.potionOverlap, null, this)
    }

    damage(ship, enemy) {
        enemy.destroy();
        this.hp--;

        if (this.hearts.length > 0) {
            let lastHeart = this.hearts.pop();
            lastHeart.destroy();
        }

        if (this.hp <= 0) {
            this.playAnimation('expo', ship.x, ship.y, 'ani1');
            ship.destroy();
            this.add.text(180, 250, 'Game Over! \n press "SPACE" to continue', { fontSize: 30 });
            this.isOver = true
        }
    }

    potionOverlap(ship, potion) {
        potion.destroy()
        switch (potion.potionT) {
            case 'speed':
                this.shipSpeed = 7;
                this.time.delayedCall(7000, () => this.shipSpeed = 4);
                break;
            case 'health':
                if (this.hp < 5) {
                    this.hp += 1;
                    this.hearts.push(this.add.image(30 + (this.hearts.length * 40), 70, 'heart').setScale(0.0700))
                }
                break;
            case 'bullSpeed':
                this.bulSpeed = 160;
                this.time.delayedCall(5000, () => this.bulSpeed = 500)
                break;
        }
    }

    gameOver() {
        if (this.isOver) {
            if (this.keys.space.isDown) {
                window.location.reload();
                this.isOver = false;
            }
        }
    }
}
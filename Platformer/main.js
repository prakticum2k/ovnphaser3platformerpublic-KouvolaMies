//player and movement variables
let player;
let jumps;

//enemy variables
let enemies;
let e = 0;

//coin variables
let CoinLayer;
let coins;
let coinScore = 0;
let text;
let exitOpen = false;

//control variables
let spacebar;
let right = false;
let left = false;

//camera variables
let camera;
let UICam;

//audio variables
let jumpsound;
let coinsound;

//splash screen variables
let i = 0;
let a = 0;
let lehmä;

//other stuff
let currentLevel = 0;
let SpawnLayer;
let spawn;

//ugly stuff below, collapse scenes to make it nicer, we're going for the bare minimum here, since I hate phaser

class splash extends Phaser.Scene{
    constructor (){
        super({ key: 'splash' });
    }

    preload(){
        this.load.image("lehmä", "assets/sprites/background.png");
    }

    create(){
        //create the lehmä image
        lehmä = this.add.image(this.cameras.main.worldView.x + this.cameras.main.width / 2,this.cameras.main.worldView.y + this.cameras.main.height / 2 , "lehmä");
        lehmä.setOrigin(0.5);
        lehmä.setScale(6);

        //set camera background color to white
        this.cameras.main.setBackgroundColor("rgba(255, 255, 255, 1)");
    }

    update(){
        //set the transparency of the lhmä image according to the value of i
        lehmä.setAlpha(i / 100);

        //set a to 1 when i = 150 to make the lehmä image stay at full opacity longer
        if(i == 150){
            a = 1;
        }

        //increment i if a = 0, and decrement it otherwise, to make the image fade in and out
        if(a == 0){
            i++;
        }
        else{
            i--;
        }

        //start the manu scene when i < 0, so that it starts when the image has finished fading out
        if(i < 0){
            this.scene.start("menu");
        }
    }
}

class menu extends Phaser.Scene{
    constructor (){
        super({ key: 'menu' });
    }

    create(){
        //camera
        camera = this.cameras.main;

        //main menu text
        this.menutxt = this.add.text(camera.worldView.x + camera.width / 2, (camera.worldView.y + camera.height / 2) - 100, "Main Menu");
        this.menutxt.setOrigin(0.5);
        this.menutxt.setFontSize(20);
        this.menutxt.setScale(5);
        this.menutxt.setColor("gray");
        
        //start button
        this.clickButton = this.add.text(camera.worldView.x + camera.width / 2, (camera.worldView.y + camera.height / 2) + 100, "Start").setInteractive();
        this.clickButton.setOrigin(0.5);
        this.clickButton.setFontSize(20);
        this.clickButton.setScale(5);
        this.clickButton.on("pointerdown", () => {this.scene.start("level1")});

        //set display size
        this.scale.displaySize.setAspectRatio(1200/800);
        this.scale.refresh();
    }
}

class gameOver extends Phaser.Scene{
    constructor (){
        super({ key: 'gameOver' });
    }

    create(){
        //set display size
        this.scale.displaySize.setAspectRatio(1200/800);
        this.scale.refresh();

        //camera
        camera = this.cameras.main;

        //game over text
        this.gameover = this.add.text(camera.worldView.x + camera.width / 2, (camera.worldView.y + camera.height / 2) - 200, "Game Over");
        this.gameover.setOrigin(0.5);
        this.gameover.setFontSize(20);
        this.gameover.setScale(5);
        this.gameover.setColor("red");
        
        //retry button
        this.retryButton = this.add.text(camera.worldView.x + camera.width / 2, (camera.worldView.y + camera.height / 2), "Retry").setInteractive();
        this.retryButton.setOrigin(0.5);
        this.retryButton.setFontSize(20);
        this.retryButton.setScale(5);
        this.retryButton.on("pointerdown", () => {
            if(currentLevel == 1){
                this.scene.start("level1");
            }
            else if(currentLevel == 2){
                this.scene.start("level2");
            }
            else if(currentLevel == 3){
                this.scene.start("level3");
            }
        });

        //menu button
        this.menuButton = this.add.text(camera.worldView.x + camera.width / 2, (camera.worldView.y + camera.height / 2) + 200, "Main Menu").setInteractive();
        this.menuButton.setOrigin(0.5);
        this.menuButton.setFontSize(20);
        this.menuButton.setScale(5);
        this.menuButton.on("pointerdown", () => {
            this.scene.start("menu");
        });
    }
}

class level1 extends Phaser.Scene{
    constructor (){
        super({ key: 'level1' });
    }

    preload(){
        //tilemap stuff
        this.load.image("tiles", "assets/sprites/tiles.png");
        this.load.tilemapTiledJSON("map1", "assets/maps/map1.json");

        //player image
        this.load.image("slime", "assets/sprites/slime.png");

        //enemy image
        this.load.image("enemy", "assets/sprites/enemy.png");

        //coin image
        this.load.image("coin", "assets/sprites/coin.png");

        //sounds
        this.load.audio("jumpsound", "assets/audio/Jump.ogg");
        this.load.audio("coinsound", "assets/audio/Coin.ogg");
    }

    create(){
        //set display size
        this.scale.displaySize.setAspectRatio(1200/800);
        this.scale.refresh();

        //main camera
        camera = this.cameras.main;
        camera.setZoom(4);
        camera.setBackgroundColor('rgba(10, 10, 30, 1)');

        //UI camera
        UICam = this.cameras.add(0, 0, 1200, 800).setZoom(4);
        UICam.setOrigin(0);
        UICam.setScroll(-600, -600);

        //sounds
        jumpsound = this.sound.add("jumpsound");
        coinsound = this.sound.add("coinsound");

        //set currentLevel variable
        currentLevel = 1;

        //tilemap
        const map = this.make.tilemap({key:"map1", tileWidth:8, tileHeight:8});
        const tileset = map.addTilesetImage("tiles1", "tiles");
        const groundlayer = map.createLayer("ground", tileset, 0, 0);
        CoinLayer = map.getObjectLayer("CoinLayer")["objects"];
        const spikelayer = map.createLayer("Spikes", tileset, 0, 0);
        const Exit = map.createLayer("Exit", tileset, 0, 0);
        const DeathPlane = map.createLayer("DeathPlane", null, 0, 0);
        SpawnLayer = map.getObjectLayer("SpawnPoint")["objects"];

        //coin spawning
        let maxcoins = 0;
        coins = this.physics.add.staticGroup();
        CoinLayer.forEach(object => {
            //coin spawn positions are changed manually by half of the sprite size and origin is set to 0.5 to get the origin to the middle of the sprite
            let obj = coins.create(object.x + 4, object.y - 4, "coin");
            obj.setScale(object.width/8, object.height/8);
            obj.setOrigin(0.5);
            obj.body.width = object.width;
            obj.body.height = object.height;
            maxcoins++;
        });

        //coin count text
        text = this.add.text(UICam.scrollX + 1, UICam.scrollY + 1, `Coins: ${coinScore} / ${maxcoins}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        text.setText(`Coins: ${coinScore} / ${maxcoins}`);

        //set conscore to 0 and reset the text
        coinScore = 0;
        text.setText(`Coins: ${coinScore} / ${maxcoins}`);

        //coin collection
        function collectCoin(player, coin){
            coin.destroy(coin.x, coin.y);
            coinsound.play();
            coinScore++;
            text.setText(`Coins: ${coinScore} / ${maxcoins}`);
            if(coinScore > maxcoins -1){
                exitOpen = true;
            }
            return false;
        }

        //player
        player = this.physics.add.sprite(100, 100, "slime");
        jumps = 2;

        //make spawn point
        spawn = this.physics.add.staticGroup();
        SpawnLayer.forEach(object => {
            //spawn position is changed manually to set it to the right position, blame phaser
            let obj = spawn.create(object.x + 4, object.y - 4, null);
            obj.setScale(0, 0);
            obj.setOrigin(0.5);
            player.x = obj.x;
            player.y = obj.y;
        });

        //enemies
        enemies = this.physics.add.group({
            //put shared stuff for the group here
        });
        this.physics.add.collider(enemies, groundlayer);
        this.physics.add.collider(enemies, spikelayer);
        this.physics.add.collider(enemies, player, () => {this.scene.start("gameOver")});
        enemies.create(320, 50, "enemy").setVelocity(-50, 0);
        this.e1right = false;

        //make the camera follow the player
        camera.startFollow(player);

        //controls
        this.keys = this.input.keyboard.addKeys('A, D');
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //collisions
        this.physics.add.collider(player, groundlayer);
        groundlayer.setCollisionBetween(0, 503);
        this.physics.add.collider(player, spikelayer, () => {this.scene.start("gameOver")});
        spikelayer.setCollisionBetween(0, 503);
        this.physics.add.collider(player, DeathPlane, () => {this.scene.start("gameOver")});
        DeathPlane.setCollisionBetween(0, 503);
        this.physics.add.collider(player, Exit, () => {
            if(exitOpen == true){
                exitOpen = false;
                this.scene.start("level2");
            }
        });
        Exit.setCollisionBetween(0, 503);
        this.physics.add.overlap(player, coins, collectCoin, null, this);

        //jump button
        this.jumpButton = this.add.text(UICam.scrollX + 10, UICam.scrollY + 175, "Jump").setInteractive();
        this.jumpButton.setFontSize(20);
        this.jumpButton.on("pointerdown", () => {
            if(jumps > 0){
                player.setVelocityY(-220);
                jumpsound.play();
                jumps--;
            }
            else if(player.body.onFloor() && player.body.deltaY() >= 0){
                jumps = 2;
            }
        });

        //right button
        this.rightButton = this.add.text(UICam.scrollX + 230, UICam.scrollY + 175, "Right").setInteractive();
        this.rightButton.setFontSize(20);
        this.rightButton.on("pointerdown", () => {
            right = true;
        });
        this.rightButton.on("pointerup", () => {
            right = false;
        });
        this.rightButton.on("pointerout", () => {
            right = false;
        });

        //left button
        this.leftButton = this.add.text(UICam.scrollX + 170, UICam.scrollY + 175, "Left").setInteractive();
        this.leftButton.setFontSize(20);
        this.leftButton.on("pointerdown", () => {
            left = true;
        });
        this.leftButton.on("pointerup", () => {
            left = false;
        });
        this.leftButton.on("pointerout", () => {
            left = false;
        });
    }

    update(){
        //Change enemy direction
        for(const member of enemies.getChildren()){
            if(member.body.velocity.x == 0){
                e++;
                if(e == 1){
                    if(this.e1right == true){
                        member.setVelocityX(-50);
                        this.e1right = false;
                    }
                    else{
                        member.setVelocityX(50);
                        this.e1right = true;
                    }
                    e = 0;
                }
            }
            if(member.body.velocity.x > 0){
                member.setFlipX(false);
            }
            else if(member.body.velocity.x < 0){
                member.setFlipX(true);
            }
        }

        //fix having two midair jumps when running off of a platform
        if(jumps == 2 && player.body.onFloor() == false){
            jumps = 1;
        }

        //jump code
        if(Phaser.Input.Keyboard.JustDown(this.spacebar) && jumps > 0){
            player.setVelocityY(-220);
            jumpsound.play();
            jumps--;
        }
        else if(player.body.onFloor() && player.body.deltaY() >= 0){
            jumps = 2;
        }

        //reset player velocity
        player.setVelocityX(0);

        //left and right
        if(this.keys.D.isDown || right == true){
            player.setVelocityX(150);
        }
        if(this.keys.A.isDown || left == true){
            player.setVelocityX(-150);
        }

        //failsafe for falling
        if(player.y > 1000){
            this.scene.start("gameOver");
        }

        //animations
        if(player.body.velocity.x > 0.1){
            player.setFlipX(false);
        }
        else if(player.body.velocity.x < -0.1){
            player.setFlipX(true);
        }
    }
}

class level2 extends Phaser.Scene{
    constructor (){
        super({ key: 'level2' });
    }

    preload(){
        //tilemap stuff
        this.load.image("tiles", "assets/sprites/tiles.png");
        this.load.tilemapTiledJSON("map2", "assets/maps/map2.json");

        //player image
        this.load.image("slime", "assets/sprites/slime.png");

        //enemy image
        this.load.image("enemy", "assets/sprites/enemy.png");

        //coin image
        this.load.image("coin", "assets/sprites/coin.png");

        //sounds
        this.load.audio("jumpsound", "assets/audio/Jump.ogg");
        this.load.audio("coinsound", "assets/audio/Coin.ogg");
    }

    create(){
        //set display size
        this.scale.displaySize.setAspectRatio(1200/800);
        this.scale.refresh();
        
        //main camera
        camera = this.cameras.main;
        camera.setZoom(4);
        camera.setBackgroundColor('rgba(10, 10, 30, 1)');

        //UI camera
        UICam = this.cameras.add(0, 0, 1200, 800).setZoom(4);
        UICam.setOrigin(0);
        UICam.setScroll(-600, -600);

        //sounds
        jumpsound = this.sound.add("jumpsound");
        coinsound = this.sound.add("coinsound");

        //set currentLevel variable
        currentLevel = 2;

        //tilemap
        const map = this.make.tilemap({key:"map2", tileWidth:8, tileHeight:8});
        const tileset = map.addTilesetImage("tiles1", "tiles");
        const groundlayer = map.createLayer("ground", tileset, 0, 0);
        CoinLayer = map.getObjectLayer("CoinLayer")["objects"];
        const spikelayer = map.createLayer("Spikes", tileset, 0, 0);
        const Exit = map.createLayer("Exit", tileset, 0, 0);
        Exit.setCollisionBetween(0, 503);
        const DeathPlane = map.createLayer("DeathPlane", null, 0, 0);
        SpawnLayer = map.getObjectLayer("SpawnPoint")["objects"];

        //coin spawning
        let maxcoins = 0;
        coins = this.physics.add.staticGroup();
        CoinLayer.forEach(object => {
            //coin spawn positions are changed manually by half of the sprite size and origin is set to 0.5 to get the origin to the middle of the sprite
            let obj = coins.create(object.x + 4, object.y - 4, "coin");
            obj.setScale(object.width/8, object.height/8);
            obj.setOrigin(0.5);
            obj.body.width = object.width;
            obj.body.height = object.height;
            maxcoins++;
        });

        //coin count text
        text = this.add.text(UICam.scrollX + 1, UICam.scrollY + 1, `Coins: ${coinScore} ${maxcoins}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        text.setText(`Coins: ${coinScore} / ${maxcoins}`);

        //set conscore to 0 and reset the text
        coinScore = 0;
        text.setText(`Coins: ${coinScore} / ${maxcoins}`);

        //coin collection
        function collectCoin(player, coin){
            coin.destroy(coin.x, coin.y);
            coinsound.play();
            coinScore++;
            text.setText(`Coins: ${coinScore} / ${maxcoins}`);
            if(coinScore >= maxcoins){
                exitOpen = true;
            }
            return false;
        }

        //player
        player = this.physics.add.sprite(100, 0, "slime");
        jumps = 2;

        //make spawn point
        spawn = this.physics.add.staticGroup();
        SpawnLayer.forEach(object => {
            //spawn position is changed manually to set it to the right position, blame phaser
            let obj = spawn.create(object.x + 4, object.y - 4, null);
            obj.setScale(0, 0);
            obj.setOrigin(0.5);
            player.x = obj.x;
            player.y = obj.y;
        });

        //enemies
        enemies = this.physics.add.group({
            //put shared stuff for the group here
        });
        this.physics.add.collider(enemies, groundlayer);
        this.physics.add.collider(enemies, spikelayer);
        this.physics.add.collider(enemies, player, () => {this.scene.start("gameOver")});

        //make the camera follow the player
        camera.startFollow(player);

        //controls
        this.keys = this.input.keyboard.addKeys('A, D');
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //collisions
        this.physics.add.collider(player, groundlayer);
        groundlayer.setCollisionBetween(0, 503);
        this.physics.add.collider(player, spikelayer, () => {this.scene.start("gameOver")});
        spikelayer.setCollisionBetween(0, 503);
        this.physics.add.collider(player, DeathPlane, () => {this.scene.start("gameOver")});
        DeathPlane.setCollisionBetween(0, 503);
        this.physics.add.collider(player, Exit, () => {
            if(exitOpen == true){
                exitOpen = false;
                this.scene.start("level3");
            }
        });
        this.physics.add.overlap(player, coins, collectCoin, null, this);

        //jump button
        this.jumpButton = this.add.text(UICam.scrollX + 10, UICam.scrollY + 175, "Jump").setInteractive();
        this.jumpButton.setFontSize(20);
        this.jumpButton.on("pointerdown", () => {
            if(jumps > 0){
                player.setVelocityY(-220);
                jumpsound.play();
                jumps--;
            }
            else if(player.body.onFloor() && player.body.deltaY() >= 0){
                jumps = 2;
            }
        });

        //right button
        this.rightButton = this.add.text(UICam.scrollX + 230, UICam.scrollY + 175, "Right").setInteractive();
        this.rightButton.setFontSize(20);
        this.rightButton.on("pointerdown", () => {
            right = true;
        });
        this.rightButton.on("pointerup", () => {
            right = false;
        });
        this.rightButton.on("pointerout", () => {
            right = false;
        });

        //left button
        this.leftButton = this.add.text(UICam.scrollX + 170, UICam.scrollY + 175, "Left").setInteractive();
        this.leftButton.setFontSize(20);
        this.leftButton.on("pointerdown", () => {
            left = true;
        });
        this.leftButton.on("pointerup", () => {
            left = false;
        });
        this.leftButton.on("pointerout", () => {
            left = false;
        });
    }

    update(){
        //Change enemy direction
        for(const member of enemies.getChildren()){
            if(member.body.velocity.x == 0){
                e++;
                if(e == 1){
                    if(this.e1right == true){
                        member.setVelocityX(-50);
                        this.e1right = false;
                    }
                    else{
                        member.setVelocityX(50);
                        this.e1right = true;
                    }
                }
            }
            if(member.body.velocity.x > 0){
                member.setFlipX(false);
            }
            else if(member.body.velocity.x < 0){
                member.setFlipX(true);
            }
        }

        //fix having two midair jumps when running off of a platform
        if(jumps == 2 && player.body.onFloor() == false){
            jumps = 1;
        }

        //jump code
        if(Phaser.Input.Keyboard.JustDown(this.spacebar) && jumps > 0){
            player.setVelocityY(-220);
            jumpsound.play();
            jumps--;
        }
        else if(player.body.onFloor() && player.body.deltaY() >= 0){
            jumps = 2;
        }

        //reset player velocity
        player.setVelocityX(0);

        //left and right
        if(this.keys.D.isDown || right == true){
            player.setVelocityX(150);
        }
        if(this.keys.A.isDown || left == true){
            player.setVelocityX(-150);
        }

        //failsafe for falling
        if(player.y > 1000){
            this.scene.start("gameOver");
        }

        //animations
        if(player.body.velocity.x > 0.1){
            player.setFlipX(false);
        }
        else if(player.body.velocity.x < -0.1){
            player.setFlipX(true);
        }
    }
}

class level3 extends Phaser.Scene{
    //this level is a babys first mario maker level, it's hot garbo
    constructor (){
        super({ key: 'level3' });
    }

    preload(){
        //tilemap stuff
        this.load.image("tiles", "assets/sprites/tiles.png");
        this.load.tilemapTiledJSON("map3", "assets/maps/map3.json");

        //player image
        this.load.image("slime", "assets/sprites/slime.png");

        //enemy image
        this.load.image("enemy", "assets/sprites/enemy.png");

        //coin image
        this.load.image("coin", "assets/sprites/coin.png");

        //sounds
        this.load.audio("jumpsound", "assets/audio/Jump.ogg");
        this.load.audio("coinsound", "assets/audio/Coin.ogg");
    }

    create(){
        //set display size
        this.scale.displaySize.setAspectRatio(1200/800);
        this.scale.refresh();
        
        //main camera
        camera = this.cameras.main;
        camera.setZoom(4);
        camera.setBackgroundColor('rgba(10, 10, 30, 1)');

        //UI camera
        UICam = this.cameras.add(0, 0, 1200, 800).setZoom(4);
        UICam.setOrigin(0);
        UICam.setScroll(-600, -600);

        //sounds
        jumpsound = this.sound.add("jumpsound");
        coinsound = this.sound.add("coinsound");

        //set currentLevel variable
        currentLevel = 3;

        //tilemap
        const map = this.make.tilemap({key:"map3", tileWidth:8, tileHeight:8});
        const tileset = map.addTilesetImage("tiles1", "tiles");
        const groundlayer = map.createLayer("ground", tileset, 0, 0);
        CoinLayer = map.getObjectLayer("CoinLayer")["objects"];
        const spikelayer = map.createLayer("Spikes", tileset, 0, 0);
        const Exit = map.createLayer("Exit", tileset, 0, 0);
        Exit.setCollisionBetween(0, 503);
        const DeathPlane = map.createLayer("DeathPlane", null, 0, 0);
        SpawnLayer = map.getObjectLayer("SpawnPoint")["objects"];

        //coin spawning
        let maxcoins = 0;
        coins = this.physics.add.staticGroup();
        CoinLayer.forEach(object => {
            //coin spawn positions are changed manually by half of the sprite size and origin is set to 0.5 to get the origin to the middle of the sprite
            let obj = coins.create(object.x + 4, object.y - 4, "coin");
            obj.setScale(object.width/8, object.height/8);
            obj.setOrigin(0.5);
            obj.body.width = object.width;
            obj.body.height = object.height;
            maxcoins++;
        });

        //coin count text
        text = this.add.text(UICam.scrollX + 1, UICam.scrollY + 1, `Coins: ${coinScore} ${maxcoins}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        text.setText(`Coins: ${coinScore} / ${maxcoins}`);

        //set conscore to 0 and reset the text
        coinScore = 0;
        text.setText(`Coins: ${coinScore} / ${maxcoins}`);

        //coin collection
        function collectCoin(player, coin){
            coin.destroy(coin.x, coin.y);
            coinsound.play();
            coinScore++;
            text.setText(`Coins: ${coinScore} / ${maxcoins}`);
            if(coinScore >= maxcoins){
                exitOpen = true;
            }
            return false;
        }

        //player
        player = this.physics.add.sprite(100, 0, "slime");
        jumps = 2;

        //make spawn point
        spawn = this.physics.add.staticGroup();
        SpawnLayer.forEach(object => {
            //spawn position is changed manually to set it to the right position, blame phaser
            let obj = spawn.create(object.x + 4, object.y - 4, null);
            obj.setScale(0, 0);
            obj.setOrigin(0.5);
            player.x = obj.x;
            player.y = obj.y;
        });

        //enemies
        enemies = this.physics.add.group({
            //put shared stuff for the group here
        });
        this.physics.add.collider(enemies, groundlayer);
        this.physics.add.collider(enemies, spikelayer);
        this.physics.add.collider(enemies, player, () => {this.scene.start("gameOver")});
        enemies.create(player.x + 100, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 150, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 200, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 250, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 300, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 350, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 400, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 450, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 500, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 550, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 600, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 650, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 700, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 750, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 800, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 850, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 900, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 950, player.y - 5, "enemy").setVelocity(-50, 0);
        enemies.create(player.x + 1000, player.y - 5, "enemy").setVelocity(-50, 0);

        //make the camera follow the player
        camera.startFollow(player);

        //controls
        this.keys = this.input.keyboard.addKeys('A, D');
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //collisions
        this.physics.add.collider(player, groundlayer);
        groundlayer.setCollisionBetween(0, 503);
        this.physics.add.collider(player, spikelayer, () => {this.scene.start("gameOver")});
        spikelayer.setCollisionBetween(0, 503);
        this.physics.add.collider(player, DeathPlane, () => {this.scene.start("gameOver")});
        DeathPlane.setCollisionBetween(0, 503);
        this.physics.add.collider(player, Exit, () => {
            if(exitOpen == true){
                exitOpen = false;
                this.scene.start("victory");
            }
        });
        this.physics.add.overlap(player, coins, collectCoin, null, this);

        //jump button
        this.jumpButton = this.add.text(UICam.scrollX + 10, UICam.scrollY + 175, "Jump").setInteractive();
        this.jumpButton.setFontSize(20);
        this.jumpButton.on("pointerdown", () => {
            if(jumps > 0){
                player.setVelocityY(-220);
                jumpsound.play();
                jumps--;
            }
            else if(player.body.onFloor() && player.body.deltaY() >= 0){
                jumps = 2;
            }
        });

        //right button
        this.rightButton = this.add.text(UICam.scrollX + 230, UICam.scrollY + 175, "Right").setInteractive();
        this.rightButton.setFontSize(20);
        this.rightButton.on("pointerdown", () => {
            right = true;
        });
        this.rightButton.on("pointerup", () => {
            right = false;
        });
        this.rightButton.on("pointerout", () => {
            right = false;
        });

        //left button
        this.leftButton = this.add.text(UICam.scrollX + 170, UICam.scrollY + 175, "Left").setInteractive();
        this.leftButton.setFontSize(20);
        this.leftButton.on("pointerdown", () => {
            left = true;
        });
        this.leftButton.on("pointerup", () => {
            left = false;
        });
        this.leftButton.on("pointerout", () => {
            left = false;
        });
    }

    update(){
        //Change enemy direction
        for(const member of enemies.getChildren()){
            if(member.body.velocity.x == 0){
                e++;
                if(e == 1){
                    if(this.e1right == true){
                        member.setVelocityX(-50);
                        this.e1right = false;
                    }
                    else{
                        member.setVelocityX(50);
                        this.e1right = true;
                    }
                }
            }
            if(member.body.velocity.x > 0){
                member.setFlipX(false);
            }
            else if(member.body.velocity.x < 0){
                member.setFlipX(true);
            }
        }

        //fix having two midair jumps when running off of a platform
        if(jumps == 2 && player.body.onFloor() == false){
            jumps = 1;
        }

        //jump code
        if(Phaser.Input.Keyboard.JustDown(this.spacebar) && jumps > 0){
            player.setVelocityY(-220);
            jumpsound.play();
            jumps--;
        }
        else if(player.body.onFloor() && player.body.deltaY() >= 0){
            jumps = 2;
        }

        //reset player velocity
        player.setVelocityX(0);

        //left and right
        if(this.keys.D.isDown || right == true){
            player.setVelocityX(150);
        }
        if(this.keys.A.isDown || left == true){
            player.setVelocityX(-150);
        }

        //failsafe for falling
        if(player.y > 1000){
            this.scene.start("gameOver");
        }

        //animations
        if(player.body.velocity.x > 0.1){
            player.setFlipX(false);
        }
        else if(player.body.velocity.x < -0.1){
            player.setFlipX(true);
        }
    }
}

class victory extends Phaser.Scene{
    constructor (){
        super({ key: 'victory' });
    }

    create(){
        //camera
        camera = this.cameras.main;

        //main menu text
        this.menutxt = this.add.text(camera.worldView.x + camera.width / 2, (camera.worldView.y + camera.height / 2) - 100, "You Beat The Game!");
        this.menutxt.setOrigin(0.5);
        this.menutxt.setFontSize(20);
        this.menutxt.setScale(5);
        this.menutxt.setColor("yellow");
        
        //start button
        this.clickButton = this.add.text(camera.worldView.x + camera.width / 2, (camera.worldView.y + camera.height / 2) + 100, "Main Menu").setInteractive();
        this.clickButton.setOrigin(0.5);
        this.clickButton.setFontSize(20);
        this.clickButton.setScale(5);
        this.clickButton.on("pointerdown", () => {this.scene.start("menu")});

        //set display size
        this.scale.displaySize.setAspectRatio(1200/800);
        this.scale.refresh();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    scene: [splash, menu, gameOver, level1, level2, level3, victory],
    render:{
        pixelArt: true
    },
    scale:{
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics:{
        default: "arcade",
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
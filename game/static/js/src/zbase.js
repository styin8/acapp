export class AcGame{
    constructor(id, AcwingOS){
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcwingOS = AcwingOS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start(){
        
    }
}
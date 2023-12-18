interface Bird {
    hasBack(): boolean;
    canFly(): boolean;
    // camSwim(): boolean;
}

class CommonBird implements Bird {
    canFly(): boolean {
        return false;
    }

    hasBack(): boolean {
        return false;
    }

}

class Penguin implements Bird{
    private bird = new CommonBird();

    hasBack(): boolean {
        return this.bird.hasBack();
    }

    canFly(): boolean {
        return false;
    }
}
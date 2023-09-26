import { PerspectiveCamera } from "three";

export class Camera {

    perspectiveCamera

    #initialPosition = {
        x: -0.6611454491804741, 
        y: -3.138341869362529, 
        z: -3.5889549349552
    }

    #initialRotation = {
        x: 2.423077365471937, 
        y: -0.13779653784171128, 
        z: 3.022050894293857
    }

    constructor() {
        this.perspectiveCamera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.init();
    }

    init() {
        this.perspectiveCamera.position.set(this.#initialPosition.x, this.#initialPosition.y, this.#initialPosition.z)
        this.perspectiveCamera.rotation.set(this.#initialRotation.x, this.#initialRotation.y, this.#initialRotation.z)
    }

    resize() {
        this.perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
        this.perspectiveCamera.updateProjectionMatrix();
    }
}
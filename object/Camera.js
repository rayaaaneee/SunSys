import { PerspectiveCamera } from "three";
import * as TWEEN from "@tweenjs/tween.js";

export class Camera {

    perspectiveCamera

    #solarSystem;
    #initial = {
        "position" : {
            x: -0.6611454491804741, 
            y: -3.138341869362529, 
            z: -3.5889549349552
        },
        "rotation" : {
            x: 2.423077365471937, 
            y: -0.13779653784171128, 
            z: 3.022050894293857
        }
    }

    #loading = {
        "position" : {
            x: -8.178168196216852, 
            y: -15.943390646297036, 
            z: -21.679163457084282
        },
        "rotation" : {
           x: 0.48148049836407697,
           y: -0.0830931108257549,
           z: 0.04333856036269502
        }
    }

    keepFocus;

    constructor(solarSystem) {
        this.perspectiveCamera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.#solarSystem = solarSystem;
    }

    setLoadingTargetControls() {
        this.perspectiveCamera.position.set(this.#loading.position.x, this.#loading.position.y, this.#loading.position.z);
        this.perspectiveCamera.rotation.set(this.#loading.rotation.x, this.#loading.rotation.y, this.#loading.rotation.z);
        this.#solarSystem.controls.target.set(this.#loading.position.x - 2, this.#loading.position.y - 2, this.#loading.position.z);
    }

    initPosition(timeMs = null) {

        // Réinitialisez la position de la caméra à la position initiale
        const initialPosition = this.#initial.position;
        
        let tweenPosition = new TWEEN.Tween(this.perspectiveCamera.position)
        .to(initialPosition, timeMs | 500)
        .easing(TWEEN.Easing.Quadratic.InOut);

        tweenPosition.start()
        .onComplete(() => {
            this.#solarSystem.controls.target.set(0, 0, 0);
        });
    }

    resize() {
        this.perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
        this.perspectiveCamera.updateProjectionMatrix();
    }

    focusOnObject(object) {

        let pos = {
            x: object.getMesh().position.x,
            y: object.getMesh().position.y,
            z: object.getMesh().position.z
        }

        this.perspectiveCamera.position.set(pos.x + 1, pos.y, pos.z + 2);
        this.perspectiveCamera.lookAt(pos.x, pos.y, pos.z);
        this.#solarSystem.controls.target.set(pos.x, pos.y, pos.z);
        if (this.keepFocus === object.name) {
            setTimeout(() => {
                this.focusOnObject(object);
            }, 5);
        }
    }
}
import * as THREE from 'three';
import { SpaceObject } from "./SpaceObject";

export class Satellite extends SpaceObject {

    #timeIsInvertedTicks = null;
    #hasOverflowPath = false;

    #points;

    #baseSpeed = 0.001;
    #initialBaseSpeed = this.#baseSpeed;
    #orbitColor;

    constructor(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, orbitColor, hostPlanet) {
        super(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet);

        this.#orbitColor = parseInt(orbitColor, 16);
        this.defineInitialOrbitTracePoints();
    }

    defineInitialOrbitTracePoints() {
        const material = new THREE.PointsMaterial({
          color: this.#orbitColor, // Couleur blanche pour représenter la Lune
          size: 0.01, // Taille des points
        });
        this.#points = new THREE.Points(undefined, material);
        this.#points.geometry.needsUpdate = true;
        this.#points.geometry.setFromPoints([]);
    }

    updateActionToTracedPath() {
        if (this.#hasOverflowPath) {
            this.#timeIsInvertedTicks = null;
            this.#hasOverflowPath = false;
        } else {
            this.#hasOverflowPath = true;
            this.setTimeIsInvertedTicks();
        }
    }

    setTimeIsInvertedTicks() {
        // On recupere le nombre de points stockés dans la variable this.points
        const nbPoints = this.#points.geometry.attributes.position.array.length / 3;
        // Pour chaque point tracé, deux ticks de différence;
        const differenceTicks = nbPoints * 2;
        this.#timeIsInvertedTicks = this.solarSystem.ticks - differenceTicks;
    }

    traceOrbitPath() {
        this.solarSystem.scene.add(this.#points);
    }

    disappearTracedOrbitPath() {
        this.solarSystem.scene.remove(this.#points);
    }

    removeTracedOrbitPath() {
        this.#hasOverflowPath = false;
        this.#timeIsInvertedTicks = null;
        this.#points.geometry.setFromPoints([]);
        this.solarSystem.scene.remove(this.#points);
    }

    compareCoords(coords1, coords2) {
        if (coords1.x === coords2.x) {
            if (coords1.y === coords2.y) {
                if (coords1.z === coords2.z) {
                    return true;
                }
            }
        }
    }

    setBaseSpeed(number) {
        this.#baseSpeed = number;
    }

    setInitialBaseSpeed() {
        this.#baseSpeed = this.#initialBaseSpeed;
    }

    // Tracage de points qui prend en compte les inversions du temps
    tracePoint() {
        if (!this.solarSystem.timeIsInverted) {
            if (this.#timeIsInvertedTicks === null) {
                // if (this.name === "Moon") console.log("Le temps n'est pas inversé mais il n'y a rien a effacer, on pose des points");
                this.setNewPoint();
            } else {
                if (this.#timeIsInvertedTicks === this.solarSystem.ticks) {
                    // if (this.name === "Moon") console.log("Le temps n'est pas inversé et le surplus de chemin est effacé");
                    this.#hasOverflowPath = false;
                    this.#timeIsInvertedTicks = null;
                } else {
                    // if (this.name === "Moon") console.log("Le temps n'est pas inversé et il faut effacer le chemin jusqu'a la coordonnée du premier point");
                    this.removeCurrentPoint();
                }
            }
        } else {
            if (this.#timeIsInvertedTicks === null) {
                // if (this.name === "Moon") console.log("Le temps est inversé mais il n'y a rien a effacer, on pose des points");
                this.setNewPoint();
            } else {
                if (this.#timeIsInvertedTicks === this.solarSystem.ticks) {
                    // if (this.name === "Moon") console.log("Le temps est inversé et le surplus de chemin a été entièrement retiré");
                    this.#hasOverflowPath = false;
                } else {
                    if (this.#hasOverflowPath) {
                        // if (this.name === "Moon") console.log("Le temps est inversé et il faut effacer le chemin jusqu'a la coordonnée du premier point");
                        this.removeCurrentPoint();
                    } else {
                        // if (this.name === "Moon") console.log("Le temps est inversé et il n'y a pas de surplus de chemin");
                        this.setNewPoint();
                    }
                }
            }
        }
    }

    setNewPoint(){
        let currentPoint = this.getWorldCoords();

        const geometry = this.#points.geometry;
        const newPositions = new Float32Array([...geometry.attributes.position.array, currentPoint.x, currentPoint.y, currentPoint.z]);

        // Mettre la variable this.points
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        // Empeche la ligne de disparaitre si la camera est trop proche
        geometry.computeBoundingSphere();
    }

    changePosition(teta) {
        // On diminue le nombre de décimales pour éviter les problèmes de précision
        let speed = this.speedCoefficient * this.#baseSpeed;

        // Récupérer l'angle de la planete hote pour le soustraire à teta
        let angleHost = this.getHostPlanet().getMesh().rotation.z;
        this.getMesh().position.x = (this.moveCoord.x * (Math.cos((teta * speed) - angleHost))).toFixed(this.around); 
        this.getMesh().position.y = (this.moveCoord.y * (Math.sin((teta * speed) - angleHost))).toFixed(this.around);
    }

    removeCurrentPoint() {
        const geometry = this.#points.geometry;
        if ( geometry.attributes.position.array.length == 0 ) {
            this.setNewPoint();
        } else {
            const newPositions = new Float32Array([...geometry.attributes.position.array.slice(0, -3)]);
            // Mettre la variable this.points
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        }
    }

    isSatellite() {
        return true;
    }
}
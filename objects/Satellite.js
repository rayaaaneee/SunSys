import * as THREE from 'three';
import { SpaceObject } from "./SpaceObject";

export class Satellite extends SpaceObject {

    #timeIsInvertedCoords = null;
    #hasOverflowPath = false;

    #points;

    constructor(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet) {
        super(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet);

        this.defineInitialOrbitTracePoints();
    }

    defineInitialOrbitTracePoints() {
        const material = new THREE.PointsMaterial({
          color: 0xffff00, // Couleur blanche pour représenter la Lune
          size: 0.01, // Taille des points
        });
        this.#points = new THREE.Points(undefined, material);
        this.#points.geometry.needsUpdate = true;
        this.#points.geometry.setFromPoints([]);
    }

    updateActionToTracedPath() {
        if (this.#hasOverflowPath) {
            this.timeIsInvertedCoords = null;
            this.#hasOverflowPath = false;
        } else {
            this.#hasOverflowPath = true;
            this.setTimeIsInvertedCoords();
        }
    }

    setTimeIsInvertedCoords() {
        // Récupérer le premier point tracé par la planète
        let position = this.#points.geometry.attributes.position.array;
        this.timeIsInvertedCoords = {
            x: position[0].toFixed(this.around),
            y: position[1].toFixed(this.around),
            z: position[2].toFixed(this.around)
        }
    }

    traceOrbitPath() {
        this.solarSystem.scene.add(this.#points);
    }

    disappearTracedOrbitPath() {
        this.solarSystem.scene.remove(this.#points);
    }

    removeTracedOrbitPath() {
        this.#hasOverflowPath = false;
        this.timeIsInvertedCoords = null;
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

    // Tracage de points qui prend en compte les inversions du temps
    tracePoint() {
        if (!this.solarSystem.timeIsInverted) {
            if (this.#timeIsInvertedCoords === null) {
                // Le temps n'est pas inversé mais il n'y a rien a effacer, on pose des points
                this.setNewPoint();
            } else {
                if (this.compareCoords(this.#timeIsInvertedCoords, this.getWorldCoords())) {
                    // Le temps n'est pas inversé et le surplus de chemin est effacé
                    this.#hasOverflowPath = false;
                    this.timeIsInvertedCoords = null;
                } else {
                    // Le temps n'est pas inversé et il faut effacer le chemin jusqu'a la coordonnée du premier point
                    this.removeCurrentPoint();
                }
            }
        } else {
            if (this.#timeIsInvertedCoords === null) {
                // Le temps est inversé mais il n'y a rien a effacer, on pose des points
                this.setNewPoint();
            } else {
                if (this.compareCoords(this.#timeIsInvertedCoords, this.getWorldCoords())) {
                    // Le temps est inversé et le surplus de chemin a été entièrement retiré
                    this.#hasOverflowPath = false;
                } else {
                    if (this.#hasOverflowPath) {
                        // Le temps est inversé et il faut effacer le chemin jusqu'a la coordonnée du premier point
                        this.removeCurrentPoint();
                    } else {
                        // Le temps est inversé et il n'y a pas de surplus de chemin
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
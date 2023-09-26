import {PointsMaterial, Points, Float32BufferAttribute, Vector3 } from 'three';
import { SpaceObject } from "./SpaceObject";

export class Satellite extends SpaceObject {

    #hasOverflowPath = false;

    #points;

    #baseSpeed = 0.001;
    #initialBaseSpeed = this.#baseSpeed;
    #orbitColor;

    constructor(solarSystem, name, variableName, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, orbitColor, hostPlanet) {
        super(solarSystem, name, variableName, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet);

        this.#orbitColor = parseInt(orbitColor, 16);
        this.defineInitialOrbitTracePoints();
    }

    defineInitialOrbitTracePoints() {
        const material = new PointsMaterial({
          color: this.#orbitColor, // Couleur blanche pour représenter la Lune
          size: 0.01, // Taille des points
        });
        this.#points = new Points(undefined, material);
        this.#points.geometry.needsUpdate = true;
        this.#points.geometry.setFromPoints([]);
    }

    updateActionToTracedPath() {
        this.#hasOverflowPath = !this.#hasOverflowPath;
    }

    setTimeIsInvertedTicks(nullable = false) {
        if (nullable) {
            this.solarSystem.startTracingOrbitTick = null;
        } else {
            // On recupere le nombre de points stockés dans la variable this.points
            const nbPoints = this.#points.geometry.attributes.position.array.length / 3;
            // Pour chaque point tracé, deux ticks de différence;
            const differenceTicks = nbPoints * 2;
            this.solarSystem.startTracingOrbitTick = this.solarSystem.ticks - differenceTicks;
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
        this.solarSystem.startTracingOrbitTick = null;
        this.#points.geometry.setFromPoints([]);
        this.solarSystem.scene.remove(this.#points);
    }

    setBaseSpeed(number) {
        this.#baseSpeed = number;
    }

    setInitialBaseSpeed() {
        this.#baseSpeed = this.#initialBaseSpeed;
    }

    // Tracage de points qui prend en compte les inversions du temps, on peut forcer le tracage de point pour un tick définit, sinon pour le tick courant
    tracePoint(tick = null) {
        if (this.#hasOverflowPath) {
            if (this.solarSystem.ticks === this.solarSystem.startTracingOrbitTick) {
                // On a atteint le tick d'inversion, il n'y a plus rien à effacer
                this.removeCurrentPoint();
                this.#hasOverflowPath = false;
            } else {
                // On a pas atteint le tick d'inversion, on efface des points
                this.removeCurrentPoint()
            };
        } else {
            // Il n'y a rien a effacer, on pose des points
            this.setNewPoint(tick)
        };
    }

    setNewPoint(tick = null){
        let currentPoint;
        if (tick) {
            let currentPosition = this.getPosition(tick);
            let hostPlanetCurrentPosition = this.getHostPlanet().getPosition(tick);
            let hostPlanetCurrentRotation = this.getHostPlanet().getRotation(tick);

            let coords = {
                satelliteCoords: currentPosition,
                hostPlanetCoords: hostPlanetCurrentPosition,
                hostPlanetRotation: hostPlanetCurrentRotation
            }

            currentPoint = this.getWorldCoords(coords);
        } else {
            currentPoint = this.getWorldCoords();
        }

        const geometry = this.#points.geometry;
        const newPositions = new Float32Array([...geometry.attributes.position.array, currentPoint.x, currentPoint.y, currentPoint.z]);

        // Mettre la variable this.points
        geometry.setAttribute('position', new Float32BufferAttribute(newPositions, 3));

        // Empeche la ligne de disparaitre si la camera est trop proche
        geometry.computeBoundingSphere();
    }

    // Récupérer la position exacte pour un 
    getPosition(tick) {
        // On diminue le nombre de décimales pour éviter les problèmes de précision
        let speed = this.speedCoefficient * this.#baseSpeed;

        // Récupérer l'angle de la planete hote pour le soustraire à teta
        let angleHost = this.getHostPlanet().getRotation(tick).z;

        let x = (this.moveCoord.x * (Math.cos((tick * speed) - angleHost))).toFixed(this.around);
        let y = (this.moveCoord.y * (Math.sin((tick * speed) - angleHost))).toFixed(this.around);

        return new Vector3(x, y, 0);
    }

    removeCurrentPoint() {
        const geometry = this.#points.geometry;
        if ( !geometry.attributes.position.array.length == 0 ) {
            const newPositions = new Float32Array([...geometry.attributes.position.array.slice(0, -3)]);
            // Mettre la variable this.points
            geometry.setAttribute('position', new Float32BufferAttribute(newPositions, 3));
        }
    }

    setOrbitColor() {
        // On laisse le temps à la classe mère de finir son initialisation ainsi qu'à la classe de définir la couleur
        let timeoutId = setTimeout(() => {
            this.linkToHost.material.color.setHex(this.#orbitColor);
            clearTimeout(timeoutId);
        }, 0);
    }

    isSatellite() {
        return true;
    }

    changeOverflowPath() {
        this.#hasOverflowPath = !this.#hasOverflowPath;
    }

    addLight() {
        this.getMesh().material.color.setHex(this.#orbitColor);
    }
}
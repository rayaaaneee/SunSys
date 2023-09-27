import { LineBasicMaterial, Line, BufferGeometry, Vector3, EllipseCurve } from 'three';
import { SpaceObject } from './SpaceObject';

export class Planet extends SpaceObject {

    #satellites = [];
    #previousPlanet;

    #orbitPath;

    #baseSpeed = 0.0001;
    #initialBaseSpeed = this.#baseSpeed;

    #color;

    constructor(solarSystem, name, variableName, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, color, previousPlanet, hostPlanet, informations) {
        super(solarSystem, name, variableName, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet, informations);

        this.#color = parseInt(color, 16);

        // Si la planète est le soleil, elle n'en a pas
        if (previousPlanet) {
            this.#previousPlanet = previousPlanet;
            this.defineLinkWithPreviousPlanet();
        }

        this.defineOrbit();
    }

    defineLinkWithPreviousPlanet() {
        const previousPlanetPosition = this.#previousPlanet.getMesh().position;
        const planetPosition = super.getMesh().position;
        const lineGeometry = new BufferGeometry().setFromPoints([previousPlanetPosition, planetPosition]);

        lineGeometry.verticesNeedUpdate = true;

        const lineMaterial = new LineBasicMaterial({ color: 0xffa500, linewidth: 1 });
        this.linkToPrevious = new Line(lineGeometry, lineMaterial);
    }

    updateLinkWithPreviousPlanet() {
        if (this.linkToPrevious) {
            let planetPosition = this.getMesh().position;
            this.linkToPrevious.geometry.setFromPoints([this.#previousPlanet.getMesh().position, planetPosition]);
        }
        // Empeche la ligne de disparaitre si la camera est trop proche
        this.linkToPrevious.geometry.computeBoundingSphere();
    }

    showLinkWithPreviousPlanet() {
        this.solarSystem.scene.add(this.linkToPrevious);
    }

    hideLinkWithPreviousPlanet() {
        this.solarSystem.scene.remove(this.linkToPrevious);
    }

    addSatellite(satellite) {
        this.#satellites.push(satellite);
        this.getMesh().add(satellite.getMesh());
    }

    getPosition(tick) {
        // On diminue le nombre de décimales pour éviter les problèmes de précision
        let speed = this.speedCoefficient * this.#baseSpeed;
        let x = (this.moveCoord.x * (Math.cos(tick * speed))).toFixed(this.around);
        let y = (this.moveCoord.y * (Math.sin(tick * speed))).toFixed(this.around);

        return new Vector3(x, y, 0);
    }

    getSatellites() {
        return this.#satellites;
    }

    setOrbitColor() {
        this.linkToHost.material.color.setHex(0xffffff);
    }

    defineOrbit() {
        let curve = new EllipseCurve(0,  0, this.moveCoord.x , 
        this.moveCoord.y, 0,  2 * Math.PI, false, 0);

        let ellipsePoint = curve.getPoints(500);

        let ellipseGeometry = new BufferGeometry().setFromPoints(ellipsePoint);

        let ellipseMaterial = new LineBasicMaterial({ color: 0xffffff });

        this.#orbitPath = new Line(ellipseGeometry, ellipseMaterial);
    }

    appearOrbit() {
        this.solarSystem.scene.add(this.#orbitPath);
    }

    disappearOrbit() {
        this.solarSystem.scene.remove(this.#orbitPath);
    }

    hasSatellite() {
        return this.#satellites.length > 0;
    }

    getSatellites() {
        if (!this.hasSatellite()) return null;
        return this.#satellites;
    }

    setBaseSpeed(number) {
        this.#baseSpeed = number;
    }

    isSatellite() {
        return false;
    }

    setInitialBaseSpeed() {
        this.#baseSpeed = this.#initialBaseSpeed;
    }

    addLight() {
        if (this.isSun()) {
            this.getMesh().material.emissive.setHex(this.#color);
        } else {
            this.getMesh().material.color.setHex(this.#color);
        }
        // Si il y a un anneau, on change aussi sa couleur
        if (this.ring) {
            this.ring.material.color.setHex(this.#color);
        }
    }
}
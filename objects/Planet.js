import * as THREE from 'three';
import { SpaceObject } from './SpaceObject';

export class Planet extends SpaceObject {

    #satellites = [];
    #previousPlanet;

    #orbitPath;

    #baseSpeed = 0.0001;
    #initialBaseSpeed = this.#baseSpeed;

    constructor(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, previousPlanet, hostPlanet) {
        super(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet);

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
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([previousPlanetPosition, planetPosition]);

        lineGeometry.verticesNeedUpdate = true;

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 1 });
        this.linkToPrevious = new THREE.Line(lineGeometry, lineMaterial);
    }

    updateLinkWithPreviousPlanet() {
        if (this.linkToPrevious) {
            let planetPosition = this.getWorldCoords();
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

    changePosition(teta) {
        // On diminue le nombre de décimales pour éviter les problèmes de précision
        let speed = this.speedCoefficient * this.#baseSpeed;
        this.getMesh().position.x = (this.moveCoord.x * (Math.cos(teta * speed))).toFixed(this.around);
        this.getMesh().position.y = (this.moveCoord.y * (Math.sin(teta * speed))).toFixed(this.around);
    }

    getSatellites() {
        return this.#satellites;
    }

    defineOrbit() {
        let curve = new THREE.EllipseCurve(0,  0, this.moveCoord.x , 
        this.moveCoord.y, 0,  2 * Math.PI, false, 0);
        
        let ellipsePoint = curve.getPoints(500);

        let ellipseGeometry = new THREE.BufferGeometry().setFromPoints(ellipsePoint);
        
        let ellipseMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        this.#orbitPath = new THREE.Line(ellipseGeometry, ellipseMaterial);
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
}
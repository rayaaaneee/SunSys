// Classes
import { SphereGeometry, TextureLoader, MeshStandardMaterial, Mesh, BufferGeometry, LineBasicMaterial, Line, Euler, RingGeometry, Color } from 'three';
// Variables
import { FrontSide, DoubleSide } from 'three';
import { isProduction } from '../function/isProduction.js';

import { StarInformations } from './informations/StarInformations.js';
import { PlanetInformations } from './informations/PlanetInformations.js';
import { SatelliteInformations } from './informations/SatelliteInformations.js';
import * as TWEEN from '@tweenjs/tween.js';

// Classe mère de tous les objets de l'espace
export class SpaceObject {

    static constantSatelliteAddScale = 1.15;
    static constantPlanetAddScale = 1.10;
    static constantSunAddScale = 1.05;

    // Attributs
    around = 3; // Arrondi des coordonnées

    name;
    variableName;

    texture;
    material;
    initCoord = {
        x: null,
        y: null,
        z: null
    }
    moveCoord = {
        x: null,
        y: null,
    }
    scale = {
        x: null,
        y: null,
        z: null
    }
    rotateCoord = {
        x: null,
        y: null,
        z: null
    }

    speedCoefficient;

    solarSystem;

    #mesh;

    // Modeles 
    ball = new SphereGeometry(1, 32, 32);
    textureLoader = new TextureLoader();

    // Fonctionnalités annexe
    #hostPlanet;
    ring;
    linkToHost; // Vaut autant pour les planetes que pour les satellites

    // Propriétés servant aux fonctionnalités
    oldRotate; // Mémorise la rotation de la planète avant l'alignement des planetes

    informations;

    constructor(solarSystem, name, variableName, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet, informations) {

        this.solarSystem = solarSystem;
        this.name = name;
        this.variableName = variableName;

        // En production, on ajuste le chemin des textures
        let texturePath = isProduction("./assets/texture/", "./asset/img/texture/");

        this.texture = this.textureLoader.load(texturePath + texture);
        this.material = new MeshStandardMaterial({ map: this.texture });

        this.initCoord.x = initCoords[0];
        this.initCoord.y = initCoords[1];
        this.initCoord.z = initCoords[2];

        this.moveCoord.x = moveCoords[0];
        this.moveCoord.y = moveCoords[1];

        this.speedCoefficient = speedCoef;

        this.#mesh = new Mesh(this.ball, this.material);
        this.#mesh.name = this.variableName;

        this.scale.x = scaleCoords[0];
        this.scale.y = scaleCoords[1];
        this.scale.z = scaleCoords[2];

        this.rotateCoord.x = rotationCoords[0];
        this.rotateCoord.y = rotationCoords[1];
        this.rotateCoord.z = rotationCoords[2];

        this.#mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);

        this.#mesh.position.x = this.initCoord.x;
        this.#mesh.position.y = this.initCoord.y;
        this.#mesh.position.z = this.initCoord.z;

        this.#mesh.receiveShadow = true;
        this.#mesh.castShadow = true;

        this.material.receiveShadow = true;
        this.material.castShadow = true;

        if (!this.isSun()) {
            this.#hostPlanet = hostPlanet;
            this.defineLinkWithHostPlanet();
            if (this.isSatellite()) {
                this.#hostPlanet.addSatellite(this);
            } else {
                this.solarSystem.sun.addSatellite(this);
            }
            this.solarSystem.scene.add(this.#mesh);
        } else {
            this.solarSystem.scene.add(this.#mesh);
        }

        this.setInformations(informations);
    }

    defineLinkWithHostPlanet() {
        const hostPlanetPosition = this.#hostPlanet.getMesh().position;
        const planetPosition = this.#mesh.position;
        const lineGeometry = new BufferGeometry().setFromPoints([hostPlanetPosition, planetPosition]);

        lineGeometry.verticesNeedUpdate = true;

        const lineMaterial = new LineBasicMaterial({ linewidth: 1 });
        this.linkToHost = new Line(lineGeometry, lineMaterial);

        this.setOrbitColor();
    }

    updateLinkWithHostPlanet() {
        let planetPosition = this.getMesh().position;
        this.linkToHost.geometry.setFromPoints([this.#hostPlanet.getMesh().position, planetPosition]);
        // Empeche la ligne de disparaitre si la camera est trop proche
        this.linkToHost.geometry.computeBoundingSphere();
    }

    showLinkWithHostPlanet() {
        this.solarSystem.scene.add(this.linkToHost);
    }

    hideLinkWithHostPlanet() {
        this.solarSystem.scene.remove(this.linkToHost);
    }

    setMaterial(material) {
        this.material = material;
        this.#mesh.material = this.material;
    }

    getMesh() {
        return this.#mesh;
    }

    changePosition(tick) {
        // On diminue le nombre de décimales pour éviter les problèmes de précision
        let position = this.getPosition(tick);
        this.getMesh().position.x = position.x;
        this.getMesh().position.y = position.y;
    }

    rotate(tick) {
        let rotation = this.getRotation(tick);
        this.#mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    getRotation(tick) {
        let x = (this.rotateCoord.x * tick).toFixed(this.around);
        let y = (this.rotateCoord.y * tick).toFixed(this.around);
        let z = (this.rotateCoord.z * tick).toFixed(this.around);

        return new Euler(x, y, z);
    }

    getRotationType() {
        if (this.rotateCoord.z >= 0) {
            return "Directe";
        } else {
            return "Retrograde";
        }
    }

    addRing(innerRadius, outerRadius, thetaSegments, phiSegments, texture, isTransparent, opacity, rotationCoords, position = [0, 0, 0]) {
        const ring = new RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments);

        // Générer les coordonnées UV personnalisées, arrondir l'image de texture à l'intérieur de l'anneau
        const uvs = ring.attributes.uv.array;
        for (let i = 0; i < uvs.length; i += 2) {
          const angle = (i / uvs.length) * Math.PI * 2;
          const radius = (uvs[i] * (outerRadius - innerRadius)) + innerRadius;
          uvs[i] = 0.5 + Math.cos(angle) * radius / (outerRadius - innerRadius);
          uvs[i + 1] = 0.5 + Math.sin(angle) * radius / (outerRadius - innerRadius);
        }

        let texturePath = isProduction("./assets/texture/", "./asset/img/texture/");
        const ringTexture = this.textureLoader.load(texturePath + texture);
        ringTexture.isTransparent = isTransparent;

        const ringMaterial = new MeshStandardMaterial({
            map: ringTexture,
            side: DoubleSide,
            shadowSide: FrontSide, // Activer la réception d'ombres
            emissive: new Color(0x000000), // Couleur émissive pour les lumières
            emissiveIntensity: 0, // Intensité de l'émission lumineuse (ajustez selon vos besoins)
            depthWrite: false // Désactiver l'écriture de profondeur pour éviter les problèmes de superposition
          });
      
        // Rendre l'anneau transparent
        ringMaterial.transparent = opacity < 1;
        ringMaterial.opacity = opacity;
      
        const ringMesh = new Mesh(ring, ringMaterial);
        ringMesh.position.set(position[0], position[1], position[2]);
        ringMesh.rotation.set(rotationCoords[0], rotationCoords[1], rotationCoords[2]);
        ringMesh.receiveShadow = true;
        ringMesh.castShadow = true;

        ringMesh.name = this.variableName;

        this.ring = ringMesh;
        this.#mesh.add(ringMesh);
    }

    removeRing() {
        this.#mesh.remove(this.ring);
    }

    getHostPlanet() {
        if (!this.isSatellite()) return null;
        return this.#hostPlanet;
    }

    memorizeCurrentRotation() {
        // Créez un nouvel objet THREE.Euler pour stocker la rotation actuelle
        this.oldRotate = new Euler().copy(this.#mesh.rotation);
    }

    setMemorizedOldRotation() {
        // Appliquez la rotation mémorisée à l'objet mesh
        this.#mesh.rotation.copy(this.oldRotate);
    }

    isPlanet() {
        return !this.isSatellite() && !this.isSun();
    }

    isSun() {
        return this.name === "Sun";
    }

    removeLight() {
        if (this.isSun()) {
            this.#mesh.material.emissive.setHex(0xffffff);
        } else {
            this.#mesh.material.color.setHex(0xffffff);
        }
        if (this.ring) {
            this.ring.material.color.setHex(0xffffff);
        }
    }

    showInfo() {
        this.informations.print();
    }

    setInformations(informations) {
        if (this.isSun()) {
            this.informations = new StarInformations(this, informations);
        } else if (this.isPlanet()) {
            this.informations = new PlanetInformations(this, informations);
        } else {
            this.informations = new SatelliteInformations(this, informations);
        }
    }

    addScale() {
        let constant; 
        if (this.isSun()) {
            constant = SpaceObject.constantSunAddScale;
        } else if (this.isPlanet()) {
            constant = SpaceObject.constantPlanetAddScale;
        } else {
            constant = SpaceObject.constantSatelliteAddScale;
        }

        let newScale = {
            x: this.scale.x * constant,
            y: this.scale.y * constant,
            z: this.scale.z * constant
        }

        this.#mesh.scale.set(newScale.x, newScale.y, newScale.z);
    }

    removeScale() {
        this.#mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
        if (this.isSatellite()) {
            this.constantScale = 1;
        }
    }

    onHover() {
        this.addScale();
        this.addLight();

        if ((this.isPlanet() || this.isSun())) {
            this.getSatellites().forEach(satellite => {
                satellite.addLight(false);
            });
        }
    }

    onHoverOut() {
        this.removeScale();
        this.removeLight();
    }

    isBelt() {
        return false;
    }
}
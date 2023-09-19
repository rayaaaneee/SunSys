import * as THREE from 'three';
import { SpaceObject } from './SpaceObject';

// Fonction qui permet de définir une valeur en fonction de l'environnement
const isProduction = (productionValue, devValue = null) => {
    if (process.env.NODE_ENV === "production") {
        return productionValue;
    } else if (devValue) {
        return devValue;
    }
    return null;
}

export class Planet extends SpaceObject {

    // Attributs
    around = 3; // Arrondi des coordonnées

    name;
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

    #satellites = [];
    #hostPlanet;
    #previousPlanet;

    // Modeles 
    ball = new THREE.SphereGeometry(1, 32, 32);
    textureLoader = new THREE.TextureLoader();

    // Fonctionnalités annexes
    orbitPath;
    ring;
    linkToHost;
    linkToPrevious;
    points;
    timeIsInvertedCoords = null;
    hasOverflowPath = false;

    // Propriétés servant aux fonctionnalités
    oldRotate; // Mémorise la rotation de la planète avant l'alignement des planetes

    constructor(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, previousPlanet) {

        super();

        this.solarSystem = solarSystem;
        this.name = name;

        // En production, on ajuste le chemin des textures
        let texturePath = isProduction("./assets/texture/", "./asset/img/texture/");

        this.texture = this.textureLoader.load(texturePath + texture);
        this.material = new THREE.MeshStandardMaterial({ map: this.texture });

        this.initCoord.x = initCoords[0];
        this.initCoord.y = initCoords[1];
        this.initCoord.z = initCoords[2];

        this.moveCoord.x = moveCoords[0];
        this.moveCoord.y = moveCoords[1];

        this.speedCoefficient = speedCoef;

        this.#mesh = new THREE.Mesh(this.ball, this.material);

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

        if (previousPlanet) {
            this.#previousPlanet = previousPlanet;
            this.defineLinkWithPreviousPlanet();
        }

        this.solarSystem.scene.add(this.#mesh);
    }

    defineLinkWithPreviousPlanet() {
        const previousPlanetPosition = this.#previousPlanet.getMesh().position;
        const planetPosition = this.#mesh.position;
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
    }

    defineLinkWithHostPlanet() {
        const hostPlanetPosition = this.#hostPlanet.getMesh().position;
        const planetPosition = this.#mesh.position;
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([hostPlanetPosition, planetPosition]);

        lineGeometry.verticesNeedUpdate = true;

        // jaune
        let color = 0xffffff;
        // sinon 
        if (!this.isSunSatellite()) color = 0xffff00;
        const lineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 1 });
        this.linkToHost = new THREE.Line(lineGeometry, lineMaterial);
    }

    updateLinkWithHostPlanet() {
        let planetPosition = this.getWorldCoords();
        this.linkToHost.geometry.setFromPoints([this.#hostPlanet.getMesh().position, planetPosition]);
    }

    showLinkWithHostPlanet() {
        this.solarSystem.scene.add(this.linkToHost);
    }

    hideLinkWithHostPlanet() {
        this.solarSystem.scene.remove(this.linkToHost);
    }

    showLinkWithPreviousPlanet() {
        this.solarSystem.scene.add(this.linkToPrevious);
    }

    hideLinkWithPreviousPlanet() {
        this.solarSystem.scene.remove(this.linkToPrevious);
    }

    setMaterial(material) {
        this.material = material;
        this.#mesh.material = this.material;
    }
    
    setHostPlanet(hostPlanet) {
        this.#hostPlanet = hostPlanet;
        this.defineLinkWithHostPlanet();
        this.defineOrbit();
        if (!this.isSunSatellite()) {
            this.#hostPlanet.addSatellite(this);
        }
    }

    getHostPlanet() {
        return this.#hostPlanet;
    }

    addSatellite(satellite) {
        this.#satellites.push(satellite);
        if (!this.isSunSatellite()) {
            this.solarSystem.scene.remove(satellite.getMesh());
        }
        this.#mesh.add(satellite.getMesh());
    }

    getSatellites() {
        return this.#satellites;
    }

    getMesh() {
        return this.#mesh;
    }

    defineOrbit() {
        if (this.isSunSatellite()) {
            let curve = new THREE.EllipseCurve(0,  0, this.moveCoord.x , 
            this.moveCoord.y, 0,  2 * Math.PI, false, 0);
        
            let ellipsePoint = curve.getPoints(500);
        
            let ellipseGeometry = new THREE.BufferGeometry().setFromPoints(ellipsePoint);
        
            let ellipseMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        
            this.orbitPath = new THREE.Line(ellipseGeometry, ellipseMaterial);
        } else if (this.isPlanetSatellite()) {
            const material = new THREE.PointsMaterial({
              color: 0xffff00, // Couleur blanche pour représenter la Lune
              size: 0.01, // Taille des points
            });
            this.points = new THREE.Points(undefined, material);
            this.points.geometry.needsUpdate = true;
            this.points.geometry.setFromPoints([]);
        }
    }

    updateActionToTracedPath() {
        if (this.hasOverflowPath) {
            this.timeIsInvertedCoords = null;
            this.hasOverflowPath = false;
        } else {
            this.hasOverflowPath = true;
            this.setTimeIsInvertedCoords();
        }
    }

    setTimeIsInvertedCoords() {
        // Récupérer le premier point tracé par la planète
        let position = this.points.geometry.attributes.position.array;
        this.timeIsInvertedCoords = {
            x: position[0].toFixed(this.around),
            y: position[1].toFixed(this.around),
            z: position[2].toFixed(this.around)
        }
    }

    getWorldCoords() {
        if (this.isSunSatellite()) {
            return this.#mesh.position;
        } else if (this.isPlanetSatellite()) {
            let position = this.#hostPlanet.getMesh().localToWorld(this.#mesh.position.clone());
            return {
                x: position.x.toFixed(this.around),
                y: position.y.toFixed(this.around),
                z: position.z.toFixed(this.around)
            }
        } else {
            return null;
        }
    }

    changePosition(teta, baseSpeed) {
        // On diminue le nombre de décimales pour éviter les problèmes de précision
        this.#mesh.position.x = (this.moveCoord.x * Math.cos(teta * this.speedCoefficient * baseSpeed)).toFixed(this.around);
        this.#mesh.position.y = (this.moveCoord.y * Math.sin(teta * this.speedCoefficient * baseSpeed)).toFixed(this.around);
    }

    rotate(invert = false) {
        if (invert) {
            this.#mesh.rotation.x -= this.rotateCoord.x;
            this.#mesh.rotation.y -= this.rotateCoord.y;
            this.#mesh.rotation.z -= this.rotateCoord.z;
        } else {
            this.#mesh.rotation.x += this.rotateCoord.x;
            this.#mesh.rotation.y += this.rotateCoord.y;
            this.#mesh.rotation.z += this.rotateCoord.z;
        }
    }

    appearOrbit() {
        if (this.isSunSatellite()) {
            this.solarSystem.scene.add(this.orbitPath);
        }
    }

    disappearOrbit() {
        if (this.isSunSatellite()) {
            this.solarSystem.scene.remove(this.orbitPath);
        }
    }

    traceOrbitPath() {
        this.solarSystem.scene.add(this.points);
    }

    disappearTracedOrbitPath() {
        this.solarSystem.scene.remove(this.points);
    }

    removeTracedOrbitPath() {
        this.hasOverflowPath = false;
        this.timeIsInvertedCoords = null;
        this.points.geometry.setFromPoints([]);
        this.solarSystem.scene.remove(this.points);
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
            if (this.timeIsInvertedCoords === null) {
                // Le temps n'est pas inversé mais il n'y a rien a effacer, on pose des points
                this.setNewPoint();
            } else {
                if (this.compareCoords(this.timeIsInvertedCoords, this.getWorldCoords())) {
                    // Le temps n'est pas inversé et le surplus de chemin est effacé
                    this.hasOverflowPath = false;
                    this.timeIsInvertedCoords = null;
                } else {
                    // Le temps n'est pas inversé et il faut effacer le chemin jusqu'a la coordonnée du premier point
                    this.removeCurrentPoint();
                }
            }
        } else {
            if (this.timeIsInvertedCoords === null) {
                // Le temps est inversé mais il n'y a rien a effacer, on pose des points
                this.setNewPoint();
            } else {
                if (this.compareCoords(this.timeIsInvertedCoords, this.getWorldCoords())) {
                    // Le temps est inversé et le surplus de chemin a été entièrement retiré
                    this.hasOverflowPath = false;
                } else {
                    if (this.hasOverflowPath) {
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

        const geometry = this.points.geometry;
        const newPositions = new Float32Array([...geometry.attributes.position.array, currentPoint.x, currentPoint.y, currentPoint.z]);

        // Mettre la variable this.points
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    }

    removeCurrentPoint() {
        const geometry = this.points.geometry;
        if ( geometry.attributes.position.array.length == 0 ) {
            this.setNewPoint();
        } else {
            const newPositions = new Float32Array([...geometry.attributes.position.array.slice(0, -3)]);
            // Mettre la variable this.points
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        }
    }

    addRing(innerRadius, outerRadius, thetaSegments, phiSegments, texture, isTransparent, opacity, rotationCoords, position = [0, 0, 0]) {
        const ring = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments);

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
        
        const ringMaterial = new THREE.MeshStandardMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            shadowSide: THREE.FrontSide, // Activer la réception d'ombres
            emissive: new THREE.Color(0x000000), // Couleur émissive pour les lumières
            emissiveIntensity: 0, // Intensité de l'émission lumineuse (ajustez selon vos besoins)
            depthWrite: false // Désactiver l'écriture de profondeur pour éviter les problèmes de superposition
          });
      
        // Rendre l'anneau transparent
        ringMaterial.transparent = opacity < 1;
        ringMaterial.opacity = opacity;
      
        const ringMesh = new THREE.Mesh(ring, ringMaterial);
        ringMesh.position.set(position[0], position[1], position[2]);
        ringMesh.rotation.set(rotationCoords[0], rotationCoords[1], rotationCoords[2]);
        ringMesh.receiveShadow = true;
        ringMesh.castShadow = true;

        this.ring = ringMesh;
        this.#mesh.add(ringMesh);
    }

    removeRing() {
        this.#mesh.remove(this.ring);
    }

    isSatellite() {
        return this.#hostPlanet != null;
    }

    isSunSatellite() {
        return this.#hostPlanet == this.solarSystem.sun;
    }

    isPlanetSatellite() {
        return this.isSatellite() && !this.isSunSatellite();
    }

    hasSatellite() {
        return this.#satellites.length > 0;
    }

    getSatellites() {
        if (!this.hasSatellite()) return null;
        return this.#satellites;
    }

    getHostPlanet() {
        if (!this.isSatellite()) return null;
        return this.#hostPlanet;
    }

    memorizeCurrentRotation() {
        // Créez un nouvel objet THREE.Euler pour stocker la rotation actuelle
        this.oldRotate = new THREE.Euler().copy(this.#mesh.rotation);
    }
    
    setMemorizedOldRotation() {
        // Appliquez la rotation mémorisée à l'objet mesh
        this.#mesh.rotation.copy(this.oldRotate);
    }

}
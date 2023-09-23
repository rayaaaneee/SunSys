import * as THREE from 'three';

// Fonction qui permet de définir une valeur en fonction de l'environnement
const isProduction = (productionValue, devValue = null) => {
    if (process.env.NODE_ENV === "production") {
        return productionValue;
    } else if (devValue) {
        return devValue;
    }
    return null;
}

// Classe mère de tous les objets de l'espace
export class SpaceObject {

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

    // Modeles 
    ball = new THREE.SphereGeometry(1, 32, 32);
    textureLoader = new THREE.TextureLoader();

    // Fonctionnalités annexe
    #hostPlanet;
    ring;
    linkToHost; // Vaut autant pour les planetes que pour les satellites

    // Propriétés servant aux fonctionnalités
    oldRotate; // Mémorise la rotation de la planète avant l'alignement des planetes

    constructor(solarSystem, name, texture, initCoords, moveCoords, scaleCoords, rotationCoords, speedCoef, hostPlanet) {

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

        if (!this.isSun()) {
            this.#hostPlanet = hostPlanet;
            this.defineLinkWithHostPlanet();
            if (this.isSatellite()) {
                this.#hostPlanet.addSatellite(this);
            } else {
                this.solarSystem.scene.add(this.#mesh);
            }
        } else {
            this.solarSystem.scene.add(this.#mesh);
        }
    }

    defineLinkWithHostPlanet() {
        const hostPlanetPosition = this.#hostPlanet.getMesh().position;
        const planetPosition = this.#mesh.position;
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([hostPlanetPosition, planetPosition]);

        lineGeometry.verticesNeedUpdate = true;

        const lineMaterial = new THREE.LineBasicMaterial({ linewidth: 1 });
        this.linkToHost = new THREE.Line(lineGeometry, lineMaterial);

        this.setOrbitColor();
    }

    updateLinkWithHostPlanet() {
        let planetPosition = this.getWorldCoords();
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

    getWorldCoords() {
        if (!this.isSatellite()) {
            return this.#mesh.position;
        } else {
            let position = this.#hostPlanet.getMesh().localToWorld(this.#mesh.position.clone());
            return {
                x: position.x.toFixed(this.around),
                y: position.y.toFixed(this.around),
                z: position.z.toFixed(this.around)
            }
        }
    }

    rotate(ticks) {
        this.#mesh.rotation.x = (this.rotateCoord.x * ticks).toFixed(this.around);
        this.#mesh.rotation.y = (this.rotateCoord.y * ticks).toFixed(this.around);
        this.#mesh.rotation.z = (this.rotateCoord.z * ticks).toFixed(this.around);
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

    isPlanet() {
        return !this.isSatellite();
    }

    isSun() {
        return this.name === 'Sun';
    }
}
import { Group, TextureLoader, IcosahedronGeometry, DodecahedronGeometry, MeshBasicMaterial, Mesh } from 'three';
import { isProduction } from '../function/isProduction.js';
import { BeltInformations } from './informations/BeltInformations.js';

export class AsteroidBelt {

    name;

    // Taille max des asteroides
    #radius = 0.1;

    // Distance minimale sur X et Y
    #minDistanceX;
    #minDistanceY;

    // Rayon de la ceinture d'asteroides
    #beltRadius;

    // Nombre d'asteroides
    #nbAsteroids;

    // Variation de la position Z
    #deltaZ = 0.5;

    // Assets
    #asteroidBelt = new Group();

    #solarSystem;

    #textureLoader = new TextureLoader();

    #textures = [];

    #variableName;

    // Utilitaires
    #texturePath = isProduction("./assets/texture/", "./asset/img/texture/");

    constructor(solarSystem, name, variableName, minDistanceX, minDistanceY, beltRadius, nbAsteroids, textures, informations) {
        this.#solarSystem = solarSystem;

        this.name = name;
        this.#asteroidBelt.name = name;

        this.#minDistanceX = minDistanceX;
        this.#minDistanceY = minDistanceY;
        this.#beltRadius = beltRadius;

        this.#nbAsteroids = nbAsteroids;

        this.#variableName = variableName;

        textures.forEach(texture => {
            this.#textures.push(texture);
        });

        for (let i = 0; i < this.#nbAsteroids; i++) {
            this.#addAsteroid();
        }

        this.informations = new BeltInformations(informations);
    }

    #addAsteroid() {

        // On définit le rayon et le détail
        let randRadius = Math.random() * this.#radius;

        // On définit la géometrie avec du hasard
        let asteroidGeometry;
        let randGeometry = Math.random() * 2;
        if (randGeometry < 1) {
            asteroidGeometry = new IcosahedronGeometry(randRadius, 0);
        } else {
            asteroidGeometry = new DodecahedronGeometry(randRadius, 0);
        }

        // On définit la texture avec du hasard
        let randTexture = Math.floor(Math.random() * this.#textures.length);
        let texture = this.#textures[randTexture];
        let asteroidMaterial = new MeshBasicMaterial({
            map: this.#textureLoader.load(this.#texturePath + texture)
        });

        const asteroid = new Mesh(asteroidGeometry, asteroidMaterial);

        const angle = Math.random() * Math.PI * 2;

        // Calculez la distance radiale minimale (distance à l'intérieur de l'ellipse)
        const minDistanceX = this.#minDistanceX * Math.cos(angle);
        const minDistanceY = this.#minDistanceY * Math.sin(angle);

        // Calculez la distance radiale maximale (ellipse plus grande)
        const maxDistanceX = (this.#minDistanceX + this.#beltRadius) * Math.cos(angle);
        const maxDistanceY = (this.#minDistanceY + this.#beltRadius) * Math.sin(angle);

        // On choisit le Z négatif ou positif
        let negativeZ = (Math.random() * 2) >= 1 ? -1 : 1; 
        asteroid.position.set(
            minDistanceX + Math.random() * (maxDistanceX - minDistanceX), 
            minDistanceY + Math.random() * (maxDistanceY - minDistanceY), 
            Math.random() * this.#deltaZ * negativeZ
        );

        asteroid.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        asteroid.name = this.#variableName;

        this.#asteroidBelt.add(asteroid);
    }

    add() {
        this.#solarSystem.scene.add(this.#asteroidBelt);
    }

    remove() {
        this.#solarSystem.scene.remove(this.#asteroidBelt);
    }

    addLight() {
        this.#asteroidBelt.children.forEach(asteroid => {
            asteroid.material.color.setHex(0xff0000);
        });
    }

    removeLight() {
        this.#asteroidBelt.children.forEach(asteroid => {
            asteroid.material.color.setHex(0xffffff);
        });
    }

    showInfo() {
        console.log(this.informations);
    }

    getMesh() {
        return this.#asteroidBelt;
    }
}
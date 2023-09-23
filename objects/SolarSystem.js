import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import Stats from 'stats.js'
import { Planet } from './Planet';
import { Satellite } from './Satellite';

// JSON des propriétés des planètes
import planetJson from "../asset/data/planet.json";
// JSON des propriétés des satellites
import satelliteJson from "../asset/data/satellite.json";

export class SolarSystem {

    ticks = 0;

    // Initialisation of the scene / camera / renderer
    pointLight = new THREE.PointLight(0xffffff, 10, 100);
    ambientLight = new THREE.AmbientLight( 0xffffff );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    stats = new Stats();

    // Initialisation of your objects / materials / light
    solarSystem = new THREE.Object3D();

    // Add controls for the camera
    controls = new OrbitControls( this.camera, this.renderer.domElement );

    // Texture Loader
    textureLoader = new THREE.TextureLoader();

    // Models 
    ball = new THREE.SphereGeometry(1, 32, 32);
    // Planetes
    mercure; venus; earth; mars; jupiter; saturne; uranus; neptune; pluto;
    planets;
    planets = [];
    // Satellites
    moon;
    satellites = [];

    // Ensemble des astres du systeme solaire
    spaceObjects = [];

    // Valeurs
    baseSpeed = 0.0001;
    lastValueForSpeed = 0;
    lastValueForTicks = 0;
    initialBaseSpeed = this.baseSpeed;
    animationFrameRequestId;
    isTimeStopped = false;
    timeIsInverted = false;
    isOrbitPlanetLinkVisible = false;
    isOrbitSatelliteLinkVisible = false;
    isSatelliteRouteCreating = false;
    isPreviousPlanetLinkVisible = false;
    areAlignedPlanets = false;

    ticksRenderer = document.getElementById("ticks");

    constructor() {

        // On initialise la scène
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild( this.renderer.domElement );
        this.camera.position.z = 5;

        this.scene.add(this.solarSystem);

        this.stats.showPanel( 0 );

        this.setCameraPosition();

        this.initPlanets();

        this.initFalseStars();

        // On lance une frame d'animation
        this.render();
    }

    setCameraPosition() {
        this.camera.position.set(-0.6611454491804741, -3.138341869362529, -3.5889549349552);
        this.camera.rotation.set(2.423077365471937, -0.13779653784171128, 3.022050894293857);
    }

    printFramesPerSecond() {
        document.body.appendChild( this.stats.dom );
        this.renderer.setAnimationLoop( () => {
            this.stats.update();
        });
    }

    unprintFramesPerSecond() {
        document.body.removeChild( this.stats.dom );
        this.renderer.setAnimationLoop( null );
    }

    initFalseStars() {
        let starsGeometry = new THREE.BufferGeometry();
        let starsVertices = [];

        for (let i = 0; i < 10000; i++) {
          let star = new THREE.Vector3();
          star.x = THREE.MathUtils.randFloatSpread(2000);
          star.y = THREE.MathUtils.randFloatSpread(2000);
          star.z = THREE.MathUtils.randFloatSpread(2000);
          starsVertices.push(star.x, star.y, star.z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        let stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0x888888 }));
        this.scene.add(stars)
    }

    showLinksBetweenPlanets() {
        this.isOrbitPlanetLinkVisible = true;
        this.planets.forEach((planet) => {
            planet.showLinkWithHostPlanet();
        });
    }

    hideLinksBetweenPlanets() {
        this.isOrbitPlanetLinkVisible = false;
        this.planets.forEach((planet) => {
            planet.hideLinkWithHostPlanet();
        });
    }

    showLinksFromSatellites() {
        this.isOrbitSatelliteLinkVisible = true;
        this.satellites.forEach((satellite) => {
            satellite.showLinkWithHostPlanet();
        });
    }

    hideLinksFromSatellites() {
        this.isOrbitSatelliteLinkVisible = false;
        this.satellites.forEach((satellite) => {
            satellite.hideLinkWithHostPlanet();
        });
    }

    hideSatellites() {
        this.satellites.forEach((satellite) => {
            satellite.getHostPlanet().getMesh().remove(satellite.getMesh());
        });
    }

    showSatellites() {
        this.satellites.forEach((satellite) => {
            satellite.getHostPlanet().getMesh().add(satellite.getMesh());
        });
    }

    stopTime() {
        this.isTimeStopped = true;
        this.lastValueForSpeed = this.ticks;
    }

    restartTime() {
        this.isTimeStopped = false;
        this.lastValueForSpeed = 0;
    }

    addAmbientLight() {
        this.scene.add( this.ambientLight );
        this.scene.remove( this.pointLight );
        this.scene.remove( this.directionalLight );
    }

    removeAmbientLight() {
        this.scene.remove( this.ambientLight );
        this.scene.add( this.pointLight );
        this.scene.add( this.directionalLight );
    }

    alignPlanets() {
        this.lastValueForTicks = this.ticks;
        if (this.isSatelliteRouteCreating) {
            this.satellites.forEach((satellite) => {
                satellite.disappearTracedOrbitPath();
            });
        }
        this.planets.forEach((planet) => {
            planet.setBaseSpeed(0);
        });
        this.areAlignedPlanets = true;
        this.#memorizeOldPlanetsRotation();
    }

    desalignPlanets() {
        this.ticks = this.lastValueForTicks;
        this.lastValueForTicks = 0;
        if (this.isSatelliteRouteCreating) {
            this.satellites.forEach((satellite) => {
                satellite.traceOrbitPath();
            });
        }
        this.planets.forEach((planet) => {
            planet.setInitialBaseSpeed();;
        });
        this.areAlignedPlanets = false;
        this.#setOldPlanetsRotation();
    }

    #memorizeOldPlanetsRotation() {
        this.spaceObjects.forEach((spaceObject) => {
            spaceObject.memorizeCurrentRotation();
        });
    }

    #setOldPlanetsRotation() {
        this.spaceObjects.forEach((spaceObject) => {
            spaceObject.setMemorizedOldRotation();
        });
    }

    invertTime() {
        this.timeIsInverted = true;
        if (this.isSatelliteRouteCreating) {
            this.satellites.forEach((satellite) => {
                satellite.updateActionToTracedPath();
            });
        }
    }

    desinvertTime() {
        this.timeIsInverted = false;
        this.satellites.forEach((satellite) => {
            if (this.isSatelliteRouteCreating) {
                satellite.updateActionToTracedPath();
            }
        });
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    showOrbitPath() {
        this.planets.forEach((planet) => {
            planet.appearOrbit();
        });
    }

    hideOrbitPath() {
        this.planets.forEach((planet) => {
            planet.disappearOrbit();
        });
    }

    showOrbitPathSat() {
        this.isSatelliteRouteCreating = true;
        this.satellites.forEach((satellite) => {
            satellite.setTimeIsInvertedTicks();
            satellite.traceOrbitPath();
        });
    }

    hideOrbitPathSat() {
        this.isSatelliteRouteCreating = false;
        this.satellites.forEach((satellite) => {
            // On met la valeur de timeIsInvertedTicks à null pour que la fonction tracePoint() ne prenne pas en compte les inversions du temps
            satellite.setTimeIsInvertedTicks(true);
            satellite.removeTracedOrbitPath();
        });
    }

    linkPlanets() {
        this.isPreviousPlanetLinkVisible = true;
        this.planets.forEach((planet) => {
            planet.showLinkWithPreviousPlanet();
        });
    }

    unlinkPlanets() {
        this.isPreviousPlanetLinkVisible = false
        this.planets.forEach((planet) => {
            planet.hideLinkWithPreviousPlanet();
        });
    }

    #createSpaceObjects(spaceObject) {

        let lowerCasePlanetName = spaceObject.name.toLowerCase();

        let initCoords = [
            spaceObject.initCoords.x, 
            spaceObject.initCoords.y, 
            spaceObject.initCoords.z
        ];
        let moveCoords = [
            spaceObject.moveCoords.x, 
            spaceObject.moveCoords.y, 
            spaceObject.moveCoords.z
        ];
        let scaleCoords = [
            spaceObject.scaleCoords.x, 
            spaceObject.scaleCoords.y, 
            spaceObject.scaleCoords.z
        ];
        let rotationCoords = [
            spaceObject.rotationCoords.x, 
            spaceObject.rotationCoords.y, 
            spaceObject.rotationCoords.z
        ];

        let spaceObjectTmp;
        // Si c'est une planète ou le soleil
        if (spaceObject.hostPlanet === "Sun" || !spaceObject.hostPlanet) {
            spaceObjectTmp = new Planet(
                this,
                spaceObject.name,
                spaceObject.texture,
                initCoords,
                moveCoords,
                scaleCoords,
                rotationCoords,
                spaceObject.speedCoef,
                // Si la planète possède une planète précédente, on lui passe l'objet de la planète précédente, sinon on ne lui passe rien
                spaceObject.previousPlanet ? this[spaceObject.previousPlanet.toLowerCase()] : null,
                spaceObject.hostPlanet ? this[spaceObject.hostPlanet.toLowerCase()] : null
            );
            // On crée dynamiquement la propriété de l'objet courant
            this.setProperty(lowerCasePlanetName, spaceObjectTmp);
            if (!spaceObjectTmp.isSun()) {
                this.planets.push(this[lowerCasePlanetName]);
            }
        } else {
            spaceObjectTmp = new Satellite(
                this,
                spaceObject.name,
                spaceObject.texture,
                initCoords,
                moveCoords,
                scaleCoords,
                rotationCoords,
                spaceObject.speedCoef,
                spaceObject.orbitColor,
                this[spaceObject.hostPlanet.toLowerCase()]
            );
            this.setProperty(lowerCasePlanetName, spaceObjectTmp);
            this.satellites.push(this[lowerCasePlanetName])
        }

        // Uniquement Saturne
        if (spaceObject.ring) {
            let ring = spaceObject.ring;
            let rotationCoords = [ring.rotationCoords.x, ring.rotationCoords.y, ring.rotationCoords.z];
            spaceObjectTmp.addRing(
                ring.innerRadius, 
                ring.outerRadius, 
                ring.thetaSegments, 
                ring.phiSegments, 
                ring.texture, 
                ring.isTransparent, 
                ring.opacity ? ring.opacity : 1,
                rotationCoords
            );
        }

        // Uniquement le soleil
        if (spaceObject.emissiveMaterial) {
            let emissiveMaterial = spaceObject.emissiveMaterial;
            spaceObjectTmp.setMaterial(
                new THREE.MeshStandardMaterial( {
                    emissiveMap: spaceObjectTmp.texture,
                    emissive:  parseInt(emissiveMaterial.color, 16),
                } )
            );
        }

    }

    setProperty(propertyName, propertyValue) {
        this[propertyName] = propertyValue;
    }

    initPlanets() {
        // Planets
        planetJson.forEach((planet) => {
            this.#createSpaceObjects(planet);
        });

        // Satellites
        satelliteJson.forEach((satellite) => {
            this.#createSpaceObjects(satellite);
        });

        this.spaceObjects = [...this.planets, ...this.satellites];

        this.pointLight.position.set(0, 0, 0);
        this.scene.add(this.pointLight);
    }

    #incrementTicks() {
        this.ticks += 2;
    }

    #decrementTicks() {
        this.ticks -= 2;
    }

    render() {
        // On associe la méthode render de la classe associé à l'objet courant à l'animation, la fonction sera appelée à chaque frame d'animation
        this.animationFrameRequestId = requestAnimationFrame( this.render.bind(this) );

        if (!this.isTimeStopped) {
            if (this.timeIsInverted) {
                this.#decrementTicks();
            } else {
                this.#incrementTicks();
            }
        }

        this.ticksRenderer.innerHTML = this.ticks;

        var teta = this.ticks;
        if ( this.isTimeStopped ) {
            teta = this.lastValueForSpeed;
        }

        this.spaceObjects.forEach((spaceObject) => {
            spaceObject.changePosition(teta);
        });

        if ( !this.isTimeStopped && !this.timeIsInverted) {
            this.spaceObjects.forEach((spaceObject) => {
                spaceObject.rotate(teta);
            });
            this.sun.rotate(teta);
        } else if (!this.isTimeStopped && this.timeIsInverted) {
            this.spaceObjects.forEach((spaceObject) => {
                spaceObject.rotate(teta);
            });
            this.sun.rotate(teta);
        }

        // Update les liens des planètes à leur planète hôte
        if (this.isOrbitPlanetLinkVisible) {
            this.planets.forEach((planet) => {
                planet.updateLinkWithHostPlanet();
            });
        }
        // Update les liens des satellites à leur planète hôte
        if (this.isOrbitSatelliteLinkVisible) {
            this.satellites.forEach((satellite) => {
                satellite.updateLinkWithHostPlanet();
            });
        }

        // Update les liens des planètes à leur planète hôte
        if (this.isPreviousPlanetLinkVisible) {
            this.planets.forEach((planet) => {
                planet.updateLinkWithPreviousPlanet();
            });
        }

        if (this.isSatelliteRouteCreating && !this.isTimeStopped && !this.areAlignedPlanets) {
            this.satellites.forEach((satellite) => {
                satellite.tracePoint();
            });
        }

        this.renderer.render( this.scene, this.camera );
        this.controls.update();
    }
}
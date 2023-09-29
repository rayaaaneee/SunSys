import { PointLight, AmbientLight, Scene, WebGLRenderer, Object3D, TextureLoader, SphereGeometry, BufferGeometry, Points, Vector2, Vector3, PointsMaterial, Float32BufferAttribute, MeshStandardMaterial, Raycaster } from 'three';
import { MathUtils } from 'three/src/math/MathUtils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';
import { Planet } from './Planet';
import { Satellite } from './Satellite';

// JSON des propriétés des planètes
import planetJson from "../asset/data/planet.json";
import beltsJson from "../asset/data/belt.json";
// JSON des propriétés des satellites
import satelliteJson from "../asset/data/satellite.json";
import { AsteroidBelt } from './AsteroidBelt';
import { Camera } from './Camera';

export class SolarSystem {

    // Zone d'affichage d'informations surles objets célestes
    static infoObjects = document.getElementById('infoObject');
    static infoObjectsContent = SolarSystem.infoObjects.querySelector(".content");
    static crossInfoObjects = SolarSystem.infoObjects.querySelector("#closeInfo");

    isShowingObjectInformation = false;

    ticks = 0;

    // Initialisation of the scene / camera / renderer
    pointLight = new PointLight(0xffffff, 10, 100);
    ambientLight = new AmbientLight( 0xffffff );
    scene = new Scene();
    camera = new Camera();
    renderer = new WebGLRenderer({ alpha: true, antialias: true });
    stats = new Stats();

    // Initialisation of your objects / materials / light
    solarSystem = new Object3D();

    // Add controls for the camera
    controls = new OrbitControls( this.camera.perspectiveCamera, this.renderer.domElement );

    // Récupération des coordonnées de la souris
    pointer = new Vector2();
    raycaster = new Raycaster();

    // Texture Loader
    textureLoader = new TextureLoader();

    // Models 
    ball = new SphereGeometry(1, 32, 32);
    // Planetes
    mercure; venus; earth; mars; jupiter; saturne; uranus; neptune; pluto;
    planets;
    planets = [];
    // Satellites
    moon;
    satellites = [];

    // Ensemble des astres du systeme solaire
    spaceObjects = [];

    // Ensemble des ceintures d'astéroides
    mainAsteroidBelt; kuiperBelt;
    belts = [];

    // Astres + ceintures d'astéroides
    allObjects = [];

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
    speedMultiplier = 1;
    startTracingOrbitTick = null;
    currentlyClicked = false;

    ticksRenderer = document.getElementById("ticks");

    constructor() {

        // On initialise la scène
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild( this.renderer.domElement );

        this.scene.add(this.solarSystem);

        this.stats.showPanel( 0 );

        this.initPlanets();

        this.initBelts();

        this.initFalseStars();

        // On écoute le mouvement de la souris pour récupérer ses coordonnées
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('click', this.setIsCurrentlyClicked.bind(this));
        window.addEventListener('pointermove', this.onPointerMove.bind(this));

        // De base on place le poiteur au bout de l'écran pour qu'aucun astre ne soit survolé au chargement de la page
        this.pointer.set(window.innerWidth, window.innerHeight);

        this.allObjects = [...this.spaceObjects];

        // On lance une frame d'animation
        this.render();
    }

    setIsCurrentlyClicked() {
        this.currentlyClicked = true;
    }

    onPointerMove(event) {
        // Mettre à jour les coordonnées de la souris
        this.pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
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
        let starsGeometry = new BufferGeometry();
        let starsVertices = [];

        for (let i = 0; i < 10000; i++) {
          let star = new Vector3();
          star.x = MathUtils.randFloatSpread(2000);
          star.y = MathUtils.randFloatSpread(2000);
          star.z = MathUtils.randFloatSpread(2000);
          starsVertices.push(star.x, star.y, star.z);
        }

        starsGeometry.setAttribute('position', new Float32BufferAttribute(starsVertices, 3));
        let stars = new Points(starsGeometry, new PointsMaterial({ color: 0x888888 }));
        this.scene.add(stars)
    }

    initBelts() {
        beltsJson.forEach((belt) => {
            let beltTmp = new AsteroidBelt(
                this,
                belt.name,
                belt.variableName,
                belt.minDistanceX,
                belt.minDistanceY,
                belt.radius,
                belt.nbAsteroids,
                belt.textures,
                belt.informations
            );
            this.belts.push(beltTmp);
            this[ belt.variableName ] = beltTmp;
        });
    }

    printAsteroidBelt() {
        this.allObjects.push(this.mainAsteroidBelt);
        this.mainAsteroidBelt.add();
    }

    unprintAsteroidBelt() {
        this.allObjects = this.allObjects.filter((object) => object !== this.mainAsteroidBelt);
        this.mainAsteroidBelt.remove();
    }

    printKuiperAsteroidBelt() {
        this.allObjects.push(this.kuiperBelt);
        this.kuiperBelt.add();
    }

    unprintKuiperAsteroidBelt() {
        this.allObjects = this.allObjects.filter((object) => object !== this.kuiperBelt);
        this.kuiperBelt.remove();
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
            this.scene.remove(satellite.getMesh());
        });
    }

    showSatellites() {
        this.satellites.forEach((satellite) => {
            this.scene.add(satellite.getMesh());
        });
    }

    hidePlanets() {
        this.planets.forEach((planet) => {
            this.scene.remove(planet.getMesh());
        });
    }

    showPlanets() {
        this.planets.forEach((planet) => {
            this.scene.add(planet.getMesh());
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
    }

    removeAmbientLight() {
        this.scene.remove( this.ambientLight );
        this.scene.add( this.pointLight );
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
        this.camera.resize();
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
                spaceObject.variableName,
                spaceObject.texture,
                initCoords,
                moveCoords,
                scaleCoords,
                rotationCoords,
                spaceObject.speedCoef,
                spaceObject.color,
                // Si la planète possède une planète précédente, on lui passe l'objet de la planète précédente, sinon on ne lui passe rien
                spaceObject.previousPlanet ? this[spaceObject.previousPlanet.toLowerCase()] : null,
                spaceObject.hostPlanet ? this[spaceObject.hostPlanet.toLowerCase()] : null,
                spaceObject.informations
            );
            // On crée dynamiquement la propriété de l'objet courant
            this.setProperty(spaceObject.variableName, spaceObjectTmp);
            if (!spaceObjectTmp.isSun()) {
                this.planets.push(this[spaceObject.variableName]);
            }
        } else {
            spaceObjectTmp = new Satellite(
                this,
                spaceObject.name,
                spaceObject.variableName,
                spaceObject.texture,
                initCoords,
                moveCoords,
                scaleCoords,
                rotationCoords,
                spaceObject.speedCoef,
                spaceObject.orbitColor,
                this[spaceObject.hostPlanet.toLowerCase()],
                spaceObject.informations
            );
            this.setProperty(spaceObject.variableName, spaceObjectTmp);
            this.satellites.push(this[spaceObject.variableName])
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
                new MeshStandardMaterial( {
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

        this.spaceObjects = [this.sun, ...this.planets, ...this.satellites];

        this.pointLight.position.set(0, 0, 0);
        this.scene.add(this.pointLight);
    }

    #incrementTicks() {
        this.ticks += 2 * this.speedMultiplier;
    }

    #decrementTicks() {
        this.ticks -= 2 * this.speedMultiplier;
    }

    updateRaycaster() {
        // Initialisation
        this.raycaster.setFromCamera( this.pointer, this.camera.perspectiveCamera );

        const intersects = this.raycaster.intersectObjects(
            this.allObjects.map((planet) => planet.getMesh()),
        );

        this.allObjects.forEach((object) => {
            object.onHoverOut();
        });
        document.body.classList.remove("pointer");

        // Les éléments survolés sont coloriés
        for ( let i = 0; i < intersects.length; i ++ ) {
            let object = intersects[ i ].object;
            if ( intersects[ i ].object.isMesh) {
                this[object.name].onHover();
                if (this.currentlyClicked) {
                    SolarSystem.infoObjectsContent.scrollTo({ top: 0 })
                    if (this.isShowingObjectInformation) {
                        SolarSystem.crossInfoObjects.click();
                    }
                    setTimeout(() => {
                        this.isShowingObjectInformation = true;
                        this[object.name].showInfo();
                        SolarSystem.infoObjects.classList.add("show");
                    }, 300);
                }
            }
        }

        // Si un astre est survolé, on change le curseur de la souris
        if (intersects.length > 0) {
            document.body.classList.add("pointer");
        }
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
            if (this.speedMultiplier > 1 && this.isSatelliteRouteCreating) {
                // On force le tracage de points ici
                let initialTick = this.ticks - (2 * this.speedMultiplier) + 2;
                let finalTick = this.ticks - 2;
                let ticksToPoint = [];

                // On récupère les ticks intérmédiaires pour tracer les points à chacun, étant donné que l'accélération augmente le gap entre chaque tick
                for (let i = initialTick; i <= finalTick; i += 2) {
                    ticksToPoint.push(i);
                }

                ticksToPoint.forEach((tick) => {
                    this.satellites.forEach((satellite) => {
                        satellite.tracePoint(tick);
                    });
                });
            }
        }

        this.ticksRenderer.textContent = this.ticks;

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

        this.updateRaycaster();
        this.renderer.render( this.scene, this.camera.perspectiveCamera );
        this.controls.update();

        this.currentlyClicked = false;
    }
}
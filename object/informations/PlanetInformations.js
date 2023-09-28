import { SolarSystem } from "../SolarSystem";

export class PlanetInformations {

    // Objet de la planète originale
    planet;

    // Distance moyenne au soleil (en millions de kilomètres)
    moyDistance;
    // Période de révolution (en jours terrestres)
    revolutionPeriod;
    // Période de rotation (en heures terrestres)
    rotationPeriod;
    // Température moyenne à la surface (en degrés Celsius)
    moyTemperature;
    // Vitesse d'orbite moyenne (en kilomètres par seconde)
    moyOrbitSpeed;
    // Masse (en masses terrestres)
    mass;
    // Diamètre (en kilomètres)
    diameter;
    // Composition chimique
    composition;

    constructor(origin, informations) {
        this.planet = origin;
        for (let key in informations) {
            this[key] = informations[key];
        }
    }

    print() {
        SolarSystem.infoObjectsContent.innerHTML = `
            <p>${this.planet.name}</p>
        `;
    }
}
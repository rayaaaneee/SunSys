import { SolarSystem } from "../SolarSystem";

export class SatelliteInformations {

    // Objet du satellite original
    satellite;

    // Diamètre (en kilomètres)
    diameter;
    // Distance moyenne de la planète Hote (en kilomètres)
    moyDistanceToHost;
    // Période de rotation (en heures terrestres)
    rotationPeriod;
    // Période de révolution (en jours terrestres)
    revolutionPeriod;
    // Composition de surface
    composition;
    // Caractériques
    caracteristics;

    constructor (origin, informations) {
        this.satellite = origin;
        for (let key in informations) {
            this[key] = informations[key];
        }
    }

    print() {
        SolarSystem.infoObjectsContent.innerHTML = `
            <p>${this.satellite.name}</p>
        `;
    }
}
import { SolarSystem } from "../SolarSystem";

export class BeltInformations {

    // Objet de la ceinture originale
    belt;

    // Emplacement de la ceinture d'asteroides
    location;
    // Composition de la ceinture d'asteroides
    composition;
    // Nombre d'asteroides
    numberOfAsteroids;
    // Caractéristiques de la ceinture d'asteroides
    caracteristics;

    constructor(origin, informations) {
        this.belt = origin;
        for (let key in informations) {
            this[key] = informations[key];
        }
    }

    print() {
        SolarSystem.infoObjectsContent.innerHTML = `
            <p>${this.belt.name}</p>
        `;
    }
}
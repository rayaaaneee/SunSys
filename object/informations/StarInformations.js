import { SolarSystem } from "../SolarSystem";

export class StarInformations {

    // Objet de la ceinture originale
    star;

    // Type d'etoile
    type;
    // Age en milliards d'annees
    age;
    // Masse en masse kilo
    mass;
    // Diamètre en km
    diameter;
    // Température de surface en °C
    surfaceTemperature;
    // Température intérieure en °C
    interiorTemperature;
    // Luminosité en Lumens solaires
    luminosity;
    // Composition
    composition;

    constructor (origin, informations) {
        this.star = origin;
        for (let key in informations) {
            this[key] = informations[key];
        }
    }

    print() {
        SolarSystem.infoObjectsContent.innerHTML = `
            <p>${this.star.name}</p>
        `;
    }
}
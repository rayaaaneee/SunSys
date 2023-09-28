import { SolarSystem } from "../SolarSystem";

export class StarInformations {

    image;

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
    // Période de rotation en heures
    rotationPeriod;
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
            <div class="line title">
                <img src="./asset/img/info-image/${this.image}"/>
                <p class="title">${this.star.name}</p>
            </div>
            <div class="line">
                <p class="subtitle">Type d'étoile : </p>
                <p>${this.type}</p>
            </div>
            <div class="line">
                <p class="subtitle">Age : </p>
                <p>${this.age} milliards d'années</p>
            </div>
            <div class="line">
                <p class="subtitle">Masse : </p>
                <p>${this.mass} kilogrammes</p>
            </div>
            <div class="line">
                <p class="subtitle">Diamètre : </p>
                <p>${this.diameter} kilomètres</p>
            </div>
            <div class="line">
                <p class="subtitle">Température de surface : </p>
                <p>${this.surfaceTemperature}°C</p>
            </div>
            <div class="line">
                <p class="subtitle">Température intérieure : </p>
                <p>${this.interiorTemperature}°C</p>
            </div>
            <div class="line">
                <p class="subtitle">Luminosité : </p>
                <p>${this.luminosity} lumens solaires</p>
            </div>
            <div class="line">
                <p class="subtitle">Période de rotation : </p>
                <p>${this.rotationPeriod} heures</p>
            </div>
            <div class="line">
                <p class="subtitle">Composition : </p>
            </div>
            ${Object.entries(this.composition).map(([element, percent]) => `
                <div class="line composition">
                    <p class="composition-element">• ${element} : </p>
                    <p>${percent}</p>
                </div>
            `).join("")}
        `;
    }
}
import { SolarSystem } from "../SolarSystem";

export class PlanetInformations {

    image;

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
            <div class="line title">
                <img src="./asset/img/info-image/${this.image}"/>
                <p class="title">${this.planet.name}</p>
            </div>
            <div class="line">
                <p>• Satellite du </p>
                <p class="subtitle">Sun</p>
            </div>
            <div class="line">
                <p class="subtitle">Distance moyenne au soleil : </p>
                <p>${this.moyDistance} millions de kilomètres</p>
            </div>
            <div class="line">
                <p class="subtitle">Période de révolution : </p>
                <p>${this.revolutionPeriod} jours</p>
            </div>
            <div class="line">
                <p class="subtitle">Période de rotation : </p>
                <p>${this.rotationPeriod} heures</p>
            </div>
            <div class="line">
                <p class="subtitle">Température moyenne à la surface : </p>
                <p>${this.moyTemperature} °C</p>
            </div>
            <div class="line">
                <p class="subtitle">Vitesse d'orbite moyenne : </p>
                <p>${this.moyOrbitSpeed} km/s</p>
            </div>
            <div class="line">
                <p class="subtitle">Masse : </p>
                <p>${this.mass} masses terrestres</p>
            </div>
            <div class="line">
                <p class="subtitle">Diamètre : </p>
                <p>${this.diameter} km</p>
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
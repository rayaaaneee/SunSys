import { SolarSystem } from "../SolarSystem";

export class BeltInformations {

    image;

    // Objet de la ceinture originale
    belt;

    // Emplacement de la ceinture d'asteroides
    location;
    // Nombre d'asteroides
    numberOfAsteroids;
    // Composition de la ceinture d'asteroides
    composition;
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
            <div class="line title">
                <img src="./asset/img/info-image/${this.image}"/>
                <p class="title">${this.belt.name}</p>
            </div>
            <div class="line">
                <p class="subtitle">Emplacement : </p>
                <p>${this.location}</p>
            </div>
            <div class="line">
                <p class="subtitle">Nombre d'asteroides : </p>
                <p>${this.numberOfAsteroids}</p>
            </div>
            <div class="line">
                <p class="subtitle">Composition des astéroides : </p>
            </div>
            ${this.composition.map((element) => `
            <div class="line composition">
                <p>• ${element}</p>
            </div>
            `).join("")}
            <div class="line">
                <p class="subtitle">Caractéristiques : </p>
            </div>
            ${this.caracteristics.map((element) => `
                <div class="line composition">
                    <p>• ${element}</p>
                </div>
            `).join("")}

        `;
    }
}
import { isProduction } from "../../function/isProduction";
import { stringifyNumber } from "../../function/stringifyNumber";
import { SolarSystem } from "../SolarSystem";

export class SatelliteInformations {

    image;

    // Objet du satellite original
    satellite;

    path = isProduction("./assets/info-image/", "./asset/img/info-image/");

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
            <div class="line title">
                <img src="${this.path + this.image}"/>
                <p class="title">${this.satellite.name}</p>
            </div>
            <div class="line">
                <p>• Satellite de </p>
                <p class="subtitle">${this.satellite.getHostPlanet().name}</p>
            </div>
            <div class="line">
                <p class="subtitle">Diamètre : </p>
                <p>${stringifyNumber(this.diameter)} kilomètres</p>
            </div>
            <div class="line">
                <p class="subtitle">Distance moyenne de ${this.satellite.getHostPlanet().name} : </p>
                <p>${stringifyNumber(this.moyDistanceToHost)} kilomètres</p>
            </div>
            <div class="line">
                <p class="subtitle">Période de révolution : </p>
                <p>${stringifyNumber(this.revolutionPeriod)} jours</p>
            </div>
            <div class="line">
                <p class="subtitle">Période de rotation : </p>
                <p>${stringifyNumber(Math.abs(this.rotationPeriod))} heures</p>
            </div>
            <div class="line">
                <p class="subtitle">Sens de rotation : </p>
                <p>${this.satellite.getRotationType()}</p>
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
            <div class="line">
                <p class="subtitle">Caractériques : </p>
            </div>
            ${this.caracteristics.map((element) => `
                <div class="line composition">
                    <p>• ${element}</p>
                </div>
            `).join("")}
        `;
    }
}
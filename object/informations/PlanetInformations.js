import { isProduction } from "../../function/isProduction";
import { stringifyNumber } from "../../function/stringifyNumber"
import { SolarSystem } from "../SolarSystem";

export class PlanetInformations {

    image;

    // Objet de la planète originale
    planet;

    path = isProduction("assets/info-image/", "asset/img/info-image/");

    isGaseous;

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
    // Climat
    climate;
    // Caractériques météorologiques
    weather;
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
                <img src="./${this.path + this.image}"/>
                <p class="title">${this.planet.name}</p>
            </div>
            <div class="line">
                <p>• Satellite du </p>
                <p class="subtitle">Sun</p>
            </div>
            <div class="line">
                <p class="subtitle">Type : </p>
                <p>${this.isGaseous ? 'Géante gazeuse' : 'Rocheuse'}</p>
            </div>
            <div class="line vertical">
                <p class="subtitle">• Climat : <p>
                <p>${this.climate}<p>
            </div>
            <div class="line vertical">
                <p class="subtitle">• Caractéristiques météorologiques : <p>
                <p>${this.weather}<p>
            </div>
            <div class="line">
                <p class="subtitle">Distance moyenne au soleil : </p>
                <p>${stringifyNumber(this.moyDistance)} millions de kilomètres</p>
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
                <p>${this.planet.getRotationType()}</p>
            </div>
            <div class="line">
                <p class="subtitle">Température moyenne à la surface : </p>
                <p>${stringifyNumber(this.moyTemperature)} °C</p>
            </div>
            <div class="line">
                <p class="subtitle">Vitesse d'orbite moyenne : </p>
                <p>${stringifyNumber(this.moyOrbitSpeed)} km/s</p>
            </div>
            <div class="line">
                <p class="subtitle">Masse : </p>
                <p>${stringifyNumber(this.mass)} masses terrestres</p>
            </div>
            <div class="line">
                <p class="subtitle">Diamètre : </p>
                <p>${stringifyNumber(this.diameter)} km</p>
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
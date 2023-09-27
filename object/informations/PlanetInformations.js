export class PlanetInformations {

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

    constructor(informations) {
        this.moyDistance = informations.moyDistance;
        this.revolutionPeriod = informations.revolutionPeriod;
        this.rotationPeriod = informations.rotationPeriod;
        this.moyTemperature = informations.moyTemperature;
        this.moyOrbitSpeed = informations.moyOrbitSpeed;
        this.mass = informations.mass;
        this.diameter = informations.diameter;
        this.composition = informations.composition;
    }
}
export class SatelliteInformations {

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

    constructor (informations) {
        this.diameter = informations.diameter;
        this.moyDistanceToHost = informations.moyDistanceToHost;
        this.rotationPeriod = informations.rotationPeriod;
        this.revolutionPeriod = informations.revolutionPeriod;
        this.composition = informations.composition;
        this.caracteristics = informations.caracteristics;
    }
}
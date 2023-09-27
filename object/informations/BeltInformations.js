export class BeltInformations {

    // Emplacement de la ceinture d'asteroides
    location;
    // Composition de la ceinture d'asteroides
    composition;
    // Nombre d'asteroides
    numberOfAsteroids;
    // Caractéristiques de la ceinture d'asteroides
    caracteristics;

    constructor(informations) {
        this.location = informations.location;
        this.composition = informations.composition;
        this.numberOfAsteroids = informations.numberOfAsteroids;
        this.caracteristics = informations.caracteristics;
    }
}
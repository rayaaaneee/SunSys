export class StarInformations {

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

    constructor (informations) {
        this.type = informations.type;
        this.age = informations.age;
        this.mass = informations.mass;
        this.diameter = informations.diameter;
        this.surfaceTemperature = informations.surfaceTemperature;
        this.interiorTemperature = informations.interiorTemperature;
        this.luminosity = informations.luminosity;
        this.composition = informations.composition;
    }
}
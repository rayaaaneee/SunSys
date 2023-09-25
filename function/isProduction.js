// Fonction qui permet de définir une valeur en fonction de l'environnement
export const isProduction = (productionValue, devValue = null) => {
    if (process.env.NODE_ENV === "production") {
        return productionValue;
    } else if (devValue) {
        return devValue;
    }
    return null;
}
import { SolarSystem } from './objects/SolarSystem';

var sunSys = new SolarSystem();

const configPanel = document.getElementById('configPanel');
const closePanel = document.getElementById('closePanel');
let isControlPanelOpen = true;
closePanel.addEventListener('click', (e) => {
    configPanel.classList.add('hidden');
    setTimeout(() => {
        isControlPanelOpen = false;
    }, 0);
});
configPanel.addEventListener('click', (e) => {
    if (configPanel.classList.contains('hidden') && !isControlPanelOpen) {
        configPanel.classList.remove('hidden');
        isControlPanelOpen = true;
    }
});


const changeLightInput = document.getElementById('bigLight');
changeLightInput.addEventListener('change', (e) => {
    light(e.target);
});
const light = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.addAmbientLight();
            break;
        case false:
            sunSys.removeAmbientLight();
            break;
    }
}

const changeSpeedRange = document.getElementById('changeSpeedRange');
const rangeValueContainer = document.querySelector('.range-value');
const speedValue = document.getElementById('speedValue');
changeSpeedRange.addEventListener('input', (e) => {
    speed(e.target);
    rangeValueContainer.classList.add('show');
});
document.addEventListener('mouseup', (e) => {
    if (e.target === changeSpeedRange) {
        // Le bouton de la souris a été relâché sur le range
        rangeValueContainer.classList.remove('show');
    }
});
const speed = (range) => {
    let value = range.value;
    speedValue.textContent = "x" + value;
    // La valeur de x va de 5% à 90%, le range demarre de 1 et finit à 10
    let scale = 90 - 5;
    let gap = scale / 9;
    let x = 5 + (gap * (value - 1));
    rangeValueContainer.style.left = x + "%";

    sunSys.speedMultiplier = value;
}

const stopTimeButton = document.getElementById('stopTime');
stopTimeButton.addEventListener('click', (e) => {
    stopTime(e.target);
});
const stopTime = (button) => {
    button.classList.toggle('active');
    if (button.classList.contains('active')) {
        sunSys.stopTime();
    } else {
        sunSys.restartTime();
    }
}

const alignPlanetsCheckbox = document.getElementById('alignPlanets');
alignPlanetsCheckbox.addEventListener('click', (e) => {
    alignPlanets(e.target);
});
const alignPlanets = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.alignPlanets();
            break;
        case false:
            sunSys.desalignPlanets();
            break;
    }
}

const hideSatellitesCheckbox = document.getElementById('hideSatellites');
hideSatellitesCheckbox.addEventListener('click', (e) => {
    hideSatellites(e.target);
});
const hideSatellites = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.hideSatellites();
            break;
        case false:
            sunSys.showSatellites();
            break;
    }
}

const invertTimeCheckbox = document.getElementById('invertTime');
invertTimeCheckbox.addEventListener('click', (e) => {
    invertTime(e.target);
});
const invertTime = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.invertTime();
            break;
        case false:
            sunSys.desinvertTime();
            break;
    }
}

const planetLinksCheckbox = document.getElementById('planetLinks');
planetLinksCheckbox.addEventListener('click', (e) => {
    showPlanetLinks(e.target);
});
const showPlanetLinks = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.showLinksBetweenPlanets();
            break;
        case false:
            sunSys.hideLinksBetweenPlanets();
            break;
    }
}

const satelliteLinksCheckbox = document.getElementById('satelliteLinks');
satelliteLinksCheckbox.addEventListener('click', (e) => {
    showSatelliteLinks(e.target);
});
const showSatelliteLinks = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.showLinksFromSatellites();
            break;
        case false:
            sunSys.hideLinksFromSatellites();
            break;
    }
}

const orbitPathCheckbox = document.getElementById('orbitPath');
orbitPathCheckbox.addEventListener('click', (e) => {
    showOrbitPath(e.target);
});
const showOrbitPath = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.showOrbitPath();
            break;
        case false:
            sunSys.hideOrbitPath();
            break;
    }
}
if (orbitPathCheckbox.checked) showOrbitPath(orbitPathCheckbox);

const orbitPathSatCheckbox = document.getElementById('orbitPathSat');
orbitPathSatCheckbox.addEventListener('click', (e) => {
    showOrbitPathSat(e.target);
});
const showOrbitPathSat = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.showOrbitPathSat();
            break;
        case false:
            sunSys.hideOrbitPathSat();
            break;
    }
}

const linkPlanetsCheckbox = document.getElementById('linkPlanets');
linkPlanetsCheckbox.addEventListener('click', (e) => {
    showLinkPlanets(e.target);
});
const showLinkPlanets = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.linkPlanets();
            break;
        case false:
            sunSys.unlinkPlanets();
            break;
    }
}


const showFpsCheckbox = document.getElementById('showFps');
showFpsCheckbox.addEventListener('click', (e) => {
    showFps(e.target);
});
const showFps = (checkbox) => {
    switch (checkbox.checked) {
        case true:
            sunSys.printFramesPerSecond();
            break;
        case false:
            sunSys.unprintFramesPerSecond();
            break;
    }
}

// Simuler le clic sur une planete : Raycaster();

// Resize le canva quand on resize la fenetre
window.addEventListener('resize', () => {
    sunSys.resize();
});
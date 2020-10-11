import { init, update } from './map.js';
import { reportError } from './shared/utils.js';
import { startMockMode } from './mock.js';



if (!('geolocation' in navigator)) {
    reportError(`GPS: not supported`);
    alert('Zarizeni nepodporuje GPS, aplikace nebude fungovat')
} else {
    main();
}


async function main() {
    const initOk = await init();
    if (!initOk) {
        alert('Selhalo nacteni aplikace');
        return;
    }
    if (window.location.protocol !== 'https:') {
        startMockMode();
    } else {
        navigator.geolocation.watchPosition(
            pos => update(pos.coords.latitude, pos.coords.longitude),
            err => reportError(`GPS: watchPosition ERROR ${err.code}: ${err.message}`),
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
            },
        );
    }
}


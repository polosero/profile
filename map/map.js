import { deepFreeze, authFetch, reportError } from './shared/utils.js';
import './location/LocationDialog.js';



// TODO? get this from server? depending on the map
export const boundary = deepFreeze({
    topLeft: {
        lati: 49.5955883,
        longi: 17.2293636,
    },
    botRight: {
        lati: 49.5757369,
        longi: 17.2841019,
    },
    displayDistance: 0.0015,
    interactDistance: 0.0003,
});

let locations;
export async function init() {
    const response = await authFetch('/api2/map/location/');
    if (response.ok) {
        const responseData = await response.json();
        locations = responseData.locations;
    } else {
        reportError(`map init: ${response.status}: ${response.statusText}`);
    }
    return response.ok;
}


/** returns 0.0 for x=min and 1.0 for x=max */
const rel = (min, max) => x => (x - min) / (max - min);
/** relative position from bottom */
const relLati = rel(boundary.topLeft.lati, boundary.botRight.lati);
/** relative position from left */
const relLongi = rel(boundary.topLeft.longi, boundary.botRight.longi);



export function update(lati, longi) {
    console.log('update', lati, longi);
    updateMap(lati, longi);
    displayLocations(lati, longi);
}

function updateMap(lati, longi) {
    const map = document.getElementById('map');
    const trX = relLongi(longi) * 100 * (-1);
    const trY = relLati(lati) * 100 * (-1);
    map.style.transform = `translate(${trX}%, ${trY}%)`;
}


const distance = (A, B) =>  // TODO
    Math.sqrt(
        Math.pow(A.lati * 1.5 - B.lati * 1.5, 2)
        + Math.pow(A.longi - B.longi, 2)
    );


function displayLocations(lati, longi) {
    for (const oldLoc of document.querySelectorAll('main > .location')) {
        oldLoc.parentNode.removeChild(oldLoc);
    }
    for (const loc of locations) {
        const locDistance = distance(loc, { lati, longi });
        // console.log(loc.name, locDistance);
        if (locDistance < boundary.displayDistance) {
            const canInteract = locDistance < boundary.interactDistance;
            renderLocation(loc, { canInteract });
        }
    }
}

function renderLocation(loc, { canInteract }) {
    const newLoc = document.createElement('div');
    newLoc.classList.add('location');
    if (canInteract) {
        newLoc.classList.add('location--interactive');
        newLoc.addEventListener('click', ev => {
            const dialog = document.createElement('location-dialog');
            dialog.setAttribute('location-id', loc.id);
            document.body.appendChild(dialog);
        });
    }
    newLoc.style.left = relLongi(loc.longi) * 100 + '%';
    newLoc.style.top = relLati(loc.lati) * 100 + '%';
    newLoc.style.backgroundColor = loc.color || 'white';
    newLoc.title = loc.name;
    document.querySelector('main').appendChild(newLoc);
}


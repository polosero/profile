import { Dialog } from '../shared/dialog/Dialog.js';
import { authFetch, reportError } from '../shared/utils.js';



class LocationDialog extends Dialog {

    get locationId() {
        return Number(this.getAttribute('location-id'));
    }

    constructor() {
        super({
            styles: ['./location/location.css'],
        });
        this.shadowRoot.appendChild(this._title = document.createElement('h2'));
        this.shadowRoot.appendChild(this._text = document.createElement('p'));
    }

    connectedCallback() {
        this._getDetails();
    }

    async _getDetails() {
        this.classList.add('Dialog--loading');
        const response = await authFetch(`/api2/map/location/${this.locationId}`);
        if (!response.ok) {
            reportError(`location detail: ${response.status}: ${response.statusText}`);
            return;
        }
        const data = await response.json();
        this._render(data);
        this.classList.remove('Dialog--loading');
    }

    _render(data) {
        this._title.textContent = data.name;
        this._text.textContent = data.description;
        // TODO: render data.actions
    }

}


customElements.define('location-dialog', LocationDialog);


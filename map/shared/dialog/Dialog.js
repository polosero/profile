import { ComponentBase } from '../ComponentBase.js';



export class Dialog extends ComponentBase {
    constructor(config) {
        super({
            ...config,
            styles: ['./shared/dialog/dialog.css', ...config.styles],
        });
        addCloseButton.call(this);
    }
}


function addCloseButton() {
    const btn = document.createElement('button');
    btn.textContent = 'X';
    btn.classList.add('Dialog--close');
    btn.addEventListener('click', event => {
        this.parentNode.removeChild(this);
    });
    this.shadowRoot.appendChild(btn);
}

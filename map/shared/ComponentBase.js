


export class ComponentBase extends HTMLElement {
    /**
     * config: {
     *     styles: string[],  // list of style urls, relative to index.html
     * }
     */
    constructor(config = {}) {
        super();
        this.attachShadow({ mode: 'open' });
        for (const styleUrl of config.styles || []) {
            this.shadowRoot.appendChild(createStyle(styleUrl));
        }
    }
}


function createStyle(url) {
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', url);
    return linkElem;
}

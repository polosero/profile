import { update, boundary } from './map.js';



export function startMockMode() {
    let _mock_lati = boundary.topLeft.lati;
    let _mock_longi = boundary.topLeft.longi;
    const _up = () => update(_mock_lati, _mock_longi);
    _up();
    window.mv = {
        down(x) {
            _mock_lati -= 0.0001 + (x || 0);
            _up();
        },
        up(x) {
            _mock_lati += 0.0001 + (x || 0);
            _up();
        },
        right(x) {
            _mock_longi += 0.0001 + (x || 0);
            _up();
        },
        left(x) {
            _mock_longi -= 0.0001 + (x || 0);
            _up();
        },
    };
    setupKeyboard();
    setupButtons();
}


function setupKeyboard() {
    document.addEventListener('keypress', ev => {
        switch (ev.key.toLowerCase()) {
            case 'w':
                window.mv.up(ev.shiftKey*0.001);
                break;
            case 's':
                window.mv.down(ev.shiftKey*0.001);
                break;
            case 'a':
                window.mv.left(ev.shiftKey*0.001);
                break;
            case 'd':
                window.mv.right(ev.shiftKey*0.001);
                break;
        }
    });

}


function setupButtons() {
    const { down, up, right, left } = window.mv;
    const big = (cb) => () => cb(0.001);
    addMockButton(down, 'v', 50, 70);
    addMockButton(big(down), 'vv', 50, 80);
    addMockButton(up, '^', 50, 30);
    addMockButton(big(up), '^^', 50, 20);
    addMockButton(right, '>', 70, 50);
    addMockButton(big(right), '>>', 85, 50);
    addMockButton(left, '<', 30, 50);
    addMockButton(big(left), '<<', 15, 50);
}

function addMockButton(moveCb, text, posLeft, posTop) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.opacity = '0.7';
    btn.style.left = `${posLeft}vw`;
    btn.style.top = `${posTop}vh`;
    btn.style.transform = 'translate(-50%, -50%)';
    btn.addEventListener('click', ev => {
        ev.stopPropagation();
        moveCb();
    });
    document.querySelector('body > nav').appendChild(btn);
}



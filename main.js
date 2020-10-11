window.unauthorizedHandler = redirectToLogin;

window.addEventListener('load', fetchUserInfo);
window.addEventListener('load', fetchCharInfo);
window.addEventListener('load', fetchRaces);
window.addEventListener('load', fetchFactions);
window.addEventListener('load', fetchAllChars);

hashchangeRegister('char', openCharDetail, '/profile/characters');


APPROVALSTATS = ['', 'draft', 'request', 'accepted', 'proposal', 'final'];
APPROVALSTATSTXT = [
    '',
    'Zvol si rasu a frakci, poté "požádej o postavu". Po schválení'
    + ' se ti odemknou herní informace a budeš si moci dokončit postavu.',
    'Čeká na přijetí organizátorem',
    'Postava přijata, jméno, frakce ani rasa již nelze změnit',
    'proposal',
    'final' ];
USER = null;
CHARACTER = null;
ALLCHARACTERS = [];
function getApplicationNote(appId) {
  if (appId === 5)  // pohled
    return 'Nutné vidět útok';
  return 'Nutné vyblokovat nosič/ruku/zbraň svou zbraní/rukou';
}


function fetchUserInfo() {
    XHR(
        'GET',
        '/auth/full'
    ).then(response => {
        USER = response;
        response && drawUser(response);
    });
}

function fetchCharInfo(cb) {
    XHR(
        'GET',
        '/profile/characters/my'
    ).then(response => {
        CHARACTER = response;
        response && drawCharacter(response);
        response && fetchMyLore();
        document.querySelector('nav > a[href="#info"]')
            .hidden = !response || response.approval_status < 3;
        response && response.skills && drawCharacterSkills(response.skills);
        document.querySelector('nav > a[href="#skills"]')
            .hidden = !response || !response.skills || !response.skills.length;
        document.getElementById('character-add-btn').hidden = !!response;
        document.getElementById('edit-char-btn').hidden
            = document.getElementById('request-char-btn').hidden
            = !response || response.approval_status !== 1;
        cb && cb();
    });
}

function fetchRaces() {
    XHR(
        'GET',
        '/lore/races'
    ).then(response => {
        const els = document.querySelectorAll('.races-select');
        const options = '<option value=""></option>'
            + response.map(race =>
                `<option value="${Number(race.id)}">${e(race.name)}</option>`
            ).join('\n');
        for (const el of els) {
            el.innerHTML = options;
            el.hasAttribute('data-value') && (el.value = el.getAttribute('data-value'));
        }
    });
}

function fetchFactions() {
    XHR(
        'GET',
        '/lore/factions'
    ).then(response => {
        const els = document.querySelectorAll('.factions-select');
        const options = '<option value=""></option>'
            + response.map(faction =>
                `<option value="${Number(faction.id)}">${e(faction.name)}</option>`
            ).join('\n');
        for (const el of els) {
            el.innerHTML = options;
            el.hasAttribute('data-value') && (el.value = el.getAttribute('data-value'));
        }
    });
}

function fetchAllChars(isRetry) {
    isRetry = isRetry === true;
    XHR(
        'GET',
        '/profile/characters' + (isRetry ? '' : '/full')
    ).catch(err => {
        if (isRetry)
            document.getElementById('character-list').hidden = true;
        else
            fetchAllChars(true);
    }).then(response => {
        drawAllChars(response);
        _xhrResolvedRequests.add('/profile/characters');
    }).catch(console.error);
}

function fetchLoreAndSkills(charId) {
    XHR(
        'GET',
        `/profile/characters/${charId}`
    ).then(drawLoreAndSkills)
     .catch(console.error);
}

function fetchMyLore() {
    XHR(
        'GET',
        '/documents/my'
    ).then(drawMyLore)
    .catch(err => {
        console.error(err);
    });
}
function fetchSnippetImage(id) {
    XHR(
        'GET',
        `/documents/my/img/${Number(id)}`,
        null,
        true
    ).then(response => {
        document.getElementById(`snip-img-${id}`).src = response.src;
    }).catch(console.error);
}

function newCharacter(form, event) {
    event.preventDefault();
    event.stopPropagation();
    XHR(
        'POST',
        '/profile/characters/new',
        extract(form)
    ).then(response => {
        if (response) {
            document.getElementById('character-add-form').hidden = true;
            document.getElementById('character-add-btn').hidden = true;
            fetchCharInfo();
        }
    }).catch(error => {
        setError(form, error);
    });
}

function updateCharacter(form, event) {
    event.preventDefault();
    event.stopPropagation();
    XHR(
        'PUT',
        `/profile/characters/${Number(CHARACTER.id)}`,
        extract(form)
    ).then(response => {
        console.log('charupdate:', response);
        editCharInfo(false);
    }).catch(error => {
        setError(form, error);
    });
}

function updateLore(form, event) {
    event.preventDefault();
    event.stopPropagation();
    const data = extract(form);
    XHR(
        'PUT',
        `/documents/my/${Number(data.id)}`,
        data
    ).then(response => {
        console.log('updateLore', response);
        form.hidden = true;
        fetchMyLore();
        setError(form);
        form.reset();
    }).catch(error => {
        console.error(error);
        setError(form, error);
    });
}

function requestChar() {
    const OK = confirm('Požádáním o postavu se zamkne jméno, rasa a frakce.'
                    + 'Po schválení organizátorem si budeš moci postavu dokončit.');
    if (!OK)
        return;
    XHR(
        'POST',
        `/profile/characters/${CHARACTER.id}/request`
    ).then(response => {
        fetchCharInfo();
    }).catch(err => {
        console.error(err);
        alert('Nepodařilo se požádat o postavu. Zkontroluj zdali máš správně vyplněna všechna políčka.');
    });
}
function acceptChar(charId) {
    const OK = confirm(`Schválením postavy [${Number(charId)}] se zamkne jméno, rasa a frakce.`
                    + ' Hráči se zpřístupní herní info pro jeho postavu.');
    if (!OK)
        return;
    XHR(
        'POST',
        `/profile/characters/${Number(charId)}/accept`
    ).then(response => {
        fetchAllChars();
    }).catch(err => {
        console.error(err);
        alert('Nepodařilo se schválit postavu :(');
    });
}

function updatePhone(value) {
    XHR(
        'PUT',
        '/profile/updateMyPhone',
        { value }
    ).catch(console.warn)
     .then(fetchUserInfo)
     .catch(console.error);
}

function updateBorn(value) {
    XHR(
        'PUT',
        '/profile/updateMyBorn',
        { value }
    ).catch(console.warn)
     .then(fetchUserInfo)
     .catch(console.error);
}
function updateSPZ(value) {
    XHR(
        'PUT',
        '/profile/updateMySPZ',
        { value }
    ).catch(console.warn)
     .then(fetchUserInfo)
     .catch(console.error);
}



function openAddChar(val) {
    document.getElementById('character-add-form').hidden = !val;
}

function editCharInfo(edit) {
    if (!edit)
        fetchCharInfo(_editCharInfo.bind(null, edit));
    else
        _editCharInfo(edit);
}
function _editCharInfo(edit) {
    const el = document.getElementById('character-info');
    const q = el.querySelector.bind(el);
    q('[type=submit]').hidden = !edit;
    q('fieldset').disabled = !edit;
    edit ? el.classList.add('dialog') : el.classList.remove('dialog');
}

function openLoreEdit(id, content) {
    const dialog = document.getElementById('lore-edit-dialog');
    if (!id)
        return dialog.hidden = true;
    dialog.querySelector('[name=id]').value = id;
    dialog.querySelector('[name=content]').value = content;
    dialog.hidden = false;
}

function openCharDetail(charId) {
    console.log('char detail', charId);
    const form = document.getElementById('char-detail');
    if (!charId)
        return form.hidden = true;
    const char = ALLCHARACTERS.find(c => c.id === charId);
    if (!char) {
        console.warn(`no char with id = ${charId}`);
        form.reset();
        return;
    }
    char._status = APPROVALSTATS[char.approval_status];
    setValues(form, char);
    form.hidden = false;
    fetchLoreAndSkills(charId);
}

function openEditPhone() {
    const phone = prompt(
        'Tvoje telefonní číslo (aby tě organizátoři mohli ve hře kontektovat)',
        USER.phone || '',
    );
    if (typeof phone === 'string')
        updatePhone(phone);
}

function openEditBorn() {
    const born = prompt(
        'Tvoje datum narození',
        USER.born || '',
    );
    if (typeof born === 'string')
        updateBorn(born);
}


function openEditSPZ() {
    const spz = prompt(
        'SPZ auta se kterým přijedeš, abychom tě mohli kontaktovat pokud např. špatně zaparekuješ',
        USER.spz || '',
    );
    if (typeof spz === 'string')
        updateSPZ(spz);
}




function drawUser(user) {
    const el = document.getElementById('user-info');
    setValues(el, user);
    el.hidden = false;
}

function drawCharacter(char) {
    const el = document.getElementById('character-info');
    setValues(el, char)
    el.hidden = false;
    document.getElementById('char-info-status-text').innerText
        = APPROVALSTATSTXT[char.approval_status];
}

function drawCharacterSkills(skills, admin) {
    const list = document.getElementById(admin ? 'char-detail-skills' : 'character-skills');
    list.innerHTML = '';
    for (const skill of skills) {
        const tmp = template('char-talent');
        setValuesByCls(tmp, skill);
        list.appendChild(tmp);
        const skill_el = list.querySelector('.talent:last-child');
        const produces_list = skill_el.querySelector('ul');
        for (const produces of skill.produces) {
            produces.application_note = getApplicationNote(produces.application_id);
            const prod_tmp = template('char-talent-produces');
            setValuesByCls(prod_tmp, produces);
            produces_list.appendChild(prod_tmp);
        }
    }
}

function drawAllChars(response) {
    ALLCHARACTERS = response || [];
    const el = document.getElementById('character-list');
    el.innerHTML = '';
    if (!response)
        return;
    for (const char of response)
        drawChar(char, el);
    el.hidden = false;
}

function drawChar(char, list) {
    const item = template('char-item');
    const q = item.querySelector.bind(item);
    q('.id').innerText = char.id;
    q('.name').innerText = char.name;
    q('.name').href = `#char${Number(char.id)}`;
    q('.faction').innerText = char.faction;
    q('.race').innerText = char.race;
    q('.status').innerText = APPROVALSTATS[char.approval_status];
    list.appendChild(item);
    if (char.approval_status === 2) {
        const btn = list.lastElementChild.querySelector('button');
        btn.onclick = acceptChar.bind(null, Number(char.id));
        btn.hidden = false;
    }
}

function drawMyLore(lore, admin) {
    const infoEl = document.getElementById(admin ? 'char-detail-lore' : 'info');
    infoEl.innerHTML = Object.keys(lore).length
        ? '<nav></nav>'
        : '<p>Žádné informace (tohle není vpořádku, kontaktuj orgy)</p>';
    const infoElNav = infoEl.querySelector('nav');
    let _first = true;
    let docId = 0;
    for (const docName in lore) {
        ++docId;
        const article = template('info-article');
        const q = article.querySelector.bind(article);
        // q('.title').innerText = docName;
        const inputId = `document--${docId}${admin ? 'a' : ''}`;
        infoElNav.innerHTML += `<label for="${inputId}"> ${docName} </label>`;
        let radioBtn = template('info-radio-button');
        infoEl.insertBefore(radioBtn, infoElNav);
        radioBtn = infoEl.querySelector('input:last-of-type');
        admin && (radioBtn.name += '-admin');
        radioBtn.setAttribute('id', inputId);
        _first && radioBtn.setAttribute('checked', '');
        _first = false;
        const doc = q('.document');
        doc.open = true;
        for (const snippet of lore[docName]) {
            const snipTemplate = template('info-snippet');
            snipTemplate.querySelector('.snippet').innerHTML += md(snippet.content);
            if (snippet.has_img) {
                fetchSnippetImage(snippet.id);
                snipTemplate.querySelector('.snippet').innerHTML +=
                    `<img id="snip-img-${snippet.id}" />`;
            }
            doc.appendChild(snipTemplate);
            if (snippet._editable && !admin) {
                const editBtn = doc.lastElementChild.querySelector('.edit')
                editBtn.addEventListener('click',
                    openLoreEdit.bind(null, snippet.id, snippet.content),
                );
                editBtn.hidden = false;
            }
        }
        infoEl.appendChild(article);
        infoEl.querySelector('article:last-of-type')
            .classList.add(inputId);
    }
}

function drawLoreAndSkills(response) {
    drawCharacterSkills(response.skills, true);
    drawMyLore(response.lore, true);
}



function logout() {
    XHR(
        'POST',
        '/auth/logout'
    ).then(response => {
        document.cookie = 'auth-token=; domain=polo-sero.cz; secure; samesite=strict; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        location.reload();
    }).catch(err => {
        console.error(err);
    });
}

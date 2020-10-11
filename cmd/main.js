CUSTOM_HELP = {
    help: '<u>help</u> display possible commands<br><u>help <i>cmd</i></u> display info about <i>cmd</i> (if any)',
    time: '<u>time</u> display current date and time',
    dns: '<u>dns <i>uri</i></u> display ip for given uri',
    ls: '<u>ls</u> lists possible attacks',
    stat: '<u>stat</u> display status of running attacks',
    run: '<u>run <i>attack_name ip ...args</i></u> start attack',
    resolve: '<u>resolve <i>id</i></u> executes prepared attack, see <u>stat</u>',
    kill: '<u>kill <i>id</i></u> cancels ongoing attack, see <u>stat</u>',
    list: '<u>run list <i>ip</i></u>',
    index: '<u>run index <i>ip document</i></u>',
    get: '<u>run get <i>ip document index</i></u>',
    put: '<u>run put <i>ip document index</i></u>',
    post: '<u>run post <i>ip document</i></u>',
    delete: '<u>run delete <i>ip document index</i></u>',
    'brute-force': '<u>run brute-force <i>ip</i></u>',
    find: '<u>run find <i>ip document needle</i></u>',
    'list++': 'see <u>help list</u>',
    'index++': 'see <u>help index</u>',
    'get++': 'see <u>help get</u>',
    'put++': 'see <u>help put</u>',
    'post++': 'see <u>help post</u>',
    'delete++': 'see <u>help delete</u>',
    'brute-force++': 'see <u>help brute-force</u>',
    'find++': 'see <u>help find</u>',
};

const ATTACKS_WITH_INPUT = ['put', 'post', 'put++', 'post++'];


const format = {
    attack: function(att) {
        return `
            ${e(att.name)} - ${e(att.description)}
            (${e(att.duration.replace('+', ''))})
        `;
    },
    status: function(stat) {
        return `[${Number(stat.id)}] ${e(stat.name)} @${e(stat.ip)}
            - ${(new Date(stat.will_be_done+'+00:00')).toLocaleString()}
        `;
    },
};


const commands = {
    qq: function() {
        this.output('So sad :(');
    },
    time: function () {
        this.output((new Date()).toLocaleString());
    },
    dns: async function(params) {
        const res = await dnsLookup(params[0]);
        this.output(res ? res.ip : '<sub>Not found</sub>');
    },
    ls: async function() {
        const possible = await getPossible();
        if (!possible)
            return;
        if (!possible.length)
            this.output('<sub>nothing</sub>');
        for (const att of possible)
            this.output(format.attack(att));
    },
    run: async function(params) {
        if (ATTACKS_WITH_INPUT.includes(params[0])) {
            const val = prompt('value');
            if (val)
                params.push(val.replace(/\\n/g, '\n'));
            else
                return this.output('<sub> Doing nothing </sub>')
        }
        await doAttack(...params);
        return this.output();
    },
    stat: async function() {
        const { attacks, slots } = await getStatus();
        if (!slots)
            return this.output('<sub>nothing</sub>');
        this.output(attacks.map(format.status).join('<br>'));
        for (let i = attacks.length; i < slots; ++i)
            this.output('[ ] <sub>empty</sub>')
    },
    kill: async function(params) {
        await cancelAttack(params[0]);
        this.output();
    },
    resolve: async function(params) {
        if (params.length !== 1)
            return this.output('<u>resolve</u> acceps exactly 1 param');
        const res = await resolveAttack(...params);
        if (typeof res === 'object') {
            this.output('OK, result data:');
            for (const key in res)
                key[0] === '_' || this.output(`${key}: ${JSON.stringify(res[key])}`);
        } else {
            this.output('no data to display');
            this.output(`<sub> the operation failed, or there was no data </sub>`);
        }
    },
    this: function() {
        this.output(`
            Beautiful is better than ugly. <br />
            Explicit is better than implicit. <br />
            Simple is better than complex. <br />
            Complex is better than complicated. <br />
            Flat is better than nested. <br />
            Sparse is better than dense. <br />
            Readability counts. <br />
            Special cases aren't special enough to break the rules. <br />
            Although practicality beats purity. <br />
            Errors should never pass silently. <br />
            Unless explicitly silenced. <br />
            In the face of ambiguity, refuse the temptation to guess. <br />
            There should be one-- and preferably only one --obvious way to do it. <br />
            Although that way may not be obvious at first unless you're Dutch. <br />
            Now is better than never. <br />
            Although never is often better than *right* now. <br />
            If the implementation is hard to explain, it's a bad idea. <br />
            If the implementation is easy to explain, it may be a good idea. <br />
            Namespaces are one honking great idea -- let's do more of those!
        `);
    },
};

for (const name in commands) {
    const _origCb = commands[name];
    commands[name] = async function(term, params) {
        try {
            return await Promise.resolve(_origCb.call(term, params));
        } catch (e) {
            if (typeof e === 'string')
                term.output('ERR: ' + e);
            else
                throw e;
        }
    };
}

window.addEventListener('load', function() {
    const terminal = new VanillaTerminal({ commands });
    // terminal.prompt('Type your name', (name) => {
    //   terminal.output(`Hi ${name}!`);
    // });
    // terminal.setPrompt('soyjavi @ moon');
});





function getPossible() {
    return XHR(
        'GET',
        '/hacking/possible'
    );
}

function getStatus() {
    return XHR(
        'GET',
        '/hacking/status'
    );
}

function doAttack(attack_name, ip, ...args) {
    if (!attack_name || !ip)
        throw "Invalid command, see <u>help</u>";
    return XHR(
        'POST',
        '/hacking/attack',
        { attack_name, ip, args_json: JSON.stringify(args) }
    );
}

function cancelAttack(id) {
    return XHR(
        'DELETE',
        `/hacking/attack/${Number(id)}`
    );
}

function resolveAttack(id) {
    return XHR(
        'POST',
        `/hacking/attack/${Number(id)}`
    );
}

function dnsLookup(uri) {
    return XHR(
        'GET',
        `/hacking/dns/${uri}`
    );
}

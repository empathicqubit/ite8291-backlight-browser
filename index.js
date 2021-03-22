import "./ds.min.js"

const initKeys = () => [
    [
        {name:"Esc",   code: 0}, 
        {name:"F1",    code: 1}, 
        {name:"F2",    code: 2},
        {name:"F3",    code: 3},
        {name:"F4",    code: 4},
        {name:"F5",    code: 5},
        {name:"F6",    code: 6},
        {name:"F7",    code: 7},
        {name:"F8",    code: 8},
        {name:"F9",    code: 9},
        {name:"F10",   code: 10},
        {name:"F11",   code: 11},
        {name:"F12",   code: 12},
        {name:"PrtSc", code: 13},
        {name:"Ins",   code: 14},
        {name:"Del",   code: 15},
        {name:"Home",  code: 16},
        {name:"End",   code: 17},
        {name:"PgUp",  code: 18},
        {name:"PgDn",  code: 19},
    ],
    [
        {name:"`",      code: 32},
        {name:"1",      code: 33},
        {name:"2",      code: 34},
        {name:"3",      code: 35},
        {name:"4",      code: 36},
        {name:"5",      code: 37},
        {name:"6",      code: 38},
        {name:"7",      code: 39},
        {name:"8",      code: 40},
        {name:"9",      code: 41},
        {name:"0",      code: 42},
        {name:"-",      code: 43},
        {name:"=",      code: 45},
        {name:"Bk",     code: 46},
        {name:"Sp",     code: 47},
        {name:"Num Lk", code: 48},
        {name:"/",      code: 49},
        {name:"*",      code: 50},
        {name:"-",      code: 51},
    ],
    [
        {name:"Tab",    code:64},
        {name:"<->",    code:65},
        {name:"Q",      code:66},
        {name:"W",      code:67},
        {name:"E",      code:68},
        {name:"R",      code:69},
        {name:"T",      code:70},
        {name:"Y",      code:71},
        {name:"U",      code:72},
        {name:"I",      code:73},
        {name:"O",      code:74},
        {name:"P",      code:75},
        {name:"[",      code:76},
        {name:"]",      code:77},
        {name:"\\",     code:78},
        {name:"7",      code:80},
        {name:"8",      code:81},
        {name:"9",      code:82},
        {name:"+",      code:83},
    ],
    [
        {name:"Caps",   code:96},
        {name:"Lock",   code:97},
        {name:"A",      code:98},
        {name:"S",      code:99},
        {name:"D",      code:100},
        {name:"F",      code:101},
        {name:"G",      code:102},
        {name:"H",      code:103},
        {name:"J",      code:104},
        {name:"K",      code:105},
        {name:"L",      code:106},
        {name:";",      code:107},
        {name:"'",      code:108},
        {name:"En",     code:110},
        {name:"ter",    code:111},
        {name:"4",      code:112},
        {name:"5",      code:113},
        {name:"6",      code:114},
        {name:"+",      code:115},
    ],
    [
        {name:"^Sh",    code:128},
        {name:"ift",    code:130},
        {name:"Z",      code:131},
        {name:"X",      code:132},
        {name:"C",      code:133},
        {name:"V",      code:134},
        {name:"B",      code:135},
        {name:"N",      code:136},
        {name:"M",      code:137},
        {name:",",      code:138},
        {name:".",      code:139},
        {name:"/",      code:140},
        {name:"^Sh",    code:141},
        {name:"ift",    code:142},
        {name:"^",      code:143},
        {name:"1",      code:144},
        {name:"2",      code:145},
        {name:"3",      code:146},
        {name:"Enter",  code:147},
    ],
    [
        {name:"Ct",     code:160},
        {name:"rl",     code:161},
        {name:"Fn",     code:162},
        {name:"#",      code:163},
        {name:"Alt",    code:164},
        {name:"[_",     code:165},
        {name:"__",     code:166},
        {name:"__",     code:168},
        {name:"_]",     code:169},
        {name:"Alt",    code:170},
        {name:"=",      code:171},
        {name:"Ct",     code:172},
        {name:"rl",     code:173},
        {name:"<",      code:174},
        {name:"\\/",    code:175},
        {name:">",      code:176},
        {name:"0",      code:177},
        {name:".",      code:178},
        {name:"Enter",  code:179},
    ]
];

const state = {
    kb: null,
    filename: '',
    saved: [],
    selected: [],
    keys: initKeys(),
}

state.saved = JSON.parse(localStorage.getItem('saved_items') || '[]')

const resetKeys = async () => {
    await state.kb.sendFeatureReport(0xcc, Uint8Array.from([
        0x00, 0x0c,
        0x00, 0x00, 0x00,
        0x7f
    ]));
}

const setKey = async (key, red, green, blue) => {
    await state.kb.sendFeatureReport(0xcc, Uint8Array.from([
        0x01, key,
        red, green, blue,
        0x7f
    ]));
}

const connect = async () => {
    state.kb = (await navigator.hid.requestDevice({ filters: [{vendorId: 0x048d }] }))[0];
    await state.kb.open();
    await resetKeys();
    render();
};

const processItem = (parent, item) => {
    if(!item) {
        return;
    }

    if(item.nodeType !== undefined) {
        parent.appendChild(item);
    }
    else if(typeof item != "object") {
        const elem = document.createTextNode(item);
        parent.appendChild(elem);
    }
    else {
        for(const kid of item) {
            processItem(parent, kid);
        }
    }
}

const e = (name, attrs, kids) => {
    const elem = document.createElement(name);
    for(const a in attrs) {
        if(a == 'style' || a == 'dataset') {
            for(const s in attrs[a]) {
                elem[a][s] = attrs[a][s];
            }
        }
        else {
            elem[a] = attrs[a];
        }
    }

    processItem(elem, kids);

    return elem;
}

const selectKey = (key) => {
    if(!mouseDown) {
        return;
    }

    const idx = state.selected.indexOf(key);
    if(idx != -1) {
        state.selected.splice(idx, 1);
    }
    else {
        state.selected.push(key);
    }

    render();
}

const deselectKeys = () => {
    state.selected = [];
    render();
    return false;
}

const selectColor = (e) => {
    const color = parseInt(e.target.value.replace('#', ''), 16)
    const r = (color >>> 16) & 0xff;
    const g = (color >>> 8) & 0xff;
    const b = color & 0xff;

    for(const key of state.selected) {
        key.color = color
        setKey(key.code, r, g, b);
    }

    render();
}

const resetColors = () => {
    for(const row of state.keys) {
        for(const key of row) {
            key.color = undefined;
        }
    }

    resetKeys();

    render();
}

const saveFile = () => {
    const existing = state.saved.findIndex(x => x.filename == state.filename);
    const keys = state.keys.map(row => row.map(key => ({ code: key.code, name: key.name, color: key.color })));
    const file = {
        filename: state.filename,
        keys: keys,
    };

    if(existing != -1) {
        state.saved[existing] = file;
    }
    else {
        state.saved.push(file);
    }

    localStorage.setItem('saved_items', JSON.stringify(state.saved));

    render();
}

const loadFile = (filename) => {
    const file = state.saved.find(x => x.filename == filename);
    state.keys = file.keys.map(row => row.map(key => ({ code: key.code, name: key.name, color: key.color })));
    for(const row of state.keys) {
        for(const key of row) {
            const r = (key.color >>> 16) & 0xff;
            const g = (key.color >>> 8) & 0xff;
            const b = key.color & 0xff;
            setKey(key.code, r, g, b);
        }
    }
    render();
}

const keyboardLayout = () => {
    const rows = 
        state.keys.map(row => e('div', { className: 'row' },
            row.map(key => e('div', 
                { 
                    dataset: {
                        code: key.code,
                    },
                    className: 'key ' + (state.selected.includes(key) ? 'selected' : ''), 
                    style: {
                        color: key.color !== undefined ? `#${key.color.toString(16)}` : undefined,
                    },
                }, 
                key.name,
            )),
        ));

    const keyboardLayout = e("div", { className: "keyboard-layout" }, rows);

    const ds = new DragSelect({
        area: keyboardLayout,
        draggability: false,
        selectables: rows.flatMap(x => Array.from(x.querySelectorAll('.key')))
    })

    ds.subscribe('callback', ({items, event}) => {
        state.selected = items.map(x => {
            const code = parseInt(x.dataset.code);
            for(const row of state.keys) {
                for(const key of row) {
                    if(code == key.code) {
                        return key;
                    }
                }
            }
        });

        ds.stop();
        render();
    });
    
    return [
        keyboardLayout,
        e("div", { className: "controls"}, [
            e("button", { className: "reset", onclick: () => resetColors() }, "Reset All Keys"),
            e('label', { for: "key-color" }, "Color:"),
            e('input', { type: "color", id: "key-color", oninput: (e) => selectColor(e) }),
            e('label', { for: "filename" }, "Filename:"),
            e('input', { type: "text", id: "filename", oninput: (e) => { state.filename = e.target.value } }),
            e("button", { className: "reset", onclick: () => saveFile() }, "Save"),
            e("select", { onchange: (e) => loadFile(e.target.value) },
                state.saved.map(x =>
                    e('option', { value: x.filename }, x.filename)
                )
            )
        ])
    ];
};

const render = () => {
    const content = e("div", { id: "content"},
        state.kb == null
        ? [
            "Keyboard is not connected",
            e("button", { onclick: connect }, "Connect")
        ]
        : keyboardLayout()
    );

    document.getElementById("content").replaceWith(content);
}

render();
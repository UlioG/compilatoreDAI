/**
 * Compilatore Verbale — Step 2: Inserimento testo dai bottoni
 * Logica completa: stato, matrice, accorpamento, tab dinamiche
 */

(function () {
    'use strict';

    // ================================================================
    // 1. MATRICE DATI (da config.py della webapp)
    // ================================================================

    var POSITIONS = {
        parete: {
            'Localizzazione diretta': [
                'a DX', 'a SX', 'al centro',
                'nella parte apicale', 'nella parte apicale a DX', 'nella parte apicale a SX',
                'al piede', 'al piede a DX', 'al piede a SX'
            ],
            'Diedri (DD)': [
                'a partire da DD alto DX', 'a partire da DD alto SX',
                'a partire da DD basso DX', 'a partire da DD basso SX',
                'a partire da DD (Generico) VT', 'a partire da DD (Generico) OZ',
                'in corrispondenza DD'
            ],
            'Aperture / PTB': [
                'al di sopra PTB', 'a partire da PTB',
                'PTB varco di passaggio al centro', 'PTB porta al centro',
                'in corrispondenza varco di passaggio', 'in corrispondenza porta'
            ],
            'Altri': [
                'a partire da rivestimento',
                'a partire da intradosso',
                'a partire da travetto'
            ]
        },
        soffitto: {
            'Posizione': [
                'intera superficie', 'porzione lato SX', 'porzione lato DX',
                'centro', 'centro alto', 'centro basso',
                'presso varco di passaggio'
            ]
        },
        pavimento: {
            'Posizione': [
                'intera superficie', 'porzione lato SX', 'porzione lato DX',
                'centro', 'presso varco di passaggio', 'al centro del vano'
            ]
        },
        infisso: {
            'Sotto-parte': [
                'soglia', 'intradosso', 'stipite DX', 'stipite SX',
                'anta', 'vetro', 'telaio', 'davanzale', 'cassonetto', 'imbotte'
            ]
        },
        balcone: {
            'Posizione': ['intera superficie', 'porzione']
        },
        cornice: {
            'Posizione': ['intera superficie', 'porzione']
        }
    };

    var PHENOMENA = {
        parete: {
            'Stato rapido': [
                'NDR', 'ingombra', 'non visibile'
            ],
            'Fessurazioni semplici': [
                'filatura', 'filatura capillare', 'filatura evidente',
                'filatura discontinua', 'microlesione', 'lesione', 'lesione diagonale'
            ],
            'Fessurazioni composte': [
                'serie di filature',
                'filatura OZ con ramificazioni VT',
                'filatura VT con ramificazioni OZ',
                'filatura pseudo VT con laminazione'
            ],
            'Patologie': [
                'macchia', 'macchia di umidità', 'umidità con efflorescenza',
                'distacco', 'distacco di intonaco', "esfoliazione d'intonaco",
                'gonfiamento', 'scrostatura'
            ],
            'Altro': [
                'mancanza', 'lacuna di materiale', 'efflorescenza',
                'colonizzazione biologica'
            ]
        },
        soffitto: {
            'Fenomeno': [
                'NDR', 'non visibile', 'macchia', 'umidità', 'distacco',
                'lesione', 'filatura', 'gonfiamento',
                'distacco di intonaco', "esfoliazione d'intonaco"
            ]
        },
        pavimento: {
            'Fenomeno': [
                'NDR', 'non visibile', 'distacco', 'rottura', 'macchia',
                'filatura', 'avvallamento', 'lacuna di materiale'
            ]
        },
        infisso: {
            'Fenomeno': [
                'NDR', 'non visibile', 'filatura', 'mancanza',
                'non funzionante', 'rotta', 'vetro incrinato', 'telaio degradato'
            ]
        },
        balcone: {
            'Fenomeno': ['NDR', 'non visibile', 'distacco', 'rottura', 'macchia']
        },
        cornice: {
            'Fenomeno': ['NDR', 'non visibile', 'distacco', 'rottura', 'macchia']
        }
    };

    // ================================================================
    // 2. STATO APPLICAZIONE
    // ================================================================

    var state = {
        unitType: null,
        vanoCount: 0,
        vfCounter: 0,

        currentVanoHeaderNode: null,
        vanoHeaderComplete: false,
        currentObsLineNode: null,
        currentElement: null,
        currentElementType: null,
        obsLineOpen: false,

        infissoType: null,
        infissoWall: null
    };

    // ================================================================
    // 3. DOM REFERENCES
    // ================================================================

    var foglio = document.getElementById('foglio');
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.tab-panel');

    // ================================================================
    // 4. HELPERS DOM
    // ================================================================

    function insertLine(text) {
        var div = document.createElement('div');
        div.textContent = text;
        foglio.appendChild(div);
        scrollToBottom();
        return div;
    }

    function insertBlankLine() {
        var div = document.createElement('div');
        div.innerHTML = '<br>';
        foglio.appendChild(div);
        return div;
    }

    function placeCaretAtEnd(node) {
        foglio.focus();
        var range = document.createRange();
        var sel = window.getSelection();
        range.selectNodeContents(node);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function scrollToBottom() {
        var doc = document.getElementById('documento');
        setTimeout(function () {
            doc.scrollTop = doc.scrollHeight;
        }, 50);
    }

    function closeCurrentObsLine() {
        if (state.currentObsLineNode && state.obsLineOpen) {
            var text = state.currentObsLineNode.textContent.trimEnd();
            if (text && !text.endsWith(';')) {
                state.currentObsLineNode.textContent = text + ';';
            }
            state.obsLineOpen = false;
        }
    }

    function ensureVanoHeaderClosed() {
        if (state.currentVanoHeaderNode && !state.vanoHeaderComplete) {
            var text = state.currentVanoHeaderNode.textContent;
            if (text && !text.endsWith(';')) {
                state.currentVanoHeaderNode.textContent = text + ';';
            }
            state.vanoHeaderComplete = true;
        }
    }

    function appendToVanoHeader(addText) {
        if (!state.currentVanoHeaderNode) return;
        var text = state.currentVanoHeaderNode.textContent;
        if (text.endsWith(';')) {
            text = text.slice(0, -1);
        }
        text += ', ' + addText + ';';
        state.currentVanoHeaderNode.textContent = text;
        state.vanoHeaderComplete = true;
    }

    function deselectAll(className) {
        document.querySelectorAll('.' + className).forEach(function (btn) {
            btn.classList.remove('selected');
        });
    }

    // ================================================================
    // 5. TAB SWITCHING
    // ================================================================

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var target = tab.dataset.tab;
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            panels.forEach(function (p) { p.classList.remove('active'); });
            var panel = document.querySelector('[data-panel="' + target + '"]');
            if (panel) panel.classList.add('active');
        });
    });

    // ================================================================
    // 6. TAB DINAMICHE (Posizione e Fenomeno)
    // ================================================================

    function buildDynamicButtons(containerId, data, btnClass) {
        var container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!data) {
            container.innerHTML = '<p class="hint">Seleziona un elemento per vedere le opzioni</p>';
            return;
        }

        var groups = data;
        for (var groupName in groups) {
            if (!groups.hasOwnProperty(groupName)) continue;
            var fg = document.createElement('div');
            fg.className = 'field-group';

            var label = document.createElement('label');
            label.textContent = groupName;
            fg.appendChild(label);

            var row = document.createElement('div');
            row.className = 'btn-row';

            groups[groupName].forEach(function (value) {
                var btn = document.createElement('button');
                btn.className = 'cmd ' + btnClass;
                btn.dataset.value = value;
                btn.textContent = value;
                row.appendChild(btn);
            });

            fg.appendChild(row);
            container.appendChild(fg);
        }

        container.querySelectorAll('.' + btnClass).forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (btnClass === 'pos-btn') {
                    handlePositionClick(btn.dataset.value);
                } else if (btnClass === 'phen-btn') {
                    handlePhenomenonClick(btn.dataset.value);
                }
            });
        });
    }

    function updateDynamicTabs() {
        var elType = state.currentElementType;
        buildDynamicButtons('posizione-content',
            elType ? POSITIONS[elType] : null, 'pos-btn');
        buildDynamicButtons('fenomeno-content',
            elType ? PHENOMENA[elType] : null, 'phen-btn');
    }

    // ================================================================
    // 7. HANDLERS
    // ================================================================

    // --- UNITA: selezione tipo ---
    document.querySelectorAll('.unit-type').forEach(function (btn) {
        btn.addEventListener('click', function () {
            deselectAll('unit-type');
            btn.classList.add('selected');
            state.unitType = btn.dataset.value;
        });
    });

    // --- UNITA: cappello ---
    document.getElementById('btn-cappello').addEventListener('click', function () {
        if (!state.unitType) {
            alert('Seleziona il tipo di unità');
            return;
        }
        var piano = document.getElementById('input-piano').value || 'X';
        var sub = document.getElementById('input-sub').value || 'XX';
        var interno = document.getElementById('input-interno').value || 'XX';
        var proprieta = document.getElementById('input-proprieta').value || 'XXXXX XXXXXXX';

        var line1 = 'Piano ' + piano + ', ' + state.unitType +
            ' - Sub. ' + sub + ' - Interno ' + interno;
        var line2 = proprieta.trim()
            ? 'È presente per la Proprietà (' + proprieta.trim().split(' ').pop() + '): ' + proprieta.trim()
            : 'È presente per la Proprietà:';

        insertLine(line1);
        insertLine(line2);

        placeCaretAtEnd(foglio.lastChild);
    });

    // --- VANO: nuovo vano ---
    document.getElementById('btn-nuovo-vano').addEventListener('click', function () {
        if (!state.unitType) {
            alert('Seleziona il tipo di unità prima');
            return;
        }
        closeCurrentObsLine();

        state.vanoCount++;
        state.vfCounter = 0;

        var headerText = 'VANO ' + state.vanoCount + ': ';
        var node = insertLine(headerText);

        state.currentVanoHeaderNode = node;
        state.vanoHeaderComplete = false;
        state.currentObsLineNode = null;
        state.currentElement = null;
        state.currentElementType = null;
        state.obsLineOpen = false;

        deselectAll('elem-btn');
        deselectAll('infisso-btn');
        document.getElementById('infisso-wall-select').style.display = 'none';
        updateDynamicTabs();

        placeCaretAtEnd(node);
    });

    // --- VANO: destinazione ---
    document.querySelectorAll('.dest-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var dest = btn.dataset.value;

            if (!state.currentVanoHeaderNode || state.vanoHeaderComplete) {
                closeCurrentObsLine();
                state.vanoCount++;
                state.vfCounter = 0;
                var headerText = 'VANO ' + state.vanoCount + ': ' + dest + ';';
                var node = insertLine(headerText);
                state.currentVanoHeaderNode = node;
                state.vanoHeaderComplete = true;
                state.currentObsLineNode = null;
                state.currentElement = null;
                state.currentElementType = null;
                state.obsLineOpen = false;
                deselectAll('elem-btn');
                deselectAll('infisso-btn');
                document.getElementById('infisso-wall-select').style.display = 'none';
                updateDynamicTabs();
                placeCaretAtEnd(node);
            } else {
                var text = state.currentVanoHeaderNode.textContent;
                state.currentVanoHeaderNode.textContent = text + dest + ';';
                state.vanoHeaderComplete = true;
                placeCaretAtEnd(state.currentVanoHeaderNode);
            }
        });
    });

    // --- VANO: pre-check (C/S, NDR, ecc.) ---
    document.querySelectorAll('.precheck-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var value = btn.dataset.value;
            if (!state.currentVanoHeaderNode) {
                alert('Crea prima un vano');
                return;
            }
            appendToVanoHeader(value);
            placeCaretAtEnd(state.currentVanoHeaderNode);
        });
    });

    // --- ELEMENTO ---
    document.querySelectorAll('.elem-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            handleElementSelect(btn.dataset.value, btn.dataset.type);
            deselectAll('elem-btn');
            deselectAll('infisso-btn');
            btn.classList.add('selected');
            document.getElementById('infisso-wall-select').style.display = 'none';
        });
    });

    // --- INFISSO: tipo ---
    document.querySelectorAll('.infisso-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.infissoType = btn.dataset.value;
            state.infissoWall = null;
            deselectAll('elem-btn');
            deselectAll('infisso-btn');
            btn.classList.add('selected');
            document.getElementById('infisso-wall-select').style.display = '';
        });
    });

    // --- INFISSO: parete ---
    document.querySelectorAll('.infisso-wall-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.infissoWall = btn.dataset.value;
            document.getElementById('infisso-wall-select').style.display = 'none';
            var elemName = state.infissoType + ' su ' + state.infissoWall;
            handleElementSelect(elemName, 'infisso');
        });
    });

    function upgradeNdrHeader() {
        if (!state.currentVanoHeaderNode) return;
        var hText = state.currentVanoHeaderNode.textContent;
        // "NDR;" → "NDR per i restanti elementi;"
        // but NOT if already upgraded
        if (hText.indexOf('NDR per i restanti') === -1) {
            var upgraded = hText.replace(/, NDR;/, ', NDR per i restanti elementi;');
            if (upgraded !== hText) {
                state.currentVanoHeaderNode.textContent = upgraded;
            }
        }
    }

    function handleElementSelect(elemValue, elemType) {
        if (!state.currentVanoHeaderNode) {
            alert('Crea prima un vano');
            return;
        }
        ensureVanoHeaderClosed();
        upgradeNdrHeader();

        if (state.currentElement === elemValue && state.obsLineOpen) {
            // Accorpamento: se la riga termina con (V.F. N), aggiungere ", "
            var text = state.currentObsLineNode.textContent;
            if (/\(V\.F\.\s*\d+\)\s*$/.test(text) || /;\s*$/.test(text)) {
                // Riga già chiusa o con V.F., riapriamo per accorpamento
                text = text.replace(/;\s*$/, '').trimEnd();
                state.currentObsLineNode.textContent = text + ', ';
                state.obsLineOpen = true;
            } else {
                state.currentObsLineNode.textContent = text + ', ';
            }
            placeCaretAtEnd(state.currentObsLineNode);
        } else {
            closeCurrentObsLine();
            var node = insertLine(elemValue + ' ');
            state.currentObsLineNode = node;
            state.obsLineOpen = true;
            placeCaretAtEnd(node);
        }

        state.currentElement = elemValue;
        state.currentElementType = elemType;
        updateDynamicTabs();
    }

    // --- POSIZIONE ---
    function handlePositionClick(value) {
        if (!state.currentObsLineNode || !state.obsLineOpen) {
            alert('Seleziona prima un elemento');
            return;
        }
        var text = state.currentObsLineNode.textContent;
        state.currentObsLineNode.textContent = text + value + ' ';
        placeCaretAtEnd(state.currentObsLineNode);
    }

    // --- FENOMENO ---
    function handlePhenomenonClick(value) {
        if (!state.currentObsLineNode || !state.obsLineOpen) {
            alert('Seleziona prima un elemento');
            return;
        }
        var text = state.currentObsLineNode.textContent;

        // Auto-closing phenomena: NDR, ingombra, non visibile
        var autoClose = ['NDR', 'ingombra', 'non visibile'];
        if (autoClose.indexOf(value) !== -1) {
            text = text.trimEnd();
            state.currentObsLineNode.textContent = text + ' ' + value + ';';
            state.obsLineOpen = false;
            placeCaretAtEnd(state.currentObsLineNode);
            return;
        }

        // Accorpamento automatico: se la riga ha già un (V.F. N), aggiungere ", "
        if (/\(V\.F\.\s*\d+\)\s*$/.test(text)) {
            text = text.trimEnd();
            state.currentObsLineNode.textContent = text + ', ' + value + ' ';
        } else {
            state.currentObsLineNode.textContent = text + value + ' ';
        }
        placeCaretAtEnd(state.currentObsLineNode);
    }

    // --- ANDAMENTO ---
    document.querySelectorAll('.anda-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!state.currentObsLineNode || !state.obsLineOpen) {
                alert('Seleziona prima un elemento e un difetto');
                return;
            }
            var value = btn.dataset.value;
            var text = state.currentObsLineNode.textContent;
            state.currentObsLineNode.textContent = text + value + ' ';
            placeCaretAtEnd(state.currentObsLineNode);
        });
    });

    // --- NOTA ---
    document.getElementById('btn-nota').addEventListener('click', function () {
        if (!state.currentVanoHeaderNode) {
            alert('Crea prima un vano');
            return;
        }
        closeCurrentObsLine();
        ensureVanoHeaderClosed();
        var nota = prompt('Testo della nota:');
        if (nota && nota.trim()) {
            var node = insertLine('Nota: ' + nota.trim());
            state.currentObsLineNode = null;
            state.obsLineOpen = false;
            placeCaretAtEnd(node);
        }
    });

    // --- FOTO DIFETTO (placeholder Step 3 — inserisce V.F.) ---
    document.getElementById('btn-foto-difetto').addEventListener('click', function () {
        if (!state.currentObsLineNode || !state.obsLineOpen) {
            alert('Seleziona prima un elemento');
            return;
        }
        state.vfCounter++;
        var text = state.currentObsLineNode.textContent.trimEnd();
        state.currentObsLineNode.textContent = text + ' (V.F. ' + state.vfCounter + ')';
        placeCaretAtEnd(state.currentObsLineNode);
    });

    // --- FOTO VANO (placeholder Step 3) ---
    document.getElementById('btn-foto-vano').addEventListener('click', function () {
        if (!state.currentVanoHeaderNode) {
            alert('Crea prima un vano');
            return;
        }
        alert('Foto vano: funzionalità in arrivo (Step 3)');
    });

    // --- ELIMINA FOTO (placeholder) ---
    document.getElementById('btn-elimina-foto-vano').addEventListener('click', function () {
        alert('Elimina foto vano: funzionalità in arrivo (Step 3)');
    });
    document.getElementById('btn-elimina-foto-difetto').addEventListener('click', function () {
        alert('Elimina foto difetto: funzionalità in arrivo (Step 3)');
    });

    // --- CHIUSURA ---
    document.getElementById('btn-chiusura').addEventListener('click', function () {
        closeCurrentObsLine();
        ensureVanoHeaderClosed();
        // Inserisci esattamente una riga vuota prima della chiusura
        var lastChild = foglio.lastChild;
        var lastText = lastChild ? lastChild.textContent.trim() : '';
        var lastIsBlank = lastChild && lastChild.innerHTML === '<br>';
        if (lastText !== '' && !lastIsBlank) {
            insertBlankLine();
        }
        insertLine('Il presente verbale viene letto e sottoscritto.');
        placeCaretAtEnd(foglio.lastChild);
    });

    // --- ESPORTA (placeholder) ---
    document.getElementById('btn-esporta-verbale').addEventListener('click', function () {
        alert('Export verbale DOCX: funzionalità in arrivo (Step 4)');
    });
    document.getElementById('btn-esporta-foto').addEventListener('click', function () {
        alert('Export allegato foto: funzionalità in arrivo (Step 4)');
    });

    // --- SYNC (placeholder) ---
    document.getElementById('btn-sync').addEventListener('click', function () {
        alert('Sincronizzazione: funzionalità in arrivo (Step 5)');
    });

    // ================================================================
    // 8. PREVENZIONE ZOOM
    // ================================================================

    document.addEventListener('dblclick', function (e) {
        if (e.target.id !== 'foglio' && !foglio.contains(e.target)) {
            e.preventDefault();
        }
    });

    // ================================================================
    // 9. INIT
    // ================================================================

    updateDynamicTabs();

})();

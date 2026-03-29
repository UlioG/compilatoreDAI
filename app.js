/**
 * Compilatore Verbale — Step 2c+: Fix completi da simulazione 17 verbali
 * - V.F. progressivo (non reset per vano)
 * - Formato "(V. F. N)" con spazi
 * - Destinazioni minuscole
 * - Proprietario/delegato separati
 * - Pareti A-N, posizioni/fenomeni/andamento estesi
 * - Attributi vano: rivestimento, controparete, soppalco, ecc.
 * - Foto vano funzionante
 * - "restanti elementi NDR." automatico
 * - Chiusura "Letto e sottoscritto."
 * - Elementi: Trave, Cornicione superiore, Sottobalcone superiore
 * - Scala nome nel documento
 */

(function () {
    'use strict';

    // ================================================================
    // 1. MATRICE DATI (estesa da analisi 17 verbali reali)
    // ================================================================

    var POSITIONS = {
        parete: {
            'Localizzazione diretta': [
                'a dx', 'a sx', 'al centro',
                'nella parte apicale', 'nella parte apicale a dx', 'nella parte apicale a sx',
                'al piede', 'al piede a dx', 'al piede a sx',
                'in alto', 'in basso', 'a tutta altezza',
                'intera superficie'
            ],
            'Presso apertura': [
                'presso finestra', 'presso varco', 'presso porta',
                'sopra varco', 'sopra porta', 'sotto telaio finestra',
                'presso porta finestra'
            ],
            'Presso struttura': [
                'presso pilastro', 'presso spigolo', 'presso trave',
                'in corrispondenza di', 'in prossimità di',
                'limitrofo alle pareti', 'sul perimetro',
                'lungo tutta la superficie'
            ],
            'Diedri (DD)': [
                'al dd', 'al dd dx', 'al dd sx',
                'al dd con soffitto', 'al dd con pavimento',
                'presso dd',
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
            'Ordinali': [
                'presso 1° varco da sx', 'presso 1° varco da dx',
                'presso 2° varco da sx', 'presso 2° varco da dx',
                'presso 1° porta da sx', 'presso 1° porta da dx',
                'presso 2° porta da sx', 'presso 2° porta da dx',
                'tra 1° e 2° finestra', 'tra 1° e 2° varco da sx',
                'tra 1° e 2° porta da sx'
            ],
            'Altri': [
                'a partire da rivestimento',
                'a partire da intradosso',
                'a partire da travetto'
            ]
        },
        parete_prospetto: {
            'Posizione': [
                'in alto', 'in basso', 'a sx', 'a dx', 'al centro',
                'DD "spigolo"', 'intera superficie',
                'angolo SX', 'angolo DX'
            ]
        },
        soffitto: {
            'Posizione': [
                'intera superficie', 'porzione lato sx', 'porzione lato dx',
                'centro', 'centro alto', 'centro basso',
                'presso varco di passaggio',
                'perpendicolare a parete', 'parallelo a parete'
            ]
        },
        pavimento: {
            'Posizione': [
                'intera superficie', 'porzione lato sx', 'porzione lato dx',
                'centro', 'presso varco di passaggio', 'al centro del vano',
                'presso soglia', 'sul perimetro'
            ]
        },
        infisso: {
            'Sotto-parte': [
                'soglia', 'intradosso', 'stipite dx', 'stipite sx',
                'anta', 'vetro', 'telaio', 'davanzale', 'cassonetto', 'imbotte',
                'architrave', 'piattabanda', 'spalletta',
                'piedritto', 'piedritti',
                'rene sx', 'rene dx', 'chiave', 'chiave di volta'
            ]
        },
        balcone: {
            'Posizione': ['intera superficie', 'porzione']
        },
        cornice: {
            'Posizione': ['intera superficie', 'porzione']
        },
        trave: {
            'Posizione': [
                'intera superficie', 'porzione',
                'in corrispondenza di', 'al centro'
            ]
        }
    };

    var PHENOMENA = {
        parete: {
            'Stato rapido': [
                'NDR', 'ingombra', 'non visibile'
            ],
            'Fessurazioni semplici': [
                'filatura', 'filature',
                'filatura capillare', 'filatura evidente', 'filatura discontinua',
                'microlesione', 'microlesioni',
                'lesione', 'lesioni',
                'lesione diagonale', 'macrolesioni'
            ],
            'Fessurazioni composte': [
                'serie di filature',
                'filatura oz con ramificazioni vt',
                'filatura vt con ramificazioni oz',
                'filatura pseudo vt con laminazione'
            ],
            'Patologie': [
                'macchia', 'macchia di umidità',
                'umidità', 'umidità con efflorescenza',
                'umidità con distacco', 'umidità con spellicciatura',
                'infiltrazione', 'infiltrazioni',
                'distacco', 'distacchi', 'distacco di intonaco', 'distacco perimetrale',
                "esfoliazione d'intonaco",
                'gonfiamento', 'rigonfiamento', 'scrostatura', 'spellicciatura'
            ],
            'Altro': [
                'efflorescenza', 'efflorescenze',
                'esposizione dei ferri', 'vegetazione infestante',
                'mancanza', 'lacuna di materiale',
                'colonizzazione biologica', 'degrado superficiale'
            ]
        },
        soffitto: {
            'Fenomeno': [
                'NDR', 'non visibile', 'macchia', 'umidità', 'distacco',
                'lesione', 'filatura', 'filature', 'gonfiamento',
                'distacco di intonaco', "esfoliazione d'intonaco",
                'infiltrazione', 'spellicciatura'
            ]
        },
        pavimento: {
            'Fenomeno': [
                'NDR', 'non visibile', 'distacco', 'rottura', 'macchia',
                'filatura', 'avvallamento', 'lacuna di materiale',
                'mattonelle rotte', 'mattonelle lesionate'
            ]
        },
        infisso: {
            'Fenomeno': [
                'NDR', 'non visibile', 'filatura', 'mancanza',
                'non funzionante', 'rotta', 'vetro incrinato', 'telaio degradato',
                'rottura', 'distacco', 'degrado superficiale'
            ]
        },
        balcone: {
            'Fenomeno': ['NDR', 'non visibile', 'distacco', 'rottura', 'macchia',
                'filatura', 'degrado superficiale', 'umidità', 'spellicciatura']
        },
        cornice: {
            'Fenomeno': ['NDR', 'non visibile', 'distacco', 'rottura', 'macchia',
                'filatura', 'degrado superficiale', 'spellicolatura', 'spellicciatura']
        },
        trave: {
            'Fenomeno': [
                'NDR', 'non visibile', 'filatura', 'filature',
                'lesione', 'microlesione', 'distacco', 'macchia', 'umidità'
            ]
        }
    };

    // Sotto-sezioni scala
    var STAIR_SUBSECTIONS_FIXED = ['Pianerottolo di piano'];
    var STAIR_SUBSECTIONS_BOTTOM = ['Sottoscala'];

    function generateStairSubsections(rampCount) {
        var result = STAIR_SUBSECTIONS_FIXED.slice();
        for (var i = 1; i <= rampCount; i++) {
            result.push('Rampa ' + i);
            if (i < rampCount) {
                result.push('Pianerottolo interpiano ' + i);
            }
        }
        return result.concat(STAIR_SUBSECTIONS_BOTTOM);
    }

    // ================================================================
    // 2. STATO APPLICAZIONE
    // ================================================================

    var state = {
        unitType: null,
        vanoCount: 0,
        vfCounter: 0,          // PROGRESSIVO su tutto il documento (mai reset)
        hasObservationsInVano: false, // Track se il vano corrente ha osservazioni

        currentVanoHeaderNode: null,
        vanoHeaderComplete: false,
        currentObsLineNode: null,
        currentElement: null,
        currentElementType: null,
        obsLineOpen: false,

        infissoType: null,
        infissoWall: null,

        // Contesto ambiente
        ambienteMode: 'vano',  // 'vano' | 'prospetto' | 'scala'

        // Prospetto
        prospettoLetter: null,

        // Scala
        scalaName: null,
        scalaRampCount: 2,
        scalaCurrentSubsection: null,

        // Chiusura formula
        closingFormula: 'Letto e sottoscritto.'
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

    // Insert "restanti elementi NDR." before creating a new environment
    function insertRestantiNdr() {
        if (state.hasObservationsInVano && state.currentVanoHeaderNode) {
            // Only insert if the vano had actual observations (not just NDR header)
            var lastDiv = foglio.lastChild;
            if (lastDiv && lastDiv !== state.currentVanoHeaderNode) {
                var lastText = lastDiv.textContent.trim();
                // Don't add if last line already ends with NDR or is the header
                if (!lastText.match(/NDR[.;]?\s*$/) && lastText !== '') {
                    insertLine('restanti elementi NDR.');
                }
            }
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
        if (text.endsWith(':')) {
            text += ' ' + addText + ';';
        } else {
            text += ', ' + addText + ';';
        }
        state.currentVanoHeaderNode.textContent = text;
        state.vanoHeaderComplete = true;
    }

    function deselectAll(className) {
        document.querySelectorAll('.' + className).forEach(function (btn) {
            btn.classList.remove('selected');
        });
    }

    function resetObsState() {
        state.currentObsLineNode = null;
        state.currentElement = null;
        state.currentElementType = null;
        state.obsLineOpen = false;
        state.hasObservationsInVano = false;
        deselectAll('elem-btn');
        deselectAll('infisso-btn');
        var wallSel = document.getElementById('infisso-wall-select');
        if (wallSel) wallSel.style.display = 'none';
        updateDynamicTabs();
    }

    // ================================================================
    // 4b. PERSISTENZA LOCALE
    // ================================================================

    function saveToLocal() {
        try {
            var data = {
                html: foglio.innerHTML,
                vanoCount: state.vanoCount,
                vfCounter: state.vfCounter,
                unitType: state.unitType,
                timestamp: Date.now()
            };
            localStorage.setItem('compilatore_autosave', JSON.stringify(data));
        } catch (e) { /* ignore quota errors */ }
    }

    function loadFromLocal() {
        try {
            var raw = localStorage.getItem('compilatore_autosave');
            if (!raw) return false;
            var data = JSON.parse(raw);
            if (data.html) {
                foglio.innerHTML = data.html;
                state.vanoCount = data.vanoCount || 0;
                state.vfCounter = data.vfCounter || 0;
                state.unitType = data.unitType || null;
                // Reset transient state
                state.currentVanoHeaderNode = null;
                state.vanoHeaderComplete = true;
                state.currentObsLineNode = null;
                state.obsLineOpen = false;
                state.hasObservationsInVano = false;
                return true;
            }
        } catch (e) { /* ignore parse errors */ }
        return false;
    }

    // Autosave on every change
    var saveTimer = null;
    function scheduleSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveToLocal, 500);
    }

    // ================================================================
    // 5. VISIBILITA SEZIONI (Parti Comuni vs standard)
    // ================================================================

    function updateSectionsVisibility() {
        var isPC = state.unitType === 'Parti Comuni';

        var sezioneVano = document.getElementById('sezione-vano');
        var sezioneProspetto = document.getElementById('sezione-prospetto');
        var sezioneScala = document.getElementById('sezione-scala');

        sezioneVano.style.display = '';
        sezioneProspetto.style.display = isPC ? '' : 'none';
        sezioneScala.style.display = isPC ? '' : 'none';

        var destRow = document.getElementById('dest-row');
        var destRowPC = document.getElementById('dest-row-pc');
        destRow.style.display = isPC ? 'none' : '';
        destRowPC.style.display = isPC ? '' : 'none';

        updateElementVisibility();
    }

    function updateElementVisibility() {
        var elemVano = document.getElementById('elem-vano');
        var elemProspetto = document.getElementById('elem-prospetto');
        var elemScala = document.getElementById('elem-scala');

        elemVano.style.display = 'none';
        elemProspetto.style.display = 'none';
        elemScala.style.display = 'none';

        if (state.ambienteMode === 'prospetto') {
            elemProspetto.style.display = '';
        } else if (state.ambienteMode === 'scala') {
            elemScala.style.display = '';
        } else {
            elemVano.style.display = '';
        }
    }

    // ================================================================
    // 6. TAB SWITCHING
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
    // 7. TAB DINAMICHE (Posizione e Fenomeno)
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

    function getPositionsForElement(elType) {
        if (!elType) return null;
        if (state.ambienteMode === 'prospetto' && elType === 'parete') {
            return POSITIONS['parete_prospetto'];
        }
        return POSITIONS[elType] || null;
    }

    function updateDynamicTabs() {
        var elType = state.currentElementType;
        buildDynamicButtons('posizione-content',
            getPositionsForElement(elType), 'pos-btn');
        buildDynamicButtons('fenomeno-content',
            elType ? PHENOMENA[elType] : null, 'phen-btn');
    }

    // ================================================================
    // 8. HANDLERS
    // ================================================================

    // --- UNITA: selezione tipo ---
    document.querySelectorAll('.unit-type').forEach(function (btn) {
        btn.addEventListener('click', function () {
            deselectAll('unit-type');
            btn.classList.add('selected');
            state.unitType = btn.dataset.value;
            state.ambienteMode = 'vano';
            updateSectionsVisibility();
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
        var proprietario = document.getElementById('input-proprietario').value.trim();
        var delegato = document.getElementById('input-delegato').value.trim();

        var line1 = 'Piano ' + piano + ', ' + state.unitType +
            ' - Sub. ' + sub + ' - Interno ' + interno;

        var line2;
        if (proprietario && delegato) {
            // Owner + delegate
            line2 = 'È presente per la Proprietà (' + proprietario + '): ' + delegato;
        } else if (proprietario) {
            // Owner present directly (no delegate)
            line2 = 'È presente per la Proprietà: ' + proprietario;
        } else if (delegato) {
            // Only delegate provided
            line2 = 'È presente per la Proprietà: ' + delegato;
        } else {
            line2 = 'È presente per la Proprietà:';
        }

        insertLine(line1);
        insertLine(line2);

        placeCaretAtEnd(foglio.lastChild);
        scheduleSave();
    });

    // --- VANO: nuovo vano ---
    document.getElementById('btn-nuovo-vano').addEventListener('click', function () {
        if (!state.unitType) {
            alert('Seleziona il tipo di unità prima');
            return;
        }
        closeCurrentObsLine();
        insertRestantiNdr();

        // Support manual vano number (e.g. "6/7") or auto-increment
        var manualNum = document.getElementById('input-vano-num');
        var vanoNum;
        if (manualNum && manualNum.value.trim()) {
            vanoNum = manualNum.value.trim();
            // Update counter to max number for future auto-increment
            var nums = vanoNum.split('/').map(Number).filter(function(n) { return !isNaN(n); });
            if (nums.length) state.vanoCount = Math.max.apply(null, nums);
            manualNum.value = '';
        } else {
            state.vanoCount++;
            vanoNum = String(state.vanoCount);
        }
        state.ambienteMode = 'vano';

        var headerText = 'VANO ' + vanoNum + ': ';
        var node = insertLine(headerText);

        state.currentVanoHeaderNode = node;
        state.vanoHeaderComplete = false;
        resetObsState();
        updateElementVisibility();

        placeCaretAtEnd(node);
        scheduleSave();
    });

    // --- VANO: destinazione ---
    function bindDestButtons() {
        document.querySelectorAll('.dest-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var dest = btn.dataset.value.toLowerCase(); // FIX F2: minuscola

                if (!state.currentVanoHeaderNode || state.vanoHeaderComplete) {
                    closeCurrentObsLine();
                    insertRestantiNdr();
                    // Support manual vano number
                    var manualNum2 = document.getElementById('input-vano-num');
                    var vanoNum2;
                    if (manualNum2 && manualNum2.value.trim()) {
                        vanoNum2 = manualNum2.value.trim();
                        var nums2 = vanoNum2.split('/').map(Number).filter(function(n) { return !isNaN(n); });
                        if (nums2.length) state.vanoCount = Math.max.apply(null, nums2);
                        manualNum2.value = '';
                    } else {
                        state.vanoCount++;
                        vanoNum2 = String(state.vanoCount);
                    }
                    state.ambienteMode = 'vano';
                    var headerText = 'VANO ' + vanoNum2 + ': ' + dest + ';';
                    var node = insertLine(headerText);
                    state.currentVanoHeaderNode = node;
                    state.vanoHeaderComplete = true;
                    resetObsState();
                    updateElementVisibility();
                    placeCaretAtEnd(node);
                } else {
                    var text = state.currentVanoHeaderNode.textContent;
                    state.currentVanoHeaderNode.textContent = text + dest + ';';
                    state.vanoHeaderComplete = true;
                    placeCaretAtEnd(state.currentVanoHeaderNode);
                }
                scheduleSave();
            });
        });
    }
    bindDestButtons();

    // --- VANO: pre-check (C/S, NDR, rivestimento, ecc.) ---
    document.querySelectorAll('.precheck-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var value = btn.dataset.value;
            if (!state.currentVanoHeaderNode) {
                alert('Crea prima un ambiente');
                return;
            }

            // Attributi con input altezza
            if (value === '__rivestimento__' || value === '__controparete__') {
                var label = value === '__rivestimento__' ? 'rivestimento' : 'controparete';
                var h = prompt('Altezza in metri (es. 2, 1.50, "a tutta altezza", "parziale"):');
                if (h && h.trim()) {
                    var hVal = h.trim();
                    if (hVal === 'a tutta altezza' || hVal === 'parziale' || isNaN(parseFloat(hVal))) {
                        appendToVanoHeader(label + ' ' + hVal);
                    } else {
                        appendToVanoHeader(label + ' a ' + hVal + ' m circa');
                    }
                } else {
                    appendToVanoHeader(label);
                }
            } else {
                appendToVanoHeader(value);
            }
            placeCaretAtEnd(state.currentVanoHeaderNode);
            scheduleSave();
        });
    });

    // ================================================================
    // 9. PROSPETTO
    // ================================================================

    document.getElementById('btn-nuovo-prospetto').addEventListener('click', function () {
        if (!state.unitType) {
            alert('Seleziona il tipo di unità prima');
            return;
        }
        document.getElementById('prospetto-select').style.display = '';
    });

    document.querySelectorAll('.prosp-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            closeCurrentObsLine();
            insertRestantiNdr();

            state.ambienteMode = 'prospetto';
            state.prospettoLetter = btn.dataset.value;
            // V.F. counter NON si resetta

            var headerText = 'PROSPETTO ' + btn.dataset.value + ':';
            var node = insertLine(headerText);

            state.currentVanoHeaderNode = node;
            state.vanoHeaderComplete = true;
            resetObsState();
            updateElementVisibility();

            document.getElementById('prospetto-select').style.display = 'none';
            placeCaretAtEnd(node);
            scheduleSave();
        });
    });

    // ================================================================
    // 10. SCALA
    // ================================================================

    document.getElementById('btn-nuova-scala').addEventListener('click', function () {
        if (!state.unitType) {
            alert('Seleziona il tipo di unità prima');
            return;
        }
        document.getElementById('scala-name-select').style.display = '';
    });

    document.querySelectorAll('.scala-name-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.scalaName = btn.dataset.value;
            document.getElementById('scala-name-select').style.display = 'none';

            var rampInput = prompt('Numero di rampe tra un piano e l\'altro (default: 2):', '2');
            state.scalaRampCount = parseInt(rampInput) || 2;

            // FIX M5: Inserisci intestazione scala nel documento
            closeCurrentObsLine();
            insertRestantiNdr();
            var scalaLabel = state.scalaName ? 'SCALA ' + state.scalaName + ':' : 'SCALA:';
            insertLine(scalaLabel);

            buildScalaSubsections();
            document.getElementById('scala-subsection-select').style.display = '';
            scheduleSave();
        });
    });

    function buildScalaSubsections() {
        var row = document.getElementById('scala-subsection-row');
        row.innerHTML = '';
        var subs = generateStairSubsections(state.scalaRampCount);
        subs.forEach(function (sub) {
            var btn = document.createElement('button');
            btn.className = 'cmd scala-sub-btn';
            btn.dataset.value = sub;
            btn.textContent = sub;
            btn.addEventListener('click', function () {
                handleScalaSubsectionClick(sub);
            });
            row.appendChild(btn);
        });
    }

    function handleScalaSubsectionClick(subsection) {
        closeCurrentObsLine();
        insertRestantiNdr();

        state.ambienteMode = 'scala';
        state.scalaCurrentSubsection = subsection;
        // V.F. counter NON si resetta

        var headerText = subsection + ':';
        var node = insertLine(headerText);

        state.currentVanoHeaderNode = node;
        state.vanoHeaderComplete = true;
        resetObsState();
        updateElementVisibility();

        deselectAll('scala-sub-btn');
        document.querySelectorAll('.scala-sub-btn').forEach(function (b) {
            if (b.dataset.value === subsection) b.classList.add('selected');
        });

        placeCaretAtEnd(node);
        scheduleSave();
    }

    // ================================================================
    // 11. ELEMENTI
    // ================================================================

    function bindElementButtons() {
        document.querySelectorAll('.elem-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                handleElementSelect(btn.dataset.value, btn.dataset.type);
                deselectAll('elem-btn');
                deselectAll('infisso-btn');
                btn.classList.add('selected');
                var wallSel = document.getElementById('infisso-wall-select');
                if (wallSel) wallSel.style.display = 'none';
            });
        });
    }
    bindElementButtons();

    // --- INFISSO: tipo ---
    document.querySelectorAll('.infisso-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.infissoType = btn.dataset.value;
            state.infissoWall = null;
            deselectAll('elem-btn');
            deselectAll('infisso-btn');
            btn.classList.add('selected');

            if (state.ambienteMode === 'prospetto') {
                handleElementSelect(state.infissoType, 'infisso');
            } else {
                var wallSel = document.getElementById('infisso-wall-select');
                if (wallSel) wallSel.style.display = '';
            }
        });
    });

    // --- INFISSO: parete ---
    document.querySelectorAll('.infisso-wall-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.infissoWall = btn.dataset.value;
            var wallSel = document.getElementById('infisso-wall-select');
            if (wallSel) wallSel.style.display = 'none';
            var elemName = state.infissoType + ' su ' + state.infissoWall;
            handleElementSelect(elemName, 'infisso');
        });
    });

    function upgradeNdrHeader() {
        if (!state.currentVanoHeaderNode) return;
        var hText = state.currentVanoHeaderNode.textContent;
        if (hText.indexOf('NDR per i restanti') === -1) {
            var upgraded = hText.replace(/, NDR;/, ', NDR per i restanti elementi;');
            if (upgraded !== hText) {
                state.currentVanoHeaderNode.textContent = upgraded;
            }
        }
    }

    function handleElementSelect(elemValue, elemType) {
        if (!state.currentVanoHeaderNode) {
            alert('Crea prima un ambiente');
            return;
        }
        ensureVanoHeaderClosed();
        upgradeNdrHeader();

        if (state.currentElement === elemValue && state.obsLineOpen) {
            var text = state.currentObsLineNode.textContent;
            if (/\(V\. F\.\s*[\d/]+\)\s*$/.test(text) || /;\s*$/.test(text)) {
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
        state.hasObservationsInVano = true;
        updateDynamicTabs();
        scheduleSave();
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
        scheduleSave();
    }

    // --- FENOMENO ---
    function handlePhenomenonClick(value) {
        if (!state.currentObsLineNode || !state.obsLineOpen) {
            alert('Seleziona prima un elemento');
            return;
        }
        var text = state.currentObsLineNode.textContent;

        var autoClose = ['NDR', 'ingombra', 'non visibile'];
        if (autoClose.indexOf(value) !== -1) {
            text = text.trimEnd();
            state.currentObsLineNode.textContent = text + ' ' + value + ';';
            state.obsLineOpen = false;
            placeCaretAtEnd(state.currentObsLineNode);
            scheduleSave();
            return;
        }

        // FIX: if V.F. already at end, append with comma
        if (/\(V\. F\.\s*[\d/]+\)\s*$/.test(text)) {
            text = text.trimEnd();
            state.currentObsLineNode.textContent = text + ', ' + value + ' ';
        } else {
            state.currentObsLineNode.textContent = text + value + ' ';
        }
        placeCaretAtEnd(state.currentObsLineNode);
        scheduleSave();
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
            scheduleSave();
        });
    });

    // --- NOTA ---
    document.getElementById('btn-nota').addEventListener('click', function () {
        if (!state.currentVanoHeaderNode) {
            alert('Crea prima un ambiente');
            return;
        }
        closeCurrentObsLine();
        ensureVanoHeaderClosed();
        var nota = prompt('Testo della nota:');
        if (nota && nota.trim()) {
            var node = insertLine('Note: ' + nota.trim());
            state.currentObsLineNode = null;
            state.obsLineOpen = false;
            placeCaretAtEnd(node);
            scheduleSave();
        }
    });

    // --- FOTO DIFETTO --- FIX F1+R1: formato "(V. F. N)" con V.F. multipli
    document.getElementById('btn-foto-difetto').addEventListener('click', function () {
        if (!state.currentObsLineNode || !state.obsLineOpen) {
            alert('Seleziona prima un elemento');
            return;
        }
        state.vfCounter++;
        var text = state.currentObsLineNode.textContent.trimEnd();
        // If already has a V.F. reference, append with /N instead of new parentheses
        var vfMatch = text.match(/\(V\. F\.\s*([\d/]+)\)\s*$/);
        if (vfMatch) {
            var newRef = '(V. F. ' + vfMatch[1] + '/' + state.vfCounter + ')';
            text = text.replace(/\(V\. F\.\s*[\d/]+\)\s*$/, newRef);
            state.currentObsLineNode.textContent = text;
        } else {
            state.currentObsLineNode.textContent = text + ' (V. F. ' + state.vfCounter + ')';
        }
        placeCaretAtEnd(state.currentObsLineNode);
        scheduleSave();
    });

    // --- FOTO VANO --- FIX M1+R1: V.F. multipli anche per vano
    document.getElementById('btn-foto-vano').addEventListener('click', function () {
        if (!state.currentVanoHeaderNode) {
            alert('Crea prima un ambiente');
            return;
        }
        state.vfCounter++;
        var text = state.currentVanoHeaderNode.textContent;
        // If already has V.F., append /N
        var vfMatch = text.match(/\(V\. F\.\s*([\d/]+)\)(;?\s*)$/);
        if (vfMatch) {
            var newRef = '(V. F. ' + vfMatch[1] + '/' + state.vfCounter + ')' + vfMatch[2];
            text = text.replace(/\(V\. F\.\s*[\d/]+\)(;?\s*)$/, newRef);
            state.currentVanoHeaderNode.textContent = text;
        } else {
            if (text.endsWith(';')) {
                text = text.slice(0, -1).trimEnd();
            }
            state.currentVanoHeaderNode.textContent = text + ' (V. F. ' + state.vfCounter + ');';
        }
        placeCaretAtEnd(state.currentVanoHeaderNode);
        scheduleSave();
    });

    // --- ELIMINA FOTO ---
    document.getElementById('btn-elimina-foto-vano').addEventListener('click', function () {
        if (!state.currentVanoHeaderNode) {
            alert('Nessun ambiente attivo');
            return;
        }
        var text = state.currentVanoHeaderNode.textContent;
        // Remove last V.F. reference
        var cleaned = text.replace(/\s*\(V\. F\.\s*\d+\)/, '');
        if (cleaned !== text) {
            state.currentVanoHeaderNode.textContent = cleaned;
            state.vfCounter--;
        }
    });
    document.getElementById('btn-elimina-foto-difetto').addEventListener('click', function () {
        if (!state.currentObsLineNode) {
            alert('Nessuna riga di osservazione attiva');
            return;
        }
        var text = state.currentObsLineNode.textContent;
        var cleaned = text.replace(/\s*\(V\. F\.\s*\d+\)/, '');
        if (cleaned !== text) {
            state.currentObsLineNode.textContent = cleaned;
            state.vfCounter--;
        }
    });

    // --- CHIUSURA --- con scelta formula
    document.getElementById('btn-chiusura').addEventListener('click', function () {
        closeCurrentObsLine();
        insertRestantiNdr();
        ensureVanoHeaderClosed();
        while (foglio.lastChild) {
            var lc = foglio.lastChild;
            var isEmpty = (lc.innerHTML === '<br>') || (lc.textContent.trim() === '');
            if (isEmpty) {
                foglio.removeChild(lc);
            } else {
                break;
            }
        }
        insertBlankLine();
        // Default: forma breve (13/17 verbali). Forma estesa: 4/17 verbali.
        var closingText = state.closingFormula || 'Letto e sottoscritto.';
        insertLine(closingText);
        placeCaretAtEnd(foglio.lastChild);
        scheduleSave();
    });

    // Toggle chiusura formula
    var btnChiusuraToggle = document.getElementById('btn-chiusura-toggle');
    if (btnChiusuraToggle) {
        btnChiusuraToggle.addEventListener('click', function () {
            if (!state.closingFormula || state.closingFormula === 'Letto e sottoscritto.') {
                state.closingFormula = 'Il presente verbale viene letto e sottoscritto.';
                btnChiusuraToggle.textContent = 'Formula: estesa';
                btnChiusuraToggle.classList.add('selected');
            } else {
                state.closingFormula = 'Letto e sottoscritto.';
                btnChiusuraToggle.textContent = 'Formula: breve';
                btnChiusuraToggle.classList.remove('selected');
            }
        });
    }

    // --- ESPORTA ---
    document.getElementById('btn-esporta-verbale').addEventListener('click', function () {
        alert('Export verbale DOCX: funzionalità in arrivo (Step 4)');
    });
    document.getElementById('btn-esporta-foto').addEventListener('click', function () {
        alert('Export allegato foto: funzionalità in arrivo (Step 4)');
    });

    // --- SYNC ---
    document.getElementById('btn-sync').addEventListener('click', function () {
        alert('Sincronizzazione: funzionalità in arrivo (Step 5)');
    });

    // --- NUOVO DOCUMENTO ---
    var btnNuovo = document.getElementById('btn-nuovo-doc');
    if (btnNuovo) {
        btnNuovo.addEventListener('click', function () {
            if (confirm('Vuoi iniziare un nuovo documento? Il documento corrente verrà salvato automaticamente.')) {
                saveToLocal();
                foglio.innerHTML = '';
                state.vanoCount = 0;
                state.vfCounter = 0;
                state.unitType = null;
                state.currentVanoHeaderNode = null;
                state.vanoHeaderComplete = false;
                state.hasObservationsInVano = false;
                resetObsState();
                deselectAll('unit-type');
                localStorage.removeItem('compilatore_autosave');
            }
        });
    }

    // ================================================================
    // 12. PREVENZIONE ZOOM
    // ================================================================

    document.addEventListener('dblclick', function (e) {
        if (e.target.id !== 'foglio' && !foglio.contains(e.target)) {
            e.preventDefault();
        }
    });

    // ================================================================
    // 13. INIT
    // ================================================================

    // Try to restore previous session
    var restored = loadFromLocal();
    if (restored) {
        // Highlight restored unit type
        if (state.unitType) {
            document.querySelectorAll('.unit-type').forEach(function (btn) {
                if (btn.dataset.value === state.unitType) {
                    btn.classList.add('selected');
                }
            });
        }
    }

    updateDynamicTabs();
    updateSectionsVisibility();

    // Watch for manual edits in the document
    foglio.addEventListener('input', scheduleSave);

    // ================================================================
    // 14. GLOBAL RESET (for testing/simulation)
    // ================================================================
    window._resetAll = function () {
        foglio.innerHTML = '';
        state.unitType = null;
        state.vanoCount = 0;
        state.vfCounter = 0;
        state.hasObservationsInVano = false;
        state.currentVanoHeaderNode = null;
        state.vanoHeaderComplete = false;
        state.currentObsLineNode = null;
        state.currentElement = null;
        state.currentElementType = null;
        state.obsLineOpen = false;
        state.infissoType = null;
        state.infissoWall = null;
        state.ambienteMode = 'vano';
        state.prospettoLetter = null;
        state.scalaName = null;
        state.scalaRampCount = 2;
        state.scalaCurrentSubsection = null;
        deselectAll('unit-type');
        deselectAll('elem-btn');
        deselectAll('infisso-btn');
        localStorage.removeItem('compilatore_autosave');
        updateDynamicTabs();
        updateSectionsVisibility();
    };

})();

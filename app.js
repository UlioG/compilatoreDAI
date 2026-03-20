/**
 * Compilatore Verbale — Step 1: Prototipo statico
 * Logica base: tab switching + interazione placeholder
 */

(function () {
    'use strict';

    // ============ TAB SWITCHING ============
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const target = tab.dataset.tab;

            // Attiva tab
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');

            // Mostra pannello corrispondente
            panels.forEach(function (p) { p.classList.remove('active'); });
            var panel = document.querySelector('[data-panel="' + target + '"]');
            if (panel) panel.classList.add('active');
        });
    });

    // ============ FOCUS DOCUMENTO ============
    // Quando si tocca il foglio, assicura che il cursore sia posizionato
    var foglio = document.getElementById('foglio');

    // Se il foglio è vuoto, posiziona il cursore all'inizio
    foglio.addEventListener('focus', function () {
        if (!foglio.textContent.trim()) {
            // Placeholder gestito via CSS :empty::before
        }
    });

    // ============ PREVENZIONE ZOOM (iPad) ============
    // Previene il doppio-tap zoom su tutto tranne il foglio
    document.addEventListener('dblclick', function (e) {
        if (e.target.id !== 'foglio' && !foglio.contains(e.target)) {
            e.preventDefault();
        }
    });

    // ============ SYNC BUTTON FEEDBACK ============
    var btnSync = document.getElementById('btn-sync');
    if (btnSync) {
        btnSync.addEventListener('click', function () {
            btnSync.style.background = '#d0e8ff';
            setTimeout(function () {
                btnSync.style.background = '';
            }, 300);
        });
    }

})();

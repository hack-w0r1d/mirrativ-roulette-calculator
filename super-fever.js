(function () {
    // <期間限定> SUPER FEVER中の確率テーブルから算出した期待値
    // 無償(100) / 有償(90): 1(40%) 2(44.5%) 5(10%) 10(5%) 100(0.5%)
    // 有償10連・100連(1連あたり): 5(73.5%) 7(15%) 10(11%) 100(0.5%)
    const feverEv = {
        free: 2.79,
        paid: 2.79,
        ten: 63.25,
        hundred: 632.5
    };
    window.feverEv = feverEv;

    const formulaDefault = `
        <div>
            <strong>無償(100) / 有償(90)</strong>
            1マス: 40% / 2マス: 45% / 5マス: 10% / 10マス: 5%<br>期待値: 2.30 マス / 回
        </div>
        <div>
            <strong>有償10連・100連（1連あたり）</strong>
            2マス: 80% / 5マス: 13% / 10マス: 7%<br>期待値: 2.95 マス / 回
        </div>
    `;
    const formulaFever = `
        <div>
            <strong>無償(100) / 有償(90)</strong>
            1マス: 40% / 2マス: 44.5% / 5マス: 10% / 10マス: 5% / 100マス: 0.5%<br>期待値: 2.79 マス / 回
        </div>
        <div>
            <strong>有償10連・100連（1連あたり）</strong>
            5マス: 73.5% / 7マス: 15% / 10マス: 11% / 100マス: 0.5%<br>期待値: 6.33 マス / 回
        </div>
    `;

    function applyFeverUI(active) {
        const bar = document.getElementById('feverBar');
        const state = document.getElementById('feverState');
        const formula = document.getElementById('formulaContent');
        if (bar) bar.classList.toggle('is-active', active);
        if (state) state.textContent = active ? 'ON' : 'OFF';
        if (formula) formula.innerHTML = active ? formulaFever : formulaDefault;
    }

    const checkbox = document.getElementById('feverEnabled');
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            applyFeverUI(checkbox.checked);
            window.setFeverActive(checkbox.checked);
        });
    }
})();

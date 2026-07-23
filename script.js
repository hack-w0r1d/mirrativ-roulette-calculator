const items = {
    free: { name:'無償(100)', ev:2.3, price:100, unit:'個', currency:'無償' },
    paid: { name:'有償(90)', ev:2.3, price:90, unit:'個', currency:'有償' },
    ten: { name:'有償10連(1000)', ev:29.5, price:1000, unit:'個', currency:'有償' },
    hundred: { name:'有償100連(10000)', ev:295, price:10000, unit:'個', currency:'有償' }
};
const $ = id => document.getElementById(id);
const number = id => Math.max(0, Number($(id).value) || 0);
const integer = n => Math.ceil(n).toLocaleString('ja-JP');
const coins = n => `${integer(n)} コイン`;

let feverActive = false;
window.setFeverActive = active => {
    feverActive = active;
    render();
};
const evOf = key => (feverActive && window.feverEv) ? window.feverEv[key] : items[key].ev;
function render() {
    const counts = Object.fromEntries(Object.keys(items).map(key => [key, number(key)]));
    const squares = Object.keys(items).reduce((sum, key) => sum + counts[key] * evOf(key), 0);
    $('squares').textContent = `${squares.toFixed(1)} マス`;
    $('freeCoins').textContent = coins(counts.free * items.free.price);
    $('paidCoins').textContent = coins(counts.paid * items.paid.price + counts.ten * items.ten.price + counts.hundred * items.hundred.price);
    const target = number('target');
    const current = number('current');
    const selectedKey = $('type').value;
    const selected = items[selectedKey];
    const remaining = Math.max(0, target - current);
    const need = Math.ceil(remaining / evOf(selectedKey));
    $('needCountLabel').textContent = `${integer(remaining)}マス進むのに必要な個数の目安`;
    $('needCoinsLabel').textContent = `${integer(remaining)}マス進むのに必要なコイン数の目安`;
    $('needCount').textContent = `${integer(need)} ${selected.unit}`;
    $('needCoins').textContent = `${coins(need * selected.price)}(${selected.currency})`;
    $('expectedAtNeed').textContent = `${(need * evOf(selectedKey)).toFixed(1)} マス`;
    $('comparison').innerHTML = Object.entries(items).map(([key, item]) => {
        const count = Math.ceil(target / evOf(key));
        const selectedClass = key === selectedKey ? 'is-selected' : '';

        return `<tr class="${selectedClass}"><td>${item.name}</td><td>${integer(count)} ${item.unit}</td><td>${coins(count * item.price)}(${item.currency})</td></tr>`;
    }).join('');

    const budgetFree = number('budgetFree');
    const budgetPaid = number('budgetPaid');
    const paidPriority = Object.entries(items)
        .filter(([, item]) => item.currency === '有償')
        .sort(([keyA, a], [keyB, b]) => (evOf(keyB) / b.price - evOf(keyA) / a.price) || (b.price - a.price))
        .map(([key]) => key);
    let remainingPaid = budgetPaid;
    const paidCounts = {};
    paidPriority.forEach(key => {
        const item = items[key];
        const count = Math.floor(remainingPaid / item.price);
        paidCounts[key] = count;
        remainingPaid -= count * item.price;
    });
    const budgetRows = Object.entries(items).map(([key, item]) => {
        const count = item.currency === '無償' ? Math.floor(budgetFree / item.price) : paidCounts[key];
        return { key, item, count, squares: count * evOf(key), spent: count * item.price };
    });
    const totalSquares = budgetRows.reduce((sum, row) => sum + row.squares, 0);
    $('budgetSquares').textContent = `${totalSquares.toFixed(1)} マス`;
    $('budgetComparison').innerHTML = budgetRows.map(row => {
        const selectedClass = row.count > 0 ? 'is-selected' : '';
        return `<tr class="${selectedClass}"><td>${row.item.name}</td><td>${integer(row.count)} ${row.item.unit}</td><td>${coins(row.spent)}(${row.item.currency})</td><td>${row.squares.toFixed(1)} マス</td></tr>`;
    }).join('');
}

function initTabs() {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const activate = (tab, { focus = false } = {}) => {
        tabs.forEach(t => {
            const isActive = t === tab;
            t.setAttribute('aria-selected', String(isActive));
            t.tabIndex = isActive ? 0 : -1;
            $(t.dataset.target).hidden = !isActive;
        });
        if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(tab));
        tab.addEventListener('keydown', e => {
            const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
            if (!dir) return;
            e.preventDefault();
            activate(tabs[(index + dir + tabs.length) % tabs.length], { focus: true });
        });
    });
}
function initTitleSpin() {
    const title = document.querySelector('header h1:not(.page-title)');
    if (!title) return;
    const duration = 3900;
    const fadeDuration = 1200;
    const turns = 1;
    const wedge = 22.5;
    const baseColors = ['#ff2e43', '#ffce33'];
    const targetColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#f7f5f8';
    const hexToRgb = hex => {
        const n = parseInt(hex.replace('#', ''), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const targetRgb = hexToRgb(targetColor);
    const wedgeRgb = baseColors.map(hexToRgb);
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    const mix = (rgb, t) => `rgb(${lerp(rgb[0], targetRgb[0], t)}, ${lerp(rgb[1], targetRgb[1], t)}, ${lerp(rgb[2], targetRgb[2], t)})`;
    title.style.color = 'transparent';
    title.style.backgroundClip = 'text';
    title.style.webkitBackgroundClip = 'text';
    const start = performance.now();
    function frame(now) {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        const angle = progress * 360 * turns;
        const fadeProgress = Math.max(0, Math.min(1, (elapsed - (duration - fadeDuration)) / fadeDuration));
        const stops = Array.from({ length: 360 / wedge }, (_, i) => {
            const color = mix(wedgeRgb[i % 2], fadeProgress);
            return `${color} ${i * wedge}deg ${(i + 1) * wedge}deg`;
        }).join(', ');
        title.style.background = `conic-gradient(from ${angle}deg, ${stops})`;
        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            title.style.background = '';
            title.style.color = '';
            title.style.backgroundClip = '';
            title.style.webkitBackgroundClip = '';
        }
    }
    requestAnimationFrame(frame);
}
document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', render));
document.querySelectorAll('input[type="number"]').forEach(el => el.addEventListener('focus', () => el.select()));
document.querySelectorAll('input[type="number"]').forEach(el => el.addEventListener('blur', () => {
    if (el.value === '') el.value = 0;
}));
initTabs();
initTitleSpin();
render();

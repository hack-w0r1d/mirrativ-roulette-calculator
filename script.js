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
function render() {
    const counts = Object.fromEntries(Object.keys(items).map(key => [key, number(key)]));
    const squares = Object.keys(items).reduce((sum, key) => sum + counts[key] * items[key].ev, 0);
    $('squares').textContent = `${squares.toFixed(1)} マス`;
    $('freeCoins').textContent = coins(counts.free * items.free.price);
    $('paidCoins').textContent = coins(counts.paid * items.paid.price + counts.ten * items.ten.price + counts.hundred * items.hundred.price);
    const target = number('target');
    const current = number('current');
    const selected = items[$('type').value];
    const remaining = Math.max(0, target - current);
    const need = Math.ceil(remaining / selected.ev);
    $('needCountLabel').textContent = `${integer(remaining)}マス進むのに必要な個数の目安`;
    $('needCoinsLabel').textContent = `${integer(remaining)}マス進むのに必要なコイン数の目安`;
    $('needCount').textContent = `${integer(need)} ${selected.unit}`;
    $('needCoins').textContent = `${coins(need * selected.price)}(${selected.currency})`;
    $('expectedAtNeed').textContent = `${(need * selected.ev).toFixed(1)} マス`;
    $('comparison').innerHTML = Object.values(items).map(item => {
        const count = Math.ceil(target / item.ev);
        const selectedClass = item === selected ? 'is-selected' : '';

        return `<tr class="${selectedClass}"><td>${item.name}</td><td>${integer(count)} ${item.unit}</td><td>${coins(count * item.price)}(${item.currency})</td></tr>`;
    }).join('');
}
document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', render));
document.querySelectorAll('input[type="number"]').forEach(el => el.addEventListener('focus', () => el.select()));
document.querySelectorAll('input[type="number"]').forEach(el => el.addEventListener('blur', () => {
    if (el.value === '') el.value = 0;
}));
render();

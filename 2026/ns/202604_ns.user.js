// ==UserScript==
// @name         CIK Protocol Helper - 2026 04 Ns
// @namespace    https://github.com/unholyHub/cik-protocol-helper
// @version      1.0.0
// @description  Помощен скрипт за валидиране на секционни протоколи на ЦИК
// @author       Zhivko Kabaivanov
// @match        https://www.cik.bg/protokol/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cik.bg
// @grant        none
// ==/UserScript==

// ============================================
// Константни за лесно конфигуриране на селектори и цветове
// ============================================
const COLORS = {
    success: '#d4edda',
    fail: '#f8d7da',
    default: ''
};

// ============================================================
// Помощни функции
// ============================================================
const val = input => Number(input?.value) || 0;

function setInputColor(input, color) {
    if (input) {
        input.style.backgroundColor = color;
    }
}
const setInputSuccessColor = input => setInputColor(input, COLORS.success);
const setInputFailColor = input => setInputColor(input, COLORS.fail);
const clearInputColor = input => setInputColor(input, COLORS.default);

function validate(input, isValid) {
    if (!input?.value) { clearInputColor(input); return; }
    isValid ? setInputSuccessColor(input) : setInputFailColor(input);
}

function addControlSpan(rootElement, defaultText) {
    const pointContainer = rootElement.closest('.w-25');
    const pointLabel = pointContainer?.querySelector('p');

    const controlSpan = document.createElement('span');
    controlSpan.style.cssText =
        'display:block; font-size:0.85rem; margin-top:4px;';

    controlSpan.id = rootElement.name + '-control';
    controlSpan.textContent = defaultText || 'your text here';

    pointLabel?.insertAdjacentElement('afterend', controlSpan);
}

// ============================================================
// Парсване на секции с партии и съответните им числови полета
// ============================================================
function parseSection(headingFragment) {
    const heading = Array.from(document.querySelectorAll('h4'))
        .find(h => h.textContent.includes(headingFragment));
    if (!heading) return [];

    const root = heading.closest('div.mt-5') || heading.parentElement;
    return Array.from(root.querySelectorAll('input[type="number"]')).map(input => {
        const row = input.closest('.d-flex.border-d');
        return {
            root,
            number: row?.querySelector('.right-border.fw-bold')?.textContent.trim() ?? 'N/A',
            name: row?.querySelector('.left-border p')?.textContent.trim() ?? 'N/A',
            element: input
        };
    });
}

// ============================================================
// Добавяне на динамично поле за сума и валидация 
// на общата сума спрямо дадено поле
// ============================================================
function addSumDisplay(rootElement, parties, totalInput) {
    const summaryDiv = rootElement?.querySelector('.fw-bold.ps-5');
    if (!summaryDiv) return;

    summaryDiv.style.cssText += 'display:flex; justify-content:space-between; align-items:center;';

    const sumSpan = Object.assign(document.createElement('span'), {
        textContent: 'Сума: 0'
    });
    sumSpan.style.cssText = 'font-weight:bold; font-size:1.2rem; padding:2px 12px; margin-right:8em; white-space:nowrap;';
    summaryDiv.appendChild(sumSpan);

    function recalculate() {
        const total = parties.reduce((sum, p) => sum + val(p.element), 0);
        sumSpan.textContent = `Сума: ${total}`;
        validate(totalInput, total === val(totalInput));
    }

    parties.forEach(p => p.element.addEventListener('input', recalculate));
    totalInput?.addEventListener('input', recalculate);
    recalculate();
}

// ============================================================
// Получаване на преференциалните полета за дадена партия и 
// съответните им клетки в таблицата
// ============================================================
function getPrefInputs(partyNum, prefix) {
    const prefInputs = Array.from({ length: 32 }, (_, i) =>
        document.querySelector(`input[name="${prefix}-${partyNum}-d-${i + 1}"]`)
    ).filter(Boolean);

    const noPreference = document.querySelector(`input[name="${prefix}-${partyNum}-d-0"]`);

    const numCell = Array.from(document.querySelectorAll('.pref-td-num'))
        .find(td => td.textContent.trim() === String(partyNum)
            && td.closest('table')?.querySelector(`input[name="${prefix}-${partyNum}-d-1"]`));

    const nameCell = numCell?.nextElementSibling ?? null;
    const partyName = nameCell?.textContent.trim() ?? 'N/A';

    return { prefInputs, noPreference, nameCell, partyName };
}

// ============================================================
// Сума на преференциите + брояч на гласовете за партията на ред
// ============================================================
function addPrefSumDisplays(parties, prefix) {
    const spanStyle = `
        display:inline-block; min-width:60px; padding:2px 8px;
        border:2px solid #333; font-weight:bold; font-size:1rem; text-align:center;
    `;

    parties.forEach((party, idx) => {
        const { prefInputs, noPreference, nameCell } = getPrefInputs(idx + 1, prefix);
        if (!nameCell) return;

        const makeSpan = title => {
            const s = document.createElement('span');
            s.style.cssText = spanStyle;
            s.title = title;
            s.textContent = '0';
            return s;
        };

        const votesSpan = makeSpan('Гласове за партията (т.8/т.13)');
        const prefSumSpan = makeSpan('Сума на преференциите');

        const container = document.createElement('div');
        container.style.cssText = 'display:flex; gap:8px; margin-top:6px;';
        container.append(votesSpan, prefSumSpan);
        nameCell.appendChild(container);

        function update() {
            const prefTotal = prefInputs.reduce((s, el) => s + val(el), 0) + val(noPreference);
            const partyTotal = val(party.element);

            votesSpan.textContent = party.element.value || '0';
            prefSumSpan.textContent = prefTotal;

            const bg = party.element.value
                ? (prefTotal === partyTotal ? '#d4edda' : '#f8d7da')
                : '';
            votesSpan.style.backgroundColor = bg;
            prefSumSpan.style.backgroundColor = bg;
        }

        party.element.addEventListener('input', update);
        prefInputs.forEach(el => el.addEventListener('input', update));
        noPreference?.addEventListener('input', update);
        update();
    });
}

// ============================================================
// Валидиране на 
// точка 2 спрямо точка 1 и точка Б,
// точка А спрямо точки 3,4,5 и 
// точка 5 спрямо точки 6,7,9
// ============================================================
function validatePoint2() {
    const two = val(point2);
    if (!two) { clearInputColor(point2); return; }
    validate(point2, two <= val(pointB) + val(point1));
}

function validatePointA() {
    const point3Val = val(point3);
    const point4Val = val(point4);
    const point5Val = val(point5);
    const sum = point3Val + point4Val + point5Val;
    const controlSpan = document.getElementById(pointA.name + '-control');
    if (controlSpan) {
        controlSpan.innerHTML = `т.3 + т.4 + т.5 = т.А <br>`;
        controlSpan.innerHTML += `${point3Val} + ${point4Val} + ${point5Val} = ${sum}`;
        validate(pointA, val(pointA) === sum);
    }
}

function validatePoint5() {
    const point6Val = val(point6);
    const point7Val = val(point7);
    const point9Val = val(point9);
    const sum = point6Val + point7Val + point9Val;
    const controlSpan = document.getElementById(point5.name + '-control');
    if (controlSpan) {
        controlSpan.innerHTML = `т.6 + т.7 + т.9 = т.5 <br>`;
        controlSpan.innerHTML += `${point6Val} + ${point7Val} + ${point9Val} = ${sum}`;
        validate(point5, val(point5) === sum);
    }
}

function validatePoint11() {
    const point11Val = val(point11);
    const point12Val = val(point12);
    const point14Val = val(point14);
    const sum = point12Val + point14Val;
    const controlSpan = document.getElementById(point11.name + '-control');
    if (controlSpan) {
        controlSpan.innerHTML = `т.12 + т.14 = т.11 <br>`;
        controlSpan.innerHTML += `${point12Val} + ${point14Val} = ${sum}`;
        validate(point11, point11Val === sum);
    }
}

// ============================================================
// Основна логика за свързване на полетата и добавяне на контролни суми
// ============================================================
const inputs = document.querySelectorAll('input');

// Част I (т.A- т.4)
const pointA = document.querySelector('input[name="tA"]');
const pointB = document.querySelector('input[name="tB"]');

// Ако точка Б не е намерена, вероятно структурата на страницата е различна от очакваната
// Има някакъв бъг, защото не се зарежда правилно при първото отваряне, но при презареждане се появява. 
if (!pointB) {
    console.warn('pointB not found, retrying...');
    setTimeout(() => location.reload(), 1000);
    return;
}

const point1 = document.querySelector('input[name="t1"]');
const point2 = document.querySelector('input[name="t2"]');
const point3 = document.querySelector('input[name="t3"]');
const point4 = document.querySelector('input[name="t4"]');

// Част II (т.5 - т.9) - Хартиени бюлетини
const point5 = document.querySelector('input[name="t5"]');
const point6 = document.querySelector('input[name="t6"]');
const point7 = document.querySelector('input[name="t7"]');
const point9 = document.querySelector('input[name="t9"]');

const paperParties = parseSection('8. РАЗПРЕДЕЛЕНИЕ НА ГЛАСОВЕТЕ ПО КАНДИДАТСКИ ЛИСТИ ОТ ХАРТИЕНИТЕ');
addSumDisplay(paperParties[0]?.root, paperParties, point9);
addPrefSumDisplays(paperParties, 'cx');

// точка 2 трябва да е по-малко или равно на сумата от точка 1 и точка Б
[point2, point1, pointB].forEach(input => input.addEventListener('input', validatePoint2));
addControlSpan(pointA, 'т.3 + т.4 + т.5 = т.А');

// точка А трябва да е равна на сумата от точки 3, 4 и 5
[point3, point4, point5].forEach(input => input.addEventListener('input', validatePointA));

// точка 5 трябва да е равна на сумата от точки 6, 7 и 9
addControlSpan(point5, 'т. 6 + т.7 + т.9 = т.5');
[point6, point7, point9].forEach(input => input.addEventListener('input', validatePoint5));

// Част II (т.11 - т.14) - Машинно гласуване
const point11 = document.querySelector('input[name="t11"]');
const point12 = document.querySelector('input[name="t12"]');
const point14 = document.querySelector('input[name="t14"]');

if (!point11) {
    return;
}

// Отворен е протокол от избори, но не са налични полетата за машинно гласуване
// т.е. само за хартиени бюлетини, затова не правим нищо и не показваме грешки
if (!point11 || !point12 || !point14) {
    console.warn('Machine voting fields not found, retrying...');
    setTimeout(() => location.reload(), 1000);
    return;
}

const machineParties = parseSection('13. РАЗПРЕДЕЛЕНИЕ НА ГЛАСОВЕТЕ ПО КАНДИДАТСКИ ЛИСТИ ОТ БЮЛЕТИНИТЕ ОТ МАШИННО ГЛАСУВАНЕ');
addControlSpan(point11, 'т.12 + т.14 = т.11');
[point11, point12, point14].forEach(input => input.addEventListener('input', validatePoint11));

addSumDisplay(machineParties[0]?.root, machineParties, point14);
addPrefSumDisplays(machineParties, 'cm');
import './style.css';
import * as display from './helpers/handleDisplay.js';

let fullJson;

let appState = {
    globalCollapseAll: false,
    showRawJson: false
};
appState = new Proxy(appState, {
    set(target, property, value) {

        switch (property) {
            case "globalCollapseAll":
                if (value) display.collapseAllContainers();
                if (!value) display.expandAllContainers();
                break;
            case "showRawJson":
                if (value) display.showRawJson();
                if (!value) display.hideRawJson();
                break;
            default:
                console.log("appState set function default switch case");
        }

        target[property] = value;
        return true;
    }
});

function createInteractiveJson(json, jsonKey, depth) {
    if (depth === undefined) depth = 0;
    const isFirstLevelOfJson = jsonKey === undefined;
    const node = document.createElement('div');
    const keys = Object.keys(json);

    const objectType = Array.isArray(json) ? "array" : "object";

    if (isFirstLevelOfJson) {
        node.id = "interactiveJson";
    } else {
        node.classList.add("container");
        node.classList.add(objectType);
    }

    if (depth === 0 && !Array.isArray(json)) {
        node.classList.add('container');
        node.classList.add('object');

        const labelDiv = document.createElement('div');
        labelDiv.classList.add('labelContainer');

        const labelBtn = document.createElement('i');
        labelBtn.classList.add('labelBtn');
        labelBtn.classList.add('fa-solid');
        labelBtn.classList.add('fa-chevron-down');
        labelDiv.appendChild(labelBtn);

        const objectLabel = document.createElement('span');
        objectLabel.classList.add('label');
        objectLabel.classList.add('expanded');
        objectLabel.innerText = `object {${keys.length}}`;
        labelDiv.appendChild(objectLabel);

        node.appendChild(labelDiv);

        const objectContainer = document.createElement('div');
        objectContainer.className = "container";

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let value = json[i] || json[key];
            if (value === null) value = "null";

            if (typeof value === "object") {
                const anotherNode = createInteractiveJson(value, key, depth + 1);
                objectContainer.appendChild(anotherNode);
            } else {
                const keyValueLine = createKeyValueLine(key, value);
                objectContainer.appendChild(keyValueLine);
            }
        }
        if (!isFirstLevelOfJson || objectType === "object") node.appendChild(objectContainer);
    } else {
        if (jsonKey) {
            const labelDiv = document.createElement('div');
            labelDiv.classList.add('labelContainer');

            const labelBtn = document.createElement('i');
            labelBtn.classList.add('labelBtn');
            labelBtn.classList.add('fa-solid');
            labelBtn.classList.add('fa-chevron-down');
            labelDiv.appendChild(labelBtn);

            const objectLabel = document.createElement('span');
            objectLabel.classList.add('label');
            objectLabel.classList.add('expanded');

            objectLabel.innerText = objectType === "array"
                ? `[${keys.length}]`
                : `{${keys.length}}`;

            const objectKey = document.createElement('span');
            const filteredNode = highlightFilteredValue(jsonKey, "objectKey", depth);
            if (typeof filteredNode !== 'string') {
                objectKey.appendChild(filteredNode);
            } else {
                objectKey.innerText = jsonKey;
            }
            objectKey.appendChild(objectLabel);
            labelDiv.appendChild(objectKey);
            node.appendChild(labelDiv);
        }

        const objectContainer = document.createElement('div');
        objectContainer.className = "container";

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let value = json[i] || json[key];
            if (value === null) value = "null";

            if (typeof value === "object") {
                const anotherNode = createInteractiveJson(value, key, depth + 1);

                if (isFirstLevelOfJson) {
                    node.appendChild(anotherNode);
                } else {
                    objectContainer.appendChild(anotherNode);
                }
            } else {
                const keyValueLine = createKeyValueLine(key, value);
                objectContainer.appendChild(keyValueLine);
            }
        }
        if (!isFirstLevelOfJson || objectType === "object") node.appendChild(objectContainer);
    }
    return node;
}

function createKeyValueLine(key, value) {
    const lineDiv = document.createElement('div');
    lineDiv.classList.add('keyValue');

    const keySpan = highlightFilteredValue(key, "key");
    keySpan.classList.add('key');
    lineDiv.appendChild(keySpan);

    const valueSpan = highlightFilteredValue(value);
    valueSpan.classList.add('value');
    const valueType = value === "null" ? "null" : typeof value;
    valueSpan.classList.add(valueType);

    lineDiv.appendChild(valueSpan);
    return lineDiv;
}

function escapeRegexCharacters(string) {
    const charactersToEscape = [
        "\\", ".", "+", "*", "?",
        "[", "^", "]", "$", "(",
        ")", "{", "}", "=", "!",
        "<", ">", "|", ":", "-"
    ];

    charactersToEscape.forEach(char => string = string.replaceAll(char, "\\" + char));
    return string;
}

function highlightFilteredValue(data, key) {
    const dataIsKey = key === "key";
    const valueText = data.toString();
    const filterValue = document.getElementById('filterInput').value;
    const escapedCharacterFilter = escapeRegexCharacters(filterValue);
    const filterRegex = new RegExp(escapedCharacterFilter, "ig");
    const regexMatches = [...valueText.matchAll(filterRegex)];

    // If there's no filter or if there is a filter but the data doesn't match
    // the filter then return a span with the data unaltered
    if (filterValue === "" || regexMatches.length === 0) {
        const span = document.createElement('span');
        span.innerText = dataIsKey === true ? data + ": " : data;
        return span;
    }

    const matchIndexes = regexMatches.map(match => match.index);
    const matchLength = filterValue.length;

    const masterSpan = document.createElement('span');
    let workingIndex = 0;
    for (let i = 0; i < regexMatches.length; i++) {
        const dataStartsWithMatch = matchIndexes[0] === 0;
        if (i === 0 && !dataStartsWithMatch) {
            const beforeFilteredSpan = document.createElement('span');
            beforeFilteredSpan.innerText = valueText.slice(0, matchIndexes[i]);
            workingIndex = matchIndexes[i];
            masterSpan.appendChild(beforeFilteredSpan);
        }

        const filteredSpan = document.createElement('span');
        filteredSpan.classList.add('filteredValue');
        filteredSpan.innerText = valueText.slice(workingIndex, workingIndex + matchLength);
        workingIndex += matchLength;
        masterSpan.appendChild(filteredSpan);

        if (valueText.length === workingIndex) continue;

        const afterFilteredSpan = document.createElement('span');
        if (!matchIndexes[i + 1]) {
            afterFilteredSpan.innerText = valueText.slice(workingIndex);
        } else {
            afterFilteredSpan.innerText = valueText.slice(workingIndex, matchIndexes[i + 1]);
            workingIndex = matchIndexes[i + 1];
        }
        masterSpan.appendChild(afterFilteredSpan);
    }

    if (dataIsKey) {
        const colonSpan = document.createElement('span');
        colonSpan.innerText = ": ";
        masterSpan.appendChild(colonSpan);
    }

    return masterSpan;
}

function filterJson(json, depth) {
    if (depth === undefined) depth = 0;
    const newJson = Array.isArray(json) ? [] : {};
    const filter = filterInput.value;
    const keys = Object.keys(json);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let value = json[key];
        if (value === null) value = "null";
        const escapedCharacterFilter = escapeRegexCharacters(filter);
        const regex = new RegExp(escapedCharacterFilter, "i");
        const keyMatches = regex.test(key);
        const valueMatches = typeof value !== "object"
            ? regex.test(value)
            : false;

        if (keyMatches || valueMatches) {
            newJson[key] = value;
        } else if (typeof value === "object") {
            const filteredJson = filterJson(value, depth + 1);
            const jsonHasContent = Object.keys(filteredJson).length > 0;
            if (jsonHasContent) {
                newJson[key] = filteredJson;
            } else {
                if (depth === 0) {
                    const jsonIsArray = Array.isArray(json);
                    const valueIsArray = Array.isArray(value);
                    if (jsonIsArray) newJson[key] = valueIsArray ? [] : {};
                }
            }
        }
    }
    return newJson;
}

function displayRawJson(json, depth, objectKey) {
    const rawJson = document.getElementById('rawJson');
    if (depth === undefined) depth = 0;
    const smallIndent = " ".repeat(4 * depth);
    const bigIndent = " ".repeat(4 * (depth + 1));

    const openingLine = document.createElement('div');
    openingLine.classList.add('rawLine');

    const indentSpan = document.createElement('span');
    indentSpan.innerText = smallIndent;
    openingLine.appendChild(indentSpan);

    const objectKeyIsString = !!objectKey && Number.isNaN(Number(objectKey));
    if (objectKeyIsString) {
        const objectKeySpan = document.createElement('span');
        objectKeySpan.innerText = `"${objectKey}"`;
        openingLine.appendChild(objectKeySpan);

        const colonSpan = document.createElement('span');
        colonSpan.innerText = ": ";
        colonSpan.classList.add('rawColon');
        openingLine.appendChild(colonSpan);
    }

    const openingBracket = document.createElement('span');
    openingBracket.classList.add('rawPunctuation');
    openingBracket.innerText = Array.isArray(json) ? "[" : "{";
    openingLine.appendChild(openingBracket);
    rawJson.appendChild(openingLine);

    const keys = Object.keys(json);
    const objectLength = keys.length;
    keys.forEach((key, idx) => {
        const value = json[key];

        if (typeof value === "object" && value !== null) {
            displayRawJson(value, depth + 1, key);

            const closingLine = document.createElement('div');
            closingLine.classList.add('rawLine');

            const closingBracket = document.createElement('span');
            closingBracket.classList.add('rawPunctuation');
            closingBracket.innerText = Array.isArray(value) ? `${bigIndent}]` : `${bigIndent}}`;
            if (idx < objectLength - 1) closingBracket.innerText += ",";
            closingLine.appendChild(closingBracket);
            rawJson.appendChild(closingLine);
        } else {
            const valueType = typeof value;
            const valueClassName = "raw" + valueType.charAt(0).toUpperCase() + valueType.slice(1);

            const keyValueLine = document.createElement('div');
            keyValueLine.classList.add('rawLine');

            const indentSpan = document.createElement('span');
            indentSpan.innerText = bigIndent;
            indentSpan.classList.add('indent');
            keyValueLine.appendChild(indentSpan);

            const isKeyString = Number.isNaN(Number(key));
            if (isKeyString) {
                const keySpan = document.createElement('span');
                keySpan.innerText = `"${key}"`;
                keySpan.classList.add('rawKey');
                keyValueLine.appendChild(keySpan);

                const keyValueColon = document.createElement('span');
                keyValueColon.innerText = ": ";
                keyValueColon.classList.add('rawColon');
                keyValueLine.appendChild(keyValueColon);
            }

            const valueSpan = document.createElement('span');
            if (value === null) {
                valueSpan.innerText = "null";
                valueSpan.classList.add("rawNull");
            } else {
                valueSpan.innerText = valueType === "string" ? `"${value}"` : value;
                valueSpan.classList.add(valueClassName);
            }

            keyValueLine.appendChild(valueSpan);

            if (idx < objectLength - 1) {
                const comma = document.createElement('span');
                comma.innerText = ",";
                comma.classList.add('rawPunctuation');
                keyValueLine.appendChild(comma);
            }

            rawJson.appendChild(keyValueLine);
        }
    });

    if (depth === 0) {
        const line = document.createElement('div');
        line.classList.add('rawLine');

        const closingBracket = document.createElement('span');
        closingBracket.classList.add('rawPunctuation');
        closingBracket.innerText = Array.isArray(json) ? "]" : "}";
        line.appendChild(closingBracket);
        rawJson.appendChild(line);
    }
}

function setCopyMode(bool) {
    window.copyEnabled = bool;
    const valueElements = objectViewer.querySelectorAll(".value");

    if (bool === true) {
        valueElements.forEach(elem => elem.classList.add("copy"));
    } else {
        valueElements.forEach(elem => elem.classList.remove("copy"));
    }
}

function emptyObjectViewer() {
    const objectViewer = document.getElementById('objectViewer');
    if (!objectViewer) return;
    objectViewer.innerHTML = "";
}

function handleNewJson(json) {
    display.resetToolbar();

    emptyObjectViewer();
    const interactiveJson = createInteractiveJson(json);
    objectViewer.appendChild(interactiveJson);

    const rawJson = document.createElement('pre');
    rawJson.id = "rawJson";
    rawJson.classList.add('hide');
    objectViewer.appendChild(rawJson);

    displayRawJson(json);
}

function isValidHttpUrl(string) {
    try {
        const newUrl = new URL(string);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

function handleFilterInput() {
    appState.globalCollapseAll = false;
    const interactiveJson = document.getElementById('interactiveJson');
    const filteredJson = filterJson(fullJson);
    const newDOM = createInteractiveJson(filteredJson);
    interactiveJson.replaceWith(newDOM);
}
function debounce(func, delay) {
    let debounceTimer;
    return function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(), delay);
    }
}

const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.className;

    if (currentTheme === "lightTheme") {
        document.documentElement.className = "darkTheme";
    } else {
        document.documentElement.className = "lightTheme";
    }
});

const loadJsonUrl = document.getElementById('loadJsonUrl');
loadJsonUrl.addEventListener('click', async () => {
    const jsonUrl = document.getElementById('jsonUrl');
    const urlToFetch = jsonUrl.value;
    const urlIsValid = isValidHttpUrl(urlToFetch);
    if (!urlIsValid) return window.alert("Please enter a valid http/https URL.");

    const corsUrl = "https://secretsauce.tyler-holland1.repl.co/fetch";
    const fetchJson = await fetch(corsUrl, {
        headers: {
            "url-to-fetch": urlToFetch
        }
    });

    if (fetchJson.status === 400) return window.alert("Failed to fetch from URL");
    fullJson = await fetchJson.json();

    handleNewJson(fullJson);
});

const toggleCollapseAllBtn = document.getElementById('toggleCollapseAllBtn');
toggleCollapseAllBtn.addEventListener('click', () => {
    appState.globalCollapseAll = !appState.globalCollapseAll
});

const toggleJsonViewBtn = document.getElementById('toggleJsonViewBtn');
toggleJsonViewBtn.addEventListener('click', () => {
    appState.showRawJson = !appState.showRawJson;
});

const filterInput = document.getElementById('filterInput');
filterInput.addEventListener('input', debounce(() => handleFilterInput(), 500));

const objectViewer = document.getElementById('objectViewer');
objectViewer.addEventListener('click', (e) => {
    const target = e.target;
    const targetIsValue = [...target.classList].includes("value");
    const isClickToCopy = (e.ctrlKey === true && targetIsValue);

    if (isClickToCopy) {
        const text = target.innerText;
        navigator.clipboard.writeText(text);
        setCopyMode(false);
        window.alert(`Copied to clipboard:\n${text}`);
        return
    }

    const classListIncludesLabel = [...target.classList].includes("labelBtn");
    if (!classListIncludesLabel) return;

    const labelDiv = target.parentNode;
    labelDiv.classList.toggle('hideContainer');
});

window.addEventListener('keydown', (e) => {
    const copyEnabled = window.copyEnabled || false;
    if (e.key === "Control" && !copyEnabled) setCopyMode(true);
});

window.addEventListener('keyup', (e) => {
    if (e.key === "Control") setCopyMode(false);
});

onload = async () => {
    document.documentElement.className = "darkTheme";

    fullJson = await fetch('/data/array.json')
    .then(res => res.json());

    handleNewJson(fullJson);
}
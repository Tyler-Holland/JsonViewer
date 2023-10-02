const filterInput = document.getElementById('filterInput');
const toggleCollapseAllBtn = document.getElementById('toggleCollapseAllBtn');
const jsonUrl = document.getElementById('jsonUrl');
const collapseAllIcon = document.getElementById('collapseAllIcon');
const expandAllIcon = document.getElementById('expandAllIcon');

export function expandAllContainers() {
    collapseAllIcon.style.visibility = "visible";
    expandAllIcon.style.visibility = "hidden";

    const labelButtons = document.querySelectorAll('.labelBtn');
    labelButtons.forEach(button => {
        const buttonContainer = button.parentNode;
        const wasCollapsedBefore = [...buttonContainer.classList].includes('wasCollapsed');
        if (wasCollapsedBefore) return buttonContainer.classList.remove('wasCollapsed');
        buttonContainer.classList.remove('hideContainer');
    });
}

export function collapseAllContainers() {
    collapseAllIcon.style.visibility = "hidden";
    expandAllIcon.style.visibility = "visible";

    const labelButtons = document.querySelectorAll('.labelBtn');
    labelButtons.forEach(button => {
        const buttonContainer = button.parentNode;
        const containerIsAlreadyCollapsed = [...buttonContainer.classList].includes('hideContainer');
        if (containerIsAlreadyCollapsed) return buttonContainer.classList.add('wasCollapsed');
        buttonContainer.classList.add('hideContainer');
    });
}

export function showRawJson() {
    const interactiveJson = document.getElementById('interactiveJson');
    const rawJson = document.getElementById('rawJson');
    interactiveJson.classList.add('hide');
    rawJson.classList.remove('hide');
    disableCollapseAndFilter();
}

export function hideRawJson() {
    const interactiveJson = document.getElementById('interactiveJson');
    const rawJson = document.getElementById('rawJson');
    interactiveJson.classList.remove('hide');
    rawJson.classList.add('hide');
    enableCollapseAndFilter();
}

export function enableCollapseAndFilter() {
    filterInput.disabled = false;
    toggleCollapseAllBtn.disabled = false;
}

export function disableCollapseAndFilter() {
    filterInput.disabled = true;
    toggleCollapseAllBtn.disabled = true;
}

export function resetToolbar() {
    collapseAllIcon.style.visibility = "visible";
    expandAllIcon.style.visibility = "hidden";
    filterInput.value = "";
    jsonUrl.value = "";
    enableCollapseAndFilter();
}
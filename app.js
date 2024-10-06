window.wheelList = [];
window.isSpinning = false;
var wheelWrapper = document.getElementById("wheel-list");

/**
 * Toggles relevant classes on body and toggle element to use dark mode CSS vars
 */
function toggleDarkMode() {
    var darkModeButton = document.getElementById("darkToggle");
    var darkMode = localStorage.getItem("darkMode");
    if (!darkMode) {
        localStorage.setItem("darkMode", "true");
        darkModeButton.classList.add("dark");
        document.body.classList.add("dark");
        return;
    }
    localStorage.removeItem("darkMode");
    darkToggle.classList.remove("dark");
    document.body.classList.remove("dark");
}

/**
 * Render a wheel at specific index after checkign that it is not already being rendered and does exist in wheel list
 * @param {int} wheelIdx index of the wheel
 */
function renderWheel(wheelIdx) {
    // check if index is valid
    if (window.wheelList[wheelIdx] === undefined) return;

    // check if panel with wheel of selected index exists already
    if (document.querySelector(".wheel-panel-" + wheelIdx)) return;

    var optionsList = "";
    var pickerPetals = "";
    var wheelBg = "";

    var option;
    var petalAngle = 360 / window.wheelList[wheelIdx].options.length;
    var petalText = petalAngle / 2;

    for (var x = 0; x < window.wheelList[wheelIdx].options.length; x++) {
        option = window.wheelList[wheelIdx].options[x];
        optionsList += `
            <div class="option-input">
                <input 
                    type="text"
                    class="picker-option"
                    data-wheelIdx="${wheelIdx}"
                    data-optIdx="${x}"
                    value="${option}" 
                /><button class="option-remove">&#x1F5D9;</button>
            </div>
        `;
        pickerPetals += `
            <div class="spinner-petal petal-${wheelIdx}-${x}" style="transform:rotate(${-90 + petalAngle * (x+1)}deg); transform-origin: top left;">
                <div class="petal-name" style="transform:rotate(${petalText}deg) translateY(-0.6em); transform-origin: top left;">${option}</div>
            </div>
        `;
        if (x > 0) {
            wheelBg += " " + (petalAngle * x) + "deg, ";
        }
        wheelBg += "var(--color-" + (x%2==0? "bg" : "panel") + ") " + (petalAngle * x) + "deg";
    }

    var wheelPanel = document.createElement('div');
    wheelPanel.classList.add('panel');
    wheelPanel.classList.add('wheel-panel-' + wheelIdx);
    wheelPanel.innerHTML = `
        <div class="panel-header">
            <h3>${window.wheelList[wheelIdx].name}</h3>
            <button class="remove-wheel" data-wheelIdx="${wheelIdx}">&#x1F5D9;</button>
            <button class="edit-wheel-name" data-wheelIdx="${wheelIdx}">&#x270E;</button>
        </div>
        <div class="panel-body">
            <div class="options-list">
                ${optionsList}
            </div>
            <div class="wheel-side">
                <h3 class="wheel-result" data-wheelIdx="${wheelIdx}" data-optIdx="-1">
                    Undecided
                </h3>
                <div class="wheel-wrapper">
                    <div class="spinner-wrapper">
                        <div class="spinner-element" style="background-image: conic-gradient(${wheelBg});">
                            ${pickerPetals}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    // Append as html
    wheelWrapper.appendChild(wheelPanel);
}

/**
 * Dynamically recaulculate petal offset and background of any specific picker wheel based on index
 * @param {int} wheelIdx index of the wheel in window wheel list
 */
function recalculatePetalTransform(wheelIdx) {
    var petalAngle = 360 / window.wheelList[wheelIdx].options.length;
    var petalText = petalAngle / 2;
    var wheelBg = "";
    // Recalc all petal offsets and set new background gradient
    for (var x = 0; x < window.wheelList[wheelIdx].options.length; x++) {
        document.querySelector('.spinner-petal.petal-' + wheelIdx + '-' + x)
            .setAttribute('style', `transform:rotate(${-90 + petalAngle*(x+1)}deg); transform-origin: top left;`);
        document.querySelector('.spinner-petal.petal-' + wheelIdx + '-' + x + ' .petal-name')
            .setAttribute('style', `transform:rotate(${petalText}deg) translateY(-0.6em); transform-origin: top left;`);
        if (x > 0) {
            wheelBg += " " + (petalAngle * x) + "deg, ";
        }
        wheelBg += "var(--color-" + (x%2==0? "bg" : "panel") + ") " + (petalAngle * x) + "deg";
    }
    document.querySelector('.wheel-panel-' + wheelIdx + ' .spinner-element')
        .setAttribute('style', `background-image: conic-gradient(${wheelBg});`);
}

/**
 * Resets the wheel list and loads default config
 */
function loadDefault() {
    window.wheelList = [
        {
            name: "Coin Flip",
            options: [
                "Heads",
                "Tails",
            ]
        },
    ];
    wheelWrapper.innerHTML = '';
    renderWheel(0);
}

/**
 * Spins all wheels
 */
function spinAll() {
    if (window.isSpinning) return;

    for (var x = 0; x < window.wheelList.length; x++) {
        spinWheel(x, (x == window.wheelList.length -1));
    }
}

/**
 * Spin a specific wheel
 * @param {int} wheelIdx index of the wheel
 * @param {bool} lastWheel is the the last wheel being spun, if true will enable spinning at the end of its animation again
 */
function spinWheel(wheelIdx, lastWheel) {
    window.isSpinning = true;
    var resultLabel = document.querySelector('.wheel-panel-' + wheelIdx + ' .wheel-result');
    var optCount = window.wheelList[wheelIdx].options.length;
    var lastResult = parseInt(resultLabel.getAttribute('data-optIdx'))

    var newResult;
    do {
        newResult = Math.floor(Math.random() * optCount);
    } while (lastResult == newResult);

    var spinCount = 360*10 + 360*wheelIdx - (360/optCount*(newResult+1)) - (360/(optCount*2));
    var spinDuration = 3 + wheelIdx/2;

    var spinnerWrapper = document.querySelector('.wheel-panel-' + wheelIdx + ' .spinner-wrapper');
    spinnerWrapper.setAttribute('style', `transition: transform ${spinDuration}s; transform: rotate(${spinCount}deg);`);

    setTimeout(function() {
        spinnerWrapper.setAttribute('style', `transition: transform 0s; transform: rotate(${-(360/optCount*(newResult+1)) - (360/(optCount*2))}deg);`)
        resultLabel.innerHTML = window.wheelList[wheelIdx].options[newResult];
        resultLabel.setAttribute('data-optIdx', newResult);
        if (lastWheel) {
            window.isSpinning = false;
        }
    }, spinDuration * 1000);
}

/**
 * 
 */
function addWheel() {
    window.wheelList.push({
        name: "Coin Flip",
        options: [
            "Heads",
            "Tails",
        ]
    });
    renderWheel(window.wheelList.length - 1);
}

/**
 * Removes specific wheel from page, this should happen when final option is removed or wheel is removed via deicated input
 * @param {int} wheelIdx 
 */
function removeWheel(wheelIdx) {
    document.querySelector('.wheel-panel-' + wheelIdx).remove();
    window.wheelList.splice(wheelIdx, 1);
    // reindex ALL wheels and their indexes that came after affected index
    var panels = document.querySelectorAll('#wheel-list > .panel');
    panels.forEach(function(currentPanel, currentIndex) {
        currentPanel.className = 'panel wheel-panel-' + currentIndex;
        reIndexWheelPanel(currentIndex);
    });
}

/**
 * Dump current state to JSON file and present a save dialog
 */
function saveToFile() {
    var blob = new Blob([JSON.stringify(window.wheelList, null, 2)], {
        type: 'application/json',
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = `wheelConfig.json`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}

/**
 * This is a bit of a hack cuz actual "load" happens on change of value of the hidden input field
 */
function loadFromFile() {
    document.getElementById('data-load').click();
}

/**
 * Re-indexes all options and classnames that reference wheel and option index in any given panel
 * @param {int} wheelIdx 
 */
function reIndexWheelPanel(wheelIdx) {
    document.querySelectorAll('.wheel-panel-' + wheelIdx + ' .picker-option').forEach(function(curOpt, curIdx) {
        curOpt.setAttribute('data-wheelIdx', wheelIdx);
        curOpt.setAttribute('data-optIdx', curIdx);
    });
    document.querySelectorAll('.wheel-panel-' + wheelIdx + ' .spinner-petal').forEach(function(curPetal, curIdx) {
        curPetal.className = 'spinner-petal petal-' + wheelIdx + '-' + curIdx;
    });
    document.querySelector('.wheel-panel-' + wheelIdx + ' .remove-wheel').setAttribute('data-wheelIdx', wheelIdx);
    document.querySelector('.wheel-panel-' + wheelIdx + ' .edit-wheel-name').setAttribute('data-wheelIdx', wheelIdx);
    document.querySelector('.wheel-panel-' + wheelIdx + ' .wheel-result').setAttribute('data-wheelIdx', wheelIdx);
}

// Run default setup
loadDefault();

/**
 * 
 * Below are all dynamic event listeners for elements that are made via code
 * 
 */
document.addEventListener('click', function(e) {
    // remove option from target wheel
    if (e.target.className == 'option-remove') {
        var wheelIdx = parseInt(e.target.previousSibling.getAttribute('data-wheelIdx'));
        var optIdx = parseInt(e.target.previousSibling.getAttribute('data-optIdx'));

        // remove the option and the petal
        window.wheelList[wheelIdx].options.splice(optIdx, 1);
        document.querySelector('.petal-' + wheelIdx + '-' + optIdx).remove();
        e.target.parentNode.remove();

        // if there are no options left, remove the wheel
        if (window.wheelList[wheelIdx].options.length < 1) {
            removeWheel(wheelIdx);
            return;
        }
        // reindex options of this wheel
        reIndexWheelPanel(wheelIdx);
        recalculatePetalTransform(wheelIdx);
        return;
    }
    // remove a wheel
    if (e.target.className == 'remove-wheel') {
        removeWheel(parseInt(e.target.getAttribute('data-wheelIdx')));
    }
    // spin a wheel
    if (e.target.className == 'wheel-result' && !window.isSpinning) {
        spinWheel(parseInt(e.target.getAttribute('data-wheelIdx')), true);
    }
});
document.addEventListener('keyup', function(e) {
    var wheelIdx;
    var optIdx;
    // update existing option or add new if enter key is pressed
    if (e.target.className == 'picker-option') {
        wheelIdx = parseInt(e.target.getAttribute("data-wheelIdx"));
        optIdx = parseInt(e.target.getAttribute("data-optIdx"));
        // if Enter, add new option
        if (e.key == 'Enter') {
            window.wheelList[wheelIdx].options.push("");

            // add new input for the value
            var newOption = document.createElement('div');
            newOption.classList.add('option-input');
            
            var optInput = document.createElement('input');
            optInput.setAttribute('type', 'text');
            optInput.classList.add('picker-option');
            optInput.setAttribute('data-wheelidx', wheelIdx);
            optInput.setAttribute('data-optIdx', window.wheelList[wheelIdx].options.length - 1);
            
            var optButton = document.createElement('button');
            optButton.classList.add('option-remove');
            optButton.innerHTML = '&#x1F5D9;';            

            newOption.appendChild(optInput);
            newOption.appendChild(optButton);
            document.querySelector('.wheel-panel-' + wheelIdx + ' .options-list').appendChild(newOption);


            // add new petal
            var newPetal = document.createElement('div');
            newPetal.classList.add('spinner-petal');
            newPetal.classList.add('petal-' + wheelIdx + '-' + (window.wheelList[wheelIdx].options.length - 1));

            var petalLabel = document.createElement('div');
            petalLabel.classList.add('petal-name');

            newPetal.appendChild(petalLabel);
            document.querySelector('.wheel-panel-' + wheelIdx + ' .spinner-element').appendChild(newPetal);

            recalculatePetalTransform(wheelIdx);
            
            optInput.focus();
            return;
        }
        window.wheelList[wheelIdx].options[optIdx] = e.target.value;
        document.querySelector(".petal-" + wheelIdx + "-" + optIdx + " .petal-name").innerHTML = e.target.value;
    }
});
document.getElementById('data-load').addEventListener('change', function(e) {
    var reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = function() {
        var oldData = window.wheelList;
        try {
            window.wheelList = JSON.parse(reader.result);
            wheelWrapper.innerHTML = '';
            for (var x = 0; x < window.wheelList.length; x++) {
                renderWheel(x);
            }
        } catch (e) {
            window.wheelList = oldData;
            wheelWrapper.innerHTML = '';
            for (var x = 0; x < window.wheelList.length; x++) {
                renderWheel(x);
            }
            alert(e);
        }
    }
});
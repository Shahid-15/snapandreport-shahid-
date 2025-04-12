const text = "Snap and Report";
let index = 0;
let isDeleting = false;
const speed = 50;  // Faster typing speed
const eraseSpeed = 30;  // Faster erasing speed
const delay = 500;  // Shorter pause before erasing
const target = document.querySelector(".moving-animation");

function typeEffect() {
    let displayText = text.substring(0, index);

    // Apply purple color only to "Report"
    if (displayText.includes("Report")) {
        displayText = displayText.replace("Report", '<span class="text-purple">Report</span>');
    }

    target.innerHTML = displayText + '<span style="color: #a855f7;">|</span>';

    if (!isDeleting) {
        index++;
        if (index > text.length) {
            isDeleting = true;
            setTimeout(typeEffect, delay);
            return;
        }
    } else {
        index--;
        if (index < 0) {
            isDeleting = false;
        }
    }
    setTimeout(typeEffect, isDeleting ? eraseSpeed : speed);
}

// Start animation
typeEffect();

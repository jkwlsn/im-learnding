function setCookie(name, value, days) {
    let d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); // Expiration time
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";SameSite=Lax";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;  // Return null if the cookie isn't found
}

function success() {
        // Define assets 
        const images = ['_assets/cat_trace2.svg', '_assets/cat_trace3.svg'];
        const audio = new Audio('learnding.mp3');
        
        // Animate
        let currentIndex = 0;
        setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          document.getElementById('cat-image').src = images[currentIndex];
        }, 500);

        // Play audio
        audio.loop = false;
        audio.play();
       
        // Set cookie
        setCookie('guessed', 'true', 30);

        // Remove hidden class
        document.body.classList.remove('hidden');
}

function playGame() {
    document.querySelector('#cat-form').addEventListener("keyup", function(event) {
    
        let target = event.srcElement || event.target;
        let inputLength = target.value.length;
       
        // Move focus to next or previous input
        const moveFocus = (direction) => {
            let sibling = direction === 'next' ? target.nextElementSibling : target.previousElementSibling;
            while (sibling) {
                if (sibling.tagName.toLowerCase() === "input") {
                    sibling.focus();
                    break;
                }
                sibling = direction === 'next' ? sibling.nextElementSibling : sibling.previousElementSibling;
            }
        };

        if (inputLength === 1) {
            moveFocus('next');
        } else if (inputLength === 0) {
            moveFocus('previous');
        }

        const answer = Array.from(document.querySelectorAll(".cat-input"), input => input.value.toUpperCase()).join('');
        if (answer === 'CAT') {
            success();
        } 
    });
}

function init() {
    if ( getCookie('guessed') !== 'true' ) {
        document.body.classList.add('hidden');
    }
    playGame();
}

document.addEventListener('DOMContentLoaded', init);

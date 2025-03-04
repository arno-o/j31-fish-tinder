import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

let currentIndex = 0;
let removedCards = [];
let lastUndone = 0; // Set default lastUndone to 0

// save state to local storage
const saveState = () => {
    localStorage.setItem("currentIndex", currentIndex);
    localStorage.setItem("removedCards", JSON.stringify(removedCards));
    localStorage.setItem("lastUndone", lastUndone); // Save last undone index
};

// load state from local storage
const loadState = () => {
    const savedIndex = localStorage.getItem("currentIndex");
    const savedRemovedCards = localStorage.getItem("removedCards");
    const savedLastUndone = localStorage.getItem("lastUndone");

    if (savedIndex) currentIndex = parseInt(savedIndex, 10);
    if (savedRemovedCards) removedCards = JSON.parse(savedRemovedCards);
    if (savedLastUndone !== null) {
        lastUndone = parseInt(savedLastUndone, 10); // Ensure lastUndone is set correctly
    }

    // Hide the removed cards
    removedCards.forEach(({ index }) => {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) card.style.display = "none";
    });
};

// handle swiping left or right
const swipe = (direction, card) => {
    const xOffset = direction === "right" ? window.innerWidth * 1.5 : -window.innerWidth * 1.5;

    gsap.to(card, {
        x: xOffset,
        rotation: direction === "right" ? 20 : -20,
        duration: 0.5,
        onComplete: () => {
            removedCards.push({ index: currentIndex }); // Store index of the swiped card
            card.style.display = "none"; // Hide the card
            currentIndex++; // Move to the next card

            saveState(); // Update local storage
            renderCards(); // Re-render the cards
        }
    });
};

// undo last swipe
const undoLastSwipe = () => {
    if (removedCards.length === 0) return;

    const lastRemoved = removedCards.pop();
    const card = document.querySelector(`[data-index="${lastRemoved.index}"]`);

    if (card) {
        gsap.set(card, { x: 0, rotation: 0, scale: 1 });

        card.style.display = "block"; 
        gsap.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.3, scale: 1 });

        currentIndex = lastRemoved.index;
    }

    lastUndone = currentIndex; // Set the last undone card index
    saveState(); // Update local storage
    renderCards(); // Re-render the cards
};

const renderCards = () => {
    const cards = Array.from(document.querySelectorAll(".card"));
    
    cards.forEach(card => {
        const index = parseInt(card.dataset.index, 10);
        if (index < currentIndex) {
            card.style.display = "none"; // Hide cards before the current index
        } else if (index === currentIndex) {
            card.style.display = "flex"; // Show the current card
        } else {
            card.style.display = "none"; // Hide all cards after the current card
        }
    });

    // Re-enable draggable for the current card
    const currentCard = document.querySelector(`[data-index="${currentIndex}"]`);
    if (currentCard) {
        // Ensure the card is draggable
        Draggable.create(currentCard, {
            type: "x",
            bounds: { minX: -window.innerWidth, maxX: window.innerWidth },
            inertia: true,
            onDrag: function () {
                const rotation = this.x / window.innerWidth * 20;
                const scale = 1 - Math.abs(this.x) / (window.innerWidth * 2);
                gsap.to(currentCard, { rotation: rotation, scale: scale, duration: 0.1 });
            },
            onDragEnd: function () {
                if (this.endX > 150) {
                    swipe("right", currentCard);
                } else if (this.endX < -150) {
                    swipe("left", currentCard);
                } else {
                    gsap.to(currentCard, { x: 0, rotation: 0, scale: 1, duration: 0.3, ease: "power2.out" });
                }
            }
        });
    }
};

// Reset Local Storage for testing purposes
const resetLocalStorage = () => {
    localStorage.removeItem("currentIndex");
    localStorage.removeItem("removedCards");
    localStorage.removeItem("lastUndone");

    // Reload the page or call init() to reset everything
    window.location.reload(); // or just call init() if you prefer not to reload
};

// initialize the app
const init = () => {
    // document.querySelector("#reset").addEventListener("click", resetLocalStorage);

    loadState(); // Load the saved state from localStorage
    renderCards(); // Render the cards based on the loaded state

    // Set up swipe actions and undo button
    const undoButton = document.querySelector("#undo-button");
    if (undoButton) {
        undoButton.addEventListener("click", undoLastSwipe);
    }
};

// Initialize the app when the DOM is ready
init();
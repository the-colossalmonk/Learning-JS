document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const container = document.getElementById("container");
  const modeSelector = document.getElementById("mode-selector");
  const quoteDisplayElement = document.getElementById("quote-display");
  const quoteInputElement = document.getElementById("quote-input");
  const timerElement = document.getElementById("timer");
  const wpmElement = document.getElementById("wpm");
  const accuracyElement = document.getElementById("accuracy");
  const shareBtn = document.getElementById('share-btn');
  const restartMainBtn = document.getElementById("restart-main-btn");
  const loadingSpinner = document.getElementById("loading");

  // --- Application State ---
  const QUOTE_API_URL =
    "https://api.quotable.io/random?minLength=100&maxLength=180";
  let timer;
  let startTime;
  let mistakes = 0;
  let isTimerStarted = false;
  let testDuration = 60; // Default duration
  let isFetchingNextQuote = false;

  // --- Functions ---

  function setMode(e) {
    const selectedBtn = e.target.closest(".mode-btn");
    if (!selectedBtn) return;

    testDuration = parseInt(selectedBtn.dataset.duration);

    modeSelector
      .querySelectorAll(".mode-btn")
      .forEach((btn) => btn.classList.remove("active"));
    selectedBtn.classList.add("active");

    // Apply color theme based on difficulty
    container.classList.remove("mode-easy", "mode-medium", "mode-hard");
    if (testDuration === 120) container.classList.add("mode-easy");
    else if (testDuration === 90) container.classList.add('mode-medium-easy');
    else if (testDuration === 60) container.classList.add("mode-medium");
    else if (testDuration === 30) container.classList.add("mode-hard");

    resetTest();
  }

  async function getRandomQuote() {
    try {
      const response = await fetch(QUOTE_API_URL);
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Failed to fetch quote:", error);
      return "The quick brown fox jumps over the lazy dog.";
    }
  }

  async function appendNewQuote() {
    isFetchingNextQuote = true;
    const quote = await getRandomQuote();

    // Add a space between quotes
    const spaceSpan = document.createElement("span");
    spaceSpan.innerText = " ";
    quoteDisplayElement.appendChild(spaceSpan);

    quote.split("").forEach((character) => {
      const characterSpan = document.createElement("span");
      characterSpan.innerText = character;
      quoteDisplayElement.appendChild(characterSpan);
    });
    isFetchingNextQuote = false;
  }

  function handleInput() {
    if (!isTimerStarted) {
      startTimer();
    }

    const quoteChars = quoteDisplayElement.querySelectorAll("span");
    const typedChars = quoteInputElement.value.split("");
    mistakes = 0;

    quoteChars.forEach((charSpan, index) => {
      const character = typedChars[index];
      charSpan.classList.remove("correct", "incorrect", "current");
      if (character == null) {
        if (index === typedChars.length) charSpan.classList.add("current");
      } else if (character === charSpan.innerText) {
        charSpan.classList.add("correct");
      } else {
        charSpan.classList.add("incorrect");
        if (character === " ")
          mistakes++; // Only count spacebar errors for more forgiving accuracy
        else mistakes++;
      }
    });

    // "Infinity Mode" Logic: Fetch next quote when 70% complete
    if (!isFetchingNextQuote && typedChars.length / quoteChars.length > 0.7) {
      appendNewQuote();
    }

    updateLiveAccuracy();
  }

  function startTimer() {
    startTime = new Date();
    isTimerStarted = true;
    timer = setInterval(() => {
      const elapsedSeconds = Math.floor((new Date() - startTime) / 1000);
      const remainingTime = testDuration - elapsedSeconds;
      timerElement.innerText = `${remainingTime}s`;
      if (remainingTime <= 0) {
        endTest();
      }
      updateLiveWPM(elapsedSeconds);
    }, 1000);
  }

  function endTest() {
    clearInterval(timer);
    quoteInputElement.disabled = true;
    shareBtn.disabled = false;
    const elapsedSeconds = Math.floor((new Date() - startTime) / 1000);
    updateLiveWPM(elapsedSeconds);
    updateLiveAccuracy();
  }

  function updateLiveWPM(elapsedSeconds) {
    if (elapsedSeconds === 0) return;
    let correctCharsCount = 0;
    quoteInputElement.value.split("").forEach((char, index) => {
      if (
        char === quoteDisplayElement.querySelectorAll("span")[index].innerText
      ) {
        correctCharsCount++;
      }
    });
    const wordsTyped = correctCharsCount / 5;
    const minutesElapsed = elapsedSeconds / 60;
    const wpm = Math.round(wordsTyped / minutesElapsed);
    wpmElement.innerText = wpm || 0;
  }

  function updateLiveAccuracy() {
    const totalTyped = quoteInputElement.value.length;
    if (totalTyped === 0) {
      accuracyElement.innerText = "100%";
      return;
    }
    const accuracy = Math.round(((totalTyped - mistakes) / totalTyped) * 100);
    accuracyElement.innerText = `${accuracy > 0 ? accuracy : 0}%`;
  }

  function shareResults() {
    const finalWPM = wpmElement.innerText;
    const finalAccuracy = accuracyElement.innerText;
    const text = `I just scored ${finalWPM} WPM with ${finalAccuracy} accuracy on this typing trainer! Can you beat it?`;
    const url = window.location.href; // Uses the current page's URL
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  }

  async function resetTest() {
    clearInterval(timer);
    isTimerStarted = false;
    isFetchingNextQuote = false;
    mistakes = 0;
    quoteInputElement.value = "";
    quoteInputElement.disabled = false;
    shareBtn.disabled = true;
    
    wpmElement.innerText = "0";
    accuracyElement.innerText = "100%";
    timerElement.innerText = `${testDuration}s`;

    loadingSpinner.classList.remove("hidden");
    quoteDisplayElement.innerHTML = ""; // Clear completely before fetching

    await appendNewQuote(); // Start with one quote

    loadingSpinner.classList.add("hidden");
    if (quoteDisplayElement.firstChild) {
      quoteDisplayElement.firstChild.classList.add("current");
    }
    quoteInputElement.focus();
  }

  // --- Event Listeners ---
  quoteInputElement.addEventListener("input", handleInput);
  modeSelector.addEventListener("click", setMode);
  restartMainBtn.addEventListener("click", resetTest);
  const quoteDisplayContainer = document.getElementById('quote-display-container');
  quoteDisplayContainer.addEventListener('click', () => quoteInputElement.focus());
  shareBtn.addEventListener('click', shareResults);

  // --- Initial Load ---
  container.classList.add("mode-medium"); // Default theme
  resetTest();
});

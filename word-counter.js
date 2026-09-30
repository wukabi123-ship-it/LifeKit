// ==============================
// LifeKit - Word Counter
// ==============================


// ==============================
// Get Elements
// ==============================

const textInput =
    document.getElementById("textInput");

const wordCount =
    document.getElementById("wordCount");

const characterCount =
    document.getElementById("characterCount");

const characterNoSpaceCount =
    document.getElementById(
        "characterNoSpaceCount"
    );

const sentenceCount =
    document.getElementById("sentenceCount");

const paragraphCount =
    document.getElementById("paragraphCount");

const clearButton =
    document.getElementById("clearButton");


// ==============================
// Count Text
// ==============================

function updateStatistics() {

    const text =
        textInput.value;


    // --------------------------------
    // Characters
    // --------------------------------

    const characters =
        Array.from(text).length;


    characterCount.textContent =
        characters;


    // --------------------------------
    // Characters without spaces
    // --------------------------------

    const charactersWithoutSpaces =
        Array.from(
            text.replace(/\s/g, "")
        ).length;


    characterNoSpaceCount.textContent =
        charactersWithoutSpaces;


    // --------------------------------
    // Words
    // --------------------------------

    const trimmedText =
        text.trim();


    let words = 0;


    if (trimmedText.length > 0) {

        /*
         * This handles both:
         *
         * English:
         * Hello world
         *
         * Chinese:
         * 你好世界
         *
         * Mixed text:
         * Hello 世界
         */

        const chineseCharacters =
            (
                trimmedText.match(
                    /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g
                ) || []
            ).length;


        const englishWords =
            (
                trimmedText.match(
                    /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g
                ) || []
            ).length;


        words =
            chineseCharacters +
            englishWords;

    }


    wordCount.textContent =
        words;


    // --------------------------------
    // Sentences
    // --------------------------------

    let sentences = 0;


    if (trimmedText.length > 0) {

        const sentenceMatches =
            trimmedText.match(
                /[^.!?。！？\n]+[.!?。！？]+/g
            );


        if (sentenceMatches) {

            sentences =
                sentenceMatches.length;

        } else {

            /*
             * If the user has text but has not
             * typed punctuation yet, count it
             * as one sentence.
             */

            sentences = 1;

        }

    }


    sentenceCount.textContent =
        sentences;


    // --------------------------------
    // Paragraphs
    // --------------------------------

    let paragraphs = 0;


    if (trimmedText.length > 0) {

        paragraphs =
            trimmedText
                .split(/\n\s*\n/)
                .filter(
                    paragraph =>
                        paragraph.trim().length > 0
                )
                .length;

    }


    paragraphCount.textContent =
        paragraphs;

}


// ==============================
// Real-Time Counting
// ==============================

textInput.addEventListener(
    "input",
    updateStatistics
);


// ==============================
// Clear Button
// ==============================

clearButton.addEventListener(
    "click",
    function () {

        textInput.value = "";

        updateStatistics();

        textInput.focus();

    }
);


// ==============================
// Initial Statistics
// ==============================

updateStatistics();

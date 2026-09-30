// ==============================
// LifeKit - Image Resizer 2.1
// ==============================


// ==============================
// Get Elements
// ==============================

const imageInput =
    document.getElementById("imageInput");


const dropZone =
    document.getElementById("dropZone");


const preview =
    document.getElementById("preview");


const originalDimensions =
    document.getElementById("originalDimensions");


const widthInput =
    document.getElementById("width");


const heightInput =
    document.getElementById("height");


const keepRatio =
    document.getElementById("keepRatio");


const resizeButton =
    document.getElementById("resizeButton");


const downloadArea =
    document.getElementById("downloadArea");


// ==============================
// Variables
// ==============================

let selectedFile = null;

let previewURL = null;

let downloadURL = null;

let originalWidth = 0;

let originalHeight = 0;

let changingWidth = false;

let changingHeight = false;


// ==============================
// Select Image
// ==============================

imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];


        if (!file) {

            return;

        }


        handleSelectedFile(file);

    }
);


// ==============================
// Drag & Drop
// ==============================

// Prevent browser from opening
// the dragged file

[
    "dragenter",
    "dragover",
    "dragleave",
    "drop"
].forEach(
    function (eventName) {

        dropZone.addEventListener(
            eventName,
            preventDefaults,
            false
        );

    }
);


// Highlight drop zone

[
    "dragenter",
    "dragover"
].forEach(
    function (eventName) {

        dropZone.addEventListener(
            eventName,
            function () {

                dropZone.classList.add(
                    "drag-over"
                );

            },
            false
        );

    }
);


// Remove highlight

[
    "dragleave",
    "drop"
].forEach(
    function (eventName) {

        dropZone.addEventListener(
            eventName,
            function () {

                dropZone.classList.remove(
                    "drag-over"
                );

            },
            false
        );

    }
);


// Handle dropped file

dropZone.addEventListener(
    "drop",
    function (event) {

        const files =
            event.dataTransfer.files;


        if (
            !files ||
            files.length === 0
        ) {

            return;

        }


        const file =
            files[0];


        handleSelectedFile(file);

    },
    false
);


// ==============================
// Prevent Defaults
// ==============================

function preventDefaults(event) {

    event.preventDefault();

    event.stopPropagation();

}


// ==============================
// Handle Selected File
// ==============================

function handleSelectedFile(file) {

    if (!file.type.startsWith("image/")) {

        alert(
            "Please choose an image file."
        );

        return;

    }


    selectedFile =
        file;


    // Remove old preview URL

    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );

    }


    // Create preview URL

    previewURL =
        URL.createObjectURL(file);


    const image =
        new Image();


    image.onload =
        function () {

            originalWidth =
                image.naturalWidth;


            originalHeight =
                image.naturalHeight;


            // Show original dimensions

            originalDimensions.innerHTML = `

                <strong>
                    Original Dimensions:
                </strong>

                ${originalWidth}
                ×
                ${originalHeight}
                px

            `;


            // Put original dimensions
            // into inputs

            widthInput.value =
                originalWidth;


            heightInput.value =
                originalHeight;


            // Show preview

            preview.src =
                previewURL;


            preview.style.display =
                "block";


            // Remove previous result

            if (downloadURL) {

                URL.revokeObjectURL(
                    downloadURL
                );

                downloadURL =
                    null;

            }


            downloadArea.innerHTML =
                "";

        };


    image.onerror =
        function () {

            alert(
                "Unable to read this image."
            );

        };


    image.src =
        previewURL;

}


// ==============================
// Width Input
// ==============================

widthInput.addEventListener(
    "input",
    function () {

        if (!keepRatio.checked) {

            return;

        }


        if (changingHeight) {

            return;

        }


        const newWidth =
            Number(
                widthInput.value
            );


        if (
            !newWidth ||
            newWidth <= 0
        ) {

            return;

        }


        changingWidth =
            true;


        const ratio =
            originalHeight /
            originalWidth;


        const newHeight =
            Math.round(
                newWidth *
                ratio
            );


        heightInput.value =
            newHeight;


        changingWidth =
            false;

    }
);


// ==============================
// Height Input
// ==============================

heightInput.addEventListener(
    "input",
    function () {

        if (!keepRatio.checked) {

            return;

        }


        if (changingWidth) {

            return;

        }


        const newHeight =
            Number(
                heightInput.value
            );


        if (
            !newHeight ||
            newHeight <= 0
        ) {

            return;

        }


        changingHeight =
            true;


        const ratio =
            originalWidth /
            originalHeight;


        const newWidth =
            Math.round(
                newHeight *
                ratio
            );


        widthInput.value =
            newWidth;


        changingHeight =
            false;

    }
);


// ==============================
// Resize Button
// ==============================

resizeButton.addEventListener(
    "click",
    function () {

        if (!selectedFile) {

            alert(
                "Please choose an image first!"
            );

            return;

        }


        const newWidth =
            Number(
                widthInput.value
            );


        const newHeight =
            Number(
                heightInput.value
            );


        if (
            !newWidth ||
            !newHeight ||
            newWidth <= 0 ||
            newHeight <= 0
        ) {

            alert(
                "Please enter a valid width and height."
            );

            return;

        }


        resizeButton.disabled =
            true;


        resizeButton.textContent =
            "Resizing...";


        const image =
            new Image();


        image.onload =
            function () {

                const canvas =
                    document.createElement(
                        "canvas"
                    );


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                if (!ctx) {

                    alert(
                        "Your browser does not support image resizing."
                    );


                    resizeButton.disabled =
                        false;


                    resizeButton.textContent =
                        "Resize Image";


                    return;

                }


                // Set new dimensions

                canvas.width =
                    newWidth;


                canvas.height =
                    newHeight;


                // Draw resized image

                ctx.drawImage(
                    image,
                    0,
                    0,
                    newWidth,
                    newHeight
                );


                // Convert to JPEG

                canvas.toBlob(
                    function (blob) {

                        if (!blob) {

                            alert(
                                "Resize failed. Please try another image."
                            );


                            resizeButton.disabled =
                                false;


                            resizeButton.textContent =
                                "Resize Image";


                            return;

                        }


                        // Remove old download URL

                        if (downloadURL) {

                            URL.revokeObjectURL(
                                downloadURL
                            );

                        }


                        // Create download URL

                        downloadURL =
                            URL.createObjectURL(
                                blob
                            );


                        // Show result

                        downloadArea.innerHTML = `

                            <div class="compression-result">

                                <p>

                                    <strong>
                                        Original:
                                    </strong>

                                    ${originalWidth}
                                    ×
                                    ${originalHeight}
                                    px

                                </p>


                                <p>

                                    <strong>
                                        New Size:
                                    </strong>

                                    ${newWidth}
                                    ×
                                    ${newHeight}
                                    px

                                </p>


                                <p>

                                    <strong>
                                        File Size:
                                    </strong>

                                    ${formatFileSize(
                                        blob.size
                                    )}

                                </p>


                                <br>


                                <a
                                    href="${downloadURL}"
                                    download="lifekit-resized.jpg"
                                >

                                    <button
                                        type="button"
                                    >
                                        Download Resized Image
                                    </button>

                                </a>


                            </div>

                        `;


                        resizeButton.disabled =
                            false;


                        resizeButton.textContent =
                            "Resize Image";

                    },
                    "image/jpeg",
                    0.92
                );

            };


        image.onerror =
            function () {

                alert(
                    "Unable to read this image."
                );


                resizeButton.disabled =
                    false;


                resizeButton.textContent =
                    "Resize Image";

            };


        image.src =
            URL.createObjectURL(
                selectedFile
            );

    }
);


// ==============================
// Format File Size
// ==============================

function formatFileSize(bytes) {

    if (
        bytes <
        1024
    ) {

        return `${bytes} B`;

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(2)} KB`;

    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(2)} MB`;

}
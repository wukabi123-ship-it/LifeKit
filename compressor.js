// ==============================
// LifeKit - Image Compressor 2.1
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


const compressButton =
    document.getElementById("compressButton");


const resetButton =
    document.getElementById("resetButton");


const downloadArea =
    document.getElementById("downloadArea");


const compressionMode =
    document.getElementById("compressionMode");


const qualityMode =
    document.getElementById("qualityMode");


const targetMode =
    document.getElementById("targetMode");


const quality =
    document.getElementById("quality");


const qualityValue =
    document.getElementById("qualityValue");


const targetSize =
    document.getElementById("targetSize");


const targetUnit =
    document.getElementById("targetUnit");


const originalSize =
    document.getElementById("originalSize");


// ==============================
// Variables
// ==============================

let selectedFile = null;

let previewURL = null;

let downloadURL = null;


// ==============================
// Compression Mode
// ==============================

compressionMode.addEventListener(
    "change",
    function () {

        if (
            compressionMode.value ===
            "quality"
        ) {

            qualityMode.style.display =
                "block";

            targetMode.style.display =
                "none";

        } else {

            qualityMode.style.display =
                "none";

            targetMode.style.display =
                "block";

        }

    }
);


// ==============================
// Quality Slider
// ==============================

quality.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            quality.value;

    }
);


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


        if (!files || files.length === 0) {

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


    preview.src =
        previewURL;


    preview.style.display =
        "block";


    // Show original file size

    originalSize.innerHTML = `

        <strong>
            Original Size:
        </strong>

        ${formatFileSize(file.size)}

        (
        ${file.size.toLocaleString()}
        bytes
        )

    `;


    // Remove old result

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

        downloadURL =
            null;

    }


    downloadArea.innerHTML =
        "";


    // Show buttons

    compressButton.style.display =
        "inline-block";


    resetButton.style.display =
        "inline-block";

}


// ==============================
// Compress Button
// ==============================

compressButton.addEventListener(
    "click",
    async function () {

        if (!selectedFile) {

            alert(
                "Please choose an image first."
            );

            return;

        }


        compressButton.disabled =
            true;


        compressButton.textContent =
            "Compressing...";


        try {

            if (
                compressionMode.value ===
                "quality"
            ) {

                await compressByQuality();

            } else {

                await compressByTargetSize();

            }

        } catch (error) {

            console.error(error);


            alert(
                "Compression failed. Please try another image."
            );

        }


        compressButton.disabled =
            false;


        compressButton.textContent =
            "Compress Image";

    }
);


// ==============================
// Compress By Quality
// ==============================

function compressByQuality() {

    return new Promise(
        function (resolve, reject) {

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

                        reject(
                            new Error(
                                "Canvas is not supported."
                            )
                        );

                        return;

                    }


                    canvas.width =
                        image.naturalWidth;


                    canvas.height =
                        image.naturalHeight;


                    ctx.drawImage(
                        image,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                    const compressionQuality =
                        Number(
                            quality.value
                        ) / 100;


                    canvas.toBlob(
                        function (blob) {

                            if (!blob) {

                                reject(
                                    new Error(
                                        "Compression failed."
                                    )
                                );

                                return;

                            }


                            showCompressionResult(
                                blob
                            );


                            resolve();

                        },
                        "image/jpeg",
                        compressionQuality
                    );

                };


            image.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to read image."
                        )
                    );

                };


            image.src =
                URL.createObjectURL(
                    selectedFile
                );

        }
    );

}


// ==============================
// Compress By Target Size
// ==============================

async function compressByTargetSize() {

    const targetValue =
        Number(
            targetSize.value
        );


    if (
        !targetValue ||
        targetValue <= 0
    ) {

        alert(
            "Please enter a valid target size."
        );

        return;

    }


    let targetBytes;


    if (
        targetUnit.value ===
        "KB"
    ) {

        targetBytes =
            targetValue *
            1024;

    } else {

        targetBytes =
            targetValue *
            1024 *
            1024;

    }


    if (
        targetBytes >=
        selectedFile.size
    ) {

        alert(
            "The target size must be smaller than the original image."
        );

        return;

    }


    const image =
        await loadImage(
            selectedFile
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {

        throw new Error(
            "Canvas is not supported."
        );

    }


    canvas.width =
        image.naturalWidth;


    canvas.height =
        image.naturalHeight;


    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    let bestBlob =
        null;


    let bestDifference =
        Infinity;


    let low =
        0.01;


    let high =
        1;


    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const currentQuality =
            (low + high) / 2;


        const blob =
            await canvasToBlob(
                canvas,
                currentQuality
            );


        const difference =
            Math.abs(
                blob.size -
                targetBytes
            );


        if (
            difference <
            bestDifference
        ) {

            bestDifference =
                difference;


            bestBlob =
                blob;

        }


        if (
            blob.size >
            targetBytes
        ) {

            high =
                currentQuality;

        } else {

            low =
                currentQuality;

        }

    }


    if (!bestBlob) {

        throw new Error(
            "Unable to create compressed image."
        );

    }


    showCompressionResult(
        bestBlob,
        targetBytes
    );

}


// ==============================
// Canvas To Blob
// ==============================

function canvasToBlob(
    canvas,
    qualityValue
) {

    return new Promise(
        function (resolve, reject) {

            canvas.toBlob(
                function (blob) {

                    if (!blob) {

                        reject(
                            new Error(
                                "Unable to create image."
                            )
                        );

                        return;

                    }


                    resolve(blob);

                },
                "image/jpeg",
                qualityValue
            );

        }
    );

}


// ==============================
// Load Image
// ==============================

function loadImage(file) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();


            const objectURL =
                URL.createObjectURL(
                    file
                );


            image.onload =
                function () {

                    URL.revokeObjectURL(
                        objectURL
                    );


                    resolve(image);

                };


            image.onerror =
                function () {

                    URL.revokeObjectURL(
                        objectURL
                    );


                    reject(
                        new Error(
                            "Unable to load image."
                        )
                    );

                };


            image.src =
                objectURL;

        }
    );

}


// ==============================
// Show Compression Result
// ==============================

function showCompressionResult(
    blob,
    targetBytes = null
) {

    const originalFileSize =
        selectedFile.size;


    const compressedFileSize =
        blob.size;


    const savedBytes =
        originalFileSize -
        compressedFileSize;


    const savedPercent =
        originalFileSize > 0
            ? (
                savedBytes /
                originalFileSize
            ) * 100
            : 0;


    // Remove old download URL

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

    }


    // Create new download URL

    downloadURL =
        URL.createObjectURL(
            blob
        );


    let targetMessage =
        "";


    if (
        targetBytes !== null
    ) {

        const difference =
            compressedFileSize -
            targetBytes;


        const absoluteDifference =
            Math.abs(
                difference
            );


        targetMessage = `

            <p>

                <strong>
                    Target:
                </strong>

                ${formatFileSize(
                    targetBytes
                )}

            </p>


            <p>

                <strong>
                    Difference:
                </strong>

                ${formatFileSize(
                    absoluteDifference
                )}

                ${
                    difference > 0
                        ? "over target"
                        : "under target"
                }

            </p>

        `;

    }


    downloadArea.innerHTML = `

        <div class="compression-result">


            <h3>
                Compression Complete
            </h3>


            <p>

                <strong>
                    Original:
                </strong>

                ${formatFileSize(
                    originalFileSize
                )}

                (
                ${originalFileSize.toLocaleString()}
                bytes
                )

            </p>


            <p>

                <strong>
                    Compressed:
                </strong>

                ${formatFileSize(
                    compressedFileSize
                )}

                (
                ${compressedFileSize.toLocaleString()}
                bytes
                )

            </p>


            <p>

                <strong>
                    Saved:
                </strong>

                ${formatFileSize(
                    Math.max(
                        savedBytes,
                        0
                    )
                )}

                (${savedPercent.toFixed(1)}%)

            </p>


            ${targetMessage}


            <br>


            <a
                href="${downloadURL}"
                download="lifekit-compressed.jpg"
            >

                <button
                    type="button"
                >
                    Download Compressed Image
                </button>

            </a>


        </div>

    `;

}


// ==============================
// Reset
// ==============================

resetButton.addEventListener(
    "click",
    function () {

        resetCompressor();

    }
);


// ==============================
// Reset Compressor
// ==============================

function resetCompressor() {

    selectedFile =
        null;


    imageInput.value =
        "";


    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );

        previewURL =
            null;

    }


    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

        downloadURL =
            null;

    }


    preview.src =
        "";


    preview.style.display =
        "none";


    originalSize.innerHTML = `

        <strong>
            Original Size:
        </strong>

        —

    `;


    downloadArea.innerHTML =
        "";


    resetButton.style.display =
        "none";


    dropZone.classList.remove(
        "drag-over"
    );

}


// ==============================
// Format File Size
// ==============================

function formatFileSize(bytes) {

    if (
        bytes < 1024
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

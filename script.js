// ==============================
// LifeKit - Main Navigation
// ==============================

function openTool() {
    window.location.href = "compressor.html";
}

function openResizer() {
    window.location.href = "resizer.html";
}

function openWordCounter() {
    window.location.href = "word-counter.html";
}

function openCalculator() {
    window.location.href = "calculator.html";
}


// ==============================
// Compressor Elements
// ==============================

const imageInput =
    document.getElementById("imageInput");

const preview =
    document.getElementById("preview");

const compressButton =
    document.getElementById("compressButton");

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
// Compressor Variables
// ==============================

let selectedFile = null;
let previewURL = null;
let downloadURL = null;


// ==============================
// Compression Mode
// ==============================

if (compressionMode) {

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

}


// ==============================
// Quality Slider
// ==============================

if (quality) {

    quality.addEventListener(
        "input",
        function () {

            qualityValue.textContent =
                quality.value;

        }
    );

}


// ==============================
// Select Image
// ==============================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files[0];

            if (!file) {
                return;
            }


            selectedFile =
                file;


            if (previewURL) {

                URL.revokeObjectURL(
                    previewURL
                );

            }


            previewURL =
                URL.createObjectURL(file);


            preview.src =
                previewURL;

            preview.style.display =
                "block";


            if (originalSize) {

                originalSize.innerHTML = `
                    <strong>Original Size:</strong>
                    ${formatFileSize(file.size)}
                    (${file.size.toLocaleString()} bytes)
                `;

            }


            if (downloadURL) {

                URL.revokeObjectURL(
                    downloadURL
                );

                downloadURL = null;

            }


            if (downloadArea) {

                downloadArea.innerHTML =
                    "";

            }

        }
    );

}


// ==============================
// Compress Button
// ==============================

if (compressButton) {

    compressButton.addEventListener(
        "click",
        async function () {

            if (!selectedFile) {

                alert(
                    "Please choose an image first!"
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

}


// ==============================
// Quality Compression
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
// Target Size Compression
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
            targetValue * 1024;

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
            "The target size is larger than or equal to the original image."
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


    let bestBlob = null;

    let bestDifference =
        Infinity;


    let low = 0.01;

    let high = 1;


    for (
        let i = 0;
        i < 10;
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
// Display Compression Result
// ==============================

function showCompressionResult(
    blob,
    targetBytes = null
) {

    const originalFileSize =
        selectedFile.size;

    const compressedFileSize =
        blob.size;


    const savedPercent =
        originalFileSize > 0
            ? (
                (
                    originalFileSize -
                    compressedFileSize
                ) /
                originalFileSize
            ) * 100
            : 0;


    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

    }


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
                    Target size:
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

            <p>
                <strong>
                    Original size:
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
                    Compressed size:
                </strong>

                ${formatFileSize(
                    compressedFileSize
                )}

                (
                ${compressedFileSize.toLocaleString()}
                bytes
                )
            </p>


            ${targetMessage}


            <p>
                <strong>
                    Saved:
                </strong>

                ${savedPercent.toFixed(1)}%
            </p>


            <br>


            <a
                href="${downloadURL}"
                download="lifekit-compressed.jpg"
            >

                <button type="button">
                    Download Compressed Image
                </button>

            </a>

        </div>

    `;

}


// ==============================
// Format File Size
// ==============================

function formatFileSize(bytes) {

    if (bytes < 1024) {

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

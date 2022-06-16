// const Options = {
//     maxSizeMB: number,            // (default: Number.POSITIVE_INFINITY)
//     maxWidthOrHeight: number,     // compressedFile will scale down by ratio to a point that width or height is smaller than maxWidthOrHeight (default: undefined)
//     // but, automatically reduce the size to smaller than the maximum Canvas size supported by each browser.
//     // Please check the Caveat part for details.
//     onProgress: Function,         // optional, a function takes one progress argument (percentage from 0 to 100)
//     useWebWorker: boolean,        // optional, use multi-thread web worker, fallback to run in main-thread (default: true)

//     signal: AbortSignal,          // options, to abort / cancel the compression

//     // following options are for advanced users
//     maxIteration: number,         // optional, max number of iteration to compress the image (default: 10)
//     exifOrientation: number,      // optional, see https://stackoverflow.com/a/32490603/10395024
//     fileType: string,             // optional, fileType override e.g., 'image/jpeg', 'image/png' (default: file.type)
//     initialQuality: number,       // optional, initial quality value between 0 and 1 (default: 1)
//     alwaysKeepResolution: boolean // optional, only reduce quality, always keep width and height (default: false)
// }

const progress = document.getElementById('progress');
progress.style.visibility = 'hidden';
const progressBar = document.getElementById('progressBar');
// progressBar.style.visibilty = 'hidden';

function imageGallery() {

    var controller = new AbortController();
    var state = 0;

    return {

        images: [],
        compressedImages: [],
        compressionState: 0,
        // onProgress: onProgress,
        compressOptions: {
            maxSizeMB: 1,            // (default: Number.POSITIVE_INFINITY)
            maxWidthOrHeight: 1080,
            signal: controller.signal,
        },
        loadImages: function (e) {
            let files = e.target.files;
            let images = [];
            for (let i = 0; i < files.length; i++) {
                images.push(
                    {
                        id: i,
                        name: files[i].name,
                        file: files[i],
                    }
                )
            }
            this.images = images;
            progress.style.visibility = 'visible';
        },

        compress: function () {  
            // progress.style.visibility = 'visible';
            let compressedImages = [];
            let progress = 0;
            let step = 100 / this.images.length;
            this.images.forEach((image) => {
                this.compressesionState = 1;
                imageCompression(image.file, this.compressOptions)
                    .then(function (compressedFile) {
                        compressedImages.push({
                            img: compressedFile
                        });
                        progress += step;
                        progressBar.style.width = progress + '%';
                    })
                    .catch(function (error) {
                        console.log(error.message); // output: I just want to stop
                    });
            });
            this.compressedImages = compressedImages;
        },
        download: function () {
            let zip = new JSZip();
            for (let i = 0; i < this.compressedImages.length; i++) {
                zip.file(this.images[i].name, this.compressedImages[i].img);
            }
            zip.generateAsync({ type: "blob" })
                .then(function (blob) {
                    saveAs(blob, "images.zip");
                }
                );
        },
        clear: function () {
            this.images = [];
            this.compressedImages = [];
            this.compressionState = 0;
            progressBar.style.width = '0%';
            progress.style.visibility = 'hidden';
        },
        maxSizeMBSetter: function (e) {
            this.compressOptions.maxSizeMB = e.target.value;
        },
        maxWidthOrHeightSetter: function (e) {
            this.compressOptions.maxWidthOrHeight = e.target.value;
        }

    };
}
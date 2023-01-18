function previewImage() {
    var fileInput = document.getElementById("fileInput");
    var previewImage = document.getElementById("previewImage");

    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onloadend = function () {
        previewImage.src = reader.result;
        previewImage.style.display = "block";
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        previewImage.src = "";
    }
}
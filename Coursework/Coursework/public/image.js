function ready() {
    var url = document.URL.split('/book/')
    var infoemation = get_information(url[1])
} 


function get_information(book_id, callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/take_book_cover/" + book_id; // target action
    xhr.open("GET", url);
    xhr.send();
   
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            
            load_image(myArr);
        }
    };


}

function load_image(arr) {
    if (arr != 'no_image') {
        document.getElementById('book_image').src = 'data:image/jpeg;base64,' + arr;
        document.getElementById('book_image').style.height = '400px';
        document.getElementById('book_image').style.width = '350px';
    }
    else {
        document.getElementById('book_image').src = '/images/no-image-icon.png';
        document.getElementById('book_image').style.height = '400px';
        document.getElementById('book_image').style.width = '350px';
    }
}
document.addEventListener("DOMContentLoaded", ready);
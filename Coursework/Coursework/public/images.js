

function ready() {
    var infoemation = get_information()
}

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

function get_information(callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/take_books"; // target action
  
    
    xhr.open("GET", url);
    xhr.send();

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            
            myFunction(myArr);
        }
    };
   

}

function myFunction(arr) {
    for (var key in arr) {
        
        if (arr[key] != 'no_image')
        {
            if (document.getElementById('image_book_' + key) != null) {
                document.getElementById('image_book_' + key).src = 'data:image/jpeg;base64,' + arr[key];
                document.getElementById('image_book_' + key).style.height = '190px';
                document.getElementById('image_book_' + key).style.width = '190px';
            }
            
        }

        else {
            if (document.getElementById('image_book_' + key) != null) {
                document.getElementById('image_book_' + key).src = '/images/no-image-icon.png';
                document.getElementById('image_book_' + key).style.height = '190px';
                document.getElementById('image_book_' + key).style.width = '190px';
            }
           
        }
    }
    

    

}
document.addEventListener("DOMContentLoaded", ready);
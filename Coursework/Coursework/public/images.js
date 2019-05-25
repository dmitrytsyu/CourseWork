

function ready() {
    //var images = get_all_books();
    
    var infoemation = get_information()
    //alert(infoemation)
    //var _img = document.getElementById('image_book_1');
    //var newImg = new Image;
    //newImg.onload = function () {
    //    _img.src = this.src;
    //}
    //newImg.src = 'data:image/jpeg;base64,' + hexToBase64(books[0]['cover']);
    
} //'http://www.hyperlinkcode.com/images/sample-image.jpg'

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
    

    alert(arr.length)
    for (var i = 1; i < arr.length; i++) {
        //alert('image_book_' + i)
        //var _img = 
        //alert(_img)
        //var newimg = new Image;
        //newimg.onload = function () {
        //    _img.src = this.src;
            //}
        document.getElementById('image_book_' + i).src = 'data:image/jpeg;base64,' + arr[i];
        document.getElementById('image_book_' + i).style.height = '200px';
        document.getElementById('image_book_' + i).style.width = '200px';
    }
    
    //var image = new Buffer(arr[1]['cover']);
    //var file = hexToBase64(arr[1]['cover'].toString());
    //alert(arr[1]['cover'].toString())
   
    
    
   // //var getImageResult = addon.getlatestimage();
   // //var b64encoded = btoa(String.fromCharCode.apply(null, getImageResult.imagebuffer));
   // //var datajpg = "data:image/jpg;base64," + b64encoded;
   // //document.getElementById("myimage").src = datajpg;
}
//function get_all_books() {

//    var sql_text = `select Книга.название book_name, код_книги id, цена price, обложка cover 
//					from Книга order by [количество_просмотров_книги] desc`;
//    //var sql_text = `select * from Книга`
//    var connection = new sql.ConnectionPool({
//        database: 'Last_db',
//        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
//        driver: 'msnodesqlv8',
//        options: { trustedConnection: true }
//    });

//    await connection.connect();

//    var q_req = new sql.Request(connection);
//    var arr_tasks = await q_req.query(sql_text);

//    return arr_tasks.recordset;
//}



document.addEventListener("DOMContentLoaded", ready);
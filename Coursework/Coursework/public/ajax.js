function add_book_to_cart_click(bookId) {
    //var priority = document.getElementById('select_priority_' + taskid).value;
    post_add_book(bookId, 1);
    
}



function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

function update_date_of_pay(cart_id) {
    post_update_date_of_pay(cart_id);
}

function show_close_details(details_cart) {
    var style = document.getElementById('details_' + details_cart).style.display;
    if (style == 'none') {
        document.getElementById('details_' + details_cart).style.display = 'block';
    }
    else {
        document.getElementById('details_' + details_cart).style.display = 'none';
    }
}

function select_input_genre(value) {
    if (value == document.getElementById('new_genre').value) {
        document.getElementById('input_genre_form').style.display = 'block';
    }
    else {
        document.getElementById('input_genre_form').style.display = 'none';
    }
}

function select_input_subgenre(value) {
    
    if (value == document.getElementById('new_subgenre').value) {
        document.getElementById('input_subgenre-form').style.display = 'block';
    }
    else {
        document.getElementById('input_subgenre-form').style.display = 'none';
    } 
}

function appear_dissapear_details(value) {
    if (document.getElementById('details' + value).style.display == 'none') {
        document.getElementById('details' + value).style.display = 'block';
    }
    else {
        document.getElementById('details' + value).style.display = 'block';
    }
}

function delete_book_from_cart(bookId) {
    post_delete_book(bookId);
}

function book_to_cart_change(bookId, price) {
    var value = document.getElementById('book_' + bookId).value;
    document.getElementById('result_' + bookId).value = document.getElementById('book_' + bookId).value * price;
    post_update_book_value(bookId, value);
    total = document.getElementsByClassName('result');
    var sum = 0;
    for (var i = 0; i < total.length; i++) {
        sum += parseInt( total[i].value);
    }
    document.getElementById('total').innerHTML = sum;
    
}

function join_to_cart(cart_id) {
    alert('Кнопка работает- измени параметр')
    //post_join_to_cart(cart_id);
}

function join_to_cart_courier(cart_id) {
    alert('Кнопка работает- измени параметр')
    //post_join_to_cart(cart_id);
}


function post_add_book(bookId, increment, callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/cart/add_to_cart/" + bookId; // target action
    xhr.open("POST", url); // starting the request
    xhr.setRequestHeader("content-type", "application/json");


    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var obj = xhr.responseText;
            if (obj == null || obj == "") {
                callback(null);
            }
            else {
                try {
                    var result = eval("(" + obj + ")");
                    callback(result);
                }
                catch (EX) {
                    callback(null);
                }
            }
        }

    };

    xhr.send(JSON.stringify({  // convert object to string and send it to the server
        increment: increment
    }));
}

function post_update_book_value(bookId, value, callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/cart/update_book_value/" + bookId; // target action
    xhr.open("POST", url); // starting the request
    xhr.setRequestHeader("content-type", "application/json");


    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var obj = xhr.responseText;
            if (obj == null || obj == "") {
                callback(null);
            }
            else {
                try {
                    var result = eval("(" + obj + ")");
                    callback(result);
                }
                catch (EX) {
                    callback(null);
                }
            }
        }

    };

    xhr.send(JSON.stringify({  // convert object to string and send it to the server
        value: value
    }));
}



function post_delete_book(bookId, callback) {
    
    var xhr = new XMLHttpRequest(); // query object
    var url = "/cart/delete/" + bookId;
    xhr.open("get", url, true); // starting the request
    xhr.send();
    xhr.setRequestHeader("content-type", "application/json");
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var obj = xhr.responseText;
            if (obj == null || obj == "") {
                callback(null);
            }
            else {
                try {
                    var result = eval("(" + obj + ")");
                    callback(result);
                }
                catch (EX) {
                    callback(null);
                }
            }
        }
    };
}
// не нужно
function post_update_cart_status(callback) {
   
    var xhr = new XMLHttpRequest(); // query object
    var url = "/cart/order"; // target action
    xhr.open("POST", url, true); // starting the request
   
    xhr.setRequestHeader("content-type", "application/json");


    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var obj = xhr.responseText;
            if (obj == null || obj == "") {
                callback(null);
            }
            else {
                try {
                    var result = eval("(" + obj + ")");
                    callback(result);
                }
                catch (EX) {
                    callback(null);
                }
            }
        }
    };
}


function post_update_date_of_pay(cart_id, callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/pay_pay/" + cart_id; // target action
    xhr.open("get", url, true); // starting the request
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(null);
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var obj = xhr.responseText;
            if (obj == null || obj == "") {
                callback(null);
            }
            else {
                try {
                    var result = eval("(" + obj + ")");
                    callback(result);
                }
                catch (EX) {
                    callback(null);
                }
            }
        }
    };
}

function go_to_genre(genre_id) {
    post_get_books_by_genre(genre_id);
}

function post_join_to_cart(cart_id, callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/join_to_user/" + cart_id; // target action
    xhr.open("POST", url, true); // starting the request
    xhr.setRequestHeader("content-type", "application/json");


    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var obj = xhr.responseText;
            if (obj == null || obj == "") {
                callback(null);
            }
            else {
                try {
                    var result = eval("(" + obj + ")");
                    callback(result);
                }
                catch (EX) {
                    callback(null);
                }
            }
        }
    };
}

function post_get_books_by_genre(genre_id, callback) {
    var xhr = new XMLHttpRequest(); 
    var url = "/take_all_book_from_genre/" + genre_id;
    xhr.open("get", url);
    xhr.send()
    

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var obj = xhr.responseText;
            if (obj == null || obj == "") {
                callback(null);
            }
            else {
                try {
                    var result = eval("(" + obj + ")");
                    if (callback) {
                        callback(result);
                    }
                    
                }
                catch (EX) {
                    if (callback) {
                        callback(null);
                    }
                }
            }
        }
    };

  

} 




function display_position(obj) {
    var selected_state = obj.value;
    alert(selected_state);
    if (selected_state == 'customer') {
        document.getElementById('position').style.display = 'none';
    }

    else if (selected_state == 'courier') {
        document.getElementById('position').style.display = 'none';
    }
    else if (selected_state == 'vendor') {
        document.getElementById('position').style.display = 'block';
    }
    
}


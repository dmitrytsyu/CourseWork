
function add_book_to_cart_click(bookId) {
    //var priority = document.getElementById('select_priority_' + taskid).value;
    post_add_book(bookId, 1);
    
}
function update_date_of_pay(cart_id) {
    post_update_date_of_pay(cart_id);
}

function show_details(details_cart) {
    document.getElementById('details' + details_cart).style.display = 'block';
}

function close_details(details_cart) {
    document.getElementById('details' + details_cart).style.display = 'none';
    alert(document.getElementById('details').style.display);
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

function delete_book_from_cart(bookId) {
    var value = document.getElementById('book_' + bookId).value;
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
    var url = "/cart/delete_personal_book/" + bookId; // target action
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
}
// не нужно
function post_update_cart_status(callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/cart/order"; // target action
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
}


function post_update_date_of_pay(cart_id, callback) {
    var xhr = new XMLHttpRequest(); // query object
    var url = "/pay/" + cart_id; // target action
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
}



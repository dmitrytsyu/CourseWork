'use strict';
var express = require('express');
var router = express.Router();
var sql = require('mssql/msnodesqlv8');
var multiparty = require('multiparty');
global.personal_id;
var personal_id = 1;
/* GET home page. */


router.get('/', async function (req, res) {
    var all_genres = await get_all_genres();
    var all_books = await get_all_books();
   
    
    //console.log(all_books[0]['cover'])
    /*for (var a = 0; a < all_books.length; a++) {
        var originalBase64ImageStr = hexToBase64()
        //var originalBase64ImageStr = new Buffer(all_books[a]['cover'].Image).toString('utf8');
        var decodedImage = new Buffer(originalBase64ImageStr, 'base64');
    } */
    
    res.render('Main',  {
        genres: all_genres,
        books: all_books,
        id: personal_id
    });
   
});

router.post('/', async function (req, res) {
    personal_id = 1;
    var all_genres = await get_all_genres();
    var all_books = await get_all_books();
    res.render('Main', {
        genres: all_genres,
        books: all_books,
        id: personal_id
    });
});

router.get('/authorization', async function (req, res) {
    res.render('authorization', {
        id: personal_id
    });
});

router.post('/authorization', async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (!err) {

            var first_name = (fields.first_name[0]).trim();
            var last_name = (fields.last_name[0]).trim();
            var email = (fields.email[0]).trim();
            
            if (first_name.length > 0 && first_name &&
                last_name.length > 0 && last_name &&
                email.length > 0 && email) {
                var id = await find_user_id(last_name, first_name, email);
               
                if (id[0] === undefined) {
                    personal_id = 1
                }
                else {
                    personal_id = id[0]['id'];
                }

                res.redirect('/')
            } else {
                res.redirect('/')
            }
        } else {
            res.redirect('/')
            console.log('Не удалось зарегистрироваться')
        }
    });
});

router.get('/cart', async function (req, res) {
    var data_books = await get_all_user_book(personal_id);
    var total = await get_result(personal_id);
    if (data_books[0] === undefined || total[0] === undefined) {
        res.render('cart', {
            books: [],
            result: 0,
            id: personal_id
        });
    }
    else {
        res.render('cart', {
            books: data_books,
            result: total[0]['result'],
            id: personal_id
        });
    }
});


router.post('/cart/add_to_cart/:book_id', async function (req, res) {
    // По-хорошему сделать проверку на вхождение в id

    var bookId = req.params.book_id;
    var increment = req.body.increment;

    if (increment == 1) {
        if (personal_id != 1) {
            await add_book_to_cart(bookId, personal_id, increment)
            res.json({
                success: true
            });
        } else {
            res.json({
                success: false
            });
        }
    }
    else {
        var form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (!err) {
                var increment = fields.increment[0];
                await add_book_to_cart(bookId, personal_id, increment)
                res.json({
                    success: true
                });
            }
            else {
                res.json({
                    success: false
                });
            }
        });
    }
});


router.post('/cart/update_book_value/:book_id', async function (req, res) {
    // По-хорошему сделать проверку на вхождение в id
    var bookId = req.params.book_id;
    var value = req.body.value;
    
    if (personal_id != 1) {
        if (value > 1) {
            await update_book_value(bookId, personal_id, value)
            
            res.json({
                success: true
            });
        
        } else {
            res.redirect('/');
        }
    }
    else {
        res.json({
            success: false
        }); 
    }
});

router.post('/cart/delete_personal_book/:book_id', async function (req, res) {
    
    var bookId = req.params.book_id;

    if (bookId > 1 && personal_id != 1) {
        await delete_personal_book(bookId, personal_id)
        res.json({
            success: true
        });

    } else {
        res.redirect('/');
    }
    
    
});

router.post('/cart/order', async function (req, res) {
    if (personal_id != 1) {
        await update_cart_status(personal_id)
        res.json({
            success: true
        });
    }
    else {
        res.json({
            success: false
        });
    }
});

router.get('/orders', async function (req, res) {
    var cards = [{ cart_id: 0 }];
    console.log(cards[0])
    if (personal_id != 1) {
        var orders = await get_all_personal_orders(personal_id);
        
        if (orders[0] === undefined) {
            res.render('orders', {
                id: personal_id,
                orders: [],
                order_id: 0
            });
        }
        else {
            var order_id = orders[0]['id_cart'];
            console.log(order_id)

            res.render('orders', {
                id: personal_id,
                orders: orders,
                order_id: order_id
            });
        }
        
    }
    else {
        res.render('orders', {
            id: personal_id,
            orders: [],
            order_id: 0
        });
    }
    
});



router.get('/order', async function (req, res) {
    res.render('order', {
        id: personal_id
    });
});

router.post('/order/new', async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (!err) {

            var full_name = fields.full_name[0];
            var adress = fields.adress[0];
            var comments = fields.comments[0];
            var int_type = 0;
            var email = fields.email[0];
            var phone = fields.phone[0];
            var type = fields.type[0];
            var price = fields.price[0];
            if (type == 'delivery') {
                int_type = 1
            }

            if (full_name.length > 0 && full_name &&
                adress.length > 0 && adress &&
                comments.length > 0 && comments &&
                email.length > 0 && email &&
                phone.length > 0 && phone 
            ) {
                var last_cart = await get_last_cart_of_user(personal_id);
                await update_cart_status(personal_id);
                await add_order(full_name, email, phone, int_type, comments, personal_id, price);
                // возможна ошибка
                res.render('/pay/' + last_cart);
            } else {
                res.redirect('/');
            }

        } else {
            res.redirect('/');

        }
    });
});

router.get('/registration', async function (req, res) {
    var all_positions = await get_all_positions();
    res.render('registration', {
        positions: all_positions,
        id: personal_id
    });
});

router.get('/book/:bookId', async function (req, res) {
    var bookId = req.params.bookId;
    var my_book = await get_book(bookId);
    
    update_visit(bookId);
    res.render('book', {
        book: my_book,
        id: personal_id
    });
});





router.post('/registration', async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (!err) {

            var first_name = fields.first_name[0];
            var last_name = fields.last_name[0];
            var patronymic = fields.patronymic[0];
            var int_type = 0;
            var email = fields.email[0];
            var phone = fields.phone[0];
            var type = fields.type[0];
            var position = fields.position[0];

            if (type == 'vendor') {
                int_type = 1
            }
            else if (type == 'customer') {
                int_type = 3
            }
            else if (type == 'courier') {
                int_type = 2
            }

            if (first_name.length > 0 && first_name &&
                last_name.length > 0 && last_name &&
                patronymic.length > 0 && patronymic &&
                email.length > 0 && email &&
                phone.length > 0 && phone &&
                int_type != 0
            ) {
                await add_user(first_name, last_name, patronymic, int_type, email, phone, position);
                res.redirect('/authorization');
            } else {
                res.redirect('/registration');
            }

        } else {
            res.redirect('/');

        }
    });
});

router.get('/pay/:cart_id', async function (req, res) {
    if (personal_id != 1) {
        var cart_id = req.params.cart_id;
        var total = await get_result_by_cart(personal_id, cart_id)
        res.render('pay', {
            id: personal_id,
            cart_id: cart_id,
            result: total
        });
    }
    else {
        res.redirect('/')
    }
    
});

router.get('/pay/:cart_id', async function (req, res) {
    
    var date = new Date();
    var cart_id = req.params.cart_id;
    await update_date_of_pay(date, cart_id);
    res.render('pay', {
        id: personal_id
    });
});

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}


async function find_user_id(last_name, first_name, email) {
    var sql_text = `select код_человека id from Человек where фамилия = @last_name and имя = @first_name and почта = @email `;
    //добавить id
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("last_name", sql.NVarChar(120), last_name)
        .input("first_name", sql.NVarChar(120), first_name)
        .input("email", sql.NVarChar(120), email)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function add_user(first_name, last_name, patronymic,
    int_type, email, phone, position) {
    var sql_text = `EXEC	[dbo].[AddUser]
		@last_name, 
		@first_name,
		@patronymic,
		@phone,
		@type,
		@email,
		@position`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("last_name", sql.NVarChar(120), last_name)
        .input("first_name", sql.NVarChar(120), first_name)
        .input("patronymic", sql.NVarChar(120), patronymic)
        .input("phone", sql.NVarChar(120), phone)
        .input("type", sql.Int, int_type)
        .input("email", sql.NVarChar(120), email)
        .input("position", sql.NVarChar(120), position)
        .query(sql_text);

}

async function add_book_to_cart(book_id, person_id, increment) {
    var sql_text = `EXEC	[dbo].[AddBookOrUpdateToShoppingBasket]
		@book_id, 
		@person_id,
		@increment`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("book_id", sql.Int, book_id)
        .input("person_id", sql.Int, person_id)
        .input("increment", sql.Int, increment)
        
        .query(sql_text);

}


async function update_book_value(book_id, person_id, value) {
    var sql_text = `EXEC	[dbo].[UpdateShoppingBasket]
		@book_id, 
		@person_id,
		@value`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("book_id", sql.Int, book_id)
        .input("person_id", sql.Int, person_id)
        .input("value", sql.Int, value)
        .query(sql_text);

}

async function get_all_personal_orders(person_id) {
    var sql_text = `select Корзина_покупателя.код_корзины id_cart, Корзина___Книга.код_книги book_id, количество_книг quantity,  название book_name, цена book_price,  обложка cover, дата_заказа date_of_order, телефон_получателя phone, адрес_получателя adress, почта_получателя email, полное_имя_получателя full_name, сумма result, дата_оплаты date_of_payment,  цена_заказа price_of_delivery, статус_заказа order_status 
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины 
join Книга on Книга.код_книги = Корзина___Книга.код_книги 
join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 1 and код_покупателя = @person_id`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("person_id", sql.Int, person_id)
        .query(sql_text);

    return arr_tasks.recordset;

}

async function update_date_of_pay(date, cart_id) {
    var sql_text = `Update from Счет_покупателя set [дата_оплаты] = @date where [код_корзины] = @cart_id`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("date", sql.Date, date)
        .input("cart_id", sql.Int, cart_id)
        
        .query(sql_text);

}

async function add_order(full_name, email, phone, type, comments, person_id, price ) {
    var sql_text = `EXEC  [dbo].[UpdateOrder]
		@full_name,
        @email, @phone, @type, @comments, @person_id, @price`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("full_name", sql.NVarChar(120), full_name)
        .input("email", sql.NVarChar(120), email)
        .input("phone", sql.NVarChar(120), phone)
        .input("type", sql.Int, type)
        .input("comments", sql.NVarChar(150), comments)
        .input("person_id", sql.Int, person_id)
        .input("price", sql.Money, price)
        .query(sql_text);

}


async function delete_personal_book(book_id, person_id) {
    var sql_text = `DELETE 
from Корзина___Книга
where код_книги = @book_id and код_корзины = (select код_корзины from Корзина_покупателя where код_покупателя = @person_id and статус = 0) `

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("book_id", sql.Int, book_id)
        .input("person_id", sql.Int, person_id)
        .query(sql_text);

}

async function update_cart_status(person_id) {
    var sql_text = `pdate Корзина_покупателя
set статус = 1
where код_покупателя = @person_id`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("person_id", sql.Int, person_id)
        .query(sql_text);

}



async function get_all_user_book(id) {
    var sql_text = `select обложка cover, название book_name, количество_книг quantity, цена price, (количество_книг * цена) result, Книга.код_книги id
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины
join Книга on Книга.код_книги = Корзина___Книга.код_книги
where статус = 0 and код_покупателя = @id`;
    //добавить id
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("id", sql.Int, id)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_result(id) {
    var sql_text = `select  sum(количество_книг * цена) result
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины
join Книга on Книга.код_книги = Корзина___Книга.код_книги
where статус = 0 and код_покупателя = @id`;
    //добавить id
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("id", sql.Int, id)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_last_cart_of_user(person_id) {
    var sql_text = `select код_корзины cart_id 
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины
join Книга on Книга.код_книги = Корзина___Книга.код_книги
where статус = 0 and код_покупателя = @person_id`;
    //добавить id
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("person_id", sql.Int, person_id)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_result_by_cart(person_id, cart_id) {
    var sql_text = `select  sum(количество_книг * цена) result
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины
join Книга on Книга.код_книги = Корзина___Книга.код_книги
where код_корзины = @cart_id and код_покупателя = @person_id`;
    //добавить id
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("person_id", sql.Int, person_id)
        .input("cart_id", sql.Int, cart_id)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_all_genres() {
    var sql_text = `select название_жанра name from Жанр`;
    //добавить id
	var connection = new sql.ConnectionPool({
		database: 'Last_db',
		server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
		driver: 'msnodesqlv8',
		options: { trustedConnection: true }
	});

	await connection.connect();

	var q_req = new sql.Request(connection);
	var arr_tasks = await q_req.query(sql_text);
	
	return arr_tasks.recordset;
}



async function get_all_positions() {
    var sql_text = `SELECT [наименование_должности] name_of_position FROM [Должность]`;
    //var sql_text = `select * from Книга`
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req.query(sql_text);

    return arr_tasks.recordset;
}

async function get_all_books() {
    
    var sql_text = `select Книга.название book_name, код_книги id, цена price, обложка cover 
					from Книга order by [количество_просмотров_книги] desc`;
	//var sql_text = `select * from Книга`
	var connection = new sql.ConnectionPool({
		database: 'Last_db',
		server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
		driver: 'msnodesqlv8',
		options: { trustedConnection: true }
	});

	await connection.connect();

	var q_req = new sql.Request(connection);
	var arr_tasks = await q_req.query(sql_text);

	return arr_tasks.recordset;
}

async function get_book(my_id) {
    
    var sql_text = `select код_книги id, название name_book, цена price, год_издания year_book, обложка cover, 
        описание description_book, количество_страниц quantity from Книга
        where код_книги = @id`;
    //var sql_text = `select * from Книга`
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("id", sql.Int, my_id)
        .query(sql_text);

    return arr_tasks.recordset;
}


async function update_visit(id) {

    var sql_text = `update Книга
    set количество_просмотров_книги = количество_просмотров_книги + 1
    where код_книги = @id`;
    //var sql_text = `select * from Книга`
    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("id", sql.Int, id)
        .query(sql_text);

    return arr_tasks.recordset;
}

module.exports = router;

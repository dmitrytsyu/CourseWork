'use strict';
var express = require('express');
var router = express.Router();
var sql = require('mssql/msnodesqlv8');
var multiparty = require('multiparty');
global.personal_id;
var personal_id = 1;
global.personal_type;
var personal_type = 1;
global.personal_name;
var personal_name = ' ';

router.get('/', async function (req, res) {
    var all_genres = await get_all_genres();
    var all_books = await get_all_books();

    res.render('main',  {
        genres: all_genres,
        books: all_books,
        id: personal_id,
        name: personal_name
    });
});

router.post('/', async function (req, res) {
    personal_id = 1;
    var all_genres = await get_all_genres();
    var all_books = await get_all_books();
    res.render('Main', {
        genres: all_genres,
        books: all_books,
        id: personal_id,
        name: personal_name
    });
});

router.get('/take_books', async function (req, res) {
   
    var all_books = await get_all_books();
    var covers = {};
    for (var a = 0; a < all_books.length; a++) {
        if (all_books[a]['cover'] != null) {
            var base64 = new Buffer(all_books[a]['cover'], 'binary').toString('base64')
            covers[all_books[a]['id']] = base64
        }
        else {
            covers[all_books[a]['id']] = 'no_image'
        }
    }
    res.json(covers);
    
});

router.get('/take_book_cover/:bookId', async function (req, res) {
   
    var bookId = req.params.bookId;
    var my_book = await get_book(bookId);
    if (my_book[0]['cover'] != null) {
        var base64 = new Buffer(my_book[0]['cover'], 'binary').toString('base64')
    }
    else {
        var base64 = 'no_image'
    }
   
    res.json(base64);

});



router.get('/take_all_book_from_genre/:genre_id', async function (req, res) {
   
    var genre_id = req.params.genre_id;
    var all_books = await get_all_books_by_genre(genre_id);
    
    var all_genres = await get_all_genres();
    res.render('Main', {
        books: all_books,
        id: personal_id,
        genres: all_genres,
        name: personal_name
    });

    


}); 

router.post('/my_request', async function (req, res) {
    
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (!err) {
            
            var request = (fields.request[0]).trim();
           
            if (request.length > 0 && request) {
                var books = await get_all_books_by_request(request);
                var all_genres = await get_all_genres();
                
                res.render('Main', {
                    books: books,
                    id: personal_id,
                    genres: all_genres,
                    name: personal_name
                })
                
            } else {
                res.redirect('/')
            }
        } else {
            res.redirect('/')
           
        }
    });
    

}); 

router.get('/authorization', async function (req, res) {
    res.render('authorization', {
        id: personal_id,
        name: personal_name
    });
});

router.get('/add_book_to_storage', async function (req, res) {
    var books = await get_all_books();
    res.render('_add_book_to_storage', {
        id: personal_id,
        type: personal_type,
        books: books,
        name: personal_name
    });
});

router.post('/add_book_to_storage', async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (!err) {
            var year = fields.year[0];
            var book = fields.books[0];
            var quantity = fields.quantity[0];
            
            if (quantity.length > 0 && quantity
                
            ) {
                await add_book_to_storage(book, year, quantity);
                res.redirect('/');
            } else {
                res.redirect('/');
            }

        } else {
            res.redirect('/');

        }
    });
});

router.get('/join_to_user', async function (req, res) {
    var users = await get_all_user_carts_without_status();
    res.render('__join_to_cart', {
        id: personal_id,
        type: personal_type,
        users: users,
        name: personal_name
    });
});

router.post('/join_to_user/:cart_id', async function (req, res) {

    var cartId = req.params.cart_id;
    
    if (increment == 1) {
        if (personal_id != 1 && personal_type != 0) {
            await update_cart_vendor_id(personal_id, cartId)
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

router.get('/courier_join_to_order', async function (req, res) {
    var users = await get_all_user_carts_without_status();
    res.render('_vendor_join_to_cart', {
        id: personal_id,
        type: personal_type,
        users: users,
        name: personal_name
    });
});

router.get('/vendor_carts', async function (req, res) {
    if (personal_id != 1) {
        var users = await get_all_vendor_carts_global(personal_id);
        var details = await get_all_vendor_carts(personal_id);
        res.render('_vendor_carts', {
            id: personal_id,
            type: personal_type,
            users: users,
            details: details,
            name: personal_name
        });
    }
    else
    {
        res.render('_vendor_carts', {
            id: personal_id,
            type: personal_type,
            users: [],
            name: personal_name
        });
    }
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
                var id_and_type = await find_user_id_and_type(last_name, first_name, email);
               
                if (id_and_type[0] === undefined) {
                    personal_id = 1;
                    personal_type = 0;
                }
                else {
                    personal_id = id_and_type[0]['id'];
                    personal_type = id_and_type[0]['type'];
                    personal_name = id_and_type[0]['name']
                }

                res.redirect('/')
            } else {
                res.redirect('/')
            }
        } else {
            res.redirect('/')
            
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
            id: personal_id,
            name: personal_name
        });
    }
    else {
        res.render('cart', {
            books: data_books,
            result: total[0]['result'],
            id: personal_id,
            name: personal_name
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

router.get('/cart/delete/:bookId', async function (req, res) {
    var bookId = req.params.bookId;
    if (personal_id != 1) {
        await delete_personal_book(bookId, personal_id);
        res.redirect('/cart')
    }
    else {
        res.redirect('/cart')
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
    
    
    if (personal_id != 1) {
        var orders = await get_all_personal_orders(personal_id);
        var avg_price_ = await get_avg_order(personal_id);
        var avg_result_ = await get_avg_result(personal_id);
        var popular_book = await get_more_popular_book(personal_id);
       
        if (orders[0] === undefined) {
            res.render('orders', {
                id: personal_id,
                orders: [],
                name: personal_name,
                avg_price: 0,
                avg_result: 0,
                book: []
            });
        }
        else {
           
            
            res.render('orders', {
                id: personal_id,
                orders: orders,
                name: personal_name,
                
                avg_price: avg_price_,
                avg_result: avg_result_,
                book: popular_book
            });
        }
        
    }
    else {
        res.render('orders', {
            id: personal_id,
            orders: [],
            name: personal_name,
            
            avg_price: 0,
            avg_result: 0,
            book: []
        });
    }
    
});


router.get('/order', async function (req, res) {
    res.render('order', {
        id: personal_id,
        type: personal_type,
        name: personal_name
    });
});

router.get('/add_new_book', async function (req, res) {
    var genres = await get_all_genres();
    var subgenres = await get_all_subgenres();
    res.render('_add_new_book', {
        id: personal_id,
        type: personal_type,
        genres: genres,
        subgenres: subgenres,
        name: personal_name
    });
});

router.post('/add_new_book', async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (!err) {
            var first_name_author = fields.first_name_author[0];
            var last_name_author = fields.last_name_author[0];
            var patronymic = fields.patronymic[0];
           
            var path = fields.path[0];
            var book_name = fields.book_name[0];
            var price_book = fields.price_book[0];
            var year_book = fields.year_book[0];
            var quantity = fields.quantity[0];
            var description = fields.description[0];
            var genre = fields.genre[0];
            var subgenre = fields.subgenre[0];

            if (genre == 'new_genre') {
                genre = fields.input_genre[0];
            }

            if (subgenre == 'new_subgenre') {
                subgenre = fields.input_subgenre[0];
            }

            
            if (first_name_author.length > 0 && first_name_author &&
                last_name_author.length > 0 && last_name_author &&
                path.length > 0 && path &&
                book_name.length > 0 && book_name &&
                price_book.length > 0 && price_book &&
                year_book.length > 0 && year_book &&
                quantity.length > 0 && quantity &&
                description.length > 0 && description &&
                genre.length > 0 && genre &&
                subgenre.length > 0 && subgenre
            ) {
                await add_book(book_name, price_book, year_book, quantity, description, subgenre, genre, first_name_author, last_name_author, path, patronymic);
                res.redirect('/');
            } else {
                res.redirect('/');
            }

        } else {
            res.redirect('/');

        }
    });
});

router.post('/order/new', async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (!err) {

            
            var adress = fields.adress[0];
            var comments = fields.comments[0];
            var int_type = 0;
            
        
            var type = fields.type[0];
            var price = fields.price[0];
            if (type == 'delivery') {
                int_type = 1
            }

            if (
                adress.length > 0 && adress &&
                comments.length > 0 && comments 
                
            ) {
                var last_cart = await get_last_cart_of_user(personal_id);
                await update_cart_status(personal_id);
                await add_order( int_type, comments, personal_id, price);

                res.redirect('/pay/' + last_cart[0]['cart_id']);
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
        id: personal_id,
        name: personal_name
    });
});

router.get('/book/:bookId', async function (req, res) {
    var bookId = req.params.bookId;
    var my_book = await get_book(bookId);
    
    update_visit(bookId);
    res.render('book', {
        book: my_book,
        id: personal_id,
        name: personal_name
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
        var total = await get_result_by_cart(personal_id, cart_id);
        
        res.render('pay', {
            id: personal_id,
            cart_id: cart_id,
            result: total[0]['result'],
            name: personal_name
        });
    }
    else {
        res.redirect('/')
    }
    
});



router.get('/pay_pay/:cart_id', async function (req, res) {
    var date = new Date();
    var cart_id = req.params.cart_id;
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' +
        ('00' + date.getUTCHours()).slice(-2) + ':' +
        ('00' + date.getUTCMinutes()).slice(-2) + ':' +
        ('00' + date.getUTCSeconds()).slice(-2);

    await update_date_of_pay(date, cart_id);
    res.redirect('/');
}); 

function hexToBase64(str) {
    
    return window.btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}


async function find_user_id_and_type(last_name, first_name, email) {
    var sql_text = `select код_человека id, тип type, имя name from Человек where фамилия = @last_name and имя = @first_name and почта = @email `;
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

async function add_book(book_name, price_book, year_of_edition,
    quantity_of_pages, description, name_subgenre, name_genre,
    first_name_author, last_name_author, path, patronymic_author) {
    var sql_text = `EXEC	[dbo].[AddBook]
		@book_name, 
		@price_book,
		@year_of_edition,
		@quantity_of_pages,
		@description,
		@name_subgenre,
		@name_genre,
        @first_name_author, 
		@last_name_author,
        @path, 
		@patronymic_author
		`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("book_name", sql.nvarchar(120), book_name)
        .input("price_book", sql.Money, price_book)
        .input("year_of_edition", sql.Int, year_of_edition)
        .input("quantity_of_pages", sql.Int, quantity_of_pages)
        .input("description", sql.nvarchar(400), description)
        .input("name_subgenre", sql.NVarChar(120), name_subgenre)
        .input("name_genre", sql.NVarChar(120), name_genre)
        .input("first_name_author", sql.NVarChar(120), first_name_author)
        .input("last_name_author", sql.NVarChar(120), last_name_author)
        .input("path", sql.nVarChar(120), path)
        .input("patronymic_author", sql.nVarChar(120), patronymic_author)
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

async function add_book_to_storage(book_name, year, quantity) {
    var sql_text = `EXEC [dbo].[AddBookToStorage]
		@book_name, 
		@year,
		@quantity`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("book_name", sql.NVarChar(120), book_name)
        .input("year", sql.Int, year)
        .input("quantity", sql.Int, quantity)
        .query(sql_text);

}

async function get_all_personal_orders(person_id) {
    var sql_text = `select Корзина_покупателя.код_корзины id_cart, Корзина___Книга.код_книги book_id, количество_книг quantity,  название book_name, цена book_price,  обложка cover, дата_заказа date_of_order,  адрес_получателя adress,  сумма result, дата_оплаты date_of_payment,  цена_заказа price_of_delivery, статус_заказа order_status 
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины 
join Книга on Книга.код_книги = Корзина___Книга.код_книги 
join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 1 and код_покупателя = @person_id order by id_cart desc`

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

async function get_avg_order(person_id) {
    var sql_text = `select avg(цена) avg_price
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

async function get_more_popular_book(person_id) {
    var sql_text = `select top(1) Книга.название book_name, Книга.код_книги book_id
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины 
join Книга on Книга.код_книги = Корзина___Книга.код_книги 
join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 1 and код_покупателя = @person_id
group by Книга.название, Книга.код_книги
order by count(Книга.название) desc`

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

async function get_avg_result(person_id) {
    var sql_text = `select avg(сумма) avg_result
from Корзина_покупателя 
join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 1 and код_покупателя = @person_id
`

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
    var sql_text = `Update Счет_покупателя set [дата_оплаты] = @date where [код_корзины] = @cart_id`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("date", sql.DateTime, date)
        .input("cart_id", sql.Int, cart_id)
        .query(sql_text);
}

async function update_cart_vendor_id(vendor_id, cart_id) {
    var sql_text = `update Корзина_покупателя 
set код_продавца = @vendor_id
where код_корзины = @cart_id`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("vendor_id", sql.Int, vendor_id)
        .input("cart_id", sql.Int, cart_id)
        .query(sql_text);
}

async function add_order(type, comments, person_id, price ) {
    var sql_text = `EXEC  [dbo].[UpdateOrder]
		 @type, @comments, @person_id, @price`

    var connection = new sql.ConnectionPool({
        database: 'Last_db',
        server: 'DESKTOP-KLFJQ83\\SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: { trustedConnection: true }
    });

    await connection.connect();

    var q_req = new sql.Request(connection);
    var arr_tasks = await q_req
        .input("type", sql.Int, type)
        .input("comments", sql.NVarChar(150), comments)
        .input("person_id", sql.Int, person_id)
        .input("price", sql.Money, price)
        .query(sql_text);

}


async function delete_personal_book(book_id, person_id) {
    
    var sql_text = `DELETE from Корзина___Книга where код_книги = @book_id and код_корзины = (select код_корзины from Корзина_покупателя where код_покупателя = @person_id and статус_корзины = 0) `

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
    var sql_text = `update Корзина_покупателя
set статус_корзины = 1
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
where статус_корзины = 0 and код_покупателя = @id`;
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
where статус_корзины = 0 and код_покупателя = @id`;
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
    var sql_text = `select Корзина_покупателя.код_корзины cart_id 
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины
join Книга on Книга.код_книги = Корзина___Книга.код_книги
where статус_корзины = 0 and код_покупателя = @person_id`;
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
where Корзина_покупателя.код_корзины = @cart_id and код_покупателя = @person_id`;
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

async function get_all_books_by_genre(genre_id) {
    var sql_text = `select Книга.название book_name, Книга.код_книги id, цена price, обложка cover
from Книга join Книга___Поджанр on Книга___Поджанр.код_книги = Книга.код_книги
join Поджанр on Книга___Поджанр.код_поджанра = Поджанр.код_поджанра
join Жанр on Поджанр.код_жанра = Жанр.код_жанра
where Жанр.код_жанра = @genre_id
 order by [количество_просмотров_книги] desc`;
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
        .input("genre_id", sql.Int, genre_id)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_all_books_by_request(request) {
    var sql_text = `select Книга.название book_name, Книга.код_книги id, цена price, обложка cover
from Книга
where Книга.название like '%' + @request + '%'
order by [количество_просмотров_книги] desc`;
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
        .input("request", sql.NVarChar(120), request)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_all_genres() {
    var sql_text = `select название_жанра name, код_жанра id_genre from Жанр`;
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

async function get_all_user_carts() {
    var sql_text = `select Корзина_покупателя.код_корзины id_cart, Корзина___Книга.код_книги book_id, количество_книг quantity, 
 название book_name, цена book_price,  обложка cover, дата_заказа date_of_order, телефон_получателя phone, 
 адрес_получателя adress, почта_получателя email, полное_имя_получателя full_name, сумма result, дата_оплаты date_of_payment,  
 цена_заказа price_of_delivery, статус_заказа order_status
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины 
join Книга on Книга.код_книги = Корзина___Книга.код_книги 
left join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
left join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 0`;
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

async function get_all_user_carts_without_status() {
    var sql_text = `select Корзина_покупателя.код_корзины cart_id, sum(количество_книг) book_sum_quantity, count(Книга.код_книги) book_count_quantity, sum(количество_книг * цена) result
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины 
join Книга on Книга.код_книги = Корзина___Книга.код_книги 
left join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
left join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 0 and код_продавца is null
group by Корзина_покупателя.код_корзины`;
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
async function get_all_vendor_carts_global(vendor_id) {
    var sql_text = `select Корзина_покупателя.код_корзины cart_id, sum(количество_книг) book_sum_quantity, count(Книга.код_книги) book_count_quantity, sum(количество_книг * цена) result
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины 
join Книга on Книга.код_книги = Корзина___Книга.код_книги 
left join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
left join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 0 and код_продавца = @vendor_id
group by Корзина_покупателя.код_корзины`;
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
        .input("vendor_id", sql.Int, vendor_id)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_all_vendor_carts(vendor_id) {
    var sql_text = `select Корзина_покупателя.код_корзины id_cart, Корзина___Книга.код_книги book_id, количество_книг quantity, 
 название book_name, цена book_price,  обложка cover, дата_заказа date_of_order, телефон_получателя phone, 
 адрес_получателя adress, почта_получателя email, полное_имя_получателя full_name, сумма result, дата_оплаты date_of_payment,  
 цена_заказа price_of_delivery, статус_заказа order_status
from Корзина_покупателя join Корзина___Книга on Корзина_покупателя.код_корзины = Корзина___Книга.код_корзины 
join Книга on Книга.код_книги = Корзина___Книга.код_книги 
left join Заказ_покупателя on Корзина_покупателя.код_корзины = Заказ_покупателя.код_корзины 
left join Счет_покупателя on Счет_покупателя.код_корзины = Корзина_покупателя.код_корзины 
where статус_корзины = 0 and код_продавца = @vendor_id` ;
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
        .input('vendor_id', sql.Int, vendor_id)
        .query(sql_text);

    return arr_tasks.recordset;
}

async function get_all_subgenres() {
    var sql_text = `select название_поджанра name_subgenre, код_поджанра id_subgenre from Поджанр`;
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

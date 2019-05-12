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
    });
});

router.get('/cart', async function (req, res) {
    var data_books = await get_all_user_book(personal_id);
    var total = await get_result(personal_id);
    if (data_books[0] === undefined || total[0] === undefined) {
        res.render('cart', {
            books: [],
            result: 0
        });
    }
    else {
        res.render('cart', {
            books: data_books,
            result: total[0]['result']
        });
    }

    

});


router.get('/orders', async function (req, res) {
    res.render('orders', {
    });
});

router.get('/order', async function (req, res) {

   
    res.render('order', {
    });
});

router.get('/registration', async function (req, res) {
    var all_positions = await get_all_positions();
    res.render('registration', {
        positions: all_positions
    });
});

router.get('/book/:bookId', async function (req, res) {
    var bookId = req.params.bookId;
    var my_book = await get_book(bookId);
    
    update_visit(bookId);
    res.render('book', {
        book: my_book
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
                
                personal_id = id[0]['id'];
                res.redirect('/')
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
            console.log('Не удалось зарегистрироваться')
        }
    });
});

router.post('/add_to_cart', async function (req, res) {
    // По хорошему сделать проверку на вхождение в id
    var bookId = req.query.book_id;
    var increment = req.query.increment;
    
    if (increment == 1) {
        if (personal_id != 1) {
            await add_book_to_cart(bookId, personal_id, increment)
            res.redirect('/')
        } else {
            res.redirect('/');
        }
    }
    else {
        var form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            if (!err) {
                var increment = fields.increment[0];
                await add_book_to_cart(bookId, personal_id, increment)
            }
            else {
                res.redirect('/')
            }
        });
    }
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

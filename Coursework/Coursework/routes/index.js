'use strict';
var express = require('express');
var router = express.Router();
var sql = require('mssql/msnodesqlv8');
var multiparty = require('multiparty');

/* GET home page. */


router.get('/', async function (req, res) {
    var all_genres = await get_all_genres();
    var all_books = await get_all_books();
    console.log(all_books[0]['cover'])
    for (var a = 0; a < all_books.length; a++) {
        var originalBase64ImageStr = hexToBase64()
        //var originalBase64ImageStr = new Buffer(all_books[a]['cover'].Image).toString('utf8');
        var decodedImage = new Buffer(originalBase64ImageStr, 'base64');
    }

    res.render('Main', {
        genres: all_genres,
        books: all_books
    });
   
});

router.get('/main_page', async function  (req, res) {
    var all_genres = await get_all_genres();
    var all_books = await get_all_books();

    res.render('Main', {
        genres: all_genres,
        books: all_books
    });
});

router.get('/floats', function (req, res) {
    res.render('floats', { title: 'Titles' });
});

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
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

async function get_all_books() {
    // нужны id
	var sql_text = `select Книга.название book_name, цена price, обложка cover 
					from Книга`;
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


module.exports = router;

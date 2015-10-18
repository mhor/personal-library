/** @type {?lf.Database} */
var db = null;

/**
 * The data model observed by UI.
 * @type {{count: number}}
 */
var model = {
    count: 0
};

var query;

var title = ".+";

var author = ".+";

// When the page loads.
$(function() {
    main().then(function() {
        // Simulate Controller/Model bindings.
        setUpBinding();
        setUpSearch();
        selectAllBooks();
    });
});

function setUpSearch() {

    $('#title').keyup(function() {

        var value = $(this).val();
        if (value.length <= 3) {
            value = ".+";
        }

        title = value;
        selectAllBooks();
    });

    $('#author').keyup(function() {

        var value = $(this).val();
        if (value.length <= 3) {
            value = ".+";
        }

        author = value;
        selectAllBooks();
    });
}

function setUpBinding() {
    var book = db.getSchema().table('Book');
    query = db.select(lf.fn.count(book.title).as('num')).
        from(book)
    ;

    db.observe(query, function(changes) {
        model.count = changes[0].object[0]['num'];
    });
}

/**
 * Selects all books.
 */
function selectAllBooks() {

    var $bookLists = $('#books-list');
    $bookLists.empty();

    var $titleFormGroup = $("#titleFormGroup");
    var $titleHelpBox = $("#titleHelpBox");

    var $authorFormGroup = $("#authorFormGroup");
    var $authorHelpBox =$("#authorHelpBox");

    try {
        var regexpTitle = new RegExp(title, 'i');
    } catch (e) {

        $titleFormGroup.addClass('has-error');
        $titleHelpBox.show();

        return;
    }

    try {
        var regexpAuthor = new RegExp(author, 'i');
    } catch (e) {

        $authorFormGroup.addClass('has-error');
        $authorHelpBox.show();

        return;
    }

    $titleFormGroup.removeClass('has-error');
    $titleHelpBox.hide();
    $authorFormGroup.removeClass('has-error');
    $authorHelpBox.hide();

    var book = db.getSchema().table('Book');
    db.select(book.title, book.author)
        .from(book)
        .where(lf.op.and(
            book.title.match(regexpTitle),
            book.author.match(regexpAuthor)
        ))
        .orderBy(book.author, lf.Order.ASC)
        .exec().then(
        function(results) {

            $(results).each(function(index, result) {
                $bookLists.append('<li class="list-group-item">' + result.title + ' - ' + result.author + '</li>');
            });
        }
    );
}

function main() {
    return book.db.getSchemaBuilder().connect({
        storeType: lf.schema.DataStoreType.INDEXED_DB
    }).then(function(database) {
        db = database;
        return checkForExistingData();
    }).then(function(dataExist) {
        return dataExist ? Promise.resolve() : addData();
    });
}

/**
 * Adds sample data to the database.
 * @return {!IThenable}
 */
function addData() {
    return Promise.all([
        insertData('books.json', db.getSchema().table('Book'))
    ]).then(function(queries) {
        var tx = db.createTransaction();
        return tx.exec(queries);
    });
}

/**
 * Inserts data in the database.
 * @param {string} filename The name of the file holding JSON data.
 * @param {!lf.schema.Table} tableSchema The schema of the table corresponding
 *     to the data.
 * @return {!IThenable<!lf.query.Insert>}
 */
function insertData(filename, tableSchema) {
    return getData(filename).then(
        function(data) {
            var rows = data.map(function(obj) {
                return tableSchema.createRow(obj);
            });
            return db.insert().into(tableSchema).values(rows);
        }
    );
}

/**
 * Reads the sample data from a JSON file.
 * @param {string} filename The name of the JSON file to be loaded.
 * @return {!IThenable}
 */
function getData(filename) {
    return /** @type {!IThenable} */ ($.getJSON('data/' + filename));
}

/**
 * @return {!IThenable.<boolean>} Whether the DB is already populated with
 * sample data.
 */
function checkForExistingData() {
    var book = db.getSchema().table('Book');
    var column = lf.fn.count(book.title);
    return db.select(column).from(book).exec().then(
        function(rows) {
            return rows[0][column.getName()] > 0;
        }
    );
}
/** @type {?lf.Database} */
var db = null;

var query;

var title = ".+";

var author = ".+";

// When the page loads.
$(function() {
    main().then(function() {
        // Simulate Controller/Model bindings.
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
    var authorTable = db.getSchema().table('Author');

    db.select(book.title, authorTable.name)
        .from(book)
        .innerJoin(authorTable, book.authorId.eq(authorTable.id))
        .where(lf.op.and(
            book.title.match(regexpTitle),
            authorTable.name.match(regexpAuthor)
        ))
        .orderBy(authorTable.name, lf.Order.ASC)
        .exec().then(
        function(results) {

            $(results).each(function(index, result) {
                $bookLists.append('<li class="list-group-item">' + result.Book.title + ' - ' + result.Author.name + '</li>');
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
        insertData('authors.json', db.getSchema().table('Author')),
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
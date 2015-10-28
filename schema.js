// Define movie.db namespace
var book = { db: {} };

/** @return {!lf.schema.Builder} */
book.db.getSchemaBuilder = function() {
  var ds = lf.schema.create('bookDb', 2);

  ds.createTable('Author').
    addColumn('id', lf.Type.INTEGER).
    addColumn('name', lf.Type.STRING).
    addPrimaryKey(['id'])
  ;

  ds.createTable('Book').
    addColumn('id', lf.Type.INTEGER).
    addColumn('title', lf.Type.STRING).
    addColumn('authorId', lf.Type.INTEGER).
    addPrimaryKey(['id']).
    addForeignKey('fk_AuthorId', {
      local: 'authorId',
      ref: 'Author.id'
    })
  ;

  return ds;
};

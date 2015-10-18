// Define movie.db namespace
var book = { db: {} };

/** @return {!lf.schema.Builder} */
book.db.getSchemaBuilder = function() {
  var ds = lf.schema.create('bookDb', 1);
  ds.createTable('Book').
      addColumn('title', lf.Type.STRING).
      addColumn('author', lf.Type.STRING)
  ;

  return ds;
};

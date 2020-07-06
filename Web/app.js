
var express = require('express');
var app = express();
var bodyParser  = require('body-parser');
var proxy = require('express-http-proxy');
var knex = require('knex')({
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'postgres',
      password : '1234',
      database : 'digitization',
      port: 5432,
    }
  });



app.use(bodyParser.json());

app.get('/getResults', function (req, res) {
    let count = 0;
    knex('result').select().count()
    .then((data)=>{
        count = parseInt(data[0].count);
    })
    knex.select().from('result')
    .where((qb) => {
        if (req.query.search!='') {
           qb.whereRaw(`LOWER(text) LIKE ?`, [`%${req.query.search.toLowerCase()}%`] 
            || `LOWER(fileName) LIKE ?`, [`%${req.query.search.toLowerCase()}%`] );
    }})
    .offset(req.query.offset)
    .limit(req.query.limit)
    
    .then((data) => res.send({results:data,count: count}))
    ;
});

app.post('/addResutl', function (req, res) {
    try{
        knex('result')
            .insert({
                fileName: req.body.fileName,
                text: req.body.text,
                language: req.body.language,
                date: req.body.date})
            .catch((ex)=>{
                res.sendStatus(500)
            })
        res.sendStatus(200)
    }
    catch(error){
        res.sendStatus(500)
    }

    
});


app.use('/', proxy('http://localhost:8080'));
app.listen(3000);

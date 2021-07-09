const express = require('express');
//Requer o MongoDb e o declara como MongoClient e ObjectId (internos ao pacote mongodb)
const {MongoClient, ObjectId} = require("mongodb");

//Necessário ser async pois serão usados metodos e verbos no modo await, e pode estourar o tempo de requesição. Há a questão do promise, todo promise precisa de await (faz sentido)
(async () => {
    //Declarações do bd: url de acesso (se houvesse user/password era aqui)(se fosse non-localServer era aqui)
  const url = "mongodb://localhost:27017";
  //Declarações de qual o Data Base buscado, o meu aqui na minha instancia do mongo é esse.
  const dbName = "ocean_bancodados_09_07_2021";

    //Essa informação será retornada apenas no terminal, apenas para saber se o cod. chegou até aqui.
  console.info("Conectando ao bd...");

    //Declaração do client, diz que ele deve aguardar a resposta da conexão com o servidor na url defininida na linha 8, usando topologia unificada.
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });

  //Checagem se o programa chegou até aqui no terminal.
  console.info("MongoDB conectado com sucesso!");

    //Declaração de instanciamento do client usando o nome do banco de dados.
  const db = client.db(dbName);

  //Chamando a express
  const app = express();
  //Notação de q o corpo todo será feito usando o json (OBRIGATÓRIO PRA NÃO CRASHAR)
  app.use(express.json());

  //End point da landing page, atualmente só dá um oi...
  app.get("/", function (req, res) {
    res.send("Olá estamos on line com as funções de listagem de filmes. Coloque /filmes no fim da url para ver a listagem atual.");
  });

  //Cria uma variavel que chama a colection dentro do banco de dados. Por exemplo se vc estivesse listando filmes, animes, musicas.. cada um seria uma collection e teria uma declaração dessas
  const filmes = db.collection("filmes")

  //End point que retorna a lista de filmes na DB
  //"/filmes" é o como a requisição deve ser feita na url usando o verbo GET. Note que é um arrow function!
    app.get("/filmes", async (req, res) => {
        //Faz a busca e transforma num array, depois armazena em listaFilmes.
      const listaFilmes = await filmes.find().toArray();
        //Devolve listaFilmes
      res.send(listaFilmes);
    });

  //Verbo GET apenas para um item da lista
  //Aqui a requisição tb pede o id no bd, note que esse id é o gerado automaticamente quando é feito o cadastro no bd, não está como alguma coisa q  nós definimos!
      app.get("/filmes/:id", async (req, res) => {
          //Declaração de uma variavel que será o parametro buscado no bd
        const id = req.params.id;
        //Declaração de uma variavel para encapsular tudo como item correspondente ao id, e usa o findOne como se fosse o list
        const item = await filmes.findOne({ _id: ObjectId(id) });
        //O valor da const var "item" é devolvido por send no res
        res.send(item);
    });
    

  //[POST] -> Create
  //Essa função irá adicionar um filme a lista, tem que vir pelo verbo post e vir no padrão Json
  //Chama pelo metodo post normal
    app.post("/filmes", async (req, res) => {
        const item = req.body;
        //Se liga que usa o insertOne como requisição de add item ao mongo
        await filmes.insertOne(item);
        //Devolve o item criado, mas bem que podia retornar uma msg de sucesso...
        res.send(item);
    });

  //[PUT] -> Update
  //Chamar pelo id da BD. e mandar no body o json com os dados, ele vai trocar tudo, menos o id!
    app.put("/filmes/:id", async (req, res) => {
        //Cria a constante que define o que será buscado no BD, "ánalogo ao query", nesse caso id
      const id = req.params.id;
        //Cria o item que será o corpo a atualizar na entrada dada pelo id acima
      const item = req.body;
        //Aqui ele usa o updateOne para fazer a atualização do id e coloca o que vem na variavel item, portanto escrito no body da requisição
      await filmes.updateOne({ _id: ObjectId(id) }, { $set: item });
        //Devolve o item que foi atualizado, ou seja o que foi posto no lugar. Mas eu acho que  talvez seja mais legal se ele pudesse dizer como era e como ficou....
      res.send(item);
    });

  //[DELETE] - Delete (a vá!!)
  //Função q vai pegar o "id" da URL e eliminar ele na lista
    app.delete("/filmes/:id", async (req, res) => {
      const id = req.params.id;
        //Uso do metodo deleteOne para procurar pela id dada na url, relacionada ao id do objeto.
      await filmes.deleteOne({ _id: ObjectId(id) });
        //Avisa que foi removido com sucesso.
      res.send("Item removido com sucesso.");
    });
    //Diz qual a porta que essa aplicação está disponivel.
  app.listen(3000);
  //Fechamento do async lááááá do começo
})();
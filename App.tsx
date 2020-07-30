import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("db.testDb"); // returns Database object

const Style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 36,
    width: 250,
    borderColor: "#EEE8AA",
    borderWidth: 1,
    borderRadius: 9,
  },
  titulo: {
    textAlign: "center",
    fontWeight: "bold",
    padding: 50,
    fontSize: 20,
  },
  buttonEdit: {
    backgroundColor: "#87CE",
    alignItems: "center",
    margin: 15,
    padding: 10,
    height: 40,
    width: 90,
    borderRadius: 8,
  },
  buttonAdd: {
    backgroundColor: "#87CEEB",
    alignItems: "center",
    margin: 25,
    padding: 10,
    height: 40,
    width: 90,
    borderRadius: 8,
  },
  txtbutton: {
    fontWeight: "500",
  },
  buttonExc: {
    backgroundColor: "#FA8072",
    alignItems: "center",
    margin: 15,
    padding: 10,
    height: 40,
    width: 90,
    borderRadius: 8,
  },
  item: {
    backgroundColor: "#F0FFF0",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      nome: "",
    };
    // Check if the items table exists if not create it
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, count INT)"
      );
    });
    this.fetchData(); // ignore it for now
  }
  fetchData = () => {
    db.transaction((tx) => {
      // enviando 4 argumentos em executeSql
      tx.executeSql(
        "SELECT * FROM items",
        null,// passando consulta sql e parâmetros: null
        // retorno de chamada de sucesso que envia duas coisas: objeto de transação e objeto de resultado
        (txObj, { rows: { _array } }) => this.setState({ data: _array })
        // retorno de chamada de falha que envia duas coisas, objeto de transação e erro
      ); // fim execucao SQL
    }); // fim da transacao
  };

  // function para criar novo item
  newItem = () => {
    //Validando se input não está vazio
    if (this.state.nome != "") {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO items (text, count) values (?, ?)",
          [this.state.nome, 0],
          (txObj, resultSet) =>
            this.setState({
              data: this.state.data.concat({
                id: resultSet.insertId,
                text: this.state.nome,
                count: 0,
              }),
            }),
          (txObj, error) => console.log("Error", error)
        );
      });
    } else {
      Alert.alert("Preencha o campo nome");
    }
  };

  //function update
  increment = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE items SET count = count + 1 WHERE id = ?",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let newList = this.state.data.map((data) => {
              if (data.id === id) return { ...data, count: data.count + 1 };
              else return data;
            });
            this.setState({ data: newList });
          }
        }
      );
    });
  };

  //Function delete
  delete = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM items WHERE id = ? ",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let newList = this.state.data.filter((data) => {
              if (data.id === id) return false;
              else return true;
            });
            this.setState({ data: newList });
          }
        }
      );
    });
  };
  render() {
    return (
      <View style={Style.container}>
        <Text style={Style.titulo}>Teste SQLITE</Text>
        <View>
          <Text style={Style.titulo}> Insira nome</Text>
          <TextInput
            style={Style.input}
            onFocus={() => this.setState({ nome: "" })}
            value={this.state.nome}
            onChangeText={(nome) => this.setState({ nome })}
          />
        </View>
        <TouchableOpacity onPress={this.newItem} style={Style.buttonAdd}>
          <Text style={Style.txtbutton}>Adicionar</Text>
        </TouchableOpacity>

        <ScrollView>
          {this.state.data &&
            this.state.data.map((data) => (
              <View key={data.id} style={Style.item}>
                <Text>
                {data.id} {data.text} - {data.count}
                </Text>
                <TouchableOpacity
                  onPress={() => this.increment(data.id)}
                  style={Style.buttonEdit}
                >
                  <Text style={{ color: "green" }}> + </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.delete(data.id)}
                  style={Style.buttonExc}
                >
                  <Text> DEL </Text>
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      </View>
    );
  }
}
export default App;

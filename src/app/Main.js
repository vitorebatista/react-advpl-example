/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import {indigo500, indigo200, grey300, purple300 } from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import TotvsTec from './../lib/TotvsTecReact';
import QWebChannel from './../lib/QWebChannel';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const styles = {
  container: {
    flex: 1,
    overflowX: 'hidden',
    backgroundColor: grey300
  },
  paperHeader:{
    flex: 1,
    margin: 20,
    textAlign: 'center',
    height: 200,
    backgroundColor: indigo200
  }
};

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: purple300,
  },
});

class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
      port: 0,
      tableData: []
    };

    this.onOpen = this.onOpen.bind(this)
  }

  componentDidMount() {

    // Habilita o WebSocket
    const port = TotvsTec.getParam("port");
    const baseUrl = "ws://localhost:" + port;
    
    this.setState({  port })
    
    var socket = new WebSocket(baseUrl);
    socket.onClose = function(){ console.error("web channel closed"); };
    socket.onError = function(error){ console.error("web channel error: " + error); };
    
    // Abre comunicacao com o SmartClient
    socket.onopen = () => { this.onOpen(this,socket, baseUrl);} 
    
  }

  onOpen(e, socket, baseUrl) {

       const teste = new QWebChannel.QWebChannel(socket, function(channel,test) {
            // Torna "dialog" acessivel globalmente
            window.dialog = channel.objects.mainDialog;

            // Signal que recebe o codigo vindo do AdvPL para injecao
            dialog.advplToJs.connect(function (codeType, codeContent, objectName) {
              
                if (codeType == "OpenWindow") {
                    e.setState({  open: true })
                }else if (codeType == "CloseWindow") {
                    e.setState({  open: false })
              }
                else if (codeType == "AddItem") {
                    
                    const list = JSON.parse(codeContent);
                    e.setState({  tableData: [...e.state.tableData, list] });
                }
            });
            // Envia sinal ao ADVPL informando sucesso na criacao do formulario
            dialog.jsToAdvpl("pageStarted", "Pagina React inicializada "+baseUrl);
        });
    
  }
  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  handleTouchTap = () => {
    this.setState({
      open: true,
    });
  }


  renderTable() {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>ID</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.state.tableData.map( (row, index) => (
                <TableRow key={index}>
                  <TableRowColumn>{row.item}</TableRowColumn>
                  <TableRowColumn>{row.name}</TableRowColumn>
                </TableRow>
                ))}
        </TableBody>
      </Table>
    );
  }
  render() {
    const standardActions = (
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleRequestClose}
      />
    );
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          
          <AppBar
            title="Teste Advpl + React"
            style={{backgroundColor: indigo500 }}
            showMenuIconButton={false}
          />
          <Dialog
            open={this.state.open}
            title="Janela aberta pelo Advpl"
            actions={standardActions}
            onRequestClose={this.handleRequestClose}
          >
            Uhuul!!
          </Dialog>
          <Paper style={styles.paperHeader} zDepth={4} >
            <div dangerouslySetInnerHTML={{__html: this.state.div}} />
            <h3>Conectado na porta: {this.state.port}</h3>
          </Paper>

          { this.renderTable() }
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Main;

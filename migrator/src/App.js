import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Opus from './Opus';
import Author from './Author';
import MnOpus from './MnOpus';
import MigrationProgress from './MigrationProgress';

class App extends Component {

  render() {
    return (
      <div className="App">
        <h3>React Express App</h3>
        <MigrationProgress />
        <Author />
        <Opus />
        <MnOpus />
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import logo from './logo.svg';
//import './css/style.css';

class Opus extends Component {

  state = { opuses : [] };

  componentDidMount() {

    fetch(this.props.url)
      .then(res => { 
        return res = res.json();  
    })
      .then(res => this.setState( {opuses : res} ))
      .catch((err) => console.error(err));          
  }

  render() {
  
    return (
        <div>
          <h4>Opuses in PostgreSql DB</h4>
            <div className='v-scroll'>            
              <table> 
                <tr>
                  <th>Description</th>
                  <th>AuthorId</th>
                  <th>Content</th>
                  <th>Published</th>
                </tr>
  
              <tbody>
              { this.state.opuses.map((opus) => 
                <tr key={opus.id}>
                  <td>{opus.description}</td>
                  <td>{opus.authorid}</td>
                  <td>{opus.content}</td>
                  <td>{opus.published}</td>
                </tr>)}     
              </tbody>
            </table>  
            </div>
          </div>
      );
  }


}

Opus.propTypes = {
    url : PropTypes.string
  }

Opus.defaultProps = {
    url : '/opus'
  }

export default Opus;
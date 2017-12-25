import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import logo from './logo.svg';
//import './css/style.css';

class Author extends Component {

  state = { authors : [] };

  componentDidMount() {

    fetch(this.props.url)
      .then(res => { 
        return res = res.json();  
    })
      .then(res => this.setState( {authors : res} ))
      .catch((err) => console.error(err));          
  }

  render() {
      return (
        <div>
          <h4>Authors in PostgreSql DB</h4>
            <div className='v-scroll'>            
              <table> 
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Last Published</th>
                </tr>                             
              <tbody>
              { this.state.authors.map((author) => 
                <tr key={author.id}>
                  <td>{author.id}</td>
                  <td>{author.name}</td>
                  <td>{author.lastpublished}</td>
                </tr>)}     
              </tbody>
            </table>  
            </div>
          </div>
      );
  }


}

 Author.propTypes = {
    url : PropTypes.string
 }

Author.defaultProps = {
    url : '/author'
}

export default Author;
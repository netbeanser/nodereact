import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/style.css';

class MnOpus extends Component {

	state = { mnopuses : [] }

	componentDidMount() {

    fetch(this.props.url)
      .then(res => { 
        return res = res.json();  
    })
      .then(res => this.setState( {mnopuses : res} ))
      .catch((err) => console.error(err));      


	}

 	render() {
    	return (
    		<div>
    			<h4>MnOpuses</h4>
    			<div  className='v-scroll'>
           			<table> 
                		<tr>
    	            		<th>Author</th>
	        	        	<th>Title</th>
                      <th>Title</th>
	            	    	<th>Description</th>
                      <th>Published</th>
	                	</tr>           		
        				<tbody>
        					{ this.state.mnopuses.map((mnopus) => 
        					<tr key={mnopus.id}>
        						<td>{mnopus.name}</td>
        						<td>{mnopus.title}</td>
        						<td>{mnopus.description}</td>
                    <td>{mnopus.published}</td>
        					</tr>)}     
        			</tbody>
        		</table>	
    			</div>
      		</div>
    	);
  	}
}

MnOpus.propTypes = {
    url : PropTypes.string
 }

MnOpus.defaultProps = {
    url : '/mnopus'
}

export default MnOpus;
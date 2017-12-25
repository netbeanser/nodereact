import React, {Component} from 'react';
import Websocket from 'react-websocket';
import PropTypes from 'prop-types';

class MigrationProgress extends Component {

	state = {
		open: "disconnected",
		mnopus: {"_id": "-2"},
		pgauthor: '',
		pgopus: ''
	}

	sendMessage(message) {
		this.refWebSocket.sendMessage(message);
	}

	handleOpen() {
		this.setState( {open: 'Connected'} );
	}

	handleClose() {
		this.setState( {open: false} );
	}

	handleMessage(data) {

		let result = JSON.parse(data);
		let ta = document.getElementById('ta');
		ta.value=JSON.stringify(result);


		this.setState( { 
			mnopus: 	result.mnopus,
			pgauthor: result.pgauthor,
			pgopus: 	result.pgopus
		});	

	}

	render() {
		return (
			<div>	
				<h4>Migration progress</h4>
				<h4>Connected to ws server: {this.state.open}</h4>
				<h5>Last document processed:</h5>
				<textarea id='ta' rows='3' cols='170'>This is dialog</textarea>
				<table>
          	<tr key={this.state.mnopus._id}>
    	    		<th>Mongo Opus Doc</th>
	         		<th>PG Author</th>
	         		<th>Pg Opus</th>
	        	</tr>           		
        	<tbody>
        		<tr>
        		<td>{JSON.stringify(this.state.mnopus)}</td>
        		<td>{JSON.stringify(this.state.pgauthor)}</td>
        		<td>{JSON.stringify(this.state.pgopus)}</td>
        		</tr>     
        	</tbody>
				</table>

				<Websocket url={this.props.url}
					onOpen={this.handleOpen.bind(this)}
					onClose={this.handleClose.bind(this)}
					onMessage={this.handleMessage.bind(this)} 
					debug={true}
          ref={Websocket => {
	          this.refWebSocket = Websocket;}}
					/>
			</div>
		);
	}
	
}

MigrationProgress.propTypes = {
	url: PropTypes.string
}

MigrationProgress.defaultProps = {
	//Компонент Websocket после монтирования (в методе componentDidMount) будет автоматически цепляться по данному url.
	url: 'ws://localhost:33712/progress'
}

export default MigrationProgress;
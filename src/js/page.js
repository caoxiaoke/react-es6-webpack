import React from 'react';
import ReactDom from 'react-dom';
import '../css/img-styles.css';

export default class Hellos extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: 1
        }
    }
    componentWillMont() {

    }

    render() {
        return (
            <div>
               <img src={require('../img/Tulips.jpg')} className="img" />
            </div>
        )
    }
}
ReactDom.render(<Hellos/>, document.getElementById('page'))
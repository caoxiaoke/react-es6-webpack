import React from 'react';
import ReactDom from 'react-dom';
import  '../css/csd.css';

export default class Hello extends React.Component {
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
                <div className="cls">hello word</div>
            </div>
        )
    }
}
ReactDom.render(<Hello/>, document.getElementById('content'))
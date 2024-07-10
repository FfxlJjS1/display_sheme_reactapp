import React from "react"
import CheckboxTree from 'react-checkbox-tree';

import 'react-checkbox-tree/lib/react-checkbox-tree.css';

export class CheckboxTreeWidget extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            checked: [],
            expanded: [],
        };
    }

    getCheckedArray() {
        return this.state.checked.map((checked) => Number(checked));
    }

    render() {
        const nodes = this.props.nodes;

        return(
            <CheckboxTree
                iconsClass="fa5"
                nodes={nodes}
                checked={this.state.checked}
                expanded={this.state.expanded}
                onCheck={checked => this.setState({checked})}
                onExpand={expanded => this.setState({expanded})}
            />
        );
    }
}

export default CheckboxTreeWidget
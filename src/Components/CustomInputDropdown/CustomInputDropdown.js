import React, { Component } from 'react';

import './CustomInputDropdown.css'

export default class CustomInputDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            objectsToDropdown: props.objectsToDropdown.map(objectToDropdown => [objectToDropdown, false]),
            key: props.placeholder,
            objectsToDropdownA: null
        };
    }

    async finterFunction(need_to_recount = true){
        let objectsToDropdown = this.state.objectsToDropdown;
        let last_value = null, count_to_show = 0;


        if (need_to_recount) {
            for (let i = 0; i < objectsToDropdown.length; i++) {
                objectsToDropdown[i][1] = objectsToDropdown[i][0].includes(this.props.value[this.state.key]);

                if (objectsToDropdown[i][1]) {
                    count_to_show += 1;
                    last_value = objectsToDropdown[i];
                }
            }
        }

        if (count_to_show == 1 && last_value[0] == this.props.value[this.state.key]) {
            last_value[1] = false;
        }

        await this.setState({
            objectsToDropdown: objectsToDropdown,
            objectsToDropdownA: this.state.objectsToDropdown.map((objectToDropdown) =>
                <a value={objectToDropdown[0]} onMouseDown={e => this.selectedDropdownElement(objectToDropdown[0]) } style={{ display: objectToDropdown[1] ? '' : 'none' }}>{objectToDropdown[0]}</a>
            )
        });
    }

    async onBlur(e) {
        let objectsToDropdown = this.state.objectsToDropdown;

        for (let i = 0; i < objectsToDropdown.length; i++) {
            objectsToDropdown[i][1] = false;
        }

        await this.finterFunction(false);
    };

    async onFocus(e) {
        let objectsToDropdown = this.state.objectsToDropdown;

        for (let i = 0; i < objectsToDropdown.length; i++) {
            objectsToDropdown[i][1] = true;
        }

        await this.finterFunction();
    };

    async selectedDropdownElement(value) {
        this.props.value[this.state.key] = value;

        this.props.updateArraySearchByKey(this.props.value);

        await this.finterFunction();
    }

    async handleOnInput(value) {
        this.props.value[this.state.key] = value;

        this.props.updateArraySearchByKey(this.props.value);

        await this.finterFunction();
    };

    render() {
        let objectsToDropdownA = this.state.objectsToDropdownA;
        let value_to_view = this.props.value[this.state.key];

        return (
            <div class="dropdown">
                <div id="myDropdown" class="dropdown-content show">
                    <input type="text" value={value_to_view} onInput={(e) => this.handleOnInput(e.target.value)} placeholder={this.props.placeholder} id="myInput" onKeyUp={e => this.handleOnInput(e.target.value)} onBlur={e => this.onBlur(e)} onFocus={e => this.onFocus(e)} />
                    <div class="dropdown-content-div-aaa" style={{ maxHeight: '300px', overflowY: 'scroll', whiteSpace: 'nowrap' }}>
                        {objectsToDropdownA}
                    </div>
                </div>
            </div>
        );
    }
}

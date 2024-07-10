import { useState } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import { Container, Col, Row } from "react-bootstrap";
import { CommunicationWithServer } from '../../FunctionalClasses/CommunicationWithServer';

import './customizable.css';

class GetObjectInfo {
    async GetObjectInfo(node_id, set_node_panel_text) {
        const data = await CommunicationWithServer.GetObjectFullInfo(node_id);

        set_node_panel_text(
            data.node_lines.map(line =>
                <div><label htmlFor="text" style={{ marginTop: '5px' }}>{line}</label></div>
            )
        );
    }
};

export function CustomizableNode({ data }) {
    const customizeProp = data.customize;
    const nodeWidth = data.width;
    const nodeHeight = data.height;

    /*
    1 - button clicked
    2 - node clicked
    */

    data.action_type = 0;

    //Салават
    let _logo = "";
    switch (data.tip_npo_id) {
        case 1:
            _logo = require('./image/ic_well.png');
            break;
        case 7:
        case 12:
            _logo = require('./image/ic_measure.png');
            break;
        case 5:
        case 6:
            _logo = require('./image/ic_pump.png');
            break;
        case 10:
            _logo = require('./image/ic_tank.png');
            break;
        default:
            break;
    }

    // Focus and blur node
    const [panel_visible_state, set_focus_state] = useState(false);

    const onFocusToChangePanelVisible = (e) => {
        set_focus_state(!panel_visible_state);
    }

    //Кнопки +/-
    const handleToolbarClick = (e) => {
        data.action_type = 1;
    };

    const [toolbar_panel_position, change_panel_position] = useState(0);

    const handleChangePanelPosition = (e) => {
        change_panel_position((toolbar_panel_position + 1) % 4);
    };

    const [node_panel_text, set_node_panel_text] = useState(<div><label htmlFor="text" style={{ marginTop: '5px' }}>Reload</label></div>);

    const handleCloseNodePanel = (e) => {
        set_focus_state(false);
    }

    const handleReloadNodeInformation = (e) => {
        let get_object_info = new GetObjectInfo();

        get_object_info.GetObjectInfo(data.node_id, set_node_panel_text);
    }

    data.handleReloadNodeInformation = handleReloadNodeInformation;

    //салават
    const logo = _logo;
    return (
        <>
            <NodeToolbar position={
                toolbar_panel_position == 0
                    ? Position.Left
                    : toolbar_panel_position == 1
                        ? Position.Bottom
                        : toolbar_panel_position == 2
                            ? Position.Right
                            : Position.Top
            } isVisible={data.isGroupNode != true ? true : false} style={{zIndex: 3} }>
                <Container className="node-status-panel" style={{ display: panel_visible_state ? '' : 'none', paddingRight: "0px" }}>
                    <Row className="node-button-panel-area">
                        <Col md="auto">
                            <button onClick={handleToolbarClick}>
                                {data.hidden ? "+" : "-"}
                            </button>
                        </Col>
                        <Col md="auto">
                            <button onClick={handleChangePanelPosition}>
                                {
                                    toolbar_panel_position == 2
                                        ? "↖"
                                        : toolbar_panel_position == 3
                                            ? "↙"
                                            : toolbar_panel_position == 1
                                                ? "↗"
                                                : "↘"
                                }
                            </button>
                        </Col>
                        <Col md="auto">
                            <button onClick={handleReloadNodeInformation}>↻</button>
                        </Col>
                        <Col md="auto">
                            <button onClick={handleCloseNodePanel} style={{ display: "flex", justifyContent: "right", }}>✕</button>
                        </Col>
                    </Row>

                    <Row>
                    <Col md="auto">
                            {node_panel_text}
                        </Col>
                    </Row>
                </Container>
                <div style={{ display: !panel_visible_state ? '' : 'none' }}>
                    <button onClick={handleToolbarClick}>
                        {data.hidden ? "+" : "-"}
                    </button>
                </div>
            </NodeToolbar>

            <div className="customizable-node" style={{ width: nodeWidth, height: nodeHeight }} onClick={onFocusToChangePanelVisible}>
                {customizeProp[0] ? <Handle type="target" position={Position.Right} /> : null}
                {customizeProp[2] ? <Handle type="source" position={Position.Left} /> : null}
                {customizeProp[1] ? <Handle type="source" position={Position.Bottom} /> : null}
                {customizeProp[3] ? <Handle type="target" position={Position.Top} /> : null}
                <div style={{ display: 'flex' }} >
                    <img src={logo} alt="" width="30" height="30" />
                    <label htmlFor="text" style={{ marginLeft: 10, marginTop: 4, whiteSpace: 'nowrap' }} >{data.label}</label>
                </div>
            </div>
        </>
    );
}

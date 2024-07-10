import { useState, useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    MarkerType,
    getOutgoers, getConnectedEdges, NodeToolbar, Position, //сал
    applyNodeChanges, applyEdgeChanges,
    Background,
} from 'reactflow';
import { CustomizableNode } from './CustomizableNode'

import 'reactflow/dist/style.css';

export const RadioGroup = [
    { label: 'Вертикально', id: 'radio-group-1', key: 1, checked: true},
    { label: 'Горизонтально', id: 'radio-group-2', key: 2, checked: false },
];



const nodeTypes = {
    customizable: CustomizableNode,
};

function MyDiagram(props) {
    let table = props.table;
    const diagramStructureKey = props.diagramStructureKey;
    const searchByObjectsFilters = props.searchByObjectsFilters;
    
    // Filtering
    let keys = [];

    for (let key in table) {
        keys.push(key);
    }

    let needToFilter = false;
    for (const filterKey in searchByObjectsFilters) {
        const filter = searchByObjectsFilters[filterKey];

        if (filter !== "") {
            needToFilter = true;

            break;
        }
    }

    if (needToFilter) {
        let filteredTable = [];
        let addedNodeIds = [];
        let acceptedParentNodeIds = [];

        // Filtering from start to end
        for (const filterKey in searchByObjectsFilters) {
            const filter = searchByObjectsFilters[filterKey];
            const subTable = table[filterKey];
            let filteredSubTable = [];

            // Get elements that have full_name like filter
            if (filter !== "") {
                filteredSubTable = subTable.filter(element => element.full_name.includes(filter));

                if (filteredSubTable.length > 0) {
                    filteredSubTable.forEach((element) => {
                        addedNodeIds.push(element.id);

                        if (!acceptedParentNodeIds.includes(element.parent_id))
                            acceptedParentNodeIds.push(element.parent_id);
                    });

                    filteredTable[filterKey] = filteredSubTable;
                }
            }

            // Get other elements of the subTable
            if (addedNodeIds.length > 0) {
                let isAdded = true;

                while (isAdded) {
                    isAdded = false;

                    const newAdd = subTable.filter(element => acceptedParentNodeIds.includes(element.id) && !addedNodeIds.includes(element.id));

                    if (newAdd.length > 0) {
                        newAdd.forEach((element) => {
                            filteredSubTable.push(element);
                            addedNodeIds.push(element.id);

                            if (!acceptedParentNodeIds.includes(element.parent_id))
                                acceptedParentNodeIds.push(element.parent_id);
                        });

                        isAdded = true;
                    }
                }
            }

            filteredTable[filterKey] = filteredSubTable;
        }

        // Filtering from end to  start
        const rKeys = keys.reverse();
        let afterFilterFromEnd = false;

        for (const rKeyIndex in rKeys) {
            const rKey = rKeys[rKeyIndex];
            const filter = searchByObjectsFilters[rKey];
            const subTable = table[rKey].filter(element => addedNodeIds.includes(element.parent_id) && !addedNodeIds.includes(element.id));
            let filteredSubTable = filteredTable[rKey];

            if (subTable.length > 0 && afterFilterFromEnd) {
                let isAdded = true;

                while (isAdded) {
                    isAdded = false;

                    const newAdd = subTable.filter(element => addedNodeIds.includes(element.parent_id) && !addedNodeIds.includes(element.id));

                    if (newAdd.length > 0) {
                        newAdd.forEach((element) => {
                            filteredSubTable.push(element);
                            addedNodeIds.push(element.id);
                        });

                        isAdded = true;
                    }
                }
            }

            afterFilterFromEnd = afterFilterFromEnd || filter != "";

            filteredTable[rKey] = filteredSubTable;
        }

        keys.reverse();

        table = filteredTable;
    }

    // Setting groups, nodes and edges parametrs
    let initialNodes = [];
    let initialEdges = [];


    const nodeWidth = 200, nodeHeight = 40; //Салават
    const nodeXMove = nodeWidth + 20 * 2, nodeYMove = nodeHeight + 10; // For default presentation parametrs //Салават nodeYMove

    const groupBetweenVoidWidth = 50,
        groupVoidSideWidth = 20,
        groupHeaderHeight = 20,
        groupWidth = nodeWidth + groupVoidSideWidth * 2;
    let groupHeight = 0,
        groupXPos = 0;
    const groupYPos = 0;

    const nodeXPos = groupVoidSideWidth;

    if (diagramStructureKey == RadioGroup[0].key) {
        for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
            const localKey = keys[keyIndex];
            const objects = table[localKey];

            groupHeight = nodeYMove * (objects.length - 1) + 40 + groupVoidSideWidth * 2 + groupHeaderHeight;

            // Add group node
            initialNodes.push({
                id: localKey,
                data: { label: localKey, isGroupNode: true },
                position: { x: groupXPos, y: groupYPos },
                style: { backgroundColor: 'rgba(8, 164, 116, 0.4)', width: groupWidth, height: groupHeight, fontSize: 15, color: '#fff', fontWeight: 'bold' }
            });

            groupXPos += (nodeXMove + groupBetweenVoidWidth);

            // Add nodes to group node and add edges
            let nodeYPos = groupVoidSideWidth + groupHeaderHeight;

            for (let objectId in objects) {
                const object = objects[objectId];

                initialNodes.push({
                    id: '\"' + object.id + '\"',
                    data: {
                        label: object.full_name, //object.tip_npo_name + ' - ' + object.name,
                        customize: [true, true, true, true],
                        width: nodeWidth,
                        height: nodeHeight,
                        tip_npo_id: object.tip_npo_id,
                        node_id: object.id,
                        hidden: false,
                        left_to_right: props.left_to_right,
                    },
                    parentNode: localKey,
                    extent: 'parent',
                    type: 'customizable',
                    position: { x: nodeXPos, y: nodeYPos }
                });

                initialEdges.push({
                    id: 'e' + object.parent_id + '-' + object.id,
                    target: '\"' + object.id  + '\"',
                    source: '\"' + object.parent_id + '\"',
                    type: 'step',
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    },
                });

                nodeYPos += nodeYMove;
            }
        }
    }
    else if (diagramStructureKey == RadioGroup[1].key) {
        let dependentsToParent = new Map();

        // Get all parents with their childs
        for (const keyIndex in keys) {
            const key = keys[keyIndex];
            const subTable = table[key];

            for (const elementIndex in subTable) {
                const element = subTable[elementIndex];

                if (dependentsToParent[element.parent_id] == undefined) {
                    dependentsToParent[element.parent_id] = [];
                    dependentsToParent[element.parent_id].push([element.id, key]);
                }
                else {
                    dependentsToParent[element.parent_id].push([element.id, key]);
                }
            }
        }

        const nodeWidth = 160, nodeHeight = 40;
        const nodeXMove = nodeWidth + 20 * 2, nodeYMove = nodeHeight + 50; // For default presentation parametrs
        let nodeXPos = 0, nodeYPos = 0;

        let queue = [[0, '']];
        let count_for_groups = 1;

        for (let index = 0; index < queue.length; ){
            const local_coutn_for_groups = count_for_groups;
            count_for_groups = 0;

            let minXNodePos = 0;
            let local_node_x_pos = nodeXPos;

            for (let number_for_group = 1; number_for_group <= local_coutn_for_groups; number_for_group++) {
                const queue_element = queue[index + number_for_group - 1];
                let group = dependentsToParent[queue_element[0]];

                for (let group_index = 0; group_index < group.length; group_index++) {
                    const group_element = group[group_index];
                    const local_dependents = dependentsToParent[group_element[0]];

                    if (local_dependents != undefined) {
                        if (local_dependents.length == 1) {
                            group.push(local_dependents[0]);
                        }
                        else if (local_dependents.length > 1) {
                            queue.push(group_element);

                            count_for_groups++;
                        }
                    }
                }

                let is_honest = false;

                for (let group_element_index in group) {
                    const group_element = group[group_element_index];
                    const node_id = group_element[0];
                    const node_key = group_element[1];

                    const node = table[node_key].filter(node => node.id == node_id)[0];

                    const local_node_y_pos = is_honest ? nodeYPos + nodeYMove : nodeYPos;

                    initialNodes.push({
                        id: '\"' + node.id + '\"',
                        data: {
                            label: node.full_name, //node.tip_npo_name + ' - ' + node.name,
                            customize: [true, true, false, true],
                            width: nodeWidth,
                            height: nodeHeight,
                            tip_npo_id: node.tip_npo_id,
                            node_id: node.id,
                            hidden: false,
                            left_to_right: props.left_to_right,
                        },
                        type: 'customizable',
                        position: { x: nodeXPos, y: local_node_y_pos },
                    });

                    initialEdges.push({
                        id: 'e' + node.parent_id + '-' + node.id,
                        target: '\"' + node.parent_id + '\"',
                        source: '\"' + node.id + '\"',
                        type: 'step',
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                    });


                    if (!is_honest) {
                        is_honest = true;
                    }
                    else {
                        nodeXPos -= nodeXMove;

                        is_honest = false;
                    }
                }

                if (minXNodePos > nodeXPos) {
                    minXNodePos = nodeXPos;
                }

                nodeXPos = local_node_x_pos;
                nodeYPos -= nodeYMove;
            }

            nodeXPos += (minXNodePos - nodeXMove);
            nodeYPos = 0;

            index += local_coutn_for_groups;
        }
    }

    // Setting react flow scheme
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    //салават
    const hide = (hidden, childEdgeID, childNodeID) => (nodeOrEdge) => {
        if (
            childEdgeID.includes(nodeOrEdge.id) ||
            childNodeID.includes(nodeOrEdge.id)
        )
            nodeOrEdge.hidden = hidden;
        return nodeOrEdge;
    };

    const checkTarget = (edge, id) => {
        let edges = edge.filter((ed) => {
            return ed.target !== id;
        });
        return edges;
    };

    let isChangingByNodeClick = false;
    let outgoers = [];
    let connectedEdges = [];
    let stack = [];
        
    const nodeClick = (some, node) => {
        if (isChangingByNodeClick || node.data.isGroupNode == true)
            return;

        isChangingByNodeClick = true;

        if (node.data.action_type == 0) {
            node.data.handleReloadNodeInformation(null);
        }
        else if (node.data.action_type == 1) {
            let currentNodeID = node.id;

            stack.push(node);

            while (stack.length > 0) {
                let lastNOde = stack.pop();
                let childnode = getOutgoers(lastNOde, nodes, edges);

                let childedge = checkTarget(
                    getConnectedEdges([lastNOde], edges),
                    currentNodeID
                );

                childnode.map((goer, key) => {
                    stack.push(goer);
                    outgoers.push(goer);
                });

                childedge.map((edge, key) => {
                    connectedEdges.push(edge);
                });
            }

            let childNodeID = outgoers.map((node) => {
                return node.id;
            });

            let childEdgeID = connectedEdges.map((edge) => {
                return edge.id;
            });

            const hidden = node.data.hidden == undefined ? false : node.data.hidden;

            setNodes((node) => node.map(hide(!hidden, childEdgeID, childNodeID)));
            setEdges((edge) => edge.map(hide(!hidden, childEdgeID, childNodeID)));

            node.data.hidden = !hidden;
        }

        node.data.action_type = 0;

        isChangingByNodeClick = false;
    };

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds) ),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    const rfStyle = {
        backgroundColor: '#e6f7f1',
    };

    //#e6f7f1  -- светло-зеленый
    //#f5f5f5 -- светло-серый


    //Салават
    const miniMapStyle = {
        background: '#fff',
    };

    const [isDraggable, setIsDraggable] = useState(false);
    const [isSelectable, setIsSelectable] = useState(false);

    return (
        <div style={{ height: 550, width: 1200 }}>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                style={rfStyle}
                onNodeClick={nodeClick}
                elementsSelectable={isSelectable}
                nodesDraggable={isDraggable}
                nodesConnectable={false}
            >
                <Background color="#fff" variant="dots" />
                <MiniMap
                    style={miniMapStyle}
                    nodeColor={nodeColor}
                    nodeStrokeWidth={3}
                    pannable zoomable />
                <Controls />

            </ReactFlow>
        </div>
    );
}
//Салават
function nodeColor(node) {
    switch (node.type) {
        case 'input':
            return '#6ede87';
        case 'output':
            return '#6865A5';
        default:
            return '#038e64'; //темно-зеленый
    }
}

export default MyDiagram;

import React, { Component } from "react"
import { Container, Form, Button, Col, Row } from "react-bootstrap";

import { CommunicationWithServer } from "../FunctionalClasses/CommunicationWithServer"

import MyDiagram, { RadioGroup } from "../Components/Diagram/MyDiagram";
import { CheckboxTreeWidget } from "../Components/CheckboxTree";
import CustomInputDropdown from "../Components/CustomInputDropdown/CustomInputDropdown";

export class Home extends Component {
    constructor(props) {
        super(props);

        this._child = React.createRef();

        this.state = {
            checkboxTreeNodes: [],
            selectedTopProductParkId: -1,
            topProductParkList: null, loadingTopProductParkList: false,
            searchByObjectsFiltersKeys: null, searchByObjectsFilters: [],
            productParkTree: null, loadingProductParkTree: false,
            productParkTreeDiagram: null, productParkTreeDiagramLoading: false,
            productParkTreeDiagramStructureKey: null,
            middle_classification__nodes: null
        };
    }

    componentDidMount() {
        this.loadTopProductParkList();
        this.loadClassification();
    }

    async loadTopProductParkList() {
        this.setState({ topProductParkList: null, loadingTopProductParkList: true });

        const data = await CommunicationWithServer.GetParentInjectionOutList(this.props.is_injection_in_classification);

        if (data != null) {
            this.setState({ topProductParkList: data, selectedTopProductParkId: data[0].id });
        }

        this.setState({ loadingTopProductParkList: false });
    }

    async loadClassification() {
        this.setState({ checkboxTreeNodes: [] });
        let nodes = [];
        let dirtyId = 0;

        const data = await CommunicationWithServer.GetInjectionInOutClassification(this.props.is_injection_in_classification);

        if (data != null) {
            for (const topKey in data) {
                const topNode = data[topKey];
                let topChildren = [];

                for (const middleKey in topNode) {
                    const middleNode = topNode[middleKey];
                    let middleChildren = [];

                    // If length is one present one without node directory
                    if (middleNode.length == 1) {
                        const downElement = middleNode[0];

                        topChildren.push({
                            value: downElement.id,
                            label: downElement.name2,
                        });
                    }
                    else {
                        for (const downElementId in middleNode) {
                            const downElement = middleNode[downElementId];

                            middleChildren.push({
                                value: downElement.id,
                                label: downElement.name2,
                            });
                        }

                        topChildren.push({
                            value: dirtyId--,
                            label: middleKey,
                            children: middleChildren
                        });
                    }
                }

                nodes.push({
                    value: dirtyId--,
                    label: topKey,
                    children: topChildren
                });
            }
        }

        this.setState({ checkboxTreeNodes: nodes });
    }

    async enterAndLoadProductParkTree() {
        this.setState({ searchByObjectsFiltersKeys: null, productParkTree: null, loadingProductParkTree: true });

        const data = this.props.is_injection_in_classification
            ? await CommunicationWithServer.GetInjectionOutTreeTable(this.state.selectedTopProductParkId, this._child.current.getCheckedArray())
            : await CommunicationWithServer.GetInjectionInTreeTable(this.state.selectedTopProductParkId, this._child.current.getCheckedArray());

        if (data.node_edge_dictionary != null) {
            this.state.productParkTree = data.node_edge_dictionary;
            {
                let searchByObjectsFilters = {};
                let searchByObjectsFiltersKeys = [];

                for (let key in data.node_edge_dictionary) {
                    searchByObjectsFiltersKeys.push(key);
                    searchByObjectsFilters[key] = "";
                }

                this.state.searchByObjectsFiltersKeys = searchByObjectsFiltersKeys;
                this.state.searchByObjectsFilters = searchByObjectsFilters;
            }

            this.state.middle_classification__nodes = data.middle_classification__nodes;

            this.renderProductParkDiagramArea();
        }

        this.setState({ loadingProductParkTree: false });
    }

    async renderProductParkDiagramArea() {
        this.setState({ productParkTreeDiagramLoading: true });

        this.setState({
            productParkTreeDiagram:
                <MyDiagram left_to_right={this.props.is_injection_in_classification} table={this.state.productParkTree} diagramStructureKey={this.state.productParkTreeDiagramStructureKey} searchByObjectsFilters={this.state.searchByObjectsFilters} />
        });

        this.setState({ productParkTreeDiagramLoading: false });
    }

    render() {
        let topProductParkSelectList = !this.state.loadingTopProductParkList && this.state.topProductParkList != null
            ? this.state.topProductParkList.map(topProductPark => <option value={topProductPark.id}>{topProductPark.name} ({topProductPark.id})</option>)
            : null;
        let productParkTreeDiagram = !this.state.loadingProductParkTree && !this.state.productParkTreeDiagramLoading && this.state.productParkTreeDiagram != null
            ? this.state.productParkTreeDiagram
            : null; // <MyDiagram table={[]} searchByObjectsFilters={null} />;

        if (this.state.productParkTreeDiagramLoading) {
            this.renderProductParkDiagramArea();
        }

        const update_array_search_by_key = (searchByObjectsFilters) => {
            this.setState({ searchByObjectsFilters: searchByObjectsFilters });
        };

        const radioGroupName = 'group1';

        const radioGroupOnClick = (key) => this.setState({ productParkTreeDiagramStructureKey: key });

        const handleClickLoad = () => this.enterAndLoadProductParkTree();

        return (
            <div className="content-container" >
                <Container fluid>
                    <Row>
                        <Col xs="auto">
                            <Form>
                                <Form.Group className="mb-3"
                                    value={this.state.selectedTopProductParkId}
                                    onChange={e => this.setState({ selectedTopProductParkId: e.target.value })}>
                                    <Form.Label>Товарный парк</Form.Label>
                                    <Form.Select disabled={this.state.topProductParkList == null || this.state.loadingTopProductParkList || this.state.loadingProductParkTree}>
                                        {topProductParkSelectList}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group>
                                    {<CheckboxTreeWidget ref={this._child} nodes={this.state.checkboxTreeNodes} />}
                                </Form.Group>
                                <Form.Group className="mt-3">
                                    <Form.Label>Вид схемы:</Form.Label>
                                    {RadioGroup.map((radioGroupButton) =>
                                        <Form.Check
                                            label={radioGroupButton.label}
                                            name={radioGroupName}
                                            type='radio'
                                            id={radioGroupButton.id}
                                            onClick={e => radioGroupOnClick(radioGroupButton.key)}
                                        />
                                    )}
                                </Form.Group>

                                <Button className="mt-3 mb-3 button" type="button"
                                    variant="success"
                                    disabled={this.state.loadingProductParkTree || this.state.selectedTopProductParkId <= 0 || this.state.productParkTreeDiagramStructureKey == null}
                                    style={{ backgroundColor: '#038e64', }}
                                    onClick={handleClickLoad}>
                                    {!this.state.loadingProductParkTree ? "Отобразить" : "Загружается"}
                                </Button>
                            </Form>
                        </Col>

                        <Col xs="auto">
                            <>
                                {this.state.searchByObjectsFiltersKeys != null
                                    ? (
                                        <Row>
                                            <Row className="mt-2">
                                                <Row>Параметры фильтрации</Row>
                                                <Row className="mt-2">
                                                    <Row>
                                                        {this.state.searchByObjectsFiltersKeys.map(key =>
                                                            <Col className="mb-3">
                                                                <Form.Group>
                                                                    <CustomInputDropdown placeholder={key} updateArraySearchByKey={update_array_search_by_key}
                                                                        value={this.state.searchByObjectsFilters} objectsToDropdown={this.state.middle_classification__nodes[key]} />
                                                                </Form.Group>
                                                            </Col>
                                                        )}

                                                        <Col md="auto" className="mb-3">
                                                            <Form.Group style={{ height: "100%", } }>
                                                                <Button className="button"
                                                                    variant="success"
                                                                    type="button"
                                                                    style={{ backgroundColor: '#038e64', height: "100%", }}
                                                                    onClick={() => this.setState({ productParkTreeDiagramLoading: true })}
                                                                    disabled={this.state.productParkTreeDiagramLoading}>
                                                                    Поиск
                                                                </Button>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </Row>
                                            </Row>
                                        </Row>)
                                    : null}
                            </>
                            <Row>
                                {productParkTreeDiagram}
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

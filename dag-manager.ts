import { Dag, DagNode } from "d3-dag/dist/dag/index.js";
import { NodeData } from "./node-data";
import { DefaultStratifyOperator } from "d3-dag/dist/dag/create";
import { dagStratify } from "d3-dag";
import { arrayUnique } from "./array-unique.js";

class DagManager {
    private data: NodeData[];
    private dag: Dag<NodeData, undefined>;
    private stratify: DefaultStratifyOperator;

    public constructor(data: NodeData[]) {
        this.data = data;
        this.stratify = dagStratify();
        this.dag = this.stratify(data);
        this.dag.depth();
    }

    public setData(node: DagNode<NodeData>, data: NodeData) {
        this.data[Number(node.data.id)] = data;
    }

    public getDag() {
        return this.dag;
    }

    public createDag() {
        this.dag = this.stratify(this.data);
        this.dag.depth();
        return this.dag;
    }

    public isCyclic(node: DagNode<NodeData, undefined>, newDataParents: string[]) {
        if (node.descendants().some(({ data }) => {
            if (newDataParents.includes(data.id)) {
                return true;
            }
        })) {
            return true;
        }
        return false;
    }

    public addOrUpdateNode(newData: NodeData) {
        const node = this.getNode(newData.id);
        if (node) {
            if (this.isCyclic(node, newData.parentIds)) {
                return 'cycle!!!';
            }
        }
        const updateNode = this.getNode(newData.id);
        if (updateNode) {
            this.setData(updateNode, newData);
            this.createDag();
        }
    }

    public getNode(key: string) {
        return this.dag.descendants().find((node) => {
            if (node.data.id === key) {
                return node;
            }
        });
    }

    public getFamilyGenerations(node: DagNode<NodeData, undefined>, generations: number) {
        const ancestors = arrayUnique(this.getAncestors(node.data, generations, []));
        const descendants = arrayUnique(this.getDescendants(node.data, generations + 1, []));
        let data = ancestors.concat(node.data);
        data = arrayUnique(data.concat(descendants));
        this.data = arrayUnique(this.removeReferences(data));
        this.createDag();
    }

    public getAncestors(nodeData: NodeData, generations: number, ancestors: NodeData[]): NodeData[] {
        if (generations > 0) {
            nodeData.parentIds.forEach((parentId) => {
                const ancestor = this.getNode(parentId);
                if (ancestor) {
                    generations--;
                    ancestors.push(ancestor.data);
                    return this.getAncestors(ancestor.data, generations, ancestors);
                }
            });
        }
        return ancestors;
    }

    public getDescendants(nodeData: NodeData, generations: number, descendants: NodeData[]): NodeData[] {
        if (generations > 0) {
            const node = this.getNode(nodeData.id);
            if (node) {
                node.children().forEach((childNode) => {
                    generations--;
                    descendants.push(childNode.data);
                    return this.getDescendants(childNode.data, generations, descendants);
                });
            }
        }
        return descendants;
    }

    public addLink(firstNode: NodeData, secondNode: NodeData) {
        firstNode.parentIds.push(secondNode.id);
        this.addOrUpdateNode(firstNode);
    }

    public removeLink(dataKey: string, removeKey: string) {
        const dataNode = this.getNode(dataKey);
        if (dataNode) {
            dataNode.data.parentIds = dataNode.data.parentIds.filter(parentId => parentId !== removeKey);
            this.setData(dataNode, dataNode.data);
            this.createDag();
        }
    }

    public removeReferences(data: NodeData[]) {
        data.forEach(({ parentIds }) => {
            parentIds.forEach((parentId, index) => {
                let flag = false;
                data.forEach(({ id }) => {
                    if (id === parentId) {
                        flag = true;
                    }
                });
                if (!flag) {
                    parentIds.splice(index, 1);
                }
            });
        });
        return data;
    }
}

export { DagManager };

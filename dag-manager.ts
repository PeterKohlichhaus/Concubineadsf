import { Dag, DagNode } from "d3-dag/dist/dag/index.js";
import { NodeData } from "./node-data";
import { data } from "./data.js";
import { DefaultStratifyOperator } from "d3-dag/dist/dag/create";
import { dagStratify } from "d3-dag";

function arrayUnique(array: NodeData[]) {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
    }

    return a;
}

class DagManager {
    public data: NodeData[];
    public dag: Dag<NodeData, undefined>;
    public stratify: DefaultStratifyOperator;

    public constructor(data: NodeData[]) {
        this.data = data;
        this.stratify = dagStratify();
        this.dag = this.stratify(data);
        this.dag.depth();
    }

    public createDag() {
        this.dag = this.stratify(this.data);
        this.dag.depth();
        return this.dag;
    }

    public addOrUpdateNode(newData: NodeData) {
        const node = this.dag.descendants().find((node) => {
            return node.data.id === newData.id;
        });
        if (node) {
            node.descendants().forEach((descendant) => {
                const newIdx = newData.parentIds.find((parentId) => {
                    return parentId === descendant.data.id;
                });

                if (newIdx) {
                    throw "cycle";
                }
            });
        }

        const index = this.data.findIndex((data) => {
            return data.id === newData.id;
        });
        this.data[index] = newData;
        this.createDag();
    }

    public getNode(key: string) {
        for (const node of this.dag) {
            if (node.data.id === key) {
                return node;
            }
        }
    }

    public getDimension() {
        let x = 0;
        let y = 0;

        for (const node of this.dag) {
            if (node.x && node.y) {
                x = Math.max(x, node.x);
                y = Math.max(y, node.y);
            }
        }

        return [x + .5, y + .5];
    }

    public getFamilyGenerations(node: DagNode<NodeData, undefined>, generations: number) {
        const ancestors = arrayUnique(this.getAncestors(node.data, generations, []));
        const descendants = arrayUnique(this.getDescendants(node.data, generations + 1, []));
        let data = ancestors.concat(node.data);
        data = arrayUnique(this.removeReferences(data));
        this.data = arrayUnique(data.concat(descendants));
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

    public getData(node: DagNode<NodeData, undefined>) {
        return this.data[this.getDataIndex(node)];
    }

    public getDataIndex(node: DagNode<NodeData, undefined>) {
        return data.findIndex(dataNode => { return dataNode.id === node.data.id; });
    }

    public removeNode(deleteNode: DagNode<NodeData, undefined>) {
        this.removeNodeHelper(deleteNode);
        this.createDag();
    }

    public removeNodeHelper(deleteNode: DagNode<NodeData, undefined>) {
        for (const node of this.dag) {
            node.data.parentIds.forEach((parentId, index) => {
                if (parentId === deleteNode.data.id) {
                    node.data.parentIds.splice(index, 1);
                }
            });
        }
        const deleteIndex = this.getDataIndex(deleteNode);
        this.data.splice(deleteIndex, 1);
    }

    // Remove parentIds that references data.id's that do not exist
    public removeReferences(data: NodeData[]) {
        // loop through data
        for (let i = 0; i < data.length; i++) {
            // cache length because it's slicing from the array it's iterating over
            const cachedLength = data[i].parentIds.length;
            for (let j = 0; j < cachedLength; j++) {
                // loop through data a second time (witin the scope of the parentId loop)
                let flag = false;
                data.forEach((p) => {
                    if (p.id === data[i].parentIds[j]) {
                        flag = true;
                    }
                });
                //console.log(flag, data[i], j);
                if (!flag) {
                    data[i].parentIds = data[i].parentIds.slice(j, 1);
                }
            }
        }
        return data;
    }
}

export { DagManager };

import { dagStratify } from "d3-dag";
import { arrayUnique } from "./array-unique.js";
class DagManager {
    constructor(data) {
        this.data = data;
        this.stratify = dagStratify();
        this.dag = this.stratify(data);
        this.dag.depth();
    }
    setData(node, data) {
        this.data[Number(node.data.id)] = data;
    }
    getDag() {
        return this.dag;
    }
    createDag() {
        this.dag = this.stratify(this.data);
        this.dag.depth();
        return this.dag;
    }
    isCyclic(node, newDataParents) {
        if (node.descendants().some(({ data }) => {
            if (newDataParents.includes(data.id)) {
                return true;
            }
        })) {
            return true;
        }
        return false;
    }
    addOrUpdateNode(newData) {
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
    getNode(key) {
        return this.dag.descendants().find((node) => {
            if (node.data.id === key) {
                return node;
            }
        });
    }
    getFamilyGenerations(node, generations) {
        const ancestors = arrayUnique(this.getAncestors(node.data, generations, []));
        const descendants = arrayUnique(this.getDescendants(node.data, generations + 1, []));
        let data = ancestors.concat(node.data);
        data = arrayUnique(data.concat(descendants));
        this.data = arrayUnique(this.removeReferences(data));
        this.createDag();
    }
    getAncestors(nodeData, generations, ancestors) {
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
    getDescendants(nodeData, generations, descendants) {
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
    addLink(firstNode, secondNode) {
        firstNode.parentIds.push(secondNode.id);
        this.addOrUpdateNode(firstNode);
    }
    removeLink(dataKey, removeKey) {
        const dataNode = this.getNode(dataKey);
        if (dataNode) {
            dataNode.data.parentIds = dataNode.data.parentIds.filter(parentId => parentId !== removeKey);
            this.setData(dataNode, dataNode.data);
            this.createDag();
        }
    }
    removeReferences(data) {
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

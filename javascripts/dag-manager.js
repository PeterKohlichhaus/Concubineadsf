import { data } from "./data.js";
import { dagStratify } from "d3-dag";
function arrayUnique(array) {
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
    constructor(data) {
        this.data = data;
        this.stratify = dagStratify();
        this.dag = this.stratify(data);
        this.dag.depth();
    }
    createDag() {
        this.dag = this.stratify(this.data);
        this.dag.depth();
        return this.dag;
    }
    addOrUpdateNode(newData) {
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
    getNode(key) {
        for (const node of this.dag) {
            if (node.data.id === key) {
                return node;
            }
        }
    }
    getFamilyGenerations(node, generations) {
        const ancestors = arrayUnique(this.getAncestors(node.data, generations, []));
        const descendants = arrayUnique(this.getDescendants(node.data, generations + 1, []));
        let data = ancestors.concat(node.data);
        data = arrayUnique(this.removeReferences(data));
        this.data = arrayUnique(data.concat(descendants));
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
    getData(node) {
        return this.data[this.getDataIndex(node)];
    }
    getDataIndex(node) {
        return data.findIndex(dataNode => { return dataNode.id === node.data.id; });
    }
    removeNode(deleteNode) {
        this.removeNodeHelper(deleteNode);
        this.createDag();
    }
    removeNodeHelper(deleteNode) {
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
    removeReferences(data) {
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

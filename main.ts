import { data, DagManager, DagRenderer } from "./person-dag.js";

const dagManager = new DagManager(data);

const error = dagManager.addOrUpdateNode({
    "id": "7",
    "name": "bajskorv",
    "parentIds": ["0"],
    "color": "#dddddd"
});


dagManager.removeLink("7", "0");

const node1 = dagManager.getNode("7");
const node2 = dagManager.getNode("0");

if (node1 && node2) {
    dagManager.addLink(node1.data, node2.data);
}


if (error) {
    throw error;
}
/*
const meNode = dagManager.getNode("2");
if (meNode) {
    dagManager.getFamilyGenerations(meNode, 8);
}*/

const newRender = new DagRenderer(dagManager.getDag(), 800, 1000, 160, 80, 35);
newRender.createImage();


//const testData = dagManager.removeMissingParents(dagManager.data);


import { data, DagManager, DagRenderer } from "./person-dag.js";

const dagManager = new DagManager(data);

const deletionNode = dagManager.getNode("5");
if (deletionNode) {
    dagManager.removeNode(deletionNode);
}

dagManager.addOrUpdateNode({
    "id": "4",
    "name": "bajskorv",
    "parentIds": ["2", "0"],
    "color": "#dddddd"
});

const meNode = dagManager.getNode("2");
if (meNode) {
    dagManager.getFamilyGenerations(meNode, 2);
}

const newRender = new DagRenderer(dagManager.getDag(), 600, 800, 160, 80, 35);
newRender.createImage();

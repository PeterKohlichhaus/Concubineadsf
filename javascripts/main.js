import { data, DagManager, Render } from "./person-dag.js";
const dagManager = new DagManager(data);
const oldRender = new Render(dagManager.dag, 640, 1200);
console.log(oldRender.stringifySvg());
const deletionNode = dagManager.getNode("5");
if (deletionNode) {
    dagManager.removeNode(deletionNode);
    dagManager.createDag();
}
dagManager.addOrUpdateNode({
    "id": "4",
    "name": "bajskorv",
    "parentIds": ["2"],
    "color": "#666666"
});
const meNode = dagManager.getNode("2");
if (meNode) {
    dagManager.getFamilyGenerations(meNode, 2);
}
const newRender = new Render(dagManager.dag, 640, 1080);
console.log(newRender.stringifySvg());

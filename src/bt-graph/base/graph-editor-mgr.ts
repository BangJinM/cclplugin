import { MessageMgr } from './index';
import { GraphEditorAddOptions, GraphEditorOtherOptions, MessageType } from './internal';

/**
 * graph 的基础操作，增、删
 */
export class GraphEditorMgr {

    static _instance: GraphEditorMgr | null = null;
    public static get Instance(): GraphEditorMgr {
        if (!this._instance) {
            this._instance = new GraphEditorMgr();
        }
        return this._instance;
    }

    private clipboardData: GraphEditorOtherOptions[] = [];

    private lastMousePoint: { x: number; y: number } = { x: 0, y: 0 };
    public get mousePoint() {
        return this.lastMousePoint;
    }

    public get mousePointInPanel() {
        return this.convertsMousePoint(this.lastMousePoint.x, this.lastMousePoint.y);
    }

    shaderGraphPanel: HTMLElement | null = null;
    convertsMousePoint(x: number, y: number) {
        const rect = this.shaderGraphPanel!.getBoundingClientRect();
        return {
            x: x - rect.x,
            y: y - rect.y,
        };
    }

    public addMousePointerListener(shaderGraphPanel: HTMLElement) {
        this.shaderGraphPanel = shaderGraphPanel;
        document.body.addEventListener('mousemove', (event: MouseEvent) => {
            this.lastMousePoint = { x: event.clientX, y: event.clientY };
        });
    }

    /**
     * 剪切板是否为空
     */
    public get clipboardIsNull(): boolean {
        return this.clipboardData.length === 0;
    }
    public add(options: GraphEditorAddOptions) {
        options = JSON.parse(JSON.stringify(options));
        MessageMgr.Instance.send(MessageType.Dirty);
    }

    public async delete(options: GraphEditorOtherOptions[] = []) {
        // const list = mergeGraphEditorOtherOptions(options, this.getSelectedItems());

        // this.graphForge?.startRecording();

        // for (const item of list) {
        //     if (item.blockData) {
        //         const data = item.blockData!;
        //         if (this.isMaster(data.type)) continue;

        //         await this.graphForge?.removeBlock(item.uuid);

        //         if (data.details.inputPins) {
        //             await this.removeRegisterMenuByInputPins(data.details.inputPins);
        //         }
        //     }
        // }
        // for (const item of list) {
        //     if (item.lineData) {
        //         await this.graphForge?.removeLine(item.uuid);
        //     }
        // }
        // this.graphForge?.stopRecording();
        // MessageMgr.Instance.send(MessageType.Dirty);
    }

    public cut(options: GraphEditorOtherOptions[] = []) {
        // const list = mergeGraphEditorOtherOptions(options, this.getSelectedItems());

        // if (list.length > 0) {
        //     this.clipboardData = [];
        //     for (const item of list) {
        //         if (item.lineData) continue;

        //         const data = item.blockData;
        //         if (!data) continue;

        //         if (this.isMaster(data.type)) continue;

        //         this.graphForge.removeBlock(item.uuid);

        //         if (data.details.inputPins) {
        //             this.removeRegisterMenuByInputPins(data.details.inputPins);
        //         }
        //         this.clipboardData.push(item);
        //     }
        // }
    }
    public copy(options: GraphEditorOtherOptions[] = []) {
        // const list = mergeGraphEditorOtherOptions(options, this.getSelectedItems());

        // if (list.length > 0) {
        //     this.clipboardData = [];
        //     for (const item of list) {
        //         if (item.lineData) continue;

        //         const data = item.blockData;
        //         if (!data) continue;

        //         if (this.isMaster(data.type)) continue;

        //         this.clipboardData.push(JSON.parse(JSON.stringify(item)));
        //     }
        // }
    }
    public paste() {
        // const mousePoint = this.graphForge.convertCoordinate({
        //     x: this.mousePointInPanel.x,
        //     y: this.mousePointInPanel.y,
        // });
        // this.usePaste(mousePoint, this.clipboardData);

        // MessageMgr.Instance.send(MessageType.Dirty);
    }

    public undo() {
        // this.graphForge?.undo();
    }

    public redo() {
        // this.graphForge?.redo();
    }

    private usePaste(mousePoint: { x: number; y: number }, list: GraphEditorOtherOptions[]) {
        // const offsetPoint = getOffsetPointByMousePoint(list, mousePoint);

        // const blockIDMap: Map<string, string> = new Map();
        // list.forEach((item: GraphEditorOtherOptions) => {
        //     const newBlockID = generateUUID();
        //     const data = JSON.parse(JSON.stringify(item.blockData));
        //     data.position.x += offsetPoint.x;
        //     data.position.y += offsetPoint.y;
        //     this.graphForge.addBlock(data, newBlockID);
        //     blockIDMap.set(item.uuid, newBlockID);
        // });

        // const blockMap = ForgeMgr.Instance.getBlockMap();

        // // 为了用于去重
        // const noDuplicatesArray: string[] = [];
        // const newLines: LineData[] = [];
        // list.forEach((item: GraphEditorOtherOptions) => {
        //     const block = blockMap[item.uuid];
        //     block.getOutputPinsList().forEach((pin: Pin) => {
        //         pin.connectPins.forEach((connectPin: Pin) => {
        //             // 如果拷贝输出的 block 没有包含在选中的 block 中就不需要添加 line
        //             const outputNode = blockIDMap.get(connectPin.block.uuid);
        //             if (!outputNode) return;

        //             const newLineInfo: LineData = {
        //                 type: 'curve',
        //                 input: {
        //                     node: blockIDMap.get(pin.block.uuid) || pin.block.uuid,
        //                     param: pin.desc.tag,
        //                 },
        //                 output: {
        //                     node: blockIDMap.get(connectPin.block.uuid) || connectPin.block.uuid,
        //                     param: connectPin.desc.tag,
        //                 },
        //                 details: {},
        //             };
        //             const tag = newLineInfo.input.node + newLineInfo.input.param +
        //                 newLineInfo.output.node + newLineInfo.output.param;

        //             if (!noDuplicatesArray.includes(tag)) {
        //                 noDuplicatesArray.push(tag);
        //                 newLines.push(newLineInfo);
        //             }
        //         });
        //     });
        //     block.getInputPinsList().forEach((pin: Pin) => {
        //         pin.connectPins.forEach((connectPin: Pin) => {
        //             const newLineInfo: LineData = {
        //                 type: 'curve',
        //                 input: {
        //                     node: blockIDMap.get(connectPin.block.uuid) || connectPin.block.uuid,
        //                     param: connectPin.desc.tag,
        //                 },
        //                 output: {
        //                     node: blockIDMap.get(pin.block.uuid) || pin.block.uuid,
        //                     param: pin.desc.tag,

        //                 },
        //                 details: {},
        //             };
        //             const tag = newLineInfo.input.node + newLineInfo.input.param +
        //                 newLineInfo.output.node + newLineInfo.output.param;

        //             if (!noDuplicatesArray.includes(tag)) {
        //                 noDuplicatesArray.push(tag);
        //                 newLines.push(newLineInfo);
        //             }
        //         });
        //     });
        // });

        // // TODO 这里是 hack 如果不加 500 线条会无法添加
        // setTimeout(() => {
        //     newLines.forEach((line: LineData) => {
        //         this.graphForge.addLine(line);
        //     });
        // }, 500);
    }

    public duplicate(options: GraphEditorOtherOptions[] = []) {
        // const list = mergeGraphEditorOtherOptions(options, this.getSelectedItems()).filter((item) => item.blockData !== null);
        // const mousePoint = this.graphForge.convertCoordinate({
        //     x: this.mousePointInPanel.x,
        //     y: this.mousePointInPanel.y,
        // });
        // this.usePaste(mousePoint, list);
        // MessageMgr.Instance.send(MessageType.Dirty);
    }

    public zoomToFit() {
        // this.graphForge.zoomToFit();
    }

    /**
     * 重置，回原点
     */
    public reset() {
        // this.graphForge.setGraphInfo({
        //     scale: 1,
        //     offset: { x: 0, y: 0 },
        // });
    }

    /**
     * 获取当前选择的对象列表
     */
    private getSelectedItems() {
        const list: GraphEditorOtherOptions[] = [];
        // this.graphForge.getSelectedLineList().forEach((item: SelectLineInfo) => {
        //     list.push({
        //         uuid: item.id,
        //         lineData: item.target as LineData,
        //     });
        // });
        // this.graphForge.getSelectedBlockList().forEach((item: SelectNodeInfo) => {
        //     list.push({
        //         uuid: item.id,
        //         blockData: item.target as BlockData,
        //     });
        // });
        return list;
    }
}

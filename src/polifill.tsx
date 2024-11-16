import * as Buffer from "buffer";

window.Buffer = Buffer?.Buffer;
window.Buffer.from = Buffer?.Buffer?.from;

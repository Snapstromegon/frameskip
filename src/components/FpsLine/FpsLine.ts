import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("fps-line")
export class FpsManager extends LitElement {
  static override styles = css`
    :host {
      display: flex;
    }

    #frames {
      width: 100%;
      height: 1rem;
      position: relative;
      overflow: hidden;
      background-color: #000;
    }

    .frame {
      position: absolute;
      top: 0px;
      left: calc(100% * var(--frame) / var(--fps));
      width: calc(100% / var(--fps));
      height: 100%;
      border-left: 1px solid #000;
      box-sizing: border-box;
      background-color: var(--color);
    }
  `;

  @property({ type: Number })
  fps: number = 60;

  @property({ type: Number })
  refFps: number = 60;

  override render() {
    return html`
      <div id="frames">
        ${repeat(
          [...Array(Math.floor(this.fps))],
          (_, i) =>
            html`<span
              class="frame"
              style=${styleMap({
                "--frame": `${i}`,
                "--fps": `${this.fps}`,
                "--color": this.getColor(i),
              })}
              title=${JSON.stringify(this.getFrameInfo(i), undefined, 2)}
            ></span>`
        )}
      </div>
    `;
  }

  getFrameInfo(frame: number) {
    const frameLength = 1 / this.fps;
    const refFrameLength = 1 / this.refFps;
    const frameStart = frameLength * frame;
    const frameEnd = frameStart + frameLength;

    const refStartFrame = Math.floor(frameStart / refFrameLength + 1e-5);
    const refStartFrameStart = refStartFrame * refFrameLength;
    const refStartFrameEnd = refStartFrameStart + refFrameLength;

    const refEndFrame = Math.floor(frameEnd / refFrameLength);
    const refEndFrameStart = refEndFrame * refFrameLength;
    const refEndFrameEnd = refEndFrameStart + refFrameLength;

    const startsExact = isNearlySame(frameStart, refStartFrameStart);
    const endsExact = isNearlySame(frameEnd, refEndFrameStart);

    return {
      frameNumber: frame,
      startsExact,
      endsExact,
      frameStart: frameStart,
      frameEnd: frameEnd,
      frameLength: frameLength,
      refStartFrame,
      refStartFrameStart: refStartFrameStart,
      refStartFrameEnd: refStartFrameEnd,
      refEndFrame,
      refEndFrameStart: refEndFrameStart,
      refEndFrameEnd: refEndFrameEnd,
      refFrameLength: refFrameLength,
    };
  }

  getColor(frame: number): string {
    if (this.fps == this.refFps) {
      // It's this case
      return "#aaa";
    }
    const frameInfo = this.getFrameInfo(frame);
    // console.log(frameInfo);

    if (
      frameInfo.refStartFrame -
        (frameInfo.startsExact ? 1 : 0) +
        (frameInfo.endsExact ? 1 : 0) +
        1 <
        frameInfo.refEndFrame &&
      this.fps < this.refFps
    ) {
      // double
      return "#f00";
    }

    if (frameInfo.startsExact) {
      return "#aaa";
    }

    if (
      (frameInfo.refStartFrame === frameInfo.refEndFrame &&
        !frameInfo.startsExact) ||
      (frameInfo.refStartFrame === frameInfo.refEndFrame - 1 &&
        frameInfo.endsExact)
    ) {
      // skipped
      return "#00f";
    }

    if (
      frameInfo.refStartFrame + (frameInfo.endsExact ? 1 : 0) ==
      frameInfo.refEndFrame - 1
    ) {
      return `hsl(${
        100 -
        ((frameInfo.refEndFrameStart - frameInfo.frameStart) /
          (frameInfo.frameEnd - frameInfo.frameStart)) *
          60
      }deg, 100%, 50%)`;
    }

    return "#aaa";
  }
}

const toMsString = (t: number): string => `${(t * 1000).toFixed(3)}ms`;
const isNearlySame = (t1: number, t2: number): boolean =>
  t1 >= t2 - 1e-6 && t1 <= t2 + 1e-6;

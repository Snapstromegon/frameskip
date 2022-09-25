import { LitElement, html, css } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "../FpsLine/FpsLine.ts";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("fps-manager")
export class FpsManager extends LitElement {
  static override styles = css`
    * {
      margin: 0;
      padding: 0;
    }

    header {
      margin-bottom: 1rem;
    }

    main {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 0.2rem 0.5rem;
    }
  `;

  // @state() fpss: Set<number> = new Set([2, 3, 4]);
  @state() fpss: Set<number> = new Set([
    23.976, 24, 25, 29.97, 30, 50, 59.94, 60, 120,
  ]);
  @query("#fps")
  fps?: HTMLInputElement;

  @query("select")
  fpsSelect?: HTMLSelectElement;

  @state() refFps?: number = 30;

  override render() {
    return html`
      <header>
        <form @submit=${this.onAddFPS}>
          <label>Custom FPS: <input type="number" id="fps" step="any" /></label>
          <input type="submit" value="Add FPS" />
        </form>
        <p>
          Current reference FPS:
          <select
            @change=${() => (this.refFps = parseFloat(this.fpsSelect?.value || ""))}
          >
            ${repeat(
              this.fpss,
              (fps) => fps,
              (fps) =>
                html`<option .selected=${fps == this.refFps}>${fps}</option>`
            )}
          </select>
        </p>
      </header>
      <main>
        ${repeat(
          Array.from(this.fpss.values()).sort((a: number, b: number) => a - b),
          (fps) => fps,
          (fps) =>
            html`
              <fps-line fps=${fps} refFps=${ifDefined(this.refFps)}></fps-line>
              <p @click=${() => (this.refFps = fps)}>${fps}</p>
              <button @click=${() => this.deleteFps(fps)}>X</button>
            `
        )}
      </main>
    `;
  }

  onAddFPS(e: SubmitEvent) {
    e.preventDefault();
    if (this.fps && this.fps.value && parseFloat(this.fps.value)) {
      this.addFps(parseFloat(this.fps.value));
    }
    return false;
  }

  addFps(fps: number) {
    this.fpss.add(fps);
    this.requestUpdate();
  }

  deleteFps(fps: number) {
    this.fpss.delete(fps);
    this.requestUpdate();
  }
}

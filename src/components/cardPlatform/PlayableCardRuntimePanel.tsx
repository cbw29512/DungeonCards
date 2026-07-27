import type { CardDefinition } from "../../types/cardPlatform";
import type { CardRuntimeInstance } from "../../types/cardPlatformRuntime";
import { CardPlatformDefinitionCard } from "./CardPlatformDefinitionCard";

type Props = {
  definition: CardDefinition;
  instance: CardRuntimeInstance;
  position: number;
  total: number;
  onMove(direction: -1 | 1): void;
  onRemove(): void;
  onUpdateText(updates: { customName?: string; notes?: string }): void;
  onAdjustResource(resourceId: string, delta: number): void;
  onResetResource(resourceId: string): void;
  onResetCard(): void;
};

export const PlayableCardRuntimePanel = (props: Props) => (
  <article className="playable-card-runtime">
    <div className="playable-card-runtime__origin">
      <span>Copy {props.position + 1} of {props.total}</span>
      <strong>{props.instance.customName || props.definition.content.title}</strong>
    </div>
    <CardPlatformDefinitionCard card={props.definition} />
    <section className="playable-card-runtime__controls" aria-label={`Runtime controls for ${props.definition.content.title}`}>
      <div className="playable-card-runtime__order">
        <button disabled={props.position === 0} onClick={() => props.onMove(-1)} type="button">Move earlier</button>
        <button disabled={props.position === props.total - 1} onClick={() => props.onMove(1)} type="button">Move later</button>
        <button onClick={props.onRemove} type="button">Remove copy</button>
      </div>
      <label>
        <span>Custom name</span>
        <input defaultValue={props.instance.customName ?? ""} key={`${props.instance.id}-name-${props.instance.customName ?? ""}`} onBlur={(event) => props.onUpdateText({ customName: event.target.value })} placeholder={props.definition.content.title} />
      </label>
      <label>
        <span>Runtime notes</span>
        <textarea defaultValue={props.instance.notes} key={`${props.instance.id}-notes-${props.instance.notes}`} onBlur={(event) => props.onUpdateText({ notes: event.target.value })} rows={3} />
      </label>
      {props.definition.resources.length > 0 && (
        <div className="playable-card-runtime__resources">
          {props.definition.resources.map((resource) => {
            const current = props.instance.resourceState[resource.id] ?? 0;
            const maximum = resource.maximum;
            const unlimited = maximum === "unlimited";
            const atMaximum = maximum !== "unlimited" && current >= maximum;
            return (
              <article key={resource.id}>
                <div><strong>{resource.label}</strong><span>{unlimited ? "Unlimited" : `${current} / ${maximum}`} · {resource.refresh.replaceAll("-", " ")}</span></div>
                <div>
                  <button disabled={unlimited || current <= 0} onClick={() => props.onAdjustResource(resource.id, -1)} type="button">−</button>
                  <button disabled={unlimited || atMaximum} onClick={() => props.onAdjustResource(resource.id, 1)} type="button">+</button>
                  <button onClick={() => props.onResetResource(resource.id)} type="button">Reset</button>
                </div>
              </article>
            );
          })}
          <button onClick={props.onResetCard} type="button">Reset all card resources</button>
        </div>
      )}
    </section>
  </article>
);

import type { CardDefinition } from "../../types/cardPlatform";
import type { CardRuntimeInstance } from "../../types/cardPlatformRuntime";
import type { CardDeckLibraryController } from "../../hooks/useCardDeckLibrary";
import { PlayableLinkActionControl } from "./PlayableLinkActionControl";
import { PlayableProcedureActionControl } from "./PlayableProcedureActionControl";
import { PlayableRollActionControl } from "./PlayableRollActionControl";

export const PlayableCardActions = ({
  controller,
  deckId,
  definition,
  instance
}: {
  controller: CardDeckLibraryController;
  deckId: string;
  definition: CardDefinition;
  instance: CardRuntimeInstance;
}) => {
  if (definition.actions.length === 0) return null;
  return (
    <section className="playable-card-actions" aria-label={`Actions for ${definition.content.title}`}>
      <header><small>Executable actions</small><h3>Use this card</h3></header>
      {definition.actions.map((action) => {
        const result = controller.getActionResult(instance.id, action.id);
        if (action.kind === "roll") return (
          <PlayableRollActionControl
            action={action}
            definition={definition}
            key={action.id}
            onExecute={(options) => controller.executeAction(deckId, instance.id, action, options)}
            result={result}
          />
        );
        if (action.kind === "procedure") return (
          <PlayableProcedureActionControl
            action={action}
            definition={definition}
            key={action.id}
            onComplete={() => controller.executeAction(deckId, instance.id, action)}
            result={result}
          />
        );
        return (
          <PlayableLinkActionControl
            action={action}
            definition={definition}
            key={action.id}
            onOpen={() => controller.executeAction(deckId, instance.id, action)}
            result={result}
          />
        );
      })}
    </section>
  );
};

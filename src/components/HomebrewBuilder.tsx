import { useHomebrewCardDraft } from "../hooks/useHomebrewCardDraft";
import type { HomebrewCardDraft } from "../types/cards";
import type { RulesetId } from "../types/ruleCards";
import { HomebrewCardForm } from "./HomebrewCardForm";
import { HomebrewCardPreview } from "./HomebrewCardPreview";

type HomebrewBuilderProps = {
  ruleset: RulesetId;
  onCreate(draft: HomebrewCardDraft): boolean;
  onRulesetChange(ruleset: RulesetId): void;
  storageError: string | null;
};

export const HomebrewBuilder = ({
  ruleset,
  onCreate,
  onRulesetChange,
  storageError
}: HomebrewBuilderProps) => {
  const controller = useHomebrewCardDraft({ ruleset, onCreate });

  return (
    <section className="homebrew-builder" aria-labelledby="homebrew-builder-title">
      <div className="section-heading">
        <p>Homebrew Builder · {ruleset === "srd-5.1-2014" ? "2014" : "2024"}</p>
        <h2 id="homebrew-builder-title">Build the card while looking at the card.</h2>
        <span>
          Every field updates the finished-size preview immediately. The saved card remains isolated
          to the selected D&amp;D edition.
        </span>
      </div>

      <div className="homebrew-builder__workspace">
        <HomebrewCardForm
          controller={controller}
          onRulesetChange={onRulesetChange}
          ruleset={ruleset}
          storageError={storageError}
        />
        <HomebrewCardPreview card={controller.previewCard} />
      </div>
    </section>
  );
};

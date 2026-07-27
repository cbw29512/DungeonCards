import { useState, type FormEvent } from "react";
import type { DndCharacterVaultState } from "../../hooks/useDndCharacterVault";
import type { DndSavedCharacterState } from "../../types/dndCharacterVault";

const editionLabel = (character: DndSavedCharacterState): string =>
  character.ruleset === "srd-5.1-2014" ? "2014" : "2024";

export const DndVaultAccountPanel = ({ vault }: { vault: DndCharacterVaultState }) => {
  const [email, setEmail] = useState("");

  const submitMagicLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void vault.signInWithMagicLink(email);
  };

  const permanentlyDelete = (character: DndSavedCharacterState) => {
    const confirmed = window.confirm(`Permanently delete ${character.displayName}? This cannot be undone.`);
    if (confirmed) void vault.deleteCharacter(character);
  };

  if (!vault.configured) {
    return (
      <aside className="vault-account vault-account--local" aria-label="Character Vault account status">
        <div><p>Local-only mode</p><h3>Printing works. Cloud saves are not configured yet.</h3></div>
        <small>Add the Supabase project URL and publishable key to enable private player accounts.</small>
      </aside>
    );
  }

  return (
    <section className="vault-account" aria-labelledby="vault-account-title">
      <header className="vault-account__header">
        <div>
          <p>Private player storage</p>
          <h3 id="vault-account-title">Character Vault account</h3>
        </div>
        {vault.session && (
          <button disabled={vault.busy} onClick={() => void vault.signOut()} type="button">Sign out</button>
        )}
      </header>

      {!vault.session ? (
        <div className="vault-account__signin">
          <form onSubmit={submitMagicLink}>
            <label>
              Email address
              <input
                autoComplete="email"
                disabled={vault.busy}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="player@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <button disabled={vault.busy} type="submit">Email me a secure sign-in link</button>
          </form>
          <span aria-hidden="true">or</span>
          <button disabled={vault.busy} onClick={() => void vault.signInWithGoogle()} type="button">
            Continue with Google
          </button>
          <small>No password is stored by Dungeon Cards. Saved characters are restricted to the signed-in owner.</small>
        </div>
      ) : (
        <div className="vault-account__signed-in">
          <div className="vault-account__identity">
            {vault.session.user.avatarUrl
              ? <img alt="" src={vault.session.user.avatarUrl} />
              : <span aria-hidden="true">{vault.session.user.displayName.slice(0, 1).toUpperCase()}</span>}
            <div><strong>{vault.session.user.displayName}</strong><small>{vault.session.user.email}</small></div>
          </div>
          <div className="vault-account__saved-heading">
            <h4>Saved characters</h4><span>{vault.savedCharacters.length}</span>
          </div>
          {vault.savedCharacters.length === 0 ? (
            <p className="vault-account__empty">Choose a Vault Ready sheet below and select <strong>Save character</strong>.</p>
          ) : (
            <ul className="vault-account__saved-list">
              {vault.savedCharacters.map((character) => (
                <li aria-current={vault.activeCharacter?.id === character.id ? "true" : undefined} key={character.id}>
                  <div>
                    <strong>{character.displayName}</strong>
                    <span>{editionLabel(character)} · Level {character.level} · HP {character.currentHitPoints}</span>
                    <small>Updated {new Date(character.updatedAt).toLocaleString()}</small>
                  </div>
                  <div className="vault-account__saved-actions">
                    <button disabled={vault.busy} onClick={() => void vault.openCharacter(character)} type="button">Open</button>
                    <button disabled={vault.busy} onClick={() => void vault.duplicateCharacter(character)} type="button">Duplicate</button>
                    <button disabled={vault.busy} onClick={() => void vault.archiveCharacter(character)} type="button">Archive</button>
                    <button className="danger" disabled={vault.busy} onClick={() => permanentlyDelete(character)} type="button">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div aria-live="polite" className="vault-account__feedback">
        {vault.busy && <span>Working…</span>}
        {vault.feedback && <span>{vault.feedback}</span>}
        {vault.error && <span role="alert">{vault.error}</span>}
      </div>
    </section>
  );
};

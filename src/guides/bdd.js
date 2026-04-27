export function getBDDGuidanceHTML() {
  return `
    <h1>Protagonist-First Structure (BDD Style)</h1>
    <p>If you struggle to start sentences or find your "Protagonist," use the **Given / When / Then** pattern from Behavior-Driven Development (BDD). It forces you to define the context, the actor, and the result before you even start writing.</p>

    <div class="sc-reader-box">
      <h2>1. The "Given-When-Then" Template</h2>
      <ul>
        <li><strong>GIVEN:</strong> The context or starting state (The Scene).</li>
        <li><strong>WHEN:</strong> The action taken by the Protagonist (The Event).</li>
        <li><strong>THEN:</strong> The outcome or value created (The Resolution).</li>
      </ul>
    </div>

    <div class="sc-reader-box">
      <h2>2. Why this fixes "No Structure"</h2>
      <p>Most weak writing starts with a "wind-up" (e.g., "It is important to consider that..."). BDD forces the <strong>Protagonist</strong> to the front of the action.</p>

      <div class="sc-reader-comparison">
        <div class="sc-reader-faulty">
          <strong>Vague & Passive (No Protagonist):</strong><br>
          "There is a need for the system to be updated because users are finding the interface confusing when they try to login."
        </div>
        <div class="sc-reader-better">
          <strong>Protagonist-First (BDD Style):</strong><br>
          "**Given** a user is on the login page,<br>
          **When** they enter incorrect credentials,<br>
          **Then** the system should display a clear error message."
        </div>
      </div>
    </div>

    <h2>3. From Scenario to Narrative</h2>
    <p>You don't have to keep the "Given/When/Then" words in your final draft. Use them as a **scaffold** to find your protagonist, then smooth it out.</p>

    <div class="sc-reader-box">
      <div class="sc-reader-faulty">
        <strong>The "Bad" Paragraph (Hidden Protagonists):</strong><br>
        <p>A decision was made to implement a new notification system. This was because of the fact that customers weren't getting alerts. It is expected that engagement will increase.</p>
      </div>
    </div>

    <div class="sc-reader-arrow" style="font-size: 24px;">&darr;</div>

    <div class="sc-reader-box">
      <div class="sc-reader-better">
        <strong>The "Structured" Narrative (Protagonist-First):</strong><br>
        <p>**Our team** implemented a new notification system. Now, **customers** receive real-time alerts. We expect **this change** to drive higher engagement.</p>
        <p><em>(Notice how every sentence now starts with a clear Protagonist: Our team, Customers, This change.)</em></p>
      </div>
    </div>
  `;
}

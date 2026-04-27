export function getAdvancedStructureHTML() {
  return `
    <h1>Advanced Structure Guide</h1>
    <p>Mastering the "Spine" and "Flow" of your writing ensures that readers don't just understand your words—they follow your logic effortlessly.</p>

    <div class="sc-reader-box">
      <h2>1. The "Spine" Check (Subject-Verb Proximity)</h2>
      <p>The "spine" of a sentence is the shortest path from the <strong>Subject</strong> to the <strong>Verb</strong>. When you bury your verb under a pile of modifiers, the reader loses the action.</p>
      <h3>The Rule:</h3>
      <p>Keep the subject and the verb close together—ideally within 5-6 words. If they are separated by more, the "spine" is broken and the sentence becomes a "noun-like monster."</p>

      <div class="sc-reader-comparison">
        <div class="sc-reader-faulty">
          <strong>Broken Spine:</strong><br>
          "The organization <u>customer journey map</u>, which was developed by the research team over six months, <u>documents</u> every interaction."<br>
          <em>(12 words between subject and verb)</em>
        </div>
        <div class="sc-reader-better">
          <strong>Strong Spine:</strong><br>
          "The <u>journey map documents</u> every interaction. This map was developed by the research team over six months."<br>
          <em>(0 words between subject and verb)</em>
        </div>
      </div>
    </div>

    <div class="sc-reader-box">
      <h2>2. Sentence Flow (The "Bridge" Rule)</h2>
      <p>A paragraph should feel like a single thread, not a series of isolated islands. "Flow" is the lexical bridge that connects one sentence to the next.</p>
      <h3>The Rule:</h3>
      <p>Every sentence should pick up something from the previous one. This can be a <strong>shared noun</strong>, a <strong>pronoun</strong> (like "This" or "These"), or a <strong>logical transition</strong> (like "However" or "Therefore").</p>

      <div class="sc-reader-comparison">
        <div class="sc-reader-faulty">
          <strong>Island Sentences (No Flow):</strong><br>
          "The map documents interactions. Banking has similar issues. Discrepancies in the data lead to confusion. Implementation requires cross-team alignment."
        </div>
        <div class="sc-reader-better">
          <strong>Bridged Sentences (Smooth Flow):</strong><br>
          "The map documents interactions. <u>These interactions</u> reveal where banking has similar issues. <u>Such issues</u> often stem from data discrepancies that lead to confusion. <u>To resolve this confusion</u>, the implementation requires cross-team alignment."
        </div>
      </div>
    </div>

    <h2>Before & After: Putting it Together</h2>
    <p>Watch how fixing the Spine and Flow transforms a dense, confusing paragraph into a clear narrative.</p>

    <div class="sc-reader-box">
      <div class="sc-reader-faulty">
        <strong>The "Bad" Paragraph:</strong><br>
        <p>An evaluation of the current user interface design patterns that were implemented during the last sprint indicates significant friction. Users are unable to find the checkout button. The database performance is also slow. A redesign of the navigation menu is required for better accessibility.</p>
        <ul>
          <li><strong>Spine Issue:</strong> "An evaluation... indicates" is separated by 10 words.</li>
          <li><strong>Flow Issue:</strong> The sentences about the checkout button, database, and redesign jump between topics with no logical "bridge."</li>
        </ul>
      </div>
    </div>

    <div class="sc-reader-arrow" style="font-size: 24px;">&darr;</div>

    <div class="sc-reader-box">
      <div class="sc-reader-better">
        <strong>The "Fixed" Paragraph:</strong><br>
        <p>The <u>current UI design patterns indicate</u> significant friction. <u>This friction</u> is most apparent when users struggle to find the checkout button. <u>Beyond the UI</u>, the system is further hampered by slow database performance. <u>To address these combined issues</u>, we must redesign the navigation menu for better accessibility.</p>
        <ul>
          <li><strong>Spine Fixed:</strong> Subject and verb are adjacent in the first sentence.</li>
          <li><strong>Flow Fixed:</strong> "This friction" bridges to the first sentence. "Beyond the UI" bridges to the button issue. "To address these combined issues" bridges to both UI and performance.</li>
        </ul>
      </div>
    </div>
  `;
}

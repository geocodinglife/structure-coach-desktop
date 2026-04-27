export function getParamedicMethodHTML() {
  return `
    <h1>The "Paramedic Method"</h1>
    <p>Modified from Lanham, R (2007). <em>Revising Prose</em>, 5th ed.</p>
    <p>The Paramedic Method is <strong>emergency therapy, a first aid kit, a quick, self-teaching method</strong> for translating "Official Style" English into "plain" English. Lanham provides clear steps to correct common writing problems. These are tools, not hard-and-fast rules, for writing clear, concise easier to read sentences. The goal is attention economy, obtained by removing the lard so that your reader spends their scarce time efficiently.</p>

    <div class="sc-reader-box">
      <h3>Paramedic Editing Steps:</h3>
      <ol>
        <li><strong>Underline or highlight the prepositional phrases.</strong> (e.g. of, to, in, for, on, with, as, by, at, from, per, about...) Prepositions are glue, but because connecting is all they do, every proposition means more dead weight in the sentence.</li>
        <li><strong>Circle the "is" and "to be" verb forms.</strong> (e.g. is, are, was, were, be, been, being, am) Variations of the passive verb "to be" reverse sentence action with the subject being acted on rather than the subject acting upon the object.</li>
        <li><strong>Put a box around nominalizations to identify the primary action.</strong> Nominalizations are adjectives or verbs that have been changed into nouns, usually by adding "-ion".</li>
        <li><strong>Identify the sentence's central action - "Who's doing what whom?"</strong></li>
        <li><strong>Put this action into a simple (not compound) active verb and place the doer as the subject.</strong> Subject — verb — object; Actor > Actor's action > Object of action.</li>
        <li><strong>Keep the base clause near the beginning of the sentence when possible.</strong></li>
        <li><strong>Start fast with no meaningless introductory phrases.</strong></li>
        <li><strong>Eliminate unnecessary words and phrases.</strong></li>
      </ol>
    </div>

    <h2>Five Characteristics of Academic and Bureaucratic Prose</h2>
    <p>Academic writing is an inflated, static style that is less effective than a vigorous, <strong>direct and lean (D and L)</strong> style. Effectiveness is the ratio of what the reader gains vs. how hard the reader works to read the material.</p>
    <ul>
      <li><strong>Nouns emphasized rather than verbs:</strong>
        <div class="sc-reader-comparison">
          <div class="sc-reader-faulty">Academic: A fumigation occurred.</div>
          <div class="sc-reader-better">D and L: The farmer fumigated his field.</div>
        </div>
      </li>
      <li><strong>Static verbs used rather than action verbs:</strong>
        <div class="sc-reader-comparison">
          <div class="sc-reader-faulty">Academic: The field was fumigated by the farmer.</div>
          <div class="sc-reader-better">D and L: The farmer fumigated his field.</div>
        </div>
      </li>
      <li><strong>Inflated and embellished words:</strong>
        <div class="sc-reader-comparison">
          <div class="sc-reader-faulty">Academic: small faunal species, agricultural laborers</div>
          <div class="sc-reader-better">D and L: rats, farm workers</div>
        </div>
      </li>
      <li><strong>Long and complex sentences:</strong>
        <div class="sc-reader-comparison">
          <div class="sc-reader-faulty">Academic: In so far as manifestations of infestation by a small faunal species were evident in the residential facilities...</div>
          <div class="sc-reader-better">D and L: Because rats infested the house, the farm workers refused to enter.</div>
        </div>
      </li>
    </ul>

    <h2>Guidelines for Revising Scientific and Technical Prose</h2>
    <h3>Avoid "be" verbs</h3>
    <p>Passive voice requires three things: (1) Be (is / are / was / were / been / be) + (2) verb + (3) past form (typically '-ed')</p>
    <ul>
      <li>Was shocked</li>
      <li>Will be found</li>
      <li>Has been determined</li>
    </ul>

    <h3>Avoid nominalizing</h3>
    <p>Changing verbs and adjectives into noun forms. Use verbs (action words) instead of nouns (things) or adjectives (descriptive words).</p>
    <div class="sc-reader-comparison">
      <div>Creation > <strong>create</strong></div>
      <div>Investigation > <strong>investigate</strong></div>
      <div>Evaluation > <strong>evaluate</strong></div>
      <div>Reaction > <strong>react</strong></div>
      <div>Explanation > <strong>explain</strong></div>
      <div>Addition > <strong>add</strong></div>
    </div>

    <h3>Avoid stringing nouns together</h3>
    <div class="sc-reader-comparison">
      <div class="sc-reader-faulty">Faulty: Early childhood thought disorders misdiagnosis often occurs...</div>
      <div class="sc-reader-better">Better: Physicians unfamiliar with the literature on recent research often misdiagnose disordered thought in young children.</div>
    </div>

    <h3>Avoid "it is/was" at the beginning of sentences</h3>
    <div class="sc-reader-comparison">
      <div class="sc-reader-faulty">Faulty: It is recommended that we complete more research.</div>
      <div class="sc-reader-better">Better: We should complete more research.</div>
    </div>

    <h3>Eliminate overused expressions</h3>
    <div class="sc-reader-comparison">
      <div class="sc-reader-faulty">Faulty: Utilization of crystal clear goals...</div>
      <div class="sc-reader-better">Better: If we clarify our goals and objectives...</div>
    </div>

    <h3>Reduce strings of prepositional phrases</h3>
    <div class="sc-reader-comparison">
      <div class="sc-reader-faulty">Faulty: The October 31 deadline for submission of proposals in response to an invitation from the National Science Foundation...</div>
      <div class="sc-reader-better">Better: The deadline for both solicited and unsolicited proposals to the National Science Foundation is October 31.</div>
    </div>
  `;
}

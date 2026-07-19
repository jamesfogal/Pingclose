const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', d => { input += d; });
process.stdin.on('end', () => {
  let sessionId;
  try {
    sessionId = JSON.parse(input).session_id;
  } catch (e) {
    process.exit(0);
  }
  if (!sessionId) process.exit(0);

  const home = process.env.HOME || process.env.USERPROFILE;
  const projDir = path.join(home, '.claude', 'projects', 'C--Projects-pingclose');
  const transcriptPath = path.join(projDir, sessionId + '.jsonl');
  if (!fs.existsSync(transcriptPath)) process.exit(0);

  const currentLines = fs.readFileSync(transcriptPath, 'utf8').split('\n').length;

  const stateFile = path.join(projDir, '.task-checkpoint-' + sessionId + '.json');
  let last = 0;
  let isFirstRun = true;
  if (fs.existsSync(stateFile)) {
    try {
      last = JSON.parse(fs.readFileSync(stateFile, 'utf8')).lastLine || 0;
      isFirstRun = false;
    } catch (e) { /* treat as first run */ }
  }

  if (currentLines - last < 500) process.exit(0);

  fs.writeFileSync(stateFile, JSON.stringify({ lastLine: currentLines, lastCheckpointAt: new Date().toISOString() }));

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago', weekday: 'long', year: 'numeric', month: 'long', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
  });

  const scope = isFirstRun
    ? 'This is the FIRST checkpoint ever - look back roughly the last 24 hours of this conversation instead of just 500 lines, since this session already runs far longer than that and nothing from tonight should be missed.'
    : 'Review roughly the last 500 lines of conversation, since the previous checkpoint.';

  const ctx = 'CHECKPOINT - a 500-line interval has been reached (current date/time for Jim, St. Charles MO / Central: ' + timestamp + '). '
    + 'Do not act on any of this automatically - ask Jim each of the following before continuing with his message: '
    + '1) Should I insert this timestamp (' + timestamp + ') as a visible marker into the chat right now? '
    + '2) ' + scope + ' Should I review it and log any new bugs, decisions, or features into projects/pingclose/TASKS.md, sorted using the CRITICAL / LAUNCH-CRITICAL CLEANUP / PHONE-SYSTEM / BACKLOG tiers already established there? '
    + '3) Report current git status (anything staged, committed-but-not-pushed, or otherwise pending) as information only - never commit or deploy without a separate explicit yes. '
    + '4) Ask: which items on the task list have NOT had a security/stability/health check yet?';

  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: ctx } }));
});

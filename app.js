const state = JSON.parse(localStorage.getItem('english-adventure') || '{"stars":0,"streak":0,"lastDay":""}');
const today = new Date().toDateString();
if (state.lastDay !== today) { state.streak += 1; state.lastDay = today; }
const $ = (s) => document.querySelector(s);
function save(){ localStorage.setItem('english-adventure', JSON.stringify(state)); render(); }
function render(){ $('#streak').textContent=state.streak; $('#stars').textContent='★ '.repeat(Math.min(state.stars,5))+'☆ '.repeat(Math.max(0,5-state.stars)); $('#rewardLeft').textContent=Math.max(0,3-(state.stars%3)); $('#rewardBar').style.width=`${((state.stars%3)/3)*100}%`; }
render();
function americanFemaleVoice(){
  const voices = speechSynthesis.getVoices();
  const preferred = ['Samantha', 'Ava', 'Jenny', 'Zira', 'Joanna', 'Karen', 'Allison'];
  return preferred.map(name => voices.find(voice => voice.name.includes(name) && /^en-US/i.test(voice.lang))).find(Boolean)
    || voices.find(voice => /^en-US/i.test(voice.lang) && /(female|woman|female voice)/i.test(voice.name))
    || voices.find(voice => /^en-US/i.test(voice.lang));
}
function speak(text){
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='en-US'; u.rate=.78; u.pitch=1.08;
    const voice=americanFemaleVoice(); if(voice) u.voice=voice;
    speechSynthesis.speak(u);
  }
}
document.querySelectorAll('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.say));
function show(html){ $('#modalContent').innerHTML=html; $('#modal').hidden=false; }
function close(){ $('#modal').hidden=true; }
$('#closeModal').onclick=close; $('#modal').onclick=e=>{if(e.target.id==='modal')close()};
function earn(message){ state.stars += 1; save(); show(`<div class="modal-art">🎉</div><h2>すごい！</h2><p>${message}</p><p class="hint">ほしを 1こ もらったよ！</p><button class="modal-primary" id="again">もういちど</button>`); $('#again').onclick=close; }
$('#speakPhrase').onclick=()=>{
  speak('I want an apple!'); $('#speechNote').textContent='お手本を聞いたら、マイクで言ってみよう！';
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){ setTimeout(()=>earn('声に出して言えたかな？ Great job!'),700); return; }
  const r=new Recognition();r.lang='en-US';r.interimResults=false; r.onstart=()=>$('#speechNote').textContent='きいているよ… I want an apple!'; r.onresult=e=>{const said=e.results[0][0].transcript; $('#speechNote').textContent=`「${said}」って聞こえたよ！`;earn('英語で言えたね！');};r.onerror=()=>{ $('#speechNote').textContent='もう一度、ゆっくり言ってみよう。'; };r.start();
};
$('#startQuiz').onclick=()=>show(`<div class="modal-art">🐶</div><h2>What is this?</h2><p>これ、なんていう？</p><div class="answer-row"><button data-a="Cat">Cat</button><button data-a="Dog">Dog</button><button data-a="Apple">Apple</button></div><p class="hint" id="quizHint">えらんでみよう！</p>`);
document.addEventListener('click',e=>{if(e.target.dataset.a){ if(e.target.dataset.a==='Dog') earn('Dog! せいかい！'); else $('#quizHint').textContent='おしい！もう一度考えてみよう。'; }});
$('#startTalk').onclick=()=>{speak('Hello! What is your name?');show(`<div class="modal-art">🦊</div><h2>おしゃべりタイム</h2><div class="talk-bubble">Hello! What is your name?</div><p>「My name is ○○!」って言ってみよう。</p><button class="modal-primary" id="talkDone">いえた！</button>`);$('#talkDone').onclick=()=>earn('Nice to meet you! とってもじょうず！');};
$('#parentOpen').onclick=()=>show(`<div class="modal-art">🌱</div><h2>おうちの人へ</h2><p>今日の小さな積み重ね</p><div class="parent-stats"><div><strong>${state.streak}</strong><small>れんぞく日数</small></div><div><strong>${state.stars}</strong><small>ほし</small></div><div><strong>1</strong><small>今日のことば</small></div></div><div class="talk-bubble">今日のフレーズ<br><strong>I want an apple!</strong></div><p class="hint">「何か欲しい時に使えるね」と、日常で一度だけ声をかけてあげてください。</p>`);
$('#navPlay').onclick=()=>$('#startQuiz').click(); $('#navBook').onclick=()=>show(`<div class="modal-art">📚</div><h2>ことばのずかん</h2><p>Apple 🍎　Dog 🐶　Hello 👋</p><p class="hint">毎日ひとつずつ増えていくよ。</p>`); $('#navReward').onclick=()=>show(`<div class="modal-art">🎁</div><h2>ごほうび</h2><p>ほしを3こ集めると、たからばこが開くよ！</p><p class="hint">いま ${state.stars%3} / 3 こ</p>`);

/* ImmigrationOpportunity.com AI Widget JS */
(function(){

  var AFFILIATE_TAG = 'latestfotocom-20';
  var PROXY_URL = 'https://script.google.com/macros/s/AKfycbwX5TIkIg55a0aM5cDv7ESS20xlBiC6qPc0ZEVuifSLVm6BnlkKuf0jo-JPIflccPCY/exec';

  /* ============================================================
     STEP 1 - Read page context
  ============================================================ */
  function getPageContext(){
    var title = '';
    var titleEl = document.querySelector('.post-title') ||
                  document.querySelector('h1.entry-title') ||
                  document.querySelector('h3.post-title') ||
                  document.querySelector('h1') ||
                  document.querySelector('title');
    if(titleEl){ title = titleEl.textContent.trim(); }

    var labelEls = document.querySelectorAll('.post-labels a, .labels a, a[rel="tag"]');
    var labels = [];
    for(var i = 0; i < labelEls.length; i++){
      labels.push(labelEls[i].textContent.trim());
    }

    var bodyText = '';
    var bodyEl = document.querySelector('.post-body') ||
                 document.querySelector('.entry-content') ||
                 document.querySelector('article');
    if(bodyEl){ bodyText = bodyEl.textContent.replace(/\s+/g,' ').trim().substring(0, 600); }

    return {
      title: title,
      labels: labels,
      body: bodyText
    };
  }

  /* ============================================================
     STEP 2 - Call proxy
  ============================================================ */
  function callProxy(systemPrompt, userMessage, callback){
    fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        system: systemPrompt,
        max_tokens: 400,
        messages: [{ role: 'user', content: userMessage }],
        origin: window.location.hostname
      })
    }).then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.content && data.content[0]){
        callback(null, data.content[0].text);
      } else {
        callback('No response', null);
      }
    }).catch(function(err){
      callback(err, null);
    });
  }

  /* ============================================================
     STEP 3 - Build widget shell
  ============================================================ */
  function buildWidget(){
    var ctx = getPageContext();
    var topicHint = ctx.title ? ' about "' + ctx.title + '"' : '';

    var wrap = document.getElementById('ioAiWidget');
    if(!wrap){ return; }

    wrap.innerHTML =
      '<div class="io-ai-header">' +
        '<div class="io-ai-avatar">&#9992;</div>' +
        '<div class="io-ai-header-text">' +
          '<h3>Ask Immigration AI Assistant</h3>' +
          '<p>Your free immigration guide &amp; advisor</p>' +
        '</div>' +
        '<div class="io-ai-status"><div class="io-ai-dot"></div> Online</div>' +
      '</div>' +
      '<div class="io-suggestions">' +
        '<span class="io-sug-label">&#128161; Questions about this article</span>' +
        '<div class="io-sug-pills" id="ioSugPills"><span class="io-sug-pill" style="opacity:0.5">Loading questions...</span></div>' +
      '</div>' +
      '<div class="io-chat-area" id="ioChatArea">' +
        '<div class="io-msg ai">' +
          '<div class="io-msg-avatar">&#9992;</div>' +
          '<div class="io-msg-bubble">' +
            '&#128075; <strong>Hello! I am your Immigration AI Assistant.</strong><br/><br/>' +
            'I have read the article' + topicHint + '. Ask me anything about visas, work permits, study abroad, PR, or immigration processes. I will also suggest helpful books and resources! &#127760;' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="io-input-wrap">' +
        '<div class="io-input-row">' +
          '<textarea class="io-input" id="ioInput" placeholder="Ask about visas, immigration, work permits..." rows="1"></textarea>' +
          '<button class="io-send-btn" id="ioSendBtn" title="Send">&#10148;</button>' +
        '</div>' +
      '</div>' +
      '<p class="io-disclaimer">&#9888; This AI provides general information only. Always verify with official government sources or a licensed immigration consultant.</p>';

    // Load dynamic questions
    loadDynamicQuestions(ctx);

    // Attach events
    document.getElementById('ioSendBtn').addEventListener('click', function(){
      sendMessage(document.getElementById('ioInput').value.trim());
    });
    document.getElementById('ioInput').addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(this.value.trim()); }
    });
    document.getElementById('ioInput').addEventListener('input', function(){
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    document.getElementById('ioSugPills').addEventListener('click', function(e){
      if(e.target.className.indexOf('io-sug-pill') !== -1){ sendMessage(e.target.textContent); }
    });
  }

  /* ============================================================
     STEP 4 - Load questions dynamically from Groq
  ============================================================ */
  function loadDynamicQuestions(ctx){
    var systemPrompt =
      'You are a question generator for an immigration website. ' +
      'Given an article title, labels and excerpt, generate exactly 6 short natural questions a reader would ask after reading this article. ' +
      'Questions must be directly about the article topic. ' +
      'If article is about Canada Express Entry - all 6 questions about Canada Express Entry. ' +
      'If about UK skilled worker visa - all 6 about UK skilled worker visa. ' +
      'If about IELTS - all 6 about IELTS. ' +
      'Keep each question under 12 words. ' +
      'Return ONLY a JSON array of 6 strings. No explanation. No markdown. Example: ' +
      '["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?","Question 6?"]';

    var userMsg =
      'Article title: ' + ctx.title + '\n' +
      'Labels: ' + ctx.labels.join(', ') + '\n' +
      'Excerpt: ' + ctx.body.substring(0, 300);

    callProxy(systemPrompt, userMsg, function(err, response){
      var pills = document.getElementById('ioSugPills');
      if(!pills){ return; }

      if(err || !response){
        pills.innerHTML = '<span class="io-sug-pill">Tell me about ' + ctx.title + '</span>';
        return;
      }

      try {
        var clean = response.trim().replace(/```json|```/g,'').trim();
        var questions = JSON.parse(clean);
        if(!Array.isArray(questions)){ throw new Error('Not array'); }

        var html = '';
        for(var i = 0; i < questions.length && i < 6; i++){
          html += '<span class="io-sug-pill">' + questions[i] + '</span>';
        }
        pills.innerHTML = html;
      } catch(e){
        pills.innerHTML = '<span class="io-sug-pill">Tell me more about ' + ctx.title + '</span>';
      }
    });
  }

  /* ============================================================
     STEP 5 - Amazon books logic - keywords from Groq
  ============================================================ */
  function amazonUrl(keyword){
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword.trim()) + '&tag=' + AFFILIATE_TAG;
  }

  function getAmazonKeywords(aiText, userQuestion, ctx, callback){
    var systemPrompt =
      'You are an Amazon book and resource keyword generator for an immigration website. ' +
      'Given an article topic and an AI answer, generate 2 Amazon search keywords for books or resources directly related to the immigration topic. ' +
      'If article is about Canada Express Entry - return Canada immigration book keywords. ' +
      'If about IELTS - return IELTS preparation book keywords. ' +
      'If about UK visa - return UK immigration guide keywords. ' +
      'Keep each keyword under 6 words. ' +
      'Return ONLY a JSON array of 2 strings. No explanation. No markdown. Example: ' +
      '["Canada immigration guide book","Express Entry preparation 2025"]';

    var userMsg =
      'Article title: ' + ctx.title + '\n' +
      'Labels: ' + ctx.labels.join(', ') + '\n' +
      'User question: ' + userQuestion + '\n' +
      'AI answer summary: ' + aiText.substring(0, 200);

    callProxy(systemPrompt, userMsg, function(err, response){
      if(err || !response){
        callback([ctx.title + ' guide book']);
        return;
      }
      try {
        var clean = response.trim().replace(/```json|```/g,'').trim();
        var keywords = JSON.parse(clean);
        if(!Array.isArray(keywords) || keywords.length === 0){ throw new Error('Bad array'); }
        callback(keywords.slice(0, 2));
      } catch(e){
        callback([ctx.title + ' guide book']);
      }
    });
  }

  function buildProductCards(keywords){
    if(!keywords || keywords.length === 0){ return ''; }
    var html = '<div class="io-products">';
    for(var i = 0; i < keywords.length; i++){
      var kw = keywords[i];
      var displayName = kw.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      html += '<a href="' + amazonUrl(kw) + '" target="_blank" rel="noopener" class="io-product-card">';
      html += '<span class="io-product-icon">&#128218;</span>';
      html += '<div class="io-product-info"><span class="io-product-name">' + displayName + '</span></div>';
      html += '<span class="io-product-cta">View &rarr;</span></a>';
    }
    html += '</div>';
    return html;
  }

  /* ============================================================
     STEP 6 - Chat logic
  ============================================================ */
  function addMsg(role, html){
    var area = document.getElementById('ioChatArea');
    var div = document.createElement('div');
    div.className = 'io-msg ' + role;
    var icon = (role === 'ai') ? '&#9992;' : '&#128100;';
    div.innerHTML = '<div class="io-msg-avatar">' + icon + '</div><div class="io-msg-bubble">' + html + '</div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  }

  function showTyping(){
    var area = document.getElementById('ioChatArea');
    var div = document.createElement('div');
    div.className = 'io-msg ai io-typing';
    div.id = 'ioTyping';
    div.innerHTML = '<div class="io-msg-avatar">&#9992;</div><div class="io-msg-bubble"><div class="io-typing-dots"><span></span><span></span><span></span></div></div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  function removeTyping(){
    var t = document.getElementById('ioTyping');
    if(t){ t.parentNode.removeChild(t); }
  }

  function callAI(userMessage, ctx){
    var systemPrompt =
      'You are the Immigration Opportunity AI Assistant on immigrationopportunity.com. ' +
      'You are a friendly and knowledgeable immigration advisor. ' +
      'The visitor is reading an article titled: "' + ctx.title + '". ' +
      'Article labels: ' + (ctx.labels.length ? ctx.labels.join(', ') : 'immigration') + '. ' +
      'IMPORTANT: Answer questions ONLY about the topic of this article. ' +
      'If the article is about Canada Express Entry - answer about Canada Express Entry specifically. ' +
      'If about IELTS - answer about IELTS specifically. ' +
      'If about UK visa - answer about UK visa specifically. ' +
      'Be warm, accurate and conversational. Keep answers to 4-5 sentences. ' +
      'Always mention specific visa names, programs, or official websites when relevant. ' +
      'Do not use markdown headers or bullet points. ' +
      'Always end with: For the most accurate information, please check the official government immigration website or consult a licensed immigration consultant. ' +
      'Be AdSense-safe always.';

    return fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        origin: window.location.hostname
      })
    }).then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.content && data.content[0]){ return data.content[0].text; }
      return 'I could not process that right now. Please try again!';
    });
  }

  function sendMessage(text){
    if(!text || !text.trim()){ return; }
    var btn = document.getElementById('ioSendBtn');
    var input = document.getElementById('ioInput');
    var ctx = getPageContext();

    addMsg('user', text);
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;
    showTyping();

    callAI(text, ctx).then(function(aiText){
      removeTyping();
      var formatted = aiText.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');

      // Get Amazon keywords from Groq then show response
      getAmazonKeywords(aiText, text, ctx, function(keywords){
        addMsg('ai', formatted + buildProductCards(keywords));
        btn.disabled = false;
        input.focus();
      });
    }).catch(function(){
      removeTyping();
      addMsg('ai','&#128533; Sorry, something went wrong. Please try again!');
      btn.disabled = false;
      input.focus();
    });
  }

  /* ============================================================
     STEP 7 - Init
  ============================================================ */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();

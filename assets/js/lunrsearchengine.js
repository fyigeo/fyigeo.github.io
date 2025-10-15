---
layout: null
sitemap: false
---

/* 1) Build documents (UTF-8 safe) */
{% assign counter = 0 %}
var documents = [
{% for page in site.pages %}
  {% unless page.url contains '.xml' or page.url contains 'assets' or page.url contains 'category' or page.url contains 'tag' %}
  {
    "id": {{ counter }},
    "url": {{ (site.url | append: site.baseurl | append: page.url) | jsonify }},
    "title": {{ page.title | default: "" | jsonify }},
    "body": {{
      page.content | markdownify | strip_html | strip_newlines | replace: "  ", " " | jsonify
    }}
  },
  {% assign counter = counter | plus: 1 %}
  {% endunless %}
{% endfor %}

{% if site.without-plugin %}
{% for page in site.without-plugin %}
  {
    "id": {{ counter }},
    "url": {{ (site.url | append: site.baseurl | append: page.url) | jsonify }},
    "title": {{ page.title | default: "" | jsonify }},
    "body": {{
      page.content | markdownify | strip_html | strip_newlines | replace: "  ", " " | jsonify
    }}
  },
  {% assign counter = counter | plus: 1 %}
{% endfor %}
{% endif %}

{% for page in site.posts %}
  {
    "id": {{ counter }},
    "url": {{ (site.url | append: site.baseurl | append: page.url) | jsonify }},
    "title": {{ page.title | default: "" | jsonify }},
    "body": {{
        page.date | date: "%Y/%m/%d"
      | append: " - "
      | append: page.content
      | markdownify | strip_html | strip_newlines | replace: "  ", " " | jsonify
    }}
  }{% if forloop.last %}{% else %},{% endif %}
  {% assign counter = counter | plus: 1 %}
{% endfor %}
];

/* 2) Unicode-friendly Lunr setup */
if (window.lunr) {
  lunr.tokenizer.separator = /[\s]+/;
  const unicodeTrimmer = function (token) {
    const s = token.toString();
    const isWord = ch => /\p{L}|\p{N}|[_-]/u.test(ch);
    let i = 0, j = s.length - 1;
    while (i <= j && !isWord(s[i])) i++;
    while (j >= i && !isWord(s[j])) j--;
    const trimmed = (i <= j) ? s.slice(i, j + 1) : "";
    return token.update(() => trimmed);
  };
  lunr.Pipeline.registerFunction(unicodeTrimmer, 'unicodeTrimmer');

  var idx = lunr(function () {
    this.ref('id');
    this.field('title');
    this.field('body');

    this.pipeline.remove(lunr.trimmer);
    this.pipeline.remove(lunr.stopWordFilter);
    this.pipeline.remove(lunr.stemmer);
    this.pipeline.add(unicodeTrimmer);

    this.searchPipeline.remove(lunr.trimmer);
    this.searchPipeline.remove(lunr.stemmer);
    this.searchPipeline.add(unicodeTrimmer);

    documents.forEach(function (doc) { this.add(doc); }, this);
  });

function snippetFromHTML(html, term, maxLen = 160) {
  // 1. Strip tags
  const div = document.createElement('div');
  div.innerHTML = html || '';
  let text = (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();

  // 2. Find match index (case-insensitive, works with Georgian too)
  const lowerText = text.toLocaleLowerCase();
  const lowerTerm = (term || '').toLocaleLowerCase();
  const idx = lowerText.indexOf(lowerTerm);

  // 3. Center snippet around match
  if (idx >= 0) {
    const start = Math.max(0, idx - maxLen / 4);
    const end = Math.min(text.length, idx + lowerTerm.length + maxLen / 2);
    text = text.slice(start, end);
  } else {
    text = text.slice(0, maxLen);
  }

  // 4. Bold the matched term safely
  const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
  const re = new RegExp(`(${safeTerm})`, 'gi');
  const highlighted = text.replace(re, '<strong>$1</strong>');

  return highlighted + (text.length < html.length ? '…' : '');
}

  /* 3) Global search that renders to the OUT-OF-NAV portal */
  window.lunr_search = function(term) {
    var portal = document.getElementById('lunr-portal');
    if (!portal) return false;

    document.body.classList.add('modal-open');
    portal.classList.add('show');

    portal.innerHTML = `
      <div class="backdrop"></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="lunr-title">
        <div class="header">
          <h5 id="lunr-title" class="title">${term ? "Search results for '" + term + "'" : "Search"}</h5>
          <button class="close" type="button" aria-label="Close">&times;</button>
        </div>
        <div class="body"><ul class="list-unstyled mb-0"></ul></div>
        <div class="footer"><button class="btn js-close" type="button">Close</button></div>
      </div>`;

    const close = () => { portal.classList.remove('show'); portal.innerHTML = ''; document.body.classList.remove('modal-open'); };
    portal.querySelector('.close').addEventListener('click', close);
    portal.querySelector('.js-close').addEventListener('click', close);
    portal.querySelector('.backdrop').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e){ if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }});

    if (!term) return false;

    let results;
    try {
      results = idx.search(term);
    } catch (e) {
      results = idx.query(q => {
        q.term(term, { usePipeline: true, presence: lunr.Query.presence.OPTIONAL, editDistance: 1 });
      });
    }

    const list = portal.querySelector('.body ul');
    list.innerHTML = results.length
      ? results.map(r => {
          const d = documents[r.ref] || {};
          const url = d.url || '#';
          const title = d.title || url;
        //   const body = (d.body || '').substring(0,160) + '…';
        //   const body = snippetFromHTML(d.body, 160);
          const body = snippetFromHTML(d.body, term, 160);
          return `<li class="lunrsearchresult my-3">
                    <a href="${url}">
                      <span class="title">${title}</span><br />
                      <small><span class="body">${body}</span><br />
                    </a>
                  </li>`;
        }).join('')
      : `<li class="lunrsearchresult my-3">No results found. Try a different search.</li>`;

    return false;
  };
}
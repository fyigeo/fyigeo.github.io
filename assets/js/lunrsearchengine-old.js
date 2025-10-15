---
layout: null
sitemap: false
---

{% assign counter = 0 %}
var documents = [{% for page in site.pages %}{% if page.url contains '.xml' or page.url contains 'assets' or page.url contains 'category' or page.url contains 'tag' %}{% else %}{
    "id": {{ counter }},
    "url": "{{ site.url }}{{site.baseurl}}{{ page.url }}",
    "title": "{{ page.title }}",
    "body": "{{ page.content | markdownify | replace: '.', '. ' | replace: '</h2>', ': ' | replace: '</h3>', ': ' | replace: '</h4>', ': ' | replace: '</p>', ' ' | strip_html | strip_newlines | replace: '  ', ' ' | replace: '"', ' ' }}"{% assign counter = counter | plus: 1 %}
    }, {% endif %}{% endfor %}{% for page in site.without-plugin %}{
    "id": {{ counter }},
    "url": "{{ site.url }}{{site.baseurl}}{{ page.url }}",
    "title": "{{ page.title }}",
    "body": "{{ page.content | markdownify | replace: '.', '. ' | replace: '</h2>', ': ' | replace: '</h3>', ': ' | replace: '</h4>', ': ' | replace: '</p>', ' ' | strip_html | strip_newlines | replace: '  ', ' ' | replace: '"', ' ' }}"{% assign counter = counter | plus: 1 %}
    }, {% endfor %}{% for page in site.posts %}{
    "id": {{ counter }},
    "url": "{{ site.url }}{{site.baseurl}}{{ page.url }}",
    "title": "{{ page.title }}",
    "body": "{{ page.date | date: "%Y/%m/%d" }} - {{ page.content | markdownify | replace: '.', '. ' | replace: '</h2>', ': ' | replace: '</h3>', ': ' | replace: '</h4>', ': ' | replace: '</p>', ' ' | strip_html | strip_newlines | replace: '  ', ' ' | replace: '"', ' ' }}"{% assign counter = counter | plus: 1 %}
    }{% if forloop.last %}{% else %}, {% endif %}{% endfor %}];

var idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('body')

    documents.forEach(function (doc) {
        this.add(doc)
    }, this)
});
// function lunr_search(term) {
//     document.getElementById('lunrsearchresults').innerHTML = '<ul></ul>';
//     if(term) {
//         document.getElementById('lunrsearchresults').innerHTML = "<p>Search results for '" + term + "'</p>" + document.getElementById('lunrsearchresults').innerHTML;
//         //put results on the screen.
//         var results = idx.search(term);
//         if(results.length>0){
//             //console.log(idx.search(term));
//             //if results
//             for (var i = 0; i < results.length; i++) {
//                 // more statements
//                 var ref = results[i]['ref'];
//                 var url = documents[ref]['url'];
//                 var title = documents[ref]['title'];
//                 var body = documents[ref]['body'].substring(0,160)+'...';
//                 document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML + "<li class='lunrsearchresult'><a href='" + url + "'><span class='title'>" + title + "</span><br /><span class='body'>"+ body +"</span><br /><span class='url'>"+ url +"</span></a></li>";
//             }
//         } else {
//             document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult'>No results found...</li>";
//         }
//     }
//     return false;
// }

// function lunr_search(term) {
//     $('#lunrsearchresults').show( 400 );
//     $( "body" ).addClass( "modal-open" );
    
//     document.getElementById('lunrsearchresults').innerHTML = '<div id="resultsmodal" class="modal fade show d-block"  tabindex="-1" role="dialog" aria-labelledby="resultsmodal"> <div class="modal-dialog shadow-lg" role="document"> <div class="modal-content"> <div class="modal-header" id="modtit"> <button type="button" class="close" id="btnx" data-dismiss="modal" aria-label="Close"> &times; </button> </div> <div class="modal-body"> <ul class="mb-0"> </ul>    </div> <div class="modal-footer"><button id="btnx" type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button></div></div> </div></div>';
//     if(term) {
//         document.getElementById('modtit').innerHTML = "<h5 class='modal-title'>Search results for '" + term + "'</h5>" + document.getElementById('modtit').innerHTML;
//         //put results on the screen.
//         var results = idx.search(term);
//         if(results.length>0){
//             //console.log(idx.search(term));
//             //if results
//             for (var i = 0; i < results.length; i++) {
//                 // more statements
//                 var ref = results[i]['ref'];
//                 var url = documents[ref]['url'];
//                 var title = documents[ref]['title'];
//                 var body = documents[ref]['body'].substring(0,160)+'...';
//                 document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML + "<li class='lunrsearchresult'><a href='" + url + "'><span class='title'>" + title + "</span><br /><small><span class='body'>"+ body +"</span><br /><span class='url'>"+ url +"</span></small></a></li>";
//             }
//         } else {
//             document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult'>Sorry, no results found. Close & try a different search!</li>";
//         }
//     }
//     return false;
// }
function lunr_search(term) {
  var portal = document.getElementById('lunr-portal');
  if (!portal) return false;

  // Open overlay
  document.body.classList.add('modal-open');
  portal.classList.add('show');

  // Dialog skeleton (renders OUTSIDE navbar)
  portal.innerHTML = `
    <div class="backdrop"></div>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="lunr-title">
      <div class="header">
        <h5 id="lunr-title" class="title">${term ? "Search results for '" + term + "'" : "Search"}</h5>
        <button class="close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="body"><ul class="list-unstyled mb-0"></ul></div>
      <div class="footer">
        <button class="btn js-close" type="button">Close</button>
      </div>
    </div>
  `;

  // Close handlers
  const close = () => {
    portal.classList.remove('show');
    portal.innerHTML = '';
    document.body.classList.remove('modal-open');
  };
  portal.querySelector('.close').addEventListener('click', close);
  portal.querySelector('.js-close').addEventListener('click', close);
  portal.querySelector('.backdrop').addEventListener('click', close);
  document.addEventListener('keydown', function esc(e){
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  if (!term) return false;

  // Run search (with fallback)
  let results;
  try {
    results = idx.search(term);
  } catch (e) {
    results = idx.query(q => {
      q.term(term, { usePipeline: true, presence: lunr.Query.presence.OPTIONAL, editDistance: 1 });
    });
  }

  // Render results into the portal
  const list = portal.querySelector('.body ul');
  if (results.length) {
    list.innerHTML = results.map(r => {
      const d = documents[r.ref] || {};
      const url = d.url || '#';
      const title = d.title || url;
      const body = (d.body || '').substring(0,160) + '…';
      return `
        <li class="lunrsearchresult my-3">
          <a href="${url}">
            <span class="title">${title}</span><br />
            <small><span class="body">${body}</span><br />
            <span class="url">${url}</span></small>
          </a>
        </li>`;
    }).join('');
  } else {
    list.innerHTML = `<li class="lunrsearchresult my-3">No results found. Try a different search.</li>`;
  }

  return false;
}
    
$(function() {
    $("#lunrsearchresults").on('click', '#btnx', function () {
        $('#lunrsearchresults').hide( 5 );
        $( "body" ).removeClass( "modal-open" );
    });
});
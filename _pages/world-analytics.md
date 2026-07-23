---
layout: page
title: მსოფლიო ანალიტიკა
permalink: /world-analytics
comments: false
---

<div class="region-filters">
<button type="button" class="region-filter active" data-region="all">ყველა</button>
<button type="button" class="region-filter" data-region="georgia-caucasus">საქართველო და კავკასია</button>
<button type="button" class="region-filter" data-region="russia">რუსეთი</button>
<button type="button" class="region-filter" data-region="usa">შეერთებული შტატები</button>
<button type="button" class="region-filter" data-region="china">ჩინეთი</button>
<button type="button" class="region-filter" data-region="europe">ევროპა</button>
<button type="button" class="region-filter" data-region="middle-east">ახლო აღმოსავლეთი</button>
<button type="button" class="region-filter" data-region="asia">აზია</button>
<button type="button" class="region-filter" data-region="south-america">ლათინური და სამხრეთ ამერიკა</button>
<button type="button" class="region-filter" data-region="invisible-wars">უხილავი ომები</button>
<button type="button" class="region-filter" data-region="maritime-routes">საზღვაო მარშრუტები</button>
</div>

<div class="row listrecent" id="world-analytics-grid">

{% for post in site.posts %}

{% include postbox.html %}

{% endfor %}

</div>

<p id="world-analytics-empty" class="text-center text-muted" style="display:none;">ამ კატეგორიაში სტატიები მალე დაემატება.</p>

<script>
(function ($) {
  function applyRegionFilter(region) {
    var $button = $('.region-filter[data-region="' + region + '"]');
    if ($button.length === 0) {
      region = 'all';
      $button = $('.region-filter[data-region="all"]');
    }
    $('.region-filter').removeClass('active');
    $button.addClass('active');

    var $cards = $('#world-analytics-grid .card-group');
    var $visible;

    if (region === 'all') {
      $cards.show();
      $visible = $cards;
    } else {
      $cards.hide();
      $visible = $cards.filter(function () {
        var regions = ($(this).data('regions') || '').toString().split(',');
        return regions.indexOf(region) !== -1;
      });
      $visible.show();
    }

    $('#world-analytics-empty').toggle($visible.length === 0);
  }

  $(function () {
    $('.region-filter').on('click', function () {
      applyRegionFilter($(this).data('region'));
    });

    var params = new URLSearchParams(window.location.search);
    applyRegionFilter(params.get('region') || 'all');
  });
})(jQuery);
</script>

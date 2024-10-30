/* ライトボックスで同一ページ内に画像を表示 */
/* 画像のみ表示 */
// new LuminousGallery(document.querySelectorAll(".lightbox"));

/* alt属性のテキストを画像の下に表示させる */
new LuminousGallery(document.querySelectorAll('.lightbox'), {}, {
  caption: function(trigger) {
    return trigger.querySelector('img').getAttribute('alt');
  }
});
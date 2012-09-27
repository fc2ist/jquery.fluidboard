#jQuery Fluid Board

Fluidな要素をレンガ状に並べることができるjQueryプラグインです。

##デモ
* [jQuery Fluid Board - Demo](http://fc2ist.github.com/jquery.fluidboard/demo.html)

##使い方
~~~~~
// オプション(初期値を入れてます)
var options = {
  itemSelector: null  // 子要素セレクター
       ,colnum: 2     // カラム数
   ,responsive: 0     // カラムの横幅の最大値(px)を指定して、動的にcolnumを設定する
       ,gutter: 10    // ジッターの幅
     ,throttle: 10    // resizeイベントの間引き用の数値
       ,resize: true  // resizeイベントを設置するかどうか
   ,isAnimated: false // アニメーションを有効にするかどうか(jQueryアニメーション)
   ,animationOptions: {
      duration: 200
       ,easing: 'linear'
        ,queue: false
    }
};

// コンテナ要素に対して実行します
$('.container').fluidboard(options);
~~~~~

##アニメーションについて
オプションでjQueryアニメーションの有無を指定できますが、
*CSS3*の`transition`を使ったほうが軽いのでオススメです。
~~~~~
.container .item {
  -webkit-transition: .2s;
  -moz-transition   : .2s;
  -o-transition     : .2s;
  -ms-transition    : .2s;
  transition        : .2s;
}
~~~~~

##その他の命令

###破棄

~~~~~
$('.container').fluidboard('destroy');
~~~~~

###更新

~~~~~
$('.container').fluidboard('reload');
~~~~~

###オプション再設定

~~~~~
$('.container').fluidboard('option', 'colnum', 4);

or

$('.container').fluidboard('option', {
  colnum: 4,
  gutter: 20
});
~~~~~

##依存ライブラリ
jQuery v1.8+ (`.css`のベンダープレフィックスを省略している関係でサポートはv1.8からとなっています)
